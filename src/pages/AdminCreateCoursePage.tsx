import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { adminCreateCourse } from "../lib/adminApi";
import type { AdminCreateCoursePayload } from "../types/admin";

export function AdminCreateCoursePage() {
  const navigate = useNavigate();
  const { sessionToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState<AdminCreateCoursePayload>({
    title: "",
    subtitle: "",
    category: "Operations",
    level: "Beginner",
    description: "",
    trainerName: "AGA Faculty",
    duration: "1h 00m",
    durationMinutes: 60,
    lessonsCount: 0,
    status: "Draft",
  });

  function updateField<K extends keyof AdminCreateCoursePayload>(
    field: K,
    value: AdminCreateCoursePayload[K],
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

    const response = await adminCreateCourse(form, sessionToken);

    setIsSaving(false);

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    navigate("/admin/courses");
  }

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Badge tone="brand">Admin courses</Badge>

          <h1 className="mt-5 text-4xl font-bold text-ink">Create course.</h1>

          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Add a new course record. Lessons, resources, quizzes, and certificates remain managed by secure backend modules.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <BookOpen size={22} aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-ink">Course metadata</h2>
              <p className="text-sm text-muted">Public visibility is controlled by course status.</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
            />

            <Input
              label="Subtitle"
              name="subtitle"
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
              required
            />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Description</span>
              <textarea
                className="min-h-32 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                required
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Category"
                name="category"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                required
              />

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Level</span>
                <select
                  className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  value={form.level}
                  onChange={(event) =>
                    updateField("level", event.target.value as AdminCreateCoursePayload["level"])
                  }
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </label>

              <Input
                label="Trainer name"
                name="trainerName"
                value={form.trainerName}
                onChange={(event) => updateField("trainerName", event.target.value)}
                required
              />

              <Input
                label="Duration label"
                name="duration"
                value={form.duration}
                onChange={(event) => updateField("duration", event.target.value)}
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

              <Input
                label="Lessons count"
                name="lessonsCount"
                type="number"
                min={0}
                value={form.lessonsCount}
                onChange={(event) => updateField("lessonsCount", Number(event.target.value))}
                required
              />

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Status</span>
                <select
                  className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as AdminCreateCoursePayload["status"])
                  }
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </label>
            </div>

            {notice ? (
              <div className="rounded-lg border border-orange-100 bg-orange-50 p-3 text-sm font-bold text-orange-700">
                {notice}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={isSaving}>
                <CheckCircle2 size={16} aria-hidden="true" />
                {isSaving ? "Creating..." : "Create course"}
              </Button>

              <Button type="button" variant="secondary" onClick={() => navigate("/admin/courses")}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </main>
  );
}
