import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { CourseCard } from "../components/course/CourseCard";
import { ApiStatus } from "../components/ui/ApiStatus";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { usePlatformSettings } from "../context/PlatformSettingsContext";
import { courses as fallbackCourses } from "../data/courses";
import { listPublicCourses, type PublicCourseFromApi } from "../lib/courseApi";
import type { Course } from "../types/course";

const categories = ["All", "Security", "Leadership", "Operations", "Service", "Analytics", "Compliance"];

function toCatalogueCourse(course: PublicCourseFromApi): Course {
  return {
    ...course,
    outcomes: [],
    audience: [],
    accent: "brand",
    lessons: [],
    resources: [],
  };
}

export function CataloguePage() {
  const { settings } = usePlatformSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [courses, setCourses] = useState<Course[]>(fallbackCourses);
  const [apiNotice, setApiNotice] = useState("Static catalogue loaded while backend data is checked.");

  useEffect(() => {
    let isMounted = true;

    listPublicCourses().then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setCourses(response.data.courses.map(toCatalogueCourse));
        setApiNotice("Live courses loaded from Google Sheets.");
      } else {
        setApiNotice(`Using static fallback courses. ${response.error.message}`);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      const normalizedSearch = searchTerm.trim().toLowerCase();

      if (!normalizedSearch) {
        return matchesCategory;
      }

      return (
        matchesCategory &&
        [course.title, course.subtitle, course.description, course.category, course.level]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [courses, searchTerm, selectedCategory]);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="brand">Course catalogue</Badge>
            <ApiStatus />
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-bold text-ink">Build skills through structured learning paths.</h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                Browse {settings.platformName} courses across security, leadership, operations, compliance, analytics, and service.
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
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
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
            {categories.map((category) => (
              <button
                key={category}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  selectedCategory === category
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setSelectedCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <p className="text-sm font-bold text-slate-700">{filteredCourses.length} published courses</p>
          <p className="text-sm text-muted">{apiNotice}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.courseId} course={course} />
          ))}
        </div>
      </section>
    </main>
  );
}
