import { OrderStatus } from "@prisma/client";

import { updateOrderStatusAction } from "@/app/actions/order-actions";
import { prisma } from "@/lib/prisma";
import { currency } from "@/lib/utils";

const statuses = Object.values(OrderStatus);

type AdminPedidosPageProps = {
  searchParams?: {
    ok?: string;
    error?: string;
  };
};

export default async function AdminPedidosPage({ searchParams }: AdminPedidosPageProps) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
  const ok = searchParams?.ok;
  const error = searchParams?.error;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Pedidos</h1>

      {ok && <p className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">Operación realizada correctamente.</p>}
      {error && <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      {orders.map((order) => (
        <article key={order.id} className="rounded-xl border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold">Pedido {order.id}</h3>
              <p className="text-sm text-slate-600">
                {order.customerName} · {order.phone} · {currency(Number(order.total))}
              </p>
            </div>

            <form action={updateOrderStatusAction} className="flex items-center gap-2">
              <input name="id" type="hidden" value={order.id} />
              <select className="rounded-md border p-2" defaultValue={order.status} name="status">
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button className="rounded-md border px-3 py-2 text-sm" type="submit">
                Actualizar
              </button>
            </form>
          </div>

          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.product.name} x{item.quantity} = {currency(Number(item.subtotal))}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
