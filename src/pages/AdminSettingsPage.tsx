import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Mail,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { usePlatformSettings } from "../context/PlatformSettingsContext";
import { adminGetPlatformSettings, adminSavePlatformSettings } from "../lib/adminApi";
import type { AdminSavePlatformSettingsPayload, PlatformSettings } from "../types/admin";

const emptySettings: AdminSavePlatformSettingsPayload = {
  platformName: "AGA LMS",
  supportEmail: "support@example.com",
  certificateIssuerName: "AGA Learning Academy",
  certificateFooterText: "Issued by AGA LMS after backend-verified completion.",
  catalogueVisibility: "Public",
  maintenanceEnabled: false,
  maintenanceNotice: "Scheduled maintenance will be announced here.",
  securityNotice: "All learning records are validated by the secured Apps Script backend.",
};

export function AdminSettingsPage() {
  const { sessionToken } = useAuth();
  const { refreshSettings } = usePlatformSettings();
  const [settings, setSettings] = useState<AdminSavePlatformSettingsPayload>(emptySettings);
  const [savedSettings, setSavedSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const hasUnsavedChanges = useMemo(() => {
    if (!savedSettings) {
      return false;
    }

    return (
      settings.platformName !== savedSettings.platformName ||
      settings.supportEmail !== savedSettings.supportEmail ||
      settings.certificateIssuerName !== savedSettings.certificateIssuerName ||
      settings.certificateFooterText !== savedSettings.certificateFooterText ||
      settings.catalogueVisibility !== savedSettings.catalogueVisibility ||
      settings.maintenanceEnabled !== savedSettings.maintenanceEnabled ||
      settings.maintenanceNotice !== savedSettings.maintenanceNotice ||
      settings.securityNotice !== savedSettings.securityNotice
    );
  }, [savedSettings, settings]);

  useEffect(() => {
    loadSettings();
  }, [sessionToken]);

  async function loadSettings() {
    setIsLoading(true);
    setNotice("");
    setError("");

    try {
      const response = await adminGetPlatformSettings(sessionToken);

      if (!response.ok) {
        setError(response.error.message);
        return;
      }

      setSavedSettings(response.data.settings);
      setSettings({
        platformName: response.data.settings.platformName,
        supportEmail: response.data.settings.supportEmail,
        certificateIssuerName: response.data.settings.certificateIssuerName,
        certificateFooterText: response.data.settings.certificateFooterText,
        catalogueVisibility: response.data.settings.catalogueVisibility,
        maintenanceEnabled: response.data.settings.maintenanceEnabled,
        maintenanceNotice: response.data.settings.maintenanceNotice,
        securityNotice: response.data.settings.securityNotice,
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Settings could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");

    const payload: AdminSavePlatformSettingsPayload = {
      platformName: settings.platformName.replace(/\s+/g, " ").trim(),
      supportEmail: settings.supportEmail.trim().toLowerCase(),
      certificateIssuerName: settings.certificateIssuerName.replace(/\s+/g, " ").trim(),
      certificateFooterText: settings.certificateFooterText.trim(),
      catalogueVisibility: settings.catalogueVisibility,
      maintenanceEnabled: settings.maintenanceEnabled,
      maintenanceNotice: settings.maintenanceNotice.trim(),
      securityNotice: settings.securityNotice.trim(),
    };

    if (payload.platformName.length < 3) {
      setError("Platform name must be at least 3 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.supportEmail)) {
      setError("Support email must be valid.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await adminSavePlatformSettings(payload, sessionToken);

      if (!response.ok) {
        setError(response.error.message);
        return;
      }

      setSavedSettings(response.data.settings);
      setSettings({
        platformName: response.data.settings.platformName,
        supportEmail: response.data.settings.supportEmail,
        certificateIssuerName: response.data.settings.certificateIssuerName,
        certificateFooterText: response.data.settings.certificateFooterText,
        catalogueVisibility: response.data.settings.catalogueVisibility,
        maintenanceEnabled: response.data.settings.maintenanceEnabled,
        maintenanceNotice: response.data.settings.maintenanceNotice,
        securityNotice: response.data.settings.securityNotice,
      });
      setNotice("Platform settings saved.");
      await refreshSettings();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Settings could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge tone="brand">Admin settings</Badge>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-ink">Platform configuration.</h1>
              <p className="mt-3 max-w-2xl leading-7 text-muted">
                Manage production-facing LMS settings from one secured admin panel. Every save is validated in Apps Script and recorded in Google Sheets.
              </p>
            </div>
            <Button variant="secondary" onClick={loadSettings} disabled={isLoading || isSaving}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="border-b border-line bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-ink">Identity</h2>
                  <p className="text-sm font-semibold text-muted">Core platform and certificate labels.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-5 p-6 md:grid-cols-2">
              <TextField
                id="platformName"
                label="Platform name"
                value={settings.platformName}
                onChange={(value) => setSettings((current) => ({ ...current, platformName: value }))}
              />
              <TextField
                id="supportEmail"
                label="Support email"
                type="email"
                value={settings.supportEmail}
                onChange={(value) => setSettings((current) => ({ ...current, supportEmail: value }))}
              />
              <TextField
                id="certificateIssuerName"
                label="Certificate issuer name"
                value={settings.certificateIssuerName}
                onChange={(value) => setSettings((current) => ({ ...current, certificateIssuerName: value }))}
              />
              <SelectField
                id="catalogueVisibility"
                label="Catalogue visibility"
                value={settings.catalogueVisibility}
                onChange={(value) =>
                  setSettings((current) => ({ ...current, catalogueVisibility: value as PlatformSettings["catalogueVisibility"] }))
                }
                options={["Public", "Private"]}
              />
              <TextAreaField
                id="certificateFooterText"
                label="Certificate footer text"
                value={settings.certificateFooterText}
                onChange={(value) => setSettings((current) => ({ ...current, certificateFooterText: value }))}
                className="md:col-span-2"
              />
            </div>
          </Card>

          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="border-b border-line bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-950 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-ink">Notices</h2>
                  <p className="text-sm font-semibold text-muted">Operational and security messages.</p>
                </div>
              </div>
            </div>
            <div className="space-y-5 p-6">
              <label className="flex items-start gap-3 rounded-2xl border border-line bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={settings.maintenanceEnabled}
                  onChange={(event) => setSettings((current) => ({ ...current, maintenanceEnabled: event.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950"
                />
                <span>
                  <span className="block text-sm font-black text-ink">Enable maintenance notice</span>
                  <span className="mt-1 block text-sm leading-6 text-muted">
                    Use this when the LMS is undergoing planned updates or temporary support work.
                  </span>
                </span>
              </label>

              <TextAreaField
                id="maintenanceNotice"
                label="Maintenance notice"
                value={settings.maintenanceNotice}
                onChange={(value) => setSettings((current) => ({ ...current, maintenanceNotice: value }))}
              />
              <TextAreaField
                id="securityNotice"
                label="Security notice"
                value={settings.securityNotice}
                onChange={(value) => setSettings((current) => ({ ...current, securityNotice: value }))}
              />
            </div>
          </Card>

          <FormAlert tone="error" message={error} />
          <FormAlert tone="success" message={notice} />

          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-ink">
                {hasUnsavedChanges ? "You have unsaved changes." : "Settings are in sync."}
              </p>
              <p className="mt-1 text-sm text-muted">
                {savedSettings?.updatedAt ? `Last saved ${new Date(savedSettings.updatedAt).toLocaleString()}` : "Load settings to see the saved state."}
              </p>
            </div>
            <Button type="submit" variant="dark" disabled={isLoading || isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </form>

        <aside className="space-y-6">
          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-200">
                <Eye className="h-4 w-4" />
                Learner Preview
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight">{settings.platformName || "AGA LMS"}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-300">{settings.securityNotice}</p>
            </div>
            <div className="space-y-4 p-6">
              <PreviewRow label="Catalogue" value={settings.catalogueVisibility} />
              <PreviewRow label="Support" value={settings.supportEmail || "Not set"} />
              <PreviewRow label="Issuer" value={settings.certificateIssuerName || "Not set"} />
              <PreviewRow label="Maintenance" value={settings.maintenanceEnabled ? "Visible" : "Hidden"} />
            </div>
          </Card>

          <Card className="rounded-[1.5rem] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-ink">Backend Controls</h2>
                <p className="text-sm font-semibold text-muted">Admin role required.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm font-semibold text-muted">
              <p>Settings are stored in the `PlatformSettings` Google Sheet tab.</p>
              <p>Frontend values are treated as untrusted and validated again in Apps Script.</p>
              <p>Every successful save writes an audit log record.</p>
            </div>
          </Card>

          <Card className="rounded-[1.5rem] p-6">
            <div className="flex items-center gap-3 text-sm font-black text-ink">
              <Mail className="h-5 w-5 text-blue-700" />
              Support routing
            </div>
            <p className="mt-3 break-all text-sm font-semibold text-muted">{settings.supportEmail || "support@example.com"}</p>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-black text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-ink outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
      />
    </div>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-black text-ink">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold leading-6 text-ink outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-black text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-ink outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-muted">{label}</span>
      <span className="text-right text-sm font-black text-ink">{value}</span>
    </div>
  );
}

function FormAlert({ tone, message }: { tone: "error" | "success"; message: string }) {
  if (!message) {
    return null;
  }

  const className =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const icon = tone === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />;

  return (
    <div className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${className}`}>
      <span className="mt-0.5">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
