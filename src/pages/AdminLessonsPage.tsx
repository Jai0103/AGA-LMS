import { type FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  HelpCircle,
  ListChecks,
  PlayCircle,
  PlusCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { adminCreateLesson, adminListLessons } from "../lib/adminApi";
import type { AdminCreateLessonPayload } from "../types/admin";
import type { PlayerLesson } from "../types/progress";

const lessonTypes: AdminCreateLessonPayload["type"][] = ["Video", "Reading", "Quiz", "Resource"];
type LessonTypeFilter = "ALL" | AdminCreateLessonPayload["type"];

const lessonIcons = {
  Video: PlayCircle,
  Reading: FileText,
  Quiz: HelpCircle,
  Resource: BookOpen,
};

export function AdminLessonsPage() {
  const { courseId = "" } = useParams();
  const { sessionToken } = useAuth();

  const [courseTitle, setCourseTitle] = useState("");
  const [lessons, setLessons] = useState<PlayerLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<LessonTypeFilter>("ALL");

  const [form, setForm] = useState<AdminCreateLessonPayload>({
    courseId,
    title: "",
    type: "Video",
    durationMinutes: 10,
    isPreview: false,
    sortOrder: 1,
    videoUrl: "",
    notes: "",
  });

  useEffect(() => {
    void loadLessons();
  }, [courseId, sessionToken]);

  async function loadLessons() {
    setIsLoading(true);
    setNotice("");

    try {
      const response = await adminListLessons(courseId, sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      const sortedLessons = [...response.data.lessons].sort((first, second) => first.sortOrder - second.sortOrder);
      setCourseTitle(response.data.course.title);
      setLessons(sortedLessons);
      setForm((current) => ({
        ...current,
        courseId,
        sortOrder: sortedLessons.length + 1,
      }));
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Lessons could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<K extends keyof AdminCreateLessonPayload>(
    field: K,
    value: AdminCreateLessonPayload[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice("");

    try {
      const response = await adminCreateLesson(form, sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      setLessons((current) => [...current, response.data.lesson].sort((first, second) => first.sortOrder - second.sortOrder));
      setForm((current) => ({
        ...current,
        title: "",
        durationMinutes: 10,
        isPreview: false,
        sortOrder: response.data.lessonsCount + 1,
        videoUrl: "",
        notes: "",
      }));
      setNotice("Lesson created.");
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Lesson could not be created.");
    } finally {
      setIsSaving(false);
    }
  }

  const totalDuration = lessons.reduce((sum, lesson) => sum + safeNumber(lesson.durationMinutes), 0);
  const previewCount = lessons.filter((lesson) => lesson.isPreview).length;
  const videoCount = lessons.filter((lesson) => lesson.type === "Video").length;

  const filteredLessons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return lessons.filter((lesson) => {
      const matchesType = typeFilter === "ALL" || lesson.type === typeFilter;

      if (!matchesType) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [lesson.title, lesson.type, lesson.lessonId, lesson.videoUrl, lesson.notes]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [lessons, query, typeFilter]);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
              <ArrowLeft size={16} aria-hidden="true" />
              Back to courses
            </Link>

            <div className="mt-6">
              <Badge tone="brand">Admin lessons</Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
                {courseTitle || "Course curriculum"}
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                Build a polished learning sequence with video, reading, quiz, and resource lessons. The backend validates every lesson before saving it to Google Sheets.
              </p>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Curriculum readiness</p>
                  <h2 className="mt-3 text-2xl font-bold">
                    {lessons.length > 0 ? `${lessons.length} lesson${lessons.length === 1 ? "" : "s"} configured` : "No lessons yet"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {previewCount} preview lesson{previewCount === 1 ? "" : "s"} and {formatDuration(totalDuration)} of learning time.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <ShieldCheck className="h-8 w-8 text-emerald-300" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[430px_1fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <MetricCard icon={<ListChecks className="h-6 w-6" />} label="Total lessons" value={lessons.length} />
            <MetricCard icon={<PlayCircle className="h-6 w-6" />} label="Video lessons" value={videoCount} />
            <MetricCard icon={<Clock3 className="h-6 w-6" />} label="Total duration" value={formatDuration(totalDuration)} />
          </div>

          <Card className="h-fit rounded-[1.5rem] p-6">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-brand-600" />
              <h2 className="text-xl font-bold text-ink">Create lesson</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Use clear titles and sort order values. Video URLs can point to approved hosted media.
            </p>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Lesson title"
                name="title"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                required
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Type</span>
                  <select
                    className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                    value={form.type}
                    onChange={(event) => updateField("type", event.target.value as AdminCreateLessonPayload["type"])}
                  >
                    {lessonTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <Input
                  label="Sort order"
                  name="sortOrder"
                  type="number"
                  min={1}
                  value={form.sortOrder}
                  onChange={(event) => updateField("sortOrder", Number(event.target.value))}
                  required
                />

                <Input
                  label="Duration minutes"
                  name="durationMinutes"
                  type="number"
                  min={0}
                  value={form.durationMinutes}
                  onChange={(event) => updateField("durationMinutes", Number(event.target.value))}
                  required
                />

                <label className="flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-3">
                  <input
                    checked={form.isPreview}
                    onChange={(event) => updateField("isPreview", event.target.checked)}
                    type="checkbox"
                  />
                  <span className="text-sm font-bold text-slate-700">Preview lesson</span>
                </label>
              </div>

              <Input
                label="Video URL"
                name="videoUrl"
                value={form.videoUrl}
                onChange={(event) => updateField("videoUrl", event.target.value)}
                helperText="Optional. Use for video lessons or hosted media."
              />

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Notes</span>
                <textarea
                  className="min-h-32 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                />
              </label>

              {notice ? (
                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-3 text-sm font-bold text-brand-700">
                  {notice}
                </div>
              ) : null}

              <Button type="submit" disabled={isSaving} className="w-full">
                <CheckCircle2 size={16} aria-hidden="true" />
                {isSaving ? "Creating..." : "Create lesson"}
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="border-b border-line p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-brand-600" />
                    <h2 className="text-lg font-bold text-ink">Course lessons</h2>
                  </div>
                  <p className="mt-1 text-sm text-muted">Review lesson order, type, duration, preview access, and media readiness.</p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadLessons()}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-bold text-ink transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_auto]">
                <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-slate-50 px-4">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search title, type, lesson ID, URL, or notes"
                    className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-slate-400"
                  />
                </label>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as LessonTypeFilter)}
                  className="min-h-12 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="ALL">All lesson types</option>
                  {lessonTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="p-6">
                <div className="h-4 w-44 rounded-full bg-slate-100" />
                <div className="mt-5 space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              </div>
            ) : null}

            {!isLoading ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-muted">
                    <tr>
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Lesson</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Duration</th>
                      <th className="px-5 py-3">Preview</th>
                      <th className="px-5 py-3">Readiness</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line">
                    {filteredLessons.map((lesson) => {
                      const Icon = lessonIcons[lesson.type];
                      const hasVideo = lesson.videoUrl.trim().length > 0;
                      const hasNotes = lesson.notes.trim().length > 0;

                      return (
                        <tr key={lesson.lessonId} className="align-top">
                          <td className="px-5 py-4">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-ink">
                              {lesson.sortOrder}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                <Icon size={18} aria-hidden="true" />
                              </div>
                              <div>
                                <p className="font-bold text-ink">{lesson.title}</p>
                                <p className="mt-1 max-w-[14rem] truncate font-mono text-xs text-muted">{lesson.lessonId}</p>
                                {lesson.notes ? (
                                  <p className="mt-2 max-w-md text-xs leading-5 text-muted">{lesson.notes}</p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Badge>{lesson.type}</Badge>
                          </td>
                          <td className="px-5 py-4 text-muted">{lesson.durationMinutes} min</td>
                          <td className="px-5 py-4">
                            <Badge tone={lesson.isPreview ? "success" : "neutral"}>
                              {lesson.isPreview ? "Preview" : "Locked"}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Badge tone={hasVideo || lesson.type !== "Video" ? "success" : "warning"}>
                                {lesson.type === "Video" ? (hasVideo ? "Video URL" : "No video URL") : "Media optional"}
                              </Badge>
                              <Badge tone={hasNotes ? "brand" : "neutral"}>{hasNotes ? "Notes" : "No notes"}</Badge>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredLessons.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm font-bold text-muted" colSpan={6}>
                          No lessons match this view.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            ) : null}
          </Card>

          <div className="rounded-2xl border border-line bg-white p-4 text-sm leading-6 text-muted">
            Lessons are stored through protected Apps Script actions. The frontend helps admins organise curriculum,
            but the backend remains responsible for validation and persistence.
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <Card className="rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">{icon}</div>
        <Sparkles className="h-5 w-5 text-amber-500" />
      </div>
      <p className="mt-5 text-3xl font-bold text-ink">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
    </Card>
  );
}

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}
