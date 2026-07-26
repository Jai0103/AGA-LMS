import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ExternalLink,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  LockKeyhole,
  PlayCircle,
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

  const selectedLesson = useMemo<PlayerLesson | null>(() => {
    return playerData?.lessons.find((lesson) => lesson.lessonId === selectedLessonId) ?? null;
  }, [playerData, selectedLessonId]);

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

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to dashboard
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <Badge tone="brand">{playerData.course.category}</Badge>
              <h1 className="mt-3 text-3xl font-bold text-ink">{playerData.course.title}</h1>
              <p className="mt-2 text-muted">{playerData.course.subtitle}</p>
            </div>
            <div className="w-full max-w-sm">
              <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
                <span>Course progress</span>
                <span>{playerData.enrolment.progressPercent}%</span>
              </div>
              <ProgressBar value={playerData.enrolment.progressPercent} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-normal text-muted">Lessons</h2>
            <Link to={`/learn/${playerData.course.courseId}/quiz`} className="inline-flex">
              <Button variant="secondary" className="px-3 py-2">
                <Award size={16} aria-hidden="true" />
                Quiz
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-line rounded-lg border border-line bg-white">
            {playerData.lessons.map((lesson, index) => {
              const Icon = lessonIcons[lesson.type];
              const isSelected = lesson.lessonId === selectedLesson.lessonId;
              const isComplete = completedLessonIds.has(lesson.lessonId);

              return (
                <button
                  key={lesson.lessonId}
                  className={`flex w-full items-center gap-3 p-4 text-left transition ${
                    isSelected ? "bg-brand-50" : "hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedLessonId(lesson.lessonId)}
                  type="button"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-line">
                    {isComplete ? <CheckCircle2 size={18} aria-hidden="true" /> : <Icon size={18} aria-hidden="true" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">
                      {index + 1}. {lesson.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {lesson.type} · {lesson.durationMinutes} min
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="flex aspect-video items-center justify-center bg-slate-950 text-white">
              <div className="text-center">
                <SelectedIcon className="mx-auto text-brand-100" size={48} aria-hidden="true" />
                <h2 className="mt-4 text-2xl font-bold">{selectedLesson.title}</h2>
                <p className="mt-2 text-sm text-slate-300">
                  {selectedLesson.videoUrl ? "Video source ready" : "Video file will be connected from Google Drive later"}
                </p>
              </div>
            </div>

            <div className="p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <Badge>{selectedLesson.type}</Badge>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {selectedLesson.notes || "Lesson notes and resources will be managed from the backend."}
                  </p>
                </div>

                <Button onClick={handleMarkComplete} disabled={isSaving || completedLessonIds.has(selectedLesson.lessonId)}>
                  {completedLessonIds.has(selectedLesson.lessonId)
                    ? "Completed"
                    : isSaving
                      ? "Saving..."
                      : "Mark complete"}
                </Button>
              </div>

              {notice ? (
                <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm font-semibold text-brand-700">
                  {notice}
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <LinkIcon className="text-brand-600" size={18} aria-hidden="true" />
              <h2 className="text-lg font-bold text-ink">Lesson resources</h2>
            </div>

            {selectedLessonResources.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedLessonResources.map((resource) => (
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
              <p className="text-sm leading-6 text-muted">No lesson-specific resources have been added yet.</p>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="text-brand-600" size={18} aria-hidden="true" />
              <h2 className="text-lg font-bold text-ink">Course resources</h2>
            </div>

            {courseLevelResources.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {courseLevelResources.map((resource) => (
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
              <p className="text-sm leading-6 text-muted">No course-level resources have been added yet.</p>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <LockKeyhole className="text-brand-600" size={18} aria-hidden="true" />
              <h2 className="text-lg font-bold text-ink">Secure progress and resource access</h2>
            </div>
            <p className="text-sm leading-6 text-muted">
              Lesson completion and course resources are requested with your session token. The backend verifies
              enrollment before returning resource links.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
