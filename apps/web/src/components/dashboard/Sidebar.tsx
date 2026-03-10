"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart2,
  MousePointerClick,
  History,
  Settings,
  Menu,
  ShieldUser,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { auth } from "@sagentong/auth";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Statistik Laporan",
    href: "/dashboard/statistik",
    icon: BarChart2,
  },
  {
    title: "Input Kebutuhan Warga",
    href: "/dashboard/input-kebutuhan",
    icon: MousePointerClick,
  },
  {
    title: "Riwayat Laporan",
    href: "/dashboard/riwayat",
    icon: History,
  },
  {
    title: "Daftar Bantuan",
    href: "/dashboard/bantuan",
    icon: Package,
  },
  {
    title: "Verifikasi Perangkat Desa",
    href: "/dashboard/verifikasi",
    icon: ShieldUser,
  },
];

interface SidebarContentIProps {
  roles: "superadmin" | "relawan" | "perangkat_desa";
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
}

const exludedNavItemsForRoles: Record<"superadmin" | "relawan" | "perangkat_desa", string[]> = {
  superadmin: [],
  relawan: ["/dashboard/verifikasi", "/dashboard/input-kebutuhan", "/dashboard/bantuan"],
  perangkat_desa: ["/dashboard/verifikasi"],
};

const SidebarContent: React.FC<SidebarContentIProps> = ({ roles, session }) => {
  const pathname = usePathname();
  const isUnverifiedPerangkatDesa = roles === "perangkat_desa" && !session?.user.verified;

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex w-full items-center px-6 py-8">
        <Image
          src="/assets/logos/logo_sagentong_horizontal.png"
          alt="SaGentong Logo"
          width={180}
          height={60}
          className="h-auto w-auto object-contain"
          priority
        />
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => {
          // Skip nav items based on user role
          if (exludedNavItemsForRoles[roles].includes(item.href)) {
            return null;
          }

          // If unverified perangkat_desa, hide all except Dashboard
          if (isUnverifiedPerangkatDesa && item.href !== "/dashboard") {
            return null;
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                isActive
                  ? "bg-[#DDEBEE] text-[#247D8B]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon
                className={cn("size-6", isActive ? "text-[#247D8B]" : "text-gray-400")}
                strokeWidth={2.5}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
            <Image
              src={session?.user.image || "/assets/logos/sagentong.svg"}
              alt="User Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold text-gray-900">
              {session?.user.name}
            </span>
            <span className="truncate text-xs text-gray-500">
              {session?.user.role === "perangkat_desa"
                ? "Perangkat Desa"
                : session?.user.role === "relawan"
                  ? "Relawan"
                  : "Super Admin"}
            </span>
          </div>
          <button className="shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="size-6 text-[#247D8B]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const MobileSidebar: React.FC<SidebarContentIProps> = ({ roles, session }) => {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="icon" className="md:hidden" />}>
        <Menu className="size-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 border-r-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SidebarContent roles={roles} session={session} />
      </SheetContent>
    </Sheet>
  );
};

const Sidebar: React.FC<SidebarContentIProps> = ({ roles, session }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden min-h-screen w-[278px] shrink-0 border-r bg-white drop-shadow-sm md:block">
        <SidebarContent roles={roles} session={session} />
      </aside>
    </>
  );
};

export default Sidebar;
