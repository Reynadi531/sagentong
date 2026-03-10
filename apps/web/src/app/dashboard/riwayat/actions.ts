"use server";

import { auth } from "@sagentong/auth";
import { db } from "@sagentong/db";
import { laporan } from "@sagentong/db/schema/laporan";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const VALID_STATUSES = ["Menunggu", "Diverifikasi", "Diproses", "Selesai"] as const;

async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Anda harus login terlebih dahulu.");
  }

  return session;
}

async function requireAdmin() {
  const session = await requireSession();

  if (session.user.role !== "perangkat_desa" && session.user.role !== "superadmin") {
    throw new Error("Hanya perangkat desa dan superadmin yang dapat melakukan aksi ini.");
  }

  return session;
}

async function requireSuperadmin() {
  const session = await requireSession();

  if (session.user.role !== "superadmin") {
    throw new Error("Hanya superadmin yang dapat melakukan aksi ini.");
  }

  return session;
}

// ---------------------------------------------------------------------------
// Update report status (perangkat_desa / superadmin only)
// ---------------------------------------------------------------------------

const updateStatusSchema = z.object({
  reportId: z.string().uuid("ID laporan tidak valid."),
  status: z.enum(VALID_STATUSES, {
    message: "Status tidak valid.",
  }),
});

export type ActionResult = {
  success: boolean;
  message: string;
};

export async function updateReportStatus(
  reportId: string,
  newStatus: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = updateStatusSchema.safeParse({ reportId, status: newStatus });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        message: firstError?.message ?? "Data tidak valid.",
      };
    }

    await db
      .update(laporan)
      .set({ status: parsed.data.status })
      .where(eq(laporan.id, parsed.data.reportId));

    revalidatePath("/dashboard/riwayat");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/statistik");

    return { success: true, message: `Status berhasil diubah menjadi "${parsed.data.status}".` };
  } catch (error) {
    console.error("[updateReportStatus] Error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Terjadi kesalahan saat mengubah status laporan.",
    };
  }
}

// ---------------------------------------------------------------------------
// Delete report (superadmin only)
// ---------------------------------------------------------------------------

export async function deleteReport(reportId: string): Promise<ActionResult> {
  try {
    await requireSuperadmin();

    await db.delete(laporan).where(eq(laporan.id, reportId));

    revalidatePath("/dashboard/riwayat");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/statistik");

    return { success: true, message: "Laporan berhasil dihapus." };
  } catch (error) {
    console.error("[deleteReport] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus laporan.",
    };
  }
}
