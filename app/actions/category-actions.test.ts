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
    category: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { revalidatePath } from "next/cache";

import { createCategoryAction } from "@/app/actions/category-actions";
import { prisma } from "@/lib/prisma";

function buildCategoryFormData() {
  const formData = new FormData();
  formData.set("name", "Categoría Test");
  formData.set("description", "Desc");
  formData.set("isActive", "on");
  return formData;
}

describe("createCategoryAction", () => {
  const prismaCategoryMock = (prisma as unknown as { category: { create: ReturnType<typeof vi.fn> } }).category;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirige con error cuando payload inválido", async () => {
    const formData = new FormData();
    formData.set("name", "A");

    await expect(createCategoryAction(formData)).rejects.toThrow(
      "REDIRECT:/admin/categorias?error=Datos%20de%20categor%C3%ADa%20inv%C3%A1lidos",
    );
  });

  it("crea categoría, revalida y redirige ok", async () => {
    prismaCategoryMock.create.mockResolvedValueOnce({ id: "cat-1" });

    await expect(createCategoryAction(buildCategoryFormData())).rejects.toThrow("REDIRECT:/admin/categorias?ok=1");
    expect(prismaCategoryMock.create).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/categorias");
  });
});

