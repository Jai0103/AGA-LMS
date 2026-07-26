import { apiRequest } from "./apiClient";
import type {
  AdminAssignableRole,
  AdminCourseStatus,
  AdminCoursesData,
  AdminCreateCourseData,
  AdminCreateCoursePayload,
  AdminCreateLessonData,
  AdminCreateLessonPayload,
  AdminCreateResourceData,
  AdminCreateResourcePayload,
  AdminDetailedReportsData,
  AdminEnrolmentsData,
  AdminLessonsData,
  AdminReportsData,
  AdminResourcesData,
  AdminUpdateCourseStatusData,
  AdminUpdateUserRoleData,
  AdminUpdateUserStatusData,
  AdminUsersData,
  AdminUserStatus,
} from "../types/admin";

export function adminReports(sessionToken: string) {
  return apiRequest<AdminReportsData>("adminReports", {}, sessionToken);
}

export function adminDetailedReports(sessionToken: string) {
  return apiRequest<AdminDetailedReportsData>("adminDetailedReports", {}, sessionToken);
}

export function adminListUsers(sessionToken: string) {
  return apiRequest<AdminUsersData>("adminListUsers", {}, sessionToken);
}

export function adminListCourses(sessionToken: string) {
  return apiRequest<AdminCoursesData>("adminListCourses", {}, sessionToken);
}

export function adminListEnrolments(sessionToken: string) {
  return apiRequest<AdminEnrolmentsData>("adminListEnrolments", {}, sessionToken);
}

export function adminUpdateUserRole(userId: string, role: AdminAssignableRole, sessionToken: string) {
  return apiRequest<AdminUpdateUserRoleData, { userId: string; role: AdminAssignableRole }>(
    "adminUpdateUserRole",
    { userId, role },
    sessionToken,
  );
}

export function adminUpdateUserStatus(userId: string, status: AdminUserStatus, sessionToken: string) {
  return apiRequest<AdminUpdateUserStatusData, { userId: string; status: AdminUserStatus }>(
    "adminUpdateUserStatus",
    { userId, status },
    sessionToken,
  );
}

export function adminUpdateCourseStatus(courseId: string, status: AdminCourseStatus, sessionToken: string) {
  return apiRequest<AdminUpdateCourseStatusData, { courseId: string; status: AdminCourseStatus }>(
    "adminUpdateCourseStatus",
    { courseId, status },
    sessionToken,
  );
}

export function adminCreateCourse(payload: AdminCreateCoursePayload, sessionToken: string) {
  return apiRequest<AdminCreateCourseData, AdminCreateCoursePayload>(
    "adminCreateCourse",
    payload,
    sessionToken,
  );
}

export function adminListLessons(courseId: string, sessionToken: string) {
  return apiRequest<AdminLessonsData, { courseId: string }>(
    "adminListLessons",
    { courseId },
    sessionToken,
  );
}

export function adminCreateLesson(payload: AdminCreateLessonPayload, sessionToken: string) {
  return apiRequest<AdminCreateLessonData, AdminCreateLessonPayload>(
    "adminCreateLesson",
    payload,
    sessionToken,
  );
}

export function adminListResources(courseId: string, sessionToken: string) {
  return apiRequest<AdminResourcesData, { courseId: string }>(
    "adminListResources",
    { courseId },
    sessionToken,
  );
}

export function adminCreateResource(payload: AdminCreateResourcePayload, sessionToken: string) {
  return apiRequest<AdminCreateResourceData, AdminCreateResourcePayload>(
    "adminCreateResource",
    payload,
    sessionToken,
  );
}
