import { useCallback, useEffect, useState } from 'react';
import api from '../api/client'; // adjust path if needed
import {
  ActivityFilters,
  ActivityLog,
  InviteStaffPayload,
  ROLE_PERMISSIONS,
  StaffListResponse,
  StaffMember,
  UpdateStaffPayload,
} from '../types/staff';
import { useI18n } from '../context/I18nContext';

function normalizeOwner(owner: StaffListResponse['owner']): StaffMember | null {
  if (!owner) return null;

  const user =
    typeof owner.userId === 'object' && owner.userId
      ? owner.userId
      : {
          _id: typeof owner.userId === 'string' ? owner.userId : 'owner',
          email: owner.email || '',
        };

  return {
    _id: typeof owner.userId === 'string' ? owner.userId : user._id || 'owner',
    role: 'owner',
    permissions: [],
    status: 'active',
    notes: '',
    user,
  };
}

function normalizeStaffResponse(data: StaffListResponse): StaffMember[] {
  const owner = normalizeOwner(data.owner);
  const members = Array.isArray(data.staff) ? data.staff : [];
  return owner ? [owner, ...members] : members;
}

export function useStaff() {
  const { t } = useI18n();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const [activityPages, setActivityPages] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/vendor/staff');
      setStaff(normalizeStaffResponse(data));
    } catch (error) {
      console.error('Fetch staff failed', error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteStaff = useCallback(async (payload: InviteStaffPayload) => {
  try {
    await api.post('/vendor/staff/invite', payload);
    await fetchStaff();
    return { success: true, message: '' };
  } catch (error: any) {
    console.error('Invite staff failed', error);
    return {
      success: false,
      message: error?.response?.data?.message || error?.message || t('failedSendInvitation', 'Failed to send invitation'),
    };
  }
}, [fetchStaff]);

  const updateStaff = useCallback(async (staffId: string, payload: UpdateStaffPayload) => {
    try {
      await api.patch(`/vendor/staff/${staffId}`, {
        ...payload,
        permissions:
          payload.permissions ||
          (payload.role ? ROLE_PERMISSIONS[payload.role] : undefined),
      });
      await fetchStaff();
      return true;
    } catch (error) {
      console.error('Update staff failed', error);
      return false;
    }
  }, [fetchStaff]);

  const removeStaff = useCallback(async (staffId: string) => {
    try {
      await api.delete(`/vendor/staff/${staffId}`);
      setStaff((prev) => prev.filter((item) => item._id !== staffId));
      return true;
    } catch (error) {
      console.error('Remove staff failed', error);
      return false;
    }
  }, []);

  const getStaffMember = useCallback(
    (staffId: string) => staff.find((item) => item._id === staffId) || null,
    [staff]
  );

  const fetchActivities = useCallback(async (filters: ActivityFilters = {}) => {
    try {
      setActivitiesLoading(true);

      const { data } = await api.get('/vendor/activity', {
        params: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 20,
          action: filters.action || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          userId: filters.userId || undefined,
          entityType: filters.entityType || undefined,
        },
      });

      setActivities(
        (data.logs || []).map((log: ActivityLog) => ({
          ...log,
          action: (log.action || '').toLowerCase(),
        }))
      );
      setActivityTotal(data.total || 0);
      setActivityPage(data.page || 1);
      setActivityPages(data.pages || 1);
      setLimit(data.limit || 20);
    } catch (error) {
      console.error('Fetch activities failed', error);
      setActivities([]);
      setActivityTotal(0);
      setActivityPage(1);
      setActivityPages(1);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  const formatDate = useCallback((date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return {
    staff,
    loading,
    fetchStaff,
    inviteStaff,
    updateStaff,
    removeStaff,
    getStaffMember,

    activities,
    activitiesLoading,
    activityTotal,
    activityPage,
    activityPages,
    limit,
    fetchActivities,
    formatDate,
  };
}
