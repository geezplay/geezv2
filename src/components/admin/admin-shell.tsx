"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_SESSION_KEY, clearAdminSession, parseAdminSession } from "@/lib/admin-session";
import { useHydrated, useStorageRaw } from "@/lib/local-store";
import type { PublicSettings } from "@/lib/types";
import { classNames } from "@/lib/format";
import { Spinner } from "@/components/ui/feedback";
import { BrandMark } from "@/components/layout/brand-mark";
import {
  IconChart,
  IconClose,
  IconGrid,
  IconLogout,
  IconMenu,
  IconSettings,
  IconTag,
  IconTicket,
  IconUpload,
  IconUsers,
} from "@/components/ui/icons";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: IconGrid, exact: true },
  { href: "/admin/catalogs", label: "Katalog Foto", icon: IconTicket },
  { href: "/admin/upload", label: "Upload Foto", icon: IconUpload },
  { href: "/admin/orders", label: "Order", icon: IconTag },
  { href: "/admin/vouchers", label: "Voucher", icon: IconTicket },
  { href: "/admin/reports", label: "Laporan", icon: IconChart },
  { href: "/admin/users", label: "Admin & Role", icon: IconUsers },
  { href: "/admin/settings", label: "Pengaturan", icon: IconSettings },
];

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  editor: "Editor",
  staff: "Staff",
};

export function AdminShell({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: PublicSettings;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const raw = useStorageRaw(ADMIN_SESSION_KEY);
  const hydrated = useHydrated();
  const session = useMemo(() => parseAdminSession(raw), [raw]);
  const [open, setOpen] = useState(false);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    if (hydrated && !session) {
      router.replace("/admin/login");
    }
  }, [hydrated, session, isLogin, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <Spinner />
      </div>
    );
  }

  const current =
    NAV.slice().reverse().find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    ) ?? NAV[0];

  const handleLogout = () => {
    clearAdminSession();
    router.replace("/admin/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center gap-2 px-5">
        <BrandMark logoUrl={settings.logoUrl} size="lg" />
        <span className="ml-1 rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Admin
        </span>
      </div>
      <nav aria-label="Navigasi admin" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={classNames(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-slate-800 p-3">
        <Link
          href="/"
          className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          Lihat website publik
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-surface lg:hidden"
          >
            <IconMenu size={22} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-ink">{current.label}</h1>
            <p className="truncate text-xs text-muted">Panel administrasi</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{session.user.name}</p>
              <p className="text-xs text-muted">{ROLE_LABEL[session.user.role]}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-hover">
              {session.user.name.charAt(0)}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:border-danger hover:text-danger"
            >
              <IconLogout size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
        <footer className="border-t border-line px-4 py-4 text-center text-xs text-muted sm:px-6">
          Area admin · {new Date().getFullYear()}
        </footer>
      </div>

      {open ? (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-ink shadow lg:hidden"
        >
          <IconClose size={20} />
        </button>
      ) : null}
    </div>
  );
}
