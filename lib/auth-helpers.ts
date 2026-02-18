import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    redirect("/admin/login");
  }

  return session;
}
