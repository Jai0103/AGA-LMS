import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  ListChecks,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAuth } from "../context/AuthContext";
import { getCoursePlayer, markLessonComplete } from "../lib/progressApi";
import { listCourseResources } from "../lib/resourceApi";
import type { AdminResource } from "../types/admin";
import type { CoursePlayerData, PlayerLesson } from "../types/progress";

const lessonIcons = {
  Video: PlayCircle,
  Reading: FileText,
  Quiz: HelpCircle,
  Resource: FileText,
};

const resourceTone = {
  PDF: "brand",
  Template: "success",
  Link: "neutral",
  Checklist: "warning",
} as const;

export function CoursePlayerPage() {
  const { courseId = "" } = useParams();
  const { sessionToken } = useAuth();

  const [playerData, setPlayerData] = useState<CoursePlayerData | null>(null);
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([getCoursePlayer(courseId, sessionToken), listCourseResources(courseId, sessionToken)]).then(
      ([playerResponse, resourcesResponse]) => {
        if (!isMounted) {
          return;
        }

        if (playerResponse.ok) {
          setPlayerData(playerResponse.data);
          setSelectedLessonId(playerResponse.data.lessons[0]?.lessonId ?? "");
        } else {
          setNotice(playerResponse.error.message);
        }

        if (resourcesResponse.ok) {
          setResources(resourcesResponse.data.resources);
        }

        setIsLoading(false);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [courseId, sessionToken]);

  const completedLessonIds = useMemo(() => {
    return new Set(playerData?.progress.filter((item) => item.completed).map((item) => item.lessonId) ?? []);
  }, [playerData]);

  const selectedLessonIndex = useMemo(() => {
    return playerData?.lessons.findIndex((lesson) => lesson.lessonId === selectedLessonId) ?? -1;
  }, [playerData, selectedLessonId]);

  const selectedLesson = useMemo<PlayerLesson | null>(() => {
    return selectedLessonIndex >= 0 ? playerData?.lessons[selectedLessonIndex] ?? null : null;
  }, [playerData, selectedLessonIndex]);

  const previousLesson = selectedLessonIndex > 0 ? playerData?.lessons[selectedLessonIndex - 1] ?? null : null;
  const nextLesson = playerData && selectedLessonIndex >= 0 ? playerData.lessons[selectedLessonIndex + 1] ?? null : null;

  const selectedLessonResources = useMemo(() => {
    return resources.filter((resource) => resource.lessonId === selectedLessonId);
  }, [resources, selectedLessonId]);

  const courseLevelResources = useMemo(() => {
    return resources.filter((resource) => !resource.lessonId);
  }, [resources]);

  const completedCount = completedLessonIds.size;
  const lessonCount = playerData?.lessons.length ?? 0;
  const localProgressPercent = lessonCount ? Math.round((completedCount / lessonCount) * 100) : 0;

  async function handleMarkComplete() {
    if (!playerData || !selectedLesson) {
      return;
    }

    setIsSaving(true);
    setNotice("");

    const response = await markLessonComplete(
      playerData.course.courseId,
      selectedLesson.lessonId,
      sessionToken,
      selectedLesson.durationMinutes * 60,
    );

    setIsSaving(false);

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setPlayerData((current) => {
      if (!current) {
        return current;
      }

      const nextProgress = current.progress.some((item) => item.lessonId === response.data.lessonId)
        ? current.progress.map((item) =>
            item.lessonId === response.data.lessonId ? { ...item, completed: true } : item,
          )
        : [
            ...current.progress,
            {
              progressId: `local-${response.data.lessonId}`,
              userId: "",
              courseId: current.course.courseId,
              lessonId: response.data.lessonId,
              completed: true,
              watchedSeconds: selectedLesson.durationMinutes * 60,
              updatedAt: new Date().toISOString(),
            },
          ];

      return {
        ...current,
        progress: nextProgress,
        enrolment: {
          ...current.enrolment,
          progressPercent: response.data.progressPercent,
          status: response.data.progressPercent >= 100 ? "COMPLETED" : "ACTIVE",
        },
      };
    });

    setNotice("Progress saved.");
  }

  function goToLesson(lesson: PlayerLesson | null) {
    if (lesson) {
      setSelectedLessonId(lesson.lessonId);
      setNotice("");
    }
  }

  if (isLoading) {
    return (
      <main className="bg-white">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-6 py-20">
          <p className="text-sm font-bold text-muted">Loading course player...</p>
        </div>
      </main>
    );
  }

  if (!playerData || !selectedLesson) {
    return (
      <main className="bg-white">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
          <Badge tone="warning">Course unavailable</Badge>
          <h1 className="mt-4 text-4xl font-bold text-ink">Unable to open this course.</h1>
          <p className="mt-4 text-muted">{notice || "Please check your enrollment and try again."}</p>
          <Link to="/dashboard" className="mt-7">
            <Button>Back to dashboard</Button>
          </Link>
        </div>
      </main>
    );
  }

  const SelectedIcon = lessonIcons[selectedLesson.type];
  const isSelectedComplete = completedLessonIds.has(selectedLesson.lessonId);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="sticky top-20 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="min-w-0">
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
                <ArrowLeft size={16} aria-hidden="true" />
                Back to dashboard
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="brand">{playerData.course.category}</Badge>
                <Badge>{playerData.course.level}</Badge>
                <Badge tone={playerData.enrolment.status === "COMPLETED" ? "success" : "neutral"}>
                  {playerData.enrolment.status}
                </Badge>
              </div>
              <h1 className="mt-3 truncate text-2xl font-bold text-ink lg:text-3xl">{playerData.course.title}</h1>
            </div>

            <div className="w-full lg:max-w-sm">
              <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
                <span>Course progress</span>
                <span>{playerData.enrolment.progressPercent || localProgressPercent}%</span>
              </div>
              <ProgressBar value={playerData.enrolment.progressPercent || localProgressPercent} />
              <p className="mt-2 text-xs font-semibold text-muted">
                {completedCount} of {lessonCount} lessons complete
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-48 lg:self-start">
          <Card className="overflow-hidden">
            <div className="border-b border-line p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-normal text-muted">Course outline</p>
                  <h2 className="mt-1 text-lg font-bold text-ink">{lessonCount} lessons</h2>
                </div>
                <Link to={`/learn/${playerData.course.courseId}/quiz`} className="inline-flex">
                  <Button variant="secondary" className="px-3 py-2">
                    <Award size={16} aria-hidden="true" />
                    Quiz
                  </Button>
                </Link>
              </div>
            </div>

            <div className="max-h-[34rem] overflow-auto">
              {playerData.lessons.map((lesson, index) => {
                const Icon = lessonIcons[lesson.type];
                const isSelected = lesson.lessonId === selectedLesson.lessonId;
                const isComplete = completedLessonIds.has(lesson.lessonId);

                return (
                  <button
                    key={lesson.lessonId}
                    className={`flex w-full items-start gap-3 border-b border-line p-4 text-left transition last:border-b-0 ${
                      isSelected ? "bg-brand-50" : "bg-white hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedLessonId(lesson.lessonId)}
                    type="button"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                      isComplete ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-brand-700"
                    }`}>
                      {isComplete ? <CheckCircle2 size={19} aria-hidden="true" /> : <Icon size={19} aria-hidden="true" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">
                        {index + 1}. {lesson.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-muted">
                        {lesson.type} - {lesson.durationMinutes} min
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </aside>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="flex aspect-video items-center justify-center bg-slate-950 text-white">
              {selectedLesson.videoUrl ? (
                <iframe
                  title={selectedLesson.title}
                  src={selectedLesson.videoUrl}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="max-w-lg px-6 text-center">
                  <SelectedIcon className="mx-auto text-brand-100" size={56} aria-hidden="true" />
                  <h2 className="mt-4 text-2xl font-bold">{selectedLesson.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Video or learning content will be connected from Google Drive by the course admin.
                  </p>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{selectedLesson.type}</Badge>
                    {isSelectedComplete ? <Badge tone="success">Completed</Badge> : null}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-ink">{selectedLesson.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {selectedLesson.notes || "Lesson notes and supporting content will appear here when added by the admin."}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => goToLesson(previousLesson)} disabled={!previousLesson}>
                    <ChevronLeft size={16} aria-hidden="true" />
                    Previous
                  </Button>
                  <Button onClick={handleMarkComplete} disabled={isSaving || isSelectedComplete}>
                    {isSelectedComplete ? "Completed" : isSaving ? "Saving..." : "Mark complete"}
                  </Button>
                  <Button variant="secondary" onClick={() => goToLesson(nextLesson)} disabled={!nextLesson}>
                    Next
                    <ChevronRight size={16} aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {notice ? (
                <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm font-semibold text-brand-700">
                  {notice}
                </div>
              ) : null}
            </div>
          </Card>

          <div className="grid gap-5 xl:grid-cols-2">
            <ResourcePanel
              icon={<LinkIcon size={18} aria-hidden="true" />}
              title="Lesson resources"
              emptyText="No lesson-specific resources have been added yet."
              resources={selectedLessonResources}
            />
            <ResourcePanel
              icon={<FileText size={18} aria-hidden="true" />}
              title="Course resources"
              emptyText="No course-level resources have been added yet."
              resources={courseLevelResources}
            />
          </div>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <ShieldCheck size={19} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">Secure progress and resource access</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Lesson completion and course resources are requested with your session token. Apps Script verifies
                  enrollment before saving progress or returning protected resource links.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

function ResourcePanel({
  icon,
  title,
  emptyText,
  resources,
}: {
  icon: JSX.Element;
  title: string;
  emptyText: string;
  resources: AdminResource[];
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-brand-600">{icon}</span>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
      </div>

      {resources.length > 0 ? (
        <div className="grid gap-3">
          {resources.map((resource) => (
            <a
              key={resource.resourceId}
              className="rounded-lg border border-line bg-slate-50 p-4 transition hover:bg-white"
              href={resource.url}
              target="_blank"
              rel="noreferrer"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge tone={resourceTone[resource.type]}>{resource.type}</Badge>
                  <p className="mt-3 text-sm font-bold text-ink">{resource.title}</p>
                </div>
                <ExternalLink className="shrink-0 text-slate-400" size={17} aria-hidden="true" />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-slate-50 p-5 text-center">
          <ListChecks className="mx-auto text-slate-400" size={22} aria-hidden="true" />
          <p className="mt-3 text-sm leading-6 text-muted">{emptyText}</p>
        </div>
      )}
    </Card>
  );
}
