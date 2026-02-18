import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/logger", () => ({
  logServerError: vi.fn(),
}));

import { revalidatePath } from "next/cache";

import { createOrderAction } from "@/app/actions/order-actions";
import { logServerError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

function buildBaseFormData() {
  const formData = new FormData();
  formData.set("customerName", "Cliente Test");
  formData.set("phone", "1122334455");
  formData.set("address", "Calle 1234");
  formData.set("notes", "Sin cebolla");
  return formData;
}

describe("createOrderAction", () => {
  const prismaMock = prisma as unknown as { $transaction: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve error cuando items no es JSON válido", async () => {
    const formData = buildBaseFormData();
    formData.set("items", "{invalid-json");

    const result = await createOrderAction(formData);

    expect(result.error).toBe("Formato de carrito inválido.");
    expect(result.whatsappUrl).toBe("");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("devuelve error cuando el payload del checkout no valida", async () => {
    const formData = new FormData();
    formData.set("customerName", "A");
    formData.set("phone", "123");
    formData.set("address", "123");
    formData.set("items", "[]");

    const result = await createOrderAction(formData);

    expect(result.error).toBe("Datos de checkout inválidos.");
    expect(result.whatsappUrl).toBe("");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("loggea y devuelve error de negocio cuando falla la transacción", async () => {
    const formData = buildBaseFormData();
    formData.set("items", JSON.stringify([{ productId: "prod-1", quantity: 2 }]));
    prismaMock.$transaction.mockRejectedValueOnce(new Error("Stock insuficiente para Martillo"));

    const result = await createOrderAction(formData);

    expect(result.error).toBe("Stock insuficiente para Martillo");
    expect(result.whatsappUrl).toBe("");
    expect(logServerError).toHaveBeenCalledTimes(1);
  });

  it("devuelve URL de WhatsApp cuando el pedido se crea correctamente", async () => {
    const formData = buildBaseFormData();
    formData.set("items", JSON.stringify([{ productId: "prod-1", quantity: 1 }]));

    prismaMock.$transaction.mockResolvedValueOnce({
      order: { id: "ord-1" },
      detailedItems: [{ productName: "Martillo", quantity: 1, subtotal: 1000 }],
      total: 1000,
      phone: "5491112345678",
    });

    const result = await createOrderAction(formData);

    expect(result.orderId).toBe("ord-1");
    expect(result.whatsappUrl).toContain("https://wa.me/5491112345678?text=");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/pedidos");
  });
});

