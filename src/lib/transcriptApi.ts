import { apiRequest } from "./apiClient";
import type { MyTranscriptData } from "../types/transcript";

export function listMyTranscript(sessionToken: string) {
  return apiRequest<MyTranscriptData>("listMyTranscript", {}, sessionToken);
}
