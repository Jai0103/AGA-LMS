# AGA LMS Production Checklist

## GitHub Pages

- [ ] GitHub Pages source is set to GitHub Actions.
- [ ] `vite.config.ts` uses `base: "/AGA-LMS/"`.
- [ ] GitHub Actions build succeeds.
- [ ] `VITE_APPS_SCRIPT_API_URL` is configured as a GitHub Actions repository variable.
- [ ] `.env` is not committed.
- [ ] `.env.example` contains only placeholder values.

## Apps Script

- [ ] Apps Script is deployed as a Web App.
- [ ] Execute as: Me.
- [ ] Who has access: Anyone.
- [ ] Latest deployment version is active.
- [ ] `Config.gs` has the correct Google Sheet ID.
- [ ] Debug stack traces are not exposed in API responses.
- [ ] Failed internal errors are written to AuditLogs.

## Google Sheets

- [ ] Users tab exists.
- [ ] Sessions tab exists.
- [ ] Courses tab exists.
- [ ] Lessons tab exists.
- [ ] Enrolments tab exists.
- [ ] Progress tab exists.
- [ ] Quizzes tab exists.
- [ ] QuizQuestions tab exists.
- [ ] QuizAttempts tab exists.
- [ ] Certificates tab exists.
- [ ] AuditLogs tab exists.
- [ ] Admin user role is assigned only to trusted users.

## Security

- [ ] Frontend never writes directly to Google Sheets.
- [ ] Frontend never accesses Google Drive files directly unless public links are intended.
- [ ] Every protected request requires a session token.
- [ ] Apps Script validates every action payload.
- [ ] Apps Script checks role access before protected actions.
- [ ] Passwords are salted and hashed.
- [ ] Session tokens are stored hashed in Google Sheets.
- [ ] Sensitive backend errors are not shown to users.
- [ ] Audit logs are created for sensitive workflows.

## Manual Acceptance Tests

- [ ] Visitor can view landing page.
- [ ] Visitor can view course catalogue.
- [ ] Visitor cannot open dashboard.
- [ ] Student can register.
- [ ] Student can log in.
- [ ] Student can enroll in a course.
- [ ] Student can open course player.
- [ ] Student can mark lessons complete.
- [ ] Student can take quiz.
- [ ] Student can issue certificate after eligibility.
- [ ] Admin can open admin dashboard.
- [ ] Admin can view users.
- [ ] Admin can view courses.
- [ ] Admin can view enrolments.
- [ ] Admin can view reports.
- [ ] Student cannot access admin routes.
