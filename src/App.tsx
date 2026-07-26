import { HashRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AdminCoursesPage } from "./pages/AdminCoursesPage";
import { AdminCreateCoursePage } from "./pages/AdminCreateCoursePage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminEnrolmentsPage } from "./pages/AdminEnrolmentsPage";
import { AdminLessonsPage } from "./pages/AdminLessonsPage";
import { AdminQuizPage } from "./pages/AdminQuizPage";
import { AdminReportsPage } from "./pages/AdminReportsPage";
import { AdminResourcesPage } from "./pages/AdminResourcesPage";
import { AdminSettingsPage } from "./pages/AdminSettingsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { CataloguePage } from "./pages/CataloguePage";
import { CertificateVerificationPage } from "./pages/CertificateVerificationPage";
import { CertificatesPage } from "./pages/CertificatesPage";
import { CourseDetailsPage } from "./pages/CourseDetailsPage";
import { CoursePlayerPage } from "./pages/CoursePlayerPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { QuizPage } from "./pages/QuizPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
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
            <Route path="/verify-certificate" element={<CertificateVerificationPage />} />
            <Route path="/verify-certificate/:certificateCode" element={<CertificateVerificationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
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
              path="/admin/courses/:courseId/quiz"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminQuizPage />
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

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminSettingsPage />
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
