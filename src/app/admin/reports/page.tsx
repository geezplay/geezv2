"use client";

import { useEffect, useState } from "react";
import {
  getReport,
  listAdminOrders,
  type ReportResult,
} from "@/services/admin-service";
import { ReportsView } from "@/components/admin/reports-view";
import { Spinner } from "@/components/ui/feedback";

export default function AdminReportsPage() {
  const [report, setReport] = useState<ReportResult | null>(null);
  const [eventNames, setEventNames] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getReport({ groupBy: "event" }), listAdminOrders()])
      .then(([result, orders]) => {
        if (!active) return;
        setReport(result);
        setEventNames([...new Set(orders.map((order) => order.eventName))].sort());
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Gagal memuat laporan.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <p className="text-sm font-medium text-danger">{error}</p>;
  }

  if (!report) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return <ReportsView initialReport={report} eventNames={eventNames} />;
}
