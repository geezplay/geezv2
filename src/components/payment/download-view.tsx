"use client";

import type { Order } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { EntitledDownloadList } from "@/components/payment/entitled-download-list";
import { Button, ButtonLink } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { IconClock, IconDownload, IconLock, IconShield } from "@/components/ui/icons";

export function DownloadView({ serverOrder }: { serverOrder?: Order }) {
  const order = serverOrder;
  const { notify } = useToast();

  if (!order || order.paymentStatus !== "paid") {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-danger/30 bg-danger-soft p-6 text-center">
        <h1 className="text-lg font-bold text-danger">Akses unduhan ditolak</h1>
        <p className="mt-1 text-sm text-danger">
          Halaman ini hanya dapat diakses untuk pesanan dengan pembayaran berhasil
          (Paid). Foto original tidak dapat diakses sebelum pembayaran terverifikasi.
        </p>
        <ButtonLink
          href={order ? `/payment/status/${order.id}` : "/events"}
          className="mt-4"
        >
          {order ? "Lihat status pembayaran" : "Kembali ke beranda"}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-4 sm:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-hover">
          <IconDownload size={22} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-ink">Unduh foto original</h1>
          <p className="mt-0.5 text-sm text-muted">
            Order {order.id} · {order.items.length} foto · Dibayar{" "}
            {order.paidAt ? formatDateTime(order.paidAt) : "-"}
          </p>
        </div>
      </div>

      <EntitledDownloadList items={order.items} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <IconClock size={16} />
            Tautan berbatas waktu
          </p>
          <p className="mt-1">
            Setiap tautan unduhan berlaku 15 menit. Jika kedaluwarsa, kamu dapat
            membuat tautan baru selama entitlement pesanan masih valid.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() =>
              notify("Tautan unduhan baru dibuat. Berlaku 15 menit.", "info")
            }
          >
            Buat tautan baru
          </Button>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <IconShield size={16} />
            Aman & tercatat
          </p>
          <p className="mt-1">
            Akses original divalidasi di sisi server, hanya untuk foto pada pesanan ini,
            dan dilindungi rate limiting serta pencatatan audit.
          </p>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-lg border border-line bg-white p-3 text-xs text-muted">
        <IconLock size={16} />
        Demi keamanan, jangan bagikan tautan unduhan. Tautan bersifat pribadi dan hanya
        untuk pemilik pesanan.
      </p>
    </div>
  );
}
