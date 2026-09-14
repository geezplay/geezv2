import type { ReactNode } from "react";
import { classNames } from "@/lib/format";
import { IconEmptyBox } from "@/components/ui/icons";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className={classNames(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-line border-t-primary",
        className,
      )}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={classNames("block animate-pulse rounded-lg bg-line/70", className)}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-muted">
        {icon ?? <IconEmptyBox size={24} />}
      </span>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
