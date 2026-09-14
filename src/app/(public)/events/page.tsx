import type { Metadata } from "next";
import { listEvents } from "@/services/event-service";
import { EventCard } from "@/components/catalog/event-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/feedback";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Daftar Event",
  description:
    "Telusuri semua event balap yang fotonya tersedia di GeezPlay. Pilih event lalu pilih kelas balap.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const allEvents = await listEvents();
  const ready = allEvents.filter((event) => event.status === "ready");
  const others = allEvents.filter((event) => event.status !== "ready");

  return (
    <div className="container-page space-y-6 py-8">
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Event" }]} />
      <div>
        <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Daftar Event
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Pilih event balap yang kamu ikuti. Event bertanda “Siap” berarti fotonya sudah
          tersedia untuk dibeli.
        </p>
      </div>

      {allEvents.length === 0 ? (
        <EmptyState
          title="Belum ada event"
          description="Event akan muncul di sini setelah admin mempublikasikannya."
        />
      ) : null}

      {ready.length > 0 ? (
        <section aria-labelledby="event-siap">
          <h2 id="event-siap" className="mb-3 text-lg font-bold text-ink">
            Siap dibeli ({ready.length})
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ready.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section aria-labelledby="event-segera">
          <h2 id="event-segera" className="mb-3 text-lg font-bold text-ink">
            Segera hadir ({others.length})
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="rounded-xl border border-line bg-surface p-4 text-center">
        <p className="text-sm text-muted">Tidak menemukan event kamu?</p>
        <ButtonLink href="/search" variant="secondary" className="mt-3">
          Cari lewat nomor start atau bib
        </ButtonLink>
      </div>
    </div>
  );
}
