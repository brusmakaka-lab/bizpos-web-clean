import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/actions/category-actions";
import { prisma } from "@/lib/prisma";

type AdminCategoriasPageProps = {
  searchParams?: {
    ok?: string;
    error?: string;
  };
};

export default async function AdminCategoriasPage({ searchParams }: AdminCategoriasPageProps) {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
  const ok = searchParams?.ok;
  const error = searchParams?.error;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Categorías</h1>

      {ok && <p className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">Operación realizada correctamente.</p>}
      {error && <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <form action={createCategoryAction} className="rounded-xl border bg-white p-4">
        <p className="mb-2 text-sm font-medium">Crear categoría</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <input className="rounded-md border p-2" name="name" placeholder="Nombre" required />
          <input className="rounded-md border p-2" name="description" placeholder="Descripción" />
          <label className="flex items-center gap-2 text-sm">
            <input defaultChecked name="isActive" type="checkbox" /> Activa
          </label>
        </div>
        <button className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white" type="submit">
          Guardar
        </button>
      </form>

      <div className="space-y-3">
        {categories.map((category) => (
          <article key={category.id} className="rounded-xl border bg-white p-4">
            <form action={updateCategoryAction} className="grid gap-2 sm:grid-cols-4">
              <input name="id" type="hidden" value={category.id} />
              <input className="rounded-md border p-2" defaultValue={category.name} name="name" required />
              <input className="rounded-md border p-2" defaultValue={category.description ?? ""} name="description" />
              <label className="flex items-center gap-2 text-sm">
                <input defaultChecked={category.isActive} name="isActive" type="checkbox" /> Activa
              </label>
              <button className="rounded-md border px-3 py-2 text-sm" type="submit">
                Actualizar
              </button>
            </form>

            <form action={deleteCategoryAction} className="mt-2">
              <input name="id" type="hidden" value={category.id} />
              <button className="rounded-md border px-3 py-2 text-sm text-red-600" type="submit">
                Eliminar
              </button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}
