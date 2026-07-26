import { HashRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AdminCoursesPage } from "./pages/AdminCoursesPage";
import { AdminCreateCoursePage } from "./pages/AdminCreateCoursePage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminEnrolmentsPage } from "./pages/AdminEnrolmentsPage";
import { AdminLessonsPage } from "./pages/AdminLessonsPage";
import { AdminReportsPage } from "./pages/AdminReportsPage";
import { AdminResourcesPage } from "./pages/AdminResourcesPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { CataloguePage } from "./pages/CataloguePage";
import { CertificatesPage } from "./pages/CertificatesPage";
import { CourseDetailsPage } from "./pages/CourseDetailsPage";
import { CoursePlayerPage } from "./pages/CoursePlayerPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { QuizPage } from "./pages/QuizPage";
import { RegisterPage } from "./pages/RegisterPage";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/courses" element={<CataloguePage />} />
            <Route path="/courses/:slug" element={<CourseDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/learn/:courseId"
              element={
                <ProtectedRoute>
                  <CoursePlayerPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/learn/:courseId/quiz"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <CertificatesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/courses/new"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminCreateCoursePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/courses/:courseId/lessons"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminLessonsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/courses/:courseId/resources"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminResourcesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminCoursesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/enrolments"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminEnrolmentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminReportsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
