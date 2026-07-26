import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, BookOpenCheck, GraduationCap, Search, Sparkles, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import { CourseCard } from "../components/course/CourseCard";
import { ApiStatus } from "../components/ui/ApiStatus";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { courses as fallbackCourses } from "../data/courses";
import { listPublicCourses, type PublicCourseFromApi } from "../lib/courseApi";
import type { Course } from "../types/course";

type SortMode = "featured" | "popular" | "rating" | "duration";
type LevelFilter = "All" | Course["level"];

const fallbackCategories = ["All", "Security", "Leadership", "Operations", "Service", "Analytics", "Compliance"];
const levels: LevelFilter[] = ["All", "Beginner", "Intermediate", "Advanced"];

function toCatalogueCourse(course: PublicCourseFromApi): Course {
  return {
    ...course,
    outcomes: [],
    audience: [],
    accent: getAccent(course.category),
    lessons: [],
    resources: [],
  };
}

export function CataloguePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("All");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
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
      .catch((caughtError) => {
        if (!isMounted) {
          return;
        }

        setApiNotice(
          caughtError instanceof Error
            ? `Using static fallback courses. ${caughtError.message}`
            : "Using static fallback courses. Backend check could not be completed.",
        );
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
    const liveCategories = Array.from(new Set(courses.map((course) => course.category).filter(Boolean))).sort();
    return ["All", ...liveCategories.filter((category) => category !== "All")];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...courses]
      .filter((course) => {
        const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
        const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;

        if (!matchesCategory || !matchesLevel) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return [course.title, course.subtitle, course.description, course.category, course.level, course.trainerName]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((first, second) => {
        if (sortMode === "popular") {
          return second.enrolledCount - first.enrolledCount;
        }

        if (sortMode === "rating") {
          return second.rating - first.rating;
        }

        if (sortMode === "duration") {
          return first.durationMinutes - second.durationMinutes;
        }

        return Number(second.featured) - Number(first.featured) || second.enrolledCount - first.enrolledCount;
      });
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortMode]);

  const featuredCount = courses.filter((course) => course.featured).length;
  const totalLessons = courses.reduce((sum, course) => sum + course.lessonsCount, 0);
  const totalLearners = courses.reduce((sum, course) => sum + course.enrolledCount, 0);

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSortMode("featured");
  }

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="brand">Course catalogue</Badge>
            <ApiStatus />
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
                Browse focused learning paths built for measurable progress.
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                Search courses by topic, level, trainer, or outcome. Published courses are loaded from the secured Apps Script backend when available.
              </p>
            </div>

            <Card className="p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <CatalogueStat icon={<GraduationCap className="h-5 w-5" />} value={courses.length} label="Courses" />
                <CatalogueStat icon={<BookOpenCheck className="h-5 w-5" />} value={totalLessons} label="Lessons" />
                <CatalogueStat icon={<Users className="h-5 w-5" />} value={totalLearners.toLocaleString()} label="Learners" />
              </div>
            </Card>
          </div>

          <Card className="mt-8 p-4">
            <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto]">
              <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-slate-50 px-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-slate-400"
                  placeholder="Search courses, trainers, categories, or levels"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <select
                value={selectedLevel}
                onChange={(event) => setSelectedLevel(event.target.value as LevelFilter)}
                className="min-h-12 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level === "All" ? "All levels" : level}
                  </option>
                ))}
              </select>

              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="min-h-12 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              >
                <option value="featured">Featured first</option>
                <option value="popular">Most popular</option>
                <option value="rating">Highest rated</option>
                <option value="duration">Shortest first</option>
              </select>

              <Button variant="secondary" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(categories.length > 1 ? categories : fallbackCategories).map((category) => (
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
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-slate-700">
              {filteredCourses.length} published course{filteredCourses.length === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {featuredCount} featured path{featuredCount === 1 ? "" : "s"} available
            </p>
          </div>
          <p className="text-sm text-muted">{isLoading ? "Checking backend catalogue..." : apiNotice}</p>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-2xl font-bold text-ink">No courses match this view</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">
              Adjust the search, category, level, or sort options to find another course.
            </p>
            <Button className="mt-5" variant="secondary" onClick={clearFilters}>
              Clear filters
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        )}
      </section>
    </main>
  );
}

function CatalogueStat({ icon, value, label }: { icon: ReactNode; value: number | string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-brand-700">
        {icon}
        <p className="text-xs font-bold uppercase tracking-[0.12em]">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold text-ink">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

function getAccent(category: string): Course["accent"] {
  const normalized = category.toLowerCase();

  if (normalized.includes("leadership") || normalized.includes("service")) {
    return "success";
  }

  if (normalized.includes("operations") || normalized.includes("compliance")) {
    return "warning";
  }

  if (normalized.includes("analytics")) {
    return "neutral";
  }

  return "brand";
}
