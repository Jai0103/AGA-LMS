import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, BookOpen, CheckCircle2, ClipboardCheck, ExternalLink, GraduationCap, ShieldCheck, TrendingUp } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAuth } from "../context/AuthContext";
import { listMyTranscript } from "../lib/transcriptApi";
import type { TranscriptRecord } from "../types/transcript";

export function TranscriptPage() {
  const { user, sessionToken } = useAuth();
  const [records, setRecords] = useState<TranscriptRecord[]>([]);
  const [summary, setSummary] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    averageProgress: 0,
    passedQuizzes: 0,
    certificatesIssued: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    listMyTranscript(sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setRecords(response.data.records);
        setSummary(response.data.summary);
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

  const latestActivity = useMemo(() => {
    const dates = records
      .flatMap((record) => [
        record.enrolment.completedAt,
        record.latestQuizAttempt?.createdAt ?? "",
        record.certificate?.issuedAt ?? "",
      ])
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));

    return dates[0] ?? "";
  }, [records]);

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <Badge tone="brand">Learning transcript</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-ink md:text-5xl">
              Your backend-verified learning record.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Review enrolments, progress, quiz performance, course completion, and certificates for {user?.fullName}.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/dashboard">
                <Button>
                  <GraduationCap className="h-4 w-4" />
                  My learning
                </Button>
              </Link>
              <Link to="/certificates">
                <Button variant="secondary">
                  <Award className="h-4 w-4" />
                  Certificates
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-6 text-white md:p-8">
            <div className="grid h-full content-end gap-4 sm:grid-cols-2">
              <Metric label="Courses" value={summary.enrolledCourses} />
              <Metric label="Certificates" value={summary.certificatesIssued} />
              <Metric label="Completed" value={summary.completedCourses} />
              <Metric label="Avg progress" value={`${summary.averageProgress}%`} />
            </div>
          </div>
        </div>
      </section>

      {latestActivity ? (
        <section className="rounded-[1.5rem] border border-brand-100 bg-brand-50 p-5 text-sm font-bold text-brand-700">
          Latest transcript activity: {formatDate(latestActivity)}
        </section>
      ) : null}

      {isLoading ? (
        <Card className="rounded-[1.5rem] p-8 text-center">
          <p className="text-sm font-bold text-muted">Loading transcript...</p>
        </Card>
      ) : null}

      {!isLoading && notice ? (
        <Card className="rounded-[1.5rem] p-8 text-center">
          <p className="text-sm font-bold text-red-700">{notice}</p>
        </Card>
      ) : null}

      {!isLoading && !notice && records.length === 0 ? (
        <Card className="rounded-[1.5rem] p-8 text-center">
          <BookOpen className="mx-auto h-9 w-9 text-brand-700" />
          <h2 className="mt-4 text-2xl font-black text-ink">No transcript records yet.</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Enroll in a course to start building your learning transcript.</p>
          <Link to="/courses" className="mt-5 inline-flex">
            <Button>Browse courses</Button>
          </Link>
        </Card>
      ) : null}

      {!isLoading && records.length > 0 ? (
        <section className="grid gap-5">
          {records.map((record) => (
            <article key={record.enrolment.enrolmentId} className="overflow-hidden rounded-[1.5rem] border border-brand-100 bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[1fr_18rem]">
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={record.enrolment.status === "COMPLETED" ? "success" : "neutral"}>
                      {record.enrolment.status}
                    </Badge>
                    <Badge>{record.course.level}</Badge>
                    <Badge>{record.course.category}</Badge>
                  </div>

                  <h2 className="mt-4 text-2xl font-black text-ink">{record.course.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{record.course.subtitle}</p>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-sm font-black text-slate-700">
                      <span>Progress</span>
                      <span>{record.enrolment.progressPercent}%</span>
                    </div>
                    <ProgressBar value={record.enrolment.progressPercent} />
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <Detail label="Enrolled" value={formatDate(record.enrolment.enrolledAt)} />
                    <Detail label="Completed" value={formatDate(record.enrolment.completedAt)} />
                    <Detail
                      label="Best quiz"
                      value={record.bestQuizAttempt ? `${record.bestQuizAttempt.score}% ${record.bestQuizAttempt.passed ? "passed" : "failed"}` : "No attempt"}
                    />
                  </div>
                </div>

                <aside className="border-t border-brand-100 bg-slate-50 p-6 lg:border-l lg:border-t-0">
                  <div className="space-y-4">
                    <StatusLine
                      icon={<TrendingUp className="h-4 w-4" />}
                      label="Progress"
                      value={`${record.enrolment.progressPercent}%`}
                      done={record.enrolment.progressPercent >= 100}
                    />
                    <StatusLine
                      icon={<ClipboardCheck className="h-4 w-4" />}
                      label="Quiz"
                      value={record.latestQuizAttempt ? `${record.latestQuizAttempt.score}%` : "Not attempted"}
                      done={Boolean(record.bestQuizAttempt?.passed)}
                    />
                    <StatusLine
                      icon={<Award className="h-4 w-4" />}
                      label="Certificate"
                      value={record.certificate ? record.certificate.certificateCode : "Not issued"}
                      done={Boolean(record.certificate)}
                    />
                  </div>

                  <div className="mt-6 grid gap-3">
                    <Link to={`/learn/${record.course.courseId}`}>
                      <Button variant="secondary" className="w-full">
                        Continue course
                      </Button>
                    </Link>
                    {record.certificate ? (
                      <Link to={`/verify-certificate/${record.certificate.certificateCode}`}>
                        <Button className="w-full">
                          <ExternalLink className="h-4 w-4" />
                          Verify
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </aside>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/70">{label}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function StatusLine({ icon, label, value, done }: { icon: JSX.Element; label: string; value: string; done: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${done ? "bg-emerald-50 text-emerald-700" : "bg-white text-brand-700"}`}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-1 break-all text-sm font-black text-ink">{value}</p>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) {
    return "Not available";
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
