import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  Copy,
  ExternalLink,
  FileCheck2,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { listMyCertificates } from "../lib/certificateApi";
import type { CertificateWithCourse } from "../types/certificate";

const SITE_ORIGIN = "https://jai0103.github.io/AGA-LMS";

type SortMode = "newest" | "course" | "category";

export function CertificatesPage() {
  const { sessionToken } = useAuth();
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
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

  const sortedCertificates = useMemo(() => {
    return [...certificates].sort((first, second) => getIssuedTime(second) - getIssuedTime(first));
  }, [certificates]);

  const latestCertificate = sortedCertificates[0] ?? null;
  const categoryCount = useMemo(() => {
    return new Set(certificates.map((item) => item.course.category).filter(Boolean)).size;
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...certificates]
      .filter(({ certificate, course }) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          certificate.certificateCode,
          course.title,
          course.subtitle,
          course.category,
          course.level,
          course.trainerName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((first, second) => {
        if (sortMode === "course") {
          return first.course.title.localeCompare(second.course.title);
        }

        if (sortMode === "category") {
          return `${first.course.category} ${first.course.title}`.localeCompare(
            `${second.course.category} ${second.course.title}`,
          );
        }

        return getIssuedTime(second) - getIssuedTime(first);
      });
  }, [certificates, query, sortMode]);

  async function copyVerificationLink(certificateCode: string) {
    const link = buildVerificationLink(certificateCode);

    try {
      await navigator.clipboard.writeText(link);
      setCopiedCode(certificateCode);
      window.setTimeout(() => setCopiedCode(""), 1800);
    } catch {
      setError("Copy failed. Open the verification page and copy the browser address instead.");
    }
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 p-6 lg:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
              <Award className="h-4 w-4" />
              Certificate wallet
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
                Your verified AGA LMS achievements
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Download your issued certificates, verify their public status, and share trusted proof of completion with employers, clients, and training managers.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryCard icon={<FileCheck2 className="h-5 w-5" />} label="Issued" value={String(certificates.length)} />
              <SummaryCard icon={<Trophy className="h-5 w-5" />} label="Categories" value={String(categoryCount)} />
              <SummaryCard
                icon={<CalendarDays className="h-5 w-5" />}
                label="Latest"
                value={latestCertificate ? formatDate(latestCertificate.certificate.issuedAt) : "None yet"}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-6 text-white lg:p-8">
            <div className="flex h-full min-h-[20rem] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="rounded-2xl bg-white/10 p-3">
                  <BadgeCheck className="h-8 w-8 text-emerald-300" />
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
                  Verified
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Latest credential
                </p>
                <h2 className="text-2xl font-bold tracking-tight">
                  {latestCertificate ? latestCertificate.course.title : "Complete a course to unlock this area"}
                </h2>
                <p className="text-sm leading-6 text-slate-300">
                  {latestCertificate
                    ? latestCertificate.certificate.certificateCode
                    : "Certificates appear here after backend eligibility checks confirm course progress and quiz results."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="rounded-full p-1 text-rose-700 transition hover:bg-rose-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-4 w-40 rounded-full bg-slate-100" />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[0, 1].map((item) => (
              <div key={item} className="h-64 animate-pulse rounded-[1.5rem] bg-slate-100" />
            ))}
          </div>
        </section>
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
        <section className="space-y-5">
          <div className="grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto]">
            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by course, trainer, category, or certificate code"
                className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
              <SortButton active={sortMode === "newest"} onClick={() => setSortMode("newest")}>
                Newest
              </SortButton>
              <SortButton active={sortMode === "course"} onClick={() => setSortMode("course")}>
                Course
              </SortButton>
              <SortButton active={sortMode === "category"} onClick={() => setSortMode("category")}>
                Category
              </SortButton>
            </div>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <Search className="mx-auto h-9 w-9 text-slate-400" />
              <h2 className="mt-4 text-xl font-bold text-slate-950">No matching certificates</h2>
              <p className="mt-2 text-sm text-slate-600">Clear the search or try a different course/category name.</p>
            </div>
          ) : null}

          <div className="grid gap-5">
            {filteredCertificates.map(({ certificate, course }) => {
              const verificationLink = buildVerificationLink(certificate.certificateCode);
              const wasCopied = copiedCode === certificate.certificateCode;

              return (
                <article
                  key={certificate.certificateId}
                  className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                >
                  <div className="grid lg:grid-cols-[24rem_1fr]">
                    <div className="bg-slate-950 p-6 text-white">
                      <div className="flex h-full min-h-[18rem] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="rounded-2xl bg-white/10 p-3">
                            <Sparkles className="h-7 w-7 text-amber-300" />
                          </div>
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
                            <ShieldCheck className="h-4 w-4" />
                            Verified
                          </span>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Certificate code
                          </p>
                          <p className="break-all text-2xl font-bold tracking-tight">{certificate.certificateCode}</p>
                          <p className="text-xs font-semibold text-slate-400">Issued {formatDate(certificate.issuedAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 p-6 lg:p-8">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                            {course.category} - {course.level}
                          </p>
                          <h2 className="text-2xl font-bold text-slate-950">{course.title}</h2>
                          <p className="max-w-3xl text-sm leading-6 text-slate-600">{course.subtitle}</p>
                        </div>
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                          <BadgeCheck className="h-4 w-4" />
                          Issued
                        </span>
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
                          Verify
                        </Link>

                        <button
                          type="button"
                          onClick={() => copyVerificationLink(certificate.certificateCode)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-950"
                        >
                          <Copy className="h-4 w-4" />
                          {wasCopied ? "Copied" : "Copy link"}
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
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
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

function SortButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
        active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function buildVerificationLink(certificateCode: string) {
  return `${SITE_ORIGIN}/#/verify-certificate/${encodeURIComponent(certificateCode)}`;
}

function getIssuedTime(item: CertificateWithCourse) {
  const timestamp = new Date(item.certificate.issuedAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
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
