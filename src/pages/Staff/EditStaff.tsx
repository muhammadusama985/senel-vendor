import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaff } from '../../hooks/useStaff';
import { useTheme } from '../../context/ThemeContext';
import { StaffRoleBadge } from './components/StaffRoleBadge';
import { PermissionChecklist } from './components/PermissionChecklist';
import { ROLE_PERMISSIONS } from '../../types/staff';
import {
  StaffMember,
  EditableStaffRole,
  EditableStaffStatus,
  STAFF_ROLES,
} from '../../types/staff';

export const EditStaff: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { staff, updateStaff, loading } = useStaff();

  const [member, setMember] = useState<StaffMember | null>(null);
  const [role, setRole] = useState<EditableStaffRole>('viewer');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<EditableStaffStatus>('active');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && staff.length > 0) {
      const found = staff.find((s) => s._id === id);

      if (found) {
        setMember(found);
        setRole(found.role === 'owner' ? 'viewer' : found.role);
        setPermissions(found.permissions ?? []);
        setNotes(found.notes ?? '');
        setStatus(found.status === 'pending' ? 'inactive' : found.status);
      }
    }
  }, [id, staff]);

  useEffect(() => {
  if (role) {
    setPermissions(ROLE_PERMISSIONS[role] || []);
  }
}, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);

    const success = await updateStaff(id, {
      role,
      permissions,
      notes,
      status,
    });

    if (success) {
      navigate(`/staff/${id}`);
    }

    setSubmitting(false);
  };

  if (loading && !member) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: colors.textMuted }}>
        Staff member not found
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          Edit Staff Member
        </h1>
        <p style={{ color: colors.textMuted }}>
          Update role and permissions for {member.user?.email ?? 'staff member'}
        </p>
      </div>

      <div
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <form onSubmit={handleSubmit}>
          <div
            style={{
              marginBottom: '2rem',
              padding: '1rem',
              backgroundColor: colors.inputBg,
              borderRadius: '8px',
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: colors.textMuted, marginRight: '1rem' }}>Current Role:</span>
              <StaffRoleBadge role={member.role} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: colors.text,
                fontWeight: 'bold',
              }}
            >
              New Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as EditableStaffRole)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            >
              {Object.entries(STAFF_ROLES).map(([key, value]) => {
                if (key === 'owner') return null;

                return (
                  <option key={key} value={key}>
                    {value.name} - {value.description}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: colors.text,
                fontWeight: 'bold',
              }}
            >
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EditableStaffStatus)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <PermissionChecklist
              selectedPermissions={permissions}
              onChange={setPermissions}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: colors.text,
                fontWeight: 'bold',
              }}
            >
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                resize: 'vertical',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate(`/staff/${id}`)}
              style={{
                backgroundColor: 'transparent',
                color: colors.textMuted,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              style={{
                background: colors.buttonGradient,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontWeight: 'bold',
                cursor: submitting || loading ? 'not-allowed' : 'pointer',
                opacity: submitting || loading ? 0.7 : 1,
              }}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
