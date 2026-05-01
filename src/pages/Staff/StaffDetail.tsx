import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaff } from '../../hooks/useStaff';
import { useTheme } from '../../context/ThemeContext';
import { StaffRoleBadge } from './components/StaffRoleBadge';
import { StaffMember } from '../../types/staff';
import { useI18n } from '../../context/I18nContext';

export const StaffDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { getStaffMember, formatDate, removeStaff } = useStaff();
  
  const [member, setMember] = useState<StaffMember | null>(null);
  const [removing, setRemoving] = useState(false);

useEffect(() => {
  if (id) {
    setMember(getStaffMember(id));
  }
}, [id, getStaffMember]);

  const handleRemove = async () => {
    if (!id) return;
    setRemoving(true);
    await removeStaff(id);
    setRemoving(false);
    navigate('/staff');
  };

  if (!member) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.accentGreen;
      case 'pending': return colors.accentOrange;
      case 'suspended': return colors.accentRed;
      case 'inactive': return '#999';
      default: return '#666';
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
            {t('staffDetails', 'Staff Details')}
          </h1>
          <p style={{ color: colors.textMuted }}>
            {t('viewTeamMemberInformation', 'View team member information')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => navigate(`/staff/${id}/edit`)}
            style={{
              backgroundColor: colors.accentBlue,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
            }}
          >
            {t('editLabel')}
          </button>
          {member.role !== 'owner' && (
            <button
              onClick={handleRemove}
              disabled={removing}
              style={{
                backgroundColor: colors.accentRed,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: removing ? 'not-allowed' : 'pointer',
                opacity: removing ? 0.7 : 1,
              }}
            >
              {removing ? t('removing', 'Removing...') : t('removeLabel')}
            </button>
          )}
          <button
            onClick={() => navigate('/staff')}
            style={{
              backgroundColor: 'transparent',
              color: colors.textMuted,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
            }}
          >
            {t('back')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column - Profile */}
        <div style={{ 
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px', 
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: colors.accentGold + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2.5rem',
          }}>
            {member.user?.email?.charAt(0).toUpperCase() || '?'}
          </div>

          <h2 style={{ color: colors.text, marginBottom: '0.5rem' }}>
            {member.user?.email}
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <StaffRoleBadge role={member.role} />
          </div>

          <div style={{
            display: 'inline-block',
            padding: '0.25rem 1rem',
            borderRadius: '20px',
            backgroundColor: getStatusColor(member.status) + '20',
            color: getStatusColor(member.status),
            fontSize: '0.9rem',
            fontWeight: 'bold',
          }}>
            {member.status.toUpperCase()}
          </div>

          {member.lastActiveAt && (
            <div style={{ marginTop: '1rem', color: colors.textMuted, fontSize: '0.9rem' }}>
              {t('lastActive')}: {formatDate(member.lastActiveAt)}
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div style={{ 
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px', 
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>{t('orderInformation', 'Information')}</h3>

          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0.75rem 0', color: colors.textMuted, width: '150px' }}>{t('authEmailAddress')}:</td>
                <td style={{ padding: '0.75rem 0', color: colors.text, fontWeight: 'bold' }}>
                  {member.user?.email}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0', color: colors.textMuted }}>{t('role', 'Role')}:</td>
                <td style={{ padding: '0.75rem 0', color: colors.text }}>{member.role}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0', color: colors.textMuted }}>{t('invitedLabel')}:</td>
                <td style={{ padding: '0.75rem 0', color: colors.text }}>
                  {formatDate(member.invitedAt)}
                </td>
              </tr>
              {member.acceptedAt && (
                <tr>
                  <td style={{ padding: '0.75rem 0', color: colors.textMuted }}>{t('acceptedAtLabel')}:</td>
                  <td style={{ padding: '0.75rem 0', color: colors.text }}>
                    {formatDate(member.acceptedAt)}
                  </td>
                </tr>
              )}
              {member.notes && (
                <tr>
                  <td style={{ padding: '0.75rem 0', color: colors.textMuted }}>{t('notes')}:</td>
                  <td style={{ padding: '0.75rem 0', color: colors.text, fontStyle: 'italic' }}>
                    {member.notes}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Permissions */}
          {member.permissions && member.permissions.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: colors.text, marginBottom: '1rem' }}>{t('permissions', 'Permissions')}</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {member.permissions.map(permission => (
                  <span
                    key={permission}
                    style={{
                      backgroundColor: colors.inputBg,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      color: colors.textMuted,
                    }}
                  >
                    {permission.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
