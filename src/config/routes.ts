export const routes = {
  home: "/",
  courses: "/courses",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  certificates: "/certificates",
  admin: "/admin",
} as const;

export const publicNavigation = [
  { label: "Courses", href: "#courses" },
  { label: "Platform", href: "#platform" },
  { label: "Security", href: "#security" },
  { label: "Admin", href: "#admin" },
] as const;
