import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Award,
  ChevronDown,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  SearchCheck,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePlatformSettings } from "../../context/PlatformSettingsContext";
import { DocumentHead } from "./DocumentHead";

const publicLinks = [
  { to: "/courses", label: "Courses" },
  { to: "/verify-certificate", label: "Verify Certificate" },
];

export function AppShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = usePlatformSettings();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const isSignedIn = Boolean(user);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  async function handleLogout() {
    setIsAccountOpen(false);
    setIsMobileOpen(false);
    await logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen text-ink">
      <DocumentHead />
      <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 shadow-sm shadow-brand-500/5 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-20 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
              <div className="flex h-14 w-[9rem] items-center justify-center overflow-hidden sm:w-[12rem]">
                <img
                  src={`${import.meta.env.BASE_URL}aga-logo.png`}
                  alt={settings.platformName}
                  className="h-full w-full object-contain"
                  width="192"
                  height="56"
                />
              </div>
              <div className="hidden sm:block">
                <p className="max-w-[13rem] truncate text-lg font-black tracking-tight sm:max-w-[18rem]">
                  {settings.platformName}
                </p>
                <p className="text-xs font-bold text-brand-600">Premium learning platform</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {publicLinks.map((link) => (
                <HeaderLink key={link.to} to={link.to}>
                  {link.label}
                </HeaderLink>
              ))}

              <a href="/AGA-LMS/#/#platform" className="rounded-full px-4 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-50">
                Platform
              </a>
              <a href="/AGA-LMS/#/#security" className="rounded-full px-4 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-50">
                Security
              </a>

              {isAdmin ? (
                <HeaderLink to="/admin">
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </span>
                </HeaderLink>
              ) : null}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              {isSignedIn ? (
                <div ref={accountMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccountOpen((value) => !value)}
                    className="inline-flex items-center gap-3 rounded-full border border-brand-100 bg-white py-1.5 pl-2 pr-3 text-sm font-bold text-ink shadow-sm transition hover:border-brand-500 hover:bg-brand-50"
                    aria-expanded={isAccountOpen}
                  >
                    <UserAvatar name={user?.fullName ?? "AGA"} />
                    <span className="max-w-[10rem] truncate">{user?.fullName}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition ${isAccountOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isAccountOpen ? (
                    <AccountDropdown
                      isAdmin={isAdmin}
                      platformName={settings.platformName}
                      supportEmail={settings.supportEmail}
                      onLogout={handleLogout}
                      onNavigate={() => setIsAccountOpen(false)}
                    />
                  ) : null}
                </div>
              ) : (
                <>
                  <HeaderLink to="/login">Log in</HeaderLink>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full bg-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-accent-500/20 transition hover:bg-accent-600"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-100 bg-white text-brand-700 lg:hidden"
              aria-label="Open navigation"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {isMobileOpen ? (
            <div className="border-t border-slate-200 py-4 lg:hidden">
              <div className="grid gap-2">
                {publicLinks.map((link) => (
                  <MobileLink key={link.to} to={link.to} onClick={() => setIsMobileOpen(false)}>
                    {link.label}
                  </MobileLink>
                ))}
                <a href="/AGA-LMS/#/#platform" className="rounded-2xl px-4 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50">
                  Platform
                </a>
                <a href="/AGA-LMS/#/#security" className="rounded-2xl px-4 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50">
                  Security
                </a>

                {isSignedIn ? (
                  <>
                    <MobileLink to="/dashboard" onClick={() => setIsMobileOpen(false)}>
                      My Learning
                    </MobileLink>
                    <MobileLink to="/certificates" onClick={() => setIsMobileOpen(false)}>
                      Certificates
                    </MobileLink>
                    <MobileLink to="/profile" onClick={() => setIsMobileOpen(false)}>
                      Settings
                    </MobileLink>
                    {isAdmin ? (
                      <>
                        <MobileLink to="/admin" onClick={() => setIsMobileOpen(false)}>
                          Admin
                        </MobileLink>
                        <MobileLink to="/admin/settings" onClick={() => setIsMobileOpen(false)}>
                          Platform Settings
                        </MobileLink>
                      </>
                    ) : null}
                    <a
                      href={`mailto:${settings.supportEmail}`}
                      className="rounded-2xl px-4 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50"
                    >
                      Help Center
                    </a>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-2xl px-4 py-3 text-left text-sm font-bold text-brand-700 hover:bg-brand-50"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <MobileLink to="/login" onClick={() => setIsMobileOpen(false)}>
                      Log in
                    </MobileLink>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileOpen(false)}
                      className="rounded-2xl bg-accent-500 px-4 py-3 text-center text-sm font-bold text-white"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {settings.maintenanceEnabled ? (
          <div className="border-t border-amber-200 bg-amber-50">
            <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 text-sm font-bold text-amber-900 sm:px-6 lg:px-8">
              <Megaphone className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{settings.maintenanceNotice}</p>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto min-h-[calc(100vh-11rem)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-brand-100 bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm font-semibold text-muted sm:px-6 lg:px-8">
          <p>{settings.platformName} - React, TypeScript, Vite, Tailwind CSS</p>
          <p>Support: {settings.supportEmail} - API connected through Apps Script - Build 2026</p>
        </div>
      </footer>
    </div>
  );
}

function AccountDropdown({
  isAdmin,
  platformName,
  supportEmail,
  onLogout,
  onNavigate,
}: {
  isAdmin: boolean;
  platformName: string;
  supportEmail: string;
  onLogout: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="absolute right-0 top-14 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white py-2 shadow-2xl shadow-slate-900/15">
      <DropdownLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={onNavigate}>
        My Learning
      </DropdownLink>
      <DropdownLink to="/certificates" icon={<Award className="h-4 w-4" />} onClick={onNavigate}>
        Certificates
      </DropdownLink>
      <DropdownLink to="/profile" icon={<Settings className="h-4 w-4" />} onClick={onNavigate}>
        Settings
      </DropdownLink>
      {isAdmin ? (
        <DropdownLink to="/admin" icon={<ShieldCheck className="h-4 w-4" />} onClick={onNavigate}>
          Admin Dashboard
        </DropdownLink>
      ) : null}
      {isAdmin ? (
        <DropdownLink to="/admin/settings" icon={<Settings className="h-4 w-4" />} onClick={onNavigate}>
          Platform Settings
        </DropdownLink>
      ) : null}
      <DropdownLink to="/verify-certificate" icon={<SearchCheck className="h-4 w-4" />} onClick={onNavigate}>
        Verify Certificate
      </DropdownLink>
      <a
        href={`mailto:${supportEmail}`}
        className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <HelpCircle className="h-4 w-4 text-slate-500" />
        Help Center
      </a>

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <LogOut className="h-4 w-4 text-slate-500" />
        Log Out
      </button>

      <div className="mt-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-sm font-black text-blue-700">{platformName} Pro</p>
        <p className="mt-1 text-xs font-semibold text-slate-600">Verified learning, quizzes, and certificates</p>
      </div>
    </div>
  );
}

function HeaderLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-full px-4 py-2 text-sm font-bold transition",
          isActive ? "bg-accent-500 text-white shadow-sm shadow-accent-500/20" : "text-brand-700 hover:bg-brand-50",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

function MobileLink({ to, children, onClick }: { to: string; children: ReactNode; onClick: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "rounded-2xl px-4 py-3 text-sm font-bold transition",
          isActive ? "bg-accent-500 text-white" : "text-brand-700 hover:bg-brand-50",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

function DropdownLink({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
    >
      <span className="text-brand-600">{icon}</span>
      {children}
    </Link>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-black text-white">
      {initials || "A"}
    </span>
  );
}
