import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  LayoutDashboard,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import type { FeaturedCourse } from "../types/course";

const featuredCourses: FeaturedCourse[] = [
  {
    courseId: "course-leadership",
    title: "Applied Leadership Essentials",
    category: "Leadership",
    level: "Beginner",
    lessons: 18,
    duration: "4h 20m",
    description: "Build confident decision-making, communication habits, and team leadership foundations.",
  },
  {
    courseId: "course-cybersecurity",
    title: "Cybersecurity Awareness",
    category: "Security",
    level: "Intermediate",
    lessons: 22,
    duration: "5h 10m",
    description: "Learn practical cyber hygiene, phishing defense, data handling, and workplace security routines.",
  },
  {
    courseId: "course-productivity",
    title: "Digital Productivity Systems",
    category: "Operations",
    level: "Beginner",
    lessons: 15,
    duration: "3h 45m",
    description: "Create repeatable workflows for planning, tracking, reviewing, and improving daily work.",
  },
];

const capabilities = [
  { icon: BookOpen, title: "Structured Courses", text: "Catalogue, course details, lessons, videos, notes, and resources." },
  { icon: BarChart3, title: "Progress Tracking", text: "Backend-owned progress records with dashboard visibility." },
  { icon: Award, title: "Quizzes And Certificates", text: "Secure quiz attempts and certificate issue records." },
  { icon: LayoutDashboard, title: "Admin Operations", text: "Users, courses, enrolments, reports, and audit trails." },
];

const securityItems = [
  "Backend validation for every protected request",
  "Password hashing and secure session records",
  "Role-based access for Student, Trainer, and Admin workflows",
  "Sensitive logic kept inside Google Apps Script",
];

export function LandingPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              <Sparkles size={15} aria-hidden="true" />
              Built for secure professional learning
            </div>
            <h1 className="max-w-4xl text-4xl font-bold tracking-normal text-ink sm:text-5xl lg:text-6xl">
              A premium LMS for focused courses, measurable progress, and trusted administration.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              AGA LMS combines a polished student experience with a secure Google Apps Script backend,
              Google Sheets records, Google Drive storage, and GitHub Pages hosting.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button>
                Explore courses
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
              <Button variant="secondary">
                <PlayCircle size={18} aria-hidden="true" />
                View platform preview
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-slate-950 p-4 shadow-soft">
            <div className="rounded-lg bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-ink">Student Dashboard</p>
                  <p className="text-xs text-muted">Current learning overview</p>
                </div>
                <Badge tone="success">Active</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["10 Courses", "4 Roles", "Secure API", "GitHub Pages"].map((item) => (
                  <div key={item} className="rounded-lg border border-line bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-ink">{item.split(" ")[0]}</p>
                    <p className="mt-1 text-xs font-medium text-muted">{item.replace(item.split(" ")[0], "").trim()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-line p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="text-brand-600" size={18} aria-hidden="true" />
                  <p className="text-sm font-bold text-ink">Cybersecurity Awareness</p>
                </div>
                <ProgressBar value={66} />
                <p className="mt-3 text-xs font-medium text-muted">66% complete · next lesson unlocked</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="border-y border-line bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-brand-700">Featured courses</p>
              <h2 className="mt-2 text-3xl font-bold text-ink">Start with high-impact learning paths</h2>
            </div>
            <Button variant="secondary">
              View catalogue
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featuredCourses.map((course) => (
              <Card key={course.courseId} className="p-5">
                <div className="mb-5 flex items-center justify-between">
                  <Badge tone="brand">{course.category}</Badge>
                  <span className="text-xs font-semibold text-muted">{course.level}</span>
                </div>
                <h3 className="text-xl font-bold text-ink">{course.title}</h3>
                <p className="mt-3 min-h-20 text-sm leading-6 text-muted">{course.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm font-semibold text-slate-600">
                  <span>{course.lessons} lessons</span>
                  <span>{course.duration}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="platform" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-14 md:grid-cols-4">
          {capabilities.map((item) => (
            <Card key={item.title} className="p-5">
              <item.icon className="text-brand-600" size={24} aria-hidden="true" />
              <h3 className="mt-4 text-base font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="security" className="border-y border-line bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-bold">Security-first by design</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Apps Script owns validation, authentication, authorization, session checks, and protected data operations.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {securityItems.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4">
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
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-brand-700">Admin ready</p>
            <h2 className="mt-2 text-3xl font-bold text-ink">Designed for users, courses, enrolments, and reports.</h2>
            <p className="mt-4 leading-7 text-muted">
              In later steps we will wire this foundation into Google Apps Script, Google Sheets, Drive records,
              audit logging, role-based dashboards, quizzes, and certificate generation.
            </p>
          </div>
          <Card className="bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Users className="text-accent-600" size={22} aria-hidden="true" />
              <h3 className="text-lg font-bold text-ink">Role coverage</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Visitor", "Student", "Trainer", "Admin"].map((role) => (
                <div key={role} className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-bold">
                  {role}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
