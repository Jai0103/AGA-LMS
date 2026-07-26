import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, LockKeyhole } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CourseMeta } from "../components/course/CourseMeta";
import { CourseSyllabus } from "../components/course/CourseSyllabus";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { courses } from "../data/courses";
import { enrollInCourse } from "../lib/enrolmentApi";

export function CourseDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, sessionToken } = useAuth();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrolmentMessage, setEnrolmentMessage] = useState("");

  const course = courses.find((item) => item.slug === slug);

  async function handleEnroll() {
    if (!course) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsEnrolling(true);
    setEnrolmentMessage("");

    const response = await enrollInCourse(course.courseId, sessionToken);

    setIsEnrolling(false);

    if (!response.ok) {
      setEnrolmentMessage(response.error.message);
      return;
    }

    setEnrolmentMessage(response.data.alreadyEnrolled ? "You are already enrolled." : "Enrollment successful.");
    navigate("/dashboard");
  }

  if (!course) {
    return (
      <main className="bg-white">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
          <Badge tone="warning">Course not found</Badge>
          <h1 className="mt-4 text-4xl font-bold text-ink">This course does not exist.</h1>
          <p className="mt-4 text-muted">Return to the catalogue to choose from the available AGA LMS courses.</p>
          <Link to="/courses" className="mt-7">
            <Button>Back to catalogue</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to catalogue
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <Badge tone="brand">{course.category}</Badge>
                <Badge>{course.level}</Badge>
                <Badge tone="success">{course.status}</Badge>
              </div>

              <h1 className="max-w-4xl text-4xl font-bold text-ink lg:text-5xl">{course.title}</h1>
              <p className="mt-4 text-xl font-semibold text-slate-700">{course.subtitle}</p>
              <p className="mt-5 max-w-3xl leading-7 text-muted">{course.description}</p>

              <div className="mt-7">
                <CourseMeta
                  duration={course.duration}
                  lessonsCount={course.lessonsCount}
                  rating={course.rating}
                  enrolledCount={course.enrolledCount}
                />
              </div>
            </div>

            <Card className="h-fit p-5">
              <div className="rounded-lg bg-slate-950 p-5 text-white">
                <p className="text-sm font-bold text-brand-100">Course access</p>
                <h2 className="mt-2 text-2xl font-bold">{isAuthenticated ? "Ready to enroll" : "Login to continue"}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Enrollment is validated by Apps Script and stored securely in Google Sheets.
                </p>
              </div>

              <Button className="mt-5 w-full" onClick={handleEnroll} disabled={isEnrolling}>
                {isEnrolling ? "Enrolling..." : "Enroll now"}
                <ArrowRight size={17} aria-hidden="true" />
              </Button>

              {!isAuthenticated ? (
                <Button variant="secondary" className="mt-3 w-full" onClick={() => navigate("/login")}>
                  <LockKeyhole size={17} aria-hidden="true" />
                  Login required
                </Button>
              ) : null}

              {enrolmentMessage ? (
                <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm font-semibold leading-6 text-brand-700">
                  {enrolmentMessage}
                </div>
              ) : null}

              <div className="mt-5 border-t border-line pt-5">
                <p className="text-sm font-bold text-ink">Trainer</p>
                <p className="mt-1 text-sm text-muted">{course.trainerName}</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-ink">What you will learn</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {course.outcomes.map((outcome) => (
                <div key={outcome} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-brand-600" size={18} aria-hidden="true" />
                  <p className="text-sm leading-6 text-slate-700">{outcome}</p>
                </div>
              ))}
            </div>
          </Card>

          <div>
            <h2 className="mb-4 text-2xl font-bold text-ink">Course syllabus</h2>
            <CourseSyllabus lessons={course.lessons} />
          </div>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-ink">Who this is for</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {course.audience.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-ink">Resources</h2>
            <div className="mt-4 space-y-3">
              {course.resources.map((resource) => (
                <div key={resource.resourceId} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-slate-50 px-3 py-3">
                  <div>
                    <p className="text-sm font-bold text-ink">{resource.title}</p>
                    <p className="mt-1 text-xs text-muted">{resource.type}</p>
                  </div>
                  <Download className="shrink-0 text-slate-400" size={17} aria-hidden="true" />
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
}
