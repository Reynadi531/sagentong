import { auth } from "@sagentong/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "perangkat_desa" && !session.user.verified) {
    redirect("/dashboard/pending");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar roles={session.user.role} session={session} />
    </div>
  );
}
