import { apiRequest } from "./apiClient";
import type { GetCourseQuizData, QuizAnswer, SubmitCourseQuizData } from "../types/quiz";

export function getCourseQuiz(courseId: string, sessionToken: string) {
  return apiRequest<GetCourseQuizData, { courseId: string }>(
    "getCourseQuiz",
    { courseId },
    sessionToken,
  );
}

export function submitCourseQuiz(courseId: string, answers: QuizAnswer[], sessionToken: string) {
  return apiRequest<SubmitCourseQuizData, { courseId: string; answers: QuizAnswer[] }>(
    "submitCourseQuiz",
    { courseId, answers },
    sessionToken,
  );
}
