"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Menu, X } from "lucide-react";

type NavLink = {
  id: string;
  label: string;
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links: NavLink[] = [
    { id: "beranda", label: "Beranda" },
    { id: "tentang", label: "Tentang" },
    { id: "laporan", label: "Laporan" },
    { id: "kontak", label: "Kontak" },
  ];

  const handleScroll = (id: string) => {
    setMobileMenuOpen(false);
    if (pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 63;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.05)] h-[60px] md:h-[70px]">
      <div className="max-w-[1336px] h-full mx-auto flex items-center justify-between px-4 md:px-10 lg:px-12">
        {/* Logo */}
        <div
          className="flex items-center gap-2 md:gap-3 cursor-pointer h-full py-2"
          onClick={() => handleScroll("beranda")}
        >
          <img
            src="/images/Logo_SaGentong.svg"
            alt="SaGentong Logo"
            className="h-full max-h-[40px] md:max-h-[50px] w-auto object-contain"
          />
          <img
            src="/images/Logo_SaGentong 2.svg"
            alt="SaGentong Secondary Logo"
            className="h-full max-h-[40px] md:max-h-[50px] w-auto object-contain"
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center justify-center size-10 rounded-lg text-[#0f374c] hover:bg-gray-100 transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        {/* Desktop Navigation & Login Section */}
        <div className="hidden md:flex items-center gap-8 lg:gap-[45px]">
          <nav className="flex gap-6 lg:gap-10 text-[15px] lg:text-[16px] items-center">
            {links.map(({ id, label }) => {
              const isHome = id === "beranda";
              return (
                <button
                  key={id}
                  onClick={() => handleScroll(id)}
                  className={`transition ${
                    isHome
                      ? "text-[#0f374c] font-bold"
                      : "text-[#5f7586] font-medium hover:text-[#2c869a]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Login / Dashboard Button */}
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="bg-[#2c869a] text-white px-5 lg:px-8 h-[42px] flex items-center justify-center rounded-lg hover:bg-[#1f5f6e] transition font-semibold text-sm lg:text-[16px]"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.push("/");
                      },
                    },
                  });
                }}
                className="bg-red-500 text-white px-5 lg:px-8 h-[42px] flex items-center justify-center rounded-lg hover:bg-red-600 transition font-semibold text-sm lg:text-[16px]"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-[#2c869a] text-white px-6 lg:px-8 h-[42px] flex items-center justify-center rounded-lg hover:bg-[#1f5f6e] transition font-semibold text-sm lg:text-[16px]"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] z-40">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          {/* Menu Panel */}
          <div className="relative bg-white w-full shadow-lg border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col px-6 py-4 gap-1">
              {links.map(({ id, label }) => {
                const isHome = id === "beranda";
                return (
                  <button
                    key={id}
                    onClick={() => handleScroll(id)}
                    className={`text-left py-3 px-4 rounded-xl transition text-[16px] ${
                      isHome
                        ? "text-[#0f374c] font-bold bg-[#e5f3f6]"
                        : "text-[#5f7586] font-medium hover:bg-gray-50 hover:text-[#2c869a]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>

            <div className="px-6 pb-5 pt-2 border-t border-gray-100">
              {session ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/dashboard"
                    className="bg-[#2c869a] text-white h-[44px] flex items-center justify-center rounded-lg hover:bg-[#1f5f6e] transition font-semibold text-[15px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            router.push("/");
                          },
                        },
                      });
                    }}
                    className="bg-red-500 text-white h-[44px] flex items-center justify-center rounded-lg hover:bg-red-600 transition font-semibold text-[15px]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-[#2c869a] text-white h-[44px] flex items-center justify-center rounded-lg hover:bg-[#1f5f6e] transition font-semibold text-[15px] w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
