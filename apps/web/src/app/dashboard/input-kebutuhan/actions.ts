"use server";

import { auth, normalizePhoneNumber } from "@sagentong/auth";
import { db } from "@sagentong/db";
import { laporan } from "@sagentong/db/schema/laporan";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reportSchema = z.object({
  pelaporName: z.string().min(1, "Nama pelapor wajib diisi"),
  contactNumber: z.string().min(1, "Nomor kontak wajib diisi"),
  rw: z.string().min(1, "RW wajib dipilih"),
  rt: z.string().min(1, "RT wajib dipilih"),
  addressDetail: z.string().min(1, "Detail alamat wajib diisi"),
  affectedCount: z.number().int().min(0, "Jumlah warga terdampak tidak valid"),
  affectedHouses: z.number().int().min(0, "Jumlah rumah terdampak tidak valid"),
  waterHeight: z.string().min(1, "Ketinggian air wajib dipilih"),
  description: z.string().min(1, "Deskripsi kondisi wajib diisi"),
  needsType: z.string().min(1, "Jenis kebutuhan wajib diisi"),
  assistanceCategory: z
    .array(z.enum(["Dana", "Jasa", "Barang"]))
    .min(1, "Pilih minimal satu jenis bantuan"),
  budgetDetails: z
    .array(
      z.object({
        item: z.string().min(1, "Item wajib diisi"),
        amount: z.number().min(0, "Nominal tidak boleh negatif"),
      }),
    )
    .optional()
    .nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  evidenceImageKey: z.string().nullable(),
});

export type ReportInput = z.infer<typeof reportSchema>;

export type SubmitReportResult = {
  success: boolean;
  message: string;
};

export async function submitReport(data: ReportInput): Promise<SubmitReportResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, message: "Anda harus login terlebih dahulu." };
  }

  if (session.user.role !== "perangkat_desa" && session.user.role !== "superadmin") {
    return {
      success: false,
      message: "Hanya perangkat desa dan superadmin yang dapat membuat laporan.",
    };
  }

  const parsed = reportSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      message: firstError?.message ?? "Data tidak valid.",
    };
  }

  try {
    await db.insert(laporan).values({
      pelaporName: parsed.data.pelaporName,
      contactNumber: normalizePhoneNumber(parsed.data.contactNumber),
      rw: parsed.data.rw,
      rt: parsed.data.rt,
      addressDetail: parsed.data.addressDetail,
      affectedCount: parsed.data.affectedCount,
      affectedHouses: parsed.data.affectedHouses,
      waterHeight: parsed.data.waterHeight,
      description: parsed.data.description,
      needsType: parsed.data.needsType,
      assistanceCategory: parsed.data.assistanceCategory.join(", "),
      budgetDetails: parsed.data.budgetDetails,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      evidenceImage: parsed.data.evidenceImageKey,
      perangkatDesaId: session.user.id,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/input-kebutuhan");
    revalidatePath("/dashboard/statistik");

    return { success: true, message: "Laporan berhasil dikirim." };
  } catch (error) {
    console.error("[submitReport] Error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menyimpan laporan.",
    };
  }
}
