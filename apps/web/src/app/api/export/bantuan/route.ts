import { auth } from "@sagentong/auth";
import { db } from "@sagentong/db";
import { bantuanRelawan } from "@sagentong/db/schema/bantuan";
import { user } from "@sagentong/db/schema/auth";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import * as XLSX from "xlsx";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "perangkat_desa" && session.user.role !== "superadmin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { reportId, location, needsType } = await request.json();

    if (!reportId) {
      return Response.json({ error: "Missing required data" }, { status: 400 });
    }

    // Fetch all bantuan for this report
    const bantuanItems = await db
      .select({
        id: bantuanRelawan.id,
        jenisBantuan: bantuanRelawan.jenisBantuan,
        keterangan: bantuanRelawan.keterangan,
        createdAt: bantuanRelawan.createdAt,
        relawanName: user.name,
        relawanPhone: user.phoneNumber,
      })
      .from(bantuanRelawan)
      .innerJoin(user, eq(bantuanRelawan.userId, user.id))
      .where(eq(bantuanRelawan.laporanId, reportId))
      .orderBy(desc(bantuanRelawan.createdAt));

    const exportData = bantuanItems.map((item) => ({
      "Nama Relawan": item.relawanName,
      "Nomor WhatsApp": item.relawanPhone ?? "-",
      "Jenis Bantuan": item.jenisBantuan,
      Keterangan: item.keterangan,
      Tanggal: item.createdAt.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Bantuan");

    // Adjust column widths
    worksheet["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 50 }, { wch: 25 }];

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `Daftar_Bantuan_${(location || "Laporan").replace(/\s+/g, "_")}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[export-bantuan-api] Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
