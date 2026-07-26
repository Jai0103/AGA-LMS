import type { AuthUser, UserRole } from "../types/auth";

export function hasRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) {
    return roles.includes("VISITOR");
  }

  return roles.includes(user.role);
}
