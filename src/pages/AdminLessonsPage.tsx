import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, FileText, HelpCircle, PlayCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AdminTable } from "../components/admin/AdminTable";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { adminCreateLesson, adminListLessons } from "../lib/adminApi";
import type { AdminCreateLessonPayload } from "../types/admin";
import type { PlayerLesson } from "../types/progress";

const lessonTypes: AdminCreateLessonPayload["type"][] = ["Video", "Reading", "Quiz", "Resource"];

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

  const [form, setForm] = useState<AdminCreateLessonPayload>({
    courseId,
    title: "",
    type: "Video",
    durationMinutes: 10,
    isPreview: false,
    sortOrder: 0,
    videoUrl: "",
    notes: "",
  });

  useEffect(() => {
    let isMounted = true;

    adminListLessons(courseId, sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setCourseTitle(response.data.course.title);
        setLessons(response.data.lessons);
        setForm((current) => ({
          ...current,
          courseId,
          sortOrder: response.data.lessons.length + 1,
        }));
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [courseId, sessionToken]);

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

    const response = await adminCreateLesson(form, sessionToken);

    setIsSaving(false);

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setLessons((current) => [...current, response.data.lesson].sort((a, b) => a.sortOrder - b.sortOrder));
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
  }

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to courses
          </Link>

          <div className="mt-6">
            <Badge tone="brand">Admin lessons</Badge>
            <h1 className="mt-5 text-4xl font-bold text-ink">{courseTitle || "Course lessons"}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted">
              Add lessons for this course. Lessons become available in the course player after enrollment.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit p-6">
          <h2 className="text-xl font-bold text-ink">Create lesson</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Video URLs can point to approved hosted media. Google Drive file handling will be hardened in a later storage step.
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
              helperText="Optional for now."
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
              <div className="rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm font-bold text-brand-700">
                {notice}
              </div>
            ) : null}

            <Button type="submit" disabled={isSaving} className="w-full">
              <CheckCircle2 size={16} aria-hidden="true" />
              {isSaving ? "Creating..." : "Create lesson"}
            </Button>
          </form>
        </Card>

        <div>
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-sm font-bold text-muted">Loading lessons...</p>
            </Card>
          ) : null}

          {!isLoading ? (
            <AdminTable title="Course lessons">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Lesson</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3">Preview</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {lessons.map((lesson) => {
                    const Icon = lessonIcons[lesson.type];

                    return (
                      <tr key={lesson.lessonId}>
                        <td className="px-5 py-3 font-bold text-ink">{lesson.sortOrder}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                              <Icon size={17} aria-hidden="true" />
                            </div>
                            <div>
                              <p className="font-semibold text-ink">{lesson.title}</p>
                              <p className="mt-1 font-mono text-xs text-muted">{lesson.lessonId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge>{lesson.type}</Badge>
                        </td>
                        <td className="px-5 py-3 text-muted">{lesson.durationMinutes} min</td>
                        <td className="px-5 py-3">
                          <Badge tone={lesson.isPreview ? "success" : "neutral"}>
                            {lesson.isPreview ? "Yes" : "No"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}

                  {lessons.length === 0 ? (
                    <tr>
                      <td className="px-5 py-8 text-center text-sm font-bold text-muted" colSpan={5}>
                        No lessons yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </AdminTable>
          ) : null}
        </div>
      </section>
    </main>
  );
}
