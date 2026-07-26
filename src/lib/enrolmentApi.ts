import { apiRequest } from "./apiClient";
import type { EnrollInCourseData, ListMyEnrolmentsData } from "../types/enrolment";

export function enrollInCourse(courseId: string, sessionToken: string) {
  return apiRequest<EnrollInCourseData, { courseId: string }>(
    "enrollInCourse",
    { courseId },
    sessionToken,
  );
}

export function listMyEnrolments(sessionToken: string) {
  return apiRequest<ListMyEnrolmentsData>("listMyEnrolments", {}, sessionToken);
}
