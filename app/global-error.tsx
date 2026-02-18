"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <main className="mx-auto max-w-xl rounded-xl border bg-white p-6">
          <h1 className="text-xl font-semibold">Ocurrió un error inesperado</h1>
          <p className="mt-2 text-sm text-slate-600">
            El error fue registrado para su análisis. Podés reintentar la operación.
          </p>
          <button className="mt-4 rounded-md border px-4 py-2 text-sm" onClick={reset} type="button">
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}

