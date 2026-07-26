import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, CheckCircle2, Copy, ExternalLink, FileCheck2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { listMyCertificates } from "../lib/certificateApi";
import type { CertificateWithCourse } from "../types/certificate";

const SITE_ORIGIN = "https://jai0103.github.io/AGA-LMS";

export function CertificatesPage() {
  const { sessionToken } = useAuth();
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError("");

    listMyCertificates(sessionToken)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setError(response.error.message);
          return;
        }

        setCertificates(response.data.certificates);
      })
      .catch((caughtError) => {
        if (!isMounted) {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : "Certificates could not be loaded.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

  const issuedCount = certificates.length;
  const latestCertificate = useMemo(() => certificates[0] ?? null, [certificates]);

  async function copyVerificationLink(certificateCode: string) {
    const link = buildVerificationLink(certificateCode);

    try {
      await navigator.clipboard.writeText(link);
      setCopiedCode(certificateCode);
      window.setTimeout(() => setCopiedCode(""), 1800);
    } catch {
      setError("Copy failed. Open the verification link and copy it from the browser address bar.");
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
            <Award className="h-4 w-4" />
            Certificates
          </div>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Your verified achievements
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Download your issued certificates, open the secure verification page, or copy a public verification link to share with employers and training managers.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryCard icon={<FileCheck2 className="h-5 w-5" />} label="Issued certificates" value={String(issuedCount)} />
          <SummaryCard
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Latest issue"
            value={latestCertificate ? formatDate(latestCertificate.certificate.issuedAt) : "None yet"}
          />
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-600 shadow-sm">
          Loading certificates...
        </div>
      ) : null}

      {!isLoading && certificates.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <Award className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-2xl font-bold text-slate-950">No certificates yet</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Complete all lessons and pass the course quiz to unlock your first certificate.
          </p>
          <Link
            to="/dashboard"
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Go to dashboard
          </Link>
        </section>
      ) : null}

      {!isLoading && certificates.length > 0 ? (
        <section className="grid gap-4">
          {certificates.map(({ certificate, course }) => {
            const verificationLink = buildVerificationLink(certificate.certificateCode);
            const wasCopied = copiedCode === certificate.certificateCode;

            return (
              <article
                key={certificate.certificateId}
                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="bg-slate-950 p-6 text-white lg:p-8">
                    <div className="flex h-full flex-col justify-between gap-10">
                      <div className="flex items-center justify-between gap-4">
                        <div className="rounded-2xl bg-white/10 p-3">
                          <Award className="h-7 w-7 text-amber-300" />
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
                          <CheckCircle2 className="h-4 w-4" />
                          Verified
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Certificate code
                        </p>
                        <p className="mt-2 break-all text-2xl font-bold tracking-tight">
                          {certificate.certificateCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 p-6 lg:p-8">
                    <div className="space-y-2">
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                        {course.category} · {course.level}
                      </p>
                      <h2 className="text-2xl font-bold text-slate-950">{course.title}</h2>
                      <p className="text-sm leading-6 text-slate-600">{course.subtitle}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <CertificateDetail label="Issued" value={formatDate(certificate.issuedAt)} />
                      <CertificateDetail label="Trainer" value={course.trainerName} />
                      <CertificateDetail label="Duration" value={course.duration} />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {certificate.publicUrl ? (
                        <a
                          href={certificate.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open PDF
                        </a>
                      ) : null}

                      <Link
                        to={`/verify-certificate/${certificate.certificateCode}`}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-950"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Verify certificate
                      </Link>

                      <button
                        type="button"
                        onClick={() => copyVerificationLink(certificate.certificateCode)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-950"
                      >
                        <Copy className="h-4 w-4" />
                        {wasCopied ? "Copied" : "Copy verification link"}
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
                      Public verification link: <span className="break-all text-slate-950">{verificationLink}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-3 text-slate-600">
        {icon}
        <p className="text-xs font-bold uppercase tracking-[0.16em]">{label}</p>
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function CertificateDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-950">{value || "Not available"}</p>
    </div>
  );
}

function buildVerificationLink(certificateCode: string) {
  return `${SITE_ORIGIN}/#/verify-certificate/${encodeURIComponent(certificateCode)}`;
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
