import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import { useTheme } from '../../context/ThemeContext';
import { TicketStatusBadge } from './components/TicketStatusBadge';
import { TicketPriorityBadge } from './components/TicketPriorityBadge';
import { MessageThread } from './components/MessageThread';

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentTicket,
    messages,
    messagesLoading,
    getTicket,
    getMessages,
    addMessage,
    updateTicketStatus,
    formatDate,
  } = useTickets();

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (id) {
      getTicket(id);
      getMessages(id);
    }
  }, [id, getTicket, getMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;

    setSending(true);
    const ok = await addMessage(id, { message: newMessage });
    if (ok) setNewMessage('');
    setSending(false);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    await updateTicketStatus(id, status);
  };

  if (!currentTicket) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: colors.text }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div style={{ color: colors.text }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
              Ticket #{currentTicket.ticketNumber}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <TicketStatusBadge status={currentTicket.status} />
              <TicketPriorityBadge priority={currentTicket.priority} />
              <span style={{ color: colors.textMuted }}>
                Created: {formatDate(currentTicket.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/support')}
            style={{
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
            }}
          >
            Back to List
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
        <div>
          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              marginBottom: '2rem',
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>Ticket Details</h3>
            <p style={{ color: colors.text, lineHeight: '1.6' }}>{currentTicket.description}</p>

            {currentTicket.attachments && currentTicket.attachments.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ color: colors.text, marginBottom: '0.5rem' }}>Attachments</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {currentTicket.attachments.map((att, index) => (
                    <a
                      key={index}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px',
                        color: colors.text,
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                      }}
                    >
                      📎 {att.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>Conversation</h3>

            <MessageThread
              messages={messages}
              loading={messagesLoading}
              formatDate={formatDate}
            />

            <div style={{ marginTop: '2rem' }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  resize: 'vertical',
                  marginBottom: '1rem',
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  style={{
                    background: colors.buttonGradient,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 2rem',
                    fontWeight: 'bold',
                    cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    opacity: sending || !newMessage.trim() ? 0.7 : 1,
                  }}
                >
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              marginBottom: '1rem',
              border: `1px solid ${colors.border}`,
            }}
          >
            <h4 style={{ color: colors.text, marginBottom: '1rem' }}>Update Status</h4>
            <select
              value={currentTicket.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.text,
              }}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <h4 style={{ color: colors.text, marginBottom: '1rem' }}>Ticket Information</h4>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>Category</div>
              <div style={{ fontWeight: 'bold', color: colors.text }}>{currentTicket.category}</div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>Priority</div>
              <div><TicketPriorityBadge priority={currentTicket.priority} /></div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>Created At</div>
              <div style={{ color: colors.text }}>{formatDate(currentTicket.createdAt)}</div>
            </div>

            {currentTicket.resolvedAt && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>Resolved At</div>
                <div style={{ color: colors.text }}>{formatDate(currentTicket.resolvedAt)}</div>
              </div>
            )}

            {currentTicket.closedAt && (
              <div>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>Closed At</div>
                <div style={{ color: colors.text }}>{formatDate(currentTicket.closedAt)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
