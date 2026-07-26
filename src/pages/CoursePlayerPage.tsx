import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  LockKeyhole,
  PlayCircle,
  RefreshCcw,
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
  Resource: BookOpen,
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
    void loadPlayer();
  }, [courseId, sessionToken]);

  async function loadPlayer() {
    setIsLoading(true);
    setNotice("");

    try {
      const [playerResponse, resourcesResponse] = await Promise.all([
        getCoursePlayer(courseId, sessionToken),
        listCourseResources(courseId, sessionToken),
      ]);

      if (playerResponse.ok) {
        setPlayerData(playerResponse.data);
        setSelectedLessonId((current) => current || playerResponse.data.lessons[0]?.lessonId || "");
      } else {
        setNotice(playerResponse.error.message);
      }

      if (resourcesResponse.ok) {
        setResources(resourcesResponse.data.resources);
      }
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Course player could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  const completedLessonIds = useMemo(() => {
    return new Set(playerData?.progress.filter((item) => item.completed).map((item) => item.lessonId) ?? []);
  }, [playerData]);

  const selectedLesson = useMemo<PlayerLesson | null>(() => {
    return playerData?.lessons.find((lesson) => lesson.lessonId === selectedLessonId) ?? null;
  }, [playerData, selectedLessonId]);

  const selectedLessonIndex = useMemo(() => {
    if (!playerData || !selectedLesson) {
      return -1;
    }

    return playerData.lessons.findIndex((lesson) => lesson.lessonId === selectedLesson.lessonId);
  }, [playerData, selectedLesson]);

  const nextLesson = playerData && selectedLessonIndex >= 0 ? playerData.lessons[selectedLessonIndex + 1] ?? null : null;
  const completedCount = completedLessonIds.size;
  const totalLessons = playerData?.lessons.length ?? 0;
  const selectedLessonResources = useMemo(() => {
    return resources.filter((resource) => resource.lessonId === selectedLessonId);
  }, [resources, selectedLessonId]);

  const courseLevelResources = useMemo(() => {
    return resources.filter((resource) => !resource.lessonId);
  }, [resources]);

  async function handleMarkComplete() {
    if (!playerData || !selectedLesson) {
      return;
    }

    setIsSaving(true);
    setNotice("");

    try {
      const response = await markLessonComplete(
        playerData.course.courseId,
        selectedLesson.lessonId,
        sessionToken,
        selectedLesson.durationMinutes * 60,
      );

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
              item.lessonId === response.data.lessonId
                ? {
                    ...item,
                    completed: true,
                    watchedSeconds: selectedLesson.durationMinutes * 60,
                    updatedAt: new Date().toISOString(),
                  }
                : item,
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
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Progress could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="h-5 w-40 rounded-full bg-slate-100" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
            <div className="h-[36rem] animate-pulse rounded-[1.5rem] bg-slate-100" />
            <div className="h-[36rem] animate-pulse rounded-[1.5rem] bg-slate-100" />
          </div>
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
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/dashboard">
              <Button>Back to dashboard</Button>
            </Link>
            <Button variant="secondary" onClick={() => void loadPlayer()}>
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const SelectedIcon = lessonIcons[selectedLesson.type];
  const isSelectedComplete = completedLessonIds.has(selectedLesson.lessonId);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to dashboard
          </Link>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{playerData.course.category}</Badge>
                <Badge>{playerData.course.level}</Badge>
                <Badge tone={playerData.enrolment.status === "COMPLETED" ? "success" : "neutral"}>
                  {playerData.enrolment.status}
                </Badge>
              </div>
              <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-ink md:text-4xl">
                {playerData.course.title}
              </h1>
              <p className="mt-2 max-w-3xl text-muted">{playerData.course.subtitle}</p>
            </div>

            <Card className="p-4">
              <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
                <span>Course progress</span>
                <span>{playerData.enrolment.progressPercent}%</span>
              </div>
              <ProgressBar value={playerData.enrolment.progressPercent} />
              <p className="mt-3 text-xs font-semibold text-muted">
                {completedCount} of {totalLessons} lessons completed
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-muted">Lessons</h2>
                <p className="mt-1 text-sm font-semibold text-ink">{completedCount} completed</p>
              </div>
              <Link to={`/learn/${playerData.course.courseId}/quiz`}>
                <Button variant="secondary" className="px-3">
                  <Award size={16} aria-hidden="true" />
                  Quiz
                </Button>
              </Link>
            </div>
          </Card>

          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            {playerData.lessons.map((lesson, index) => {
              const Icon = lessonIcons[lesson.type];
              const isSelected = lesson.lessonId === selectedLesson.lessonId;
              const isComplete = completedLessonIds.has(lesson.lessonId);

              return (
                <button
                  key={lesson.lessonId}
                  className={`flex w-full items-start gap-3 border-b border-line p-4 text-left transition last:border-b-0 ${
                    isSelected ? "bg-brand-50" : "hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedLessonId(lesson.lessonId)}
                  type="button"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-line">
                    {isComplete ? <CheckCircle2 size={18} aria-hidden="true" /> : <Icon size={18} aria-hidden="true" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">
                      {index + 1}. {lesson.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted">
                      {lesson.type} - {lesson.durationMinutes} min
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lesson.isPreview ? <Badge tone="success">Preview</Badge> : null}
                      {isComplete ? <Badge tone="success">Done</Badge> : <Badge>Pending</Badge>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-5">
          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="flex aspect-video items-center justify-center bg-slate-950 px-6 text-white">
              <div className="max-w-2xl text-center">
                <SelectedIcon className="mx-auto text-brand-100" size={54} aria-hidden="true" />
                <h2 className="mt-4 text-2xl font-bold md:text-3xl">{selectedLesson.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {selectedLesson.videoUrl
                    ? "Video source is ready for this lesson."
                    : "Media can be connected by the admin through the lesson setup workflow."}
                </p>
              </div>
            </div>

            <div className="p-5">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{selectedLesson.type}</Badge>
                    <Badge tone={isSelectedComplete ? "success" : "neutral"}>
                      {isSelectedComplete ? "Completed" : "In progress"}
                    </Badge>
                    <Badge tone="brand">{selectedLesson.durationMinutes} min</Badge>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
                    {selectedLesson.notes || "Lesson notes and resources are managed from the secured admin backend."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                  <Button onClick={handleMarkComplete} disabled={isSaving || isSelectedComplete}>
                    {isSelectedComplete ? "Completed" : isSaving ? "Saving..." : "Mark complete"}
                    <CheckCircle2 size={17} aria-hidden="true" />
                  </Button>
                  {nextLesson ? (
                    <Button variant="secondary" onClick={() => setSelectedLessonId(nextLesson.lessonId)}>
                      Next lesson
                      <ArrowRight size={17} aria-hidden="true" />
                    </Button>
                  ) : (
                    <Link to={`/learn/${playerData.course.courseId}/quiz`}>
                      <Button variant="secondary" className="w-full">
                        Go to quiz
                        <Award size={17} aria-hidden="true" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {notice ? (
                <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-3 text-sm font-semibold text-brand-700">
                  {notice}
                </div>
              ) : null}
            </div>
          </Card>

          <div className="grid gap-5 xl:grid-cols-2">
            <ResourcePanel
              icon={<LinkIcon className="h-5 w-5" />}
              title="Lesson resources"
              emptyText="No lesson-specific resources have been added yet."
              resources={selectedLessonResources}
            />
            <ResourcePanel
              icon={<FileText className="h-5 w-5" />}
              title="Course resources"
              emptyText="No course-level resources have been added yet."
              resources={courseLevelResources}
            />
          </div>

          <Card className="rounded-[1.5rem] p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">Secure progress and resource access</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Lesson completion and course resources are requested with your session token. Apps Script verifies
                  enrolment before returning protected data or saving progress.
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
  icon: ReactNode;
  title: string;
  emptyText: string;
  resources: AdminResource[];
}) {
  return (
    <Card className="rounded-[1.5rem] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-brand-600">{icon}</span>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
      </div>

      {resources.length > 0 ? (
        <div className="grid gap-3">
          {resources.map((resource) => (
            <a
              key={resource.resourceId}
              className="rounded-2xl border border-line bg-slate-50 p-4 transition hover:bg-white"
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
        <p className="text-sm leading-6 text-muted">{emptyText}</p>
      )}
    </Card>
  );
}
