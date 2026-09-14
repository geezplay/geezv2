import type { Metadata } from "next";
import Link from "next/link";
import { searchPhotos } from "@/services/catalog-service";
import { formatRupiah } from "@/lib/format";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CatalogPreviewSheet } from "@/components/catalog/catalog-preview-sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { IconSearch } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Cari Foto",
  description:
    "Cari foto balap berdasarkan nomor motor, nomor start, atau nomor bib.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const rawQuery = searchParams.q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() ?? "";
  const results = query ? await searchPhotos(query) : [];

  return (
    <div className="container-page space-y-6 py-8">
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Cari Foto" }]} />

      <div className="max-w-2xl">
        <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Cari foto kamu
        </h1>
        <p className="mt-1 text-sm text-muted">
          Masukkan nomor motor, nomor start, atau nomor bib untuk menemukan foto lebih
          cepat tanpa melihat seluruh katalog.
        </p>
      </div>

      <form action="/search" method="get" role="search" className="max-w-2xl">
        <label htmlFor="q" className="block text-sm font-semibold text-ink">
          Nomor motor / start / bib
        </label>
        <div className="mt-1.5 flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <IconSearch size={18} />
            </span>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              inputMode="numeric"
              placeholder="Contoh: 42"
              className="w-full rounded-lg border border-line bg-white py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Button type="submit">Cari</Button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Pencarian memakai hasil OCR nomor pada foto. Nomor bisa lunak; coba beberapa
          variasi bila tidak ditemukan.
        </p>
      </form>

      {query ? (
        <section aria-labelledby="hasil" className="space-y-4">
          <h2 id="hasil" className="text-lg font-bold text-ink" aria-live="polite">
            {results.length} katalog cocok untuk “{query}”
          </h2>

          {results.length === 0 ? (
            <EmptyState
              title="Foto tidak ditemukan"
              description="Coba nomor lain, atau telusuri event dan kelas secara manual."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => (
                <li key={result.catalog.id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white">
                    <Link
                      href={`/catalog/${result.catalog.id}`}
                      className="block p-2"
                      aria-label={`Buka katalog ${result.catalog.title}`}
                    >
                      <CatalogPreviewSheet
                        previewSheetId={result.catalog.previewSheetId}
                        previewSheetUrl={result.catalog.previewSheetUrl}
                        photoCount={result.catalog.photoCount}
                        alt={`Preview katalog ${result.catalog.title}`}
                        denseWatermark
                      />
                    </Link>
                    <div className="flex flex-1 flex-col gap-2 p-4 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone="primary">{result.photos.length} foto cocok</Badge>
                        {result.raceClass ? (
                          <Badge tone="neutral">{result.raceClass.name}</Badge>
                        ) : null}
                      </div>
                      <h3 className="text-sm font-bold leading-snug text-ink">
                        <Link
                          href={`/catalog/${result.catalog.id}`}
                          className="hover:text-primary-hover"
                        >
                          {result.catalog.title}
                        </Link>
                      </h3>
                      {result.event ? (
                        <p className="text-xs text-muted">{result.event.name}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-1.5">
                        {result.photos.slice(0, 6).map((photo) => (
                          <Link
                            key={photo.id}
                            href={`/photos/${photo.id}`}
                            className="rounded-full border border-line px-2 py-0.5 text-xs font-semibold text-primary hover:border-primary"
                          >
                            Bib {photo.bibNumber}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-1">
                        <span className="text-sm font-bold text-primary-hover">
                          {formatRupiah(result.catalog.price)}
                        </span>
                        <Link
                          href={`/catalog/${result.catalog.id}`}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Lihat katalog
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-sm font-bold text-ink">Tanpa hasil pencarian dulu?</h2>
          <p className="mt-1 text-sm text-muted">
            Kamu juga bisa menelusuri lewat daftar event dan kelas balap.
          </p>
          <Link
            href="/events"
            className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Lihat daftar event
          </Link>
        </div>
      )}
    </div>
  );
}
