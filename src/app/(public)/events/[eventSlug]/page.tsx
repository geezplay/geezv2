import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, listClasses } from "@/services/event-service";
import { listCatalogs } from "@/services/catalog-service";
import { formatDate } from "@/lib/format";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EventStatusBadge } from "@/components/ui/badge";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { EventCover } from "@/components/catalog/event-cover";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import {
  IconCalendar,
  IconImage,
  IconMapPin,
  IconSearch,
} from "@/components/ui/icons";

export async function generateMetadata(
  props: PageProps<"/events/[eventSlug]">,
): Promise<Metadata> {
  const { eventSlug } = await props.params;
  const event = await getEvent(eventSlug);
  if (!event) return { title: "Event tidak ditemukan" };
  return {
    title: event.name,
    description: event.description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: { title: event.name, description: event.description },
  };
}

export default async function EventDetailPage(props: PageProps<"/events/[eventSlug]">) {
  const { eventSlug } = await props.params;
  const event = await getEvent(eventSlug);
  if (!event) notFound();

  const classes = await listClasses(event.id);
  const catalogs = await listCatalogs({ eventId: event.id });
  const classMap = new Map(classes.map((item) => [item.id, item]));

  return (
    <div className="container-page space-y-8 py-8">
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Event", href: "/events" },
          { label: event.name },
        ]}
      />

      <header className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="aspect-[4/3] sm:aspect-auto">
            <EventCover
              coverUrl={event.coverUrl}
              seed={event.id}
              alt={`Brosur event ${event.name}`}
              className="h-full w-full"
            />
          </div>
          <div className="p-5 sm:p-6">
            <EventStatusBadge status={event.status} />
            <h1 className="mt-3 text-2xl font-black tracking-tight text-ink">
              {event.name}
            </h1>
            <dl className="mt-4 space-y-2 text-sm text-muted">
              <div className="flex items-center gap-2">
                <dt className="sr-only">Tanggal</dt>
                <IconCalendar size={16} />
                <dd>{formatDate(event.date, { weekday: "long" })}</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="sr-only">Lokasi</dt>
                <IconMapPin size={16} />
                <dd>{event.location}</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="sr-only">Jumlah</dt>
                <IconImage size={16} />
                <dd>
                  {event.classCount} kelas · {event.catalogCount} katalog ·{" "}
                  {event.photoCount.toLocaleString("id-ID")} foto
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-muted">{event.description}</p>
            <ButtonLink href="/search" variant="secondary" size="sm" className="mt-4">
              <IconSearch size={16} />
              Cari nomor start/bib
            </ButtonLink>
          </div>
        </div>
      </header>

      <section aria-labelledby="kelas">
        <h2 id="kelas" className="mb-3 text-lg font-bold text-ink">
          Kelas balap ({classes.length})
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((raceClass) => (
            <li key={raceClass.id}>
              <Link
                href={`/events/${event.slug}/${raceClass.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 hover:border-primary"
              >
                <span>
                  <span className="block text-sm font-bold text-ink">
                    {raceClass.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {raceClass.catalogCount} katalog foto
                  </span>
                </span>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-hover">
                  Buka
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="katalog-event">
        <h2 id="katalog-event" className="mb-3 text-lg font-bold text-ink">
          Semua katalog ({catalogs.length})
        </h2>
        {catalogs.length === 0 ? (
          <EmptyState
            title="Katalog belum dipublikasikan"
            description="Admin belum mem-publish foto untuk event ini. Coba lagi nanti."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalogs.map((catalog) => (
              <li key={catalog.id}>
                <CatalogCard
                  catalog={catalog}
                  event={event}
                  raceClass={classMap.get(catalog.classId)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
