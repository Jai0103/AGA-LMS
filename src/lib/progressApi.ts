import { apiRequest } from "./apiClient";
import type { CoursePlayerData } from "../types/progress";

export type MarkLessonCompleteData = {
  lessonId: string;
  progressPercent: number;
};

export function getCoursePlayer(courseId: string, sessionToken: string) {
  return apiRequest<CoursePlayerData, { courseId: string }>(
    "getCoursePlayer",
    { courseId },
    sessionToken,
  );
}

export function markLessonComplete(
  courseId: string,
  lessonId: string,
  sessionToken: string,
  watchedSeconds: number,
) {
  return apiRequest<
    MarkLessonCompleteData,
    { courseId: string; lessonId: string; watchedSeconds: number }
  >(
    "markLessonComplete",
    { courseId, lessonId, watchedSeconds },
    sessionToken,
  );
}
