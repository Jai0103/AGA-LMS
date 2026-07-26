import type { AuthUser, UserRole } from "./auth";
import type { Certificate } from "./certificate";
import type { Enrolment } from "./enrolment";
import type { PublicCourseFromApi } from "../lib/courseApi";

export type AdminMetrics = {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrolments: number;
  completedEnrolments: number;
  quizAttempts: number;
  passedAttempts: number;
  certificatesIssued: number;
};

export type AdminQuizAttempt = {
  attemptId: string;
  quizId: string;
  userId: string;
  courseId: string;
  score: number;
  passed: boolean;
  createdAt: string;
};

export type AdminAuditLog = {
  auditLogId: string;
  action: string;
  actorUserId: string;
  status: string;
  detailsJson: string;
  createdAt: string;
};

export type AdminReportsData = {
  metrics: AdminMetrics;
  recentUsers: AuthUser[];
  recentEnrolments: Enrolment[];
  recentQuizAttempts: AdminQuizAttempt[];
  recentCertificates: Certificate[];
};

export type AdminDetailedReportsData = {
  roleCounts: Record<string, number>;
  courseCategoryCounts: Record<string, number>;
  enrolmentStatusCounts: Record<string, number>;
  averageProgress: number;
  averageQuizScore: number;
  certificatesIssued: number;
  recentAuditLogs: AdminAuditLog[];
};

export type AdminUsersData = {
  users: AuthUser[];
};

export type AdminCoursesData = {
  courses: PublicCourseFromApi[];
};

export type AdminEnrolmentsData = {
  enrolments: Enrolment[];
};

export type AdminUpdateUserRoleData = {
  user: AuthUser;
};

export type AdminUpdateUserStatusData = {
  user: AuthUser;
};

export type AdminUpdateCourseStatusData = {
  course: PublicCourseFromApi;
};

export type AdminUserStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

export type AdminAssignableRole = Exclude<UserRole, "VISITOR">;

export type AdminCourseStatus = "Published" | "Draft";

export type AdminCreateCoursePayload = {
  title: string;
  subtitle: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  trainerName: string;
  duration: string;
  durationMinutes: number;
  lessonsCount: number;
  status: AdminCourseStatus;
};

export type AdminCreateCourseData = {
  course: PublicCourseFromApi;
};




import type { PlayerLesson } from "./progress";

export type AdminLessonsData = {
  course: PublicCourseFromApi;
  lessons: PlayerLesson[];
};

export type AdminCreateLessonPayload = {
  courseId: string;
  title: string;
  type: "Video" | "Reading" | "Quiz" | "Resource";
  durationMinutes: number;
  isPreview: boolean;
  sortOrder: number;
  videoUrl: string;
  notes: string;
};

export type AdminCreateLessonData = {
  lesson: PlayerLesson;
  lessonsCount: number;
};
