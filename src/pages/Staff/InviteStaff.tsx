import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaff } from '../../hooks/useStaff';
import { useTheme } from '../../context/ThemeContext';
import { StaffRole, STAFF_ROLES } from '../../types/staff';

export const InviteStaff: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { inviteStaff, loading } = useStaff();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Exclude<StaffRole, 'owner'>>('viewer');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const result = await inviteStaff({
      email,
      role,
      notes: notes || undefined,
    });

    if (result.success) {
      navigate('/staff');
    } else {
      setError(result.message || 'Failed to send invitation');
    }

    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
          Invite Team Member
        </h1>
        <p style={{ color: colors.textMuted }}>
          Add a new member to your vendor team
        </p>
      </div>

      <div
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.border}`,

        }}
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="colleague@example.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
              Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Exclude<StaffRole, 'owner'>)}
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontWeight: 'bold' }}>
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

          <div
            style={{
              backgroundColor: colors.inputBg,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <p style={{ color: colors.textMuted, fontSize: '0.9rem', margin: 0 }}>
              Only users who already have an account can be invited. New team members will stay pending until they accept the invitation.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/staff')}
              style={{
                backgroundColor: 'transparent',
                color: colors.text,
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
              {submitting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
