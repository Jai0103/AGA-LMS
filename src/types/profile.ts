import type { AuthUser } from "./auth";

export type UpdateMyProfilePayload = {
  fullName: string;
};

export type UpdateMyProfileData = {
  user: AuthUser;
};

export type ChangeMyPasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangeMyPasswordData = {
  passwordChanged: boolean;
  message: string;
};
