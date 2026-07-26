import { apiRequest } from "./apiClient";
import type { HealthCheckData } from "../types/api";
import type { Course } from "../types/course";

export type PublicCourseFromApi = Omit<Course, "outcomes" | "audience" | "accent" | "lessons" | "resources">;

export type ListPublicCoursesData = {
  courses: PublicCourseFromApi[];
};

export type GetPublicCourseData = {
  course: PublicCourseFromApi;
  lessons: Course["lessons"];
};

export function healthCheck() {
  return apiRequest<HealthCheckData>("healthCheck", {});
}

export function listPublicCourses() {
  return apiRequest<ListPublicCoursesData>("listPublicCourses", {});
}

export function getPublicCourse(slug: string) {
  return apiRequest<GetPublicCourseData, { slug: string }>("getPublicCourse", { slug });
}
