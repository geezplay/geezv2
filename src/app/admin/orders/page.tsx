"use client";

import { useEffect, useMemo, useState } from "react";
import { listAdminOrders } from "@/services/admin-service";
import type { AdminOrderRow, PaymentStatus } from "@/lib/types";
import { formatDateTime, formatNumber, formatRupiah } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { PaymentStatusBadge, Badge } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/feedback";
import { IconSearch } from "@/components/ui/icons";

const METHOD_LABEL: Record<AdminOrderRow["paymentMethod"], string> = {
  qris: "QRIS",
  bank_transfer: "Transfer Bank",
  ewallet: "E-Wallet",
};

const STATUS_OPTIONS: Array<{ value: PaymentStatus | "all"; label: string }> = [
  { value: "all", label: "Semua status" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [selected, setSelected] = useState<AdminOrderRow | null>(null);

  useEffect(() => {
    let active = true;
    listAdminOrders()
      .then((result) => {
        if (active) setOrders(result);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Gagal memuat order.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== "all" && order.paymentStatus !== status) return false;
      if (
        q &&
        ![order.id, order.buyerEmail, order.buyerWhatsapp, order.eventName].some((value) =>
          value.toLowerCase().includes(q),
        )
      ) {
        return false;
      }
      return true;
    });
  }, [orders, query, status]);

  const paidTotal = visible
    .filter((order) => order.paymentStatus === "paid")
    .reduce((total, order) => total + order.total, 0);

  return (
    <div>
      <AdminPageHeader
        title="Order"
        description="Pantau transaksi, status pembayaran, dan detail pembeli."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
        <Field id="order-search" label="Cari order">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <IconSearch size={16} />
            </span>
            <Input
              id="order-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ID / email / WhatsApp"
              className="pl-9"
            />
          </div>
        </Field>
        <Field id="order-status" label="Status pembayaran">
          <Select
            id="order-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as PaymentStatus | "all")}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone="neutral">{formatNumber(visible.length)} order</Badge>
        <Badge tone="primary">Paid {formatRupiah(paidTotal)}</Badge>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : error ? (
          <p className="px-4 py-10 text-center text-sm font-medium text-danger">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Pembeli</th>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 text-right font-semibold">Item</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Metode</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(order)}
                        className="font-semibold text-primary hover:underline"
                      >
                        {order.id}
                      </button>
                      <p className="text-xs text-muted">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-muted">{order.buyerEmail}</p>
                      <p className="text-xs text-muted">{order.buyerWhatsapp}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{order.eventName}</td>
                    <td className="px-4 py-3 text-right text-muted">
                      {order.itemCount}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {formatRupiah(order.total)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {METHOD_LABEL[order.paymentMethod]}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            Tidak ada order yang cocok dengan filter.
          </p>
        ) : null}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Detail order"
        footer={
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-surface"
          >
            Tutup
          </button>
        }
      >
        {selected ? (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">ID Order</dt>
              <dd className="font-semibold text-ink">{selected.id}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Status</dt>
              <dd>
                <PaymentStatusBadge status={selected.paymentStatus} />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Email</dt>
              <dd className="text-ink">{selected.buyerEmail}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">WhatsApp</dt>
              <dd className="text-ink">{selected.buyerWhatsapp}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Event</dt>
              <dd className="text-right text-ink">{selected.eventName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Jumlah item</dt>
              <dd className="text-ink">{selected.itemCount} foto</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Metode</dt>
              <dd className="text-ink">{METHOD_LABEL[selected.paymentMethod]}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-line pt-3">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="font-bold text-primary-hover">
                {formatRupiah(selected.total)}
              </dd>
            </div>
            <p className="rounded-lg border border-line bg-surface p-3 text-xs text-muted">
              Status pembayaran bersumber dari webhook payment gateway. Tombol tidak
              mengubah status secara manual di produksi.
            </p>
          </dl>
        ) : null}
      </Modal>
    </div>
  );
}
