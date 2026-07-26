import { ArrowRight, GraduationCap, LogOut, UserCircle } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { appConfig } from "../../config/app.config";
import { publicNavigation } from "../../config/routes";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white">
            <GraduationCap size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold leading-4">{appConfig.name}</span>
            <span className="block text-xs text-muted">{appConfig.tagline}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          {publicNavigation.map((item) => (
            <NavLink
              key={item.href}
              className={({ isActive }) =>
                `transition hover:text-ink ${isActive && item.href === "/courses" ? "text-ink" : ""}`
              }
              to={item.href}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-line bg-slate-50 px-3 py-2 sm:flex">
              <UserCircle size={17} aria-hidden="true" />
              <span className="text-sm font-bold text-slate-700">{user.fullName}</span>
            </div>
            <Button variant="secondary" onClick={logout}>
              <LogOut size={16} aria-hidden="true" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-flex">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/register">
              <Button variant="dark">
                Get started
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
