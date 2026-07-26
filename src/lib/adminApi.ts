import { apiRequest } from "./apiClient";
import type {
  AdminAssignableRole,
  AdminCoursesData,
  AdminDetailedReportsData,
  AdminEnrolmentsData,
  AdminReportsData,
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
