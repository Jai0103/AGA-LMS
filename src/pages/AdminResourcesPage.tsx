import { type FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderOpen,
  Link as LinkIcon,
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
import { adminCreateResource, adminListLessons, adminListResources } from "../lib/adminApi";
import type { AdminCreateResourcePayload, AdminResource } from "../types/admin";
import type { PlayerLesson } from "../types/progress";

const resourceTypes: AdminResource["type"][] = ["PDF", "Template", "Link", "Checklist"];
type ResourceTypeFilter = "ALL" | AdminResource["type"];
type AttachmentFilter = "ALL" | "COURSE" | "LESSON";

const resourceIcons = {
  PDF: FileText,
  Template: ClipboardList,
  Link: LinkIcon,
  Checklist: FileCheck2,
};

export function AdminResourcesPage() {
  const { courseId = "" } = useParams();
  const { sessionToken } = useAuth();

  const [courseTitle, setCourseTitle] = useState("");
  const [lessons, setLessons] = useState<PlayerLesson[]>([]);
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ResourceTypeFilter>("ALL");
  const [attachmentFilter, setAttachmentFilter] = useState<AttachmentFilter>("ALL");

  const [form, setForm] = useState<AdminCreateResourcePayload>({
    courseId,
    lessonId: "",
    title: "",
    type: "PDF",
    driveFileId: "",
    url: "",
  });

  useEffect(() => {
    void loadResources();
  }, [courseId, sessionToken]);

  async function loadResources() {
    setIsLoading(true);
    setNotice("");

    try {
      const [resourcesResponse, lessonsResponse] = await Promise.all([
        adminListResources(courseId, sessionToken),
        adminListLessons(courseId, sessionToken),
      ]);

      if (resourcesResponse.ok) {
        setCourseTitle(resourcesResponse.data.course.title);
        setResources(resourcesResponse.data.resources);
      } else {
        setNotice(resourcesResponse.error.message);
      }

      if (lessonsResponse.ok) {
        setLessons([...lessonsResponse.data.lessons].sort((first, second) => first.sortOrder - second.sortOrder));
      } else if (!notice) {
        setNotice(lessonsResponse.error.message);
      }

      setForm((current) => ({
        ...current,
        courseId,
      }));
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Resources could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

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

    try {
      const response = await adminCreateResource(form, sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      setResources((current) => [response.data.resource, ...current]);
      setForm((current) => ({
        ...current,
        lessonId: "",
        title: "",
        type: "PDF",
        driveFileId: "",
        url: "",
      }));
      setNotice("Resource created.");
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Resource could not be created.");
    } finally {
      setIsSaving(false);
    }
  }

  const courseLevelCount = resources.filter((resource) => !resource.lessonId).length;
  const lessonLevelCount = resources.length - courseLevelCount;
  const driveLinkedCount = resources.filter((resource) => resource.driveFileId.trim().length > 0).length;

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesType = typeFilter === "ALL" || resource.type === typeFilter;
      const matchesAttachment =
        attachmentFilter === "ALL" ||
        (attachmentFilter === "COURSE" && !resource.lessonId) ||
        (attachmentFilter === "LESSON" && Boolean(resource.lessonId));

      if (!matchesType || !matchesAttachment) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const lessonTitle = getLessonTitle(resource.lessonId, lessons);

      return [resource.title, resource.type, resource.url, resource.driveFileId, resource.resourceId, resource.lessonId, lessonTitle]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [attachmentFilter, lessons, query, resources, typeFilter]);

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
              <Badge tone="brand">Admin resources</Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
                {courseTitle || "Course resources"}
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                Manage PDFs, templates, links, and checklists for the course or specific lessons through protected backend actions.
              </p>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Resource readiness</p>
                  <h2 className="mt-3 text-2xl font-bold">
                    {resources.length > 0 ? `${resources.length} resource${resources.length === 1 ? "" : "s"} available` : "No resources yet"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {driveLinkedCount} linked to Drive IDs and {lessonLevelCount} attached to lessons.
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
            <MetricCard icon={<FolderOpen className="h-6 w-6" />} label="Total resources" value={resources.length} />
            <MetricCard icon={<BookOpen className="h-6 w-6" />} label="Lesson resources" value={lessonLevelCount} />
            <MetricCard icon={<FileCheck2 className="h-6 w-6" />} label="Drive linked" value={driveLinkedCount} />
          </div>

          <Card className="h-fit rounded-[1.5rem] p-6">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-brand-600" />
              <h2 className="text-xl font-bold text-ink">Create resource</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Use approved public or controlled-access URLs. Drive file IDs help admins trace the stored source file.
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
                helperText="Use the final shareable URL learners should open."
                required
              />

              <Input
                label="Drive file ID"
                name="driveFileId"
                value={form.driveFileId}
                onChange={(event) => updateField("driveFileId", event.target.value)}
                helperText="Optional. Paste only the Google Drive file ID."
              />

              {notice ? (
                <div className="flex items-start justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-3 text-sm font-bold text-brand-700">
                  <span>{notice}</span>
                  <button type="button" onClick={() => setNotice("")} className="rounded-full p-1 transition hover:bg-brand-100">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : null}

              <Button type="submit" disabled={isSaving} className="w-full">
                <CheckCircle2 size={16} aria-hidden="true" />
                {isSaving ? "Creating..." : "Create resource"}
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
                    <FolderOpen className="h-5 w-5 text-brand-600" />
                    <h2 className="text-lg font-bold text-ink">Resource inventory</h2>
                  </div>
                  <p className="mt-1 text-sm text-muted">Search and review learner-facing course files, templates, links, and checklists.</p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadResources()}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-bold text-ink transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_auto_auto]">
                <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-slate-50 px-4">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search title, type, URL, Drive ID, resource ID, or lesson"
                    className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-slate-400"
                  />
                </label>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as ResourceTypeFilter)}
                  className="min-h-12 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="ALL">All resource types</option>
                  {resourceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  value={attachmentFilter}
                  onChange={(event) => setAttachmentFilter(event.target.value as AttachmentFilter)}
                  className="min-h-12 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="ALL">All attachments</option>
                  <option value="COURSE">Course level</option>
                  <option value="LESSON">Lesson level</option>
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
                      <th className="px-5 py-3">Resource</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Attachment</th>
                      <th className="px-5 py-3">Drive</th>
                      <th className="px-5 py-3">URL</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line">
                    {filteredResources.map((resource) => {
                      const Icon = resourceIcons[resource.type];
                      const lessonTitle = getLessonTitle(resource.lessonId, lessons);

                      return (
                        <tr key={resource.resourceId} className="align-top">
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                <Icon size={18} aria-hidden="true" />
                              </div>
                              <div>
                                <p className="font-bold text-ink">{resource.title}</p>
                                <p className="mt-1 max-w-[14rem] truncate font-mono text-xs text-muted">{resource.resourceId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <ResourceTypeBadge type={resource.type} />
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-ink">{resource.lessonId ? lessonTitle : "Course level"}</p>
                            <p className="mt-1 max-w-[14rem] truncate font-mono text-xs text-muted">
                              {resource.lessonId || "Applies to full course"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            {resource.driveFileId ? (
                              <span className="block max-w-[12rem] truncate font-mono text-xs text-muted">{resource.driveFileId}</span>
                            ) : (
                              <Badge tone="warning">No Drive ID</Badge>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <a
                              className="inline-flex items-center gap-2 rounded-2xl border border-line px-3 py-2 text-sm font-bold text-brand-700 transition hover:border-brand-200 hover:bg-brand-50"
                              href={resource.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open
                              <ExternalLink size={15} aria-hidden="true" />
                            </a>
                            <p className="mt-2 max-w-[18rem] truncate text-xs text-muted">{resource.url}</p>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredResources.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm font-bold text-muted" colSpan={5}>
                          No resources match this view.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            ) : null}
          </Card>

          <div className="rounded-2xl border border-line bg-white p-4 text-sm leading-6 text-muted">
            Resources are created through protected Apps Script actions. Keep sensitive permission rules in Google
            Drive and Apps Script, and expose only approved learner-facing links in this page.
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

function ResourceTypeBadge({ type }: { type: AdminResource["type"] }) {
  if (type === "PDF") {
    return <Badge tone="brand">PDF</Badge>;
  }

  if (type === "Template") {
    return <Badge tone="success">Template</Badge>;
  }

  if (type === "Checklist") {
    return <Badge tone="warning">Checklist</Badge>;
  }

  return <Badge>Link</Badge>;
}

function getLessonTitle(lessonId: string, lessons: PlayerLesson[]) {
  if (!lessonId) {
    return "Course level";
  }

  const lesson = lessons.find((item) => item.lessonId === lessonId);

  if (!lesson) {
    return "Unknown lesson";
  }

  return `${lesson.sortOrder}. ${lesson.title}`;
}
