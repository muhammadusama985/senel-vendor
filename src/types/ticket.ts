export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type TicketCategory = 'technical' | 'billing' | 'product' | 'order' | 'shipping' | 'account' | 'other';

export interface Ticket {
  _id: string;
  vendorId: string;
  createdBy: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  attachments?: Array<{
    url: string;
    filename: string;
    size: number;
  }>;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  closedBy?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface TicketMessage {
  _id: string;
  ticketId: string;
  userId?: string;
  user?: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  userRole: 'vendor' | 'admin' | 'staff' | 'system';
  message: string;
  attachments?: Array<{
    url: string;
    filename: string;
    size: number;
  }>;
  isInternal?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  attachments?: Array<{
    url: string;
    filename: string;
    size: number;
  }>;
}

export interface AddMessageData {
  message: string;
  attachments?: Array<{
    url: string;
    filename: string;
    size: number;
  }>;
  isInternal?: boolean;
}

export interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  page: number;
  limit: number;
}