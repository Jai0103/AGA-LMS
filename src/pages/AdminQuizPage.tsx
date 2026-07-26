import { type FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Eye,
  HelpCircle,
  ListChecks,
  PlusCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { adminAddQuizQuestion, adminGetQuizSetup, adminSaveQuiz } from "../lib/adminApi";
import type {
  AdminAddQuizQuestionPayload,
  AdminCourseStatus,
  AdminQuizQuestionOption,
  AdminSaveQuizPayload,
} from "../types/admin";
import type { Quiz, QuizQuestion } from "../types/quiz";

function createDefaultOptions(): AdminQuizQuestionOption[] {
  return [
    { optionId: "a", label: "" },
    { optionId: "b", label: "" },
    { optionId: "c", label: "" },
    { optionId: "d", label: "" },
  ];
}

export function AdminQuizPage() {
  const { courseId = "" } = useParams();
  const { sessionToken } = useAuth();

  const [courseTitle, setCourseTitle] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");

  const [quizForm, setQuizForm] = useState<AdminSaveQuizPayload>({
    courseId,
    title: "Course Quiz",
    passingScore: 70,
    status: "Draft",
  });

  const [questionForm, setQuestionForm] = useState<AdminAddQuizQuestionPayload>({
    courseId,
    prompt: "",
    options: createDefaultOptions(),
    correctOptionId: "a",
    points: 1,
    sortOrder: 1,
  });

  useEffect(() => {
    void loadQuizSetup();
  }, [courseId, sessionToken]);

  async function loadQuizSetup() {
    setIsLoading(true);
    setNotice("");

    try {
      const response = await adminGetQuizSetup(courseId, sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      const sortedQuestions = [...response.data.questions].sort((first, second) => first.sortOrder - second.sortOrder);
      setCourseTitle(response.data.course.title);
      setQuiz(response.data.quiz);
      setQuestions(sortedQuestions);
      setQuizForm({
        courseId,
        title: response.data.quiz?.title ?? `${response.data.course.title} Quiz`,
        passingScore: response.data.quiz?.passingScore ?? 70,
        status: (response.data.quiz?.status as AdminCourseStatus | undefined) ?? "Draft",
      });
      setQuestionForm((current) => ({
        ...current,
        courseId,
        sortOrder: sortedQuestions.length + 1,
      }));
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Quiz setup could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateQuizField<K extends keyof AdminSaveQuizPayload>(field: K, value: AdminSaveQuizPayload[K]) {
    setQuizForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateQuestionField<K extends keyof AdminAddQuizQuestionPayload>(
    field: K,
    value: AdminAddQuizQuestionPayload[K],
  ) {
    setQuestionForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateOption(optionId: string, label: string) {
    setQuestionForm((current) => ({
      ...current,
      options: current.options.map((option) => (option.optionId === optionId ? { ...option, label } : option)),
    }));
  }

  async function handleSaveQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingQuiz(true);
    setNotice("");

    try {
      const response = await adminSaveQuiz(quizForm, sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      setQuiz(response.data.quiz);
      setNotice("Quiz saved.");
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Quiz could not be saved.");
    } finally {
      setIsSavingQuiz(false);
    }
  }

  async function handleAddQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingQuestion(true);
    setNotice("");

    try {
      const response = await adminAddQuizQuestion(questionForm, sessionToken);

      if (!response.ok) {
        setNotice(response.error.message);
        return;
      }

      setQuestions((current) => [...current, response.data.question].sort((first, second) => first.sortOrder - second.sortOrder));
      setQuestionForm((current) => ({
        ...current,
        prompt: "",
        options: createDefaultOptions(),
        correctOptionId: "a",
        points: 1,
        sortOrder: current.sortOrder + 1,
      }));
      setNotice("Question added.");
    } catch (caughtError) {
      setNotice(caughtError instanceof Error ? caughtError.message : "Question could not be added.");
    } finally {
      setIsSavingQuestion(false);
    }
  }

  const totalPoints = questions.reduce((sum, question) => sum + safeNumber(question.points), 0);
  const published = quiz?.status === "Published" || quizForm.status === "Published";
  const completionReady = Boolean(quiz) && questions.length > 0 && totalPoints > 0;

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return questions;
    }

    return questions.filter((question) =>
      [
        question.prompt,
        question.questionId,
        question.type,
        String(question.points),
        ...question.options.map((option) => `${option.optionId} ${option.label}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, questions]);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
              <ArrowLeft size={16} aria-hidden="true" />
              Back to courses
            </Link>

            <div className="mt-6">
              <Badge tone="brand">Admin quiz</Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
                {courseTitle || "Course quiz"}
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                Build a single-choice course quiz. Correct answers are sent only to Apps Script, where scoring and certificate eligibility stay protected.
              </p>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Quiz readiness</p>
                  <h2 className="mt-3 text-2xl font-bold">
                    {completionReady ? `${questions.length} question${questions.length === 1 ? "" : "s"} ready` : "Quiz needs setup"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {totalPoints.toLocaleString()} total point{totalPoints === 1 ? "" : "s"} with a {quizForm.passingScore}% passing score.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <ShieldCheck className="h-8 w-8 text-emerald-300" />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge tone={published ? "success" : "warning"}>{published ? "Published" : "Draft"}</Badge>
                <Badge tone={completionReady ? "success" : "warning"}>{completionReady ? "Questions ready" : "Needs questions"}</Badge>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 xl:grid-cols-[430px_1fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <MetricCard icon={<HelpCircle className="h-6 w-6" />} label="Questions" value={questions.length} />
            <MetricCard icon={<Target className="h-6 w-6" />} label="Passing score" value={`${quizForm.passingScore}%`} />
            <MetricCard icon={<ListChecks className="h-6 w-6" />} label="Total points" value={totalPoints} />
          </div>

          <Card className="rounded-[1.5rem] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <HelpCircle size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">Quiz settings</h2>
                <p className="text-sm text-muted">Save as Draft until questions are ready.</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSaveQuiz}>
              <Input
                label="Quiz title"
                name="title"
                value={quizForm.title}
                onChange={(event) => updateQuizField("title", event.target.value)}
                required
              />

              <Input
                label="Passing score"
                name="passingScore"
                type="number"
                min={0}
                max={100}
                value={quizForm.passingScore}
                onChange={(event) => updateQuizField("passingScore", Number(event.target.value))}
                required
              />

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Status</span>
                <select
                  className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  value={quizForm.status}
                  onChange={(event) => updateQuizField("status", event.target.value as AdminCourseStatus)}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </label>

              <Button type="submit" disabled={isSavingQuiz} className="w-full">
                <CheckCircle2 size={16} aria-hidden="true" />
                {isSavingQuiz ? "Saving..." : "Save quiz"}
              </Button>
            </form>
          </Card>

          <Card className="rounded-[1.5rem] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <PlusCircle size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">Add question</h2>
                <p className="text-sm text-muted">Create or save the quiz first, then add questions.</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleAddQuestion}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Question prompt</span>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  value={questionForm.prompt}
                  onChange={(event) => updateQuestionField("prompt", event.target.value)}
                  required
                />
              </label>

              <div className="grid gap-3">
                {questionForm.options.map((option) => (
                  <Input
                    key={option.optionId}
                    label={`Option ${option.optionId.toUpperCase()}`}
                    name={`option-${option.optionId}`}
                    value={option.label}
                    onChange={(event) => updateOption(option.optionId, event.target.value)}
                    required
                  />
                ))}
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Correct</span>
                  <select
                    className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                    value={questionForm.correctOptionId}
                    onChange={(event) => updateQuestionField("correctOptionId", event.target.value)}
                  >
                    {questionForm.options.map((option) => (
                      <option key={option.optionId} value={option.optionId}>
                        {option.optionId.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>

                <Input
                  label="Points"
                  name="points"
                  type="number"
                  min={1}
                  value={questionForm.points}
                  onChange={(event) => updateQuestionField("points", Number(event.target.value))}
                  required
                />

                <Input
                  label="Sort order"
                  name="sortOrder"
                  type="number"
                  min={1}
                  value={questionForm.sortOrder}
                  onChange={(event) => updateQuestionField("sortOrder", Number(event.target.value))}
                  required
                />
              </div>

              {notice ? (
                <div className="flex items-start justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-3 text-sm font-bold text-brand-700">
                  <span>{notice}</span>
                  <button type="button" onClick={() => setNotice("")} className="rounded-full p-1 transition hover:bg-brand-100">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : null}

              <Button type="submit" disabled={isSavingQuestion || !quiz} className="w-full">
                <PlusCircle size={16} aria-hidden="true" />
                {isSavingQuestion ? "Adding..." : "Add question"}
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="overflow-hidden rounded-[1.5rem]">
            <div className="border-b border-line p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-brand-600" />
                    <h2 className="text-lg font-bold text-ink">{quiz ? quiz.title : "No quiz created yet"}</h2>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    Review question order, answer choices, points, and quiz readiness.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadQuizSetup()}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-bold text-ink transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              <div className="mt-5">
                <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-slate-50 px-4">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search question prompt, option, question ID, or points"
                    className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>
            </div>

            {isLoading ? (
              <div className="p-6">
                <div className="h-4 w-44 rounded-full bg-slate-100" />
                <div className="mt-5 space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              </div>
            ) : null}

            {!isLoading ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-muted">
                    <tr>
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Question</th>
                      <th className="px-5 py-3">Options</th>
                      <th className="px-5 py-3">Points</th>
                      <th className="px-5 py-3">Readiness</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line">
                    {filteredQuestions.map((question) => (
                      <tr key={question.questionId} className="align-top">
                        <td className="px-5 py-4">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-ink">
                            {question.sortOrder}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-ink">{question.prompt}</p>
                          <p className="mt-1 max-w-[14rem] truncate font-mono text-xs text-muted">{question.questionId}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="grid gap-2">
                            {question.options.map((option) => (
                              <div key={option.optionId} className="rounded-2xl border border-line bg-slate-50 px-3 py-2">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                                  Option {option.optionId.toUpperCase()}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-ink">{option.label}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted">{question.points}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge tone={question.options.length >= 2 ? "success" : "warning"}>
                              {question.options.length} options
                            </Badge>
                            <Badge tone={question.points > 0 ? "brand" : "warning"}>
                              {question.points > 0 ? "Scored" : "No points"}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredQuestions.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm font-bold text-muted" colSpan={5}>
                          No questions match this view.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            ) : null}
          </Card>

          <Card className="rounded-[1.5rem] p-5">
            <div className="flex items-start gap-3">
              <Eye className="mt-1 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <h2 className="text-lg font-bold text-ink">Security note</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  The admin UI collects the correct answer for setup only. Quiz scoring, answer validation, attempts,
                  and certificate eligibility remain protected in Apps Script.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <Card className="rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">{icon}</div>
        <Sparkles className="h-5 w-5 text-amber-500" />
      </div>
      <p className="mt-5 text-3xl font-bold text-ink">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
    </Card>
  );
}

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}
