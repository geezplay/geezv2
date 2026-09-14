import Link from "next/link";
import { IconChevronRight } from "@/components/ui/icons";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded px-0.5 hover:text-primary-hover hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="px-0.5 font-medium text-ink"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? <IconChevronRight size={14} /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
