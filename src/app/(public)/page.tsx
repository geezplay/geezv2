import Link from "next/link";
import type { Metadata } from "next";
import { listCatalogs } from "@/services/catalog-service";
import { listEvents, listReadyEvents, listClasses } from "@/services/event-service";
import { EventCard } from "@/components/catalog/event-card";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowRight,
  IconCart,
  IconDownload,
  IconLock,
  IconSearch,
  IconShield,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "GeezPlay · Foto Balap Resolusi Penuh",
  description:
    "Temukan foto balap kamu berdasarkan event dan kelas, pilih beberapa foto, bayar online, lalu unduh resolusi penuh dengan aman.",
  alternates: { canonical: "/" },
};

const STEPS = [
  {
    icon: <IconSearch size={22} />,
    title: "Pilih event & kelas",
    description: "Telusuri event balap dan kelas yang kamu ikuti.",
  },
  {
    icon: <IconCart size={22} />,
    title: "Pilih beberapa foto",
    description: "Pilih banyak foto sekaligus, masukkan ke keranjang.",
  },
  {
    icon: <IconShield size={22} />,
    title: "Bayar online",
    description: "Bayar dengan QRIS, transfer bank, atau e-wallet.",
  },
  {
    icon: <IconDownload size={22} />,
    title: "Unduh resolusi penuh",
    description: "Setelah pembayaran terverifikasi, unduh foto original.",
  },
];

export default async function HomePage() {
  const [allEvents, readyEvents] = await Promise.all([
    listEvents(),
    listReadyEvents(),
  ]);
  const featuredEvents = readyEvents.slice(0, 3);
  const latestEvent = readyEvents[0];
  const [latestCatalogs, latestClasses] = latestEvent
    ? await Promise.all([
        listCatalogs({ eventId: latestEvent.id }),
        listClasses(latestEvent.id),
      ])
    : [[], []];

  return (
    <div className="container-page space-y-14 py-8 sm:py-10">
      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <Badge tone="primary">Foto balap resmi</Badge>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl">
              Temukan foto balap kamu, unduh dalam resolusi penuh.
            </h1>
            <p className="mt-3 max-w-lg text-base text-muted">
              Pilih event dan kelas, cari berdasarkan nomor start atau bib, pilih banyak
              foto sekaligus, lalu bayar online. Foto original hanya terbuka setelah
              pembayaran terverifikasi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/events" size="lg">
                Jelajahi event
                <IconArrowRight size={18} />
              </ButtonLink>
              <ButtonLink href="/search" size="lg" variant="secondary">
                <IconSearch size={18} />
                Cari nomor start
              </ButtonLink>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              <li className="flex items-center gap-1.5">
                <IconLock size={16} />
                Preview ber-watermark
              </li>
              <li className="flex items-center gap-1.5">
                <IconShield size={16} />
                Download aman & terbatas
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(readyEvents.slice(0, 4).length > 0
              ? readyEvents.slice(0, 4)
              : allEvents.slice(0, 4)
            ).map((event, index) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className={`overflow-hidden rounded-xl border border-line bg-white ${
                  index % 3 === 0 ? "row-span-1" : ""
                }`}
              >
                <div className="flex h-full flex-col">
                  <div className="bg-primary-soft px-3 py-2 text-xs font-bold text-primary-hover">
                    {event.classCount} kelas
                  </div>
                  <div className="flex flex-1 flex-col justify-end p-3">
                    <p className="line-clamp-2 text-sm font-bold text-ink">{event.name}</p>
                    <p className="mt-1 text-xs text-muted">{event.photoCount} foto</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="event-unggulan">
        <SectionHeading
          title="Event unggulan"
          description="Event yang fotonya sudah siap dibeli."
          action={
            <ButtonLink href="/events" variant="ghost" size="sm">
              Lihat semua
              <IconArrowRight size={16} />
            </ButtonLink>
          }
          className="mb-4"
        />
        <h2 id="event-unggulan" className="sr-only">
          Event unggulan
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      </section>

      {latestEvent && latestCatalogs.length > 0 ? (
        <section aria-labelledby="katalog-baru">
          <SectionHeading
            title="Katalog terbaru"
            description={`Dari ${latestEvent.name}. Setiap card adalah 1 preview gabungan dari beberapa foto.`}
            action={
              <ButtonLink
                href={`/events/${latestEvent.slug}`}
                variant="ghost"
                size="sm"
              >
                Lihat event
                <IconArrowRight size={16} />
              </ButtonLink>
            }
            className="mb-4"
          />
          <h2 id="katalog-baru" className="sr-only">
            Katalog terbaru
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestCatalogs.slice(0, 4).map((catalog) => (
              <li key={catalog.id}>
                <CatalogCard
                  catalog={catalog}
                  event={latestEvent}
                  raceClass={latestClasses.find((item) => item.id === catalog.classId)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="cara-beli" className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 id="cara-beli" className="text-lg font-bold text-ink sm:text-xl">
          Cara membeli
        </h2>
        <p className="mt-1 text-sm text-muted">
          Empat langkah sederhana: temukan → pilih → bayar → unduh.
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-line bg-surface p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                {step.icon}
              </span>
              <p className="mt-3 text-xs font-bold text-primary-hover">
                Langkah {index + 1}
              </p>
              <p className="mt-0.5 text-sm font-bold text-ink">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
