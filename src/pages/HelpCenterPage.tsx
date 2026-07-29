import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  KeyRound,
  LifeBuoy,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { usePlatformSettings } from "../context/PlatformSettingsContext";

const faqSections = [
  {
    title: "Account and Login",
    icon: UserRound,
    items: [
      {
        question: "How do I create an account?",
        answer: "Open Get started, complete the registration form, and the backend will validate your details before creating a Student account.",
      },
      {
        question: "Why can I not access my dashboard?",
        answer: "You must be logged in with an active account. If your account is suspended or pending, contact support.",
      },
      {
        question: "Can I change my profile name?",
        answer: "Yes. Open Settings from the account menu and update your full name. Email, role, and account status are admin-controlled.",
      },
    ],
  },
  {
    title: "Courses and Enrolment",
    icon: BookOpen,
    items: [
      {
        question: "How do I enrol in a course?",
        answer: "Open the course catalogue, choose a published course, and select Enroll. Apps Script validates and stores the enrolment.",
      },
      {
        question: "Why can I not see a course?",
        answer: "Only published courses appear in the public catalogue. Draft courses are visible only through admin workflows.",
      },
      {
        question: "Can I access resources after enrolment?",
        answer: "Course resources are available through the secured learner flow when the backend confirms your session and enrolment.",
      },
    ],
  },
  {
    title: "Progress and Lessons",
    icon: CheckCircle2,
    items: [
      {
        question: "How is progress tracked?",
        answer: "Lesson completion is saved in Google Sheets through authenticated Apps Script actions.",
      },
      {
        question: "Why did progress not update?",
        answer: "Refresh the course player first. If it still does not update, confirm you are logged in and contact support with the course name.",
      },
      {
        question: "Can the frontend mark me complete by itself?",
        answer: "No. The frontend only sends a request. Apps Script validates the session, course, lesson, and enrolment before writing progress.",
      },
    ],
  },
  {
    title: "Quizzes",
    icon: ShieldCheck,
    items: [
      {
        question: "How are quizzes scored?",
        answer: "Quiz scoring is handled inside Apps Script. Correct answers are not trusted from the browser.",
      },
      {
        question: "What score do I need to pass?",
        answer: "Each course quiz has its own passing score set by an Admin. The quiz page shows your result after submission.",
      },
      {
        question: "Can I issue a certificate without passing?",
        answer: "No. Certificate eligibility is checked server-side and requires course completion plus quiz eligibility.",
      },
    ],
  },
  {
    title: "Certificates",
    icon: Award,
    items: [
      {
        question: "When do I receive a certificate?",
        answer: "After completing required lessons and passing the course quiz, open the quiz result page and issue the certificate.",
      },
      {
        question: "How can someone verify my certificate?",
        answer: "Share the certificate code or verification link. The public verification page checks the secured certificate record.",
      },
      {
        question: "Where can I read certificate rules?",
        answer: "Open the Certificate Policy page for the completion, quiz, and certificate validation rules.",
      },
    ],
  },
  {
    title: "Password Reset",
    icon: KeyRound,
    items: [
      {
        question: "I forgot my password. What should I do?",
        answer: "Use the Forgot password page. If an active account exists, the system sends a one-time reset link to your email.",
      },
      {
        question: "Why did I not receive an email?",
        answer: "Check spam first, then confirm the email address matches your LMS account. If needed, contact support.",
      },
      {
        question: "Can support see my old password?",
        answer: "No. Passwords are stored as hashes and cannot be reversed. You must reset the password instead.",
      },
    ],
  },
];

export function HelpCenterPage() {
  const { settings } = usePlatformSettings();

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <Badge tone="brand">Help Center</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-ink md:text-5xl">
              Help for learning, certificates, accounts, and support.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Find quick answers for common {settings.platformName} workflows, from registration to verified certificates.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/courses">
                <Button>
                  <BookOpen className="h-4 w-4" />
                  Browse courses
                </Button>
              </Link>
              <a href={`mailto:${settings.supportEmail}`}>
                <Button variant="secondary">
                  <Mail className="h-4 w-4" />
                  Contact support
                </Button>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-6 text-white md:p-8">
            <div className="flex h-full flex-col justify-between gap-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <LifeBuoy className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">Support contact</p>
                <p className="mt-3 break-all text-3xl font-black tracking-tight">{settings.supportEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickLink icon={<Search className="h-5 w-5" />} label="Verify certificate" to="/verify-certificate" />
        <QuickLink icon={<Award className="h-5 w-5" />} label="Certificate policy" to="/certificate-policy" />
        <QuickLink icon={<KeyRound className="h-5 w-5" />} label="Reset password" to="/forgot-password" />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <QuickLink icon={<FileText className="h-5 w-5" />} label="Terms of use" to="/terms" />
        <QuickLink icon={<ShieldCheck className="h-5 w-5" />} label="Privacy policy" to="/privacy" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {faqSections.map((section) => (
          <Card key={section.title} className="overflow-hidden rounded-[1.5rem]">
            <div className="flex items-center gap-3 border-b border-line bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <section.icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-ink">{section.title}</h2>
            </div>
            <div className="divide-y divide-line">
              {section.items.map((item) => (
                <article key={item.question} className="p-5">
                  <h3 className="text-sm font-black text-ink">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
                </article>
              ))}
            </div>
          </Card>
        ))}
      </section>

      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-sm font-bold text-accent-700">
              <HelpCircle className="h-4 w-4" />
              Still need help?
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-ink">Send support the exact issue and page URL.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Include your account email, course name, certificate code if relevant, and a short description of what happened.
            </p>
          </div>
          <a href={`mailto:${settings.supportEmail}`}>
            <Button>
              <Mail className="h-4 w-4" />
              Email support
            </Button>
          </a>
        </div>
      </section>
    </main>
  );
}

function QuickLink({ icon, label, to }: { icon: JSX.Element; label: string; to: string }) {
  return (
    <Link to={to} className="rounded-[1.5rem] border border-brand-100 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:bg-brand-50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">{icon}</div>
        <p className="text-sm font-black text-ink">{label}</p>
      </div>
    </Link>
  );
}
