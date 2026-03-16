import React from 'react';
import { TicketMessage } from '../../../types/ticket';

interface MessageThreadProps {
  messages: TicketMessage[];
  loading: boolean;
  formatDate: (date: string) => string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  loading,
  formatDate,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
        <div className="loading-spinner" style={{ width: '30px', height: '30px', margin: '0 auto' }} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#d1d5db' }}>
        No messages yet. Start the conversation!
      </div>
    );
  }

  const getMessageStyle = (role: string) => {
    const isVendor = role === 'vendor' || role === 'staff';
    return {
      backgroundColor: isVendor ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
      borderBottomRightRadius: isVendor ? '4px' : '12px',
      borderBottomLeftRadius: isVendor ? '12px' : '4px',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {messages.map((msg) => {
        const isVendor = msg.userRole === 'vendor' || msg.userRole === 'staff';

        return (
          <div
            key={msg._id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isVendor ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{ marginBottom: '0.25rem', fontSize: '0.85rem', color: '#d1d5db' }}>
              {isVendor ? 'You' : msg.userRole === 'admin' ? 'Support Team' : 'System'}
              {msg.isInternal && (
                <span
                  style={{
                    marginLeft: '0.5rem',
                    backgroundColor: 'rgba(251,191,36,0.2)',
                    color: '#fbbf24',
                    padding: '0.1rem 0.25rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}
                >
                  INTERNAL
                </span>
              )}
            </div>

            <div
              style={{
                maxWidth: '80%',
                padding: '1rem',
                borderRadius: '12px',
                color: 'white',
                ...getMessageStyle(msg.userRole),
              }}
            >
              <p style={{ margin: 0, color: 'white', whiteSpace: 'pre-wrap' }}>
                {msg.message}
              </p>

              {msg.attachments && msg.attachments.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {msg.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.85rem',
                        color: 'white',
                        textDecoration: 'none',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '4px',
                      }}
                    >
                      📎 {att.filename}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#9ca3af' }}>
              {formatDate(msg.createdAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
};