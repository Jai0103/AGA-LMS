export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type FeaturedCourse = {
  courseId: string;
  title: string;
  category: string;
  level: CourseLevel;
  lessons: number;
  duration: string;
  description: string;
};
