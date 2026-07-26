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
    <div className="divide-y divide-line rounded-lg border border-line bg-white">
      {lessons.map((lesson, index) => {
        const Icon = lessonIcons[lesson.type];

        return (
          <div key={lesson.lessonId} className="flex items-center justify-between gap-4 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-brand-700">
                <Icon size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">
                  {index + 1}. {lesson.title}
                </p>
                <p className="mt-1 text-xs font-medium text-muted">
                  {lesson.type} · {lesson.durationMinutes} min
                </p>
              </div>
            </div>
            {lesson.isPreview ? <Badge tone="success">Preview</Badge> : null}
          </div>
        );
      })}
    </div>
  );
}
