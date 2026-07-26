import { useEffect, useState } from "react";
import { Award, BarChart3, ClipboardList, TrendingUp } from "lucide-react";
import { AdminMetricCard } from "../components/admin/AdminMetricCard";
import { AdminTable } from "../components/admin/AdminTable";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { adminDetailedReports } from "../lib/adminApi";
import type { AdminDetailedReportsData } from "../types/admin";

function renderCounts(counts: Record<string, number>) {
  return Object.entries(counts).map(([label, value]) => (
    <div key={label} className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <Badge>{value}</Badge>
    </div>
  ));
}

export function AdminReportsPage() {
  const { sessionToken } = useAuth();
  const [reports, setReports] = useState<AdminDetailedReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    adminDetailedReports(sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setReports(response.data);
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Badge tone="brand">Admin reports</Badge>
          <h1 className="mt-5 text-4xl font-bold text-ink">Reporting and audit overview.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Review platform distribution, progress health, quiz performance, certificate output, and audit activity.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-muted">Loading reports...</p>
          </Card>
        ) : null}

        {!isLoading && notice ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-red-700">{notice}</p>
          </Card>
        ) : null}

        {!isLoading && reports ? (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <AdminMetricCard label="Average progress" value={reports.averageProgress} icon={TrendingUp} />
              <AdminMetricCard label="Average quiz score" value={reports.averageQuizScore} icon={ClipboardList} />
              <AdminMetricCard label="Certificates issued" value={reports.certificatesIssued} icon={Award} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="text-brand-600" size={20} aria-hidden="true" />
                  <h2 className="text-lg font-bold text-ink">Roles</h2>
                </div>
                <div className="space-y-3">{renderCounts(reports.roleCounts)}</div>
              </Card>

              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="text-brand-600" size={20} aria-hidden="true" />
                  <h2 className="text-lg font-bold text-ink">Course categories</h2>
                </div>
                <div className="space-y-3">{renderCounts(reports.courseCategoryCounts)}</div>
              </Card>

              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="text-brand-600" size={20} aria-hidden="true" />
                  <h2 className="text-lg font-bold text-ink">Enrolment status</h2>
                </div>
                <div className="space-y-3">{renderCounts(reports.enrolmentStatusCounts)}</div>
              </Card>
            </div>

            <AdminTable title="Recent audit logs">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Actor</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {reports.recentAuditLogs.map((log) => (
                    <tr key={log.auditLogId}>
                      <td className="px-5 py-3 font-semibold text-ink">{log.action}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted">{log.actorUserId || "-"}</td>
                      <td className="px-5 py-3">
                        <Badge tone={log.status === "SUCCESS" ? "success" : "warning"}>{log.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTable>
          </div>
        ) : null}
      </section>
    </main>
  );
}
