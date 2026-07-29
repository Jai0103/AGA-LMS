import { apiRequest } from "./apiClient";
import type {
  AdminAnnouncementsData,
  AdminCreateAnnouncementData,
  AdminCreateAnnouncementPayload,
  AdminUpdateAnnouncementStatusData,
  AdminUpdateAnnouncementStatusPayload,
  PublicAnnouncementsData,
} from "../types/announcement";

export function listPublishedAnnouncements() {
  return apiRequest<PublicAnnouncementsData>("listPublishedAnnouncements", {});
}

export function adminListAnnouncements(sessionToken: string) {
  return apiRequest<AdminAnnouncementsData>("adminListAnnouncements", {}, sessionToken);
}

export function adminCreateAnnouncement(payload: AdminCreateAnnouncementPayload, sessionToken: string) {
  return apiRequest<AdminCreateAnnouncementData, AdminCreateAnnouncementPayload>(
    "adminCreateAnnouncement",
    payload,
    sessionToken,
  );
}

export function adminUpdateAnnouncementStatus(payload: AdminUpdateAnnouncementStatusPayload, sessionToken: string) {
  return apiRequest<AdminUpdateAnnouncementStatusData, AdminUpdateAnnouncementStatusPayload>(
    "adminUpdateAnnouncementStatus",
    payload,
    sessionToken,
  );
}
