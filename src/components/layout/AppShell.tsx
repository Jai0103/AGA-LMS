import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Award, BookOpen, GraduationCap, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const publicLinks = [
  { to: "/courses", label: "Courses" },
  { to: "/verify-certificate", label: "Verify" },
];

const learnerLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/certificates", label: "Certificates", icon: Award },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export function AppShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isSignedIn = Boolean(user);
  const isAdmin = user?.role === "ADMIN";

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">AGA LMS</p>
                <p className="text-xs font-semibold text-slate-500">Premium learning platform</p>
              </div>
            </Link>

            <nav className="flex flex-wrap items-center gap-2">
              {publicLinks.map((link) => (
                <NavItem key={link.to} to={link.to}>
                  {link.label}
                </NavItem>
              ))}

              <a href="/AGA-LMS/#/#platform" className="rounded-full px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                Platform
              </a>
              <a href="/AGA-LMS/#/#security" className="rounded-full px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                Security
              </a>

              {isSignedIn ? (
                <>
                  {learnerLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <NavItem key={link.to} to={link.to}>
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </span>
                      </NavItem>
                    );
                  })}

                  {isAdmin ? (
                    <NavItem to="/admin">
                      <span className="inline-flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Admin
                      </span>
                    </NavItem>
                  ) : null}

                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                    <UserRound className="h-4 w-4" />
                    <span className="max-w-[10rem] truncate">{user?.fullName}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavItem to="/login">Log in</NavItem>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <BookOpen className="h-4 w-4" />
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </div>
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

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-full px-3 py-2 text-sm font-bold transition",
          isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
