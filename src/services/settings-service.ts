import { apiFetch } from "@/lib/api";
import type { PublicSettings } from "@/lib/types";

export const defaultPublicSettings: PublicSettings = {
  siteName: "GeezPlay",
  brandName: "GeezPlay",
  logoUrl: "",
  supportEmail: "",
  supportWhatsapp: "",
  watermarkText: "GEEZPLAY",
};

export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const settings = await apiFetch<PublicSettings>("/api/settings");
    return { ...defaultPublicSettings, ...settings };
  } catch {
    return defaultPublicSettings;
  }
}
