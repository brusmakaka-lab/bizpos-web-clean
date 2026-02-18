import Link from "next/link";
import { notFound } from "next/navigation";

import AddToCartButton from "@/components/public/add-to-cart-button";
import { PublicHeader } from "@/components/public/public-header";
import { prisma } from "@/lib/prisma";
import { currency } from "@/lib/utils";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductoDetallePage({ params }: Props) {
  const { id } = await params;

  const [business, product] = await Promise.all([
    prisma.business.findFirst(),
    prisma.product.findUnique({ where: { id }, include: { category: true } }),
  ]);

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <div>
      <PublicHeader businessName={business?.name ?? "Catálogo"} />
      <main className="container-page">
        <article className="rounded-xl border bg-white p-6">
          <p className="text-sm text-slate-500">{product.category?.name ?? "Sin categoría"}</p>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-slate-700">{product.description ?? "Sin descripción"}</p>
          <p className="mt-4 text-lg font-semibold">{currency(Number(product.price))}</p>
          <p className="text-sm text-slate-500">Stock: {product.stock}</p>

          <div className="mt-4 flex items-center gap-2">
            <AddToCartButton name={product.name} price={Number(product.price)} productId={product.id} />
            <Link className="rounded-md border px-3 py-2 text-sm" href="/checkout">
              Ir al checkout
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
