import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-normal text-brand-700">404</p>
        <h1 className="mt-3 text-4xl font-bold text-ink">Page not found</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted">
          The page you opened does not exist yet. We will add the full LMS routes module by module.
        </p>
        <Link to="/" className="mt-7">
          <Button>Return home</Button>
        </Link>
      </div>
    </main>
  );
}
