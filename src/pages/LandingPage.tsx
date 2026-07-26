import type { ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CourseCard } from "../components/course/CourseCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { courses } from "../data/courses";
import { useAuth } from "../context/AuthContext";

const featuredCourses = courses.filter((course) => course.featured).slice(0, 3);
const totalLessons = courses.reduce((sum, course) => sum + course.lessonsCount, 0);
const averageRating =
  courses.length > 0 ? courses.reduce((sum, course) => sum + course.rating, 0) / courses.length : 0;

const capabilities = [
  {
    icon: BookOpenCheck,
    title: "Course Catalogue",
    text: "Publish focused courses with details, lesson outlines, resources, and enrolment controls.",
  },
  {
    icon: LayoutDashboard,
    title: "Student Dashboard",
    text: "Give learners a clear view of enrolled courses, progress, next actions, quizzes, and certificates.",
  },
  {
    icon: Award,
    title: "Certificates",
    text: "Issue verified certificates only after backend eligibility checks confirm completion and quiz results.",
  },
  {
    icon: BarChart3,
    title: "Admin Reports",
    text: "Monitor users, courses, enrolments, audit activity, quiz attempts, and certificate output.",
  },
];

const securityItems = [
  "Backend validation for every request",
  "Password hashing and session records",
  "Role-based access for Student, Trainer, and Admin",
  "Quiz scoring protected in Apps Script",
  "Certificate eligibility protected in Apps Script",
  "Audit logs for admin and server activity",
];

export function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const primaryHref = isAuthenticated ? "/dashboard" : "/courses";
  const primaryLabel = isAuthenticated ? "Open dashboard" : "Explore courses";

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
              <Sparkles size={15} aria-hidden="true" />
              Secure professional learning
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Premium learning for focused courses, measurable progress, and trusted certificates.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              AGA LMS gives learners a polished course experience while Apps Script protects authentication, progress,
              quiz scoring, certificates, and admin operations behind the frontend.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={primaryHref}>
                <Button>
                  {primaryLabel}
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
              </Link>
              <Link to={user?.role === "ADMIN" ? "/admin" : "/certificates"}>
                <Button variant="secondary">
                  {user?.role === "ADMIN" ? <LayoutDashboard size={18} aria-hidden="true" /> : <Award size={18} aria-hidden="true" />}
                  {user?.role === "ADMIN" ? "Admin console" : "View certificates"}
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <HeroStat value={String(courses.length)} label="Courses" />
              <HeroStat value={String(totalLessons)} label="Lessons" />
              <HeroStat value={averageRating.toFixed(1)} label="Avg rating" />
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2rem]">
            <div className="bg-slate-950 p-5 text-white">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Learning snapshot</p>
                    <h2 className="mt-3 text-2xl font-bold">Cybersecurity Awareness</h2>
                  </div>
                  <Badge tone="success">Active</Badge>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <DarkStat value="66%" label="Progress" />
                  <DarkStat value="22" label="Lessons" />
                  <DarkStat value="4.8" label="Rating" />
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white p-4 text-slate-950">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-brand-600" />
                      <p className="text-sm font-bold">Next lesson</p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Unlocked</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Password security and MFA</p>
                  <div className="mt-4">
                    <ProgressBar value={66} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="courses" className="border-b border-line bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-700">Featured courses</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">Start with high-impact learning paths</h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted">
                Choose from focused courses designed for practical skill-building, workplace readiness, and verified outcomes.
              </p>
            </div>
            <Link to="/courses">
              <Button variant="secondary">
                View catalogue
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>
        </div>
      </section>

      <section id="platform" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-700">Platform</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">A complete LMS flow for learners and admins</h2>
            <p className="mt-3 leading-7 text-muted">
              AGA LMS is built around the real operating loop: publish courses, enrol learners, track progress, assess knowledge, and issue certificates.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item) => (
              <Card key={item.title} className="p-5">
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="border-y border-line bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck size={25} aria-hidden="true" />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Security</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Sensitive logic stays on the backend</h2>
            <p className="mt-4 leading-7 text-slate-300">
              The frontend presents the experience. Apps Script validates requests, authorizes roles, writes records,
              scores quizzes, and controls certificate issuance.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {securityItems.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex gap-3">
                  <LockKeyhole className="mt-0.5 shrink-0 text-brand-100" size={18} aria-hidden="true" />
                  <p className="text-sm font-semibold leading-6 text-slate-100">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="admin" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-700">Admin operations</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">
              Manage users, courses, enrolments, reports, quizzes, resources, and certificates.
            </h2>
            <p className="mt-4 leading-7 text-muted">
              Admins get a complete operating console for managing LMS content and monitoring learner progress without exposing sensitive logic to the browser.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to={isAuthenticated ? "/admin" : "/login"}>
                <Button variant="dark">
                  Open admin
                  <ArrowRight size={17} aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/verify-certificate">
                <Button variant="secondary">
                  Verify certificate
                  <FileCheck2 size={17} aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminTile icon={<Users className="h-5 w-5" />} title="Users" text="Roles, status, and account controls." />
            <AdminTile icon={<GraduationCap className="h-5 w-5" />} title="Courses" text="Published and draft learning paths." />
            <AdminTile icon={<ClipboardList className="h-5 w-5" />} title="Quizzes" text="Questions, points, and passing scores." />
            <AdminTile icon={<Award className="h-5 w-5" />} title="Certificates" text="Verified awards and public checks." />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink">Ready to continue learning?</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Browse the catalogue or return to your dashboard to keep making progress.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/courses">
              <Button variant="secondary">Browse courses</Button>
            </Link>
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
              <Button>
                {isAuthenticated ? "Open dashboard" : "Create account"}
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-slate-50 p-4">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
    </div>
  );
}

function DarkStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
    </div>
  );
}

function AdminTile({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">{icon}</div>
        <div>
          <h3 className="font-bold text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
        </div>
      </div>
    </Card>
  );
}
