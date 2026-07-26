export type Quiz = {
  quizId: string;
  courseId: string;
  title: string;
  passingScore: number;
  status: string;
};

export type QuizOption = {
  optionId: string;
  label: string;
};

export type QuizQuestion = {
  questionId: string;
  quizId: string;
  prompt: string;
  type: "single-choice";
  options: QuizOption[];
  points: number;
  sortOrder: number;
};

export type GetCourseQuizData = {
  quiz: Quiz;
  questions: QuizQuestion[];
};

export type QuizAnswer = {
  questionId: string;
  selectedOptionId: string;
};

export type SubmitCourseQuizData = {
  attemptId: string;
  score: number;
  passed: boolean;
  passingScore: number;
};
