export type AnnouncementAudience = "All" | "Students" | "Trainers" | "Admins";

export type AnnouncementStatus = "Published" | "Draft" | "Archived";

export type Announcement = {
  announcementId: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  pinned: boolean;
  publishedAt: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type PublicAnnouncementsData = {
  announcements: Announcement[];
};

export type AdminAnnouncementsData = {
  announcements: Announcement[];
};

export type AdminCreateAnnouncementPayload = {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  pinned: boolean;
};

export type AdminCreateAnnouncementData = {
  announcement: Announcement;
};

export type AdminUpdateAnnouncementStatusPayload = {
  announcementId: string;
  status: AnnouncementStatus;
  pinned: boolean;
};

export type AdminUpdateAnnouncementStatusData = {
  announcement: Announcement;
};
