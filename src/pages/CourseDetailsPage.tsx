import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  GraduationCap,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { courses as fallbackCourses } from "../data/courses";
import { getPublicCourse, type PublicCourseFromApi } from "../lib/courseApi";
import { enrollInCourse } from "../lib/enrolmentApi";
import type { Course, CourseLesson, CourseResource } from "../types/course";

type CourseDetailsState = {
  course: PublicCourseFromApi;
  lessons: CourseLesson[];
  outcomes: string[];
  audience: string[];
  resources: CourseResource[];
};

const lessonTypeTone = {
  Video: "brand",
  Reading: "neutral",
  Quiz: "warning",
  Resource: "success",
} as const;

export function CourseDetailsPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, sessionToken } = useAuth();

  const [details, setDetails] = useState<CourseDetailsState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrolmentMessage, setEnrolmentMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fallbackCourse = fallbackCourses.find((item) => item.slug === slug);

    getPublicCourse(slug)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        if (response.ok) {
          setDetails({
            course: response.data.course,
            lessons: response.data.lessons,
            outcomes:
              fallbackCourse?.outcomes.length
                ? fallbackCourse.outcomes
                : [
                    "Complete lessons in a structured sequence",
                    "Apply practical workplace scenarios",
                    "Track learning progress securely",
                    "Prepare for quizzes and certificate eligibility",
                  ],
            audience:
              fallbackCourse?.audience.length
                ? fallbackCourse.audience
                : ["Students", "Professionals", "Team members", "New learners"],
            resources: fallbackCourse?.resources ?? [],
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
          return;
        }

        setDetails(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

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

    const response = await enrollInCourse(details.course.courseId, sessionToken);

    setIsEnrolling(false);

    if (!response.ok) {
      setEnrolmentMessage(response.error.message);
      return;
    }

    setEnrolmentMessage(response.data.alreadyEnrolled ? "You are already enrolled." : "Enrollment successful.");
    navigate("/dashboard");
  }

  if (isLoading) {
    return (
      <main className="bg-white">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-6 py-20">
          <p className="text-sm font-bold text-muted">Loading course...</p>
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
          <p className="mt-4 text-muted">Return to the catalogue to choose from the available AGA LMS courses.</p>
          <Link to="/courses" className="mt-7">
            <Button>Back to catalogue</Button>
          </Link>
        </div>
      </main>
    );
  }

  const { course, lessons, outcomes, audience, resources } = details;
  const totalLessonMinutes = useMemo(() => {
    const lessonMinutes = lessons.reduce((total, lesson) => total + Number(lesson.durationMinutes || 0), 0);
    return lessonMinutes || Number(course.durationMinutes || 0);
  }, [course.durationMinutes, lessons]);

  const previewLessons = lessons.filter((lesson) => lesson.isPreview).length;

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to catalogue
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <Badge tone="brand">{course.category}</Badge>
                <Badge>{course.level}</Badge>
                <Badge tone="success">{course.status}</Badge>
              </div>

              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-ink lg:text-6xl">{course.title}</h1>
              <p className="mt-5 max-w-3xl text-xl font-semibold leading-8 text-slate-700">{course.subtitle}</p>
              <p className="mt-5 max-w-3xl leading-7 text-muted">{course.description}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <HeroMetric icon={<Clock3 size={18} />} label="Duration" value={course.duration} />
                <HeroMetric icon={<BookOpen size={18} />} label="Lessons" value={String(course.lessonsCount)} />
                <HeroMetric icon={<Star size={18} />} label="Rating" value={course.rating.toFixed(1)} />
                <HeroMetric icon={<Users size={18} />} label="Learners" value={formatNumber(course.enrolledCount)} />
              </div>
            </div>

            <Card className="h-fit overflow-hidden">
              <div className="bg-slate-950 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-brand-100">Course access</p>
                    <h2 className="mt-2 text-2xl font-bold">{isAuthenticated ? "Ready to enroll" : "Login to continue"}</h2>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 text-brand-100">
                    <GraduationCap size={24} aria-hidden="true" />
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
                  <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm font-semibold leading-6 text-brand-700">
                    {enrolmentMessage}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 border-t border-line pt-5">
                  <TrustPoint icon={<ShieldCheck size={17} />} label="Backend-validated enrollment" />
                  <TrustPoint icon={<FileCheck2 size={17} />} label="Progress tracked securely" />
                  <TrustPoint icon={<Award size={17} />} label="Certificate eligible after completion" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <Card className="p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-normal text-muted">Learning outcomes</p>
                <h2 className="mt-2 text-2xl font-bold text-ink">What you will learn</h2>
              </div>
              <Badge tone="success">{outcomes.length} outcomes</Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {outcomes.map((outcome) => (
                <div key={outcome} className="flex gap-3 rounded-xl border border-line bg-slate-50 p-4">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-brand-600" size={18} aria-hidden="true" />
                  <p className="text-sm leading-6 text-slate-700">{outcome}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-line p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-normal text-muted">Course syllabus</p>
                  <h2 className="mt-2 text-2xl font-bold text-ink">{lessons.length} structured lessons</h2>
                </div>
                <Badge tone="brand">{formatMinutes(totalLessonMinutes)}</Badge>
              </div>
            </div>

            {lessons.length > 0 ? (
              <div className="divide-y divide-line">
                {lessons.map((lesson, index) => (
                  <LessonRow key={lesson.lessonId} lesson={lesson} index={index} />
                ))}
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm font-bold text-muted">No lessons have been added yet.</p>
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <p className="text-sm font-bold uppercase tracking-normal text-muted">Trainer</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <GraduationCap size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">{course.trainerName}</h2>
                <p className="mt-1 text-sm text-muted">AGA LMS faculty</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-ink">Who this is for</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {audience.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-ink">Course snapshot</h2>
            <div className="mt-4 grid gap-3">
              <SnapshotRow label="Preview lessons" value={String(previewLessons)} />
              <SnapshotRow label="Total learning time" value={formatMinutes(totalLessonMinutes)} />
              <SnapshotRow label="Skill level" value={course.level} />
              <SnapshotRow label="Category" value={course.category} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-ink">Resources</h2>
            <div className="mt-4 space-y-3">
              {resources.length > 0 ? (
                resources.map((resource) => (
                  <div key={resource.resourceId} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-slate-50 px-3 py-3">
                    <div>
                      <p className="text-sm font-bold text-ink">{resource.title}</p>
                      <p className="mt-1 text-xs text-muted">{resource.type}</p>
                    </div>
                    <Download className="shrink-0 text-slate-400" size={17} aria-hidden="true" />
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted">Resources will be added by the admin later.</p>
              )}
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function HeroMetric({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-xs font-bold uppercase tracking-normal">{label}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

function TrustPoint({ icon, label }: { icon: JSX.Element; label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-brand-700">
        {icon}
      </span>
      {label}
    </div>
  );
}

function LessonRow({ lesson, index }: { lesson: CourseLesson; index: number }) {
  const Icon = lesson.type === "Video" ? PlayCircle : lesson.type === "Reading" ? BookOpen : lesson.type === "Quiz" ? Award : FileCheck2;

  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-brand-700">
          <Icon size={20} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">
            {index + 1}. {lesson.title}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">
            {lesson.type} - {lesson.durationMinutes} min
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Badge tone={lessonTypeTone[lesson.type]}>{lesson.type}</Badge>
        {lesson.isPreview ? <Badge tone="success">Preview</Badge> : null}
      </div>
    </div>
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

function formatMinutes(minutes: number) {
  if (!minutes) {
    return "Not set";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}
