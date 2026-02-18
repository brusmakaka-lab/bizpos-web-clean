"use client";

import { useMemo, useState } from "react";

import { createOrderAction } from "@/app/actions/order-actions";
import { currency } from "@/lib/utils";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export function CartCheckoutForm() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("cart");
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  });

  const [resultUrl, setResultUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems],
  );

  const removeItem = (id: string) => {
    const next = cartItems.filter((item) => item.productId !== id);
    setCartItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    try {
      formData.set(
        "items",
        JSON.stringify(
          cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        ),
      );

      const result = await createOrderAction(formData);
      if (result.error) {
        setResultUrl("");
        setError(result.error);
        return;
      }

      if (result.whatsappUrl) {
        localStorage.removeItem("cart");
        setCartItems([]);
        setResultUrl(result.whatsappUrl ?? "");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Tu carrito</h2>
        {cartItems.length === 0 && (
          <p className="text-sm text-slate-600">No hay productos en carrito.</p>
        )}

        {cartItems.map((item) => (
          <article key={item.productId} className="rounded-md border p-3">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-slate-600">
              {item.quantity} x {currency(item.price)}
            </p>
            <button
              className="mt-2 rounded-md border px-2 py-1 text-xs"
              onClick={() => removeItem(item.productId)}
              type="button"
            >
              Quitar
            </button>
          </article>
        ))}

        <p className="font-semibold">Total: {currency(total)}</p>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Datos de entrega</h2>
        <form action={onSubmit} className="mt-3 space-y-3">
          <input className="w-full rounded-md border p-2" name="customerName" placeholder="Nombre" required />
          <input className="w-full rounded-md border p-2" name="phone" placeholder="Teléfono" required />
          <input className="w-full rounded-md border p-2" name="address" placeholder="Dirección" required />
          <textarea className="w-full rounded-md border p-2" name="notes" placeholder="Notas" rows={3} />
          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            disabled={loading || cartItems.length === 0}
            type="submit"
          >
            {loading ? "Procesando..." : "Enviar pedido por WhatsApp"}
          </button>
        </form>

        {error && <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p>}

        {resultUrl && (
          <a className="mt-4 inline-block rounded-md border px-3 py-2 text-sm" href={resultUrl} target="_blank">
            Abrir WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}

export default CartCheckoutForm;
