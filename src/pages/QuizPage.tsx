import { type FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
  Target,
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
  const [result, setResult] = useState<SubmitCourseQuizData | null>(null);
  const [eligibility, setEligibility] = useState<CertificateEligibilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void loadQuiz();
  }, [courseId, sessionToken]);

  async function loadQuiz() {
    setIsLoading(true);
    setNotice("");

    try {
      const response = await getCourseQuiz(courseId, sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      setQuizData({
        ...response.data,
        questions: [...response.data.questions].sort((first, second) => first.sortOrder - second.sortOrder),
      });
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Quiz could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  const answeredCount = useMemo(() => {
    if (!quizData) {
      return 0;
    }

    return quizData.questions.filter((question) => Boolean(answers[question.questionId])).length;
  }, [answers, quizData]);

  const totalQuestions = quizData?.questions.length ?? 0;
  const answerProgress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const totalPoints = quizData?.questions.reduce((sum, question) => sum + safeNumber(question.points), 0) ?? 0;
  const allAnswered = quizData
    ? quizData.questions.every((question) => Boolean(answers[question.questionId]))
    : false;

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

    try {
      const response = await submitCourseQuiz(courseId, submittedAnswers, sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      setResult(response.data);

      if (response.data.passed) {
        await refreshEligibility();
      }
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Quiz could not be submitted.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleIssueCertificate() {
    setIsIssuing(true);
    setNotice("");

    try {
      const response = await issueCertificate(courseId, sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      await refreshEligibility();
      setNotice(response.data.alreadyIssued ? "Certificate already issued." : "Certificate issued successfully.");
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Certificate could not be issued.");
    } finally {
      setIsIssuing(false);
    }
  }

  function updateAnswer(questionId: string, optionId: string) {
    if (result) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="h-5 w-44 rounded-full bg-slate-100" />
          <div className="mt-6 h-56 animate-pulse rounded-[1.5rem] bg-slate-100" />
          <div className="mt-5 space-y-4">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-44 animate-pulse rounded-[1.5rem] bg-slate-100" />
            ))}
          </div>
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
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to={`/learn/${courseId}`}>
              <Button>Back to course player</Button>
            </Link>
            <Button variant="secondary" onClick={() => void loadQuiz()}>
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Link to={`/learn/${courseId}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to course player
          </Link>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="brand">Course quiz</Badge>
                <Badge tone={quizData.quiz.status === "Published" ? "success" : "warning"}>{quizData.quiz.status}</Badge>
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink md:text-5xl">{quizData.quiz.title}</h1>
              <p className="mt-3 max-w-2xl leading-7 text-muted">
                Answer every question before submitting. Apps Script checks scoring and certificate eligibility on the backend.
              </p>
            </div>

            <Card className="p-4">
              <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
                <span>Answered</span>
                <span>
                  {answeredCount}/{totalQuestions}
                </span>
              </div>
              <ProgressBar value={answerProgress} />
              <p className="mt-3 text-xs font-semibold text-muted">{answerProgress}% ready to submit</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard icon={<ClipboardList className="h-6 w-6" />} label="Questions" value={totalQuestions} />
          <MetricCard icon={<Target className="h-6 w-6" />} label="Passing score" value={`${quizData.quiz.passingScore}%`} />
          <MetricCard icon={<Award className="h-6 w-6" />} label="Total points" value={totalPoints} />
        </div>

        {result ? (
          <ResultPanel
            courseId={courseId}
            eligibility={eligibility}
            isIssuing={isIssuing}
            onIssueCertificate={handleIssueCertificate}
            result={result}
          />
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {quizData.questions.map((question, index) => {
            const selectedOptionId = answers[question.questionId];

            return (
              <Card key={question.questionId} className="rounded-[1.5rem] p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-bold text-brand-700">Question {index + 1}</p>
                    <h2 className="mt-2 text-xl font-bold leading-snug text-ink">{question.prompt}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{question.points} point{question.points === 1 ? "" : "s"}</Badge>
                    <Badge tone={selectedOptionId ? "success" : "warning"}>{selectedOptionId ? "Answered" : "Required"}</Badge>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {question.options.map((option) => {
                    const selected = selectedOptionId === option.optionId;

                    return (
                      <label
                        key={option.optionId}
                        className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
                          selected ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:bg-slate-50"
                        } ${result ? "cursor-default" : ""}`}
                      >
                        <input
                          checked={selected}
                          className="mt-1"
                          disabled={Boolean(result)}
                          name={question.questionId}
                          onChange={() => updateAnswer(question.questionId, option.optionId)}
                          type="radio"
                          value={option.optionId}
                        />
                        <span className="flex-1 text-sm font-semibold leading-6 text-slate-700">
                          <span className="mr-2 font-black text-ink">{option.optionId.toUpperCase()}.</span>
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </Card>
            );
          })}

          {notice ? (
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3 text-sm font-semibold text-orange-700">
              {notice}
            </div>
          ) : null}

          <Card className="rounded-[1.5rem] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-ink">Secure submission</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    The browser sends selected option IDs. Apps Script performs scoring and records the attempt.
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting || Boolean(result) || !allAnswered} className="w-full md:w-auto">
                {isSubmitting ? "Submitting..." : result ? "Quiz submitted" : allAnswered ? "Submit quiz" : "Answer all questions"}
              </Button>
            </div>
          </Card>
        </form>
      </section>
    </main>
  );
}

function ResultPanel({
  courseId,
  eligibility,
  isIssuing,
  onIssueCertificate,
  result,
}: {
  courseId: string;
  eligibility: CertificateEligibilityData | null;
  isIssuing: boolean;
  onIssueCertificate: () => void;
  result: SubmitCourseQuizData;
}) {
  return (
    <Card className="overflow-hidden rounded-[1.5rem]">
      <div className={`${result.passed ? "bg-emerald-50" : "bg-rose-50"} p-6`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                result.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {result.passed ? <CheckCircle2 size={24} aria-hidden="true" /> : <XCircle size={24} aria-hidden="true" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink">{result.passed ? "Quiz passed" : "Quiz not passed yet"}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Your score is {result.score}%. Passing score is {result.passingScore}%.
              </p>
            </div>
          </div>

          <div className="min-w-40 rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-ink">{result.score}%</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">Score</p>
          </div>
        </div>
      </div>

      {result.passed ? (
        <div className="border-t border-line p-6">
          <div className="flex items-start gap-3">
            <Award className="mt-0.5 shrink-0 text-emerald-700" size={22} aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">
                {eligibility?.eligible || eligibility?.alreadyIssued ? "Certificate ready" : "Certificate not ready yet"}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {eligibility?.reason || "Checking certificate eligibility..."}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                {eligibility?.alreadyIssued ? (
                  <Link to="/certificates">
                    <Button>
                      View certificate
                      <Award className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : null}

                {eligibility?.eligible && !eligibility.alreadyIssued ? (
                  <Button onClick={onIssueCertificate} disabled={isIssuing}>
                    {isIssuing ? "Issuing..." : "Issue certificate"}
                    <Award className="h-4 w-4" />
                  </Button>
                ) : null}

                <Link to={`/learn/${courseId}`}>
                  <Button variant="secondary">Back to course</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-line p-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="mt-0.5 shrink-0 text-rose-700" size={22} aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-ink">Review the course and try again</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Return to the lessons, review the material, then submit another attempt when ready.
              </p>
              <Link to={`/learn/${courseId}`} className="mt-4 inline-flex">
                <Button variant="secondary">Back to course</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <Card className="rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">{icon}</div>
        <ShieldCheck className="h-5 w-5 text-emerald-500" />
      </div>
      <p className="mt-5 text-3xl font-bold text-ink">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
    </Card>
  );
}

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}
