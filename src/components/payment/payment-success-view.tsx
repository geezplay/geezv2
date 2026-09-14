"use client";

import type { Order } from "@/lib/types";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { EntitledDownloadList } from "@/components/payment/entitled-download-list";
import { Button, ButtonLink } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { IconCheckCircle, IconDownload, IconLock } from "@/components/ui/icons";

export function PaymentSuccessView({
  orderId,
  serverOrder,
}: {
  orderId: string;
  serverOrder?: Order;
}) {
  const order = serverOrder;
  const { notify } = useToast();

  if (!order) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-danger/30 bg-danger-soft p-6 text-center">
        <h1 className="text-lg font-bold text-danger">Pesanan tidak ditemukan</h1>
        <p className="mt-1 text-sm text-danger">
          Tautan unduhan hanya berlaku untuk pesanan yang valid: {orderId}
        </p>
        <ButtonLink href="/events" className="mt-4">
          Kembali ke beranda
        </ButtonLink>
      </div>
    );
  }

  if (order.paymentStatus !== "paid") {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-warning/30 bg-warning-soft p-6 text-center">
        <h1 className="text-lg font-bold text-warning">Foto belum bisa diunduh</h1>
        <p className="mt-1 text-sm text-warning">
          Akses foto original hanya tersedia setelah pembayaran berstatus{" "}
          <span className="font-bold">Paid</span>. Status pesanan saat ini:{" "}
          <span className="font-bold">{order.paymentStatus}</span>.
        </p>
        <ButtonLink href={`/payment/status/${order.id}`} className="mt-4">
          Lihat status pembayaran
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border border-primary/30 bg-primary-soft p-5 text-center sm:p-6">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary-hover">
          <IconCheckCircle size={32} />
        </div>
        <h1 className="text-xl font-bold text-primary-hover">Pembayaran berhasil</h1>
        <p className="mt-1 text-sm text-primary-hover/80">
          Terima kasih! Foto resolusi penuh kamu sekarang siap diunduh.
        </p>
        <p className="mt-3 text-xs text-primary-hover/80">
          Order {order.id} · Dibayar{" "}
          {order.paidAt ? formatDateTime(order.paidAt) : "-"}
        </p>
      </div>

      <section
        aria-labelledby="unduhan"
        className="rounded-xl border border-line bg-white p-4 sm:p-5"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 id="unduhan" className="text-base font-bold text-ink">
              Foto yang kamu beli ({order.items.length})
            </h2>
            <p className="text-sm text-muted">
              Total dibayar {formatRupiah(order.total)}
            </p>
          </div>
          <ButtonLink href={`/download/${order.id}`} variant="secondary" size="sm">
            <IconDownload size={16} />
            Halaman unduhan
          </ButtonLink>
        </div>
        <EntitledDownloadList items={order.items} orderId={order.id} />
      </section>

      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          <IconLock size={16} />
          Notifikasi terkirim
        </h2>
        <p className="mt-1 text-sm text-muted">
          Kami mengirim detail pesanan ke {order.email} dan WhatsApp {order.whatsapp}.
          Gunakan tombol di bawah untuk mengirim ulang.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => notify("Email berisi tautan unduhan dikirim ulang.", "info")}
          >
            Kirim ulang email
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              notify("WhatsApp berisi tautan unduhan dikirim ulang.", "info")
            }
          >
            Kirim ulang WhatsApp
          </Button>
        </div>
      </section>

      <p className="text-center text-sm text-muted">
        Hanya foto pada pesanan ini yang dapat diunduh. Foto lain di katalog yang sama
        tetap terkunci.
      </p>
    </div>
  );
}
