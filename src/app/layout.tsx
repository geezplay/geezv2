import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { ToastProvider } from "@/context/toast-context";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GeezPlay · Foto Balap Resolusi Penuh",
    template: "%s · GeezPlay",
  },
  description:
    "Temukan foto balap kamu berdasarkan event dan kelas, pilih beberapa foto, bayar online, lalu unduh resolusi penuh dengan aman.",
  keywords: ["foto balap", "fotografi motocross", "road race", "drag bike"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "GeezPlay",
    title: "GeezPlay · Foto Balap Resolusi Penuh",
    description:
      "Temukan foto balap berdasarkan event dan kelas, pilih beberapa foto, bayar online, lalu unduh resolusi penuh.",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-dvh flex-col bg-white text-ink antialiased">
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>{children}</ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
