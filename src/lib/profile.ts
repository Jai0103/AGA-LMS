import { apiRequest } from "./apiClient";
import type { UpdateMyProfileData, UpdateMyProfilePayload } from "../types/profile";

export function updateMyProfile(payload: UpdateMyProfilePayload, sessionToken: string) {
  return apiRequest<UpdateMyProfileData, UpdateMyProfilePayload>(
    "updateMyProfile",
    payload,
    sessionToken,
  );
}
