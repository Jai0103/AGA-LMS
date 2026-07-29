import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bell, Megaphone, Pin, Plus, RefreshCw } from "lucide-react";
import { AdminTable } from "../components/admin/AdminTable";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import {
  adminCreateAnnouncement,
  adminListAnnouncements,
  adminUpdateAnnouncementStatus,
} from "../lib/announcementApi";
import type { Announcement, AnnouncementAudience, AnnouncementStatus } from "../types/announcement";

const audiences: AnnouncementAudience[] = ["All", "Students", "Trainers", "Admins"];
const statuses: AnnouncementStatus[] = ["Published", "Draft", "Archived"];

export function AdminAnnouncementsPage() {
  const { sessionToken } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingAnnouncementId, setSavingAnnouncementId] = useState("");
  const [notice, setNotice] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("All");
  const [status, setStatus] = useState<AnnouncementStatus>("Published");
  const [pinned, setPinned] = useState(false);

  const metrics = useMemo(
    () => ({
      total: announcements.length,
      published: announcements.filter((announcement) => announcement.status === "Published").length,
      pinned: announcements.filter((announcement) => announcement.pinned).length,
    }),
    [announcements],
  );

  async function loadAnnouncements() {
    setIsLoading(true);
    setNotice("");

    const response = await adminListAnnouncements(sessionToken);

    if (response.ok) {
      setAnnouncements(response.data.announcements);
    } else {
      setNotice(response.error.message);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    adminListAnnouncements(sessionToken).then((response) => {
      if (!isMounted) {
        return;
      }

      if (response.ok) {
        setAnnouncements(response.data.announcements);
      } else {
        setNotice(response.error.message);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [sessionToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (title.trim().length < 6 || body.trim().length < 20) {
      setNotice("Title and body are required before saving an announcement.");
      return;
    }

    setIsSaving(true);

    const response = await adminCreateAnnouncement(
      {
        title: title.trim(),
        body: body.trim(),
        audience,
        status,
        pinned,
      },
      sessionToken,
    );

    setIsSaving(false);

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setAnnouncements((current) => [response.data.announcement, ...current]);
    setTitle("");
    setBody("");
    setAudience("All");
    setStatus("Published");
    setPinned(false);
    setNotice("Announcement saved.");
  }

  async function handleAnnouncementChange(announcement: Announcement, nextStatus: AnnouncementStatus, nextPinned: boolean) {
    setSavingAnnouncementId(announcement.announcementId);
    setNotice("");

    const response = await adminUpdateAnnouncementStatus(
      {
        announcementId: announcement.announcementId,
        status: nextStatus,
        pinned: nextPinned,
      },
      sessionToken,
    );

    setSavingAnnouncementId("");

    if (!response.ok) {
      setNotice(response.error.message);
      return;
    }

    setAnnouncements((current) =>
      current.map((item) => (item.announcementId === announcement.announcementId ? response.data.announcement : item)),
    );
    setNotice("Announcement updated.");
  }

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <Badge tone="brand">Admin announcements</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-ink md:text-5xl">
              Publish platform updates for learners and academy teams.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Create clear notices for course operations, certificate updates, maintenance windows, and academy announcements.
            </p>
            <div className="mt-7">
              <Button variant="secondary" onClick={loadAnnouncements}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-6 text-white md:p-8">
            <div className="grid h-full content-end gap-4 sm:grid-cols-3">
              <Metric label="Total" value={metrics.total} />
              <Metric label="Published" value={metrics.published} />
              <Metric label="Pinned" value={metrics.pinned} />
            </div>
          </div>
        </div>
      </section>

      {notice ? (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm font-bold text-brand-700">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[24rem_1fr]">
        <Card className="rounded-[1.5rem] p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Plus className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-black text-ink">Create update</h2>
            </div>

            <Input
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: New theory course resources added"
            />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Body</span>
              <textarea
                className="min-h-40 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write the learner-facing announcement."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Audience</span>
              <select
                className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                value={audience}
                onChange={(event) => setAudience(event.target.value as AnnouncementAudience)}
              >
                {audiences.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Status</span>
              <select
                className="h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                value={status}
                onChange={(event) => setStatus(event.target.value as AnnouncementStatus)}
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-brand-300 text-brand-700 focus:ring-brand-500"
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
              />
              Pin this update
            </label>

            <Button type="submit" disabled={isSaving}>
              <Megaphone className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save announcement"}
            </Button>
          </form>
        </Card>

        <div>
          {isLoading ? (
            <Card className="rounded-[1.5rem] p-8 text-center">
              <p className="text-sm font-bold text-muted">Loading announcements...</p>
            </Card>
          ) : null}

          {!isLoading ? (
            <AdminTable title="Announcements">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-3">Update</th>
                    <th className="px-5 py-3">Audience</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Pinned</th>
                    <th className="px-5 py-3">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {announcements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm font-bold text-muted">
                        No announcements yet.
                      </td>
                    </tr>
                  ) : null}

                  {announcements.map((announcement) => {
                    const isSavingRow = savingAnnouncementId === announcement.announcementId;

                    return (
                      <tr key={announcement.announcementId} className="align-top">
                        <td className="max-w-md px-5 py-4">
                          <div className="flex items-center gap-2">
                            {announcement.pinned ? <Pin className="h-4 w-4 text-accent-700" /> : <Bell className="h-4 w-4 text-brand-700" />}
                            <p className="font-black text-ink">{announcement.title}</p>
                          </div>
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{announcement.body}</p>
                          <p className="mt-2 font-mono text-xs text-muted">{announcement.announcementId}</p>
                        </td>
                        <td className="px-5 py-4">
                          <Badge>{announcement.audience}</Badge>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                            disabled={isSavingRow}
                            value={announcement.status}
                            onChange={(event) =>
                              handleAnnouncementChange(announcement, event.target.value as AnnouncementStatus, announcement.pinned)
                            }
                          >
                            {statuses.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-700">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-brand-300 text-brand-700 focus:ring-brand-500"
                              checked={announcement.pinned}
                              disabled={isSavingRow}
                              onChange={(event) =>
                                handleAnnouncementChange(announcement, announcement.status, event.target.checked)
                              }
                            />
                            Pin
                          </label>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-muted">
                          {announcement.publishedAt ? new Date(announcement.publishedAt).toLocaleDateString() : "Not published"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </AdminTable>
          ) : null}
        </div>
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
