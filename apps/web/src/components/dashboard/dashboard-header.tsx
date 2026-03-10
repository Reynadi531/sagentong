"use client";

import React from "react";
import { MobileSidebar } from "@/components/dashboard/Sidebar";
import { auth } from "@sagentong/auth";

interface DashboardHeaderProps {
  roles: "superadmin" | "relawan" | "perangkat_desa";
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
}

export default function DashboardHeader({ roles, session }: DashboardHeaderProps) {
  return (
    <header className="flex h-[56px] lg:h-[70px] w-full items-center justify-between border-b border-gray-100 bg-white px-4 md:px-6 lg:px-8 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar trigger */}
        <MobileSidebar roles={roles} session={session} />
        <h1 className="text-base md:text-xl font-bold text-[#0f374c] truncate">Dashboard</h1>
      </div>
    </header>
  );
}
