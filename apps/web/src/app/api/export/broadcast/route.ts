import { auth } from "@sagentong/auth";
import { db } from "@sagentong/db";
import { user } from "@sagentong/db/schema/auth";
import { eq } from "drizzle-orm";
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
    const { reportId, location, waMessage } = await request.json();

    if (!reportId || !waMessage) {
      return Response.json({ error: "Missing required data" }, { status: 400 });
    }

    // Fetch all relawans
    const relawans = await db
      .select({
        name: user.name,
        phoneNumber: user.phoneNumber,
      })
      .from(user)
      .where(eq(user.role, "relawan"));

    const exportData = relawans.map((relawan) => {
      const waUrl = relawan.phoneNumber
        ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(relawan.phoneNumber)}&text=${encodeURIComponent(waMessage)}`
        : "Nomor tidak tersedia";

      return {
        "Nama Relawan": relawan.name,
        "Nomor WhatsApp": relawan.phoneNumber ?? "-",
        "Link Broadcast": waUrl,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Broadcast Bantuan");

    // Adjust column widths
    worksheet["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 100 }];

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `Broadcast_Relawan_${(location || "Laporan").replace(/\s+/g, "_")}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[export-api] Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
