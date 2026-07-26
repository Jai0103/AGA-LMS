import { apiRequest } from "./apiClient";
import type { AdminCoursesData, AdminReportsData, AdminUsersData } from "../types/admin";

export function adminReports(sessionToken: string) {
  return apiRequest<AdminReportsData>("adminReports", {}, sessionToken);
}

export function adminListUsers(sessionToken: string) {
  return apiRequest<AdminUsersData>("adminListUsers", {}, sessionToken);
}

export function adminListCourses(sessionToken: string) {
  return apiRequest<AdminCoursesData>("adminListCourses", {}, sessionToken);
}
