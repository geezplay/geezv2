import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClassById, getEvent, listClasses } from "@/services/event-service";
import { listCatalogs } from "@/services/catalog-service";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ClassTabs } from "@/components/catalog/class-tabs";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { EmptyState } from "@/components/ui/feedback";
import { ButtonLink } from "@/components/ui/button";
import { IconSearch } from "@/components/ui/icons";

export async function generateMetadata(
  props: PageProps<"/events/[eventSlug]/[classId]">,
): Promise<Metadata> {
  const { eventSlug, classId } = await props.params;
  const event = await getEvent(eventSlug);
  const raceClass = await getClassById(classId);
  if (!event || !raceClass) return { title: "Kelas tidak ditemukan" };
  return {
    title: `${raceClass.name} · ${event.name}`,
    description: `Katalog foto kelas ${raceClass.name} pada event ${event.name}.`,
    alternates: { canonical: `/events/${event.slug}/${raceClass.id}` },
  };
}

export default async function ClassDetailPage(
  props: PageProps<"/events/[eventSlug]/[classId]">,
) {
  const { eventSlug, classId } = await props.params;
  const event = await getEvent(eventSlug);
  if (!event) notFound();
  const raceClass = await getClassById(classId);
  if (!raceClass || raceClass.eventId !== event.id) notFound();

  const classes = await listClasses(event.id);
  const catalogs = await listCatalogs({ eventId: event.id, classId: raceClass.id });

  return (
    <div className="container-page space-y-6 py-8">
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Event", href: "/events" },
          { label: event.name, href: `/events/${event.slug}` },
          { label: raceClass.name },
        ]}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink">
            {raceClass.name}
          </h1>
          <p className="mt-1 text-sm text-muted">{event.name}</p>
        </div>
        <ButtonLink href="/search" variant="secondary" size="sm">
          <IconSearch size={16} />
          Cari nomor start
        </ButtonLink>
      </div>

      <ClassTabs
        eventSlug={event.slug}
        classes={classes}
        activeClassId={raceClass.id}
      />

      <section aria-labelledby="katalog-kelas">
        <h2 id="katalog-kelas" className="mb-3 text-lg font-bold text-ink">
          Katalog foto ({catalogs.length})
        </h2>
        {catalogs.length === 0 ? (
          <EmptyState
            title="Belum ada katalog di kelas ini"
            description="Pilih kelas lain atau kembali ke daftar event."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalogs.map((catalog) => (
              <li key={catalog.id}>
                <CatalogCard catalog={catalog} event={event} raceClass={raceClass} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
