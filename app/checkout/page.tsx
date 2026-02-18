import { CartCheckoutForm } from "@/components/public/cart-checkout-form";
import { PublicHeader } from "@/components/public/public-header";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage() {
  const business = await prisma.business.findFirst();

  return (
    <div>
      <PublicHeader businessName={business?.name ?? "Catálogo"} />
      <main className="container-page space-y-4">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <CartCheckoutForm />
      </main>
    </div>
  );
}
