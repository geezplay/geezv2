"use client";

import { useEffect, useState } from "react";
import { getDashboard, type DashboardData } from "@/services/admin-service";
import { formatDateTime, formatNumber, formatRupiah } from "@/lib/format";
import { AdminPageHeader, SectionCard, StatCard } from "@/components/admin/admin-ui";
import { SalesChart } from "@/components/admin/sales-chart";
import { PaymentStatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Spinner } from "@/components/ui/feedback";
import {
  IconChart,
  IconCheckCircle,
  IconImage,
  IconTag,
} from "@/components/ui/icons";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getDashboard()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Gagal memuat dashboard.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <p className="text-sm font-medium text-danger">{error}</p>;
  }

  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Ringkasan penjualan, order terbaru, dan performa event."
        action={<ButtonLink href="/admin/upload" size="sm">Upload foto</ButtonLink>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total pendapatan"
          value={formatRupiah(data.revenue)}
          hint={`${data.paidOrders} order paid`}
          icon={<IconChart size={18} />}
          tone="primary"
        />
        <StatCard
          label="Order masuk"
          value={formatNumber(data.orders)}
          hint={`${data.pendingOrders} menunggu pembayaran`}
          icon={<IconTag size={18} />}
          tone="info"
        />
        <StatCard
          label="Foto terjual"
          value={formatNumber(data.photosSold)}
          hint="Akumulasi item paid"
          icon={<IconImage size={18} />}
          tone="neutral"
        />
        <StatCard
          label="Payment success"
          value={`${data.successRate}%`}
          hint="Dari order yang selesai"
          icon={<IconCheckCircle size={18} />}
          tone="primary"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Pendapatan 14 hari terakhir"
          description="Hanya menghitung order berstatus paid."
          className="xl:col-span-2"
        >
          <SalesChart points={data.salesByDay} />
        </SectionCard>

        <SectionCard title="Status pembayaran" description="Distribusi seluruh order.">
          <ul className="space-y-3">
            {data.statusBreakdown.map((item) => {
              const percent =
                data.orders === 0 ? 0 : Math.round((item.count / data.orders) * 100);
              return (
                <li key={item.status}>
                  <div className="flex items-center justify-between gap-2">
                    <PaymentStatusBadge status={item.status} />
                    <span className="text-sm font-bold text-ink">
                      {item.count} · {percent}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Event teratas"
          description="Berdasarkan pendapatan order paid."
        >
          {data.topEvents.length === 0 ? (
            <p className="text-sm text-muted">Belum ada penjualan.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.topEvents.map((event, index) => (
                <li key={event.eventName} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-xs font-bold text-muted">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {event.eventName}
                    </p>
                    <p className="text-xs text-muted">
                      {event.orders} order · {event.photos} foto
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-primary-hover">
                    {formatRupiah(event.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Order terbaru"
          description="6 transaksi terakhir."
          action={
            <ButtonLink href="/admin/orders" variant="ghost" size="sm">
              Lihat semua
            </ButtonLink>
          }
        >
          <ul className="divide-y divide-line">
            {data.recentOrders.map((order) => (
              <li key={order.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{order.id}</p>
                  <p className="truncate text-xs text-muted">
                    {order.buyerEmail} · {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-ink">{formatRupiah(order.total)}</p>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Event" value={formatNumber(data.eventCount)} tone="neutral" />
        <StatCard label="Kelas balap" value={formatNumber(data.classCount)} tone="neutral" />
        <StatCard label="Katalog" value={formatNumber(data.catalogCount)} tone="neutral" />
        <StatCard label="Total foto" value={formatNumber(data.photoCount)} tone="neutral" />
      </div>
    </div>
  );
}
