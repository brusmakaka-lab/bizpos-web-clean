import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {},
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/request-context", () => ({
  getRequestContext: vi.fn(async () => ({ requestId: "req-test", ip: "127.0.0.1" })),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logServerError: vi.fn(),
}));

import { AuthError } from "next-auth";

import { loginAction } from "@/app/actions/auth-actions";
import { signIn } from "@/auth";
import { logServerError } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

function buildLoginFormData() {
  const formData = new FormData();
  formData.set("email", "admin@local.dev");
  formData.set("password", "admin123");
  return formData;
}

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 4, retryAfterMs: 0 });
  });

  it("redirige por rate-limit", async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterMs: 10_000,
    });

    await expect(loginAction(buildLoginFormData())).rejects.toThrow(
      "REDIRECT:/admin/login?error=Demasiados%20intentos.%20Reintent%C3%A1%20en%201%20minuto",
    );
    expect(signIn).not.toHaveBeenCalled();
  });

  it("redirige a dashboard cuando signIn es exitoso", async () => {
    vi.mocked(signIn).mockResolvedValueOnce(undefined as never);

    await expect(loginAction(buildLoginFormData())).rejects.toThrow("REDIRECT:/admin/dashboard");
  });

  it("redirige con error de credenciales cuando signIn lanza AuthError", async () => {
    vi.mocked(signIn).mockRejectedValueOnce(new AuthError("CredentialsSignin"));

    await expect(loginAction(buildLoginFormData())).rejects.toThrow(
      "REDIRECT:/admin/login?error=Credenciales%20inv%C3%A1lidas",
    );
  });

  it("loggea y redirige error genérico", async () => {
    vi.mocked(signIn).mockRejectedValueOnce(new Error("Fallo inesperado"));

    await expect(loginAction(buildLoginFormData())).rejects.toThrow(
      "REDIRECT:/admin/login?error=No%20se%20pudo%20iniciar%20sesi%C3%B3n",
    );

    expect(logServerError).toHaveBeenCalledTimes(1);
  });
});

