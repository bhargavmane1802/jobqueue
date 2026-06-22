import { useState } from 'react'
import { Package, Clock, XCircle, Loader, Ban } from 'lucide-react'
import toast from 'react-hot-toast'
import { cancelOrder } from '../../api/buyer.api'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    cls: 'badge-pending',    icon: <Clock size={10} />,   canCancel: true  },
  paid:       { label: 'Paid',       cls: 'badge-paid',       icon: <Package size={10} />, canCancel: false },
  completed:  { label: 'Completed',  cls: 'badge-completed',  icon: <Package size={10} />, canCancel: false },
  cancelling: { label: 'Cancelling', cls: 'badge-cancelling', icon: <Loader size={10} />,  canCancel: false },
  cancelled:  { label: 'Cancelled',  cls: 'badge-cancelled',  icon: <Ban size={10} />,     canCancel: false },
  failed:     { label: 'Failed',     cls: 'badge-failed',     icon: <XCircle size={10} />, canCancel: false },
}

export default function OrderCard({ order, onRefresh }) {
  const [cancelling, setCancelling] = useState(false)

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p)

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order? Reserved stock will be released.')) return
    setCancelling(true)
    try {
      await cancelOrder(order.orderid)
      toast.success('Order cancellation queued. Stock will be released shortly.')
      onRefresh?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="order-card fade-in" id={`order-card-${order.orderid}`}>
      {/* Header */}
      <div className="order-card-header">
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Order
          </div>
          <div className="order-id">#{String(order.orderid).padStart(6, '0')}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`badge ${cfg.cls}`}>
            {cfg.icon}
            {cfg.label}
          </span>

          {/* Cancel button — only for cancellable statuses */}
          {cfg.canCancel && onRefresh && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleCancel}
              disabled={cancelling}
              id={`cancel-order-${order.orderid}`}
              style={{ padding: '5px 12px' }}
            >
              {cancelling ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: 12, height: 12,
                    border: '1.5px solid rgba(239,68,68,0.3)',
                    borderTopColor: 'var(--danger)', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  Cancelling...
                </span>
              ) : (
                <>
                  <XCircle size={12} />
                  Cancel
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="order-items-list">
        {order.items?.map((item, idx) => (
          <div className="order-item-row" key={idx}>
            <span style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
            <span style={{
              fontSize: '12px', color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.04)',
              padding: '2px 8px', borderRadius: '999px',
            }}>
              × {item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="order-total">
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px' }}>Total</span>
        <span style={{
          color: order.status === 'cancelled' ? 'var(--text-muted)' : 'var(--accent-light)',
          fontSize: '18px',
          textDecoration: order.status === 'cancelled' ? 'line-through' : 'none',
        }}>
          {formatPrice(order.total_cost)}
        </span>
      </div>

      {/* Cancelling info strip */}
      {order.status === 'cancelling' && (
        <div style={{
          marginTop: '12px', padding: '10px 14px',
          background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.15)',
          borderRadius: '10px', fontSize: '12px', color: '#fb923c',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
          Stock revert in progress via job queue. This will complete shortly.
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
