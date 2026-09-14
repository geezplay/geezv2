import type { ReactNode } from "react";
import { classNames } from "@/lib/format";
import type { EventStatus, PaymentStatus } from "@/lib/types";
import { IconAlert, IconCheck, IconClock, IconClose } from "@/components/ui/icons";

type Tone = "primary" | "neutral" | "warning" | "danger" | "info";

const toneStyles: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary-hover border-primary/20",
  neutral: "bg-surface text-muted border-line",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  info: "bg-info-soft text-info border-info/20",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  if (status === "ready") {
    return (
      <Badge tone="primary">
        <IconCheck size={13} />
        Siap
      </Badge>
    );
  }
  return (
    <Badge tone="warning">
      <IconClock size={13} />
      Belum siap
    </Badge>
  );
}

const paymentConfig: Record<
  PaymentStatus,
  { label: string; tone: Tone; icon: ReactNode }
> = {
  pending: { label: "Menunggu pembayaran", tone: "warning", icon: <IconClock size={13} /> },
  paid: { label: "Pembayaran berhasil", tone: "primary", icon: <IconCheck size={13} /> },
  failed: { label: "Pembayaran gagal", tone: "danger", icon: <IconClose size={13} /> },
  expired: { label: "Kedaluwarsa", tone: "neutral", icon: <IconAlert size={13} /> },
  cancelled: { label: "Dibatalkan", tone: "neutral", icon: <IconClose size={13} /> },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = paymentConfig[status];
  return (
    <Badge tone={config.tone}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
