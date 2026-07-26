import type { PublicCourseFromApi } from "../lib/courseApi";

export type Enrolment = {
  enrolmentId: string;
  userId: string;
  courseId: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  progressPercent: number;
  enrolledAt: string;
  completedAt: string;
};

export type EnrolmentWithCourse = {
  enrolment: Enrolment;
  course: PublicCourseFromApi;
};

export type EnrollInCourseData = {
  enrolment: Enrolment;
  alreadyEnrolled: boolean;
};

export type ListMyEnrolmentsData = {
  enrolments: EnrolmentWithCourse[];
};
