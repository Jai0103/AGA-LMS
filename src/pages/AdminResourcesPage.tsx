import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AdminTable } from "../components/admin/AdminTable";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { adminCreateResource, adminListLessons, adminListResources } from "../lib/adminApi";
import type { AdminCreateResourcePayload, AdminResource } from "../types/admin";
import type { PlayerLesson } from "../types/progress";

const resourceTypes: AdminResource["type"][] = ["PDF", "Template", "Link", "Checklist"];

export function AdminResourcesPage() {
  const { courseId = "" } = useParams();
  const { sessionToken } = useAuth();

  const [courseTitle, setCourseTitle] = useState("");
  const [lessons, setLessons] = useState<PlayerLesson[]>([]);
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState<AdminCreateResourcePayload>({
    courseId,
    lessonId: "",
    title: "",
    type: "PDF",
    driveFileId: "",
    url: "",
  });

  useEffect(() => {
    let isMounted = true;

    Promise.all([adminListResources(courseId, sessionToken), adminListLessons(courseId, sessionToken)]).then(
      ([resourcesResponse, lessonsResponse]) => {
        if (!isMounted) {
          return;
        }

        if (resourcesResponse.ok) {
          setCourseTitle(resourcesResponse.data.course.title);
          setResources(resourcesResponse.data.resources);
        } else {
          setNotice(resourcesResponse.error.message);
        }

        if (lessonsResponse.ok) {
          setLessons(lessonsResponse.data.lessons);
        }

        setForm((current) => ({
          ...current,
          courseId,
        }));

        setIsLoading(false);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [courseId, sessionToken]);

  function updateField<K extends keyof AdminCreateResourcePayload>(
    field: K,
    value: AdminCreateResourcePayload[K],
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

    const response = await adminCreateResource(form, sessionToken);

    setIsSaving(false);

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setResources((current) => [...current, response.data.resource]);
    setForm((current) => ({
      ...current,
      lessonId: "",
      title: "",
      type: "PDF",
      driveFileId: "",
      url: "",
    }));
    setNotice("Resource created.");
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
            <Badge tone="brand">Admin resources</Badge>
            <h1 className="mt-5 text-4xl font-bold text-ink">{courseTitle || "Course resources"}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted">
              Add course-level or lesson-level resources using approved links.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit p-6">
          <h2 className="text-xl font-bold text-ink">Create resource</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use public or controlled-access URLs. Google Drive permission hardening comes later.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Resource title"
              name="title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
            />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Attach to lesson</span>
              <select
                className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                value={form.lessonId}
                onChange={(event) => updateField("lessonId", event.target.value)}
              >
                <option value="">Course level resource</option>
                {lessons.map((lesson) => (
                  <option key={lesson.lessonId} value={lesson.lessonId}>
                    {lesson.sortOrder}. {lesson.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Type</span>
              <select
                className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                value={form.type}
                onChange={(event) => updateField("type", event.target.value as AdminResource["type"])}
              >
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="URL"
              name="url"
              value={form.url}
              onChange={(event) => updateField("url", event.target.value)}
              required
            />

            <Input
              label="Drive file ID"
              name="driveFileId"
              value={form.driveFileId}
              onChange={(event) => updateField("driveFileId", event.target.value)}
              helperText="Optional."
            />

            {notice ? (
              <div className="rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm font-bold text-brand-700">
                {notice}
              </div>
            ) : null}

            <Button type="submit" disabled={isSaving} className="w-full">
              <CheckCircle2 size={16} aria-hidden="true" />
              {isSaving ? "Creating..." : "Create resource"}
            </Button>
          </form>
        </Card>

        <div>
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-sm font-bold text-muted">Loading resources...</p>
            </Card>
          ) : null}

          {!isLoading ? (
            <AdminTable title="Course resources">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-3">Resource</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Lesson</th>
                    <th className="px-5 py-3">URL</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {resources.map((resource) => (
                    <tr key={resource.resourceId}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                            <FileText size={17} aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-semibold text-ink">{resource.title}</p>
                            <p className="mt-1 font-mono text-xs text-muted">{resource.resourceId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge>{resource.type}</Badge>
                      </td>
                      <td className="px-5 py-3 text-muted">{resource.lessonId || "Course"}</td>
                      <td className="px-5 py-3">
                        <a
                          className="inline-flex items-center gap-2 text-sm font-bold text-brand-700"
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                          <ExternalLink size={15} aria-hidden="true" />
                        </a>
                      </td>
                    </tr>
                  ))}

                  {resources.length === 0 ? (
                    <tr>
                      <td className="px-5 py-8 text-center text-sm font-bold text-muted" colSpan={4}>
                        No resources yet.
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
