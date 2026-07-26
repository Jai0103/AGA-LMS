import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { adminDetailedReports } from "../lib/adminApi";
import type { AdminAuditLog, AdminDetailedReportsData } from "../types/admin";

type AuditFilter = "ALL" | "SUCCESS" | "FAILED";

export function AdminReportsPage() {
  const { sessionToken } = useAuth();
  const [reports, setReports] = useState<AdminDetailedReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [auditFilter, setAuditFilter] = useState<AuditFilter>("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    void loadReports();
  }, [sessionToken]);

  async function loadReports() {
    setIsLoading(true);
    setNotice("");

    try {
      const response = await adminDetailedReports(sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      setReports(response.data);
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Reports could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  const auditLogs = reports?.recentAuditLogs ?? [];
  const filteredAuditLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return auditLogs.filter((log) => {
      const matchesStatus = auditFilter === "ALL" || log.status === auditFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [log.action, log.actorUserId, log.status, log.detailsJson, log.auditLogId]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [auditFilter, auditLogs, query]);

  const failedAuditCount = auditLogs.filter((log) => log.status !== "SUCCESS").length;
  const successfulAuditCount = auditLogs.length - failedAuditCount;

  function exportAuditCsv() {
    const rows = [
      ["Audit Log ID", "Action", "Actor User ID", "Status", "Details", "Created At"],
      ...filteredAuditLogs.map((log) => [
        log.auditLogId,
        log.action,
        log.actorUserId || "",
        log.status,
        summarizeDetails(log.detailsJson),
        log.createdAt,
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aga-lms-audit-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge tone="brand">Admin reports</Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
              Platform intelligence and audit health.
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-muted">
              Review training distribution, learner progress, quiz performance, certificate output, and protected backend activity from one operational view.
            </p>
          </div>

          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Security posture</p>
                  <h2 className="mt-3 text-2xl font-bold">
                    {failedAuditCount === 0 ? "No failed actions in recent logs" : `${failedAuditCount} failed actions need review`}
                  </h2>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  {failedAuditCount === 0 ? (
                    <ShieldCheck className="h-8 w-8 text-emerald-300" />
                  ) : (
                    <ShieldAlert className="h-8 w-8 text-amber-300" />
                  )}
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <MiniDarkStat label="Successful" value={successfulAuditCount} />
                <MiniDarkStat label="Failed" value={failedAuditCount} />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        {isLoading ? (
          <Card className="rounded-[1.5rem] p-8">
            <div className="h-4 w-44 rounded-full bg-slate-100" />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          </Card>
        ) : null}

        {!isLoading && notice ? (
          <Card className="rounded-[1.5rem] p-8 text-center">
            <XCircle className="mx-auto h-10 w-10 text-rose-600" />
            <p className="mt-4 text-sm font-bold text-red-700">{notice}</p>
            <button
              type="button"
              onClick={() => void loadReports()}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </button>
          </Card>
        ) : null}

        {!isLoading && reports ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <ReportMetricCard
                icon={<TrendingUp className="h-6 w-6" />}
                label="Average progress"
                value={`${reports.averageProgress.toLocaleString()}%`}
                caption="Across tracked enrolments"
              />
              <ReportMetricCard
                icon={<ClipboardList className="h-6 w-6" />}
                label="Average quiz score"
                value={`${reports.averageQuizScore.toLocaleString()}%`}
                caption="Across submitted attempts"
              />
              <ReportMetricCard
                icon={<Award className="h-6 w-6" />}
                label="Certificates issued"
                value={reports.certificatesIssued.toLocaleString()}
                caption="Validated completion awards"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <DistributionPanel
                icon={<Users className="h-5 w-5" />}
                title="Role distribution"
                counts={reports.roleCounts}
                emptyText="No users found"
              />
              <DistributionPanel
                icon={<BarChart3 className="h-5 w-5" />}
                title="Course categories"
                counts={reports.courseCategoryCounts}
                emptyText="No courses found"
              />
              <DistributionPanel
                icon={<Activity className="h-5 w-5" />}
                title="Enrolment status"
                counts={reports.enrolmentStatusCounts}
                emptyText="No enrolments found"
              />
            </div>

            <Card className="overflow-hidden rounded-[1.5rem]">
              <div className="border-b border-line p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-brand-600" />
                      <h2 className="text-lg font-bold text-ink">Recent audit logs</h2>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      Review backend actions, failed requests, and protected admin activity.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={exportAuditCsv}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-bold text-ink transition hover:border-slate-400"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
                  <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-slate-50 px-4">
                    <Search className="h-5 w-5 text-slate-400" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search action, actor, status, details, or audit ID"
                      className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-slate-400"
                    />
                  </label>

                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
                    <FilterButton active={auditFilter === "ALL"} onClick={() => setAuditFilter("ALL")}>
                      All
                    </FilterButton>
                    <FilterButton active={auditFilter === "SUCCESS"} onClick={() => setAuditFilter("SUCCESS")}>
                      Success
                    </FilterButton>
                    <FilterButton active={auditFilter === "FAILED"} onClick={() => setAuditFilter("FAILED")}>
                      Failed
                    </FilterButton>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-muted">
                    <tr>
                      <th className="px-5 py-3">Action</th>
                      <th className="px-5 py-3">Actor</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Details</th>
                      <th className="px-5 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.auditLogId} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-bold text-ink">{log.action}</p>
                          <p className="mt-1 max-w-[12rem] truncate font-mono text-xs text-muted">{log.auditLogId}</p>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-muted">{log.actorUserId || "-"}</td>
                        <td className="px-5 py-4">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="max-w-md px-5 py-4 text-xs leading-5 text-muted">
                          {summarizeDetails(log.detailsJson)}
                        </td>
                        <td className="px-5 py-4 text-muted">{formatDateTime(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAuditLogs.length === 0 ? (
                <div className="border-t border-line p-8 text-center">
                  <Search className="mx-auto h-9 w-9 text-slate-400" />
                  <h3 className="mt-4 text-lg font-bold text-ink">No audit logs match this view</h3>
                  <p className="mt-2 text-sm text-muted">Adjust the filter or search term to review more activity.</p>
                </div>
              ) : null}
            </Card>
          </>
        ) : null}
      </section>
    </main>
  );
}

function ReportMetricCard({
  icon,
  label,
  value,
  caption,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <Card className="rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">{icon}</div>
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      </div>
      <p className="mt-5 text-3xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm font-bold text-ink">{label}</p>
      <p className="mt-1 text-sm text-muted">{caption}</p>
    </Card>
  );
}

function DistributionPanel({
  icon,
  title,
  counts,
  emptyText,
}: {
  icon: ReactNode;
  title: string;
  counts: Record<string, number>;
  emptyText: string;
}) {
  const entries = Object.entries(counts).sort((first, second) => second[1] - first[1]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return (
    <Card className="rounded-[1.5rem] p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-brand-600">{icon}</span>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
        </div>
        <Badge>{total.toLocaleString()}</Badge>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-4 text-sm font-semibold text-muted">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          {entries.map(([label, value]) => {
            const width = total > 0 ? Math.max(6, Math.round((value / total) * 100)) : 0;

            return (
              <div key={label}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-ink">{label}</p>
                  <p className="text-sm font-bold text-muted">{value.toLocaleString()}</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function FilterButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
        active ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function MiniDarkStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "SUCCESS") {
    return <Badge tone="success">SUCCESS</Badge>;
  }

  return <Badge tone="warning">{status || "UNKNOWN"}</Badge>;
}

function summarizeDetails(detailsJson: string) {
  if (!detailsJson) {
    return "-";
  }

  try {
    const parsed = JSON.parse(detailsJson) as Record<string, unknown>;
    const preferredKeys = ["code", "message", "action", "courseId", "userId", "requestId"];
    const summary = preferredKeys
      .filter((key) => parsed[key] !== undefined && parsed[key] !== null && String(parsed[key]).trim() !== "")
      .map((key) => `${key}: ${String(parsed[key])}`)
      .join(" | ");

    return summary || detailsJson;
  } catch {
    return detailsJson;
  }
}

function escapeCsv(value: string) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function formatDateTime(value: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
