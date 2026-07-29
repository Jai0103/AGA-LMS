import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, FileText, LifeBuoy, LockKeyhole, ShieldCheck } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { usePlatformSettings } from "../context/PlatformSettingsContext";

const sections = [
  {
    title: "Use of the LMS",
    icon: BookOpen,
    body:
      "The platform is provided for approved learning, training, assessment, certificate verification, and related administration. Users should only access courses, records, reports, and tools that are assigned to their account or role.",
  },
  {
    title: "Accounts and Security",
    icon: LockKeyhole,
    body:
      "You are responsible for keeping your login details secure. Do not share passwords, reset links, session access, certificate files, or admin screens with unauthorized people. The platform may restrict access when misuse, suspicious activity, or account risk is detected.",
  },
  {
    title: "Learning Records",
    icon: CheckCircle2,
    body:
      "Course enrolments, lesson progress, quiz attempts, completion status, and certificate records are stored after backend validation. The browser interface cannot create trusted learning records by itself.",
  },
  {
    title: "Certificates",
    icon: ShieldCheck,
    body:
      "Certificates are issued only when the secured backend confirms the learner, course completion, quiz eligibility, and certificate rules. Certificate verification confirms the existence of a valid record but does not replace formal identity checks by the receiving organization.",
  },
  {
    title: "Acceptable Use",
    icon: FileText,
    body:
      "Do not attempt to bypass authentication, alter records outside approved workflows, scrape private data, upload unsafe content, interfere with service availability, or use the LMS for unlawful, misleading, or harmful activity.",
  },
  {
    title: "Support and Changes",
    icon: LifeBuoy,
    body:
      "Platform content, availability, workflows, and policies may change as training operations evolve. For support, use the official support email shown on this platform.",
  },
];

export function TermsPage() {
  const { settings } = usePlatformSettings();

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <Badge tone="brand">Terms of Use</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-ink md:text-5xl">
              Platform terms for learning, assessments, and verified certificates.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              These terms explain the expected use of {settings.platformName}. They are written for learners, trainers, and administrators using the LMS.
            </p>
            <p className="mt-4 text-sm font-bold text-brand-700">Last updated: July 29, 2026</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/courses">
                <Button>
                  <BookOpen className="h-4 w-4" />
                  Browse courses
                </Button>
              </Link>
              <Link to="/privacy">
                <Button variant="secondary">
                  <ShieldCheck className="h-4 w-4" />
                  Privacy policy
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-6 text-white md:p-8">
            <div className="flex h-full flex-col justify-between gap-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">Applies to</p>
                <p className="mt-3 text-3xl font-black tracking-tight">Visitors, Students, Trainers, and Admins</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="rounded-[1.5rem] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <section.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-ink">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{section.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 md:p-8">
        <h2 className="text-2xl font-black tracking-tight text-amber-950">Operational notice</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-900">
          This page is a practical platform notice for the LMS. Before public launch, the organization owner should review it with the appropriate legal,
          privacy, and compliance stakeholders.
        </p>
      </section>
    </main>
  );
}
