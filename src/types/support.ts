export type SupportTicketPriority = "Low" | "Normal" | "High" | "Urgent";

export type SupportTicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type SupportTicket = {
  ticketId: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  category: string;
  priority: SupportTicketPriority;
  subject: string;
  message: string;
  pageUrl: string;
  status: SupportTicketStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export type SubmitSupportTicketPayload = {
  category: string;
  priority: SupportTicketPriority;
  subject: string;
  message: string;
  pageUrl: string;
};

export type SubmitSupportTicketData = {
  ticket: SupportTicket;
};

export type AdminSupportTicketsData = {
  tickets: SupportTicket[];
};

export type AdminUpdateSupportTicketPayload = {
  ticketId: string;
  status: SupportTicketStatus;
  adminNotes: string;
};

export type AdminUpdateSupportTicketData = {
  ticket: SupportTicket;
};
