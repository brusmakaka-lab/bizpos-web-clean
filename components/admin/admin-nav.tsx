import Link from "next/link";

import { logoutAction } from "@/app/actions/auth-actions";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export function AdminNav() {
  return (
    <aside className="w-full space-y-2 rounded-xl border bg-white p-4 lg:w-64">
      <p className="text-sm font-semibold text-slate-700">Admin Panel</p>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link key={link.href} className="rounded-md px-3 py-2 text-sm hover:bg-slate-100" href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <form action={logoutAction}>
        <button className="mt-3 w-full rounded-md border px-3 py-2 text-sm" type="submit">
          Cerrar sesión
        </button>
      </form>
    </aside>
  );
}
