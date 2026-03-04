"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full flex items-center overflow-hidden bg-gray-900 min-h-screen md:min-h-[600px] lg:min-h-[650px]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center md:bg-right"
        style={{ backgroundImage: "url('/images/hero_section.svg')" }}
      />

      {/* Gradient Overlay (lebih gelap di kiri) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-white w-full">
        <div className="max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Sistem Bantuan Darurat
            <br />
            Untuk Korban Banjir
          </h1>

          <p className="text-base sm:text-lg text-gray-200 mb-6">
            Laporan, verifikasi, dan Distribusi Bantuan Untuk Warga Dayeuhkolot
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link
              href="/laporan"
              className="bg-teal-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium hover:bg-teal-700 transition text-sm sm:text-base"
            >
              Laporkan Banjir
            </Link>

            <Link
              href="/relawan"
              className="bg-teal-400 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-white hover:bg-teal-500 transition text-sm sm:text-base"
            >
              Gabung Jadi Relawan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
