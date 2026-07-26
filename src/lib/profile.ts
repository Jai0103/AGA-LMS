import type { AuthUser } from "./auth";

export type UpdateMyProfilePayload = {
  fullName: string;
};

export type UpdateMyProfileData = {
  user: AuthUser;
};
