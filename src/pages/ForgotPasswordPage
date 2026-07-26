import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";
import { requestPasswordReset } from "../lib/passwordResetApi";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset({ email: email.trim().toLowerCase() });

      if (!response.ok) {
        setError(response.error.message);
        return;
      }

      setMessage(response.data.message);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Password reset request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <ShieldCheck className="h-4 w-4" />
            Account recovery
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Reset your password</h1>
            <p className="text-sm leading-6 text-slate-600">
              Enter your account email. If an active account exists, AGA LMS will send a one-time reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-bold text-slate-900">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
              />
            </div>

            {error ? <Alert tone="error" message={error} /> : null}
            {message ? <Alert tone="success" message={message} /> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <Mail className="h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <Link to="/login" className="inline-flex text-sm font-bold text-slate-700 hover:text-slate-950">
            Back to login
          </Link>
        </div>
      </section>
    </div>
  );
}

function Alert({ tone, message }: { tone: "error" | "success"; message: string }) {
  const className = tone === "error"
    ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
    : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700";

  return <div className={className}>{message}</div>;
}
