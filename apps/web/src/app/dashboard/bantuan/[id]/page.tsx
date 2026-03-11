import { auth } from "@sagentong/auth";
import { db } from "@sagentong/db";
import { bantuanRelawan } from "@sagentong/db/schema/bantuan";
import { laporan } from "@sagentong/db/schema/laporan";
import { user } from "@sagentong/db/schema/auth";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import BantuanDetailClient from "./bantuan-detail-client";

export default async function BantuanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  // Fetch report basic info
  const report = await db.query.laporan.findFirst({
    where: eq(laporan.id, id),
  });

  if (!report) {
    notFound();
  }

  // Fetch all assistance for this report
  const bantuanItems = await db
    .select({
      id: bantuanRelawan.id,
      jenisBantuan: bantuanRelawan.jenisBantuan,
      danaAmount: bantuanRelawan.danaAmount,
      keterangan: bantuanRelawan.keterangan,
      evidenceImage: bantuanRelawan.evidenceImage,
      createdAt: bantuanRelawan.createdAt,
      relawanName: user.name,
      relawanPhone: user.phoneNumber,
    })
    .from(bantuanRelawan)
    .innerJoin(user, eq(bantuanRelawan.userId, user.id))
    .where(eq(bantuanRelawan.laporanId, id))
    .orderBy(desc(bantuanRelawan.createdAt));

  const formattedBantuan = bantuanItems.map((b) => ({
    id: b.id,
    jenisBantuan: b.jenisBantuan,
    danaAmount: b.danaAmount,
    keterangan: b.keterangan,
    evidenceImage: b.evidenceImage,
    relawanName: b.relawanName,
    relawanPhone: b.relawanPhone,
    tanggal: b.createdAt.toISOString(),
  }));

  const formattedReport = {
    id: report.id,
    pelaporName: report.pelaporName,
    lokasi: `RW ${report.rw} RT ${report.rt}`,
    kebutuhan: report.needsType,
    budgetDetails: report.budgetDetails,
    status: report.status,
    deskripsi: report.description,
  };

  return (
    <BantuanDetailClient
      report={formattedReport}
      bantuan={formattedBantuan}
      userRole={session.user.role}
    />
  );
}
