import { Search, SlidersHorizontal } from "lucide-react";
import { CourseCard } from "../components/course/CourseCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { courses } from "../data/courses";

const categories = ["All", "Security", "Leadership", "Operations", "Service", "Analytics", "Compliance"];

export function CataloguePage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Badge tone="brand">Course catalogue</Badge>
          <div className="mt-5 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-bold text-ink">Build skills through structured learning paths.</h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                Browse AGA LMS courses across security, leadership, operations, compliance, analytics, and service.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-slate-50 p-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                    placeholder="Search courses"
                    type="search"
                  />
                </label>
                <Button variant="secondary">
                  <SlidersHorizontal size={17} aria-hidden="true" />
                  Filters
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  index === 0
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700">{courses.length} published courses</p>
          <p className="text-sm text-muted">Static catalogue now, backend-powered later</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.courseId} course={course} />
          ))}
        </div>
      </section>
    </main>
  );
}
