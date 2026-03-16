export interface Wallet {
  _id: string;
  vendorId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionKind = 
  | 'EARNING_CREDIT' 
  | 'PAYOUT_DEBIT' 
  | 'REFUND' 
  | 'ADJUSTMENT';

export interface WalletTransaction {
  _id: string;
  walletId: string;
  vendorId: string;
  kind: TransactionKind;
  amount: number;
  balanceAfter: number;
  note: string;
  referenceType: 'VendorOrder' | 'PayoutRequest' | 'AdminAdjustment';
  referenceId: string;
  createdByAdminId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutRequest {
  _id: string;
  vendorId: string;
  walletId: string;
  amount: number;
  status: 'requested' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  payoutMethod: 'bank_transfer';
  payoutDetails?: Record<string, any>;
  requestedNote?: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  reviewNote?: string;
  paidAt?: string;
  externalReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutFilters {
  status?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

export interface TransactionFilters {
  kind?: string;
  from?: string;
  to?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface WalletSummary {
  totalEarnings: number;
  totalPayouts: number;
  pendingPayouts: number;
  balance: number;
  lastPayoutDate?: string;
  thisMonthEarnings: number;
  thisMonthPayouts: number;
}

export interface PayoutResponse {
  items: PayoutRequest[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TransactionResponse {
  items: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
