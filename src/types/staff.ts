export type StaffRole = 'owner' | 'admin' | 'manager' | 'editor' | 'viewer';
export type EditableStaffRole = Exclude<StaffRole, 'owner'>;
export type StaffStatus = 'pending' | 'active' | 'suspended' | 'inactive';
export type EditableStaffStatus = Exclude<StaffStatus, 'pending'>;

export interface StaffUser {
  _id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface StaffMember {
  _id: string;
  vendorId?: string;
  role: StaffRole;
  permissions: string[];
  invitedAt?: string;
  acceptedAt?: string;
  status: StaffStatus;
  lastActiveAt?: string;
  notes?: string;
  user?: StaffUser;
}

export interface StaffListResponse {
  owner?: {
    userId?: string | StaffUser;
    email?: string;
    role: 'owner';
  };
  staff: StaffMember[];
}

export interface UpdateStaffPayload {
  role?: EditableStaffRole;
  status?: EditableStaffStatus;
  permissions?: string[];
  notes?: string;
}

export interface InviteStaffPayload {
  email: string;
  role: EditableStaffRole;
  notes?: string;
}

export interface ActivityUser {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface ActivityLog {
  _id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  userRole?: string;
  createdAt: string;
  user?: ActivityUser;
}

export interface ActivityFilters {
  page?: number;
  limit?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  entityType?: string;
}

export const ROLE_PERMISSIONS: Record<EditableStaffRole, string[]> = {
  admin: [
    'manage_products',
    'manage_orders',
    'manage_inventory',
    'view_analytics',
    'reply_disputes',
    'export_data',
  ],
  manager: [
    'manage_products',
    'manage_orders',
    'manage_inventory',
    'view_analytics',
  ],
  editor: [
    'edit_products',
    'view_orders',
    'view_inventory',
  ],
  viewer: [
    'view_products',
    'view_orders',
    'view_analytics',
  ],
};

export const STAFF_PERMISSIONS = [
  { value: 'manage_staff', label: 'Manage Staff' },
  { value: 'manage_products', label: 'Manage Products' },
  { value: 'manage_orders', label: 'Manage Orders' },
  { value: 'manage_inventory', label: 'Manage Inventory' },
  { value: 'view_analytics', label: 'View Analytics' },
  { value: 'manage_payouts', label: 'Manage Payouts' },
  { value: 'manage_settings', label: 'Manage Settings' },
  { value: 'reply_disputes', label: 'Reply to Disputes' },
  { value: 'export_data', label: 'Export Data' },
  { value: 'edit_products', label: 'Edit Products' },
  { value: 'view_orders', label: 'View Orders' },
  { value: 'view_inventory', label: 'View Inventory' },
  { value: 'view_products', label: 'View Products' },
];

export const STAFF_ROLES = {
  owner: { name: 'Owner', description: 'Full access', color: '#d4af37' },
  admin: { name: 'Admin', description: 'Manage staff, products, orders', color: '#2563eb' },
  manager: { name: 'Manager', description: 'Manage products and orders', color: '#7c3aed' },
  editor: { name: 'Editor', description: 'Edit products only', color: '#ea580c' },
  viewer: { name: 'Viewer', description: 'Read-only access', color: '#6b7280' },
} as const;