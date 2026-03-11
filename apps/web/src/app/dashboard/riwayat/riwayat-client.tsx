"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Send,
  Eye,
  Trash2,
  HandHelping,
  Upload,
  ImageIcon,
  Loader2,
  CreditCard,
  Wrench,
  Box,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateReportStatus, deleteReport, submitBantuan } from "./actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReportStatus = "Menunggu" | "Diverifikasi" | "Diproses" | "Selesai";

export interface ReportData {
  id: string;
  pelaporName: string;
  contactNumber: string;
  rw: string;
  rt: string;
  lokasi: string;
  jenisBantuan: string;
  assistanceCategory: string | null;
  budgetDetails: { item: string; amount: number }[] | null;
  needsType: string;
  deskripsi: string;
  latitude: string | null;
  longitude: string | null;
  evidenceImage: string | null;
  status: ReportStatus;
  tanggal: string; // ISO string from server
}

export interface Subscriber {
  name: string;
  phoneNumber: string | null;
}

export interface RiwayatClientProps {
  reports: ReportData[];
  userRole: string;
  allRelawans: Subscriber[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const statusStyles: Record<ReportStatus, { bg: string; text: string; dot: string }> = {
  Menunggu: {
    bg: "bg-[#FFA918]/10",
    text: "text-[#FFA918]",
    dot: "bg-[#FFA918]",
  },
  Diverifikasi: {
    bg: "bg-[#2C869A]/10",
    text: "text-[#2C869A]",
    dot: "bg-[#2C869A]",
  },
  Diproses: {
    bg: "bg-[#2C9A3D]/10",
    text: "text-[#2C9A3D]",
    dot: "bg-[#2C9A3D]",
  },
  Selesai: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    dot: "bg-blue-600",
  },
};

interface Filters {
  tanggal: string;
  jenisBantuan: string;
  status: string;
  rw: string;
}

const initialFilters: Filters = {
  tanggal: "",
  jenisBantuan: "",
  status: "",
  rw: "",
};

const ITEMS_PER_PAGE = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateLong(isoString: string) {
  return new Date(isoString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function buildWhatsAppMessage(report: ReportData): string {
  return `*Laporan Bantuan Bencana - SaGentong*

Tanggal: ${formatDateLong(report.tanggal)}
Lokasi: ${report.lokasi}
Jenis Bantuan: ${report.jenisBantuan}
Kebutuhan: ${report.needsType}
Status: ${report.status}

Pelapor: ${report.pelaporName}
Kontak: ${report.contactNumber}

Deskripsi:
${report.deskripsi}

---
Dikirim melalui SaGentong Dashboard`;
}

// ---------------------------------------------------------------------------
// Status Badge (reusable)
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium",
        statusStyles[status].bg,
        statusStyles[status].text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", statusStyles[status].dot)} />
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function RiwayatClient({
  reports: initialReports,
  userRole,
  allRelawans,
}: RiwayatClientProps) {
  const isAdmin = userRole === "perangkat_desa" || userRole === "superadmin";
  const isSuperadmin = userRole === "superadmin";
  const isRelawan = userRole === "relawan";

  // State
  const [reports, setReports] = useState<ReportData[]>(initialReports);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);

  // Sheet states
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [waSheetOpen, setWaSheetOpen] = useState(false);
  const [bantuanSheetOpen, setBantuanSheetOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>("Menunggu");
  const [waMessage, setWaMessage] = useState("");
  const [bantuanKeterangan, setBantuanKeterangan] = useState("");
  const [danaAmount, setDanaAmount] = useState<string>("");
  const [jenisBantuan, setJenisBantuan] = useState<string>("Dana");
  const [isPending, startTransition] = useTransition();

  const [uploadedFile, setUploadedFile] = useState<{ key: string; previewUrl: string } | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Filtering & Pagination
  // ---------------------------------------------------------------------------

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (appliedFilters.tanggal) {
        const filterDate = new Date(appliedFilters.tanggal);
        const reportDate = new Date(report.tanggal);
        if (
          reportDate.getFullYear() !== filterDate.getFullYear() ||
          reportDate.getMonth() !== filterDate.getMonth() ||
          reportDate.getDate() !== filterDate.getDate()
        ) {
          return false;
        }
      }
      if (appliedFilters.jenisBantuan && report.jenisBantuan !== appliedFilters.jenisBantuan) {
        return false;
      }
      if (appliedFilters.status && report.status !== appliedFilters.status) {
        return false;
      }
      if (appliedFilters.rw && report.rw !== appliedFilters.rw) {
        return false;
      }
      return true;
    });
  }, [appliedFilters, reports]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedReports = filteredReports.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setCurrentPage(1);
  };

  const handleOpenDetail = (report: ReportData) => {
    setSelectedReport(report);
    setDetailSheetOpen(true);
  };

  const handleOpenStatusSheet = (report: ReportData) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setStatusSheetOpen(true);
  };

  const handleOpenWaSheet = (report: ReportData) => {
    setSelectedReport(report);
    setWaMessage(buildWhatsAppMessage(report));
    setWaSheetOpen(true);
  };

  const handleOpenBantuanSheet = (report: ReportData) => {
    setSelectedReport(report);
    setBantuanKeterangan("");
    setDanaAmount("");
    setJenisBantuan("Dana");
    setUploadedFile(null);
    setBantuanSheetOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error ?? "Gagal mengunggah file.");
        return;
      }
      setUploadedFile({ key: result.key, previewUrl: URL.createObjectURL(file) });
      toast.success("Foto berhasil diunggah.");
    } catch {
      toast.error("Terjadi kesalahan saat mengunggah file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusSubmit = () => {
    if (!selectedReport) return;

    const reportId = selectedReport.id;
    const previousStatus = selectedReport.status;

    // Optimistic update
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)));
    setStatusSheetOpen(false);

    startTransition(async () => {
      const result = await updateReportStatus(reportId, newStatus);
      if (result.success) {
        toast.success(result.message);
      } else {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: previousStatus } : r)),
        );
        toast.error(result.message);
      }
    });
  };

  const handleBantuanSubmit = () => {
    if (!selectedReport) return;

    if (!bantuanKeterangan || bantuanKeterangan.length < 5) {
      toast.error("Keterangan minimal 5 karakter.");
      return;
    }

    if (jenisBantuan === "Dana") {
      const amount = parseInt(danaAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Nominal dana harus lebih dari 0.");
        return;
      }
      if (!uploadedFile) {
        toast.error("Bukti transfer wajib diunggah untuk bantuan dana.");
        return;
      }
    }

    startTransition(async () => {
      const result = await submitBantuan(selectedReport.id, {
        keterangan: bantuanKeterangan,
        jenisBantuan,
        danaAmount: jenisBantuan === "Dana" ? parseInt(danaAmount) : null,
        evidenceImage: uploadedFile?.key,
      });
      if (result.success) {
        toast.success(result.message);
        setBantuanSheetOpen(false);
        setUploadedFile(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDeleteReport = (reportId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;

    // Optimistic update
    setReports((prev) => prev.filter((r) => r.id !== reportId));

    startTransition(async () => {
      const result = await deleteReport(reportId);
      if (result.success) {
        toast.success(result.message);
      } else {
        // We can't easily restore deleted item without re-fetching,
        // but for simplicity we'll just show error
        toast.error(result.message);
        // Best practice would be to re-fetch data or use SWR/React Query
      }
    });
  };

  const handleSendWhatsApp = (phoneNumber: string) => {
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber)}&text=${encodeURIComponent(waMessage)}`;
    window.open(url, "_blank");
  };

  const handleExportExcel = async () => {
    if (!selectedReport) return;

    try {
      const response = await fetch("/api/export/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: selectedReport.id,
          location: selectedReport.lokasi,
          waMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengekspor data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Broadcast_Relawan_${selectedReport.lokasi.replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Data berhasil diekspor ke Excel.");
    } catch (error) {
      console.error("[export] Error:", error);
      toast.error("Terjadi kesalahan saat mengekspor data.");
    }
  };

  // Show action column for admin and relawan (both have actions now)
  const showActionColumn = isAdmin || isRelawan;
  const tableColSpan = showActionColumn ? 6 : 5;

  // Get unique RW values from data for the filter dropdown
  const rwOptions = useMemo(() => {
    const rws = [...new Set(reports.map((r) => r.rw))].sort();
    return rws;
  }, [reports]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-[1200px] mx-auto w-full px-4">
      {/* Page Header */}
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl sm:text-2xl md:text-[30px] font-semibold text-[#2C869A] capitalize">
          Riwayat Laporan
        </h1>
        <p className="text-[13px] sm:text-[14px] text-black">
          Kelola dan pantau semua laporan bantuan dari warga
        </p>
      </div>

      {/* Filter Card */}
      <div className="w-full rounded-xl border-2 border-black/30 bg-white p-4 sm:p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Tanggal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-800">Tanggal</label>
            <input
              type="date"
              value={filters.tanggal}
              onChange={(e) => setFilters((prev) => ({ ...prev, tanggal: e.target.value }))}
              className="appearance-none w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all"
            />
          </div>

          {/* Jenis Bantuan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-800">Jenis Bantuan</label>
            <div className="relative">
              <select
                value={filters.jenisBantuan}
                onChange={(e) => setFilters((prev) => ({ ...prev, jenisBantuan: e.target.value }))}
                className="appearance-none w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all pr-9"
              >
                <option value="">Semua Jenis</option>
                <option value="Bantuan Dana">Bantuan Dana</option>
                <option value="Bantuan Jasa">Bantuan Jasa</option>
                <option value="Bantuan Barang">Bantuan Barang</option>
                <option value="Tidak Diketahui">Tidak Diketahui</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-800">Status</label>
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="appearance-none w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all pr-9"
              >
                <option value="">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Diverifikasi">Diverifikasi</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* RW */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-800">RW</label>
            <div className="relative">
              <select
                value={filters.rw}
                onChange={(e) => setFilters((prev) => ({ ...prev, rw: e.target.value }))}
                className="appearance-none w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all pr-9"
              >
                <option value="">Semua RW</option>
                {rwOptions.map((rw) => (
                  <option key={rw} value={rw}>
                    RW {rw}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 sm:mt-5">
          <button
            onClick={handleApplyFilters}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2C869A] hover:bg-[#236e7f] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Filter className="size-4" />
            Terapkan Filter
          </button>

          <button
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="size-4" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="w-full rounded-2xl bg-white p-4 sm:p-6 shadow-[0px_4px_20px_rgba(44,134,154,0.05)] ring-1 ring-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[#0f374c]">
            Daftar Laporan
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filteredReports.length} laporan)
            </span>
          </h2>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden flex flex-col gap-3">
          {paginatedReports.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              Tidak ada laporan yang sesuai dengan filter
            </div>
          ) : (
            paginatedReports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {report.lokasi}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(report.tanggal)}</span>
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">{report.jenisBantuan}</span>
                  <p className="text-sm text-gray-600 line-clamp-2">{report.deskripsi}</p>
                </div>

                {showActionColumn && (
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => handleOpenDetail(report)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="size-3.5" />
                          Detail
                        </button>
                        <button
                          onClick={() => handleOpenStatusSheet(report)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C869A] rounded-lg border border-[#2C869A]/20 hover:bg-[#2C869A]/5 transition-colors"
                        >
                          <RefreshCw className="size-3.5" />
                          Status
                        </button>
                        {isSuperadmin && (
                          <button
                            onClick={() => handleOpenWaSheet(report)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 rounded-lg border border-green-200 hover:bg-green-50 transition-colors"
                          >
                            <Send className="size-3.5" />
                            WA
                          </button>
                        )}
                        {isSuperadmin && (
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="inline-flex items-center justify-center size-8 ml-auto text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenDetail(report)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="size-3.5" />
                          Detail
                        </button>
                        <button
                          onClick={() => handleOpenBantuanSheet(report)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FFA918] rounded-lg border border-[#FFA918]/20 hover:bg-[#FFA918]/5 transition-colors"
                        >
                          <HandHelping className="size-3.5" />
                          Bantuan
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full text-left font-inter text-[14px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-4 pr-4 font-medium whitespace-nowrap">Tanggal</th>
                <th className="pb-4 px-4 font-medium whitespace-nowrap">Lokasi (RW/RT)</th>
                <th className="pb-4 px-4 font-medium whitespace-nowrap">Jenis Bantuan</th>
                <th className="pb-4 px-4 font-medium whitespace-nowrap">Deskripsi</th>
                <th className="pb-4 px-4 font-medium text-center whitespace-nowrap">Status</th>
                {showActionColumn && (
                  <th className="pb-4 pl-4 font-medium text-center whitespace-nowrap">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={tableColSpan} className="py-12 text-center text-gray-400">
                    Tidak ada laporan yang sesuai dengan filter
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pr-4 text-gray-600 whitespace-nowrap">
                      {formatDate(report.tanggal)}
                    </td>
                    <td className="py-4 px-4 text-gray-800 font-medium whitespace-nowrap">
                      {report.lokasi}
                    </td>
                    <td className="py-4 px-4 text-gray-600 whitespace-nowrap">
                      {report.jenisBantuan}
                    </td>
                    <td
                      className="py-4 px-4 text-gray-500 max-w-[200px] truncate"
                      title={report.deskripsi}
                    >
                      {report.deskripsi}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <StatusBadge status={report.status} />
                      </div>
                    </td>
                    {showActionColumn && (
                      <td className="py-4 pl-4">
                        <div className="flex justify-center">
                          {isAdmin ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center justify-center size-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none">
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                side="bottom"
                                sideOffset={4}
                                className="min-w-[170px] rounded-lg p-1"
                              >
                                <DropdownMenuItem
                                  className="gap-2 rounded-md px-3 py-2 text-sm cursor-pointer"
                                  onClick={() => handleOpenDetail(report)}
                                >
                                  <Eye className="size-4" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 rounded-md px-3 py-2 text-sm cursor-pointer"
                                  onClick={() => handleOpenStatusSheet(report)}
                                >
                                  <RefreshCw className="size-4" />
                                  Ubah Status
                                </DropdownMenuItem>
                                {isSuperadmin && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="gap-2 rounded-md px-3 py-2 text-sm cursor-pointer"
                                      onClick={() => handleOpenWaSheet(report)}
                                    >
                                      <Send className="size-4" />
                                      Broadcast WhatsApp
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {isSuperadmin && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="gap-2 rounded-md px-3 py-2 text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                      onClick={() => handleDeleteReport(report.id)}
                                    >
                                      <Trash2 className="size-4" />
                                      Hapus Laporan
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            /* Relawan: detail and bantuan buttons */
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenDetail(report)}
                                className="inline-flex items-center justify-center size-8 rounded-lg text-gray-500 hover:text-[#2C869A] hover:bg-[#2C869A]/10 transition-colors"
                                title="Lihat Detail"
                              >
                                <Eye className="size-4" />
                              </button>
                              <button
                                onClick={() => handleOpenBantuanSheet(report)}
                                className="inline-flex items-center justify-center size-8 rounded-lg text-gray-500 hover:text-[#FFA918] hover:bg-[#FFA918]/10 transition-colors"
                                title="Beri Bantuan"
                              >
                                <HandHelping className="size-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredReports.length > 0 && (
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Halaman {safePage} dari {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Detail Sheet (all roles)                                          */}
      {/* ----------------------------------------------------------------- */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="text-base font-semibold text-[#0f374c]">
              Detail Laporan
            </SheetTitle>
            <SheetDescription>Informasi lengkap mengenai laporan bantuan ini.</SheetDescription>
          </SheetHeader>

          {selectedReport && (
            <div className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
              <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                <DetailRow label="Tanggal" value={formatDateLong(selectedReport.tanggal)} />
                <DetailRow label="Lokasi" value={selectedReport.lokasi} />
                <DetailRow label="Jenis Bantuan" value={selectedReport.jenisBantuan} />
                <DetailRow label="Kebutuhan" value={selectedReport.needsType} />
                {(selectedReport.latitude || selectedReport.longitude) && (
                  <DetailRow
                    label="Koordinat"
                    value={`${selectedReport.latitude ?? "-"}, ${selectedReport.longitude ?? "-"}`}
                  />
                )}
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Status</span>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-3">
                  <DetailRow label="Pelapor" value={selectedReport.pelaporName} />
                  <DetailRow label="Kontak" value={selectedReport.contactNumber} />
                </div>
              </div>

              {/* Rincian Dana section */}
              {selectedReport.budgetDetails && selectedReport.budgetDetails.length > 0 && (
                <div className="flex flex-col gap-3 p-4 bg-[#2C869A]/5 rounded-xl border border-[#2C869A]/10 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center gap-2 border-b border-[#2C869A]/10 pb-2">
                    <CreditCard className="size-4 text-[#2C869A]" />
                    <h4 className="text-sm font-bold text-[#0f374c]">
                      Rincian Dana yang Dibutuhkan
                    </h4>
                  </div>
                  <div className="flex flex-col gap-2">
                    {selectedReport.budgetDetails.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 font-medium">{item.item}</span>
                        <span className="text-gray-900 font-bold">{formatRupiah(item.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-[#2C869A]/10 mt-1">
                      <span className="text-xs font-black text-[#0f374c]">Total Estimasi</span>
                      <span className="text-sm font-black text-[#2C869A]">
                        {formatRupiah(
                          selectedReport.budgetDetails.reduce((acc, curr) => acc + curr.amount, 0),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-800">Deskripsi</span>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
                  {selectedReport.deskripsi}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-800">Foto Bukti</span>
                {selectedReport.evidenceImage ? (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={`/api/storage/${selectedReport.evidenceImage}`}
                      alt="Bukti Laporan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <ImageIcon className="size-6 text-gray-300 mb-1" />
                    <span className="text-xs text-gray-400">Tidak ada foto bukti</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <SheetFooter>
            <SheetClose
              render={
                <Button variant="outline" className="rounded-lg">
                  Tutup
                </Button>
              }
            />
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ----------------------------------------------------------------- */}
      {/* Ubah Status Sheet (admin only)                                     */}
      {/* ----------------------------------------------------------------- */}
      <Sheet open={statusSheetOpen} onOpenChange={setStatusSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="text-base font-semibold text-[#0f374c]">
              Ubah Status Laporan
            </SheetTitle>
            <SheetDescription>Perbarui status laporan bantuan di bawah ini.</SheetDescription>
          </SheetHeader>

          {selectedReport && (
            <div className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <DetailRow label="Lokasi" value={selectedReport.lokasi} />
                <DetailRow label="Jenis Bantuan" value={selectedReport.jenisBantuan} />
                <DetailRow label="Kebutuhan" value={selectedReport.needsType} />
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Status Saat Ini</span>
                  <StatusBadge status={selectedReport.status} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-800">Status Baru</label>
                <div className="relative">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                    className="appearance-none w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all pr-9"
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Diverifikasi">Diverifikasi</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          <SheetFooter>
            <SheetClose
              render={
                <Button variant="outline" className="rounded-lg">
                  Batal
                </Button>
              }
            />
            <button
              onClick={handleStatusSubmit}
              disabled={isPending || newStatus === selectedReport?.status}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2C869A] hover:bg-[#236e7f] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ----------------------------------------------------------------- */}
      {/* Broadcast WhatsApp Sheet (admin only)                              */}
      {/* ----------------------------------------------------------------- */}
      <Sheet open={waSheetOpen} onOpenChange={setWaSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="text-base font-semibold text-[#0f374c]">
              Broadcast WhatsApp
            </SheetTitle>
            <div className="flex items-center justify-between mt-1">
              <SheetDescription className="text-xs">
                Kirim informasi laporan ini kepada para relawan.
              </SheetDescription>
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-[11px] font-bold rounded-lg transition-colors border border-green-200 shrink-0"
              >
                <Download className="size-3" />
                Ekspor Excel
              </button>
            </div>
          </SheetHeader>

          {selectedReport && (
            <div className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
              {/* Report info */}
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <DetailRow label="Lokasi" value={selectedReport.lokasi} />
                <DetailRow label="Jenis Bantuan" value={selectedReport.jenisBantuan} />
                <DetailRow label="Kebutuhan" value={selectedReport.needsType} />
              </div>

              {/* Message template */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-800">Pesan</label>
                <textarea
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all resize-none"
                />
              </div>

              {/* Relawan list */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-gray-800">Daftar Relawan</h3>
                {allRelawans.length === 0 ? (
                  <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
                    Belum ada relawan yang terdaftar.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {allRelawans.map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                          <span className="text-xs text-gray-500">
                            {sub.phoneNumber ?? "Nomor tidak tersedia"}
                          </span>
                        </div>
                        {sub.phoneNumber ? (
                          <button
                            onClick={() => handleSendWhatsApp(sub.phoneNumber!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C9A3D] hover:bg-[#237e31] text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Send className="size-3" />
                            Kirim
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <SheetFooter>
            <SheetClose
              render={
                <Button variant="outline" className="rounded-lg">
                  Tutup
                </Button>
              }
            />
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ----------------------------------------------------------------- */}
      {/* Submit Bantuan Sheet (relawan only)                               */}
      {/* ----------------------------------------------------------------- */}
      <Sheet open={bantuanSheetOpen} onOpenChange={setBantuanSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="text-base font-semibold text-[#0f374c]">
              Submit Bantuan
            </SheetTitle>
            <SheetDescription>
              Berikan informasi mengenai bantuan yang akan Anda berikan.
            </SheetDescription>
          </SheetHeader>

          {selectedReport && (
            <div className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
              {/* Report info */}
              <div className="rounded-lg bg-gray-50 p-4 space-y-2 border border-gray-100">
                <DetailRow label="Lokasi" value={selectedReport.lokasi} />
                <DetailRow label="Kebutuhan" value={selectedReport.needsType} />
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Status</span>
                  <StatusBadge status={selectedReport.status} />
                </div>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-800">Jenis Bantuan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { value: "Dana", icon: CreditCard },
                        { value: "Jasa", icon: Wrench },
                        { value: "Barang", icon: Box },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setJenisBantuan(item.value)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1.5",
                          jenisBantuan === item.value
                            ? "border-[#2C869A] bg-[#2C869A]/5 text-[#2C869A]"
                            : "border-gray-100 hover:border-gray-200 text-gray-400",
                        )}
                      >
                        <item.icon className="size-5" />
                        <span className="text-[11px] font-bold">{item.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {jenisBantuan === "Dana" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-800">Nominal Dana (Rp)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={danaAmount}
                        onChange={(e) => setDanaAmount(e.target.value)}
                        placeholder="Contoh: 500000"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                        Rp
                      </span>
                    </div>

                    <div className="mt-2 rounded-xl border border-[#2C869A]/20 bg-[#2C869A]/5 p-3">
                      <p className="text-xs font-semibold text-[#2C869A] mb-1.5">
                        Transfer ke Rekening:
                      </p>
                      <div className="flex flex-col gap-0.5 text-sm text-gray-700">
                        <span className="font-medium">Bank Jago</span>
                        <span className="font-bold tracking-wide">106639518697</span>
                        <span className="text-xs text-gray-500">a.n. Nahiyah Zahrah Safitri</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-800">Keterangan Bantuan</label>
                  <textarea
                    value={bantuanKeterangan}
                    onChange={(e) => setBantuanKeterangan(e.target.value)}
                    placeholder="Contoh: Saya akan mengirimkan 5 paket sembako ke lokasi besok pagi."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2C869A]/20 focus:border-[#2C869A] transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-800">
                    {jenisBantuan === "Dana" ? "Bukti Transfer (Wajib)" : "Bukti / Foto (Opsional)"}
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  {uploadedFile ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-gray-200 group">
                      <img
                        src={uploadedFile.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="absolute top-2 right-2 size-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 className="size-6 text-[#2C869A] animate-spin" />
                      ) : (
                        <>
                          <Upload className="size-6 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500">Pilih Foto Bukti</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="gap-2 sm:gap-0">
            <SheetClose
              render={
                <Button variant="outline" className="rounded-lg flex-1 sm:flex-none">
                  Batal
                </Button>
              }
            />
            <button
              onClick={handleBantuanSubmit}
              disabled={isPending || !bantuanKeterangan || bantuanKeterangan.length < 5}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2C869A] hover:bg-[#236e7f] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
            >
              {isPending ? "Mengirim..." : "Kirim Bantuan"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper component
// ---------------------------------------------------------------------------

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
