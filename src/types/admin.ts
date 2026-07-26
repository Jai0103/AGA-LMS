import type { AuthUser } from "./auth";
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

export type AdminReportsData = {
  metrics: AdminMetrics;
  recentUsers: AuthUser[];
  recentEnrolments: Enrolment[];
  recentQuizAttempts: AdminQuizAttempt[];
  recentCertificates: Certificate[];
};

export type AdminUsersData = {
  users: AuthUser[];
};

export type AdminCoursesData = {
  courses: PublicCourseFromApi[];
};
