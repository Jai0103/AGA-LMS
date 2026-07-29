import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePlatformSettings } from "../../context/PlatformSettingsContext";

const pageTitles: Record<string, string> = {
  "/": "Premium Learning Platform",
  "/courses": "Course Catalogue",
  "/login": "Login",
  "/register": "Create Account",
  "/forgot-password": "Reset Password",
  "/dashboard": "Student Dashboard",
  "/profile": "Profile Settings",
  "/certificates": "Certificates",
  "/certificate-policy": "Certificate Policy",
  "/verify-certificate": "Certificate Verification",
  "/help": "Help Center",
  "/admin": "Admin Dashboard",
  "/admin/users": "Admin Users",
  "/admin/courses": "Admin Courses",
  "/admin/enrolments": "Admin Enrolments",
  "/admin/reports": "Admin Reports",
  "/admin/settings": "Platform Settings",
};

export function DocumentHead() {
  const location = useLocation();
  const { settings } = usePlatformSettings();

  useEffect(() => {
    const pageTitle = getPageTitle(location.pathname);
    const fullTitle = pageTitle ? `${pageTitle} | ${settings.platformName}` : settings.platformName;
    const description = `${settings.platformName} is a premium learning management platform for structured courses, progress tracking, secure quizzes, verified certificates, and admin reporting.`;

    document.title = fullTitle;
    setMeta("description", description);
    setMeta("application-name", settings.platformName);
    setMeta("theme-color", "#020617");
    setMetaProperty("og:title", fullTitle);
    setMetaProperty("og:description", description);
    setMetaProperty("og:type", "website");
    setMetaProperty("og:url", window.location.origin + import.meta.env.BASE_URL);
    setMetaProperty("og:image", window.location.origin + import.meta.env.BASE_URL + "aga-logo.png");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", window.location.origin + import.meta.env.BASE_URL + "aga-logo.png");
  }, [location.pathname, settings.platformName]);

  return null;
}

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }

  if (pathname.startsWith("/courses/")) {
    return "Course Details";
  }

  if (pathname.startsWith("/learn/") && pathname.endsWith("/quiz")) {
    return "Course Quiz";
  }

  if (pathname.startsWith("/learn/")) {
    return "Course Player";
  }

  if (pathname.startsWith("/verify-certificate/")) {
    return "Certificate Verification";
  }

  if (pathname.includes("/lessons")) {
    return "Admin Lessons";
  }

  if (pathname.includes("/resources")) {
    return "Admin Resources";
  }

  if (pathname.includes("/quiz")) {
    return "Admin Quiz";
  }

  return "Learning Platform";
}

function setMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setMetaProperty(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}
