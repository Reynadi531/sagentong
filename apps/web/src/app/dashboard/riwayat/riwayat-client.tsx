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
  Bell,
  BellOff,
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
import { updateReportStatus, subscribeLaporan, unsubscribeLaporan } from "./actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReportStatus = "Menunggu" | "Diverifikasi" | "Diproses";

export interface ReportData {
  id: string;
  pelaporName: string;
  contactNumber: string;
  rw: string;
  rt: string;
  lokasi: string;
  jenisBantuan: string;
  assistanceCategory: string | null;
  needsType: string;
  deskripsi: string;
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
  subscribedIds: string[];
  subscribers: Record<string, Subscriber[]>;
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
  subscribedIds: initialSubscribedIds,
  subscribers: initialSubscribers,
}: RiwayatClientProps) {
  const isAdmin = userRole === "perangkat_desa" || userRole === "superadmin";
  const isRelawan = userRole === "relawan";

  // State
  const [reports, setReports] = useState<ReportData[]>(initialReports);
  const [subscribedIds, setSubscribedIds] = useState<string[]>(initialSubscribedIds);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);

  // Sheet states
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [waSheetOpen, setWaSheetOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>("Menunggu");
  const [waMessage, setWaMessage] = useState("");
  const [isPending, startTransition] = useTransition();

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

  const handleSubscribe = (reportId: string) => {
    // Optimistic
    setSubscribedIds((prev) => [...prev, reportId]);

    startTransition(async () => {
      const result = await subscribeLaporan(reportId);
      if (result.success) {
        toast.success(result.message);
      } else {
        setSubscribedIds((prev) => prev.filter((id) => id !== reportId));
        toast.error(result.message);
      }
    });
  };

  const handleUnsubscribe = (reportId: string) => {
    // Optimistic
    setSubscribedIds((prev) => prev.filter((id) => id !== reportId));

    startTransition(async () => {
      const result = await unsubscribeLaporan(reportId);
      if (result.success) {
        toast.success(result.message);
      } else {
        setSubscribedIds((prev) => [...prev, reportId]);
        toast.error(result.message);
      }
    });
  };

  const handleSendWhatsApp = (phoneNumber: string) => {
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber)}&text=${encodeURIComponent(waMessage)}`;
    window.open(url, "_blank");
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
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-[30px] font-semibold text-[#2C869A] capitalize">Riwayat Laporan</h1>
        <p className="text-[14px] text-black">Kelola dan pantau semua laporan bantuan dari warga</p>
      </div>

      {/* Filter Card */}
      <div className="w-full rounded-xl border-2 border-black/30 bg-white p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={handleApplyFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C869A] hover:bg-[#236e7f] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Filter className="size-4" />
            Terapkan Filter
          </button>

          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="size-4" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="w-full rounded-2xl bg-white p-6 shadow-[0px_4px_20px_rgba(44,134,154,0.05)] ring-1 ring-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[#0f374c]">
            Daftar Laporan
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filteredReports.length} laporan)
            </span>
          </h2>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left font-inter text-[14px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-4 pr-4 font-medium">Tanggal</th>
                <th className="pb-4 px-4 font-medium">Lokasi (RW/RT)</th>
                <th className="pb-4 px-4 font-medium">Jenis Bantuan</th>
                <th className="pb-4 px-4 font-medium">Deskripsi</th>
                <th className="pb-4 px-4 font-medium text-center">Status</th>
                {showActionColumn && <th className="pb-4 pl-4 font-medium text-center">Aksi</th>}
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
                    <td className="py-4 pr-4 text-gray-600">{formatDate(report.tanggal)}</td>
                    <td className="py-4 px-4 text-gray-800 font-medium">{report.lokasi}</td>
                    <td className="py-4 px-4 text-gray-600">{report.jenisBantuan}</td>
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
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 rounded-md px-3 py-2 text-sm cursor-pointer"
                                  onClick={() => handleOpenWaSheet(report)}
                                >
                                  <Send className="size-4" />
                                  Broadcast WhatsApp
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            /* Relawan: single detail button */
                            <button
                              onClick={() => handleOpenDetail(report)}
                              className="inline-flex items-center justify-center size-8 rounded-lg text-gray-500 hover:text-[#2C869A] hover:bg-[#2C869A]/10 transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="size-4" />
                            </button>
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
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
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
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Berikutnya
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
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Status</span>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-3">
                  <DetailRow label="Pelapor" value={selectedReport.pelaporName} />
                  <DetailRow label="Kontak" value={selectedReport.contactNumber} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-800">Deskripsi</span>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
                  {selectedReport.deskripsi}
                </p>
              </div>
            </div>
          )}

          <SheetFooter>
            {isRelawan && selectedReport && (
              <>
                {subscribedIds.includes(selectedReport.id) ? (
                  <button
                    onClick={() => {
                      handleUnsubscribe(selectedReport.id);
                      setDetailSheetOpen(false);
                    }}
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    <BellOff className="size-4" />
                    Batal Langganan
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleSubscribe(selectedReport.id);
                      setDetailSheetOpen(false);
                    }}
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2C869A] hover:bg-[#236e7f] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Bell className="size-4" />
                    Langganan Laporan
                  </button>
                )}
              </>
            )}
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
            <SheetDescription>
              Kirim informasi laporan ini kepada relawan yang berlangganan.
            </SheetDescription>
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

              {/* Subscribed relawan list */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-gray-800">Relawan Berlangganan</h3>
                {(() => {
                  const subs = initialSubscribers[selectedReport.id] ?? [];
                  if (subs.length === 0) {
                    return (
                      <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
                        Belum ada relawan yang berlangganan laporan ini.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {subs.map((sub, idx) => (
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
                  );
                })()}
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
