import {
  chatbotAction,
  generatePreviewProductsAction,
  generateThemeJsonAction,
} from "@/app/actions/ai-actions";
import { updateBusinessConfigAction } from "@/app/actions/business-actions";
import { getOrCreateBusiness } from "@/lib/business";

export default async function AdminConfiguracionPage() {
  const business = await getOrCreateBusiness();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Configuración</h1>

      <form action={updateBusinessConfigAction} className="rounded-xl border bg-white p-4">
        <p className="mb-2 text-sm font-medium">Datos del negocio</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="rounded-md border p-2" defaultValue={business.name} name="name" placeholder="Nombre" />
          <input
            className="rounded-md border p-2"
            defaultValue={business.whatsappNumber}
            name="whatsappNumber"
            placeholder="WhatsApp"
          />
          <input className="rounded-md border p-2 sm:col-span-2" defaultValue={business.address ?? ""} name="address" placeholder="Dirección" />
          <textarea
            className="rounded-md border p-2 sm:col-span-2"
            defaultValue={JSON.stringify(business.themeJson ?? {}, null, 2)}
            name="themeJson"
            rows={4}
          />
          <textarea
            className="rounded-md border p-2 sm:col-span-2"
            defaultValue={business.chatbotPrompt ?? ""}
            name="chatbotPrompt"
            placeholder="Prompt de chatbot"
            rows={3}
          />
        </div>
        <button className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white" type="submit">
          Guardar configuración
        </button>
      </form>

      <div className="grid gap-4 lg:grid-cols-3">
        <form action={generateThemeJsonAction} className="rounded-xl border bg-white p-4">
          <p className="mb-2 text-sm font-medium">IA: generar themeJson (preview)</p>
          <input className="mb-2 w-full rounded-md border p-2" name="businessType" placeholder="ferreteria" />
          <input className="mb-2 w-full rounded-md border p-2" name="tone" placeholder="moderno" />
          <button className="rounded-md border px-3 py-2 text-sm" type="submit">
            Generar
          </button>
        </form>

        <form action={generatePreviewProductsAction} className="rounded-xl border bg-white p-4">
          <p className="mb-2 text-sm font-medium">IA: productos preview</p>
          <input className="mb-2 w-full rounded-md border p-2" name="category" placeholder="Herramientas" />
          <button className="rounded-md border px-3 py-2 text-sm" type="submit">
            Generar
          </button>
        </form>

        <form action={chatbotAction} className="rounded-xl border bg-white p-4">
          <p className="mb-2 text-sm font-medium">Chatbot (Server Action)</p>
          <input className="mb-2 w-full rounded-md border p-2" name="question" placeholder="¿Qué me recomendás?" />
          <button className="rounded-md border px-3 py-2 text-sm" type="submit">
            Consultar
          </button>
        </form>
      </div>
    </section>
  );
}
