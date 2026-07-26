import { type FormEvent, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpenCheck, KeyRound, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { isValidEmail } from "../lib/formValidation";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await login({ email: cleanEmail, password });

      if (!success) {
        setError("Email or password could not be verified.");
        return;
      }

      navigate("/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The request could not be processed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-slate-50">
      <section className="mx-auto grid min-h-[calc(100vh-145px)] max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-sm lg:p-8">
          <div className="flex min-h-[30rem] flex-col justify-between gap-10 rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-slate-200">
              <ShieldCheck className="h-4 w-4" />
              Secure LMS access
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">Welcome back</h1>
              <p className="max-w-md text-sm leading-6 text-slate-300">
                Continue learning, track progress, complete quizzes, and manage verified certificates from your AGA LMS account.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TrustItem icon={<BookOpenCheck className="h-4 w-4" />} text="Protected courses" />
              <TrustItem icon={<KeyRound className="h-4 w-4" />} text="Secure sessions" />
            </div>
          </div>
        </div>

        <Card className="mx-auto w-full max-w-md rounded-[2rem] p-6 lg:p-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink">Log in</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Use your registered email and password. Apps Script verifies your session before protected pages open.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Input
              label="Email address"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/forgot-password" className="text-sm font-bold text-slate-700 hover:text-slate-950">
                Forgot password?
              </Link>
              <Link to="/register" className="text-sm font-bold text-slate-700 hover:text-slate-950">
                Create an account
              </Link>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-line bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Security standard</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Authentication, roles, and sessions are validated by the Apps Script backend.
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}

function TrustItem({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-200">
      <span className="text-brand-100">{icon}</span>
      {text}
    </div>
  );
}
