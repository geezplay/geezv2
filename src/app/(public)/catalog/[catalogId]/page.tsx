import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCatalog, listCatalogPhotos } from "@/services/catalog-service";
import { getEvent, getClassById } from "@/services/event-service";
import { formatRupiah } from "@/lib/format";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { CatalogPreviewSheet } from "@/components/catalog/catalog-preview-sheet";
import { CatalogDetail } from "@/components/catalog/catalog-detail";
import { IconLock } from "@/components/ui/icons";

export async function generateMetadata(
  props: PageProps<"/catalog/[catalogId]">,
): Promise<Metadata> {
  const { catalogId } = await props.params;
  const catalog = await getCatalog(catalogId);
  if (!catalog) return { title: "Katalog tidak ditemukan" };
  return {
    title: catalog.title,
    description: `${catalog.title} berisi ${catalog.photoCount} foto. Harga ${formatRupiah(
      catalog.price,
    )} per foto.`,
    alternates: { canonical: `/catalog/${catalog.id}` },
  };
}

export default async function CatalogPage(props: PageProps<"/catalog/[catalogId]">) {
  const { catalogId } = await props.params;
  const catalog = await getCatalog(catalogId);
  if (!catalog || !catalog.published) notFound();

  const [photos, event, raceClass] = await Promise.all([
    listCatalogPhotos(catalog.id),
    getEvent(catalog.eventId),
    getClassById(catalog.classId),
  ]);

  return (
    <div className="container-page space-y-6 py-8">
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Event", href: "/events" },
          ...(event ? [{ label: event.name, href: `/events/${event.slug}` }] : []),
          ...(event && raceClass
            ? [{ label: raceClass.name, href: `/events/${event.slug}/${raceClass.id}` }]
            : []),
          { label: catalog.title },
        ]}
      />

      <header className="grid gap-5 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:p-5">
        <CatalogPreviewSheet
          previewSheetId={catalog.previewSheetId}
          previewSheetUrl={catalog.previewSheetUrl}
          photoCount={catalog.photoCount}
          alt={`Preview gabungan katalog ${catalog.title}`}
          zoomable
        />
        <div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="info">{catalog.photoCount} foto</Badge>
            {raceClass ? <Badge tone="neutral">{raceClass.name}</Badge> : null}
            <Badge tone="primary">Siap dibeli</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-ink">
            {catalog.title}
          </h1>
          {event ? (
            <p className="mt-1 text-sm text-muted">
              <Link href={`/events/${event.slug}`} className="hover:text-primary-hover">
                {event.name}
              </Link>
            </p>
          ) : null}
          <p className="mt-3 text-sm text-muted">
            Katalog ini berisi {catalog.photoCount} foto. Card di atas adalah satu
            gambar preview gabungan; foto asli tetap tersimpan terpisah dan hanya
            tersedia setelah pembelian.
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-primary-hover">
              {formatRupiah(catalog.price)}
            </span>
            <span className="text-sm text-muted">/ foto</span>
          </div>
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-line bg-surface p-3 text-xs text-muted">
            <IconLock size={16} />
            Semua foto di bawah adalah preview ber-watermark. Original hanya untuk foto
            yang kamu beli dan bayar.
          </p>
        </div>
      </header>

      <section aria-labelledby="pilih-foto">
        <h2 id="pilih-foto" className="mb-3 text-lg font-bold text-ink">
          Pilih foto dari katalog ini
        </h2>
        <CatalogDetail
          catalog={catalog}
          photos={photos}
          event={event}
          raceClass={raceClass}
        />
      </section>
    </div>
  );
}
