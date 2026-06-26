import { useState } from 'react'
import { Minus, Plus, Trash2, AlertCircle, Loader } from 'lucide-react'
import { updateCartItem, removeCartItem } from '../../api/buyer.api'
import toast from 'react-hot-toast'

const EMOJIS = ['🖥️', '📱', '👟', '📷', '🎮', '⌚', '🎧', '💼']

/**
 * Props:
 *  item             – cart item data from server
 *  onQuantityChange – (productId, newQty) → update parent's items array (for total recalc)
 *  onRemove         – (productId) → remove item from parent's items array
 */
export default function CartItem({ item, onQuantityChange, onRemove }) {
  // Own local quantity state — allows instant optimistic UI update
  const [qty, setQty] = useState(item.quantity)
  const [updating, setUpdating] = useState(false)   // show spinner on +/−
  const [removing, setRemoving] = useState(false)

  const stockAvailable = item.stock_quantity ?? Infinity
  const atMax      = qty >= stockAvailable
  const outOfStock = stockAvailable === 0

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(p)

  // ── Quantity change — optimistic, rolls back on API error ──────────────────
  const handleUpdate = async (newQty) => {
    if (newQty < 1 || updating) return

    // Frontend stock cap
    if (newQty > stockAvailable) {
      toast.error(`Only ${stockAvailable} unit${stockAvailable !== 1 ? 's' : ''} available`)
      return
    }

    const prevQty = qty

    // 1. Update local state immediately (no waiting for server)
    setQty(newQty)
    onQuantityChange(item.product_id, newQty)   // → parent recalculates total

    setUpdating(true)
    try {
      await updateCartItem(item.product_id, newQty)
      // Server confirmed — nothing more to do
    } catch (err) {
      // Roll back on error
      setQty(prevQty)
      onQuantityChange(item.product_id, prevQty)
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  // ── Remove — optimistic: remove from parent immediately ───────────────────
  const handleRemove = async () => {
    setRemoving(true)
    // Optimistically remove from parent so the row disappears instantly
    onRemove(item.product_id)
    try {
      await removeCartItem(item.product_id)
      toast.success('Item removed')
    } catch (err) {
      // If server fails, we can't easily undo without re-fetching,
      // so just show the error — user can refresh
      toast.error(err.response?.data?.message || 'Remove failed — please refresh')
    }
    // No need to setRemoving(false); the component will be unmounted
  }

  const emoji = EMOJIS[item.product_id % EMOJIS.length]
  const lineTotal = item.price * qty

  return (
    <div
      className="cart-item"
      id={`cart-item-${item.product_id}`}
      style={{ opacity: outOfStock ? 0.55 : 1, transition: 'opacity 0.2s' }}
    >
      {/* Image */}
      <div className="cart-item-image">
        {item.product_images?.[0]
          ? <img src={item.product_images[0]} alt={item.title} />
          : <span>{emoji}</span>
        }
      </div>

      {/* Info */}
      <div className="cart-item-info">
        <div>
          <div className="cart-item-title">{item.title}</div>
          <div className="cart-item-price">{formatPrice(item.price)} each</div>

          {/* Stock badges — only shown when relevant */}
          {outOfStock && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              marginTop: '4px', fontSize: '11px', color: 'var(--danger)',
              background: 'var(--danger-bg)', padding: '2px 8px', borderRadius: '999px',
            }}>
              <AlertCircle size={10} /> Out of stock — remove to proceed
            </div>
          )}
          {!outOfStock && atMax && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              marginTop: '4px', fontSize: '11px', color: 'var(--warning)',
              background: 'var(--warning-bg)', padding: '2px 8px', borderRadius: '999px',
            }}>
              <AlertCircle size={10} /> Max available: {stockAvailable}
            </div>
          )}
        </div>

        <div className="cart-item-actions">
          {/* Quantity stepper */}
          <div className="qty-stepper" style={{ position: 'relative' }}>
            <button
              className="qty-btn"
              onClick={() => handleUpdate(qty - 1)}
              disabled={qty <= 1 || updating || outOfStock}
              id={`cart-decrease-${item.product_id}`}
            >
              <Minus size={13} />
            </button>

            {/* Show spinner overlay while updating, but keep the number visible */}
            <span className="qty-value" style={{ minWidth: '28px', textAlign: 'center', position: 'relative' }}>
              {updating
                ? <Loader size={13} style={{ animation: 'spin 0.6s linear infinite', verticalAlign: 'middle' }} />
                : qty
              }
            </span>

            <button
              className="qty-btn"
              onClick={() => handleUpdate(qty + 1)}
              disabled={atMax || outOfStock || updating}
              id={`cart-increase-${item.product_id}`}
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Line total + remove */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontWeight: 700, color: 'var(--accent-light)', fontSize: '15px',
              minWidth: '80px', textAlign: 'right',
              transition: 'opacity 0.15s',
              opacity: updating ? 0.5 : 1,
            }}>
              {formatPrice(lineTotal)}
            </span>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleRemove}
              disabled={removing}
              id={`cart-remove-${item.product_id}`}
            >
              {removing
                ? <Loader size={13} style={{ animation: 'spin 0.6s linear infinite' }} />
                : <Trash2 size={13} />
              }
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
