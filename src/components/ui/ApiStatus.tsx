import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { healthCheck } from "../../lib/courseApi";

type StatusState =
  | { type: "loading"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function ApiStatus() {
  const [status, setStatus] = useState<StatusState>({
    type: "loading",
    message: "Checking backend",
  });

  useEffect(() => {
    let isMounted = true;

    healthCheck()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        if (response.ok) {
          setStatus({
            type: "success",
            message: `Backend online - API ${response.data.apiVersion}`,
          });
        } else {
          setStatus({
            type: "error",
            message: response.error.message,
          });
        }
      })
      .catch((caughtError) => {
        if (!isMounted) {
          return;
        }

        setStatus({
          type: "error",
          message: caughtError instanceof Error ? caughtError.message : "Backend status unavailable",
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (status.type === "loading") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-slate-600">
        <Loader2 className="animate-spin" size={14} aria-hidden="true" />
        {status.message}
      </div>
    );
  }

  if (status.type === "success") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={14} aria-hidden="true" />
        {status.message}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
      <AlertTriangle size={14} aria-hidden="true" />
      {status.message}
    </div>
  );
}
