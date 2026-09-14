import Link from "next/link";
import type { RaceEvent } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { EventCover } from "@/components/catalog/event-cover";
import { EventStatusBadge } from "@/components/ui/badge";
import { IconArrowRight, IconCalendar, IconImage, IconMapPin } from "@/components/ui/icons";

export function EventCard({ event }: { event: RaceEvent }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white">
      <Link
        href={`/events/${event.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
        aria-label={`Lihat event ${event.name}`}
      >
        <EventCover
          coverUrl={event.coverUrl}
          seed={event.id}
          alt={`Brosur event ${event.name}`}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2">
          <EventStatusBadge status={event.status} />
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold leading-snug text-ink">
          <Link href={`/events/${event.slug}`} className="hover:text-primary-hover">
            {event.name}
          </Link>
        </h3>
        <dl className="mt-2 space-y-1 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Tanggal</dt>
            <IconCalendar size={15} />
            <dd>{formatDate(event.date)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Lokasi</dt>
            <IconMapPin size={15} />
            <dd>{event.location}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Jumlah foto</dt>
            <IconImage size={15} />
            <dd>
              {event.photoCount.toLocaleString("id-ID")} foto · {event.catalogCount} katalog
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex-1" />
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          Lihat kelas balap
          <IconArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
