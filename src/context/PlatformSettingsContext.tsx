import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getPlatformSettings } from "../lib/platformSettingsApi";
import type { PublicPlatformSettings } from "../types/platformSettings";

export const defaultPlatformSettings: PublicPlatformSettings = {
  platformName: "AGA LMS",
  supportEmail: "support@example.com",
  certificateIssuerName: "AGA Learning Academy",
  certificateFooterText: "Issued by AGA LMS after backend-verified completion.",
  catalogueVisibility: "Public",
  maintenanceEnabled: false,
  maintenanceNotice: "Scheduled maintenance will be announced here.",
  securityNotice: "All learning records are validated by the secured Apps Script backend.",
  updatedAt: "",
};

type PlatformSettingsContextValue = {
  settings: PublicPlatformSettings;
  isLoading: boolean;
  error: string;
  refreshSettings: () => Promise<void>;
};

const PlatformSettingsContext = createContext<PlatformSettingsContextValue | null>(null);

export function PlatformSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PublicPlatformSettings>(defaultPlatformSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshSettings() {
    setIsLoading(true);
    setError("");

    try {
      const response = await getPlatformSettings();

      if (!response.ok) {
        setError(response.error.message);
        setSettings(defaultPlatformSettings);
        return;
      }

      setSettings(response.data.settings);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Platform settings could not be loaded.");
      setSettings(defaultPlatformSettings);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshSettings();
  }, []);

  const value = useMemo<PlatformSettingsContextValue>(
    () => ({
      settings,
      isLoading,
      error,
      refreshSettings,
    }),
    [error, isLoading, settings],
  );

  return <PlatformSettingsContext.Provider value={value}>{children}</PlatformSettingsContext.Provider>;
}

export function usePlatformSettings() {
  const context = useContext(PlatformSettingsContext);

  if (!context) {
    throw new Error("usePlatformSettings must be used inside PlatformSettingsProvider.");
  }

  return context;
}
