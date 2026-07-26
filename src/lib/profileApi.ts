import { apiRequest } from "./apiClient";
import type {
  ChangeMyPasswordData,
  ChangeMyPasswordPayload,
  UpdateMyProfileData,
  UpdateMyProfilePayload,
} from "../types/profile";

export function updateMyProfile(payload: UpdateMyProfilePayload, sessionToken: string) {
  return apiRequest<UpdateMyProfileData, UpdateMyProfilePayload>(
    "updateMyProfile",
    payload,
    sessionToken,
  );
}

export function changeMyPassword(payload: ChangeMyPasswordPayload, sessionToken: string) {
  return apiRequest<ChangeMyPasswordData, ChangeMyPasswordPayload>(
    "changeMyPassword",
    payload,
    sessionToken,
  );
}
