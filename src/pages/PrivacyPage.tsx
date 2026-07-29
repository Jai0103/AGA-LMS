import { Link } from "react-router-dom";
import { Database, FileText, KeyRound, LifeBuoy, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { usePlatformSettings } from "../context/PlatformSettingsContext";

const privacySections = [
  {
    title: "Account Data",
    icon: UserRound,
    body:
      "The LMS stores account details such as full name, email address, role, account status, and timestamps needed to manage access and learning operations.",
  },
  {
    title: "Learning Data",
    icon: Database,
    body:
      "Course enrolments, lesson progress, quiz attempts, scores, completion status, certificate records, and admin reports are stored in the Google Sheets database after backend validation.",
  },
  {
    title: "Authentication Data",
    icon: KeyRound,
    body:
      "Passwords are not stored as plain text. Password reset tokens are temporary and should be treated as sensitive. Session checks and protected actions are handled by Google Apps Script.",
  },
  {
    title: "Files and Certificates",
    icon: FileText,
    body:
      "Course resources and generated certificate files may be stored in Google Drive. Public certificate verification exposes limited certificate information only when a valid certificate code is submitted.",
  },
  {
    title: "Operational Logs",
    icon: ShieldCheck,
    body:
      "The backend may record request IDs, action names, status, timestamps, and error details in audit logs so administrators can troubleshoot issues and review security-relevant activity.",
  },
  {
    title: "Support Contact",
    icon: LifeBuoy,
    body:
      "When you contact support, include only the information needed to resolve the issue, such as account email, course name, certificate code, page URL, and a short description.",
  },
];

export function PrivacyPage() {
  const { settings } = usePlatformSettings();

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <Badge tone="brand">Privacy Policy</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-ink md:text-5xl">
              How learning data is handled across Apps Script, Sheets, Drive, and email.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              This notice summarizes how {settings.platformName} uses learner, course, quiz, certificate, and support information for LMS operations.
            </p>
            <p className="mt-4 text-sm font-bold text-brand-700">Last updated: July 29, 2026</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/terms">
                <Button>
                  <FileText className="h-4 w-4" />
                  Terms of use
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

          <div className="bg-gradient-to-br from-accent-600 via-brand-600 to-brand-800 p-6 text-white md:p-8">
            <div className="flex h-full flex-col justify-between gap-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">Privacy model</p>
                <p className="mt-3 text-3xl font-black tracking-tight">Backend-validated records, limited public disclosure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {privacySections.map((section) => (
          <Card key={section.title} className="rounded-[1.5rem] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
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

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-[1.5rem] p-6">
          <h2 className="text-xl font-black text-ink">Data access and roles</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Visitors can browse public course and certificate verification pages. Students can access their own learning records. Trainers and Admins may access
            additional operational information according to role-based permissions configured in the secured backend.
          </p>
        </Card>
        <Card className="rounded-[1.5rem] p-6">
          <h2 className="text-xl font-black text-ink">Review before launch</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            This policy is a practical LMS privacy notice. Before public launch, the organization owner should confirm data retention, legal basis, consent,
            regional privacy requirements, and support procedures with the appropriate privacy or compliance owner.
          </p>
        </Card>
      </section>
    </main>
  );
}
