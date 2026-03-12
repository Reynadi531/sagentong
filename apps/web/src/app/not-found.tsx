import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#F4F7F6] px-6 text-center">
      <p className="font-[family-name:var(--font-poppins)] text-[8rem] leading-none font-bold text-[#2c869a] sm:text-[10rem]">
        404
      </p>

      <h1 className="font-[family-name:var(--font-poppins)] mt-4 text-2xl font-semibold text-[#0f374c] sm:text-3xl">
        Halaman Tidak Ditemukan
      </h1>

      <p className="mt-3 max-w-md text-sm text-[#0f374c]/60 sm:text-base">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>

      <Link
        href={"/" as any}
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-8 rounded-md bg-[#2c869a] px-6 text-sm text-white hover:bg-[#1f5f6e]",
        )}
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
