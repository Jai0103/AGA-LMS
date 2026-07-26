import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  GraduationCap,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAuth } from "../context/AuthContext";
import { listMyCertificates } from "../lib/certificateApi";
import { listMyEnrolments } from "../lib/enrolmentApi";
import type { CertificateWithCourse } from "../types/certificate";
import type { Enrolment, EnrolmentWithCourse } from "../types/enrolment";

type StatusFilter = "ALL" | Enrolment["status"];

export function StudentDashboardPage() {
  const { user, sessionToken } = useAuth();
  const [enrolments, setEnrolments] = useState<EnrolmentWithCourse[]>([]);
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    void loadDashboard();
  }, [sessionToken]);

  async function loadDashboard() {
    setIsLoading(true);
    setNotice("");

    try {
      const [enrolmentsResponse, certificatesResponse] = await Promise.all([
        listMyEnrolments(sessionToken),
        listMyCertificates(sessionToken),
      ]);

      if (enrolmentsResponse.ok) {
        setEnrolments(enrolmentsResponse.data.enrolments);
      } else {
        setNotice(enrolmentsResponse.error.message);
      }

      if (certificatesResponse.ok) {
        setCertificates(certificatesResponse.data.certificates);
      }
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Dashboard could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  const averageProgress = useMemo(() => {
    if (enrolments.length === 0) {
      return 0;
    }

    const total = enrolments.reduce((sum, item) => sum + normalizeProgress(item.enrolment.progressPercent), 0);
    return Math.round(total / enrolments.length);
  }, [enrolments]);

  const completedCount = enrolments.filter((item) => item.enrolment.status === "COMPLETED").length;
  const activeCount = enrolments.filter((item) => item.enrolment.status === "ACTIVE").length;

  const nextCourse = useMemo(() => {
    return [...enrolments]
      .filter((item) => item.enrolment.status !== "COMPLETED")
      .sort((first, second) => normalizeProgress(second.enrolment.progressPercent) - normalizeProgress(first.enrolment.progressPercent))[0];
  }, [enrolments]);

  const filteredEnrolments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return enrolments
      .filter((item) => {
        const matchesStatus = statusFilter === "ALL" || item.enrolment.status === statusFilter;

        if (!matchesStatus) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return [
          item.course.title,
          item.course.subtitle,
          item.course.category,
          item.course.level,
          item.course.trainerName,
          item.enrolment.status,
          item.enrolment.courseId,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((first, second) => getTime(second.enrolment.enrolledAt) - getTime(first.enrolment.enrolledAt));
  }, [enrolments, query, statusFilter]);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge tone="brand">Student dashboard</Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
              Welcome back, {user?.fullName || "learner"}.
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-muted">
              Continue your learning, track progress, complete quizzes, and manage verified certificates from one focused dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={nextCourse ? `/learn/${nextCourse.course.courseId}` : "/courses"}>
                <Button>
                  {nextCourse ? "Continue learning" : "Browse courses"}
                  <ArrowRight size={17} aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/certificates">
                <Button variant="secondary">
                  <Award size={17} aria-hidden="true" />
                  View certificates
                </Button>
              </Link>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Learning focus</p>
                  <h2 className="mt-3 text-2xl font-bold">
                    {nextCourse ? nextCourse.course.title : "Start a new course"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {nextCourse
                      ? `${normalizeProgress(nextCourse.enrolment.progressPercent)}% complete - continue where you left off.`
                      : "Enroll in a published course to begin tracking progress."}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <GraduationCap className="h-8 w-8 text-brand-100" />
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  <span>Average progress</span>
                  <span>{averageProgress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-300" style={{ width: `${averageProgress}%` }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard icon={<BookOpenCheck className="h-6 w-6" />} label="Enrolled" value={enrolments.length} />
          <MetricCard icon={<TrendingUp className="h-6 w-6" />} label="Average progress" value={`${averageProgress}%`} />
          <MetricCard icon={<CheckCircle2 className="h-6 w-6" />} label="Completed" value={completedCount} />
          <MetricCard icon={<Award className="h-6 w-6" />} label="Certificates" value={certificates.length} />
        </div>

        {notice ? (
          <Card className="rounded-[1.5rem] p-8 text-center">
            <XCircle className="mx-auto h-10 w-10 text-rose-600" />
            <p className="mt-4 text-sm font-bold text-red-700">{notice}</p>
            <Button className="mt-5" onClick={() => void loadDashboard()}>
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </Card>
        ) : null}

        <Card className="overflow-hidden rounded-[1.5rem]">
          <div className="border-b border-line p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-600" />
                  <h2 className="text-lg font-bold text-ink">My learning</h2>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {activeCount} active course{activeCount === 1 ? "" : "s"} and {completedCount} completed course{completedCount === 1 ? "" : "s"}.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link to="/courses">
                  <Button variant="secondary" className="w-full">
                    Browse more courses
                  </Button>
                </Link>
                <Button variant="secondary" onClick={() => void loadDashboard()} disabled={isLoading}>
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-slate-50 px-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search your courses, categories, trainers, or status"
                  className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="min-h-12 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="h-4 w-44 rounded-full bg-slate-100" />
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {[0, 1].map((item) => (
                  <div key={item} className="h-64 animate-pulse rounded-[1.5rem] bg-slate-100" />
                ))}
              </div>
            </div>
          ) : null}

          {!isLoading && !notice && enrolments.length === 0 ? (
            <div className="p-8 text-center">
              <GraduationCap className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-4 text-2xl font-bold text-ink">No courses yet</h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">
                Enroll in a course to start tracking progress, quizzes, and certificates.
              </p>
              <Link to="/courses" className="mt-5 inline-flex">
                <Button>
                  Explore catalogue
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </Link>
            </div>
          ) : null}

          {!isLoading && !notice && enrolments.length > 0 ? (
            <div className="p-5">
              {filteredEnrolments.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {filteredEnrolments.map((item) => (
                    <LearningCard key={item.enrolment.enrolmentId} item={item} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Search className="mx-auto h-9 w-9 text-slate-400" />
                  <h3 className="mt-4 text-xl font-bold text-ink">No courses match this view</h3>
                  <p className="mt-2 text-sm text-muted">Adjust the search or status filter.</p>
                </div>
              )}
            </div>
          ) : null}
        </Card>

        {certificates.length > 0 ? (
          <Card className="rounded-[1.5rem] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink">Verified certificates</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    You have {certificates.length} issued certificate{certificates.length === 1 ? "" : "s"} ready to view or share.
                  </p>
                </div>
              </div>
              <Link to="/certificates">
                <Button>
                  Open certificates
                  <Award className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ) : null}
      </section>
    </main>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <Card className="rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">{icon}</div>
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      </div>
      <p className="mt-5 text-3xl font-bold text-ink">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
    </Card>
  );
}

function LearningCard({ item }: { item: EnrolmentWithCourse }) {
  const progress = normalizeProgress(item.enrolment.progressPercent);
  const completed = item.enrolment.status === "COMPLETED" || progress >= 100;

  return (
    <Card className="flex h-full flex-col rounded-[1.5rem] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Badge tone={completed ? "success" : "neutral"}>{item.enrolment.status}</Badge>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
          <Clock size={16} aria-hidden="true" />
          {item.course.duration}
        </span>
      </div>

      <div className="flex-1">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-700">{item.course.category}</p>
        <h3 className="mt-2 text-xl font-bold leading-tight text-ink">{item.course.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{item.course.subtitle}</p>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link to={`/learn/${item.course.courseId}`} className="flex-1">
          <Button className="w-full">
            {completed ? "Review course" : "Continue"}
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </Link>
        <Link to={`/learn/${item.course.courseId}/quiz`} className="flex-1">
          <Button variant="secondary" className="w-full">
            Quiz
          </Button>
        </Link>
      </div>
    </Card>
  );
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
