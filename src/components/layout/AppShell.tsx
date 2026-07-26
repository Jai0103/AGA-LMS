import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  SearchCheck,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const publicLinks = [
  { to: "/courses", label: "Courses" },
  { to: "/verify-certificate", label: "Verify Certificate" },
];

export function AppShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-20 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">AGA LMS</p>
                <p className="text-xs font-semibold text-slate-500">Premium learning platform</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {publicLinks.map((link) => (
                <HeaderLink key={link.to} to={link.to}>
                  {link.label}
                </HeaderLink>
              ))}

              <a href="/AGA-LMS/#/#platform" className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                Platform
              </a>
              <a href="/AGA-LMS/#/#security" className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
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
                    className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-2 pr-3 text-sm font-bold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    aria-expanded={isAccountOpen}
                  >
                    <UserAvatar name={user?.fullName ?? "AGA"} />
                    <span className="max-w-[10rem] truncate">{user?.fullName}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition ${isAccountOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isAccountOpen ? (
                    <AccountDropdown isAdmin={isAdmin} onLogout={handleLogout} onNavigate={() => setIsAccountOpen(false)} />
                  ) : null}
                </div>
              ) : (
                <>
                  <HeaderLink to="/login">Log in</HeaderLink>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 lg:hidden"
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
                <a href="/AGA-LMS/#/#platform" className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
                  Platform
                </a>
                <a href="/AGA-LMS/#/#security" className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
                  Security
                </a>

                {isSignedIn ? (
                  <>
                    <MobileLink to="/dashboard" onClick={() => setIsMobileOpen(false)}>My Learning</MobileLink>
                    <MobileLink to="/certificates" onClick={() => setIsMobileOpen(false)}>Certificates</MobileLink>
                    <MobileLink to="/profile" onClick={() => setIsMobileOpen(false)}>Settings</MobileLink>
                    {isAdmin ? <MobileLink to="/admin" onClick={() => setIsMobileOpen(false)}>Admin</MobileLink> : null}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <MobileLink to="/login" onClick={() => setIsMobileOpen(false)}>Log in</MobileLink>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileOpen(false)}
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-11rem)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm font-semibold text-slate-500 sm:px-6 lg:px-8">
          <p>AGA LMS · React, TypeScript, Vite, Tailwind CSS</p>
          <p>API connected through Apps Script · Build 2026</p>
        </div>
      </footer>
    </div>
  );
}

function AccountDropdown({
  isAdmin,
  onLogout,
  onNavigate,
}: {
  isAdmin: boolean;
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
      <DropdownLink to="/verify-certificate" icon={<SearchCheck className="h-4 w-4" />} onClick={onNavigate}>
        Verify Certificate
      </DropdownLink>
      <DropdownLink to="/courses" icon={<HelpCircle className="h-4 w-4" />} onClick={onNavigate}>
        Help Center
      </DropdownLink>

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <LogOut className="h-4 w-4 text-slate-500" />
        Log Out
      </button>

      <div className="mt-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-sm font-black text-blue-700">AGA LMS Pro</p>
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
          isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100",
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
          isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100",
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
      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      <span className="text-slate-500">{icon}</span>
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
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-950 text-sm font-black text-white">
      {initials || "A"}
    </span>
  );
}
