"use server";

import { revalidatePath } from "next/cache";

import { BUSINESS_SINGLETON_ID, getOrCreateBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import { businessConfigSchema } from "@/lib/validations";

export async function updateBusinessConfigAction(formData: FormData) {
  const payload = {
    name: String(formData.get("name") ?? ""),
    whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
    address: String(formData.get("address") ?? ""),
    themeJson: JSON.parse(String(formData.get("themeJson") ?? "{}")),
    chatbotPrompt: String(formData.get("chatbotPrompt") ?? ""),
  };

  const parsed = businessConfigSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  await getOrCreateBusiness();

  await prisma.business.update({
    where: { id: BUSINESS_SINGLETON_ID },
    data: parsed.data,
  });

  revalidatePath("/");
  revalidatePath("/admin/configuracion");
}

