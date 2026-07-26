export type PublicPlatformSettings = {
  platformName: string;
  supportEmail: string;
  certificateIssuerName: string;
  certificateFooterText: string;
  catalogueVisibility: "Public" | "Private";
  maintenanceEnabled: boolean;
  maintenanceNotice: string;
  securityNotice: string;
  updatedAt: string;
};

export type PlatformSettingsData = {
  settings: PublicPlatformSettings;
};
