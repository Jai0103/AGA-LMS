import { apiRequest } from "./apiClient";
import type { CoursePlayerData, MarkLessonCompleteData } from "../types/progress";

export function getCoursePlayer(courseId: string, sessionToken: string) {
  return apiRequest<CoursePlayerData, { courseId: string }>(
    "getCoursePlayer",
    { courseId },
    sessionToken,
  );
}

export function markLessonComplete(courseId: string, lessonId: string, sessionToken: string, watchedSeconds = 0) {
  return apiRequest<MarkLessonCompleteData, { courseId: string; lessonId: string; watchedSeconds: number }>(
    "markLessonComplete",
    { courseId, lessonId, watchedSeconds },
    sessionToken,
  );
}
