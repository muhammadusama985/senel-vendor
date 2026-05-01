import React from 'react';
import { STAFF_ROLES, StaffRole } from '../../../types/staff';
import { useI18n } from '../../../context/I18nContext';

interface StaffRoleBadgeProps {
  role: StaffRole;
  size?: 'small' | 'medium';
}

export const StaffRoleBadge: React.FC<StaffRoleBadgeProps> = ({
  role,
  size = 'medium',
}) => {
  const { t } = useI18n();
  const roleInfo = STAFF_ROLES[role] ?? STAFF_ROLES.viewer;

  const padding = size === 'small' ? '0.25rem 0.5rem' : '0.5rem 1rem';
  const fontSize = size === 'small' ? '0.75rem' : '0.875rem';

  return (
    <span
      style={{
        backgroundColor: `${roleInfo.color}20`,
        color: roleInfo.color,
        padding,
        borderRadius: '20px',
        fontSize,
        fontWeight: 'bold',
        display: 'inline-block',
      }}
    >
      {t(role, roleInfo.name)}
    </span>
  );
};
