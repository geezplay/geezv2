import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = {
  title: "Favorit",
  description: "Foto balap yang kamu simpan untuk dibeli nanti.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <div className="container-page space-y-6 py-8">
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Favorit" }]} />
      <div>
        <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Favorit
        </h1>
        <p className="mt-1 text-sm text-muted">
          Foto yang kamu simpan tersimpan di perangkat ini sampai kamu membelinya.
        </p>
      </div>
      <WishlistView />
    </div>
  );
}
