"use client";

import { useState } from "react";
import { getReport, type ReportResult } from "@/services/admin-service";
import type { PaymentStatus } from "@/lib/types";
import { formatNumber, formatRupiah } from "@/lib/format";
import { AdminPageHeader, SectionCard, StatCard } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { IconChart, IconDownload, IconImage, IconTag } from "@/components/ui/icons";

interface Filters {
  from: string;
  to: string;
  eventName: string;
  status: PaymentStatus | "all";
  groupBy: "event" | "date";
}

const initialFilters: Filters = {
  from: "",
  to: "",
  eventName: "all",
  status: "all",
  groupBy: "event",
};

export function ReportsView({
  initialReport,
  eventNames,
}: {
  initialReport: ReportResult;
  eventNames: string[];
}) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  const apply = () => {
    setLoading(true);
    getReport(filters)
      .then((result) => setReport(result))
      .finally(() => setLoading(false));
  };

  const reset = () => {
    setFilters(initialFilters);
    setLoading(true);
    getReport(initialFilters)
      .then((result) => setReport(result))
      .finally(() => setLoading(false));
  };

  const exportCsv = () => {
    const header = "Label,Order,Foto,Pendapatan\n";
    const body = report.rows
      .map((row) => `"${row.label}",${row.orders},${row.photos},${row.revenue}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "laporan-penjualan-geezplay.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    notify("Laporan CSV diunduh.", "success");
  };

  return (
    <div>
      <AdminPageHeader
        title="Laporan"
        description="Rekap penjualan berdasarkan event, tanggal, dan status pembayaran."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={exportCsv}>
              <IconDownload size={16} />
              CSV
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <IconDownload size={16} />
              Export PDF
            </Button>
          </div>
        }
      />

      <div className="mb-4 rounded-xl border border-line bg-white p-4 print:hidden">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Field id="report-from" label="Dari tanggal">
            <Input
              id="report-from"
              type="date"
              value={filters.from}
              onChange={(event) => setFilters({ ...filters, from: event.target.value })}
            />
          </Field>
          <Field id="report-to" label="Sampai tanggal">
            <Input
              id="report-to"
              type="date"
              value={filters.to}
              onChange={(event) => setFilters({ ...filters, to: event.target.value })}
            />
          </Field>
          <Field id="report-event" label="Event">
            <Select
              id="report-event"
              value={filters.eventName}
              onChange={(event) =>
                setFilters({ ...filters, eventName: event.target.value })
              }
            >
              <option value="all">Semua event</option>
              {eventNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="report-status" label="Status">
            <Select
              id="report-status"
              value={filters.status}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  status: event.target.value as PaymentStatus | "all",
                })
              }
            >
              <option value="all">Semua status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </Field>
          <Field id="report-group" label="Kelompokkan">
            <Select
              id="report-group"
              value={filters.groupBy}
              onChange={(event) =>
                setFilters({ ...filters, groupBy: event.target.value as "event" | "date" })
              }
            >
              <option value="event">Per event</option>
              <option value="date">Per tanggal</option>
            </Select>
          </Field>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={apply} disabled={loading}>
            {loading ? "Memuat…" : "Terapkan filter"}
          </Button>
          <Button size="sm" variant="secondary" onClick={reset} disabled={loading}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total order"
          value={formatNumber(report.totalOrders)}
          icon={<IconTag size={18} />}
          tone="info"
        />
        <StatCard
          label="Foto terjual"
          value={formatNumber(report.totalPhotos)}
          icon={<IconImage size={18} />}
          tone="neutral"
        />
        <StatCard
          label="Pendapatan (paid)"
          value={formatRupiah(report.totalRevenue)}
          icon={<IconChart size={18} />}
          tone="primary"
        />
      </div>

      <SectionCard
        title={filters.groupBy === "event" ? "Rekap per event" : "Rekap per tanggal"}
        description={`${report.rows.length} baris`}
        className="mt-4"
      >
        {report.rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Tidak ada data untuk filter ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-semibold">
                    {filters.groupBy === "event" ? "Event" : "Tanggal"}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">Order</th>
                  <th className="px-3 py-2 text-right font-semibold">Foto</th>
                  <th className="px-3 py-2 text-right font-semibold">Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {report.rows.map((row) => (
                  <tr key={row.key}>
                    <td className="px-3 py-2.5 font-medium text-ink">{row.label}</td>
                    <td className="px-3 py-2.5 text-right text-muted">{row.orders}</td>
                    <td className="px-3 py-2.5 text-right text-muted">{row.photos}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-ink">
                      {formatRupiah(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-line">
                  <td className="px-3 py-2.5 font-bold text-ink">Total</td>
                  <td className="px-3 py-2.5 text-right font-bold text-ink">
                    {report.totalOrders}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-ink">
                    {report.totalPhotos}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-primary-hover">
                    {formatRupiah(report.totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </SectionCard>

      <p className="mt-3 text-xs text-muted print:block">
        Laporan dibuat otomatis oleh sistem GeezPlay. Export PDF menggunakan dialog cetak
        browser (Save as PDF).
      </p>
    </div>
  );
}
