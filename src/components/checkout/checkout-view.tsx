"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { validateVoucher } from "@/services/voucher-service";
import { createOrder } from "@/services/order-service";
import { getAppliedVoucherCode, setAppliedVoucherCode } from "@/lib/promo-storage";
import { classNames, formatRupiah } from "@/lib/format";
import type { PaymentMethod, Voucher } from "@/lib/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { EmptyState, Spinner } from "@/components/ui/feedback";
import { IconCart, IconLock, IconShield, IconTag } from "@/components/ui/icons";

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
}> = [
  {
    id: "qris",
    label: "QRIS",
    description: "Bayar dengan scan QR dari e-wallet atau m-banking apa pun.",
  },
  {
    id: "bank_transfer",
    label: "Transfer Bank",
    description: "Transfer ke rekening virtual yang dibuat otomatis.",
  },
  {
    id: "ewallet",
    label: "E-Wallet",
    description: "GoPay, OVO, DANA, ShopeePay, dan lainnya.",
  },
];

export function CheckoutView() {
  const router = useRouter();
  const { lines, subtotal, clear, ready } = useCart();
  const { notify } = useToast();

  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qris");
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [discount, setDiscount] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; whatsapp?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = getAppliedVoucherCode();
    if (!stored || !ready || subtotal <= 0) return;
    validateVoucher(stored, subtotal).then((result) => {
      if (result.valid) {
        setVoucher(result.voucher ?? null);
        setDiscount(result.discount);
      } else {
        setAppliedVoucherCode("");
      }
    });
  }, [ready, subtotal]);

  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  const validate = () => {
    const next: { email?: string; whatsapp?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Masukkan alamat email yang valid, misalnya nama@email.com.";
    }
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) {
      next.whatsapp = "Masukkan nomor WhatsApp yang valid (9-15 digit angka).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lines.length === 0) return;
    if (!validate()) {
      notify("Periksa kembali data yang kamu masukkan.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        paymentMethod,
        voucherCode: voucher?.code,
        items: lines.map((line) => ({
          catalogId: line.catalogId,
          photoId: line.photoId,
        })),
      });
      clear();
      setAppliedVoucherCode("");
      notify("Pesanan dibuat. Lanjutkan pembayaran.", "success");
      router.push(`/payment/status/${order.id}`);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Gagal membuat pesanan.",
        "error",
      );
      setSubmitting(false);
    }
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
        title="Tidak ada yang bisa di-checkout"
        description="Keranjang kamu kosong. Tambahkan foto terlebih dahulu."
        icon={<IconCart size={24} />}
        action={<ButtonLink href="/events">Cari foto</ButtonLink>}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
    >
      <div className="space-y-5">
        <section className="rounded-xl border border-line bg-white p-4 sm:p-5">
          <h2 className="text-base font-bold text-ink">Data pembeli</h2>
          <p className="mt-1 text-sm text-muted">
            Tidak perlu membuat akun. Kami hanya meminta data yang diperlukan untuk
            mengirim foto.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="email" label="Email" required error={errors.email}>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                placeholder="nama@email.com"
              />
            </Field>
            <Field id="whatsapp" label="Nomor WhatsApp" required error={errors.whatsapp}>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                aria-invalid={Boolean(errors.whatsapp)}
                aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
                placeholder="08xxxxxxxxxx"
              />
            </Field>
          </div>
        </section>

        <fieldset className="rounded-xl border border-line bg-white p-4 sm:p-5">
          <legend className="px-1 text-base font-bold text-ink">
            Metode pembayaran
          </legend>
          <div className="mt-2 space-y-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={classNames(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3",
                  paymentMethod === method.id
                    ? "border-primary bg-primary-soft"
                    : "border-line hover:border-primary/50",
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                  className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    {method.label}
                  </span>
                  <span className="block text-xs text-muted">{method.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <IconLock size={16} />
            Pembayaran aman
          </p>
          <p className="mt-1">
            Status pembayaran diverifikasi melalui payment gateway, bukan hanya dari
            halaman ini. Akses foto resolusi penuh diberikan setelah pembayaran
            terverifikasi.
          </p>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-sm font-bold text-ink">Ringkasan pesanan</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {lines.map((line) => (
              <li key={line.photoId} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-muted">
                  {line.title} · Bib {line.bibNumber}
                </span>
                <span className="shrink-0 font-semibold text-ink">
                  {formatRupiah(line.price)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatRupiah(subtotal)}</dd>
            </div>
            {voucher ? (
              <div className="flex justify-between">
                <dt className="inline-flex items-center gap-1 text-muted">
                  <IconTag size={14} />
                  {voucher.code}
                </dt>
                <dd className="font-semibold text-primary-hover">
                  -{formatRupiah(discount)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-line pt-2 text-base">
              <dt className="font-bold text-ink">Total bayar</dt>
              <dd className="font-bold text-primary-hover">{formatRupiah(total)}</dd>
            </div>
          </dl>

          <Button type="submit" fullWidth className="mt-4" disabled={submitting}>
            {submitting ? <Spinner className="h-4 w-4" /> : null}
            {submitting ? "Memproses…" : "Buat pesanan & bayar"}
          </Button>
          <Link
            href="/cart"
            className="mt-2 block text-center text-sm font-semibold text-muted hover:text-primary-hover"
          >
            Kembali ke keranjang
          </Link>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3 text-xs text-muted">
          <IconShield size={18} />
          <p>
            Dengan melanjutkan, kamu setuju data email dan WhatsApp digunakan hanya
            untuk keperluan transaksi ini.
          </p>
        </div>
      </aside>
    </form>
  );
}
