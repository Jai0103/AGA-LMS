import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Award, CheckCircle2, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { getCourseQuiz, submitCourseQuiz } from "../lib/quizApi";
import type { GetCourseQuizData, QuizAnswer, SubmitCourseQuizData } from "../types/quiz";

export function QuizPage() {
  const { courseId = "" } = useParams();
  const { sessionToken } = useAuth();

  const [quizData, setQuizData] = useState<GetCourseQuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitCourseQuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    getCourseQuiz(courseId, sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setQuizData(response.data);
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [courseId, sessionToken]);

  const allAnswered = useMemo(() => {
    if (!quizData) {
      return false;
    }

    return quizData.questions.every((question) => Boolean(answers[question.questionId]));
  }, [answers, quizData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!quizData || !allAnswered) {
      setNotice("Please answer every question before submitting.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");

    const submittedAnswers: QuizAnswer[] = quizData.questions.map((question) => ({
      questionId: question.questionId,
      selectedOptionId: answers[question.questionId],
    }));

    const response = await submitCourseQuiz(courseId, submittedAnswers, sessionToken);

    setIsSubmitting(false);

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setResult(response.data);
  }

  if (isLoading) {
    return (
      <main className="bg-white">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-6 py-20">
          <p className="text-sm font-bold text-muted">Loading quiz...</p>
        </div>
      </main>
    );
  }

  if (!quizData) {
    return (
      <main className="bg-white">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
          <Badge tone="warning">Quiz unavailable</Badge>
          <h1 className="mt-4 text-4xl font-bold text-ink">Unable to open this quiz.</h1>
          <p className="mt-4 text-muted">{notice || "Please check your enrollment and try again."}</p>
          <Link to={`/learn/${courseId}`} className="mt-7">
            <Button>Back to course player</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <Link to={`/learn/${courseId}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to course player
          </Link>

          <div className="mt-6">
            <Badge tone="brand">Course quiz</Badge>
            <h1 className="mt-4 text-4xl font-bold text-ink">{quizData.quiz.title}</h1>
            <p className="mt-3 text-muted">Passing score: {quizData.quiz.passingScore}%</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-8">
        {result ? (
          <Card className="mb-6 p-6">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                result.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}>
                {result.passed ? <CheckCircle2 size={24} aria-hidden="true" /> : <XCircle size={24} aria-hidden="true" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-ink">
                  {result.passed ? "Quiz passed" : "Quiz not passed yet"}
                </h2>
                <p className="mt-2 text-muted">
                  Your score is {result.score}%. Passing score is {result.passingScore}%.
                </p>
                {result.passed ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                    <Award size={17} aria-hidden="true" />
                    Certificate eligibility will be added in the next step.
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {quizData.questions.map((question, index) => (
            <Card key={question.questionId} className="p-5">
              <p className="text-sm font-bold text-brand-700">Question {index + 1}</p>
              <h2 className="mt-2 text-xl font-bold text-ink">{question.prompt}</h2>

              <div className="mt-5 space-y-3">
                {question.options.map((option) => (
                  <label
                    key={option.optionId}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                      answers[question.questionId] === option.optionId
                        ? "border-brand-600 bg-brand-50"
                        : "border-line bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      checked={answers[question.questionId] === option.optionId}
                      className="mt-1"
                      name={question.questionId}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.questionId]: option.optionId,
                        }))
                      }
                      type="radio"
                      value={option.optionId}
                    />
                    <span className="text-sm font-semibold leading-6 text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </Card>
          ))}

          {notice ? (
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-3 text-sm font-semibold text-orange-700">
              {notice}
            </div>
          ) : null}

          <Button type="submit" disabled={isSubmitting || Boolean(result)} className="w-full">
            {isSubmitting ? "Submitting..." : result ? "Quiz submitted" : "Submit quiz"}
          </Button>
        </form>
      </section>
    </main>
  );
}
