import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LifeBuoy, Mail, Send, ShieldCheck } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { usePlatformSettings } from "../context/PlatformSettingsContext";
import { submitSupportTicket } from "../lib/supportApi";
import type { SupportTicketPriority } from "../types/support";

const categories = ["Account", "Course access", "Quiz", "Certificate", "Payment or purchase", "Technical issue", "Other"];
const priorities: SupportTicketPriority[] = ["Normal", "High", "Urgent", "Low"];

export function SupportPage() {
  const { user, sessionToken } = useAuth();
  const { settings } = usePlatformSettings();
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState<SupportTicketPriority>("Normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [createdTicketId, setCreatedTicketId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageUrl = useMemo(() => window.location.href, []);
  const subjectError = subject.trim().length > 0 && subject.trim().length < 8 ? "Use at least 8 characters." : "";
  const messageError = message.trim().length > 0 && message.trim().length < 20 ? "Use at least 20 characters." : "";
  const canSubmit = subject.trim().length >= 8 && message.trim().length >= 20 && !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setNotice("Please complete the subject and message before sending.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");
    setCreatedTicketId("");

    const response = await submitSupportTicket(
      {
        category,
        priority,
        subject: subject.trim(),
        message: message.trim(),
        pageUrl,
      },
      sessionToken,
    );

    setIsSubmitting(false);

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setCreatedTicketId(response.data.ticket.ticketId);
    setNotice("Support ticket submitted. An admin can now review it in the support inbox.");
    setSubject("");
    setMessage("");
    setPriority("Normal");
    setCategory(categories[0]);
  }

  return (
    <main className="space-y-8">
      <Link to="/help" className="inline-flex items-center gap-2 text-sm font-black text-brand-700 hover:text-accent-600">
        <ArrowLeft className="h-4 w-4" />
        Back to Help Center
      </Link>

      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <Badge tone="brand">Support</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-ink md:text-5xl">
              Send a secure support request from your LMS account.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Your name, email, role, and user ID come from the authenticated session. Only the issue details below are entered by you.
            </p>
          </div>

          <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-6 text-white md:p-8">
            <div className="flex h-full flex-col justify-between gap-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <LifeBuoy className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">Signed in as</p>
                <p className="mt-3 text-3xl font-black tracking-tight">{user?.fullName}</p>
                <p className="mt-2 break-all text-sm font-bold text-white/75">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {notice ? (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold ${
            createdTicketId ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {notice}
          {createdTicketId ? <span className="ml-2 font-mono">{createdTicketId}</span> : null}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="rounded-[1.5rem] p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Category</span>
                <select
                  className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Priority</span>
                <select
                  className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as SupportTicketPriority)}
                >
                  {priorities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <Input
              label="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              error={subjectError}
              placeholder="Example: I cannot open my certificate PDF"
            />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Message</span>
              <textarea
                className={`min-h-44 w-full rounded-lg border bg-white px-3 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${
                  messageError ? "border-red-300" : "border-line"
                }`}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Describe what happened, the course name, and the page where you saw the issue."
              />
              {messageError ? <span className="mt-2 block text-sm font-semibold text-red-600">{messageError}</span> : null}
            </label>

            <Button type="submit" disabled={!canSubmit}>
              <Send className="h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send support ticket"}
            </Button>
          </form>
        </Card>

        <aside className="space-y-5">
          <Card className="rounded-[1.5rem] p-5">
            <ShieldCheck className="h-6 w-6 text-brand-700" />
            <h2 className="mt-4 text-lg font-black text-ink">Security standard</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Apps Script validates your session and stores the ticket in Google Sheets with audit logging.
            </p>
          </Card>

          <Card className="rounded-[1.5rem] p-5">
            <Mail className="h-6 w-6 text-accent-700" />
            <h2 className="mt-4 text-lg font-black text-ink">Email fallback</h2>
            <p className="mt-2 break-all text-sm leading-6 text-muted">{settings.supportEmail}</p>
          </Card>
        </aside>
      </section>
    </main>
  );
}
