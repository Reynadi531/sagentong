import { auth } from "@sagentong/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // perangkat_desa must be verified to see settings (standard flow)
  if (session.user.role === "perangkat_desa" && !session.user.verified) {
    redirect("/dashboard/pending");
  }

  return <SettingsClient user={session.user} />;
}
