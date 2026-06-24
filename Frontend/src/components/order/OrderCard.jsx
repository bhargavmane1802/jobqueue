import { useState } from 'react'
import {
  Package, Clock, XCircle, Loader, Ban,
  CreditCard, ExternalLink, Truck, CheckCircle, RefreshCcw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cancelOrder, retryPayment } from '../../api/buyer.api'

// ── Status display config ────────────────────────────────────────────────────
const ORDER_STATUS = {
  payment:    { label: 'Awaiting Payment', cls: 'badge-pending',    icon: <CreditCard size={10} /> },
  shipment:   { label: 'Shipped',          cls: 'badge-paid',       icon: <Truck size={10} />     },
  completed:  { label: 'Completed',        cls: 'badge-completed',  icon: <CheckCircle size={10} /> },
  refunded:   { label: 'Refunded',         cls: 'badge-paid',       icon: <RefreshCcw size={10} /> },
  cancelling: { label: 'Cancelling',       cls: 'badge-cancelling', icon: <Loader size={10} />    },
  cancelled:  { label: 'Cancelled',        cls: 'badge-cancelled',  icon: <Ban size={10} />       },
  // fallback
  pending:    { label: 'Pending',          cls: 'badge-pending',    icon: <Clock size={10} />     },
}

const PAYMENT_STATUS = {
  pending:  { label: 'Payment Pending', cls: 'badge-pending'   },
  paid:     { label: 'Paid',            cls: 'badge-completed' },
  refunded: { label: 'Refunded',        cls: 'badge-failed'    },
}

export default function OrderCard({ order, onRefresh }) {
  const [cancelling, setCancelling] = useState(false)
  const [paying, setPaying] = useState(false)

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(p)

  const orderCfg  = ORDER_STATUS[order.status]   || ORDER_STATUS.pending
  const paymentCfg = PAYMENT_STATUS[order.payment_status]

  // ── Cancel handler ─────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!window.confirm('Cancel this order? Reserved stock will be released automatically.')) return
    setCancelling(true)
    try {
      await cancelOrder(order.orderid)
      toast.success('Cancellation queued. Stock will be released shortly.')
      onRefresh?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  // ── Retry Payment handler ──────────────────────────────────────────────────
  const handlePay = async () => {
    setPaying(true)
    const loadingToast = toast.loading('Creating payment session...')
    try {
      const { data } = await retryPayment(order.orderid)
      toast.dismiss(loadingToast)
      if (data.checkoutUrl) {
        toast.success('Redirecting to payment...')
        setTimeout(() => { window.location.href = data.checkoutUrl }, 600)
      } else {
        toast.error('Could not get payment link')
      }
    } catch (err) {
      toast.dismiss(loadingToast)
      toast.error(err.response?.data?.message || 'Payment session creation failed')
    } finally {
      setPaying(false)
    }
  }

  // ── Decide which action button to show ────────────────────────────────────
  //   • payment_status=pending → "Complete Payment" button
  //   • order.status=shipment AND payment_status=paid → "Cancel" button
  //   • anything else → no action button
  const showPayButton    = order.payment_status === 'pending'
  const showCancelButton = order.status === 'shipment' && order.payment_status === 'paid'

  const isStruck = ['cancelled', 'refunded'].includes(order.status)

  return (
    <div className="order-card fade-in" id={`order-card-${order.orderid}`}>

      {/* ── Header ── */}
      <div className="order-card-header">
        <div>
          <div style={{
            fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px',
            textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
          }}>
            Order
          </div>
          <div className="order-id">#{String(order.orderid).padStart(6, '0')}</div>
        </div>

        {/* Status badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className={`badge ${orderCfg.cls}`}>
            {orderCfg.icon}
            {orderCfg.label}
          </span>
          {paymentCfg && (
            <span className={`badge ${paymentCfg.cls}`} style={{ fontSize: '10px', opacity: 0.85 }}>
              {paymentCfg.label}
            </span>
          )}
        </div>
      </div>

      {/* ── Items ── */}
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

      {/* ── Total + Action ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
        {/* Total */}
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Total</span>
          <span style={{
            color: isStruck ? 'var(--text-muted)' : 'var(--accent-light)',
            fontSize: '20px', fontWeight: 800,
            textDecoration: isStruck ? 'line-through' : 'none',
          }}>
            {formatPrice(order.total_cost)}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* COMPLETE PAYMENT — payment_status = pending */}
          {showPayButton && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePay}
              disabled={paying}
              id={`pay-order-${order.orderid}`}
              style={{ padding: '8px 16px' }}
            >
              {paying ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: 12, height: 12,
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  Opening...
                </span>
              ) : (
                <>
                  <CreditCard size={13} />
                  Complete Payment
                  <ExternalLink size={11} style={{ opacity: 0.7 }} />
                </>
              )}
            </button>
          )}

          {/* CANCEL — order.status = shipment + payment paid */}
          {showCancelButton && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleCancel}
              disabled={cancelling}
              id={`cancel-order-${order.orderid}`}
              style={{ padding: '8px 16px' }}
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
                  <XCircle size={13} />
                  Cancel Order
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Info strips for special states ── */}
      {order.status === 'cancelling' && (
        <div style={{
          marginTop: '12px', padding: '10px 14px',
          background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.15)',
          borderRadius: '10px', fontSize: '12px', color: '#fb923c',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Loader size={12} style={{ animation: 'spin 1.2s linear infinite', flexShrink: 0 }} />
          Cancellation in progress — stock is being reverted via job queue.
        </div>
      )}

      {order.payment_status === 'pending' && order.status === 'payment' && (
        <div style={{
          marginTop: '12px', padding: '10px 14px',
          background: 'rgba(124,92,252,0.06)', border: '1px solid var(--border-accent)',
          borderRadius: '10px', fontSize: '12px', color: 'var(--text-muted)',
        }}>
          ⚡ Stock is reserved for your order. Complete payment to confirm.
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
