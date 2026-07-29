import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BookOpen, Megaphone, Pin, ShieldCheck } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { usePlatformSettings } from "../context/PlatformSettingsContext";
import { listPublishedAnnouncements } from "../lib/announcementApi";
import type { Announcement } from "../types/announcement";

export function UpdatesPage() {
  const { settings } = usePlatformSettings();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    listPublishedAnnouncements().then((response) => {
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
  }, []);

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <Badge tone="brand">Updates</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-ink md:text-5xl">
              Platform updates, learning notices, and academy announcements.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Read the latest published notices from {settings.platformName}. Pinned notices appear first.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/courses">
                <Button>
                  <BookOpen className="h-4 w-4" />
                  Browse courses
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="secondary">
                  <ShieldCheck className="h-4 w-4" />
                  Contact support
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-6 text-white md:p-8">
            <div className="flex h-full flex-col justify-between gap-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <Megaphone className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">Published notices</p>
                <p className="mt-3 text-5xl font-black tracking-tight">{announcements.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <Card className="rounded-[1.5rem] p-8 text-center">
          <p className="text-sm font-bold text-muted">Loading updates...</p>
        </Card>
      ) : null}

      {!isLoading && notice ? (
        <Card className="rounded-[1.5rem] p-8 text-center">
          <p className="text-sm font-bold text-red-700">{notice}</p>
        </Card>
      ) : null}

      {!isLoading && !notice && announcements.length === 0 ? (
        <Card className="rounded-[1.5rem] p-8 text-center">
          <Bell className="mx-auto h-8 w-8 text-brand-700" />
          <h2 className="mt-4 text-2xl font-black text-ink">No updates published yet.</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Published academy notices will appear here.</p>
        </Card>
      ) : null}

      {!isLoading && announcements.length > 0 ? (
        <section className="grid gap-5">
          {announcements.map((announcement) => (
            <article
              key={announcement.announcementId}
              className="rounded-[1.5rem] border border-brand-100 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={announcement.pinned ? "warning" : "neutral"}>
                      {announcement.pinned ? "Pinned" : announcement.audience}
                    </Badge>
                    {announcement.pinned ? <Pin className="h-4 w-4 text-accent-700" /> : null}
                  </div>
                  <h2 className="mt-4 text-2xl font-black tracking-tight text-ink">{announcement.title}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">{announcement.body}</p>
                </div>
                <time className="shrink-0 text-sm font-bold text-brand-700">
                  {formatAnnouncementDate(announcement.publishedAt || announcement.createdAt)}
                </time>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}

function formatAnnouncementDate(value: string) {
  if (!value) {
    return "Draft date";
  }

  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
