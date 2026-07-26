import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, GraduationCap, Home, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

export function NotFoundPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <main className="bg-slate-50">
      <section className="mx-auto grid min-h-[72vh] max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
            <ShieldCheck className="h-4 w-4" />
            Route fallback
          </div>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-6xl">
            This page is not available.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
            The link may be old, incomplete, or outside the current AGA LMS route set. Choose a safe destination below to continue.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <QuickLink to="/" icon={<Home className="h-5 w-5" />} title="Home" text="Return to the LMS landing page." />
            <QuickLink
              to="/courses"
              icon={<BookOpenCheck className="h-5 w-5" />}
              title="Courses"
              text="Browse published courses."
            />
            <QuickLink
              to={isAuthenticated ? "/dashboard" : "/login"}
              icon={<LayoutDashboard className="h-5 w-5" />}
              title={isAuthenticated ? "Dashboard" : "Log in"}
              text={isAuthenticated ? "Open your learning dashboard." : "Sign in to continue learning."}
            />
            <QuickLink
              to={user?.role === "ADMIN" ? "/admin" : "/certificates"}
              icon={<GraduationCap className="h-5 w-5" />}
              title={user?.role === "ADMIN" ? "Admin" : "Certificates"}
              text={user?.role === "ADMIN" ? "Open platform operations." : "View your issued credentials."}
            />
          </div>
        </div>

        <Card className="overflow-hidden rounded-[2rem]">
          <div className="bg-slate-950 p-8 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">404</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">No dead ends, just better paths.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              A production LMS should recover gracefully when someone opens an invalid route, refreshes an old link,
              or mistypes a URL.
            </p>
            <Link to="/courses" className="mt-7 inline-flex">
              <Button>
                Browse courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}

function QuickLink({ to, icon, title, text }: { to: string; icon: ReactNode; title: string; text: string }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-soft"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">{icon}</div>
        <div>
          <h2 className="font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
        </div>
      </div>
    </Link>
  );
}
