import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Selesaikan pembelian foto balap kamu.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page space-y-6 py-8">
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Keranjang", href: "/cart" },
          { label: "Checkout" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-muted">
          Isi email dan WhatsApp, pilih metode pembayaran, lalu selesaikan pesanan.
        </p>
      </div>
      <CheckoutView />
    </div>
  );
}
