import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SkipLink } from "@/components/layout/skip-link";
import { getPublicSettings } from "@/services/settings-service";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSettings();

  return (
    <>
      <SkipLink />
      <SiteHeader settings={settings} />
      <main id="konten-utama" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
