import Link from "next/link";
import type { Category, Product } from "@prisma/client";

import { AddToCartButton } from "@/components/public/add-to-cart-button";
import { currency } from "@/lib/utils";

type ProductWithCategory = Product & {
  category: Category | null;
};

type Props = {
  products: ProductWithCategory[];
};

export function ProductGrid({ products }: Props) {
  if (!products.length) {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">
        No hay productos activos para mostrar.
      </div>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article key={product.id} className="space-y-3 rounded-xl border bg-white p-4">
          <p className="text-xs text-slate-500">{product.category?.name ?? "Sin categoría"}</p>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-slate-600">{product.description ?? "Sin descripción"}</p>
          <p className="text-sm font-medium">{currency(Number(product.price))}</p>

          <div className="flex items-center gap-2">
            <Link className="rounded-md border px-3 py-2 text-sm" href={`/producto/${product.id}`}>
              Ver detalle
            </Link>
            <AddToCartButton productId={product.id} name={product.name} price={Number(product.price)} />
          </div>
        </article>
      ))}
    </section>
  );
}

