import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileCheck2,
  GraduationCap,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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
import type { EnrolmentWithCourse } from "../types/enrolment";

export function StudentDashboardPage() {
  const { user, sessionToken } = useAuth();
  const [enrolments, setEnrolments] = useState<EnrolmentWithCourse[]>([]);
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([listMyEnrolments(sessionToken), listMyCertificates(sessionToken)]).then(
      ([enrolmentsResponse, certificatesResponse]) => {
        if (!isMounted) {
          return;
        }

        if (enrolmentsResponse.ok) {
          setEnrolments(enrolmentsResponse.data.enrolments);
        } else {
          setNotice(enrolmentsResponse.error.message);
        }

        if (certificatesResponse.ok) {
          setCertificates(certificatesResponse.data.certificates);
        }

        setIsLoading(false);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

  const sortedEnrolments = useMemo(() => {
    return [...enrolments].sort((left, right) => {
      const leftProgress = Number(left.enrolment.progressPercent || 0);
      const rightProgress = Number(right.enrolment.progressPercent || 0);

      if (leftProgress === 100 && rightProgress !== 100) {
        return 1;
      }

      if (rightProgress === 100 && leftProgress !== 100) {
        return -1;
      }

      return rightProgress - leftProgress;
    });
  }, [enrolments]);

  const averageProgress = useMemo(() => {
    if (enrolments.length === 0) {
      return 0;
    }

    const total = enrolments.reduce((sum, item) => sum + Number(item.enrolment.progressPercent || 0), 0);
    return Math.round(total / enrolments.length);
  }, [enrolments]);

  const completedCourses = useMemo(() => {
    return enrolments.filter((item) => Number(item.enrolment.progressPercent || 0) >= 100 || item.enrolment.status === "COMPLETED").length;
  }, [enrolments]);

  const activeCourses = enrolments.length - completedCourses;
  const nextCourse = sortedEnrolments.find((item) => Number(item.enrolment.progressPercent || 0) < 100) ?? sortedEnrolments[0];
  const latestCertificate = certificates[0];

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Badge tone="brand">Student dashboard</Badge>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <h1 className="text-4xl font-bold leading-tight text-ink lg:text-5xl">Welcome back, {user?.fullName}.</h1>
              <p className="mt-3 max-w-2xl leading-7 text-muted">
                Continue learning, track your progress, complete quizzes, and manage certificates from one focused
                dashboard.
              </p>
            </div>

            <Card className="overflow-hidden">
              <div className="bg-slate-950 p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-brand-100">Continue learning</p>
                    <h2 className="mt-2 text-xl font-bold">{nextCourse ? nextCourse.course.title : "Explore your first course"}</h2>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 text-brand-100">
                    <PlayCircle size={24} aria-hidden="true" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                {nextCourse ? (
                  <>
                    <div className="mb-3 flex justify-between text-sm font-bold text-slate-700">
                      <span>Progress</span>
                      <span>{nextCourse.enrolment.progressPercent}%</span>
                    </div>
                    <ProgressBar value={nextCourse.enrolment.progressPercent} />
                    <Link to={`/learn/${nextCourse.course.courseId}`} className="mt-5 inline-flex w-full">
                      <Button className="w-full">
                        Resume course
                        <ArrowRight size={16} aria-hidden="true" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link to="/courses" className="inline-flex w-full">
                    <Button className="w-full">
                      Browse catalogue
                      <ArrowRight size={16} aria-hidden="true" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardMetric icon={<BookOpen size={24} />} label="Enrolled courses" value={String(enrolments.length)} />
            <DashboardMetric icon={<TrendingUp size={24} />} label="Average progress" value={`${averageProgress}%`} />
            <DashboardMetric icon={<CheckCircle2 size={24} />} label="Completed courses" value={String(completedCourses)} />
            <DashboardMetric icon={<Award size={24} />} label="Certificates issued" value={String(certificates.length)} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-ink">My learning</h2>
              <p className="mt-1 text-sm text-muted">Courses enrolled through the secure backend.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/certificates">
                <Button variant="secondary">View certificates</Button>
              </Link>
              <Link to="/courses">
                <Button variant="secondary">Browse more courses</Button>
              </Link>
            </div>
          </div>

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

          {!isLoading && !notice && enrolments.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <GraduationCap size={24} aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-ink">No courses yet</h3>
              <p className="mx-auto mt-2 max-w-xl text-muted">
                Enroll in a course to unlock your learning dashboard, progress tracking, quizzes, and certificates.
              </p>
              <Link to="/courses" className="mt-5 inline-flex">
                <Button>
                  Explore catalogue
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </Link>
            </Card>
          ) : null}

          {!isLoading && !notice && enrolments.length > 0 ? (
            <div className="grid gap-5">
              {sortedEnrolments.map((item) => (
                <LearningCard key={item.enrolment.enrolmentId} item={item} />
              ))}
            </div>
          ) : null}
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-ink">Learning snapshot</h2>
            <div className="mt-4 grid gap-3">
              <SnapshotRow label="Active courses" value={String(activeCourses)} />
              <SnapshotRow label="Completed" value={String(completedCourses)} />
              <SnapshotRow label="Certificates" value={String(certificates.length)} />
              <SnapshotRow label="Average progress" value={`${averageProgress}%`} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-brand-600" size={18} aria-hidden="true" />
              <h2 className="text-lg font-bold text-ink">Secure learning records</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              Enrolments, progress, quiz attempts, and certificates are verified by Apps Script before they are stored
              in Google Sheets.
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Award className="text-brand-600" size={18} aria-hidden="true" />
              <h2 className="text-lg font-bold text-ink">Latest certificate</h2>
            </div>
            {latestCertificate ? (
              <div className="mt-4 rounded-xl border border-line bg-slate-50 p-4">
                <p className="text-sm font-bold text-ink">{latestCertificate.course.title}</p>
                <p className="mt-1 break-all text-xs font-semibold text-muted">
                  {latestCertificate.certificate.certificateCode}
                </p>
                <Link to="/certificates" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-600">
                  View certificate
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted">
                Complete a course and pass its quiz to unlock your first verified certificate.
              </p>
            )}
          </Card>
        </aside>
      </section>
    </main>
  );
}

function DashboardMetric({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-brand-600">{icon}</div>
      <p className="mt-4 text-3xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
    </Card>
  );
}

function LearningCard({ item }: { item: EnrolmentWithCourse }) {
  const progress = Number(item.enrolment.progressPercent || 0);
  const isComplete = progress >= 100 || item.enrolment.status === "COMPLETED";

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1fr_260px]">
        <div className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone={isComplete ? "success" : "brand"}>{item.enrolment.status}</Badge>
            <Badge>{item.course.level}</Badge>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
              <Clock size={16} aria-hidden="true" />
              {item.course.duration}
            </span>
          </div>

          <h3 className="text-xl font-bold text-ink">{item.course.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{item.course.subtitle}</p>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        </div>

        <div className="border-t border-line bg-slate-50 p-5 lg:border-l lg:border-t-0">
          <div className="grid gap-3">
            <Link to={`/learn/${item.course.courseId}`}>
              <Button className="w-full">
                {isComplete ? "Review course" : "Continue course"}
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </Link>
            <Link to={`/learn/${item.course.courseId}/quiz`}>
              <Button variant="secondary" className="w-full">
                <FileCheck2 size={16} aria-hidden="true" />
                Quiz
              </Button>
            </Link>
            {isComplete ? (
              <Link to="/certificates">
                <Button variant="secondary" className="w-full">
                  <Award size={16} aria-hidden="true" />
                  Certificate
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-slate-50 px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-normal text-muted">{label}</p>
      <p className="text-sm font-bold text-ink">{value}</p>
    </div>
  );
}
