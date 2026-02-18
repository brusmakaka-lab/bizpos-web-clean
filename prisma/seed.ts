import { hash } from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@local.dev";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

  await prisma.business.upsert({
    where: { id: "singleton-business" },
    update: {},
    create: {
      id: "singleton-business",
      name: "Mi Negocio",
      whatsappNumber: "5491112345678",
      address: "Av. Siempre Viva 123",
      themeJson: {
        primary: "#0f172a",
        accent: "#16a34a",
        surface: "#ffffff",
      },
      chatbotPrompt: "Sos un asistente útil para una ferretería local.",
    },
  });

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
  }

  const category = await prisma.category.upsert({
    where: { id: "cat-demo" },
    update: {},
    create: {
      id: "cat-demo",
      name: "Herramientas",
      description: "Categoría demo",
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: { id: "prod-demo" },
    update: {},
    create: {
      id: "prod-demo",
      categoryId: category.id,
      name: "Taladro Percutor",
      description: "Taladro de 650W para uso profesional",
      price: 89999,
      stock: 12,
      isActive: true,
      images: ["https://placehold.co/800x600"],
      attributes: { potencia: "650W", marca: "Demo" },
      flags: { destacado: true },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
