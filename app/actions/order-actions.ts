"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";

import { logServerError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { getRequestContext } from "@/lib/request-context";
import { checkRateLimit } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validations";

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type OrderActionResult = {
  orderId?: string;
  whatsappUrl: string;
  error?: string;
};

function buildWhatsAppMessage(params: {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  items: Array<{ name: string; quantity: number; subtotal: number }>;
  total: number;
}) {
  const lines = [
    `🧾 Pedido #${params.orderId}`,
    `👤 Cliente: ${params.customerName}`,
    `📞 Tel: ${params.phone}`,
    `📍 Dirección: ${params.address}`,
    "",
    "🛒 Detalle:",
    ...params.items.map((item) => `- ${item.name} x${item.quantity} = $${item.subtotal}`),
    "",
    `💰 Total: $${params.total}`,
    params.notes ? `📝 Notas: ${params.notes}` : "",
  ].filter(Boolean);

  return encodeURIComponent(lines.join("\n"));
}

export async function createOrderAction(formData: FormData): Promise<OrderActionResult> {
  const context = await getRequestContext();

  const rateLimit = checkRateLimit("createOrderAction", context.ip, {
    limit: 8,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return {
      whatsappUrl: "",
      error: "Demasiados intentos de checkout. Reintentá en 1 minuto.",
    };
  }

  const rawItems = String(formData.get("items") ?? "[]");
  let parsedItems: CheckoutItem[] = [];

  try {
    parsedItems = JSON.parse(rawItems) as CheckoutItem[];
  } catch {
    return { whatsappUrl: "", error: "Formato de carrito inválido." };
  }

  const payload = {
    customerName: String(formData.get("customerName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    items: parsedItems,
  };

  const parsed = orderSchema.safeParse(payload);
  if (!parsed.success) {
    return { whatsappUrl: "", error: "Datos de checkout inválidos." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const requestedQuantities = parsed.data.items.reduce(
        (acc, item) => {
          acc.set(item.productId, (acc.get(item.productId) ?? 0) + item.quantity);
          return acc;
        },
        new Map<string, number>(),
      );

      const productIds = Array.from(requestedQuantities.keys());

      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true,
        },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const [productId, quantity] of requestedQuantities.entries()) {
        const product = productMap.get(productId);
        if (!product) {
          throw new Error(`Producto no encontrado o inactivo: ${productId}`);
        }

        const updated = await tx.product.updateMany({
          where: {
            id: productId,
            isActive: true,
            stock: { gte: quantity },
          },
          data: {
            stock: { decrement: quantity },
          },
        });

        if (updated.count === 0) {
          throw new Error(`Stock insuficiente para ${product.name}`);
        }
      }

      const detailedItems = parsed.data.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Producto no encontrado: ${item.productId}`);
        }

        const unitPrice = Number(product.price);
        return {
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      });

      const total = detailedItems.reduce((acc, item) => acc + item.subtotal, 0);

      const order = await tx.order.create({
        data: {
          customerName: parsed.data.customerName,
          phone: parsed.data.phone,
          address: parsed.data.address,
          notes: parsed.data.notes,
          status: OrderStatus.PENDING,
          total,
          items: {
            create: detailedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
          },
        },
      });

      const business = await tx.business.findFirst();
      const phone = business?.whatsappNumber ?? "5491112345678";

      return {
        order,
        detailedItems,
        total,
        phone,
      };
    });

    const encodedText = buildWhatsAppMessage({
      orderId: result.order.id,
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      address: parsed.data.address,
      notes: parsed.data.notes,
      items: result.detailedItems.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      total: result.total,
    });

    revalidatePath("/");
    revalidatePath("/admin/pedidos");

    return {
      orderId: result.order.id,
      whatsappUrl: `https://wa.me/${result.phone}?text=${encodedText}`,
    };
  } catch (error) {
    logServerError("createOrderAction", error, {
      customerName: payload.customerName,
      itemCount: payload.items.length,
      requestId: context.requestId,
      ip: context.ip,
    });

    const message = error instanceof Error ? error.message : "No se pudo crear el pedido.";
    return {
      whatsappUrl: "",
      error: message,
    };
  }
}

export async function updateOrderStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "PENDING") as OrderStatus;

  if (!id) {
    redirect("/admin/pedidos?error=Pedido%20inv%C3%A1lido");
  }

  if (!Object.values(OrderStatus).includes(status)) {
    redirect("/admin/pedidos?error=Estado%20de%20pedido%20inv%C3%A1lido");
  }

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/pedidos");
  redirect("/admin/pedidos?ok=1");
}

