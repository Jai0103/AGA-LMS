import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Star } from "lucide-react";
import { AdminTable } from "../components/admin/AdminTable";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { adminListCourses } from "../lib/adminApi";
import type { PublicCourseFromApi } from "../lib/courseApi";

export function AdminCoursesPage() {
  const { sessionToken } = useAuth();
  const [courses, setCourses] = useState<PublicCourseFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const publishedCount = courses.filter((course) => course.status === "Published").length;
  const totalLessons = courses.reduce((sum, course) => sum + course.lessonsCount, 0);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Badge tone="brand">Admin courses</Badge>
          <h1 className="mt-5 text-4xl font-bold text-ink">Course inventory.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Review published course records, metadata, trainers, lessons, ratings, and enrolment counts.
          </p>

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
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-muted">Loading courses...</p>
          </Card>
        ) : null}

        {!isLoading && notice ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-red-700">{notice}</p>
          </Card>
        ) : null}

        {!isLoading && !notice ? (
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
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {courses.map((course) => (
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
                      <Badge tone={course.status === "Published" ? "success" : "warning"}>{course.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTable>
        ) : null}
      </section>
    </main>
  );
}
