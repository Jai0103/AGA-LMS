import { Clock, Layers, Star, Users } from "lucide-react";

type CourseMetaProps = {
  duration: string;
  lessonsCount: number;
  rating: number;
  enrolledCount: number;
};

export function CourseMeta({ duration, lessonsCount, rating, enrolledCount }: CourseMetaProps) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
      <span className="inline-flex items-center gap-2">
        <Clock size={16} aria-hidden="true" />
        {duration}
      </span>
      <span className="inline-flex items-center gap-2">
        <Layers size={16} aria-hidden="true" />
        {lessonsCount} lessons
      </span>
      <span className="inline-flex items-center gap-2">
        <Star size={16} aria-hidden="true" />
        {rating.toFixed(1)}
      </span>
      <span className="inline-flex items-center gap-2">
        <Users size={16} aria-hidden="true" />
        {enrolledCount.toLocaleString()} learners
      </span>
    </div>
  );
}
