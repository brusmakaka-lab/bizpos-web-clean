"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=Credenciales%20inv%C3%A1lidas");
    }
    redirect("/admin/login?error=No%20se%20pudo%20iniciar%20sesi%C3%B3n");
  }

  redirect("/admin/dashboard");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

