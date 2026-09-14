"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authenticate } from "@/services/admin-service";
import { defaultPublicSettings, getPublicSettings } from "@/services/settings-service";
import { ADMIN_SESSION_KEY, parseAdminSession, setAdminSession } from "@/lib/admin-session";
import { useHydrated, useStorageRaw } from "@/lib/local-store";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/feedback";
import { BrandMark } from "@/components/layout/brand-mark";
import { IconLock } from "@/components/ui/icons";

const DEMO = [
  { role: "Owner", email: "owner@geezplay.id" },
  { role: "Editor", email: "editor@geezplay.id" },
  { role: "Staff", email: "staff@geezplay.id" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const raw = useStorageRaw(ADMIN_SESSION_KEY);
  const hydrated = useHydrated();
  const session = useMemo(() => parseAdminSession(raw), [raw]);

  const [email, setEmail] = useState("owner@geezplay.id");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [logoUrl, setLogoUrl] = useState(defaultPublicSettings.logoUrl);

  useEffect(() => {
    let active = true;
    getPublicSettings().then((settings) => {
      if (active) setLogoUrl(settings.logoUrl);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated && session) {
      router.replace("/admin");
    }
  }, [hydrated, session, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await authenticate(email, password);
    setSubmitting(false);
    if (!result) {
      setError("Email atau password salah, atau akun tidak aktif.");
      return;
    }
    setAdminSession({
      user: result.user,
      token: result.token,
      createdAt: new Date().toISOString(),
    });
    router.replace("/admin");
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
        <Link href="/" aria-label="Beranda">
          <BrandMark logoUrl={logoUrl} size="lg" />
        </Link>
        <div>
          <h1 className="text-3xl font-black leading-tight">
            Panel Admin
            <br />
            Foto Balap
          </h1>
          <p className="mt-3 max-w-md text-sm text-slate-300">
            Kelola event, kelas balap, upload foto massal, katalog, order, voucher, dan
            laporan penjualan dalam satu tempat.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Area terbatas · Akses dicatat untuk keamanan
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Link href="/" aria-label="Beranda" className="mb-6 inline-flex">
              <BrandMark logoUrl={logoUrl} size="lg" />
            </Link>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-ink">Masuk admin</h1>
          <p className="mt-1 text-sm text-muted">
            Gunakan akun admin yang terdaftar untuk melanjutkan.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <Field id="email" label="Email" required>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@geezplay.id"
              />
            </Field>
            <Field id="password" label="Password" required error={error}>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(error)}
              />
            </Field>
            <Button type="submit" fullWidth size="lg" disabled={submitting}>
              {submitting ? <Spinner className="h-4 w-4" /> : <IconLock size={18} />}
              {submitting ? "Memeriksa…" : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-line bg-surface p-4">
            <p className="text-xs font-bold text-ink">Akun demo (password: admin123)</p>
            <ul className="mt-2 space-y-1">
              {DEMO.map((item) => (
                <li key={item.email} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{item.role}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(item.email);
                      setPassword("admin123");
                    }}
                    className="rounded font-semibold text-primary hover:underline"
                  >
                    {item.email}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            <Link href="/" className="font-semibold hover:text-primary-hover">
              Kembali ke website publik
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
