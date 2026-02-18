"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { getRequestContext } from "@/lib/request-context";
import { logServerError } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const context = await getRequestContext();

  const rateLimit = checkRateLimit("loginAction", `${context.ip}:${email}`, {
    limit: 5,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    redirect("/admin/login?error=Demasiados%20intentos.%20Reintent%C3%A1%20en%201%20minuto");
  }

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

    logServerError("loginAction", error, {
      email,
      requestId: context.requestId,
      ip: context.ip,
    });
    redirect("/admin/login?error=No%20se%20pudo%20iniciar%20sesi%C3%B3n");
  }

  redirect("/admin/dashboard");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

