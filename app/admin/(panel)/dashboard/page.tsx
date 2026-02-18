import { prisma } from "@/lib/prisma";
import { currency } from "@/lib/utils";

import { StatCard } from "@/components/admin/stat-card";

export default async function AdminDashboardPage() {
  const [products, categories, orders] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.findMany(),
  ]);

  const totalSales = orders.reduce((acc, order) => acc + Number(order.total), 0);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Productos" value={products} />
        <StatCard label="Categorías" value={categories} />
        <StatCard label="Pedidos" value={orders.length} />
        <StatCard label="Ventas" value={currency(totalSales)} />
      </div>
    </section>
  );
}
