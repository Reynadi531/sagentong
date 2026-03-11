"use server";

import { auth } from "@sagentong/auth";
import { db } from "@sagentong/db";
import { bantuanRelawan } from "@sagentong/db/schema/bantuan";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireSuperadmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "superadmin") {
    throw new Error("Hanya superadmin yang dapat melakukan aksi ini.");
  }

  return session;
}

export type ActionResult = {
  success: boolean;
  message: string;
};

export async function deleteBantuan(bantuanId: string): Promise<ActionResult> {
  try {
    await requireSuperadmin();

    const bantuan = await db.query.bantuanRelawan.findFirst({
      where: eq(bantuanRelawan.id, bantuanId),
    });

    if (!bantuan) {
      return { success: false, message: "Data bantuan tidak ditemukan." };
    }

    await db.delete(bantuanRelawan).where(eq(bantuanRelawan.id, bantuanId));

    revalidatePath(`/dashboard/bantuan/${bantuan.laporanId}`);
    revalidatePath("/dashboard/bantuan");
    revalidatePath("/dashboard/statistik");
    revalidatePath("/dashboard/riwayat");

    return { success: true, message: "Data bantuan berhasil dihapus." };
  } catch (error) {
    console.error("[deleteBantuan] Error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus data bantuan.",
    };
  }
}
