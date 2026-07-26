import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AtSign, BadgeCheck, IdCard, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
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
  const initials = useMemo(() => getInitials(effectiveUser?.fullName ?? "AGA"), [effectiveUser?.fullName]);

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
      setProfileSuccess("Profile updated.");
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

    if (newPassword.length < 10) {
      setPasswordError("New password must be at least 10 characters.");
      return;
    }

    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError("New password must include uppercase, lowercase, and a number.");
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
      setPasswordSuccess(response.data.message);

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
      <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
        <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
          <div className="flex h-full flex-col justify-between gap-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-2xl font-black text-slate-950">
                {initials}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                {effectiveUser.status}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Account settings
              </p>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{effectiveUser.fullName}</h1>
              <p className="break-all text-sm font-semibold text-slate-300">{effectiveUser.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
              <UserRound className="h-4 w-4" />
              My profile
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Manage your learner identity</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Your name appears in dashboards, reports, and certificates. Email, role, and account status are protected fields and can only be changed by an administrator.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="text-sm font-bold text-slate-900">
                Full name
              </label>
              <input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
              />
            </div>

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
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ProfileField icon={<IdCard className="h-5 w-5" />} label="User ID" value={effectiveUser.userId} />
        <ProfileField icon={<AtSign className="h-5 w-5" />} label="Email" value={effectiveUser.email} />
        <ProfileField icon={<BadgeCheck className="h-5 w-5" />} label="Role" value={effectiveUser.role} />
        <ProfileField icon={<ShieldCheck className="h-5 w-5" />} label="Status" value={effectiveUser.status} />
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <KeyRound className="h-4 w-4" />
            Password security
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">Change password</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Enter your current password before setting a new one. After a successful change, active sessions are expired and you will be asked to log in again.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <PasswordInput
            id="currentPassword"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <PasswordInput
            id="newPassword"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordInput
            id="confirmPassword"
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <p className="text-xs font-semibold leading-5 text-slate-500">
            Minimum 10 characters with uppercase, lowercase, and a number.
          </p>

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
        </form>
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

function FormAlert({ tone, message }: { tone: "error" | "success"; message: string }) {
  if (!message) {
    return null;
  }

  const className = tone === "error"
    ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
    : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700";

  return <div className={className}>{message}</div>;
}

function ProfileField({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 text-slate-600">
        {icon}
        <p className="text-xs font-bold uppercase tracking-[0.16em]">{label}</p>
      </div>
      <p className="mt-4 break-all text-sm font-bold text-slate-950">{value || "Not available"}</p>
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
