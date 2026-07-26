import type { PublicCourseFromApi } from "../lib/courseApi";

export type Certificate = {
  certificateId: string;
  userId: string;
  courseId: string;
  certificateCode: string;
  issuedAt: string;
  driveFileId: string;
  publicUrl: string;
};

export type CertificateWithCourse = {
  certificate: Certificate;
  course: PublicCourseFromApi;
};

export type CertificateEligibilityData = {
  eligible: boolean;
  reason: string;
  alreadyIssued: boolean;
  certificate: Certificate | null;
};

export type IssueCertificateData = {
  certificate: Certificate;
  alreadyIssued: boolean;
};

export type MyCertificatesData = {
  certificates: CertificateWithCourse[];
};
