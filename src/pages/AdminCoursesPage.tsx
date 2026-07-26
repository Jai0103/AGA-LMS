import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminTable } from "../components/admin/AdminTable";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { adminListCourses, adminUpdateCourseStatus } from "../lib/adminApi";
import type { PublicCourseFromApi } from "../lib/courseApi";
import type { AdminCourseStatus } from "../types/admin";

const courseStatuses: AdminCourseStatus[] = ["Published", "Draft"];

export function AdminCoursesPage() {
  const { sessionToken } = useAuth();
  const [courses, setCourses] = useState<PublicCourseFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingCourseId, setSavingCourseId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    adminListCourses(sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setCourses(response.data.courses);
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

  async function handleStatusChange(courseId: string, status: AdminCourseStatus) {
    setSavingCourseId(courseId);
    setNotice("");

    const response = await adminUpdateCourseStatus(courseId, status, sessionToken);

    setSavingCourseId("");

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setCourses((current) =>
      current.map((course) => (course.courseId === courseId ? response.data.course : course)),
    );

    setNotice("Course status updated.");
  }

  const publishedCount = courses.filter((course) => course.status === "Published").length;
  const totalLessons = courses.reduce((sum, course) => sum + course.lessonsCount, 0);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Badge tone="brand">Admin courses</Badge>

          <h1 className="mt-5 text-4xl font-bold text-ink">Course inventory.</h1>

          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Review courses and control whether each course is published or hidden as a draft.
          </p>

          <div className="mt-6">
            <Link to="/admin/courses/new">
              <Button variant="secondary">Create course</Button>
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <BookOpen className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">{courses.length}</p>
              <p className="mt-1 text-sm font-semibold text-muted">Total courses</p>
            </Card>

            <Card className="p-5">
              <GraduationCap className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">{publishedCount}</p>
              <p className="mt-1 text-sm font-semibold text-muted">Published courses</p>
            </Card>

            <Card className="p-5">
              <Star className="text-brand-600" size={24} aria-hidden="true" />
              <p className="mt-4 text-3xl font-bold text-ink">{totalLessons}</p>
              <p className="mt-1 text-sm font-semibold text-muted">Total lessons</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {notice ? (
          <div className="mb-5 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm font-bold text-brand-700">
            {notice}
          </div>
        ) : null}

        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-muted">Loading courses...</p>
          </Card>
        ) : null}

        {!isLoading ? (
          <AdminTable title="All courses">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Level</th>
                  <th className="px-5 py-3">Lessons</th>
                  <th className="px-5 py-3">Rating</th>
                  <th className="px-5 py-3">Learners</th>
                  <th className="px-5 py-3">Manage</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {courses.map((course) => {
                  const isSaving = savingCourseId === course.courseId;

                  return (
                    <tr key={course.courseId}>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ink">{course.title}</p>
                        <p className="mt-1 text-xs text-muted">{course.trainerName}</p>
                      </td>

                      <td className="px-5 py-3 text-muted">{course.category}</td>

                      <td className="px-5 py-3">
                        <Badge>{course.level}</Badge>
                      </td>

                      <td className="px-5 py-3 text-muted">{course.lessonsCount}</td>

                      <td className="px-5 py-3 text-muted">{course.rating.toFixed(1)}</td>

                      <td className="px-5 py-3 text-muted">{course.enrolledCount.toLocaleString()}</td>

                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/admin/courses/${course.courseId}/lessons`}
                            className="text-sm font-bold text-brand-700 hover:text-brand-600"
                          >
                            Manage lessons
                          </Link>
                          <Link
                            to={`/admin/courses/${course.courseId}/resources`}
                            className="text-sm font-bold text-brand-700 hover:text-brand-600"
                          >
                            Manage resources
                          </Link>
                          <Link
                            to={`/admin/courses/${course.courseId}/quiz`}
                            className="text-sm font-bold text-brand-700 hover:text-brand-600"
                          >
                            Manage quiz
                          </Link>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                            disabled={isSaving}
                            onChange={(event) =>
                              handleStatusChange(course.courseId, event.target.value as AdminCourseStatus)
                            }
                            value={course.status as AdminCourseStatus}
                          >
                            {courseStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          <Badge tone={course.status === "Published" ? "success" : "warning"}>
                            {course.status}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </AdminTable>
        ) : null}

        {!isLoading ? (
          <div className="mt-5 rounded-lg border border-line bg-white p-4 text-sm leading-6 text-muted">
            Published courses appear in the public catalogue. Draft courses are hidden from public course listing
            and cannot be enrolled through the public flow.
          </div>
        ) : null}
      </section>
    </main>
  );
}
