import Link from "next/link";

type Props = {
  businessName: string;
};

export function PublicHeader({ businessName }: Props) {
  return (
    <header className="border-b bg-white">
      <div className="container-page flex items-center justify-between py-4">
        <Link className="text-lg font-semibold" href="/">
          {businessName}
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/">
            Catálogo
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/checkout">
            Checkout
          </Link>
          <Link className="rounded-md border px-3 py-2" href="/admin/dashboard">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
