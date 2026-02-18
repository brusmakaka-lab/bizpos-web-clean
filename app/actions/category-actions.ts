"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";

export async function createCategoryAction(formData: FormData) {
  const payload = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    isActive: formData.get("isActive") === "on",
  };

  const parsed = categorySchema.safeParse(payload);
  if (!parsed.success) {
    redirect("/admin/categorias?error=Datos%20de%20categor%C3%ADa%20inv%C3%A1lidos");
  }

  await prisma.category.create({ data: parsed.data });
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias?ok=1");
}

export async function updateCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const payload = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    isActive: formData.get("isActive") === "on",
  };

  const parsed = categorySchema.safeParse(payload);
  if (!parsed.success) {
    redirect("/admin/categorias?error=Datos%20de%20categor%C3%ADa%20inv%C3%A1lidos");
  }

  await prisma.category.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias?ok=1");
}

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/admin/categorias?error=Categor%C3%ADa%20inv%C3%A1lida");
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias?ok=1");
}

