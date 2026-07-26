import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, UserPlus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { isStrongPassword, isValidEmail } from "../lib/formValidation";

type RegisterErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, authError, clearAuthError } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearAuthError();

    const nextErrors: RegisterErrors = {};

    if (fullName.trim().length < 2) {
      nextErrors.fullName = "Enter your full name.";
    }

    if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!isStrongPassword(password)) {
      nextErrors.password = "Use at least 10 characters with uppercase, lowercase, and a number.";
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      const success = await register({ fullName, email, password });

      if (success) {
        navigate("/courses");
      }
    }
  }

  return (
    <main className="bg-slate-50">
      <section className="mx-auto grid min-h-[calc(100vh-145px)] max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <Card className="mx-auto w-full max-w-md p-6">
          <h1 className="text-2xl font-bold text-ink">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Registration creates a Student account after backend validation.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Full name"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={fullName}
              error={errors.fullName}
              onChange={(event) => setFullName(event.target.value)}
            />

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
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              error={errors.password}
              helperText="Minimum 10 characters with uppercase, lowercase, and a number."
              onChange={(event) => setPassword(event.target.value)}
            />

            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              error={errors.confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />

            {authError ? (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-semibold leading-6 text-red-700">
                {authError}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already registered?{" "}
            <Link to="/login" className="font-bold text-brand-700 hover:text-brand-600">
              Log in
            </Link>
          </p>
        </Card>

        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-white">
            <UserPlus size={24} aria-hidden="true" />
          </div>
          <h2 className="max-w-xl text-4xl font-bold text-ink">Start with secure student access.</h2>
          <p className="mt-4 max-w-xl leading-7 text-muted">
            The backend validates every field, hashes passwords, creates sessions, and assigns safe default roles.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "New registrations default to Student role",
              "Trainer and Admin roles are assigned only by an Admin",
              "Passwords are never stored in plain text",
              "Frontend data is never trusted by the backend",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-line bg-white p-4">
                <CheckCircle2 className="mt-0.5 shrink-0 text-brand-600" size={18} aria-hidden="true" />
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
