export type UserRole = "VISITOR" | "STUDENT" | "TRAINER" | "ADMIN";

export type AuthUser = {
  userId: string;
  fullName: string;
  email: string;
  role: Exclude<UserRole, "VISITOR">;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
};

export type SessionState = {
  token: string;
  user: AuthUser;
  expiresAt: string;
};
