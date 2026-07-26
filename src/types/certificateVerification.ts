export type CertificateVerificationStatus =
  | "VERIFIED"
  | "INVALID_FORMAT"
  | "NOT_FOUND"
  | "INCOMPLETE_RECORD";

export type VerifiedCertificate = {
  certificateCode: string;
  issuedAt: string;
  publicUrl: string;
};

export type VerifiedLearner = {
  fullName: string;
};

export type VerifiedCourse = {
  courseId: string;
  title: string;
  subtitle: string;
  category: string;
  level: string;
  trainerName: string;
  duration: string;
};

export type CertificateVerificationData = {
  valid: boolean;
  status: CertificateVerificationStatus;
  message: string;
  certificate?: VerifiedCertificate;
  learner?: VerifiedLearner;
  course?: VerifiedCourse;
};
