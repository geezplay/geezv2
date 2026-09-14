import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPhotoContext, listCatalogPhotos } from "@/services/catalog-service";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PhotoDetail } from "@/components/photo/photo-detail";

export async function generateMetadata(
  props: PageProps<"/photos/[photoId]">,
): Promise<Metadata> {
  const { photoId } = await props.params;
  const context = await getPhotoContext(photoId);
  if (!context) return { title: "Foto tidak ditemukan" };
  return {
    title: `Foto #${context.photo.bibNumber} · ${context.catalog.title}`,
    description: `Preview foto nomor bib ${context.photo.bibNumber} dari katalog ${context.catalog.title}.`,
    alternates: { canonical: `/photos/${context.photo.id}` },
    robots: { index: false, follow: true },
  };
}

export default async function PhotoPage(props: PageProps<"/photos/[photoId]">) {
  const { photoId } = await props.params;
  const context = await getPhotoContext(photoId);
  if (!context) notFound();

  const siblings = await listCatalogPhotos(context.catalog.id);
  const { photo, catalog, event, raceClass } = context;

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
          { label: catalog.title, href: `/catalog/${catalog.id}` },
          { label: `Foto #${photo.bibNumber}` },
        ]}
      />
      <PhotoDetail
        photo={photo}
        catalog={catalog}
        event={event}
        raceClass={raceClass}
        siblings={siblings}
      />
    </div>
  );
}
