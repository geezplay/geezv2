"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { validateVoucher } from "@/services/voucher-service";
import { PROMO_KEY, setAppliedVoucherCode } from "@/lib/promo-storage";
import { useStorageRaw } from "@/lib/local-store";
import { formatRupiah } from "@/lib/format";
import { PhotoThumb } from "@/components/ui/photo-thumb";
import { WatermarkOverlay } from "@/components/catalog/catalog-preview-sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { EmptyState, Spinner } from "@/components/ui/feedback";
import { IconCart, IconTag, IconTrash } from "@/components/ui/icons";
import type { Voucher } from "@/lib/types";

export function CartView() {
  const { lines, remove, subtotal, ready } = useCart();
  const { notify } = useToast();
  const appliedCode = useStorageRaw(PROMO_KEY) ?? "";
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [applied, setApplied] = useState<Voucher | null>(null);
  const [discount, setDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState("");

  useEffect(() => {
    if (!ready || subtotal <= 0 || !appliedCode) return;
    let active = true;
    validateVoucher(appliedCode, subtotal).then((result) => {
      if (!active) return;
      if (result.valid) {
        setApplied(result.voucher ?? null);
        setDiscount(result.discount);
        setVoucherError("");
      } else {
        setApplied(null);
        setDiscount(0);
        setVoucherError(result.message);
      }
    });
    return () => {
      active = false;
    };
  }, [appliedCode, ready, subtotal]);

  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  const applyVoucher = async () => {
    setChecking(true);
    setVoucherError("");
    const result = await validateVoucher(code, subtotal);
    setChecking(false);
    if (result.valid) {
      setApplied(result.voucher ?? null);
      setDiscount(result.discount);
      setAppliedVoucherCode(code.trim().toUpperCase());
      notify(result.message, "success");
    } else {
      setApplied(null);
      setDiscount(0);
      setVoucherError(result.message);
      setAppliedVoucherCode("");
      notify(result.message, "error");
    }
  };

  const removeVoucher = () => {
    setApplied(null);
    setDiscount(0);
    setVoucherError("");
    setCode("");
    setAppliedVoucherCode("");
  };

  if (!ready) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        title="Keranjang masih kosong"
        description="Pilih event dan kelas balap, lalu tambahkan foto yang ingin kamu beli."
        icon={<IconCart size={24} />}
        action={<ButtonLink href="/events">Jelajahi event</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <ul className="space-y-3">
        {lines.map((line) => (
          <li
            key={line.photoId}
            className="flex gap-3 rounded-xl border border-line bg-white p-3"
          >
            <Link
              href={`/photos/${line.photoId}`}
              className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg"
              aria-label={`Lihat foto nomor ${line.bibNumber}`}
            >
              <PhotoThumb
                previewUrl={line.previewUrl}
                seed={line.photoId}
                alt={`Preview foto nomor ${line.bibNumber}`}
                className="h-full w-full"
              />
              <WatermarkOverlay dense />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link
                href={`/catalog/${line.catalogId}`}
                className="truncate text-sm font-bold text-ink hover:text-primary-hover"
              >
                {line.title}
              </Link>
              <p className="mt-0.5 text-xs text-muted">
                Bib {line.bibNumber} · {line.variant}
              </p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-primary-hover">
                  {formatRupiah(line.price)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    remove(line.photoId);
                    notify("Foto dihapus dari keranjang.", "info");
                  }}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-danger hover:bg-danger-soft"
                  aria-label={`Hapus foto nomor ${line.bibNumber} dari keranjang`}
                >
                  <IconTrash size={15} />
                  Hapus
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-sm font-bold text-ink">Kode voucher</h2>
          {applied ? (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary-soft px-3 py-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-hover">
                <IconTag size={16} />
                {applied.code} diterapkan
              </span>
              <button
                type="button"
                onClick={removeVoucher}
                className="rounded px-2 py-1 text-xs font-semibold text-danger hover:bg-white"
              >
                Lepas
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <Field id="voucher" label="Kode voucher">
                <Input
                  id="voucher"
                  name="voucher"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="Contoh: GEAR10"
                  aria-invalid={Boolean(voucherError)}
                  aria-describedby={voucherError ? "voucher-error" : undefined}
                />
              </Field>
              {voucherError ? (
                <p id="voucher-error" className="text-xs font-medium text-danger">
                  {voucherError}
                </p>
              ) : null}
              <Button
                variant="secondary"
                fullWidth
                onClick={applyVoucher}
                disabled={checking || !code.trim()}
              >
                {checking ? <Spinner className="h-4 w-4" /> : null}
                Gunakan voucher
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-sm font-bold text-ink">Ringkasan pesanan</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Jumlah foto</dt>
              <dd className="font-semibold text-ink">{lines.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatRupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Diskon</dt>
              <dd className="font-semibold text-primary-hover">
                -{formatRupiah(discount)}
              </dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-bold text-ink">Total</dt>
              <dd className="font-bold text-primary-hover">{formatRupiah(total)}</dd>
            </div>
          </dl>
          <ButtonLink href="/checkout" fullWidth className="mt-4">
            Lanjut ke checkout
          </ButtonLink>
          <Link
            href="/events"
            className="mt-2 block text-center text-sm font-semibold text-muted hover:text-primary-hover"
          >
            Lanjut belanja
          </Link>
        </div>
      </aside>
    </div>
  );
}
