import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, HelpCircle, PlusCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AdminTable } from "../components/admin/AdminTable";
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

const defaultOptions: AdminQuizQuestionOption[] = [
  { optionId: "a", label: "" },
  { optionId: "b", label: "" },
  { optionId: "c", label: "" },
  { optionId: "d", label: "" },
];

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

  const [quizForm, setQuizForm] = useState<AdminSaveQuizPayload>({
    courseId,
    title: "Course Quiz",
    passingScore: 70,
    status: "Draft",
  });

  const [questionForm, setQuestionForm] = useState<AdminAddQuizQuestionPayload>({
    courseId,
    prompt: "",
    options: defaultOptions,
    correctOptionId: "a",
    points: 1,
    sortOrder: 1,
  });

  useEffect(() => {
    let isMounted = true;

    adminGetQuizSetup(courseId, sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setCourseTitle(response.data.course.title);
        setQuiz(response.data.quiz);
        setQuestions(response.data.questions);
        setQuizForm({
          courseId,
          title: response.data.quiz?.title ?? `${response.data.course.title} Quiz`,
          passingScore: response.data.quiz?.passingScore ?? 70,
          status: (response.data.quiz?.status as AdminCourseStatus | undefined) ?? "Draft",
        });
        setQuestionForm((current) => ({
          ...current,
          courseId,
          sortOrder: response.data.questions.length + 1,
        }));
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [courseId, sessionToken]);

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

    const response = await adminSaveQuiz(quizForm, sessionToken);

    setIsSavingQuiz(false);

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setQuiz(response.data.quiz);
    setNotice("Quiz saved.");
  }

  async function handleAddQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingQuestion(true);
    setNotice("");

    const response = await adminAddQuizQuestion(questionForm, sessionToken);

    setIsSavingQuestion(false);

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setQuestions((current) => [...current, response.data.question].sort((a, b) => a.sortOrder - b.sortOrder));
    setQuestionForm((current) => ({
      ...current,
      prompt: "",
      options: defaultOptions,
      correctOptionId: "a",
      points: 1,
      sortOrder: current.sortOrder + 1,
    }));
    setNotice("Question added.");
  }

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to courses
          </Link>

          <div className="mt-6">
            <Badge tone="brand">Admin quiz</Badge>
            <h1 className="mt-5 text-4xl font-bold text-ink">{courseTitle || "Course quiz"}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted">
              Create a single-choice quiz. Correct answers are hashed and checked only by Apps Script.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
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

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <PlusCircle size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">Add question</h2>
                <p className="text-sm text-muted">Create the quiz first, then add questions.</p>
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
                <div className="rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm font-bold text-brand-700">
                  {notice}
                </div>
              ) : null}

              <Button type="submit" disabled={isSavingQuestion || !quiz} className="w-full">
                <PlusCircle size={16} aria-hidden="true" />
                {isSavingQuestion ? "Adding..." : "Add question"}
              </Button>
            </form>
          </Card>
        </div>

        <div>
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-sm font-bold text-muted">Loading quiz...</p>
            </Card>
          ) : null}

          {!isLoading ? (
            <AdminTable title={quiz ? quiz.title : "No quiz created yet"}>
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Question</th>
                    <th className="px-5 py-3">Options</th>
                    <th className="px-5 py-3">Points</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {questions.map((question) => (
                    <tr key={question.questionId}>
                      <td className="px-5 py-3 font-bold text-ink">{question.sortOrder}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ink">{question.prompt}</p>
                        <p className="mt-1 font-mono text-xs text-muted">{question.questionId}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((option) => (
                            <Badge key={option.optionId}>{option.optionId.toUpperCase()}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted">{question.points}</td>
                    </tr>
                  ))}

                  {questions.length === 0 ? (
                    <tr>
                      <td className="px-5 py-8 text-center text-sm font-bold text-muted" colSpan={4}>
                        No questions yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </AdminTable>
          ) : null}
        </div>
      </section>
    </main>
  );
}
