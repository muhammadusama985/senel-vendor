import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaff } from '../../hooks/useStaff';
import { useTheme } from '../../context/ThemeContext';
import { StaffRoleBadge } from './components/StaffRoleBadge';
import { useI18n } from '../../context/I18nContext';

export const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { staff, loading, removeStaff, formatDate } = useStaff();
  const [removing, setRemoving] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.accentGreen;
      case 'pending':
        return colors.accentOrange;
      case 'suspended':
        return colors.accentRed;
      case 'inactive':
        return '#999';
      default:
        return '#666';
    }
  };

  const handleRemove = async (staffId: string) => {
    setRemoving(staffId);
    await removeStaff(staffId);
    setRemoving(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>{t('teamMembers')}</h1>
          <p style={{ color: colors.textMuted }}>{t('manageStaffPermissions')}</p>
        </div>
        <button
          onClick={() => navigate('/staff/invite')}
          style={{
            background: colors.buttonGradient,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          + {t('inviteTeamMember')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {staff.filter((s) => s.role === 'owner').map((owner) => (
          <div
            key={owner._id}
            style={{
              background: colors.cardBg,
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.text }}>{owner.user?.email}</h3>
                <div style={{ marginTop: '0.25rem' }}>
                  <StaffRoleBadge role={owner.role} />
                </div>
              </div>
              <span
                style={{
                  backgroundColor: `${colors.accentOrange}20`,
                  color: colors.accentOrange,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                }}
              >
                {t('ownerLabel').toUpperCase()}
              </span>
            </div>

            <div style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{owner.user?.email}</div>
            {owner.lastActiveAt && <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>{t('lastActive')}: {formatDate(owner.lastActiveAt)}</div>}
          </div>
        ))}

        {staff.filter((s) => s.role !== 'owner').map((member) => (
          <div
            key={member._id}
            style={{
              background: colors.cardBg,
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.text }}>{member.user?.email}</h3>
                <div style={{ marginTop: '0.25rem' }}>
                  <StaffRoleBadge role={member.role} />
                </div>
              </div>
              <span
                style={{
                  backgroundColor: `${getStatusColor(member.status)}20`,
                  color: getStatusColor(member.status),
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                }}
              >
                {member.status.toUpperCase()}
              </span>
            </div>

            <div style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{member.user?.email}</div>
            <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginBottom: '1rem' }}>
              {t('invitedLabel')}: {formatDate(member.invitedAt)}
              {member.acceptedAt && ` - ${t('acceptedAtLabel')}: ${formatDate(member.acceptedAt)}`}
            </div>
            {member.lastActiveAt && <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginBottom: '1rem' }}>{t('lastActive')}: {formatDate(member.lastActiveAt)}</div>}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => navigate(`/staff/${member._id}`)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: colors.accentBlue,
                  border: `1px solid ${colors.accentBlue}`,
                  borderRadius: '4px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                {t('view')}
              </button>
              <button
                onClick={() => navigate(`/staff/${member._id}/edit`)}
                style={{
                  flex: 1,
                  background: colors.buttonGradient,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                {t('editLabel')}
              </button>
              <button
                onClick={() => handleRemove(member._id)}
                disabled={removing === member._id}
                style={{
                  flex: 1,
                  backgroundColor: colors.accentRed,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  cursor: removing === member._id ? 'not-allowed' : 'pointer',
                  opacity: removing === member._id ? 0.7 : 1,
                }}
              >
                {removing === member._id ? '...' : t('removeLabel')}
              </button>
            </div>
          </div>
        ))}

        {staff.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: colors.textMuted }}>
            {t('noTeamMembers')}
          </div>
        )}
      </div>
    </div>
  );
};
