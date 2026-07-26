import type { ReactNode } from "react";
import { ArrowRight, BookOpenCheck, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { FeaturedCourse } from "../../types/course";

type CourseCardProps = {
  course: FeaturedCourse;
};

const accentClasses = {
  brand: "border-brand-100 bg-brand-50 text-brand-700",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  warning: "border-orange-100 bg-orange-50 text-orange-700",
  neutral: "border-line bg-slate-50 text-slate-700",
};

const accentBars = {
  brand: "bg-brand-600",
  success: "bg-emerald-500",
  warning: "bg-orange-500",
  neutral: "bg-slate-500",
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="group flex h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className={`w-1.5 shrink-0 ${accentBars[course.accent]}`} />

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${accentClasses[course.accent]}`}>
            {course.category}
          </span>
          <Badge>{course.level}</Badge>
        </div>

        <h3 className="text-xl font-bold leading-tight text-ink">{course.title}</h3>
        <p className="mt-3 min-h-20 flex-1 text-sm leading-6 text-muted">{course.description}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
          <CourseFact icon={<BookOpenCheck className="h-4 w-4" />} value={`${course.lessonsCount} lessons`} />
          <CourseFact icon={<Clock3 className="h-4 w-4" />} value={course.duration} />
        </div>

        <Link
          to={`/courses/${course.slug}`}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          View course
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}

function CourseFact({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
      <span className="text-brand-700">{icon}</span>
      <span>{value}</span>
    </div>
  );
}
