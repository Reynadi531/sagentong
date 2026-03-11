"use client";

import React, { useCallback, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import {
  MapPin,
  AlertTriangle,
  Package,
  Upload,
  ChevronDown,
  CreditCard,
  Wrench,
  Box,
  X,
  Loader2,
  Trash2,
  ImageIcon,
  Check,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitReport, type ReportInput } from "@/app/dashboard/input-kebutuhan/actions";

interface AddReportFormProps {
  onClose?: () => void;
}

interface UploadedFile {
  key: string;
  filename: string;
  previewUrl: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AddReportForm({ onClose }: AddReportFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleFileUpload = useCallback(async (file: File) => {
    // Client-side validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau JPEG.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Gagal mengunggah file.");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setUploadedFile({
        key: result.key,
        filename: result.filename,
        previewUrl,
      });
      toast.success("Foto berhasil diunggah.");
    } catch {
      toast.error("Terjadi kesalahan saat mengunggah file.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.previewUrl);
      setUploadedFile(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [uploadedFile]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload],
  );

  const form = useForm({
    defaultValues: {
      pelaporName: "",
      contactNumber: "",
      rw: "",
      rt: "",
      addressDetail: "",
      affectedCount: 0,
      affectedHouses: 0,
      waterHeight: "",
      description: "",
      needsType: "",
      assistanceCategory: ["Dana"] as ("Dana" | "Jasa" | "Barang")[],
      budgetDetails: [] as { item: string; amount: number }[],
      latitude: "",
      longitude: "",
    },
    onSubmit: async ({ value }) => {
      const data: ReportInput = {
        ...value,
        evidenceImageKey: uploadedFile?.key ?? null,
      };

      const result = await submitReport(data);

      if (result.success) {
        toast.success(result.message);
        if (uploadedFile) {
          URL.revokeObjectURL(uploadedFile.previewUrl);
        }
        router.push("/dashboard");
      } else {
        toast.error(result.message);
      }
    },
    validators: {
      onSubmit: z.object({
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
          .optional(),
        latitude: z.string(),
        longitude: z.string(),
      }),
    },
  });

  return (
    <div className="flex flex-col w-full max-w-[800px] mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="bg-[#2C869A] p-4 md:p-8 text-white relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="size-5 md:size-6" />
          </button>
        )}
        <div className="flex flex-col gap-2 pt-2 md:pt-4">
          <h2 className="text-xl md:text-2xl font-bold">Tambah Laporan Kebutuhan Warga</h2>
          <p className="text-white/80 text-xs md:text-sm">
            Laporkan kondisi banjir dan kebutuhan bantuan untuk warga terdampak.
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="p-4 md:p-8 flex flex-col gap-5 md:gap-8 bg-[#F4F7F6]/30 overflow-y-auto max-h-[80vh]"
      >
        {/* Section 1: Informasi Lokasi */}
        <section className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-[#2C869A]/10 rounded-lg">
              <MapPin className="size-5 text-[#2C869A]" />
            </div>
            <h3 className="font-bold text-[#0f374c]">Informasi Lokasi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <form.Field name="pelaporName">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Nama Pelapor</label>
                  <input
                    type="text"
                    placeholder="masukkan nama lengkap"
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB]"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500 text-xs">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="contactNumber">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Nomor Kontak</label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB]"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <p className="text-amber-600 text-xs font-medium">
                    Pastikan menggunakan nomor WhatsApp aktif pelapor.
                  </p>
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500 text-xs">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="rw">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">RW</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Contoh: 01"
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB]"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500 text-xs">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="rt">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">RT</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Contoh: 03"
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB]"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500 text-xs">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <div className="md:col-span-2">
              <form.Field name="addressDetail">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Detail Alamat</label>
                    <textarea
                      placeholder="masukkan detail alamat"
                      rows={3}
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB] resize-none"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-xs">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="latitude">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Latitude (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: -6.175392"
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB]"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="longitude">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Longitude (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 106.827153"
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB]"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
        </section>

        {/* Section 2: Informasi Kondisi */}
        <section className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-[#FFA918]/10 rounded-lg">
              <AlertTriangle className="size-5 text-[#FFA918]" />
            </div>
            <h3 className="font-bold text-[#0f374c]">Informasi Kondisi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <form.Field name="affectedCount">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Jumlah Warga Terdampak
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB]"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500 text-xs">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="affectedHouses">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Jumlah Rumah Terdampak
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB]"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500 text-xs">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="waterHeight">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Ketinggian Air</label>
                  <div className="relative">
                    <select
                      className="appearance-none w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB]"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    >
                      <option value="">Pilih Ketinggian</option>
                      <option value="10 - 30 cm">10 - 30 cm</option>
                      <option value="30 - 60 cm">30 - 60 cm</option>
                      <option value="60 - 100 cm">60 - 100 cm</option>
                      <option value="di atas 100 cm">di atas 100 cm</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  </div>
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500 text-xs">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <div className="md:col-span-3">
              <form.Field name="description">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Deskripsi Kondisi</label>
                    <textarea
                      placeholder="air mulai masuk ke rumah warga, akses jalan terputus..."
                      rows={3}
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB] resize-none"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-xs">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>
          </div>
        </section>

        {/* Section 3: Jenis Kebutuhan Bantuan */}
        <section className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-[#2C9A3D]/10 rounded-lg">
              <Package className="size-5 text-[#2C9A3D]" />
            </div>
            <h3 className="font-bold text-[#0f374c]">Jenis Kebutuhan Bantuan</h3>
          </div>

          <form.Field name="assistanceCategory">
            {(field) => (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(
                    [
                      {
                        value: "Dana",
                        label: "Bantuan Dana",
                        desc: "Bantuan Finansial untuk Pemulihan",
                        icon: CreditCard,
                      },
                      {
                        value: "Jasa",
                        label: "Bantuan Jasa",
                        desc: "Tenaga Relawan & Infrastruktur",
                        icon: Wrench,
                      },
                      {
                        value: "Barang",
                        label: "Bantuan Barang",
                        desc: "Makanan, Alat Kebersihan, Dll",
                        icon: Box,
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        const current = field.state.value;
                        if (current.includes(item.value)) {
                          field.handleChange(current.filter((v) => v !== item.value));
                        } else {
                          field.handleChange([...current, item.value]);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group text-left",
                        field.state.value.includes(item.value)
                          ? "border-[#2C869A] bg-[#2C869A]/5 shadow-inner"
                          : "border-gray-100 hover:border-[#2C869A]/30 hover:bg-gray-50",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-xl transition-colors shrink-0",
                            field.state.value.includes(item.value)
                              ? "bg-[#2C869A] text-white"
                              : "bg-gray-100 text-gray-400 group-hover:bg-[#2C869A]/10 group-hover:text-[#2C869A]",
                          )}
                        >
                          <item.icon className="size-5" />
                        </div>
                        <div className="flex flex-col items-start min-w-0">
                          <span className="font-bold text-sm text-[#0f374c] truncate w-full">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-gray-500 leading-tight">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {/* Checklist Indicator */}
                      <div
                        className={cn(
                          "size-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ml-2",
                          field.state.value.includes(item.value)
                            ? "bg-[#2C869A] border-[#2C869A] text-white"
                            : "border-gray-200 bg-white group-hover:border-[#2C869A]/30",
                        )}
                      >
                        {field.state.value.includes(item.value) && (
                          <Check className="size-3.5" strokeWidth={3} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 text-xs">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.values.assistanceCategory]}>
            {([assistanceCategory]) =>
              assistanceCategory.includes("Dana") && (
                <form.Field name="budgetDetails">
                  {(field) => (
                    <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700">
                          Rincian Dana yang Dibutuhkan
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            field.handleChange([...field.state.value, { item: "", amount: 0 }])
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2C869A] text-white text-xs font-bold rounded-lg hover:bg-[#236e7f] transition-colors shadow-sm"
                        >
                          <Plus className="size-3.5" />
                          Tambah Item
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {field.state.value.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-4 bg-white rounded-xl border border-dashed border-gray-200">
                            Belum ada rincian. Klik "Tambah Item" untuk memulai.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {field.state.value.map((item, index) => (
                              <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    placeholder="Nama kebutuhan (misal: Sembako)"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] bg-white"
                                    value={item.item}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => {
                                      const newList = [...field.state.value];
                                      newList[index] = { ...newList[index], item: e.target.value };
                                      field.handleChange(newList);
                                    }}
                                  />
                                </div>
                                <div className="w-32 md:w-40">
                                  <input
                                    type="number"
                                    placeholder="Nominal"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] bg-white"
                                    value={item.amount || ""}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => {
                                      const val =
                                        e.target.value === "" ? 0 : Number(e.target.value);
                                      const newList = [...field.state.value];
                                      newList[index] = { ...newList[index], amount: val };
                                      field.handleChange(newList);
                                    }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newList = field.state.value.filter((_, i) => i !== index);
                                    field.handleChange(newList);
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            ))}
                            <div className="flex justify-between items-center p-3 mt-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                              <span className="text-sm font-bold text-gray-700">
                                Total Estimasi:
                              </span>
                              <span className="text-sm font-black text-[#2C869A]">
                                {formatCurrency(
                                  field.state.value.reduce(
                                    (acc, curr) => acc + (curr.amount || 0),
                                    0,
                                  ),
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      {field.state.meta.errors.map((error) => (
                        <p key={error?.message} className="text-red-500 text-[10px] font-medium">
                          {error?.message}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>
              )
            }
          </form.Subscribe>

          <form.Field name="needsType">
            {(field) => (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Spesifik Kebutuhan</label>
                <input
                  type="text"
                  placeholder="contoh: Bantuan Sembako, Pompa Air, Dana Evakuasi..."
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all bg-[#F9FAFB]"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 text-xs">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </section>

        {/* Section 4: Upload Evidence */}
        <section className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-[#2C869A]/10 rounded-lg">
              <Upload className="size-5 text-[#2C869A]" />
            </div>
            <h3 className="font-bold text-[#0f374c]">Upload Evidence</h3>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {uploadedFile ? (
            /* Preview uploaded file */
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-[#F9FAFB]">
              <div className="relative aspect-video w-full">
                <img
                  src={uploadedFile.previewUrl}
                  alt="Preview bukti"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-[#2C869A]/10 rounded-lg shrink-0">
                    <ImageIcon className="size-4 text-[#2C869A]" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium truncate">
                    {uploadedFile.filename}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="size-4" />
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            /* Upload drop zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center p-5 md:p-8 border-2 border-dashed rounded-3xl transition-all cursor-pointer group",
                isDragOver
                  ? "border-[#2C869A] bg-[#2C869A]/5"
                  : "border-gray-200 bg-[#F9FAFB] hover:border-[#2C869A]/50",
                isUploading && "pointer-events-none opacity-60",
              )}
            >
              {isUploading ? (
                <>
                  <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                    <Loader2 className="size-8 text-[#2C869A] animate-spin" />
                  </div>
                  <p className="font-bold text-gray-700">Mengunggah...</p>
                  <p className="text-gray-400 text-sm">Mohon tunggu sebentar</p>
                </>
              ) : (
                <>
                  <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="size-8 text-[#2C869A]" />
                  </div>
                  <p className="font-bold text-gray-700">Upload Foto Kondisi</p>
                  <p className="text-gray-400 text-sm mb-4 text-center">
                    Drag & Drop atau Klik Untuk Memilih File
                  </p>
                  <span className="px-6 py-2 bg-[#2C869A] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#2C869A]/20">
                    Pilih File
                  </span>
                  <p className="mt-4 text-[11px] text-gray-400">
                    Upload Foto Kondisi Lapangan Sebagai Bukti Laporan
                    <br />
                    Format: JPG, PNG, JPEG (Max: 5MB Per File)
                  </p>
                </>
              )}
            </div>
          )}
        </section>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting || isUploading}
                className={cn(
                  "flex items-center gap-2 px-6 md:px-12 py-3 md:py-4 bg-[#2C869A] hover:bg-[#236e7f] text-white font-bold rounded-2xl shadow-xl shadow-[#2C869A]/20 transition-all transform hover:-translate-y-1 active:scale-95 text-sm md:text-base",
                  (!canSubmit || isSubmitting || isUploading) &&
                    "opacity-60 cursor-not-allowed hover:translate-y-0 active:scale-100",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Mengirim Laporan...
                  </>
                ) : (
                  <>
                    <MapPin className="size-5" />
                    Submit Laporan
                  </>
                )}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
