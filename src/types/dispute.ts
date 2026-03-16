export type DisputeReason = 
  | 'damaged_items' 
  | 'wrong_items' 
  | 'missing_items' 
  | 'quality_issue' 
  | 'delivery_delay' 
  | 'other';

export type DisputeStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Dispute {
  _id: string;
  disputeNumber: string;
  customerUserId: string;
  customer?: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  vendorId: string;
  vendorOrderId: string;
  orderId: string;
  orderItemId?: string;
  reason: DisputeReason;
  subject: string;
  description: string;
  attachments?: Array<{
    url: string;
    filename: string;
  }>;
  status: DisputeStatus;
  lastMessageAt?: string;
  lastMessageByRole?: 'customer' | 'vendor' | 'admin';
  resolvedAt?: string;
  closedAt?: string;
  adminAssignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface DisputeMessage {
  _id: string;
  disputeId: string;
  senderRole: 'customer' | 'vendor' | 'admin';
  senderUserId: string;
  sender?: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  message: string;
  attachments?: Array<{
    url: string;
    filename: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeFilters {
  status?: string;
  reason?: string;
  search?: string;
  page: number;
  limit: number;
}