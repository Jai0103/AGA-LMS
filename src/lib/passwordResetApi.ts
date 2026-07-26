import { apiRequest } from "./apiClient";
import type {
  RequestPasswordResetData,
  RequestPasswordResetPayload,
  ResetPasswordData,
  ResetPasswordPayload,
} from "../types/passwordReset";

export function requestPasswordReset(payload: RequestPasswordResetPayload) {
  return apiRequest<RequestPasswordResetData, RequestPasswordResetPayload>(
    "requestPasswordReset",
    payload,
  );
}

export function resetPassword(payload: ResetPasswordPayload) {
  return apiRequest<ResetPasswordData, ResetPasswordPayload>(
    "resetPassword",
    payload,
  );
}
