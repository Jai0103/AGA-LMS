import { FormEvent, type ReactNode, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AtSign,
  BadgeCheck,
  CheckCircle2,
  Fingerprint,
  IdCard,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { changeMyPassword, updateMyProfile } from "../lib/profileApi";
import type { AuthUser } from "../types/auth";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, sessionToken, logout } = useAuth();
  const [profileUser, setProfileUser] = useState<AuthUser | null>(user);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const effectiveUser = profileUser ?? user;
  const initials = useMemo(() => getInitials(effectiveUser?.fullName ?? "AGA User"), [effectiveUser?.fullName]);
  const passwordScore = getPasswordScore(newPassword);
  const passwordRequirements = [
    { label: "At least 10 characters", met: newPassword.length >= 10 },
    { label: "Uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "Lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "Number", met: /[0-9]/.test(newPassword) },
  ];

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    const cleanName = fullName.replace(/\s+/g, " ").trim();

    if (cleanName.length < 3) {
      setProfileError("Full name must be at least 3 characters.");
      return;
    }

    setIsProfileSubmitting(true);

    try {
      const response = await updateMyProfile({ fullName: cleanName }, sessionToken);

      if (!response.ok) {
        setProfileError(response.error.message);
        return;
      }

      setProfileUser(response.data.user);
      setFullName(response.data.user.fullName);
      setProfileSuccess("Profile saved. Your dashboard and certificate name will use this update.");
    } catch (caughtError) {
      setProfileError(caughtError instanceof Error ? caughtError.message : "Profile could not be updated.");
    } finally {
      setIsProfileSubmitting(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Complete all password fields.");
      return;
    }

    if (passwordRequirements.some((requirement) => !requirement.met)) {
      setPasswordError("New password must meet every security requirement.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setIsPasswordSubmitting(true);

    try {
      const response = await changeMyPassword(
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        sessionToken,
      );

      if (!response.ok) {
        setPasswordError(response.error.message);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(response.data.message || "Password changed. Please log in again.");

      window.setTimeout(async () => {
        await logout();
        navigate("/login");
      }, 1200);
    } catch (caughtError) {
      setPasswordError(caughtError instanceof Error ? caughtError.message : "Password could not be changed.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  if (!effectiveUser) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-600 shadow-sm">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative bg-slate-950 p-6 text-white md:p-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300" />
            <div className="flex min-h-full flex-col justify-between gap-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.35rem] bg-white text-2xl font-black text-slate-950 shadow-2xl">
                  {initials}
                </div>
                <StatusPill status={effectiveUser.status} />
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-200">
                  <Sparkles className="h-4 w-4" />
                  Account Center
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">{effectiveUser.fullName}</h1>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-300">{effectiveUser.email}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroStat label="Role" value={effectiveUser.role} />
                <HeroStat label="Profile" value="Secured" />
                <HeroStat label="Session" value="Active" />
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6 md:p-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-bold text-slate-700">
                <UserRound className="h-4 w-4" />
                Personal Details
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-950">Keep your learning identity current</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Your name is used across dashboards, reports, and certificate records. Protected fields stay locked behind admin-only backend controls.
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <TextInput
                id="fullName"
                label="Full name"
                value={fullName}
                onChange={setFullName}
                icon={<UserRound className="h-4 w-4" />}
                autoComplete="name"
              />

              <FormAlert tone="error" message={profileError} />
              <FormAlert tone="success" message={profileSuccess} />

              <button
                type="submit"
                disabled={isProfileSubmitting}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <Save className="h-4 w-4" />
                {isProfileSubmitting ? "Saving..." : "Save profile"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProfileField icon={<IdCard className="h-5 w-5" />} label="User ID" value={effectiveUser.userId} />
        <ProfileField icon={<Mail className="h-5 w-5" />} label="Email" value={effectiveUser.email} />
        <ProfileField icon={<BadgeCheck className="h-5 w-5" />} label="Role" value={effectiveUser.role} />
        <ProfileField icon={<ShieldCheck className="h-5 w-5" />} label="Status" value={effectiveUser.status} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
              <LockKeyhole className="h-4 w-4" />
              Security
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">Password Controls</h2>
            <p className="text-sm leading-6 text-slate-600">
              Password changes are checked by Apps Script, then your session is expired so the next sign-in uses the new credential.
            </p>
          </div>

          <div className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <SecurityItem icon={<Fingerprint className="h-4 w-4" />} label="Backend validation" />
            <SecurityItem icon={<ShieldCheck className="h-4 w-4" />} label="Session-protected action" />
            <SecurityItem icon={<AtSign className="h-4 w-4" />} label="Email remains admin-controlled" />
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-4">
            <PasswordInput
              id="currentPassword"
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <PasswordInput
              id="newPassword"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
            <PasswordInput
              id="confirmPassword"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Password Strength</p>
                <p className="text-xs font-black text-slate-700">{passwordScore.label}</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className={`h-full rounded-full transition-all ${passwordScore.color}`} style={{ width: passwordScore.width }} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {passwordRequirements.map((requirement) => (
                  <div
                    key={requirement.label}
                    className={`flex items-center gap-2 text-xs font-bold ${
                      requirement.met ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    <CheckCircle2 className={`h-4 w-4 ${requirement.met ? "text-emerald-600" : "text-slate-300"}`} />
                    {requirement.label}
                  </div>
                ))}
              </div>
            </div>

            <FormAlert tone="error" message={passwordError} />
            <FormAlert tone="success" message={passwordSuccess} />

            <button
              type="submit"
              disabled={isPasswordSubmitting}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <KeyRound className="h-4 w-4" />
              {isPasswordSubmitting ? "Changing..." : "Change password"}
            </button>
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black text-slate-950">Need to end this session?</p>
          <p className="mt-1 text-sm text-slate-600">Log out from this browser after finishing your learning work.</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-slate-950 hover:text-slate-950"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </section>
    </div>
  );
}

function TextInput({
  id,
  label,
  value,
  onChange,
  icon,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-slate-900">
        {label}
      </label>
      <div className="mt-2 flex min-h-12 items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 transition focus-within:border-slate-950 focus-within:ring-4 focus-within:ring-slate-200">
        <span className="text-slate-400">{icon}</span>
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="min-h-11 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
        />
      </div>
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-slate-900">
        {label}
      </label>
      <div className="mt-2 flex min-h-12 items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 transition focus-within:border-slate-950 focus-within:ring-4 focus-within:ring-slate-200">
        <KeyRound className="h-4 w-4 text-slate-400" />
        <input
          id={id}
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="min-h-11 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
        />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: AuthUser["status"] }) {
  const className =
    status === "ACTIVE"
      ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-100"
      : status === "PENDING"
        ? "border-amber-300/30 bg-amber-400/15 text-amber-100"
        : "border-rose-300/30 bg-rose-400/15 text-rose-100";

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${className}`}>
      <ShieldCheck className="h-4 w-4" />
      {status}
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function SecurityItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">{icon}</span>
      {label}
    </div>
  );
}

function FormAlert({ tone, message }: { tone: "error" | "success"; message: string }) {
  if (!message) {
    return null;
  }

  const className =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const icon = tone === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />;

  return (
    <div className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${className}`}>
      <span className="mt-0.5">{icon}</span>
      <span>{message}</span>
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 text-slate-600">
        {icon}
        <p className="text-xs font-black uppercase tracking-[0.16em]">{label}</p>
      </div>
      <p className="mt-4 break-all text-sm font-black text-slate-950">{value || "Not available"}</p>
    </div>
  );
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getPasswordScore(value: string) {
  const score = [value.length >= 10, /[A-Z]/.test(value), /[a-z]/.test(value), /[0-9]/.test(value)].filter(Boolean).length;

  if (score <= 1) {
    return { label: "Weak", width: "25%", color: "bg-rose-500" };
  }

  if (score === 2) {
    return { label: "Fair", width: "50%", color: "bg-amber-500" };
  }

  if (score === 3) {
    return { label: "Good", width: "75%", color: "bg-blue-500" };
  }

  return { label: "Strong", width: "100%", color: "bg-emerald-500" };
}
