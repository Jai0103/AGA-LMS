import { ArrowRight, GraduationCap } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { appConfig } from "../../config/app.config";
import { publicNavigation } from "../../config/routes";
import { Button } from "../ui/Button";

export function Navbar() {
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

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:inline-flex">
            Log in
          </Button>
          <Button variant="dark">
            Get started
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
