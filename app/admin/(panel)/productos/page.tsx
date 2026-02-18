import {
  createProductAction,
  deleteProductAction,
  updateProductStockAction,
} from "@/app/actions/product-actions";
import { prisma } from "@/lib/prisma";
import { currency } from "@/lib/utils";

type AdminProductosPageProps = {
  searchParams?: {
    ok?: string;
    error?: string;
  };
};

export default async function AdminProductosPage({ searchParams }: AdminProductosPageProps) {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } }),
  ]);
  const ok = searchParams?.ok;
  const error = searchParams?.error;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Productos</h1>

      {ok && <p className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">Operación realizada correctamente.</p>}
      {error && <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <form action={createProductAction} className="rounded-xl border bg-white p-4">
        <p className="mb-2 text-sm font-medium">Crear producto</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <input className="rounded-md border p-2" name="name" placeholder="Nombre" required />
          <input className="rounded-md border p-2" name="description" placeholder="Descripción" />
          <select className="rounded-md border p-2" name="categoryId">
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input className="rounded-md border p-2" min="0" name="price" placeholder="Precio" step="0.01" type="number" />
          <input className="rounded-md border p-2" min="0" name="stock" placeholder="Stock" type="number" />
          <label className="flex items-center gap-2 text-sm">
            <input defaultChecked name="isActive" type="checkbox" /> Activo
          </label>
          <textarea className="rounded-md border p-2 lg:col-span-3" name="imagesJson" placeholder='["https://..."]' rows={2} />
          <textarea className="rounded-md border p-2 lg:col-span-3" name="attributesJson" placeholder='{"color":"rojo"}' rows={2} />
          <textarea className="rounded-md border p-2 lg:col-span-3" name="flagsJson" placeholder='{"destacado":true}' rows={2} />
        </div>
        <button className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white" type="submit">
          Guardar
        </button>
      </form>

      <div className="space-y-3">
        {products.map((product) => (
          <article key={product.id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-slate-600">
                  {product.category?.name ?? "Sin categoría"} · {currency(Number(product.price))}
                </p>
              </div>

              <form action={deleteProductAction}>
                <input name="id" type="hidden" value={product.id} />
                <button className="rounded-md border px-3 py-2 text-sm text-red-600" type="submit">
                  Eliminar
                </button>
              </form>
            </div>

            <form action={updateProductStockAction} className="mt-3 flex items-center gap-2">
              <input name="id" type="hidden" value={product.id} />
              <input className="w-28 rounded-md border p-2" defaultValue={product.stock} min="0" name="stock" type="number" />
              <button className="rounded-md border px-3 py-2 text-sm" type="submit">
                Actualizar stock
              </button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}
