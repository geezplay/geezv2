import Link from "next/link";
import type { RaceClass } from "@/lib/types";
import { classNames } from "@/lib/format";

export function ClassTabs({
  eventSlug,
  classes,
  activeClassId,
}: {
  eventSlug: string;
  classes: RaceClass[];
  activeClassId?: string;
}) {
  return (
    <nav aria-label="Pilih kelas balap">
      <ul className="flex snap-x gap-2 overflow-x-auto pb-1">
        {classes.map((raceClass) => {
          const active = raceClass.id === activeClassId;
          return (
            <li key={raceClass.id} className="snap-start">
              <Link
                href={`/events/${eventSlug}/${raceClass.id}`}
                aria-current={active ? "page" : undefined}
                className={classNames(
                  "inline-flex whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-white text-ink hover:border-primary hover:text-primary-hover",
                )}
              >
                {raceClass.name}
                <span
                  className={classNames(
                    "ml-2 rounded-full px-1.5 text-xs",
                    active ? "bg-white/20" : "bg-surface text-muted",
                  )}
                >
                  {raceClass.catalogCount}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
