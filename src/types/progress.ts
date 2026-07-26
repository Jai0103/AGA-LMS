import type { Enrolment } from "./enrolment";
import type { PublicCourseFromApi } from "../lib/courseApi";
import type { CourseLesson } from "./course";

export type LessonProgress = {
  progressId: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  updatedAt: string;
};

export type PlayerLesson = CourseLesson & {
  courseId: string;
  videoUrl: string;
  notes: string;
  sortOrder: number;
};

export type CoursePlayerData = {
  course: PublicCourseFromApi;
  lessons: PlayerLesson[];
  progress: LessonProgress[];
  enrolment: Enrolment;
};

export type MarkLessonCompleteData = {
  progressPercent: number;
  lessonId: string;
  completed: boolean;
};
