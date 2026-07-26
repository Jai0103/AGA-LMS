import { apiRequest } from "./apiClient";
import type { CertificateVerificationData } from "../types/certificateVerification";

export function verifyCertificate(certificateCode: string) {
  return apiRequest<CertificateVerificationData, { certificateCode: string }>(
    "verifyCertificate",
    { certificateCode },
  );
}
