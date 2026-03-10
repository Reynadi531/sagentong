import { auth } from "@sagentong/auth";
import { db } from "@sagentong/db";
import { bantuanRelawan } from "@sagentong/db/schema/bantuan";
import { laporan } from "@sagentong/db/schema/laporan";
import { desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import BantuanListClient from "./bantuan-list-client";

export default async function BantuanPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login" as any);
  }

  if (session.user.role === "relawan") {
    redirect("/dashboard" as any);
  }

  if (session.user.role === "perangkat_desa" && !session.user.verified) {
    redirect("/dashboard/pending" as any);
  }

  // Fetch reports that have at least one assistance entry
  const reportsWithBantuan = await db
    .select({
      id: laporan.id,
      pelaporName: laporan.pelaporName,
      rw: laporan.rw,
      rt: laporan.rt,
      needsType: laporan.needsType,
      status: laporan.status,
      createdAt: laporan.createdAt,
      bantuanCount: sql<number>`count(${bantuanRelawan.id})::int`,
      totalDana: sql<number>`sum(coalesce(${bantuanRelawan.danaAmount}, 0))::int`,
    })
    .from(laporan)
    .innerJoin(bantuanRelawan, eq(laporan.id, bantuanRelawan.laporanId))
    .groupBy(laporan.id)
    .orderBy(desc(sql`max(${bantuanRelawan.createdAt})`));

  const formattedData = reportsWithBantuan.map((r) => ({
    id: r.id,
    pelaporName: r.pelaporName,
    lokasi: `RW ${r.rw} RT ${r.rt}`,
    kebutuhan: r.needsType,
    status: r.status,
    tanggalLaporan: r.createdAt.toISOString(),
    jumlahBantuan: r.bantuanCount,
    totalDana: r.totalDana,
  }));

  return <BantuanListClient reports={formattedData} />;
}
