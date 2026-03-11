import React from "react";
import LaporanLineChart from "@/components/dashboard/laporan-line-chart";
import AssistancePieChart from "@/components/dashboard/assistance-pie-chart";
import WilayahBarChart from "@/components/dashboard/wilayah-bar-chart";
import StatistikInsightCard from "@/components/dashboard/statistik-insight-card";
import { auth } from "@sagentong/auth";
import { db } from "@sagentong/db";
import { laporan } from "@sagentong/db/schema/laporan";
import { count, eq, sql, gte, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function StatistikLaporanPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login" as any);
  }

  if (session.user.role === "perangkat_desa" && !session.user.verified) {
    redirect("/dashboard/pending" as any);
  }

  // -------------------------------------------------------------------------
  // 1. Data for Line Chart (Last 7 Days)
  // -------------------------------------------------------------------------
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const lineChartRaw = await db
    .select({
      date: sql<string>`DATE(${laporan.createdAt})`,
      count: count(),
    })
    .from(laporan)
    .where(gte(laporan.createdAt, sevenDaysAgo))
    .groupBy(sql`DATE(${laporan.createdAt})`)
    .orderBy(sql`DATE(${laporan.createdAt})`);

  // Fill in missing days with 0
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const lineChartData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayName = days[d.getDay()];
    const match = lineChartRaw.find((r) => r.date === dateStr);
    lineChartData.push({ name: dayName, value: match?.count ?? 0 });
  }

  // -------------------------------------------------------------------------
  // 2. Data for Pie Chart (Assistance Categories - All Time)
  // -------------------------------------------------------------------------
  const pieChartRaw = await db
    .select({
      name: laporan.assistanceCategory,
      value: count(),
    })
    .from(laporan)
    .groupBy(laporan.assistanceCategory);

  const categoryCounts: Record<string, number> = {};
  pieChartRaw.forEach((row) => {
    if (row.name) {
      const categories = row.name.split(",").map((c) => c.trim());
      categories.forEach((cat) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + row.value;
      });
    } else {
      categoryCounts["Tidak Diketahui"] = (categoryCounts["Tidak Diketahui"] || 0) + row.value;
    }
  });

  const pieChartData = Object.entries(categoryCounts).map(([name, value]) => ({
    name: name === "Tidak Diketahui" ? name : `Bantuan ${name}`,
    value,
  }));

  // -------------------------------------------------------------------------
  // 3. Data for Bar Chart (By RW - All Time)
  // -------------------------------------------------------------------------
  const barChartRaw = await db
    .select({
      rw: laporan.rw,
      value: count(),
    })
    .from(laporan)
    .groupBy(laporan.rw)
    .orderBy(desc(count()))
    .limit(6);

  const barChartData = barChartRaw
    .map((r) => ({
      name: `RW ${r.rw}`,
      value: r.value,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // -------------------------------------------------------------------------
  // 4. Calculate Insights
  // -------------------------------------------------------------------------
  // Trend: Compare this week (last 7 days) to previous week (7-14 days ago)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const previousWeekRaw = await db
    .select({ count: count() })
    .from(laporan)
    .where(
      sql`${laporan.createdAt} >= ${fourteenDaysAgo} AND ${laporan.createdAt} < ${sevenDaysAgo}`,
    );

  const thisWeekTotal = lineChartData.reduce((acc, curr) => acc + curr.value, 0);
  const lastWeekTotal = previousWeekRaw[0]?.count ?? 0;

  let trendText = "Stabil";
  let trendDesc = "Jumlah laporan sama dengan minggu lalu.";
  if (lastWeekTotal > 0) {
    const diff = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
    if (diff > 0) {
      trendText = "Tren Meningkat";
      trendDesc = `Terdapat kenaikan laporan sebesar ${Math.abs(Math.round(diff))}% dibandingkan minggu sebelumnya.`;
    } else if (diff < 0) {
      trendText = "Tren Menurun";
      trendDesc = `Terdapat penurunan laporan sebesar ${Math.abs(Math.round(diff))}% dibandingkan minggu sebelumnya.`;
    }
  } else if (thisWeekTotal > 0) {
    trendText = "Tren Baru";
    trendDesc = "Mulai terdapat laporan baru minggu ini.";
  }

  // Distribution insight
  const totalReports = pieChartData.reduce((acc, curr) => acc + curr.value, 0);
  const maxCategory = pieChartData.reduce(
    (prev, current) => (prev.value > current.value ? prev : current),
    { name: "-", value: 0 },
  );
  const distDesc =
    totalReports > 0
      ? `${Math.round((maxCategory.value / totalReports) * 100)}% dari total laporan warga membutuhkan ${maxCategory.name.toLowerCase()} untuk pemulihan.`
      : "Belum ada data distribusi bantuan.";

  // Focus insight
  const maxRW = barChartData.reduce(
    (prev, current) => (prev.value > current.value ? prev : current),
    { name: "-", value: 0 },
  );
  const focusDesc =
    maxRW.value > 0
      ? `${maxRW.name} terdeteksi sebagai wilayah dengan kepadatan laporan tertinggi saat ini.`
      : "Belum ada data wilayah dominan.";

  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-[1200px] mx-auto w-full px-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-bold text-[#0f374c]">Statistik Laporan</h2>
        <p className="text-gray-500 text-[14px]">
          Analisis data laporan kebutuhan warga Desa Gentong Balap.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Main Charts Column */}
        <div className="xl:col-span-2 flex flex-col gap-4 md:gap-6">
          <LaporanLineChart data={lineChartData} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <AssistancePieChart data={pieChartData} />
            <WilayahBarChart data={barChartData} />
          </div>
        </div>

        {/* insights Column */}
        <div className="flex flex-col gap-4 md:gap-6">
          <h3 className="text-[17px] font-semibold text-[#0f374c]">Insight Statistik</h3>
          <StatistikInsightCard type="trend" title={trendText} description={trendDesc} />
          <StatistikInsightCard
            type="distribution"
            title={`${maxCategory.name} Dominan`}
            description={distDesc}
          />
          <StatistikInsightCard
            type="focus"
            title={`Fokus ${maxRW.name}`}
            description={focusDesc}
          />
        </div>
      </div>
    </div>
  );
}
