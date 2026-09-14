import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { getPublicSettings } from "@/services/settings-service";

export const metadata: Metadata = {
  title: "Admin GeezPlay",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings();
  return <AdminShell settings={settings}>{children}</AdminShell>;
}
