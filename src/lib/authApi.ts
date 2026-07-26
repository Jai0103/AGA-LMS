import { apiRequest } from "./apiClient";
import type { AuthResponseData, GetMeResponseData, LogoutResponseData } from "../types/auth";

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export function registerUser(payload: RegisterPayload) {
  return apiRequest<AuthResponseData, RegisterPayload>("registerUser", payload);
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<AuthResponseData, LoginPayload>("loginUser", payload);
}

export function getMe(sessionToken: string) {
  return apiRequest<GetMeResponseData>("getMe", {}, sessionToken);
}

export function logoutUser(sessionToken: string) {
  return apiRequest<LogoutResponseData>("logoutUser", {}, sessionToken);
}
