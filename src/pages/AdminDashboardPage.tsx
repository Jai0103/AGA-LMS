import { useEffect, useState } from "react";
import { Award, BookOpen, ClipboardList, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminMetricCard } from "../components/admin/AdminMetricCard";
import { AdminTable } from "../components/admin/AdminTable";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { adminReports } from "../lib/adminApi";
import type { AdminReportsData } from "../types/admin";

export function AdminDashboardPage() {
  const { sessionToken } = useAuth();
  const [reports, setReports] = useState<AdminReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    adminReports(sessionToken).then((response) => {
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
          <Badge tone="brand">Admin dashboard</Badge>
          <h1 className="mt-5 text-4xl font-bold text-ink">Platform operations overview.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Monitor users, courses, enrolments, quiz attempts, certificates, and backend activity.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/admin/users">
              <Button variant="secondary">Manage users</Button>
            </Link>
            <Link to="/admin/courses">
              <Button variant="secondary">Manage courses</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-muted">Loading admin reports...</p>
          </Card>
        ) : null}

        {!isLoading && notice ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-red-700">{notice}</p>
          </Card>
        ) : null}

        {!isLoading && reports ? (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              <AdminMetricCard label="Users" value={reports.metrics.totalUsers} icon={Users} />
              <AdminMetricCard label="Active users" value={reports.metrics.activeUsers} icon={ShieldCheck} />
              <AdminMetricCard label="Courses" value={reports.metrics.publishedCourses} icon={BookOpen} />
              <AdminMetricCard label="Enrolments" value={reports.metrics.totalEnrolments} icon={GraduationCap} />
              <AdminMetricCard label="Quiz attempts" value={reports.metrics.quizAttempts} icon={ClipboardList} />
              <AdminMetricCard label="Certificates" value={reports.metrics.certificatesIssued} icon={Award} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <AdminTable title="Recent users">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-muted">
                    <tr>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {reports.recentUsers.map((user) => (
                      <tr key={user.userId}>
                        <td className="px-5 py-3 font-semibold text-ink">{user.fullName}</td>
                        <td className="px-5 py-3 text-muted">{user.email}</td>
                        <td className="px-5 py-3">
                          <Badge>{user.role}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTable>

              <AdminTable title="Recent quiz attempts">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-muted">
                    <tr>
                      <th className="px-5 py-3">Attempt</th>
                      <th className="px-5 py-3">Score</th>
                      <th className="px-5 py-3">Passed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {reports.recentQuizAttempts.map((attempt) => (
                      <tr key={attempt.attemptId}>
                        <td className="px-5 py-3 font-semibold text-ink">{attempt.attemptId.slice(0, 18)}...</td>
                        <td className="px-5 py-3 text-muted">{attempt.score}%</td>
                        <td className="px-5 py-3">
                          <Badge tone={attempt.passed ? "success" : "warning"}>
                            {attempt.passed ? "Passed" : "Failed"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTable>

              <AdminTable title="Recent enrolments">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-muted">
                    <tr>
                      <th className="px-5 py-3">Course ID</th>
                      <th className="px-5 py-3">Progress</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {reports.recentEnrolments.map((enrolment) => (
                      <tr key={enrolment.enrolmentId}>
                        <td className="px-5 py-3 font-semibold text-ink">{enrolment.courseId}</td>
                        <td className="px-5 py-3 text-muted">{enrolment.progressPercent}%</td>
                        <td className="px-5 py-3">
                          <Badge tone={enrolment.status === "COMPLETED" ? "success" : "neutral"}>
                            {enrolment.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTable>

              <AdminTable title="Recent certificates">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-muted">
                    <tr>
                      <th className="px-5 py-3">Code</th>
                      <th className="px-5 py-3">Course ID</th>
                      <th className="px-5 py-3">Issued</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {reports.recentCertificates.map((certificate) => (
                      <tr key={certificate.certificateId}>
                        <td className="px-5 py-3 font-mono font-semibold text-ink">{certificate.certificateCode}</td>
                        <td className="px-5 py-3 text-muted">{certificate.courseId}</td>
                        <td className="px-5 py-3 text-muted">
                          {new Date(certificate.issuedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTable>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
