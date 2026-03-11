import { auth } from "@sagentong/auth";
import { db } from "@sagentong/db";
import { laporan } from "@sagentong/db/schema/laporan";
import { user } from "@sagentong/db/schema/auth";
import { desc, eq, or } from "drizzle-orm";
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
      budgetDetails: laporan.budgetDetails,
      description: laporan.description,
      status: laporan.status,
      latitude: laporan.latitude,
      longitude: laporan.longitude,
      evidenceImage: laporan.evidenceImage,
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
    budgetDetails: r.budgetDetails,
    needsType: r.needsType,
    deskripsi: r.description,
    latitude: r.latitude,
    longitude: r.longitude,
    evidenceImage: r.evidenceImage,
    status: r.status as ReportData["status"],
    tanggal: r.createdAt.toISOString(),
  }));

  // Fetch all relawan for broadcasting
  let allRelawans: Subscriber[] = [];
  const userRole = session.user.role;

  if (userRole === "perangkat_desa" || userRole === "superadmin") {
    const relawans = await db
      .select({
        name: user.name,
        phoneNumber: user.phoneNumber,
      })
      .from(user)
      .where(eq(user.role, "relawan"));

    allRelawans = relawans.map((r) => ({
      name: r.name,
      phoneNumber: r.phoneNumber,
    }));
  }

  return <RiwayatClient reports={reports} userRole={userRole} allRelawans={allRelawans} />;
}
