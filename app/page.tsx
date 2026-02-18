import Link from "next/link";

import { PublicHeader } from "@/components/public/public-header";
import { ProductGrid } from "@/components/public/product-grid";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [business, products] = await Promise.all([
    prisma.business.findFirst(),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
  ]);

  return (
    <div>
      <PublicHeader businessName={business?.name ?? "Catálogo"} />
      <main className="container-page space-y-6">
        <section className="rounded-xl border bg-white p-4">
          <h1 className="text-2xl font-semibold">{business?.name ?? "Mi negocio"}</h1>
          <p className="text-sm text-slate-600">
            Catálogo público + checkout por WhatsApp con Server Actions.
          </p>
          <div className="mt-4 flex gap-3">
            <Link className="rounded-md bg-slate-900 px-4 py-2 text-white" href="/checkout">
              Ir al checkout
            </Link>
            <Link className="rounded-md border px-4 py-2" href="/admin/dashboard">
              Entrar a admin
            </Link>
          </div>
        </section>

        <ProductGrid products={products} />
      </main>
    </div>
  );
}
