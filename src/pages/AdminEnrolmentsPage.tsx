import { useEffect, useState } from "react";
import { CheckCircle2, GraduationCap, TrendingUp } from "lucide-react";
import { AdminTable } from "../components/admin/AdminTable";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { adminListEnrolments } from "../lib/adminApi";
import type { Enrolment } from "../types/enrolment";

export function AdminEnrolmentsPage() {
  const { sessionToken } = useAuth();
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    adminListEnrolments(sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setEnrolments(response.data.enrolments);
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

  const completedCount = enrolments.filter((item) => item.status === "COMPLETED").length;
  const averageProgress =
    enrolments.length > 0
      ? Math.round(enrolments.reduce((sum, item) => sum + item.progressPercent, 0) / enrolments.length)
      : 0;

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Badge tone="brand">Admin enrolments</Badge>
          <h1 className="mt-5 text-4xl font-bold text-ink">Enrolment operations.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Review learner enrolments, completion status, and progress percentages.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <GraduationCap className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">{enrolments.length}</p>
              <p className="mt-1 text-sm font-semibold text-muted">Total enrolments</p>
            </Card>
            <Card className="p-5">
              <CheckCircle2 className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">{completedCount}</p>
              <p className="mt-1 text-sm font-semibold text-muted">Completed</p>
            </Card>
            <Card className="p-5">
              <TrendingUp className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">{averageProgress}%</p>
              <p className="mt-1 text-sm font-semibold text-muted">Average progress</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-muted">Loading enrolments...</p>
          </Card>
        ) : null}

        {!isLoading && notice ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-red-700">{notice}</p>
          </Card>
        ) : null}

        {!isLoading && !notice ? (
          <AdminTable title="All enrolments">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3">Enrolment ID</th>
                  <th className="px-5 py-3">User ID</th>
                  <th className="px-5 py-3">Course ID</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {enrolments.map((enrolment) => (
                  <tr key={enrolment.enrolmentId}>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{enrolment.enrolmentId}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{enrolment.userId}</td>
                    <td className="px-5 py-3 font-semibold text-ink">{enrolment.courseId}</td>
                    <td className="px-5 py-3 text-muted">{enrolment.progressPercent}%</td>
                    <td className="px-5 py-3">
                      <Badge tone={enrolment.status === "COMPLETED" ? "success" : "neutral"}>
                        {enrolment.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {enrolment.enrolledAt ? new Date(enrolment.enrolledAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTable>
        ) : null}
      </section>
    </main>
  );
}
