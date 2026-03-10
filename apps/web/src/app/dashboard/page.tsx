import { auth } from "@sagentong/auth";
import { db } from "@sagentong/db";
import { laporan } from "@sagentong/db/schema/laporan";
import { count, eq, gte, or, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import RecentReportsTable, { type Report } from "@/components/dashboard/recent-reports-table";
import PopularNeedsProgress from "@/components/dashboard/popular-needs-progress";
import RecentActivityFeed, { type Activity } from "@/components/dashboard/recent-activity-feed";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login" as any);
  }

  if (session.user.role === "perangkat_desa" && !session.user.verified) {
    redirect("/dashboard/pending" as any);
  }

  // --- Stats from DB ---
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalResult,
    unprocessedResult,
    toAdminResult,
    recentRows,
    needsResult,
    activityRows,
    allReportsCountResult,
  ] = await Promise.all([
    db.select({ value: count() }).from(laporan).where(gte(laporan.createdAt, todayStart)),
    db.select({ value: count() }).from(laporan).where(eq(laporan.status, "Menunggu")),
    db
      .select({ value: count() })
      .from(laporan)
      .where(
        or(
          eq(laporan.status, "Diverifikasi"),
          eq(laporan.status, "Diproses"),
          eq(laporan.status, "Selesai"),
        ),
      ),
    db
      .select({
        id: laporan.id,
        rw: laporan.rw,
        rt: laporan.rt,
        assistanceCategory: laporan.assistanceCategory,
        description: laporan.description,
        status: laporan.status,
        createdAt: laporan.createdAt,
      })
      .from(laporan)
      .orderBy(desc(laporan.createdAt))
      .limit(3),
    db
      .select({ name: laporan.needsType, count: count() })
      .from(laporan)
      .groupBy(laporan.needsType)
      .orderBy(desc(count()))
      .limit(3),
    db
      .select({
        id: laporan.id,
        pelaporName: laporan.pelaporName,
        needsType: laporan.needsType,
        status: laporan.status,
        updatedAt: laporan.updatedAt,
        createdAt: laporan.createdAt,
      })
      .from(laporan)
      .orderBy(desc(laporan.updatedAt))
      .limit(3),
    db.select({ value: count() }).from(laporan),
  ]);

  const stats = {
    total: totalResult[0]?.value ?? 0,
    unprocessed: unprocessedResult[0]?.value ?? 0,
    toAdmin: toAdminResult[0]?.value ?? 0,
  };

  const totalAllTime = allReportsCountResult[0]?.value ?? 0;

  const recentReports: Report[] = recentRows.map((r) => ({
    id: r.id,
    tanggal: r.createdAt,
    lokasi: `RW ${r.rw} RT ${r.rt}`,
    jenisBantuan: r.assistanceCategory ? `Bantuan ${r.assistanceCategory}` : "Tidak Diketahui",
    deskripsi: r.description,
    status: r.status as Report["status"],
  }));

  // --- Real data for widgets ---
  const popularNeeds = needsResult.map((n) => ({
    name: n.name,
    count: n.count,
    percentage: totalAllTime > 0 ? Math.round((n.count / totalAllTime) * 100) : 0,
  }));

  function formatTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return "Baru saja";
  }

  const recentActivities: Activity[] = activityRows.map((a) => {
    const isNew = a.createdAt.getTime() === a.updatedAt.getTime();
    let action = "";

    if (isNew) {
      action = `Laporan ${a.needsType} ditambahkan oleh ${a.pelaporName}.`;
    } else {
      action = `Laporan ${a.needsType} untuk ${a.pelaporName} status berubah menjadi ${a.status}.`;
    }

    return {
      id: a.id,
      action,
      timeAgo: formatTimeAgo(a.updatedAt),
    };
  });

  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-[1200px] mx-auto w-full">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard title="Total Laporan Hari Ini" value={stats.total} theme="teal" />
        <StatCard title="Laporan Belum Di Proses" value={stats.unprocessed} theme="orange" />
        <StatCard title="Laporan Dikirim Ke Admin" value={stats.toAdmin} theme="green" />
      </div>

      {/* Main Table Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column: Table (Takes up 2/3 width on large screens) */}
        <div className="xl:col-span-2 flex flex-col gap-4 md:gap-6">
          {(session.user.role === "perangkat_desa" || session.user.role === "superadmin") && (
            <div className="flex justify-end">
              <Link
                href="/dashboard/input-kebutuhan"
                className="bg-[#FFA918] hover:bg-[#e59815] text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors shadow-sm inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <span className="text-xl leading-none">+</span>
                <span className="hidden sm:inline">Tambahkan Laporan</span>
                <span className="sm:hidden">Laporan Baru</span>
              </Link>
            </div>
          )}
          <RecentReportsTable reports={recentReports} />
        </div>

        {/* Right Column: Side Panels */}
        <div className="flex flex-col gap-4 md:gap-6">
          <PopularNeedsProgress needs={popularNeeds} />
          <RecentActivityFeed activities={recentActivities} />
        </div>
      </div>
    </div>
  );
}
