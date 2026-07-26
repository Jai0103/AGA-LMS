import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { isValidEmail } from "../lib/formValidation";

type LoginErrors = {
  email?: string;
  password?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearAuthError();

    const nextErrors: LoginErrors = {};

    if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (password.trim().length < 1) {
      nextErrors.password = "Enter your password.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      const success = await login({ email, password });

      if (success) {
        navigate("/courses");
      }
    }
  }

  return (
    <main className="bg-slate-50">
      <section className="mx-auto grid min-h-[calc(100vh-145px)] max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-white">
            <LockKeyhole size={24} aria-hidden="true" />
          </div>
          <h1 className="max-w-xl text-4xl font-bold text-ink">Log in to continue your learning.</h1>
          <p className="mt-4 max-w-xl leading-7 text-muted">
            Students, trainers, and admins use secure sessions issued by the Apps Script backend.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["Session tokens are validated server-side", "Roles are enforced in Apps Script"].map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-line bg-white p-4">
                <ShieldCheck className="mt-0.5 shrink-0 text-brand-600" size={18} aria-hidden="true" />
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="mx-auto w-full max-w-md p-6">
          <h2 className="text-2xl font-bold text-ink">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Use your registered email and password.</p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              error={errors.email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              error={errors.password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {authError ? (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-semibold leading-6 text-red-700">
                {authError}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            New to AGA LMS?{" "}
            <Link to="/register" className="font-bold text-brand-700 hover:text-brand-600">
              Create an account
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
