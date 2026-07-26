import { useEffect, useState } from "react";
import { Award, CalendarDays, Copy, ExternalLink } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { listMyCertificates } from "../lib/certificateApi";
import type { CertificateWithCourse } from "../types/certificate";

export function CertificatesPage() {
  const { sessionToken } = useAuth();
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    listMyCertificates(sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setCertificates(response.data.certificates);
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Badge tone="brand">Certificates</Badge>
          <h1 className="mt-5 text-4xl font-bold text-ink">Your earned certificates.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Certificates are issued only after the backend confirms course completion and quiz pass status.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-muted">Loading certificates...</p>
          </Card>
        ) : null}

        {!isLoading && notice ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-bold text-red-700">{notice}</p>
          </Card>
        ) : null}

        {!isLoading && !notice && certificates.length === 0 ? (
          <Card className="p-8 text-center">
            <Award className="mx-auto text-brand-600" size={32} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-ink">No certificates yet</h2>
            <p className="mt-2 text-muted">
              Complete all lessons and pass the course quiz to request your certificate.
            </p>
          </Card>
        ) : null}

        {!isLoading && !notice && certificates.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {certificates.map((item) => (
              <Card key={item.certificate.certificateId} className="overflow-hidden">
                <div className="border-b border-line bg-slate-950 p-5 text-white">
                  <div className="flex items-center gap-3">
                    <Award className="text-brand-100" size={26} aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold text-brand-100">Certificate of completion</p>
                      <h2 className="mt-1 text-xl font-bold">{item.course.title}</h2>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                    <CalendarDays size={16} aria-hidden="true" />
                    Issued {new Date(item.certificate.issuedAt).toLocaleDateString()}
                  </div>

                  <div className="mt-4 rounded-lg border border-line bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-normal text-muted">Verification code</p>
                    <p className="mt-1 font-mono text-lg font-bold text-ink">{item.certificate.certificateCode}</p>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="secondary"
                      onClick={() => navigator.clipboard.writeText(item.certificate.certificateCode)}
                    >
                      <Copy size={16} aria-hidden="true" />
                      Copy code
                    </Button>
                    {item.certificate.publicUrl ? (
                      <a href={item.certificate.publicUrl} rel="noreferrer" target="_blank">
                        <Button>
                          <ExternalLink size={16} aria-hidden="true" />
                          Open PDF
                        </Button>
                      </a>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
