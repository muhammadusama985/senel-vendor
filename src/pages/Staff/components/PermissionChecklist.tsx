import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { STAFF_PERMISSIONS } from '../../../types/staff';

interface PermissionChecklistProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export const PermissionChecklist: React.FC<PermissionChecklistProps> = ({
  selectedPermissions,
  onChange,
  disabled = false,
}) => {
  const { colors } = useTheme();

  const handleToggle = (permissionValue: string) => {
    if (selectedPermissions.includes(permissionValue)) {
      onChange(selectedPermissions.filter(p => p !== permissionValue));
    } else {
      onChange([...selectedPermissions, permissionValue]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === STAFF_PERMISSIONS.length) {
      onChange([]);
    } else {
      onChange(STAFF_PERMISSIONS.map(p => p.value));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'bold', color: colors.text }}>Permissions</label>
        {!disabled && (
          <button
            type="button"
            onClick={handleSelectAll}
            style={{
              backgroundColor: 'transparent',
              color: colors.accentBlue,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {selectedPermissions.length === STAFF_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {STAFF_PERMISSIONS.map(permission => (
          <label
            key={permission.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.7 : 1,
            }}
          >
            <input
              type="checkbox"
              checked={selectedPermissions.includes(permission.value)}
              onChange={() => !disabled && handleToggle(permission.value)}
              disabled={disabled}
              style={{
                width: '16px',
                height: '16px',
                cursor: disabled ? 'default' : 'pointer',
              }}
            />
            <span style={{ color: colors.text, fontSize: '0.9rem' }}>{permission.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
