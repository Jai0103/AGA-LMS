export type RequestPasswordResetPayload = {
  email: string;
};

export type RequestPasswordResetData = {
  message: string;
};

export type ResetPasswordPayload = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export type ResetPasswordData = {
  passwordReset: boolean;
  message: string;
};
