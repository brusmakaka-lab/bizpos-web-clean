import { prisma } from "@/lib/prisma";

export const BUSINESS_SINGLETON_ID = "singleton-business";

export async function getOrCreateBusiness() {
  const business = await prisma.business.upsert({
    where: { id: BUSINESS_SINGLETON_ID },
    update: {},
    create: {
      id: BUSINESS_SINGLETON_ID,
      name: "Mi Negocio",
      whatsappNumber: "5491112345678",
      address: "",
      themeJson: {
        primary: "#0f172a",
        accent: "#16a34a",
      },
    },
  });

  return business;
}
