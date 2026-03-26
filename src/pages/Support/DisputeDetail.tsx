import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisputes } from '../../hooks/useDisputes';
import { useTheme } from '../../context/ThemeContext';

export const DisputeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { 
    currentDispute, 
    messages, 
    messagesLoading,
    getDispute, 
    getMessages, 
    addMessage,
    getStatusColor,
    getReasonIcon,
    formatDate 
  } = useDisputes();

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      getDispute(id);
      getMessages(id);
    }
  }, [id, getDispute, getMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;
    
    setSending(true);
    await addMessage(id, newMessage);
    setNewMessage('');
    setSending(false);
  };

  if (!currentDispute) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: colors.text, fontSize: '2rem', fontWeight: 'bold' }}>
              Dispute #{currentDispute.disputeNumber}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <span
                style={{
                  backgroundColor: getStatusColor(currentDispute.status) + '20',
                  color: getStatusColor(currentDispute.status),
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                }}
              >
                {currentDispute.status.replace('_', ' ')}
              </span>
              <span style={{ color: colors.textMuted }}>
                Created: {formatDate(currentDispute.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/support/disputes')}
            style={{
              backgroundColor: 'transparent',
              color: colors.textMuted,
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
        {/* Main Content - Messages */}
        <div>
          {/* Original Dispute */}
          <div style={{ 
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px', 
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{getReasonIcon(currentDispute.reason)}</span>
              <h3 style={{ color: colors.text }}>{currentDispute.subject}</h3>
            </div>
            <p style={{ color: colors.text, lineHeight: '1.6' }}>{currentDispute.description}</p>
            
            {currentDispute.attachments && currentDispute.attachments.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ color: colors.text, marginBottom: '0.5rem' }}>Attachments</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {currentDispute.attachments.map((att, index) => (
                    <a
                      key={index}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: colors.inputBg,
                        borderRadius: '4px',
                        color: colors.accentBlue,
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

          {/* Message Thread */}
          <div style={{ 
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px', 
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}>
            <h3 style={{ color: colors.text, marginBottom: '1.5rem' }}>Conversation</h3>
            
            {messagesLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="loading-spinner" style={{ width: '30px', height: '30px', margin: '0 auto' }} />
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: colors.textMuted }}>
                No messages yet. Reply to start the conversation.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.senderRole === 'vendor' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{ marginBottom: '0.25rem', fontSize: '0.85rem', color: colors.textMuted }}>
                      {msg.senderRole === 'vendor' ? 'You' : msg.senderRole === 'admin' ? 'Admin' : 'Customer'}
                    </div>
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '1rem',
                        borderRadius: '12px',
                        backgroundColor:
                          msg.senderRole === 'vendor'
                            ? `${colors.accentGold}20`
                            : msg.senderRole === 'admin'
                              ? `${colors.accentBlue}15`
                              : colors.inputBg,
                        borderBottomRightRadius: msg.senderRole === 'vendor' ? '4px' : '12px',
                        borderBottomLeftRadius: msg.senderRole === 'vendor' ? '12px' : '4px',
                      }}
                    >
                      <p style={{ margin: 0, color: colors.text }}>{msg.message}</p>
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
                                color: colors.accentBlue,
                                textDecoration: 'none',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: colors.inputBg,
                                borderRadius: '4px',
                              }}
                            >
                              📎 {att.filename}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: colors.textMuted }}>
                      {formatDate(msg.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Box */}
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
                    cursor: (sending || !newMessage.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (sending || !newMessage.trim()) ? 0.7 : 1,
                  }}
                >
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ 
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}>
            <h4 style={{ color: colors.text, marginBottom: '1rem' }}>Dispute Information</h4>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>Reason</div>
              <div style={{ fontWeight: 'bold', color: colors.text }}>
                {currentDispute.reason.replace('_', ' ')}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>Order</div>
              <div style={{ fontWeight: 'bold', color: colors.text }}>
                {currentDispute.orderId}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>Last Activity</div>
              <div style={{ color: colors.text }}>
                {currentDispute.lastMessageAt ? formatDate(currentDispute.lastMessageAt) : '-'}
              </div>
            </div>

            {currentDispute.resolvedAt && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>Resolved At</div>
                <div style={{ color: colors.text }}>{formatDate(currentDispute.resolvedAt)}</div>
              </div>
            )}

            {currentDispute.closedAt && (
              <div>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted, marginBottom: '0.25rem' }}>Closed At</div>
                <div style={{ color: colors.text }}>{formatDate(currentDispute.closedAt)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
