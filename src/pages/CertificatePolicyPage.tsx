import { Link } from "react-router-dom";
import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  SearchCheck,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { usePlatformSettings } from "../context/PlatformSettingsContext";

const completionRules = [
  {
    title: "Enroll in the course",
    text: "A learner must have a backend-created enrolment record for the selected course.",
  },
  {
    title: "Complete every required lesson",
    text: "Lesson progress is saved by Apps Script and calculated from Google Sheets records.",
  },
  {
    title: "Pass the course quiz",
    text: "Quiz scoring is handled by Apps Script. The frontend never decides whether a quiz is passed.",
  },
  {
    title: "Issue the certificate",
    text: "Certificate creation is allowed only after Apps Script confirms completion and quiz eligibility.",
  },
];

const protectedControls = [
  "Progress records are written through authenticated backend actions.",
  "Quiz answers are scored against hashed correct answers in Apps Script.",
  "Certificate eligibility is checked server-side before PDF creation.",
  "Certificate records are stored in Google Sheets and can be publicly verified by code.",
  "Sensitive writes and admin actions are captured in audit logs.",
];

export function CertificatePolicyPage() {
  const { settings } = usePlatformSettings();

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <Badge tone="brand">Certificate policy</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-ink md:text-5xl">
              How {settings.platformName} verifies completion and certificates.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Certificates are issued only after backend validation of enrolment, lesson progress, quiz results, and certificate eligibility.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/courses">
                <Button>
                  <BookOpenCheck className="h-4 w-4" />
                  Browse courses
                </Button>
              </Link>
              <Link to="/verify-certificate">
                <Button variant="secondary">
                  <SearchCheck className="h-4 w-4" />
                  Verify certificate
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-6 text-white md:p-8">
            <div className="flex h-full flex-col justify-between gap-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">Certificate standard</p>
                <p className="mt-3 text-3xl font-black tracking-tight">{settings.certificateFooterText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {completionRules.map((rule, index) => (
          <Card key={rule.title} className="rounded-[1.5rem] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <span className="text-sm font-black">{index + 1}</span>
            </div>
            <h2 className="mt-5 text-lg font-black text-ink">{rule.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{rule.text}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[1.5rem] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">Learner Requirements</h2>
              <p className="text-sm font-semibold text-muted">What a student must complete.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <PolicyRow label="Enrolment" value="Course access must be created through the secured enrolment flow." />
            <PolicyRow label="Progress" value="Required lessons must reach 100% completion." />
            <PolicyRow label="Quiz" value="Final score must meet or exceed the course passing score." />
            <PolicyRow label="Certificate" value="A certificate can be issued once per eligible course completion record." />
          </div>
        </Card>

        <Card className="rounded-[1.5rem] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">Backend-Validated Controls</h2>
              <p className="text-sm font-semibold text-muted">What Apps Script protects.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {protectedControls.map((control) => (
              <div key={control} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-sm font-semibold leading-6 text-muted">{control}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <PolicyFeature
          icon={<LockKeyhole className="h-5 w-5" />}
          title="No frontend trust"
          text="The UI can request progress, quiz submission, or certificate issuance, but Apps Script decides whether the request is valid."
        />
        <PolicyFeature
          icon={<FileCheck2 className="h-5 w-5" />}
          title="Public verification"
          text="Each issued certificate has a code that can be checked publicly without exposing private learner records."
        />
        <PolicyFeature
          icon={<SearchCheck className="h-5 w-5" />}
          title="Employer-friendly"
          text="Shared verification links confirm the certificate code, learner name, course, issue date, trainer, and course duration."
        />
      </section>
    </main>
  );
}

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-brand-50/50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-muted">{value}</p>
    </div>
  );
}

function PolicyFeature({ icon, title, text }: { icon: JSX.Element; title: string; text: string }) {
  return (
    <Card className="rounded-[1.5rem] p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">{icon}</div>
      <h2 className="mt-5 text-lg font-black text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </Card>
  );
}
