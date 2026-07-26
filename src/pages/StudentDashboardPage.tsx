import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Award, BookOpen, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAuth } from "../context/AuthContext";
import { listMyEnrolments } from "../lib/enrolmentApi";
import type { EnrolmentWithCourse } from "../types/enrolment";

export function StudentDashboardPage() {
  const { user, sessionToken } = useAuth();
  const [enrolments, setEnrolments] = useState<EnrolmentWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    listMyEnrolments(sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setEnrolments(response.data.enrolments);
        setNotice("");
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

  const averageProgress = useMemo(() => {
    if (enrolments.length === 0) {
      return 0;
    }

    const total = enrolments.reduce((sum, item) => sum + item.enrolment.progressPercent, 0);
    return Math.round(total / enrolments.length);
  }, [enrolments]);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Badge tone="brand">Student dashboard</Badge>
          <h1 className="mt-5 text-4xl font-bold text-ink">Welcome back, {user?.fullName}.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Track your courses, continue learning, and monitor your completion progress.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <BookOpen className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">{enrolments.length}</p>
              <p className="mt-1 text-sm font-semibold text-muted">Enrolled courses</p>
            </Card>
            <Card className="p-5">
              <TrendingUp className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">{averageProgress}%</p>
              <p className="mt-1 text-sm font-semibold text-muted">Average progress</p>
            </Card>
            <Card className="p-5">
              <Award className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">0</p>
              <p className="mt-1 text-sm font-semibold text-muted">Certificates issued</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-ink">My learning</h2>
            <p className="mt-1 text-sm text-muted">Courses enrolled through the secure backend.</p>
          </div>
          <Link to="/courses">
            <Button variant="secondary">Browse more courses</Button>
          </Link>
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
            <h3 className="text-xl font-bold text-ink">No courses yet</h3>
            <p className="mt-2 text-muted">Enroll in a course to start your learning dashboard.</p>
            <Link to="/courses" className="mt-5 inline-flex">
              <Button>
                Explore catalogue
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </Link>
          </Card>
        ) : null}

        {!isLoading && !notice && enrolments.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {enrolments.map((item) => (
              <Card key={item.enrolment.enrolmentId} className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Badge tone="success">{item.enrolment.status}</Badge>
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
                    <span>{item.enrolment.progressPercent}%</span>
                  </div>
                  <ProgressBar value={item.enrolment.progressPercent} />
                </div>

<Link
  to={`/learn/${item.course.courseId}`}
  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-600"
>
  Continue course
  <ArrowRight size={16} aria-hidden="true" />
</Link>
              </Card>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
