"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

const themePromptSchema = z.object({
  businessType: z.string().min(2),
  tone: z.string().min(2),
});

export async function generateThemeJsonAction(formData: FormData) {
  const payload = {
    businessType: String(formData.get("businessType") ?? "general"),
    tone: String(formData.get("tone") ?? "moderno"),
  };

  const parsed = themePromptSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  const base = {
    ferreteria: { primary: "#1e293b", accent: "#f59e0b", surface: "#f8fafc" },
    moda: { primary: "#6d28d9", accent: "#ec4899", surface: "#faf5ff" },
    tech: { primary: "#0f172a", accent: "#22c55e", surface: "#f8fafc" },
  };

  const key = parsed.data.businessType.toLowerCase();
  const selected =
    key.includes("ferre") ? base.ferreteria : key.includes("moda") ? base.moda : base.tech;

  const themeJson = {
    ...selected,
    tone: parsed.data.tone,
    generatedAt: new Date().toISOString(),
  };

  console.log("[AI theme preview]", themeJson);
}

export async function generatePreviewProductsAction(formData: FormData) {
  const categoryName = String(formData.get("category") ?? "General");

  const preview = [
    {
      name: `${categoryName} Pro 1`,
      description: "Producto sugerido por IA en modo preview",
      price: 19999,
      stock: 10,
      images: ["https://placehold.co/800x600"],
      attributes: { origen: "IA-preview" },
      flags: { preview: true },
    },
    {
      name: `${categoryName} Pro 2`,
      description: "Producto sugerido por IA en modo preview",
      price: 29999,
      stock: 8,
      images: ["https://placehold.co/800x600"],
      attributes: { origen: "IA-preview" },
      flags: { preview: true },
    },
  ];

  console.log("[AI products preview]", preview);
}

export async function chatbotAction(formData: FormData) {
  const question = String(formData.get("question") ?? "");
  if (!question.trim()) {
    return;
  }

  const business = await prisma.business.findFirst();

  const answer = `Asistente: ${business?.name ?? "Negocio"} responde a: "${question}". Horario sugerido: 09:00 a 18:00. Contacto WhatsApp: ${business?.whatsappNumber ?? "sin configurar"}.`;
  console.log("[Chatbot]", answer);
}

