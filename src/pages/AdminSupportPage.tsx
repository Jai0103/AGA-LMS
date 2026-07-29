import { useEffect, useMemo, useState } from "react";
import { Inbox, LifeBuoy, RefreshCw, ShieldCheck } from "lucide-react";
import { AdminTable } from "../components/admin/AdminTable";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { adminListSupportTickets, adminUpdateSupportTicket } from "../lib/supportApi";
import type { SupportTicket, SupportTicketStatus } from "../types/support";

const statuses: SupportTicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export function AdminSupportPage() {
  const { sessionToken } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingTicketId, setSavingTicketId] = useState("");
  const [notice, setNotice] = useState("");

  const metrics = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "OPEN").length,
      active: tickets.filter((ticket) => ticket.status === "OPEN" || ticket.status === "IN_PROGRESS").length,
    }),
    [tickets],
  );

  async function loadTickets() {
    setIsLoading(true);
    setNotice("");

    const response = await adminListSupportTickets(sessionToken);

    if (response.ok) {
      setTickets(response.data.tickets);
    } else {
      setNotice(response.error.message);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    adminListSupportTickets(sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setTickets(response.data.tickets);
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

  async function handleStatusChange(ticket: SupportTicket, status: SupportTicketStatus) {
    setSavingTicketId(ticket.ticketId);
    setNotice("");

    const response = await adminUpdateSupportTicket(
      {
        ticketId: ticket.ticketId,
        status,
        adminNotes: ticket.adminNotes,
      },
      sessionToken,
    );

    setSavingTicketId("");

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setTickets((current) => current.map((item) => (item.ticketId === ticket.ticketId ? response.data.ticket : item)));
    setNotice("Support ticket updated.");
  }

  async function handleNotesChange(ticket: SupportTicket, adminNotes: string) {
    setSavingTicketId(ticket.ticketId);
    setNotice("");

    const response = await adminUpdateSupportTicket(
      {
        ticketId: ticket.ticketId,
        status: ticket.status,
        adminNotes,
      },
      sessionToken,
    );

    setSavingTicketId("");

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setTickets((current) => current.map((item) => (item.ticketId === ticket.ticketId ? response.data.ticket : item)));
    setNotice("Admin notes saved.");
  }

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <Badge tone="brand">Admin support</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-ink md:text-5xl">
              Support inbox for learner issues and platform requests.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Review authenticated support tickets, update status, and keep internal notes. All changes are validated by Apps Script.
            </p>
            <div className="mt-7">
              <Button variant="secondary" onClick={loadTickets}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-6 text-white md:p-8">
            <div className="grid h-full content-end gap-4 sm:grid-cols-3">
              <Metric label="Tickets" value={metrics.total} />
              <Metric label="Open" value={metrics.open} />
              <Metric label="Active" value={metrics.active} />
            </div>
          </div>
        </div>
      </section>

      {notice ? (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm font-bold text-brand-700">
          {notice}
        </div>
      ) : null}

      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-sm font-bold text-muted">Loading support tickets...</p>
        </Card>
      ) : null}

      {!isLoading ? (
        <AdminTable title="Support tickets">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Ticket</th>
                <th className="px-5 py-3">Requester</th>
                <th className="px-5 py-3">Issue</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Admin notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm font-bold text-muted">
                    No support tickets yet.
                  </td>
                </tr>
              ) : null}

              {tickets.map((ticket) => {
                const isSaving = savingTicketId === ticket.ticketId;

                return (
                  <tr key={ticket.ticketId} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-bold text-ink">{ticket.ticketId}</p>
                      <p className="mt-2 text-xs font-semibold text-muted">{new Date(ticket.createdAt).toLocaleString()}</p>
                      <div className="mt-3">
                        <Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-ink">{ticket.fullName}</p>
                      <p className="mt-1 break-all text-xs font-semibold text-muted">{ticket.email}</p>
                      <p className="mt-2 text-xs font-bold text-brand-700">{ticket.role}</p>
                    </td>
                    <td className="max-w-md px-5 py-4">
                      <p className="text-xs font-black uppercase text-accent-700">{ticket.category}</p>
                      <h2 className="mt-2 font-black text-ink">{ticket.subject}</h2>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{ticket.message}</p>
                      {ticket.pageUrl ? (
                        <a
                          href={ticket.pageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block break-all text-xs font-bold text-brand-700 hover:text-accent-600"
                        >
                          {ticket.pageUrl}
                        </a>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                        disabled={isSaving}
                        value={ticket.status}
                        onChange={(event) => handleStatusChange(ticket, event.target.value as SupportTicketStatus)}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="min-w-72 px-5 py-4">
                      <textarea
                        className="min-h-28 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                        defaultValue={ticket.adminNotes}
                        disabled={isSaving}
                        onBlur={(event) => {
                          if (event.target.value !== ticket.adminNotes) {
                            handleNotesChange(ticket, event.target.value);
                          }
                        }}
                        placeholder="Internal admin notes"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminTable>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2">
        <Card className="rounded-[1.5rem] p-5">
          <Inbox className="h-6 w-6 text-brand-700" />
          <h2 className="mt-4 text-lg font-black text-ink">Operational record</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Tickets are stored in the SupportTickets sheet for admin review.</p>
        </Card>
        <Card className="rounded-[1.5rem] p-5">
          <ShieldCheck className="h-6 w-6 text-accent-700" />
          <h2 className="mt-4 text-lg font-black text-ink">Access control</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Only Admin accounts can open this inbox or change ticket status.</p>
        </Card>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/70">{label}</p>
    </div>
  );
}

function priorityTone(priority: string): "brand" | "success" | "neutral" | "warning" {
  if (priority === "Urgent" || priority === "High") {
    return "warning";
  }

  if (priority === "Low") {
    return "neutral";
  }

  return "brand";
}
