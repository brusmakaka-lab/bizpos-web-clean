"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { safeJsonParse } from "@/lib/utils";
import { productSchema } from "@/lib/validations";

function parseNumberInput(value: FormDataEntryValue | null, fallback = 0) {
  if (value == null) return fallback;
  const normalized = String(value).trim().replace(",", ".");
  if (!normalized) return fallback;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function createProductAction(formData: FormData) {
  const payload = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    categoryId: String(formData.get("categoryId") ?? "") || undefined,
    price: parseNumberInput(formData.get("price"), 0),
    stock: parseNumberInput(formData.get("stock"), 0),
    isActive: formData.get("isActive") === "on",
    images: String(formData.get("imagesJson") ?? "[]"),
    attributes: String(formData.get("attributesJson") ?? "{}"),
    flags: String(formData.get("flagsJson") ?? "{}"),
  };

  const parsed = productSchema.safeParse({
    ...payload,
    images: safeJsonParse(payload.images, []),
    attributes: safeJsonParse(payload.attributes, {}),
    flags: safeJsonParse(payload.flags, {}),
  });

  if (!parsed.success) {
    redirect("/admin/productos?error=Datos%20de%20producto%20inv%C3%A1lidos");
  }

  await prisma.product.create({
    data: {
      ...parsed.data,
      price: parsed.data.price,
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/productos?ok=1");
}

export async function updateProductStockAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const stock = Number(formData.get("stock") ?? 0);
  if (!id || !Number.isFinite(stock) || stock < 0) {
    redirect("/admin/productos?error=Stock%20inv%C3%A1lido");
  }

  await prisma.product.update({ where: { id }, data: { stock } });
  revalidatePath("/admin/productos");
  redirect("/admin/productos?ok=1");
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/admin/productos?error=Producto%20inv%C3%A1lido");
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/productos?ok=1");
}

