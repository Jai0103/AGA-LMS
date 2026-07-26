import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  BookOpen,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { CourseCard } from "../components/course/CourseCard";
import { ApiStatus } from "../components/ui/ApiStatus";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { courses as fallbackCourses } from "../data/courses";
import { listPublicCourses, type PublicCourseFromApi } from "../lib/courseApi";
import type { Course, CourseLevel } from "../types/course";

const preferredCategories = ["Security", "Leadership", "Operations", "Service", "Analytics", "Compliance"];
const levels: Array<"All" | CourseLevel> = ["All", "Beginner", "Intermediate", "Advanced"];

type SortOption = "featured" | "rating" | "popular" | "newest" | "duration-asc" | "duration-desc" | "title";

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "featured", label: "Featured first" },
  { value: "rating", label: "Highest rated" },
  { value: "popular", label: "Most learners" },
  { value: "newest", label: "Newest courses" },
  { value: "duration-asc", label: "Shortest first" },
  { value: "duration-desc", label: "Longest first" },
  { value: "title", label: "A-Z" },
];

function toCatalogueCourse(course: PublicCourseFromApi): Course {
  return {
    ...course,
    outcomes: [],
    audience: [],
    accent: getAccentForCategory(course.category),
    lessons: [],
    resources: [],
  };
}

export function CataloguePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState<"All" | CourseLevel>("All");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [courses, setCourses] = useState<Course[]>(fallbackCourses);
  const [apiNotice, setApiNotice] = useState("Static catalogue loaded while backend data is checked.");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    listPublicCourses()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        if (response.ok) {
          setCourses(response.data.courses.map(toCatalogueCourse));
          setApiNotice("Live courses loaded from Google Sheets.");
        } else {
          setApiNotice(`Using static fallback courses. ${response.error.message}`);
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiNotice("Using static fallback courses. Backend catalogue could not be reached.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const liveCategories = Array.from(new Set(courses.map((course) => course.category).filter(Boolean)));
    const merged = [...preferredCategories, ...liveCategories].filter((category, index, values) => {
      return values.indexOf(category) === index;
    });

    return ["All", ...merged];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return courses
      .filter((course) => {
        const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
        const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;

        if (!matchesCategory || !matchesLevel) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return [
          course.title,
          course.subtitle,
          course.description,
          course.category,
          course.level,
          course.trainerName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((left, right) => sortCourses(left, right, sortBy));
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy]);

  const featuredCount = useMemo(() => courses.filter((course) => course.featured).length, [courses]);
  const totalLearners = useMemo(() => {
    return courses.reduce((total, course) => total + Number(course.enrolledCount || 0), 0);
  }, [courses]);
  const activeFilterCount = [
    searchTerm.trim() ? "search" : "",
    selectedCategory !== "All" ? "category" : "",
    selectedLevel !== "All" ? "level" : "",
  ].filter(Boolean).length;

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSortBy("featured");
  }

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="brand">Course catalogue</Badge>
            <ApiStatus />
          </div>

          <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink">
                Find the right course faster.
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                Search, filter, and compare AGA LMS courses across security, leadership, operations, compliance,
                analytics, and service.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <CatalogueMetric icon={<BookOpen size={18} />} label="Courses" value={String(courses.length)} />
                <CatalogueMetric icon={<Sparkles size={18} />} label="Featured" value={String(featuredCount)} />
                <CatalogueMetric icon={<Users size={18} />} label="Learners" value={formatNumber(totalLearners)} />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-slate-50 p-4 shadow-sm">
              <div className="grid gap-3">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    className="h-12 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                    placeholder="Search by title, trainer, category, or skill"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-3">
                  <label className="grid gap-1">
                    <span className="text-xs font-bold uppercase tracking-normal text-muted">Category</span>
                    <select
                      className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                      value={selectedCategory}
                      onChange={(event) => setSelectedCategory(event.target.value)}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-bold uppercase tracking-normal text-muted">Level</span>
                    <select
                      className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                      value={selectedLevel}
                      onChange={(event) => setSelectedLevel(event.target.value as "All" | CourseLevel)}
                    >
                      {levels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-bold uppercase tracking-normal text-muted">Sort</span>
                    <select
                      className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as SortOption)}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
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
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-slate-700">
                {filteredCourses.length} of {courses.length} published courses
              </p>
              {activeFilterCount > 0 ? <Badge tone="success">{activeFilterCount} active filters</Badge> : null}
              {isLoading ? <Badge tone="warning">Refreshing</Badge> : null}
            </div>
            <p className="mt-2 text-sm text-muted">{apiNotice}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-slate-700">
              <ArrowDownAZ size={16} aria-hidden="true" />
              {sortOptions.find((option) => option.value === sortBy)?.label}
            </div>
            <Button variant="secondary" onClick={clearFilters} disabled={activeFilterCount === 0 && sortBy === "featured"}>
              <X size={16} aria-hidden="true" />
              Clear
            </Button>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <SlidersHorizontal size={22} aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-ink">No courses match these filters.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
              Try a broader search term, choose a different category, or clear all filters to return to the full
              catalogue.
            </p>
            <div className="mt-6">
              <Button variant="dark" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function CatalogueMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-xs font-bold uppercase tracking-normal">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function sortCourses(left: Course, right: Course, sortBy: SortOption) {
  if (sortBy === "featured") {
    return Number(right.featured) - Number(left.featured) || right.rating - left.rating || left.title.localeCompare(right.title);
  }

  if (sortBy === "rating") {
    return right.rating - left.rating || right.enrolledCount - left.enrolledCount;
  }

  if (sortBy === "popular") {
    return right.enrolledCount - left.enrolledCount || right.rating - left.rating;
  }

  if (sortBy === "newest") {
    return right.courseId.localeCompare(left.courseId);
  }

  if (sortBy === "duration-asc") {
    return Number(left.durationMinutes || 0) - Number(right.durationMinutes || 0);
  }

  if (sortBy === "duration-desc") {
    return Number(right.durationMinutes || 0) - Number(left.durationMinutes || 0);
  }

  return left.title.localeCompare(right.title);
}

function getAccentForCategory(category: string): Course["accent"] {
  if (category === "Security" || category === "Compliance") {
    return "brand";
  }

  if (category === "Leadership" || category === "Service") {
    return "success";
  }

  if (category === "Operations") {
    return "warning";
  }

  return "neutral";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}
