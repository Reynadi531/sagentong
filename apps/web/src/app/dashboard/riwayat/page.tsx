import { auth } from "@sagentong/auth";
import { db } from "@sagentong/db";
import { laporan } from "@sagentong/db/schema/laporan";
import { langgananLaporan } from "@sagentong/db/schema/langganan";
import { user } from "@sagentong/db/schema/auth";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import RiwayatClient, { type ReportData, type Subscriber } from "./riwayat-client";

export default async function RiwayatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login" as any);
  }

  if (session.user.role === "perangkat_desa" && !session.user.verified) {
    redirect("/dashboard/pending" as any);
  }

  // Fetch all laporan
  const rawReports = await db
    .select({
      id: laporan.id,
      pelaporName: laporan.pelaporName,
      contactNumber: laporan.contactNumber,
      rw: laporan.rw,
      rt: laporan.rt,
      needsType: laporan.needsType,
      assistanceCategory: laporan.assistanceCategory,
      description: laporan.description,
      status: laporan.status,
      createdAt: laporan.createdAt,
    })
    .from(laporan)
    .orderBy(desc(laporan.createdAt));

  // Map to client-friendly shape
  const reports: ReportData[] = rawReports.map((r) => ({
    id: r.id,
    pelaporName: r.pelaporName,
    contactNumber: r.contactNumber,
    rw: r.rw,
    rt: r.rt,
    lokasi: `RW ${r.rw} RT ${r.rt}`,
    jenisBantuan: r.assistanceCategory ? `Bantuan ${r.assistanceCategory}` : "Tidak Diketahui",
    assistanceCategory: r.assistanceCategory,
    needsType: r.needsType,
    deskripsi: r.description,
    status: r.status as ReportData["status"],
    tanggal: r.createdAt.toISOString(),
  }));

  // Fetch subscription data based on role
  let subscribedIds: string[] = [];
  let subscribers: Record<string, Subscriber[]> = {};

  const userRole = session.user.role;

  if (userRole === "relawan") {
    // Relawan: fetch their own subscriptions
    const subs = await db
      .select({ laporanId: langgananLaporan.laporanId })
      .from(langgananLaporan)
      .where(eq(langgananLaporan.userId, session.user.id));

    subscribedIds = subs.map((s) => s.laporanId);
  } else if (userRole === "perangkat_desa" || userRole === "superadmin") {
    // Admin: fetch all subscribers grouped by laporan
    const allSubs = await db
      .select({
        laporanId: langgananLaporan.laporanId,
        name: user.name,
        phoneNumber: user.phoneNumber,
      })
      .from(langgananLaporan)
      .innerJoin(user, eq(langgananLaporan.userId, user.id));

    for (const sub of allSubs) {
      if (!subscribers[sub.laporanId]) {
        subscribers[sub.laporanId] = [];
      }
      subscribers[sub.laporanId].push({
        name: sub.name,
        phoneNumber: sub.phoneNumber,
      });
    }
  }

  return (
    <RiwayatClient
      reports={reports}
      userRole={userRole}
      subscribedIds={subscribedIds}
      subscribers={subscribers}
    />
  );
}
