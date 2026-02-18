import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  isActive: z.boolean().default(true),
  images: z.array(z.string().url()).default([]),
  attributes: z.record(z.any()).default({}),
  flags: z.record(z.any()).default({}),
});

export const orderSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(6),
  address: z.string().min(5),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    }),
  ),
});

export const businessConfigSchema = z.object({
  name: z.string().min(2),
  whatsappNumber: z.string().min(8),
  address: z.string().optional(),
  themeJson: z.record(z.any()).default({}),
  chatbotPrompt: z.string().optional(),
});
