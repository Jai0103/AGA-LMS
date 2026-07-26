export type UserRole = "VISITOR" | "STUDENT" | "TRAINER" | "ADMIN";

export type AuthUser = {
  userId: string;
  fullName: string;
  email: string;
  role: Exclude<UserRole, "VISITOR">;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
};

export type SessionState = {
  sessionToken: string;
  user: AuthUser;
  expiresAt: string;
};

export type AuthResponseData = {
  user: AuthUser;
  sessionToken: string;
  expiresAt: string;
};

export type GetMeResponseData = {
  user: AuthUser;
};

export type LogoutResponseData = {
  loggedOut: boolean;
};
