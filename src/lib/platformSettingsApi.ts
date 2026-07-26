import { apiRequest } from "./apiClient";
import type { PlatformSettingsData } from "../types/platformSettings";

export function getPlatformSettings() {
  return apiRequest<PlatformSettingsData>("getPlatformSettings", {});
}
