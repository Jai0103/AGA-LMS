import { apiRequest } from "./apiClient";
import type {
  AdminSupportTicketsData,
  AdminUpdateSupportTicketData,
  AdminUpdateSupportTicketPayload,
  SubmitSupportTicketData,
  SubmitSupportTicketPayload,
} from "../types/support";

export function submitSupportTicket(payload: SubmitSupportTicketPayload, sessionToken: string) {
  return apiRequest<SubmitSupportTicketData, SubmitSupportTicketPayload>(
    "submitSupportTicket",
    payload,
    sessionToken,
  );
}

export function adminListSupportTickets(sessionToken: string) {
  return apiRequest<AdminSupportTicketsData>("adminListSupportTickets", {}, sessionToken);
}

export function adminUpdateSupportTicket(payload: AdminUpdateSupportTicketPayload, sessionToken: string) {
  return apiRequest<AdminUpdateSupportTicketData, AdminUpdateSupportTicketPayload>(
    "adminUpdateSupportTicket",
    payload,
    sessionToken,
  );
}
