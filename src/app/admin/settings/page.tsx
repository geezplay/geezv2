"use client";

import { useEffect, useRef, useState } from "react";
import { getSettings, updateSettings, uploadLogo } from "@/services/admin-service";
import type { AdminSettings } from "@/lib/types";
import { AdminPageHeader, SectionCard } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/feedback";
import { useToast } from "@/context/toast-context";
import { IconUpload } from "@/components/ui/icons";

export default function AdminSettingsPage() {
  const [value, setValue] = useState<AdminSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();

  useEffect(() => {
    let active = true;
    getSettings()
      .then((result) => {
        if (active) setValue(result);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Gagal memuat pengaturan.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof AdminSettings>(key: K, next: AdminSettings[K]) => {
    setValue((current) => (current ? { ...current, [key]: next } : current));
  };

  const save = async () => {
    if (!value) return;
    setSaving(true);
    try {
      const result = await updateSettings(value);
      setValue(result);
      notify("Pengaturan disimpan.", "success");
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Gagal menyimpan.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadLogo(file);
      setValue((current) =>
        current ? { ...current, logoUrl: result.logoUrl } : result,
      );
      notify("Logo berhasil diunggah.", "success");
    } catch (reason) {
      notify(
        reason instanceof Error ? reason.message : "Gagal mengunggah logo.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  if (error) {
    return <p className="text-sm font-medium text-danger">{error}</p>;
  }

  if (!value) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Pengaturan"
        description="Konfigurasi umum, pembayaran, watermark, dan keamanan unduhan."
        action={
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan perubahan"}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Umum">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="block text-sm font-semibold text-ink">Logo brand</span>
              <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
                <span
                  aria-hidden="true"
                  className="h-12 w-12 shrink-0 rounded-lg bg-white bg-cover bg-center ring-1 ring-line"
                  style={{
                    backgroundImage: value.logoUrl
                      ? `url(${encodeURI(value.logoUrl)})`
                      : undefined,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-muted">
                    {value.logoUrl ||
                      "Belum ada logo diunggah (memakai ikon default)."}
                  </p>
                </div>
              </div>
              <input
                ref={logoInputRef}
                id="set-logo-file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleLogoUpload(file);
                  event.target.value = "";
                }}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={uploading}
                  onClick={() => logoInputRef.current?.click()}
                >
                  <IconUpload size={16} />
                  {uploading ? "Mengunggah…" : "Unggah logo"}
                </Button>
                {value.logoUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => update("logoUrl", "")}
                  >
                    Hapus logo
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted">
                Format PNG/JPG/WebP/SVG, maksimal 3 MB. Logo tampil di header, footer,
                dan panel admin.
              </p>
            </div>
            <Field id="set-email" label="Email bantuan" required>
              <Input
                id="set-email"
                type="email"
                value={value.supportEmail}
                onChange={(event) => update("supportEmail", event.target.value)}
              />
            </Field>
            <Field id="set-wa" label="WhatsApp bantuan">
              <Input
                id="set-wa"
                type="tel"
                value={value.supportWhatsapp}
                onChange={(event) => update("supportWhatsapp", event.target.value)}
              />
            </Field>
            <Field id="set-watermark" label="Teks watermark">
              <Input
                id="set-watermark"
                value={value.watermarkText}
                onChange={(event) => update("watermarkText", event.target.value)}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Pembayaran">
          <div className="space-y-4">
            <Field id="set-bank" label="Nama bank">
              <Input
                id="set-bank"
                value={value.bankName}
                onChange={(event) => update("bankName", event.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="set-account" label="Nomor rekening">
                <Input
                  id="set-account"
                  value={value.bankAccount}
                  onChange={(event) => update("bankAccount", event.target.value)}
                />
              </Field>
              <Field id="set-holder" label="Atas nama">
                <Input
                  id="set-holder"
                  value={value.bankHolder}
                  onChange={(event) => update("bankHolder", event.target.value)}
                />
              </Field>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-ink">Metode aktif</legend>
              {(
                [
                  ["qrisEnabled", "QRIS"],
                  ["bankTransferEnabled", "Transfer Bank"],
                  ["ewalletEnabled", "E-Wallet"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 rounded-lg border border-line p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={value[key]}
                    onChange={(event) => update(key, event.target.checked)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <span className="font-medium text-ink">{label}</span>
                </label>
              ))}
            </fieldset>
          </div>
        </SectionCard>

        <SectionCard title="Keamanan & Upload">
          <div className="space-y-4">
            <Field
              id="set-ttl"
              label="Masa berlaku tautan unduhan (menit)"
              hint="Signed URL kedaluwarsa setelah durasi ini."
            >
              <Input
                id="set-ttl"
                type="number"
                min={1}
                value={value.downloadLinkTtlMinutes}
                onChange={(event) =>
                  update("downloadLinkTtlMinutes", Number(event.target.value) || 1)
                }
              />
            </Field>
            <Field id="set-max" label="Ukuran maksimum upload (MB)">
              <Input
                id="set-max"
                type="number"
                min={1}
                value={value.maxUploadSizeMb}
                onChange={(event) =>
                  update("maxUploadSizeMb", Number(event.target.value) || 1)
                }
              />
            </Field>
            <p className="rounded-lg border border-line bg-surface p-3 text-xs text-muted">
              Foto original selalu disimpan di private storage. Endpoint download wajib
              memvalidasi order, status Paid, dan entitlement sebelum mengirim berkas.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Integrasi">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
              <span className="text-ink">Payment gateway</span>
              <span className="text-xs font-semibold text-warning">Belum terhubung</span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
              <span className="text-ink">Email transaksional</span>
              <span className="text-xs font-semibold text-warning">Belum terhubung</span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
              <span className="text-ink">WhatsApp API</span>
              <span className="text-xs font-semibold text-muted">Opsional</span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
              <span className="text-ink">Object storage (private)</span>
              <span className="text-xs font-semibold text-warning">Belum terhubung</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted">
            Integrasi backend akan diaktifkan pada fase berikutnya melalui environment
            variables.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
