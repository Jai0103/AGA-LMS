import { FormEvent, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Award, CheckCircle2, ExternalLink, Search, ShieldCheck, XCircle } from "lucide-react";
import { verifyCertificate } from "../lib/certificateVerificationApi";
import type { CertificateVerificationData } from "../types/certificateVerification";

export function CertificateVerificationPage() {
  const params = useParams<{ certificateCode?: string }>();
  const initialCode = useMemo(() => params.certificateCode ?? "", [params.certificateCode]);
  const [certificateCode, setCertificateCode] = useState(initialCode);
  const [result, setResult] = useState<CertificateVerificationData | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    const cleanCode = certificateCode.trim().toUpperCase();

    if (!cleanCode) {
      setError("Enter a certificate code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await verifyCertificate(cleanCode);
      setResult(response.data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Certificate verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isVerified = result?.valid === true;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Public verification
          </div>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Verify an AGA LMS certificate
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Enter the certificate code shown on the PDF to confirm that it was issued after backend validation of course completion and quiz eligibility.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="certificateCode">
              Certificate code
            </label>
            <input
              id="certificateCode"
              value={certificateCode}
              onChange={(event) => setCertificateCode(event.target.value)}
              placeholder="AGA-1FD54431EB0D"
              className="min-h-12 flex-1 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold uppercase tracking-wide text-slate-900 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <Search className="h-4 w-4" />
              {isSubmitting ? "Checking..." : "Verify"}
            </button>
          </form>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-6 text-white">
          <div className="flex h-full flex-col justify-between gap-10">
            <Award className="h-10 w-10 text-amber-300" />
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Verification standard
              </p>
              <p className="text-2xl font-bold">
                Certificate records are checked against the secured Apps Script backend and Google Sheets database.
              </p>
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className={`rounded-2xl p-3 ${isVerified ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {isVerified ? <CheckCircle2 className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-bold uppercase tracking-[0.16em] ${isVerified ? "text-emerald-700" : "text-rose-700"}`}>
                  {result.status.replace(/_/g, " ")}
                </p>
                <h2 className="text-2xl font-bold text-slate-950">
                  {result.message}
                </h2>
              </div>
            </div>

            {isVerified && result.certificate?.publicUrl ? (
              <a
                href={result.certificate.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-950"
              >
                <ExternalLink className="h-4 w-4" />
                Open PDF
              </a>
            ) : null}
          </div>

          {isVerified && result.certificate && result.learner && result.course ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <VerificationField label="Certificate code" value={result.certificate.certificateCode} />
              <VerificationField label="Learner" value={result.learner.fullName} />
              <VerificationField label="Course" value={result.course.title} />
              <VerificationField label="Issued" value={formatDate(result.certificate.issuedAt)} />
              <VerificationField label="Category" value={result.course.category} />
              <VerificationField label="Level" value={result.course.level} />
              <VerificationField label="Trainer" value={result.course.trainerName} />
              <VerificationField label="Duration" value={result.course.duration} />
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function VerificationField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-950">{value || "Not available"}</p>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
