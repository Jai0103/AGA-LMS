import { BookOpen, FileText, HelpCircle, PlayCircle } from "lucide-react";
import type { CourseLesson } from "../../types/course";
import { Badge } from "../ui/Badge";

type CourseSyllabusProps = {
  lessons: CourseLesson[];
};

const lessonIcons = {
  Video: PlayCircle,
  Reading: FileText,
  Quiz: HelpCircle,
  Resource: BookOpen,
};

export function CourseSyllabus({ lessons }: CourseSyllabusProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      {lessons.map((lesson, index) => {
        const Icon = lessonIcons[lesson.type];

        return (
          <div key={lesson.lessonId} className="flex flex-col gap-4 border-b border-line p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">
                  {index + 1}. {lesson.title}
                </p>
                <p className="mt-1 text-xs font-semibold text-muted">
                  {lesson.type} - {lesson.durationMinutes} min
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {lesson.isPreview ? <Badge tone="success">Preview</Badge> : <Badge>Locked</Badge>}
              <Badge tone={lesson.type === "Quiz" ? "warning" : "neutral"}>{lesson.type}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
