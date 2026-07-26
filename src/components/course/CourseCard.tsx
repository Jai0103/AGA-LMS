import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { FeaturedCourse } from "../../types/course";

type CourseCardProps = {
  course: FeaturedCourse;
};

const accentClasses = {
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-orange-50 text-orange-700 border-orange-100",
  neutral: "bg-slate-50 text-slate-700 border-line",
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${accentClasses[course.accent]}`}>
          {course.category}
        </span>
        <Badge>{course.level}</Badge>
      </div>

      <h3 className="text-xl font-bold text-ink">{course.title}</h3>
      <p className="mt-3 min-h-20 flex-1 text-sm leading-6 text-muted">{course.description}</p>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm font-semibold text-slate-600">
        <span>{course.lessonsCount} lessons</span>
        <span>{course.duration}</span>
      </div>

      <Link
        to={`/courses/${course.slug}`}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        View course
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </Card>
  );
}
