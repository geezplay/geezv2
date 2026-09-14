import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Keranjang",
  description: "Foto balap yang akan kamu beli.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="container-page space-y-6 py-8">
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Keranjang" }]} />
      <div>
        <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Keranjang
        </h1>
        <p className="mt-1 text-sm text-muted">
          Periksa foto pilihanmu, gunakan voucher, lalu lanjut ke checkout.
        </p>
      </div>
      <CartView />
    </div>
  );
}
