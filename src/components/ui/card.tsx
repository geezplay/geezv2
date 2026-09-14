import type { ReactNode } from "react";
import { classNames } from "@/lib/format";

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "li";
}) {
  return (
    <Tag
      className={classNames(
        "rounded-xl border border-line bg-white transition-shadow",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={classNames("flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
