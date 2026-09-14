import Link from "next/link";
import type { PublicSettings } from "@/lib/types";
import { BrandMark } from "@/components/layout/brand-mark";

const linkGroups = [
  {
    title: "Jelajahi",
    links: [
      { href: "/events", label: "Daftar Event" },
      { href: "/search", label: "Cari Foto" },
      { href: "/wishlist", label: "Favorit" },
    ],
  },
  {
    title: "Transaksi",
    links: [
      { href: "/cart", label: "Keranjang" },
      { href: "/checkout", label: "Checkout" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: PublicSettings }) {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Link href="/" aria-label="Beranda">
            <BrandMark logoUrl={settings.logoUrl} size="lg" />
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Platform jualan foto balap. Temukan foto kamu berdasarkan event dan kelas
            balap, bayar online, lalu unduh resolusi penuh dengan aman.
          </p>
        </div>
        {linkGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-sm font-bold text-ink">{group.title}</h2>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-primary-hover"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()}. Semua hak dilindungi.</p>
          <p>Preview ber-watermark · Original hanya setelah pembayaran terverifikasi.</p>
        </div>
      </div>
    </footer>
  );
}
