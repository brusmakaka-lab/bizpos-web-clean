import { loginAction } from "@/app/actions/auth-actions";

type AdminLoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const error = searchParams?.error;

  return (
    <main className="container-page flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border bg-white p-6">
        <h1 className="text-xl font-semibold">Ingreso Admin</h1>
        <p className="mt-1 text-sm text-slate-600">Acceso con NextAuth Credentials</p>

        {error && <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p>}

        <form action={loginAction} className="mt-4 space-y-3">
          <input className="w-full rounded-md border p-2" name="email" placeholder="Email" required type="email" />
          <input
            className="w-full rounded-md border p-2"
            name="password"
            placeholder="Contraseña"
            required
            type="password"
          />
          <button className="w-full rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}
