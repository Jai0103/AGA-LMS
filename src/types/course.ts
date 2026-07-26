export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type LessonType = "Video" | "Reading" | "Quiz" | "Resource";

export type CourseLesson = {
  lessonId: string;
  title: string;
  type: LessonType;
  durationMinutes: number;
  isPreview: boolean;
};

export type CourseResource = {
  resourceId: string;
  title: string;
  type: "PDF" | "Template" | "Link" | "Checklist";
};

export type Course = {
  courseId: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  level: CourseLevel;
  description: string;
  outcomes: string[];
  audience: string[];
  trainerName: string;
  duration: string;
  durationMinutes: number;
  lessonsCount: number;
  rating: number;
  enrolledCount: number;
  featured: boolean;
  status: "Published" | "Draft";
  accent: "brand" | "success" | "warning" | "neutral";
  lessons: CourseLesson[];
  resources: CourseResource[];
};

export type FeaturedCourse = Pick<
  Course,
  | "courseId"
  | "slug"
  | "title"
  | "category"
  | "level"
  | "lessonsCount"
  | "duration"
  | "description"
  | "accent"
>;
