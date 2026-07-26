import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

    if (!cleanEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(cleanEmail, password);
      navigate("/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The request could not be processed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <div className="flex h-full min-h-[28rem] flex-col justify-between gap-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-slate-200">
            <ShieldCheck className="h-4 w-4" />
            Secure access
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Welcome back</h1>
            <p className="max-w-md text-sm leading-6 text-slate-300">
              Continue your learning, track course progress, complete quizzes, and manage verified certificates.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Log in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use your registered email and password.</p>
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
                autoComplete="email"
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-bold text-slate-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
              />
            </div>

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

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
