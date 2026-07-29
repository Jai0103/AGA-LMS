import type { Certificate } from "./certificate";
import type { Enrolment } from "./enrolment";
import type { PublicCourseFromApi } from "../lib/courseApi";

export type TranscriptQuizAttempt = {
  attemptId: string;
  quizId: string;
  userId: string;
  courseId: string;
  score: number;
  passed: boolean;
  createdAt: string;
};

export type TranscriptRecord = {
  enrolment: Enrolment;
  course: PublicCourseFromApi;
  bestQuizAttempt: TranscriptQuizAttempt | null;
  latestQuizAttempt: TranscriptQuizAttempt | null;
  certificate: Certificate | null;
};

export type MyTranscriptData = {
  records: TranscriptRecord[];
  summary: {
    enrolledCourses: number;
    completedCourses: number;
    averageProgress: number;
    passedQuizzes: number;
    certificatesIssued: number;
  };
};
