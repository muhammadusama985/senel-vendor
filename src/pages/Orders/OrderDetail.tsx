import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useTheme } from '../../context/ThemeContext';
import { OrderStatusBadge } from './components/OrderStatusBadge';
import { OrderTimeline } from './components/OrderTimeline';
import { VendorOrder } from '../../types/order';
import { formatCurrency } from '../../utils/formatters';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { getOrder, acceptOrder, markPacked, markReadyForPickup, printLabel } = useOrders();
  
  const [order, setOrder] = useState<VendorOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [packages, setPackages] = useState([{ boxIndex: 1, weightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0 }]);

  useEffect(() => {
    const loadOrder = async () => {
      if (id) {
        const data = await getOrder(id);
        setOrder(data);
      }
      setLoading(false);
    };
    loadOrder();
  }, [id, getOrder]);

  const handleAccept = async () => {
    if (!id) return;
    setActionLoading('accept');
    const success = await acceptOrder(id);
    if (success) {
      const updated = await getOrder(id);
      setOrder(updated);
    }
    setActionLoading(null);
  };

  const handlePack = async () => {
    if (!id) return;
    setActionLoading('pack');
    const success = await markPacked(id);
    if (success) {
      const updated = await getOrder(id);
      setOrder(updated);
    }
    setActionLoading(null);
  };

  const handleReadyForPickup = async () => {
    if (!id) return;
    setActionLoading('ready');
    
    const data = {
      boxCount: packages.length,
      packages: packages,
      handoverNote: 'Ready for pickup',
    };
    
    const success = await markReadyForPickup(id, data);
    if (success) {
      const updated = await getOrder(id);
      setOrder(updated);
      setShowPickupModal(false);
    }
    setActionLoading(null);
  };

  const handlePrintLabel = async () => {
    if (!id) return;
    await printLabel(id);
  };

  const addPackage = () => {
    setPackages([
      ...packages,
      { 
        boxIndex: packages.length + 1, 
        weightKg: 0, 
        lengthCm: 0, 
        widthCm: 0, 
        heightCm: 0 
      }
    ]);
  };

  const updatePackage = (index: number, field: string, value: number) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  const removePackage = (index: number) => {
    if (packages.length <= 1) return;
    const updated = packages.filter((_, i) => i !== index);
    updated.forEach((pkg, i) => { pkg.boxIndex = i + 1; });
    setPackages(updated);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: '#ffffff' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.75)' }}>
        Order not found
      </div>
    );
  }

  const canAccept = order.status === 'placed';
  const canPack = order.status === 'accepted';
  const canReady = order.status === 'packed';
  const canPrint = order.status === 'ready_pickup' || order.status === 'shipped' || order.status === 'delivered';

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h1 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 'bold' }}>
            Order {order.vendorOrderNumber}
          </h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <OrderStatusBadge status={order.status} />
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {canAccept && (
            <button
              onClick={handleAccept}
              disabled={actionLoading === 'accept'}
              style={{
                backgroundColor: colors.accentGreen,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: actionLoading === 'accept' ? 'not-allowed' : 'pointer',
                opacity: actionLoading === 'accept' ? 0.7 : 1,
                fontWeight: 'bold',
              }}
            >
              {actionLoading === 'accept' ? 'Accepting...' : 'Accept Order'}
            </button>
          )}
          {canPack && (
            <button
              onClick={handlePack}
              disabled={actionLoading === 'pack'}
              style={{
                backgroundColor: colors.accentBlue,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: actionLoading === 'pack' ? 'not-allowed' : 'pointer',
                opacity: actionLoading === 'pack' ? 0.7 : 1,
                fontWeight: 'bold',
              }}
            >
              {actionLoading === 'pack' ? 'Packing...' : 'Mark Packed'}
            </button>
          )}
          {canReady && (
            <button
              onClick={() => setShowPickupModal(true)}
              disabled={actionLoading === 'ready'}
              style={{
                backgroundColor: colors.accentGold,
                color: colors.primary,
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: actionLoading === 'ready' ? 'not-allowed' : 'pointer',
                opacity: actionLoading === 'ready' ? 0.7 : 1,
                fontWeight: 'bold',
              }}
            >
              Ready for Pickup
            </button>
          )}
          {canPrint && (
            <button
              onClick={handlePrintLabel}
              style={{
                backgroundColor: colors.accentPurple,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Print Label
            </button>
          )}
          <button
            onClick={() => navigate('/orders')}
            style={{
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div
        style={{
          background: `
            linear-gradient(
              145deg,
              #0D1A63 0%,
              #12227a 40%,
              #0D1A63 100%
            )
          `,
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.15),
            0 6px 18px rgba(0,0,0,0.35)
          `,
          marginBottom: '2rem'
        }}
      >
        <OrderTimeline
          status={order.status}
          createdAt={order.createdAt}
          acceptedAt={order.shipping?.shippedAt}
          packedAt={order.shippingPrep?.readyForPickupAt}
          readyAt={order.readyForPickupAt}
          shippedAt={order.shipping?.shippedAt}
          deliveredAt={order.deliveredAt}
        />
      </div>

      {/* Order Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Items */}
        <div
          style={{
            background: `
              linear-gradient(
                145deg,
                #0D1A63 0%,
                #12227a 40%,
                #0D1A63 100%
              )
            `,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.15),
              0 6px 18px rgba(0,0,0,0.35)
            `
          }}
        >
          <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Items</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: 'rgba(255,255,255,0.75)' }}>Product</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255,255,255,0.75)' }}>Qty</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'rgba(255,255,255,0.75)' }}>Unit Price</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'rgba(255,255,255,0.75)' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item._id} style={{ borderBottom: `1px solid rgba(255,255,255,0.10)` }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#ffffff' }}>{item.title}</div>
                        {item.variantSku && (
                          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                            SKU: {item.variantSku}
                          </div>
                        )}
                        {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                            {Object.entries(item.variantAttributes).map(([key, value]) => (
                              <span key={key}>{key}: {value} </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', color: '#ffffff' }}>
                    {item.qty}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#ffffff' }}>
                    {formatCurrency(item.unitPrice, item.currency || order.currency)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#ffffff', fontWeight: 'bold' }}>
                    {formatCurrency(item.lineTotal, item.currency || order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ padding: '0.75rem', textAlign: 'right', color: 'rgba(255,255,255,0.75)' }}>
                  Subtotal:
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#ffffff', fontWeight: 'bold' }}>
                  {formatCurrency(order.subtotal, order.currency)}
                </td>
              </tr>
              {order.discountTotal > 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '0.75rem', textAlign: 'right', color: 'rgba(255,255,255,0.75)' }}>
                    Discount:
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: colors.accentRed, fontWeight: 'bold' }}>
                    -{formatCurrency(order.discountTotal, order.currency)}
                  </td>
                </tr>
              )}
              {order.shippingTotal > 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '0.75rem', textAlign: 'right', color: 'rgba(255,255,255,0.75)' }}>
                    Shipping:
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#ffffff', fontWeight: 'bold' }}>
                    {formatCurrency(order.shippingTotal, order.currency)}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={3} style={{ padding: '0.75rem', textAlign: 'right', color: '#ffffff', fontWeight: 'bold' }}>
                  Total:
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#ffd43b', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {formatCurrency(order.grandTotal, order.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Order Information */}
        <div>
          {/* Customer Info */}
          <div
            style={{
              background: `
                linear-gradient(
                  145deg,
                  #0D1A63 0%,
                  #12227a 40%,
                  #0D1A63 100%
                )
              `,
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.15),
                0 6px 18px rgba(0,0,0,0.35)
              `,
              marginBottom: '1rem'
            }}
          >
            <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Order Information</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>
                Order Number
              </div>
              <div style={{ fontWeight: 'bold', color: '#ffffff' }}>
                {order.vendorOrderNumber}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>
                Payment Status
              </div>
              <div>
                <span style={{
                  backgroundColor: order.paymentStatus === 'paid' ? colors.accentGreen + '20' : colors.accentOrange + '20',
                  color: order.paymentStatus === 'paid' ? colors.accentGreen : colors.accentOrange,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                }}>
                  {order.paymentStatus?.toUpperCase()}
                </span>
              </div>
            </div>

            {order.boxCount && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>
                  Box Count
                </div>
                <div style={{ fontWeight: 'bold', color: '#ffffff' }}>
                  {order.boxCount} boxes
                </div>
              </div>
            )}

            {order.handoverNote && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>
                  Handover Note
                </div>
                <div style={{ color: '#ffffff', fontStyle: 'italic' }}>
                  {order.handoverNote}
                </div>
              </div>
            )}

            {order.tracking?.trackingNumber && (
              <div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>
                  Tracking
                </div>
                <div style={{ color: '#ffffff' }}>
                  {order.tracking.carrier}: {order.tracking.trackingNumber}
                  {order.tracking.trackingUrl && (
                    <a
                      href={order.tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginLeft: '0.5rem', color: '#91c9ff' }}
                    >
                      Track
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shipping Info */}
          {order.shippingPrep && (order.shippingPrep.weightKg || order.shippingPrep.boxCount) && (
            <div
              style={{
                background: `
                  linear-gradient(
                    145deg,
                    #0D1A63 0%,
                    #12227a 40%,
                    #0D1A63 100%
                  )
                `,
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.15),
                  0 6px 18px rgba(0,0,0,0.35)
                `
              }}
            >
              <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Shipping Details</h3>
              
              {order.shippingPrep.weightKg && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.75)' }}>Weight: </span>
                  <span style={{ fontWeight: 'bold', color: '#ffffff' }}>{order.shippingPrep.weightKg} kg</span>
                </div>
              )}
              
              {order.shippingPrep.lengthCm && order.shippingPrep.widthCm && order.shippingPrep.heightCm && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.75)' }}>Dimensions: </span>
                  <span style={{ fontWeight: 'bold', color: '#ffffff' }}>
                    {order.shippingPrep.lengthCm} × {order.shippingPrep.widthCm} × {order.shippingPrep.heightCm} cm
                  </span>
                </div>
              )}
              
              {order.shippingPrep.boxCount && (
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.75)' }}>Boxes: </span>
                  <span style={{ fontWeight: 'bold', color: '#ffffff' }}>{order.shippingPrep.boxCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pickup Modal */}
      {showPickupModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div
            style={{
              background: `
                linear-gradient(
                  145deg,
                  #0D1A63 0%,
                  #12227a 40%,
                  #0D1A63 100%
                )
              `,
              borderRadius: '12px',
              padding: '2rem',
              width: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.15),
                0 8px 24px rgba(0,0,0,0.4)
              `,
            }}
          >
            <h2 style={{ color: '#ffffff', marginBottom: '1.5rem' }}>
              Mark Ready for Pickup
            </h2>

            {/* Packages */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ffffff', fontWeight: 'bold' }}>
                Package Details
              </label>
              
              {packages.map((pkg, index) => (
                <div
                  key={index}
                  style={{
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: '#ffffff' }}>Box {pkg.boxIndex}</h4>
                    <button
                      onClick={() => removePackage(index)}
                      style={{
                        backgroundColor: 'transparent',
                        color: colors.accentRed,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={pkg.weightKg || ''}
                      onChange={(e) => updatePackage(index, 'weightKg', parseFloat(e.target.value) || 0)}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Length (cm)"
                      value={pkg.lengthCm || ''}
                      onChange={(e) => updatePackage(index, 'lengthCm', parseFloat(e.target.value) || 0)}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Width (cm)"
                      value={pkg.widthCm || ''}
                      onChange={(e) => updatePackage(index, 'widthCm', parseFloat(e.target.value) || 0)}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Height (cm)"
                      value={pkg.heightCm || ''}
                      onChange={(e) => updatePackage(index, 'heightCm', parseFloat(e.target.value) || 0)}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                      }}
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addPackage}
                style={{
                  backgroundColor: 'transparent',
                  color: '#91c9ff',
                  border: `1px dashed #91c9ff`,
                  borderRadius: '4px',
                  padding: '0.5rem',
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                + Add Another Box
              </button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setShowPickupModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '4px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReadyForPickup}
                disabled={actionLoading === 'ready'}
                style={{
                  backgroundColor: colors.accentGold,
                  color: colors.primary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.75rem 1.5rem',
                  cursor: actionLoading === 'ready' ? 'not-allowed' : 'pointer',
                  opacity: actionLoading === 'ready' ? 0.7 : 1,
                  fontWeight: 'bold',
                }}
              >
                {actionLoading === 'ready' ? 'Processing...' : 'Confirm Ready for Pickup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
