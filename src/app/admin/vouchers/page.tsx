"use client";

import { useEffect, useState } from "react";
import {
  createVoucher,
  listAdminVouchers,
  setVoucherActive,
} from "@/services/admin-service";
import type { Voucher } from "@/lib/types";
import { formatDate, formatRupiah } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/feedback";
import { useToast } from "@/context/toast-context";
import { IconPlus } from "@/components/ui/icons";

interface Draft {
  code: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minTransaction: number;
  maxUsage: number;
  startDate: string;
  endDate: string;
}

const emptyDraft: Draft = {
  code: "",
  description: "",
  discountType: "percent",
  discountValue: 10,
  minTransaction: 0,
  maxUsage: 100,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "2026-12-31",
};

function discountLabel(voucher: Voucher) {
  return voucher.discountType === "percent"
    ? `${voucher.discountValue}%`
    : formatRupiah(voucher.discountValue);
}

export default function AdminVouchersPage() {
  const [items, setItems] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState("");
  const { notify } = useToast();

  useEffect(() => {
    let active = true;
    listAdminVouchers()
      .then((result) => {
        if (active) setItems(result);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Gagal memuat voucher.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const save = async () => {
    if (!draft.code.trim()) {
      setError("Kode voucher wajib diisi.");
      return;
    }
    try {
      const created = await createVoucher({
        code: draft.code.trim().toUpperCase(),
        description: draft.description.trim(),
        discountType: draft.discountType,
        discountValue: draft.discountValue,
        minTransaction: draft.minTransaction,
        maxUsage: draft.maxUsage,
        startDate: draft.startDate,
        endDate: draft.endDate,
      });
      setItems((current) => [created, ...current]);
      notify(`Voucher ${created.code} dibuat.`, "success");
      setOpen(false);
      setDraft(emptyDraft);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal membuat voucher.");
    }
  };

  const toggle = async (voucher: Voucher) => {
    try {
      const updated = await setVoucherActive(voucher.code, !voucher.active);
      setItems((current) =>
        current.map((item) => (item.code === updated.code ? updated : item)),
      );
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Gagal mengubah voucher.", "error");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Voucher"
        description="Buat dan atur kode promo beserta batas penggunaan."
        action={
          <Button
            size="sm"
            onClick={() => {
              setDraft(emptyDraft);
              setError("");
              setOpen(true);
            }}
          >
            <IconPlus size={16} />
            Voucher baru
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((voucher) => (
            <div key={voucher.code} className="rounded-xl border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-black tracking-tight text-ink">
                    {voucher.code}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{voucher.description}</p>
                </div>
                {voucher.active ? (
                  <Badge tone="primary">Aktif</Badge>
                ) : (
                  <Badge tone="neutral">Nonaktif</Badge>
                )}
              </div>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Diskon</dt>
                  <dd className="font-semibold text-ink">{discountLabel(voucher)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Min. transaksi</dt>
                  <dd className="text-ink">{formatRupiah(voucher.minTransaction)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Penggunaan</dt>
                  <dd className="text-ink">
                    {voucher.used}/{voucher.maxUsage}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Periode</dt>
                  <dd className="text-right text-xs text-ink">
                    {formatDate(voucher.startDate, { day: "numeric", month: "short" })} -{" "}
                    {formatDate(voucher.endDate, { day: "numeric", month: "short" })}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(100, (voucher.used / voucher.maxUsage) * 100)}%`,
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => toggle(voucher)}
                className="mt-3 w-full rounded-lg border border-line py-2 text-xs font-semibold text-ink hover:border-primary hover:text-primary-hover"
              >
                {voucher.active ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Voucher baru"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="voucher-code" label="Kode" required>
              <Input
                id="voucher-code"
                value={draft.code}
                onChange={(event) =>
                  setDraft({ ...draft, code: event.target.value.toUpperCase() })
                }
                placeholder="Contoh: SERI2"
              />
            </Field>
            <Field id="voucher-type" label="Tipe diskon">
              <Select
                id="voucher-type"
                value={draft.discountType}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    discountType: event.target.value as "percent" | "fixed",
                  })
                }
              >
                <option value="percent">Persen (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </Select>
            </Field>
          </div>
          <Field id="voucher-value" label="Nilai diskon" required>
            <Input
              id="voucher-value"
              type="number"
              min={0}
              value={draft.discountValue}
              onChange={(event) =>
                setDraft({ ...draft, discountValue: Number(event.target.value) || 0 })
              }
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="voucher-min" label="Minimum transaksi">
              <Input
                id="voucher-min"
                type="number"
                min={0}
                value={draft.minTransaction}
                onChange={(event) =>
                  setDraft({ ...draft, minTransaction: Number(event.target.value) || 0 })
                }
              />
            </Field>
            <Field id="voucher-max" label="Maksimum penggunaan">
              <Input
                id="voucher-max"
                type="number"
                min={1}
                value={draft.maxUsage}
                onChange={(event) =>
                  setDraft({ ...draft, maxUsage: Number(event.target.value) || 1 })
                }
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="voucher-start" label="Mulai">
              <Input
                id="voucher-start"
                type="date"
                value={draft.startDate}
                onChange={(event) => setDraft({ ...draft, startDate: event.target.value })}
              />
            </Field>
            <Field id="voucher-end" label="Berakhir">
              <Input
                id="voucher-end"
                type="date"
                value={draft.endDate}
                onChange={(event) => setDraft({ ...draft, endDate: event.target.value })}
              />
            </Field>
          </div>
          <Field id="voucher-description" label="Deskripsi">
            <Input
              id="voucher-description"
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="Contoh: Diskon 10% semua pembelian"
            />
          </Field>
          {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
        </div>
      </Modal>
    </div>
  );
}
