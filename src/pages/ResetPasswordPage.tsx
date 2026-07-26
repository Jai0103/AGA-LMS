import { type FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { isStrongPassword } from "../lib/formValidation";
import { resetPassword } from "../lib/passwordResetApi";

export function ResetPasswordPage() {
  const { token = "" } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setError("New password must be at least 10 characters with uppercase, lowercase, and a number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({ token, newPassword, confirmPassword });

      if (!response.ok) {
        setError(response.error.message);
        return;
      }

      setNewPassword("");
      setConfirmPassword("");
      setMessage(response.data.message);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Password reset failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-slate-50">
      <section className="mx-auto grid min-h-[calc(100vh-145px)] max-w-5xl gap-8 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-sm lg:p-8">
          <div className="flex min-h-[24rem] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-slate-200">
              <ShieldCheck className="h-4 w-4" />
              Secure reset
            </div>

            <div>
              <h1 className="text-4xl font-black tracking-tight">Create a new password</h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Reset tokens are validated by Apps Script and can only be used according to backend rules.
              </p>
            </div>
          </div>
        </div>

        <Card className="mx-auto w-full max-w-md rounded-[2rem] p-6 lg:p-8">
          <h2 className="text-3xl font-bold tracking-tight text-ink">Set your new password</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Choose a strong password. After reset, return to login and start a fresh session.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Input
              label="New password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Create a strong password"
              helperText="Minimum 10 characters with uppercase, lowercase, and a number."
            />

            <Input
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Confirm your new password"
            />

            <div className="rounded-2xl border border-line bg-slate-50 p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <p className="text-xs font-semibold leading-5 text-muted">
                  Use a password you do not use elsewhere. The backend hashes it before storage.
                </p>
              </div>
            </div>

            {error ? <Alert tone="error" message={error} /> : null}
            {message ? <Alert tone="success" message={message} /> : null}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <KeyRound className="h-4 w-4" />
              {isSubmitting ? "Resetting..." : "Reset password"}
            </Button>
          </form>

          <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </Card>
      </section>
    </main>
  );
}

function Alert({ tone, message }: { tone: "error" | "success"; message: string }) {
  const className =
    tone === "error"
      ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700";

  return <div className={className}>{message}</div>;
}
