import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
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

    if (newPassword.length < 10) {
      setError("New password must be at least 10 characters.");
      return;
    }

    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("New password must include uppercase, lowercase, and a number.");
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
    <div className="mx-auto max-w-2xl">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Secure reset
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Create a new password</h1>
            <p className="text-sm leading-6 text-slate-600">
              Choose a strong password. This reset link can only be used once.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput id="newPassword" label="New password" value={newPassword} onChange={setNewPassword} />
            <PasswordInput id="confirmPassword" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} />

            <p className="text-xs font-semibold leading-5 text-slate-500">
              Minimum 10 characters with uppercase, lowercase, and a number.
            </p>

            {error ? <Alert tone="error" message={error} /> : null}
            {message ? <Alert tone="success" message={message} /> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <KeyRound className="h-4 w-4" />
              {isSubmitting ? "Resetting..." : "Reset password"}
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

function PasswordInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-slate-900">
        {label}
      </label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
      />
    </div>
  );
}

function Alert({ tone, message }: { tone: "error" | "success"; message: string }) {
  const className = tone === "error"
    ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
    : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700";

  return <div className={className}>{message}</div>;
}
