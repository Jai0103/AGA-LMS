import { apiRequest } from "./apiClient";
import type {
  CertificateEligibilityData,
  IssueCertificateData,
  ListMyCertificatesData,
} from "../types/certificate";

export function checkCertificateEligibility(courseId: string, sessionToken: string) {
  return apiRequest<CertificateEligibilityData, { courseId: string }>(
    "checkCertificateEligibility",
    { courseId },
    sessionToken,
  );
}

export function issueCertificate(courseId: string, sessionToken: string) {
  return apiRequest<IssueCertificateData, { courseId: string }>(
    "issueCertificate",
    { courseId },
    sessionToken,
  );
}

export function listMyCertificates(sessionToken: string) {
  return apiRequest<ListMyCertificatesData>("listMyCertificates", {}, sessionToken);
}
