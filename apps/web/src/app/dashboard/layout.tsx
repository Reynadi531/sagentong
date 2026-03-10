import React from "react";
import { auth } from "@sagentong/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Common verification check for all roles that require it
  if (!session.user.emailVerified) {
    redirect("/verify-email?error=unverified");
  }

  // Specific check for perangkat_desa admin verification
  // But we must allow access to /dashboard/pending itself
  // To avoid complex path parsing in RSC layout, we can let the subpages handle their specific redirects
  // OR we can do a partial check here.
  // Actually, if we put email check here, it covers all subpages.
  // The admin verification (verified property) is already handled in page.tsx and riwayat/page.tsx etc.
  // Let's keep email verification here as it's a hard requirement for all dashboard access.

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F7F6]">
      {/* Sidebar - Fixes to the left */}
      <Sidebar roles={session.user.role as any} session={session} />

      {/* Main Content Area - Takes up remaining space and scrolls */}
      <main className="flex-1 overflow-y-auto p-4 py-6">{children}</main>
    </div>
  );
}
