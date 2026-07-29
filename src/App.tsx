import { HashRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { PlatformSettingsProvider } from "./context/PlatformSettingsContext";
import { AdminCoursesPage } from "./pages/AdminCoursesPage";
import { AdminCreateCoursePage } from "./pages/AdminCreateCoursePage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminEnrolmentsPage } from "./pages/AdminEnrolmentsPage";
import { AdminLessonsPage } from "./pages/AdminLessonsPage";
import { AdminAnnouncementsPage } from "./pages/AdminAnnouncementsPage";
import { AdminQuizPage } from "./pages/AdminQuizPage";
import { AdminReportsPage } from "./pages/AdminReportsPage";
import { AdminResourcesPage } from "./pages/AdminResourcesPage";
import { AdminSettingsPage } from "./pages/AdminSettingsPage";
import { AdminSupportPage } from "./pages/AdminSupportPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { CataloguePage } from "./pages/CataloguePage";
import { CertificateVerificationPage } from "./pages/CertificateVerificationPage";
import { CertificatePolicyPage } from "./pages/CertificatePolicyPage";
import { CertificatesPage } from "./pages/CertificatesPage";
import { CourseDetailsPage } from "./pages/CourseDetailsPage";
import { CoursePlayerPage } from "./pages/CoursePlayerPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { HelpCenterPage } from "./pages/HelpCenterPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { QuizPage } from "./pages/QuizPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";
import { SupportPage } from "./pages/SupportPage";
import { TermsPage } from "./pages/TermsPage";
import { TranscriptPage } from "./pages/TranscriptPage";
import { UpdatesPage } from "./pages/UpdatesPage";

function App() {
  return (
    <AuthProvider>
      <PlatformSettingsProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/courses" element={<CataloguePage />} />
            <Route path="/courses/:slug" element={<CourseDetailsPage />} />
            <Route path="/certificate-policy" element={<CertificatePolicyPage />} />
            <Route path="/verify-certificate" element={<CertificateVerificationPage />} />
            <Route path="/verify-certificate/:certificateCode" element={<CertificateVerificationPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
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
              path="/support"
              element={
                <ProtectedRoute>
                  <SupportPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transcript"
              element={
                <ProtectedRoute>
                  <TranscriptPage />
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

            <Route
              path="/admin/support"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminSupportPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminAnnouncementsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </PlatformSettingsProvider>
    </AuthProvider>
  );
}

export default App;
