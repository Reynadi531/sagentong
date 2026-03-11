"use client";

import React, { useState, useTransition } from "react";
import {
  Calendar,
  User,
  MapPin,
  Package,
  ArrowLeft,
  ImageIcon,
  Phone,
  Download,
  Loader2,
  CreditCard,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { deleteBantuan } from "./actions";

interface BantuanItem {
  id: string;
  jenisBantuan: string;
  danaAmount: number | null;
  keterangan: string;
  evidenceImage: string | null;
  relawanName: string;
  relawanPhone: string | null;
  tanggal: string;
}

interface ReportInfo {
  id: string;
  pelaporName: string;
  lokasi: string;
  kebutuhan: string;
  budgetDetails: { item: string; amount: number }[] | null;
  status: string;
  deskripsi: string;
}

export default function BantuanDetailClient({
  report,
  bantuan,
  userRole,
}: {
  report: ReportInfo;
  bantuan: BantuanItem[];
  userRole: string;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalReceived = bantuan.reduce((acc, curr) => acc + (curr.danaAmount ?? 0), 0);
  const totalTarget = report.budgetDetails?.reduce((acc, curr) => acc + curr.amount, 0) ?? 0;
  const percentage =
    totalTarget > 0 ? Math.min(Math.round((totalReceived / totalTarget) * 100), 100) : 0;
  const rawPercentage = totalTarget > 0 ? Math.round((totalReceived / totalTarget) * 100) : 0;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/export/bantuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          location: report.lokasi,
          needsType: report.kebutuhan,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengekspor data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Daftar_Bantuan_${report.lokasi.replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Laporan berhasil diunduh.");
    } catch (error) {
      console.error("[export] Error:", error);
      toast.error("Terjadi kesalahan saat mengunduh laporan.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteBantuan = (bantuanId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data bantuan ini?")) return;

    startTransition(async () => {
      const result = await deleteBantuan(bantuanId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1200px] mx-auto w-full px-4 pb-12">
      {/* Header & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard/bantuan"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2C869A] transition-colors w-fit"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Daftar Bantuan
          </Link>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0f374c]">
              Detail Bantuan Relawan
            </h1>
            <p className="text-gray-500">
              Berikut adalah rincian bantuan yang dikirimkan oleh relawan untuk laporan ini.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={isExporting || bantuan.length === 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-[#2C869A] hover:text-[#2C869A] text-gray-600 text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed h-fit"
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Unduh Laporan Excel
        </button>
      </div>

      {/* Report Summary Card */}
      <div className="w-full rounded-2xl bg-[#2C869A] p-4 sm:p-6 text-white shadow-lg overflow-hidden relative">
        <div className="absolute right-0 top-0 p-8 opacity-10 hidden sm:block">
          <Package className="size-32" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-white/70 text-xs font-bold uppercase tracking-wider">
              Laporan Utama
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">{report.kebutuhan}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
              <div className="flex items-center gap-1.5 text-sm">
                <User className="size-4 text-white/70" />
                {report.pelaporName}
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <MapPin className="size-4 text-white/70" />
                {report.lokasi}
              </div>
              <div className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                {report.status}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-1 shrink-0">
            <span className="text-white/70 text-xs font-bold uppercase tracking-wider">
              Total Terkumpul
            </span>
            <span className="text-xl sm:text-2xl font-black">{formatRupiah(totalReceived)}</span>
            {totalTarget > 0 && (
              <span className="text-white/70 text-xs uppercase font-bold">
                Target: {formatRupiah(totalTarget)}
              </span>
            )}
            <span className="text-white/70 text-[10px] uppercase mt-1">
              {bantuan.length} Kontribusi
            </span>
          </div>
        </div>

        {/* Progress Bar Section */}
        {totalTarget > 0 && (
          <div className="mt-6 flex flex-col gap-2 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
              <span className="text-white">Progres Dana Bantuan</span>
              <span className="text-white text-base">{rawPercentage}%</span>
            </div>
            <div className="h-4 w-full bg-white/20 rounded-full overflow-hidden border border-white/10 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-[10px] text-white/60 italic">
              *Telah terkumpul {formatRupiah(totalReceived)} dari target {formatRupiah(totalTarget)}
            </p>
          </div>
        )}

        {/* Target Budget Details */}
        {report.budgetDetails && report.budgetDetails.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex flex-col gap-3">
              <span className="text-white/70 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="size-3.5" />
                Target Rincian Dana yang Dibutuhkan
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {report.budgetDetails.map((bd, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm border-b border-white/10 pb-1 last:border-0"
                  >
                    <span className="text-white/90 font-medium">{bd.item}</span>
                    <span className="text-white font-black">{formatRupiah(bd.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 sm:col-span-2">
                  <span className="text-white font-bold">Total Target Estimasi</span>
                  <span className="text-lg font-black underline decoration-2 underline-offset-4">
                    {formatRupiah(report.budgetDetails.reduce((acc, curr) => acc + curr.amount, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assistance Items Grid */}
      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-bold text-[#0f374c]">Daftar Kontribusi ({bantuan.length})</h3>

        {bantuan.length === 0 ? (
          <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
            <Package className="size-12 mb-4 opacity-20" />
            <p>Belum ada kontribusi bantuan untuk laporan ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bantuan.map((item) => (
              <div
                key={item.id}
                className="flex flex-col bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-md transition-all"
              >
                {/* Item Header */}
                <div className="px-4 sm:px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#2C869A]/10 flex items-center justify-center">
                      <User className="size-5 text-[#2C869A]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#0f374c]">{item.relawanName}</span>
                      <span className="text-[11px] text-gray-500">{formatDate(item.tanggal)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.jenisBantuan === "Dana" && item.danaAmount && (
                      <div className="px-3 py-1 rounded-lg bg-[#2C9A3D]/10 text-[11px] font-bold text-[#2C9A3D]">
                        {formatRupiah(item.danaAmount)}
                      </div>
                    )}
                    <div className="px-3 py-1 rounded-lg bg-white border border-gray-100 text-[11px] font-bold text-[#2C869A] shadow-sm">
                      {item.jenisBantuan}
                    </div>
                    {userRole === "superadmin" && (
                      <button
                        onClick={() => handleDeleteBantuan(item.id)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Hapus Bantuan"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-6 flex flex-col gap-6">
                  {/* Item Description */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Keterangan
                    </span>
                    <p className="text-[14px] text-gray-700 leading-relaxed bg-[#F9FAFB] p-4 rounded-2xl border border-gray-50">
                      {item.keterangan}
                    </p>
                  </div>

                  {/* Item Evidence */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Bukti Foto
                    </span>
                    {item.evidenceImage ? (
                      <Dialog>
                        <DialogTrigger
                          render={
                            <button className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 group cursor-zoom-in outline-none">
                              <img
                                src={`/api/storage/${item.evidenceImage}`}
                                alt="Bukti Bantuan"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <ImageIcon className="size-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          }
                        />
                        <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 overflow-hidden bg-transparent border-none">
                          <DialogTitle className="sr-only">Bukti Bantuan Relawan</DialogTitle>
                          <img
                            src={`/api/storage/${item.evidenceImage}`}
                            alt="Bukti Bantuan Full"
                            className="w-full h-auto max-h-[90vh] object-contain"
                          />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <ImageIcon className="size-8 text-gray-300 mb-2" />
                        <span className="text-xs text-gray-400">Tidak ada foto bukti</span>
                      </div>
                    )}
                  </div>

                  {/* Relawan Contact (hidden if not admin/staff but page is already restricted) */}
                  {item.relawanPhone && (
                    <div className="mt-2 pt-4 border-t border-gray-50">
                      <a
                        href={`https://wa.me/${item.relawanPhone.replace(/\+/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[13px] font-medium text-[#2C9A3D] hover:underline"
                      >
                        <Phone className="size-3.5" />
                        Hubungi Relawan via WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
