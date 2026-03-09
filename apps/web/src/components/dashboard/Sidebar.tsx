import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, BarChart2, MousePointerClick, History, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

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
];

const SidebarContent = () => {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center px-6 py-8">
        <Image
          src="/images/Logo_SaGentong.svg"
          alt="SaGentong Logo"
          width={180}
          height={60}
          className="h-auto w-auto object-contain"
          priority
        />
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => {
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
            <Image src="/images/hero_section.svg" alt="User Avatar" fill className="object-cover" />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold text-gray-900">Ahmad Supriyadi</span>
            <span className="truncate text-xs text-gray-500">Perangkat desa</span>
          </div>
          <button className="shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="size-6 text-[#247D8B]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="icon" className="md:hidden" />}>
        <Menu className="size-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 border-r-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
};

const Sidebar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden min-h-screen w-[278px] shrink-0 border-r bg-white drop-shadow-sm md:block">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
