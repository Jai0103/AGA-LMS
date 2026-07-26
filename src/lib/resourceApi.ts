import { apiRequest } from "./apiClient";
import type { AdminResource } from "../types/admin";

export type CourseResourcesData = {
  resources: AdminResource[];
};

export function listCourseResources(courseId: string, sessionToken: string) {
  return apiRequest<CourseResourcesData, { courseId: string }>(
    "listCourseResources",
    { courseId },
    sessionToken,
  );
}
