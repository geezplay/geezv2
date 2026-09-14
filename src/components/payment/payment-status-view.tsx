"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Order } from "@/lib/types";
import { payOrder, cancelOrder } from "@/services/order-service";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { PaymentStatusBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Spinner } from "@/components/ui/feedback";
import { useToast } from "@/context/toast-context";
import { IconAlert, IconCheckCircle, IconClock, IconLock } from "@/components/ui/icons";

const methodLabels: Record<Order["paymentMethod"], string> = {
  qris: "QRIS",
  bank_transfer: "Transfer Bank",
  ewallet: "E-Wallet",
};

export function PaymentStatusView({ serverOrder }: { serverOrder?: Order }) {
  const router = useRouter();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const order = serverOrder;

  const run = async (action: () => Promise<Order>, message: string) => {
    setBusy(true);
    try {
      await action();
      notify(message, "success");
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Aksi gagal.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (!order) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger-soft p-6 text-center">
        <h1 className="text-lg font-bold text-danger">Pesanan tidak ditemukan</h1>
        <p className="mt-1 text-sm text-danger">
          Periksa kembali tautan pesanan kamu atau mulai pesanan baru.
        </p>
        <ButtonLink href="/events" className="mt-4">
          Kembali ke beranda
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-xl border border-line bg-white p-5 text-center sm:p-6">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface text-ink">
          {order.paymentStatus === "paid" ? (
            <IconCheckCircle size={30} />
          ) : order.paymentStatus === "pending" ? (
            <IconClock size={30} />
          ) : (
            <IconAlert size={30} />
          )}
        </div>
        <PaymentStatusBadge status={order.paymentStatus} />
        <h1 className="mt-3 text-xl font-bold text-ink">
          {order.paymentStatus === "paid"
            ? "Pembayaran berhasil"
            : order.paymentStatus === "pending"
              ? "Menunggu pembayaran"
              : "Pembayaran tidak selesai"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Order <span className="font-semibold text-ink">{order.id}</span> ·{" "}
          {formatDateTime(order.createdAt)}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-lg border border-line bg-surface p-3">
            <dt className="text-xs text-muted">Metode</dt>
            <dd className="text-sm font-bold text-ink">
              {methodLabels[order.paymentMethod]}
            </dd>
          </div>
          <div className="rounded-lg border border-line bg-surface p-3">
            <dt className="text-xs text-muted">Total</dt>
            <dd className="text-sm font-bold text-primary-hover">
              {formatRupiah(order.total)}
            </dd>
          </div>
        </dl>

        {order.paymentStatus === "pending" ? (
          <div className="mt-5 space-y-3">
            <p className="rounded-lg border border-warning/30 bg-warning-soft p-3 text-left text-sm text-warning">
              Selesaikan pembayaran sesuai instruksi {methodLabels[order.paymentMethod]}.
              Status akan otomatis diperbarui setelah payment gateway mengirim
              konfirmasi ke server.
            </p>
            <Button
              fullWidth
              disabled={busy}
              onClick={() =>
                run(() => payOrder(order.id), "Pembayaran berhasil disimulasikan.")
              }
            >
              {busy ? <Spinner className="h-4 w-4" /> : null}
              Simulasikan pembayaran berhasil
            </Button>
            <Button
              variant="secondary"
              fullWidth
              disabled={busy}
              onClick={() =>
                run(() => cancelOrder(order.id), "Pesanan dibatalkan.")
              }
            >
              Batalkan pesanan
            </Button>
          </div>
        ) : null}

        {order.paymentStatus === "paid" ? (
          <ButtonLink href={`/payment/success/${order.id}`} fullWidth className="mt-5">
            Lihat & unduh foto
          </ButtonLink>
        ) : null}

        {order.paymentStatus === "failed" ||
        order.paymentStatus === "expired" ||
        order.paymentStatus === "cancelled" ? (
          <ButtonLink href="/cart" fullWidth className="mt-5">
            Coba lagi
          </ButtonLink>
        ) : null}
      </div>

      <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <IconLock size={16} />
          Catatan keamanan
        </p>
        <p className="mt-1">
          Tombol simulasi di atas hanya untuk demo. Di produksi, status pembayaran
          berasal dari webhook payment gateway yang tervalidasi dan idempotent, bukan
          dari browser.
        </p>
      </div>

      <p className="text-center text-sm text-muted">
        Butuh bantuan?{" "}
        <Link href="/events" className="font-semibold text-primary hover:underline">
          Lihat event lain
        </Link>
      </p>
    </div>
  );
}
