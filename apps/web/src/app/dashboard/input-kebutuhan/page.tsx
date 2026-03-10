import React from "react";
import AddReportForm from "@/components/dashboard/add-report-form";
import { auth } from "@sagentong/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function InputKebutuhanPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login" as any);
  }

  if (session.user.role === "relawan") {
    redirect("/dashboard" as any);
  }

  if (session.user.role === "perangkat_desa" && !session.user.verified) {
    redirect("/dashboard/pending" as any);
  }

  return (
    <div className="py-6 min-h-full">
      <AddReportForm />
    </div>
  );
}
