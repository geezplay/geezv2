"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import type { PublicSettings } from "@/lib/types";
import { BrandMark } from "@/components/layout/brand-mark";
import { classNames } from "@/lib/format";
import {
  IconCart,
  IconHeart,
  IconMenu,
  IconClose,
  IconSearch,
} from "@/components/ui/icons";

const NAV_LINKS = [
  { href: "/events", label: "Event" },
  { href: "/search", label: "Cari Foto" },
  { href: "/wishlist", label: "Favorit" },
];

export function SiteHeader({ settings }: { settings: PublicSettings }) {
  const pathname = usePathname();
  const cart = useCart();
  const wishlist = useWishlist();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-3">
        <Link href="/" className="rounded-lg" aria-label="Beranda">
          <BrandMark logoUrl={settings.logoUrl} size="lg" />
        </Link>

        <nav aria-label="Navigasi utama" className="ml-4 hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={classNames(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    isActive(link.href)
                      ? "bg-primary-soft text-primary-hover"
                      : "text-ink hover:bg-surface",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Cari foto berdasarkan nomor start atau bib"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-surface"
          >
            <IconSearch size={20} />
          </Link>
          <Link
            href="/wishlist"
            aria-label={`Favorit, ${wishlist.ready ? wishlist.count : 0} foto`}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-surface"
          >
            <IconHeart size={20} />
            {wishlist.ready && wishlist.count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
                {wishlist.count}
              </span>
            ) : null}
          </Link>
          <Link
            href="/cart"
            aria-label={`Keranjang, ${cart.ready ? cart.count : 0} foto`}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-surface"
          >
            <IconCart size={20} />
            {cart.ready && cart.count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                {cart.count}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-surface md:hidden"
          >
            {open ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="menu-mobile" className="border-t border-line bg-white md:hidden">
          <nav aria-label="Navigasi mobile" className="container-page py-3">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/events"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
                >
                  Event
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
                >
                  Cari Foto
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
                >
                  Favorit {wishlist.ready && wishlist.count > 0 ? `(${wishlist.count})` : ""}
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
                >
                  Keranjang {cart.ready && cart.count > 0 ? `(${cart.count})` : ""}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
