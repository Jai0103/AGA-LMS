import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Download,
  GraduationCap,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CourseSyllabus } from "../components/course/CourseSyllabus";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { courses as fallbackCourses } from "../data/courses";
import { getPublicCourse, type PublicCourseFromApi } from "../lib/courseApi";
import { enrollInCourse } from "../lib/enrolmentApi";
import type { CourseLesson, CourseResource } from "../types/course";

type CourseDetailsState = {
  course: PublicCourseFromApi;
  lessons: CourseLesson[];
  outcomes: string[];
  audience: string[];
  resources: CourseResource[];
};

export function CourseDetailsPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, sessionToken } = useAuth();

  const [details, setDetails] = useState<CourseDetailsState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrolmentMessage, setEnrolmentMessage] = useState("");
  const [loadNotice, setLoadNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCourse() {
      setIsLoading(true);
      setLoadNotice("");
      setEnrolmentMessage("");

      const fallbackCourse = fallbackCourses.find((item) => item.slug === slug || item.courseId === slug);

      try {
        const response = await getPublicCourse(slug);

        if (!isMounted) {
          return;
        }

        if (response.ok) {
          setDetails({
            course: response.data.course,
            lessons: response.data.lessons,
            outcomes:
              fallbackCourse && fallbackCourse.outcomes.length > 0
                ? fallbackCourse.outcomes
                : [
                    "Complete lessons in a structured sequence",
                    "Apply course concepts in practical workplace scenarios",
                    "Track progress through the secured LMS backend",
                    "Prepare for quizzes, completion records, and certificates",
                  ],
            audience:
              fallbackCourse && fallbackCourse.audience.length > 0
                ? fallbackCourse.audience
                : ["Students", "Professionals", "Team members", "New learners"],
            resources: fallbackCourse ? fallbackCourse.resources : [],
          });
          return;
        }

        if (fallbackCourse) {
          setDetails({
            course: fallbackCourse,
            lessons: fallbackCourse.lessons,
            outcomes: fallbackCourse.outcomes,
            audience: fallbackCourse.audience,
            resources: fallbackCourse.resources,
          });
          setLoadNotice(`Static course details loaded. ${response.error.message}`);
          return;
        }

        setDetails(null);
        setLoadNotice(response.error.message);
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        if (fallbackCourse) {
          setDetails({
            course: fallbackCourse,
            lessons: fallbackCourse.lessons,
            outcomes: fallbackCourse.outcomes,
            audience: fallbackCourse.audience,
            resources: fallbackCourse.resources,
          });
          setLoadNotice("Static course details loaded while the backend request could not be completed.");
        } else {
          setDetails(null);
          setLoadNotice(caughtError instanceof Error ? caughtError.message : "Course details could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCourse();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  async function handleEnroll() {
    if (!details) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsEnrolling(true);
    setEnrolmentMessage("");

    try {
      const response = await enrollInCourse(details.course.courseId, sessionToken);

      if (!response.ok) {
        setEnrolmentMessage(response.error.message);
        return;
      }

      setEnrolmentMessage(response.data.alreadyEnrolled ? "You are already enrolled." : "Enrollment successful.");
      navigate("/dashboard");
    } catch (caughtError) {
      setEnrolmentMessage(caughtError instanceof Error ? caughtError.message : "Enrollment could not be completed.");
    } finally {
      setIsEnrolling(false);
    }
  }

  if (isLoading) {
    return (
      <main className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="h-5 w-40 rounded-full bg-slate-100" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="h-12 max-w-3xl animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-6 max-w-2xl animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-28 max-w-3xl animate-pulse rounded-2xl bg-slate-100" />
            </div>
            <div className="h-80 animate-pulse rounded-[1.5rem] bg-slate-100" />
          </div>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="bg-white">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
          <Badge tone="warning">Course not found</Badge>
          <h1 className="mt-4 text-4xl font-bold text-ink">This course does not exist.</h1>
          <p className="mt-4 text-muted">
            {loadNotice || "Return to the catalogue to choose from the available AGA LMS courses."}
          </p>
          <Link to="/courses" className="mt-7">
            <Button>Back to catalogue</Button>
          </Link>
        </div>
      </main>
    );
  }

  const { course, lessons, outcomes, audience, resources } = details;
  const previewLessons = lessons.filter((lesson) => lesson.isPreview).length;

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to catalogue
          </Link>

          {loadNotice ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {loadNotice}
            </div>
          ) : null}

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <Badge tone="brand">{course.category}</Badge>
                <Badge>{course.level}</Badge>
                <Badge tone={course.status === "Published" ? "success" : "warning"}>{course.status}</Badge>
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-ink lg:text-5xl">{course.title}</h1>
              <p className="mt-4 max-w-3xl text-xl font-semibold leading-8 text-slate-700">{course.subtitle}</p>
              <p className="mt-5 max-w-3xl leading-7 text-muted">{course.description}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetaTile icon={<Clock3 className="h-5 w-5" />} label="Duration" value={course.duration} />
                <MetaTile icon={<BookOpenCheck className="h-5 w-5" />} label="Lessons" value={`${course.lessonsCount}`} />
                <MetaTile icon={<Star className="h-5 w-5" />} label="Rating" value={course.rating.toFixed(1)} />
                <MetaTile icon={<Users className="h-5 w-5" />} label="Learners" value={course.enrolledCount.toLocaleString()} />
              </div>
            </div>

            <Card className="h-fit overflow-hidden rounded-[1.5rem]">
              <div className="bg-slate-950 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Course access</p>
                    <h2 className="mt-3 text-2xl font-bold">{isAuthenticated ? "Ready to enroll" : "Login to continue"}</h2>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <GraduationCap className="h-7 w-7 text-brand-100" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Enrollment is validated by Apps Script and stored securely in Google Sheets.
                </p>
              </div>

              <div className="p-5">
                <Button className="w-full" onClick={handleEnroll} disabled={isEnrolling}>
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
                  <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-3 text-sm font-semibold leading-6 text-brand-700">
                    {enrolmentMessage}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 border-t border-line pt-5">
                  <SideFact label="Trainer" value={course.trainerName} />
                  <SideFact label="Preview lessons" value={`${previewLessons}`} />
                  <SideFact label="Certificate" value="Available after completion" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card className="rounded-[1.5rem] p-6">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-brand-600" />
              <h2 className="text-2xl font-bold text-ink">What you will learn</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {outcomes.map((outcome) => (
                <div key={outcome} className="flex gap-3 rounded-2xl border border-line bg-slate-50 p-4">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-brand-600" size={18} aria-hidden="true" />
                  <p className="text-sm leading-6 text-slate-700">{outcome}</p>
                </div>
              ))}
            </div>
          </Card>

          <div>
            <h2 className="mb-4 text-2xl font-bold text-ink">Course syllabus</h2>
            {lessons.length > 0 ? (
              <CourseSyllabus lessons={lessons} />
            ) : (
              <Card className="rounded-[1.5rem] p-6">
                <p className="text-sm font-bold text-muted">No lessons have been added yet.</p>
              </Card>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <Card className="rounded-[1.5rem] p-5">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-bold text-ink">Who this is for</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {audience.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </Card>

          <Card className="rounded-[1.5rem] p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-bold text-ink">Secure completion</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              Lesson progress, quiz attempts, enrolment state, and certificate eligibility are checked by the backend.
            </p>
          </Card>

          <Card className="rounded-[1.5rem] p-5">
            <h2 className="text-lg font-bold text-ink">Resources</h2>
            <div className="mt-4 space-y-3">
              {resources.length > 0 ? (
                resources.map((resource) => (
                  <div
                    key={resource.resourceId}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-slate-50 px-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-ink">{resource.title}</p>
                      <p className="mt-1 text-xs text-muted">{resource.type}</p>
                    </div>
                    <Download className="shrink-0 text-slate-400" size={17} aria-hidden="true" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">Resources will be added by the admin later.</p>
              )}
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function MetaTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-brand-700">
        {icon}
        <p className="text-xs font-bold uppercase tracking-[0.14em]">{label}</p>
      </div>
      <p className="mt-3 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function SideFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-slate-50 px-4 py-3">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="text-right text-sm font-bold text-ink">{value}</p>
    </div>
  );
}
