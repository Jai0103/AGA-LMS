import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  RotateCcw,
  ShieldCheck,
  Trophy,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAuth } from "../context/AuthContext";
import { checkCertificateEligibility, issueCertificate } from "../lib/certificateApi";
import { getCourseQuiz, submitCourseQuiz } from "../lib/quizApi";
import type { CertificateEligibilityData } from "../types/certificate";
import type { GetCourseQuizData, QuizAnswer, SubmitCourseQuizData } from "../types/quiz";

export function QuizPage() {
  const { courseId = "" } = useParams();
  const { sessionToken } = useAuth();

  const [quizData, setQuizData] = useState<GetCourseQuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [result, setResult] = useState<SubmitCourseQuizData | null>(null);
  const [eligibility, setEligibility] = useState<CertificateEligibilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
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

  const answeredCount = useMemo(() => {
    return quizData?.questions.filter((question) => Boolean(answers[question.questionId])).length ?? 0;
  }, [answers, quizData]);

  const allAnswered = useMemo(() => {
    if (!quizData) {
      return false;
    }

    return quizData.questions.every((question) => Boolean(answers[question.questionId]));
  }, [answers, quizData]);

  const answerProgress = quizData?.questions.length
    ? Math.round((answeredCount / quizData.questions.length) * 100)
    : 0;

  const activeQuestion = quizData?.questions[activeQuestionIndex] ?? null;
  const canGoPrevious = activeQuestionIndex > 0;
  const canGoNext = Boolean(quizData && activeQuestionIndex < quizData.questions.length - 1);

  async function refreshEligibility() {
    const response = await checkCertificateEligibility(courseId, sessionToken);

    if (response.ok) {
      setEligibility(response.data);
    } else {
      setNotice(response.error.message);
    }
  }

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

    if (response.data.passed) {
      await refreshEligibility();
    }
  }

  async function handleIssueCertificate() {
    setIsIssuing(true);
    setNotice("");

    const response = await issueCertificate(courseId, sessionToken);

    setIsIssuing(false);

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    await refreshEligibility();
    setNotice(response.data.alreadyIssued ? "Certificate already issued." : "Certificate issued successfully.");
  }

  function selectAnswer(questionId: string, optionId: string) {
    if (result) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
    setNotice("");
  }

  function resetAttempt() {
    setAnswers({});
    setResult(null);
    setEligibility(null);
    setNotice("");
    setActiveQuestionIndex(0);
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

  if (!quizData || !activeQuestion) {
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
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Link to={`/learn/${courseId}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to course player
          </Link>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <Badge tone="brand">Course quiz</Badge>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-ink">{quizData.quiz.title}</h1>
              <p className="mt-3 text-muted">
                Answer every question. Apps Script validates the attempt and calculates your score securely.
              </p>
            </div>

            <Card className="p-5">
              <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
                <span>Answered</span>
                <span>
                  {answeredCount} of {quizData.questions.length}
                </span>
              </div>
              <ProgressBar value={answerProgress} />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <QuizMetric label="Passing score" value={`${quizData.quiz.passingScore}%`} />
                <QuizMetric label="Questions" value={String(quizData.questions.length)} />
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <Card className="overflow-hidden">
            <div className="border-b border-line p-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="text-brand-600" size={18} aria-hidden="true" />
                <h2 className="text-sm font-bold uppercase tracking-normal text-muted">Question map</h2>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 p-4 lg:grid-cols-4">
              {quizData.questions.map((question, index) => {
                const isAnswered = Boolean(answers[question.questionId]);
                const isActive = index === activeQuestionIndex;

                return (
                  <button
                    key={question.questionId}
                    type="button"
                    onClick={() => setActiveQuestionIndex(index)}
                    className={[
                      "flex h-10 items-center justify-center rounded-xl border text-sm font-bold transition",
                      isActive
                        ? "border-ink bg-ink text-white"
                        : isAnswered
                          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                          : "border-line bg-white text-slate-600 hover:bg-slate-50",
                    ].join(" ")}
                    aria-label={`Question ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <ShieldCheck size={18} aria-hidden="true" />
              </div>
              <p className="text-sm leading-6 text-muted">
                Correct answers stay on the backend. The browser only sends selected option IDs.
              </p>
            </div>
          </Card>
        </aside>

        <div className="space-y-6">
          {result ? (
            <ResultPanel
              result={result}
              eligibility={eligibility}
              isIssuing={isIssuing}
              onIssueCertificate={handleIssueCertificate}
              onRetake={resetAttempt}
            />
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Card className="overflow-hidden">
              <div className="border-b border-line bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand-700">
                      Question {activeQuestionIndex + 1} of {quizData.questions.length}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight text-ink">{activeQuestion.prompt}</h2>
                  </div>
                  <Badge tone={answers[activeQuestion.questionId] ? "success" : "neutral"}>
                    {answers[activeQuestion.questionId] ? "Answered" : "Unanswered"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 p-5">
                {activeQuestion.options.map((option) => {
                  const isSelected = answers[activeQuestion.questionId] === option.optionId;

                  return (
                    <label
                      key={option.optionId}
                      className={[
                        "flex cursor-pointer gap-3 rounded-xl border p-4 transition",
                        isSelected ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:bg-slate-50",
                        result ? "cursor-default opacity-90" : "",
                      ].join(" ")}
                    >
                      <input
                        checked={isSelected}
                        className="mt-1"
                        disabled={Boolean(result)}
                        name={activeQuestion.questionId}
                        onChange={() => selectAnswer(activeQuestion.questionId, option.optionId)}
                        type="radio"
                        value={option.optionId}
                      />
                      <span className="text-sm font-semibold leading-6 text-slate-700">{option.label}</span>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 border-t border-line bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setActiveQuestionIndex((value) => Math.max(0, value - 1))} disabled={!canGoPrevious}>
                    <ChevronLeft size={16} aria-hidden="true" />
                    Previous
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveQuestionIndex((value) => Math.min(quizData.questions.length - 1, value + 1))} disabled={!canGoNext}>
                    Next
                    <ChevronRight size={16} aria-hidden="true" />
                  </Button>
                </div>

                <Button type="submit" disabled={isSubmitting || Boolean(result) || !allAnswered}>
                  {isSubmitting ? "Submitting..." : result ? "Quiz submitted" : "Submit quiz"}
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </div>
            </Card>

            {notice ? (
              <div className="rounded-lg border border-orange-100 bg-orange-50 p-3 text-sm font-semibold text-orange-700">
                {notice}
              </div>
            ) : null}
          </form>
        </div>
      </section>
    </main>
  );
}

function ResultPanel({
  result,
  eligibility,
  isIssuing,
  onIssueCertificate,
  onRetake,
}: {
  result: SubmitCourseQuizData;
  eligibility: CertificateEligibilityData | null;
  isIssuing: boolean;
  onIssueCertificate: () => void;
  onRetake: () => void;
}) {
  const passed = result.passed;

  return (
    <Card className="overflow-hidden">
      <div className={passed ? "bg-emerald-600 p-6 text-white" : "bg-slate-950 p-6 text-white"}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            {passed ? <Trophy size={25} aria-hidden="true" /> : <XCircle size={25} aria-hidden="true" />}
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-white/75">Attempt result</p>
            <h2 className="mt-2 text-3xl font-bold">{passed ? "Quiz passed" : "Quiz not passed yet"}</h2>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Your score is {result.score}%. Passing score is {result.passingScore}%.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-3">
        <QuizMetric label="Score" value={`${result.score}%`} />
        <QuizMetric label="Passing score" value={`${result.passingScore}%`} />
        <QuizMetric label="Status" value={passed ? "Passed" : "Retake needed"} />
      </div>

      <div className="border-t border-line p-5">
        {passed ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <Award className="mt-0.5 shrink-0 text-emerald-700" size={20} aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  {eligibility?.eligible || eligibility?.alreadyIssued ? "Certificate ready" : "Certificate not ready yet"}
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-700">
                  {eligibility?.reason || "Checking certificate eligibility..."}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  {eligibility?.alreadyIssued ? (
                    <Link to="/certificates">
                      <Button>View certificate</Button>
                    </Link>
                  ) : null}

                  {eligibility?.eligible && !eligibility.alreadyIssued ? (
                    <Button onClick={onIssueCertificate} disabled={isIssuing}>
                      {isIssuing ? "Issuing..." : "Issue certificate"}
                    </Button>
                  ) : null}

                  <Link to="/dashboard">
                    <Button variant="secondary">Back to dashboard</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-ink">Review the lessons and try again.</p>
              <p className="mt-1 text-sm text-muted">Your next attempt will be checked securely by Apps Script.</p>
            </div>
            <Button onClick={onRetake} variant="secondary">
              <RotateCcw size={16} aria-hidden="true" />
              Retake quiz
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function QuizMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-normal text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}
