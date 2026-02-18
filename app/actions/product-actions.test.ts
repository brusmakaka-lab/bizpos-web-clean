import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { revalidatePath } from "next/cache";

import { createProductAction } from "@/app/actions/product-actions";
import { prisma } from "@/lib/prisma";

function buildProductFormData() {
  const formData = new FormData();
  formData.set("name", "Producto Test");
  formData.set("description", "Desc");
  formData.set("price", "1000");
  formData.set("stock", "5");
  formData.set("isActive", "on");
  formData.set("imagesJson", "[]");
  formData.set("attributesJson", "{}");
  formData.set("flagsJson", "{}");
  return formData;
}

describe("createProductAction", () => {
  const prismaProductMock = (prisma as unknown as { product: { create: ReturnType<typeof vi.fn> } }).product;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirige con error cuando payload es inválido", async () => {
    const formData = new FormData();
    formData.set("name", "A");
    formData.set("price", "-1");

    await expect(createProductAction(formData)).rejects.toThrow(
      "REDIRECT:/admin/productos?error=Datos%20de%20producto%20inv%C3%A1lidos",
    );
  });

  it("crea producto, revalida y redirige ok", async () => {
    prismaProductMock.create.mockResolvedValueOnce({ id: "prod-1" });

    await expect(createProductAction(buildProductFormData())).rejects.toThrow("REDIRECT:/admin/productos?ok=1");
    expect(prismaProductMock.create).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/productos");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});

