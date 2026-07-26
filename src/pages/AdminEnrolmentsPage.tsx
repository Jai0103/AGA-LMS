import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Download,
  GraduationCap,
  RefreshCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { adminListEnrolments } from "../lib/adminApi";
import type { Enrolment } from "../types/enrolment";

type StatusFilter = "ALL" | Enrolment["status"];
type ProgressFilter = "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "NEAR_COMPLETE" | "COMPLETED";

export function AdminEnrolmentsPage() {
  const { sessionToken } = useAuth();
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("ALL");

  useEffect(() => {
    void loadEnrolments();
  }, [sessionToken]);

  async function loadEnrolments() {
    setIsLoading(true);
    setNotice("");

    try {
      const response = await adminListEnrolments(sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      setEnrolments(response.data.enrolments);
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Enrolments could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  const completedCount = enrolments.filter((item) => item.status === "COMPLETED").length;
  const activeCount = enrolments.filter((item) => item.status === "ACTIVE").length;
  const averageProgress =
    enrolments.length > 0
      ? Math.round(enrolments.reduce((sum, item) => sum + normalizeProgress(item.progressPercent), 0) / enrolments.length)
      : 0;
  const completionRate = enrolments.length > 0 ? Math.round((completedCount / enrolments.length) * 100) : 0;

  const filteredEnrolments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return enrolments
      .filter((enrolment) => {
        const matchesStatus = statusFilter === "ALL" || enrolment.status === statusFilter;
        const matchesProgress = progressFilter === "ALL" || getProgressBand(enrolment) === progressFilter;

        if (!matchesStatus || !matchesProgress) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return [enrolment.enrolmentId, enrolment.userId, enrolment.courseId, enrolment.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((first, second) => getTime(second.enrolledAt) - getTime(first.enrolledAt));
  }, [enrolments, progressFilter, query, statusFilter]);

  const statusCounts = useMemo(() => {
    return enrolments.reduce<Record<Enrolment["status"], number>>(
      (counts, enrolment) => {
        counts[enrolment.status] += 1;
        return counts;
      },
      { ACTIVE: 0, COMPLETED: 0, CANCELLED: 0 },
    );
  }, [enrolments]);

  function exportCsv() {
    const rows = [
      ["Enrolment ID", "User ID", "Course ID", "Progress Percent", "Status", "Enrolled At", "Completed At"],
      ...filteredEnrolments.map((enrolment) => [
        enrolment.enrolmentId,
        enrolment.userId,
        enrolment.courseId,
        String(enrolment.progressPercent),
        enrolment.status,
        enrolment.enrolledAt,
        enrolment.completedAt,
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aga-lms-enrolments-${new Date().toISOString().slice(0, 10)}.csv`;
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
            <Badge tone="brand">Admin enrolments</Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
              Learner progress operations.
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-muted">
              Monitor enrolments, progress health, completion movement, and learning records across the secured LMS backend.
            </p>
          </div>

          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Completion health</p>
                  <h2 className="mt-3 text-2xl font-bold">{completionRate}% completion rate</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {completedCount.toLocaleString()} of {enrolments.length.toLocaleString()} enrolments completed.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <ShieldCheck className="h-8 w-8 text-emerald-300" />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  <span>Average progress</span>
                  <span>{averageProgress}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-300" style={{ width: `${averageProgress}%` }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard icon={<GraduationCap className="h-6 w-6" />} label="Total enrolments" value={enrolments.length} />
          <MetricCard icon={<Activity className="h-6 w-6" />} label="Active" value={activeCount} />
          <MetricCard icon={<CheckCircle2 className="h-6 w-6" />} label="Completed" value={completedCount} />
          <MetricCard icon={<TrendingUp className="h-6 w-6" />} label="Average progress" value={`${averageProgress}%`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <Card className="rounded-[1.5rem] p-5">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-bold text-ink">Status distribution</h2>
            </div>
            <div className="space-y-4">
              <DistributionRow label="ACTIVE" value={statusCounts.ACTIVE} total={enrolments.length} />
              <DistributionRow label="COMPLETED" value={statusCounts.COMPLETED} total={enrolments.length} />
              <DistributionRow label="CANCELLED" value={statusCounts.CANCELLED} total={enrolments.length} />
            </div>
          </Card>

          <Card className="rounded-[1.5rem] p-5">
            <div className="mb-5 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-bold text-ink">Progress bands</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <BandCard label="Not started" value={countBand(enrolments, "NOT_STARTED")} />
              <BandCard label="In progress" value={countBand(enrolments, "IN_PROGRESS")} />
              <BandCard label="Near complete" value={countBand(enrolments, "NEAR_COMPLETE")} />
              <BandCard label="Completed" value={countBand(enrolments, "COMPLETED")} />
            </div>
          </Card>
        </div>

        {notice ? (
          <Card className="rounded-[1.5rem] p-8 text-center">
            <XCircle className="mx-auto h-10 w-10 text-rose-600" />
            <p className="mt-4 text-sm font-bold text-red-700">{notice}</p>
            <button
              type="button"
              onClick={() => void loadEnrolments()}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </button>
          </Card>
        ) : null}

        <Card className="overflow-hidden rounded-[1.5rem]">
          <div className="border-b border-line p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-600" />
                  <h2 className="text-lg font-bold text-ink">All enrolments</h2>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Search learner records by enrolment ID, user ID, course ID, or status.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void loadEnrolments()}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-bold text-ink transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={filteredEnrolments.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-bold text-ink transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_auto_auto]">
              <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-slate-50 px-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search enrolment, user, course, or status"
                  className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="min-h-12 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <select
                value={progressFilter}
                onChange={(event) => setProgressFilter(event.target.value as ProgressFilter)}
                className="min-h-12 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              >
                <option value="ALL">All progress</option>
                <option value="NOT_STARTED">Not started</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="NEAR_COMPLETE">Near complete</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="h-4 w-44 rounded-full bg-slate-100" />
              <div className="mt-5 space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            </div>
          ) : null}

          {!isLoading && !notice ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-3">Enrolment</th>
                    <th className="px-5 py-3">Learner</th>
                    <th className="px-5 py-3">Course</th>
                    <th className="px-5 py-3">Progress</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredEnrolments.map((enrolment) => {
                    const progress = normalizeProgress(enrolment.progressPercent);

                    return (
                      <tr key={enrolment.enrolmentId} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs font-bold text-ink">{shortId(enrolment.enrolmentId)}</p>
                          <p className="mt-1 max-w-[14rem] truncate font-mono text-xs text-muted">{enrolment.enrolmentId}</p>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-muted">{enrolment.userId}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-ink">{enrolment.courseId}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="min-w-40">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-bold text-ink">{progress}%</p>
                              <ProgressBadge progress={progress} />
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={enrolment.status} />
                        </td>
                        <td className="px-5 py-4 text-muted">
                          <p>Enrolled: {formatDate(enrolment.enrolledAt)}</p>
                          <p className="mt-1">Completed: {formatDate(enrolment.completedAt)}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {!isLoading && !notice && filteredEnrolments.length === 0 ? (
            <div className="border-t border-line p-8 text-center">
              <Search className="mx-auto h-9 w-9 text-slate-400" />
              <h3 className="mt-4 text-lg font-bold text-ink">No enrolments match this view</h3>
              <p className="mt-2 text-sm text-muted">Adjust the search, status filter, or progress filter.</p>
            </div>
          ) : null}
        </Card>

        <div className="rounded-2xl border border-line bg-white p-4 text-sm leading-6 text-muted">
          Enrolment records are read from Google Sheets through the secured Apps Script backend. Student progress and
          completion should still be updated only through protected backend actions.
        </div>
      </section>
    </main>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <Card className="rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">{icon}</div>
        <Award className="h-5 w-5 text-emerald-500" />
      </div>
      <p className="mt-5 text-3xl font-bold text-ink">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
    </Card>
  );
}

function DistributionRow({ label, value, total }: { label: Enrolment["status"]; value: number; total: number }) {
  const width = total > 0 ? Math.max(5, Math.round((value / total) * 100)) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <StatusBadge status={label} />
        <p className="text-sm font-bold text-muted">{value.toLocaleString()}</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function BandCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-slate-50 p-4">
      <p className="text-2xl font-bold text-ink">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Enrolment["status"] }) {
  if (status === "COMPLETED") {
    return <Badge tone="success">COMPLETED</Badge>;
  }

  if (status === "CANCELLED") {
    return <Badge tone="warning">CANCELLED</Badge>;
  }

  return <Badge>ACTIVE</Badge>;
}

function ProgressBadge({ progress }: { progress: number }) {
  if (progress >= 100) {
    return <Badge tone="success">Complete</Badge>;
  }

  if (progress >= 75) {
    return <Badge tone="brand">Near complete</Badge>;
  }

  if (progress > 0) {
    return <Badge>In progress</Badge>;
  }

  return <Badge tone="warning">Not started</Badge>;
}

function countBand(enrolments: Enrolment[], band: ProgressFilter) {
  return enrolments.filter((enrolment) => getProgressBand(enrolment) === band).length;
}

function getProgressBand(enrolment: Enrolment): ProgressFilter {
  const progress = normalizeProgress(enrolment.progressPercent);

  if (progress >= 100 || enrolment.status === "COMPLETED") {
    return "COMPLETED";
  }

  if (progress >= 75) {
    return "NEAR_COMPLETE";
  }

  if (progress > 0) {
    return "IN_PROGRESS";
  }

  return "NOT_STARTED";
}

function normalizeProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function getTime(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function shortId(value: string) {
  if (!value) {
    return "-";
  }

  return value.length > 18 ? `${value.slice(0, 18)}...` : value;
}

function escapeCsv(value: string) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function formatDate(value: string) {
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
  }).format(date);
}
