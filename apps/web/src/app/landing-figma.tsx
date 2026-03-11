"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Megaphone,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  RefreshCw,
  FileText,
  Clock,
  ShieldCheck,
  Instagram,
  Facebook,
  Youtube,
  Search,
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Link from "next/link";

export interface LandingReport {
  id: string;
  displayId: string;
  lokasi: string;
  status: string;
  updateTerakhir: string;
}

export interface LandingActivity {
  id: string;
  time: string;
  action: string;
}

interface LandingFigmaProps {
  reports?: LandingReport[];
  activities?: LandingActivity[];
  lastUpdated?: string;
}

export default function LandingFigma({
  reports = [],
  activities = [],
  lastUpdated = "Baru saja",
}: LandingFigmaProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = reports.filter(
    (report) =>
      report.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.lokasi.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full bg-white">
      <Header />
      {/* BERANDA (Hero) Section */}
      <section
        id="beranda"
        className="relative min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-70px)] w-full overflow-hidden flex items-center"
      >
        {/* Background color placeholder/image */}
        <div className="absolute inset-0 w-full h-full">
          {/* Note: In production you would use next/image pointing to public/images/hero_section.svg or similar */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero_section.svg')" }}
          />
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(-90deg, rgba(102, 102, 102, 0) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.75) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center items-start px-6 md:px-12 lg:px-[100px] py-12 md:py-20 w-full max-w-[1336px] mx-auto z-10">
          <h1 className="text-2xl sm:text-[32px] md:text-[40px] lg:text-[56px] font-bold text-white mb-4 md:mb-[20px] leading-[1.2] drop-shadow-[0px_4px_12px_rgba(0,0,0,0.4)] capitalize">
            <div>Sistem bantuan darurat</div>
            <div>untuk korban banjir</div>
          </h1>

          <p className="text-base md:text-[20px] text-white mb-8 md:mb-[45px] max-w-2xl drop-shadow-[0px_4px_12px_rgba(0,0,0,0.25)] font-normal leading-relaxed md:leading-[30px]">
            Laporan, verifikasi, dan Distribusi Bantuan Untuk Warga Dayeuhkolot
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full sm:w-auto">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-[#2c869a] hover:bg-[#1f5f6e] text-white px-6 md:px-8 h-[48px] md:h-[56px] flex items-center justify-center w-full sm:w-[180px] rounded-[17px] font-semibold transition duration-300 whitespace-nowrap text-base md:text-[20px] leading-[30px] drop-shadow-[0px_4px_12px_rgba(0,0,0,0.25)]"
            >
              Laporkan Banjir
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-[#7cc2d1] hover:bg-[#6ab5c5] text-white px-6 md:px-8 h-[48px] md:h-[56px] flex items-center justify-center w-full sm:w-[241px] rounded-[17px] font-semibold transition duration-300 whitespace-nowrap text-base md:text-[20px] leading-[30px] drop-shadow-[0px_4px_12px_rgba(0,0,0,0.25)]"
            >
              Gabung Jadi Relawan
            </button>
          </div>
        </div>
      </section>

      {/* TENTANG Section */}
      <section
        id="tentang"
        className="w-full py-12 md:py-24 lg:py-[120px] px-6 md:px-12 bg-white relative"
      >
        <div className="max-w-[1140px] mx-auto">
          {/* Title */}
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-[40px] font-bold text-[#2c869a] mb-2">Tentang</h2>
            <div className="h-1 w-[80px] bg-[#2c869a] mx-auto"></div>
          </div>

          <h3 className="text-xl md:text-[32px] font-bold text-[#0f374c] text-center mb-4 md:mb-5">
            Sistem Informasi Tanggap Banjir Berbasis Real-Time
          </h3>

          <p className="text-center text-gray-600 text-sm md:text-[18px] max-w-3xl mx-auto mb-10 md:mb-20 font-light">
            Pantau titik banjir aktif, laporkan kondisi lapangan, dan kelola distribusi bantuan
            secara terintegrasi di wilayah Dayeuhkolot.
          </p>

          {/* Process Flow */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-b from-white to-[#e5f3f6] shadow-lg rounded-2xl p-4 md:p-8 w-full mb-4 md:mb-6 border border-[#2c869a]/10 flex flex-col items-center justify-center aspect-square transition-transform hover:-translate-y-2 duration-300">
                <Megaphone
                  className="w-10 h-10 md:w-16 md:h-16 text-[#2c869a] mb-3 md:mb-4"
                  strokeWidth={1.5}
                />
                <p className="text-center text-xs md:text-[15px] font-medium text-[#0f374c] leading-snug">
                  Pelaporan oleh Warga
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-b from-white to-[#e5f3f6] shadow-lg rounded-2xl p-4 md:p-8 w-full mb-4 md:mb-6 border border-[#2c869a]/10 flex flex-col items-center justify-center aspect-square transition-transform hover:-translate-y-2 duration-300">
                <FileSpreadsheet
                  className="w-10 h-10 md:w-16 md:h-16 text-[#2c869a] mb-3 md:mb-4"
                  strokeWidth={1.5}
                />
                <p className="text-center text-xs md:text-[15px] font-medium text-[#0f374c] leading-snug">
                  Input Data
                  <br />
                  oleh Perangkat Desa
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-b from-white to-[#e5f3f6] shadow-lg rounded-2xl p-4 md:p-8 w-full mb-4 md:mb-6 border border-[#2c869a]/10 flex flex-col items-center justify-center aspect-square transition-transform hover:-translate-y-2 duration-300">
                <CheckCircle2
                  className="w-10 h-10 md:w-16 md:h-16 text-[#2c869a] mb-3 md:mb-4"
                  strokeWidth={1.5}
                />
                <p className="text-center text-xs md:text-[15px] font-medium text-[#0f374c] leading-snug">
                  Verifikasi &<br />
                  Notifikasi Sistem
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-b from-white to-[#e5f3f6] shadow-lg rounded-2xl p-4 md:p-8 w-full mb-4 md:mb-6 border border-[#2c869a]/10 flex flex-col items-center justify-center aspect-square transition-transform hover:-translate-y-2 duration-300">
                <Users
                  className="w-10 h-10 md:w-16 md:h-16 text-[#2c869a] mb-3 md:mb-4"
                  strokeWidth={1.5}
                />
                <p className="text-center text-xs md:text-[15px] font-medium text-[#0f374c] leading-snug">
                  Aksi Relawan
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center col-span-2 sm:col-span-1 max-w-[50%] sm:max-w-none mx-auto sm:mx-0">
              <div className="bg-gradient-to-b from-white to-[#e5f3f6] shadow-lg rounded-2xl p-4 md:p-8 w-full mb-4 md:mb-6 border border-[#2c869a]/10 flex flex-col items-center justify-center aspect-square transition-transform hover:-translate-y-2 duration-300">
                <RefreshCw
                  className="w-10 h-10 md:w-16 md:h-16 text-[#2c869a] mb-3 md:mb-4"
                  strokeWidth={1.5}
                />
                <p className="text-center text-xs md:text-[15px] font-medium text-[#0f374c] leading-snug">
                  Update Status
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LAPORAN Section */}
      <section
        id="laporan"
        className="w-full py-12 md:py-24 lg:py-[120px] px-4 md:px-12 bg-[#fafafa]"
      >
        <div className="max-w-[1336px] mx-auto">
          {/* Title */}
          <div className="text-center mb-8 md:mb-[60px]">
            <h2 className="text-2xl md:text-[40px] font-bold text-[#0f374c] mb-2">Laporan</h2>
            <div className="h-1 w-[80px] bg-[#2c869a] mx-auto"></div>
          </div>

          <p className="text-center text-gray-600 text-sm md:text-[18px] max-w-3xl mx-auto mb-8 md:mb-16 font-light">
            Kami menyediakan data terbuka yang dapat dipantau publik untuk memastikan setiap bantuan
            tersalurkan dengan tepat sasaran dan akuntabel.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-[30px] mb-8 md:mb-16">
            <div className="bg-white rounded-2xl md:rounded-[20px] p-4 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 text-center hover:shadow-[0px_8px_30px_rgba(44,134,154,0.15)] transition-all">
              <div className="w-14 h-14 md:w-[80px] md:h-[80px] bg-[#e5f3f6] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-6">
                <FileText className="w-7 h-7 md:w-10 md:h-10 text-[#2c869a]" />
              </div>
              <p className="text-2xl md:text-[40px] font-bold text-[#0f374c] mb-1 md:mb-2 leading-none">
                342
              </p>
              <h4 className="text-sm md:text-[18px] font-semibold text-[#0f374c] mb-1 md:mb-3">
                Pelaporan Warga
              </h4>
              <p className="text-xs md:text-[14px] text-gray-500 font-light hidden sm:block">
                Warga menyampaikan laporan banjir melalui RT/RW.
              </p>
            </div>

            <div className="bg-white rounded-2xl md:rounded-[20px] p-4 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 text-center hover:shadow-[0px_8px_30px_rgba(44,134,154,0.15)] transition-all">
              <div className="w-14 h-14 md:w-[80px] md:h-[80px] bg-[#e5f3f6] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-6">
                <Clock className="w-7 h-7 md:w-10 md:h-10 text-[#2c869a]" />
              </div>
              <p className="text-2xl md:text-[40px] font-bold text-[#0f374c] mb-1 md:mb-2 leading-none">
                16
              </p>
              <h4 className="text-sm md:text-[18px] font-semibold text-[#0f374c] mb-1 md:mb-3">
                Input Dashboard
              </h4>
              <p className="text-xs md:text-[14px] text-gray-500 font-light hidden sm:block">
                Perangkat desa mencatat laporan ke sistem.
              </p>
            </div>

            <div className="bg-white rounded-2xl md:rounded-[20px] p-4 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 text-center hover:shadow-[0px_8px_30px_rgba(44,134,154,0.15)] transition-all">
              <div className="w-14 h-14 md:w-[80px] md:h-[80px] bg-[#e5f3f6] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-6">
                <ShieldCheck className="w-7 h-7 md:w-10 md:h-10 text-[#2c869a]" />
              </div>
              <p className="text-2xl md:text-[40px] font-bold text-[#0f374c] mb-1 md:mb-2 leading-none">
                124
              </p>
              <h4 className="text-sm md:text-[18px] font-semibold text-[#0f374c] mb-1 md:mb-3">
                Verifikasi & Notifikasi
              </h4>
              <p className="text-xs md:text-[14px] text-gray-500 font-light hidden sm:block">
                Admin memvalidasi dan sistem mengirim notifikasi relawan.
              </p>
            </div>

            <div className="bg-white rounded-2xl md:rounded-[20px] p-4 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 text-center hover:shadow-[0px_8px_30px_rgba(44,134,154,0.15)] transition-all">
              <div className="w-14 h-14 md:w-[80px] md:h-[80px] bg-[#e5f3f6] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-6">
                <Users className="w-7 h-7 md:w-10 md:h-10 text-[#2c869a]" />
              </div>
              <p className="text-2xl md:text-[40px] font-bold text-[#0f374c] mb-1 md:mb-2 leading-none">
                87
              </p>
              <h4 className="text-sm md:text-[18px] font-semibold text-[#0f374c] mb-1 md:mb-3">
                Aksi Relawan
              </h4>
              <p className="text-xs md:text-[14px] text-gray-500 font-light hidden sm:block">
                Relawan memilih bentuk bantuan sesuai kebutuhan.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-transparent via-[#7cc2d1]/30 to-transparent p-4 md:p-6 mb-8 md:mb-16 text-center max-w-2xl mx-auto rounded-2xl">
            <span className="text-sm md:text-[16px] font-semibold text-[#0f374c] mr-2">
              Data terakhir diperbaharui:
            </span>
            <span className="text-sm md:text-[16px] text-[#2c869a] font-medium">{lastUpdated}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-[40px]">
            {/* Table */}
            <div className="lg:col-span-2">
              <h4 className="text-lg md:text-[24px] font-bold text-[#0f374c] mb-4 md:mb-6">
                Tracking Laporan Secara Publik
              </h4>

              <div className="flex gap-3 mb-4 md:mb-6 relative">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari ID laporan atau lokasi"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 py-2.5 md:py-3 pl-12 pr-4 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2c869a] text-sm md:text-base"
                  />
                </div>
                <button
                  className="bg-[#0f374c] text-white px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-medium hover:bg-[#0a2636] transition shadow-md text-sm md:text-base"
                  onClick={() => {}} // Search is already dynamic via state
                >
                  Cari
                </button>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {/* Mobile card view */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <div key={report.id} className="p-4 hover:bg-gray-50 transition">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[#0f374c] text-sm">
                            {report.displayId}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              report.status === "Menunggu"
                                ? "bg-yellow-100 text-yellow-700"
                                : report.status === "Diverifikasi"
                                  ? "bg-blue-100 text-blue-700"
                                  : report.status === "Diproses"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{report.lokasi}</p>
                        <p className="text-xs text-gray-400 mt-1">{report.updateTerakhir}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-400">
                      {searchQuery ? "Laporan tidak ditemukan" : "Belum ada laporan"}
                    </div>
                  )}
                </div>

                {/* Desktop table view */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-4 gap-4 p-5 bg-[#f8fbfa] border-b border-gray-200 font-semibold text-[15px] text-[#0f374c]">
                    <div>ID Laporan</div>
                    <div>Lokasi</div>
                    <div>Status</div>
                    <div>Update Terakhir</div>
                  </div>

                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <div
                        key={report.id}
                        className="grid grid-cols-4 gap-4 p-5 border-b border-gray-100 text-[15px] items-center text-gray-600 hover:bg-gray-50 transition"
                      >
                        <div className="font-medium text-[#0f374c]">{report.displayId}</div>
                        <div>{report.lokasi}</div>
                        <div>
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                              report.status === "Menunggu"
                                ? "bg-yellow-100 text-yellow-700"
                                : report.status === "Diverifikasi"
                                  ? "bg-blue-100 text-blue-700"
                                  : report.status === "Diproses"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {report.status}
                          </span>
                        </div>
                        <div className="text-[13px]">{report.updateTerakhir}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-400">
                      {searchQuery ? "Laporan tidak ditemukan" : "Belum ada laporan"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Log */}
            <div>
              <h4 className="text-lg md:text-[24px] font-bold text-[#0f374c] mb-4 md:mb-6">
                Log Aktivitas
              </h4>
              <div className="bg-[#f8fbfa] rounded-2xl p-4 md:p-6 border border-gray-100 space-y-4 md:space-y-6">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 md:gap-4">
                      <div className="w-[45px] shrink-0 font-semibold text-[#0f374c] text-sm md:text-[15px]">
                        {activity.time}
                      </div>
                      <div className="text-sm md:text-[15px] text-gray-600 leading-snug flex-1">
                        {activity.action}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-sm">Belum ada aktivitas</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-[80px] pt-8 md:pt-[60px] border-t border-gray-200">
            <h4 className="text-lg md:text-[24px] font-bold text-[#0f374c] mb-3">
              Komitmen Transparansi
            </h4>
            <p className="text-gray-600 text-sm md:text-[16px] mb-6 md:mb-8 max-w-2xl font-light">
              SaGentong berkomitmen untuk menyediakan informasi yang terbuka, akurat, dan dapat
              dipantau publik demi memastikan bantuan tersalurkan secara.
            </p>
            <div className="flex flex-wrap items-center gap-6 md:gap-10 opacity-70">
              <Image
                src="/images/innovillage.png"
                alt="Innovillage Logo"
                width={140}
                height={48}
                className="h-12 w-auto object-contain"
              />
              <Image
                src="/images/telu.png"
                alt="Telkom University Logo"
                width={140}
                height={48}
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* KONTAK Section */}
      <section id="kontak" className="w-full py-12 md:py-20 px-4 md:px-12 bg-[#7cc2d1]">
        <div className="max-w-[1336px] mx-auto text-center text-white">
          <h2 className="text-2xl md:text-[36px] font-bold mb-8 md:mb-16 capitalize">kontak</h2>

          <div className="flex items-center justify-center gap-6 md:gap-10">
            <div>
              <p className="text-base md:text-[20px] font-semibold mb-1 md:mb-2 capitalize">
                admin SaGentong
              </p>
              <Link
                href="https://wa.me/628111030580"
                target="_blank"
                className="text-[#e5f3f6] hover:text-white transition"
              >
                <p className="text-base md:text-[20px] font-light">+628111030580</p>
              </Link>
            </div>
          </div>

          <div className="flex justify-center gap-4 md:gap-8 mb-8 md:mb-16 mt-6">
            <div className="w-10 h-10 md:w-[42px] md:h-[42px] rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer">
              <Instagram className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="w-10 h-10 md:w-[42px] md:h-[42px] rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer">
              <Facebook className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="w-10 h-10 md:w-[42px] md:h-[42px] rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer">
              <Youtube className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="w-10 h-10 md:w-[42px] md:h-[42px] rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer">
              <FaTiktok className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <p className="text-[15px] font-light opacity-80">
              Website Sagentong © 2026, All Right Reserved.
              <br />
              <Link
                href="https://nwl.works"
                target="_blank"
                className="text-white hover:text-gray-200 transition"
              >
                Engineered by Nusantara Wing Labs
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
