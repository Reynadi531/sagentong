"use client";

import React, { useState } from "react";
import { Eye, Calendar, MapPin, ChevronLeft, ChevronRight, Package } from "lucide-react";
import Link from "next/link";

interface ReportWithBantuanCount {
  id: string;
  pelaporName: string;
  lokasi: string;
  kebutuhan: string;
  status: string;
  tanggalLaporan: string;
  jumlahBantuan: number;
  totalDana: number;
}

export default function BantuanListClient({ reports }: { reports: ReportWithBantuanCount[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(reports.length / ITEMS_PER_PAGE);
  const paginatedData = reports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full px-4">
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h1 className="text-[30px] font-semibold text-[#2C869A] capitalize">
          Daftar Bantuan Masuk
        </h1>
        <p className="text-[14px] text-gray-500">
          Daftar laporan warga yang telah menerima kontribusi bantuan dari relawan.
        </p>
      </div>

      <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-4 font-medium">Laporan / Pelapor</th>
                <th className="pb-4 px-4 font-medium">Lokasi</th>
                <th className="pb-4 px-4 font-medium">Status Laporan</th>
                <th className="pb-4 px-4 font-medium text-center">Jumlah Bantuan</th>
                <th className="pb-4 px-4 font-medium text-right">Total Dana</th>
                <th className="pb-4 px-4 font-medium">Terakhir Diperbarui</th>
                <th className="pb-4 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Belum ada bantuan yang masuk untuk laporan manapun.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-medium text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0f374c]">{item.kebutuhan}</span>
                        <span className="text-[12px] text-gray-500">{item.pelaporName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-gray-400" />
                        {item.lokasi}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg bg-[#2C869A]/10 text-[#2C869A] font-bold">
                        {item.jumlahBantuan}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-[#2C9A3D]">
                      {item.totalDana > 0 ? formatRupiah(item.totalDana) : "-"}
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-gray-400" />
                        {formatDate(item.tanggalLaporan)}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <Link
                        href={`/dashboard/bantuan/${item.id}`}
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-[#2C869A] text-white text-xs font-semibold hover:bg-[#236e7f] transition-colors shadow-sm"
                      >
                        <Eye className="size-3.5" />
                        Lihat Detail Bantuan
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {reports.length > ITEMS_PER_PAGE && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
            <span className="text-xs text-gray-500">
              Menampilkan {paginatedData.length} dari {reports.length} laporan
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
