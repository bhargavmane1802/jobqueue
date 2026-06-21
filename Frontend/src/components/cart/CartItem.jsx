import { Minus, Plus, Trash2 } from 'lucide-react'
import { updateCartItem, removeCartItem } from '../../api/buyer.api'
import toast from 'react-hot-toast'

const EMOJIS = ['🖥️', '📱', '👟', '📷', '🎮', '⌚', '🎧', '💼']

export default function CartItem({ item, onRefresh }) {
  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p)

  const handleUpdate = async (newQty) => {
    if (newQty < 1) return
    try {
      await updateCartItem(item.product_id, newQty)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const handleRemove = async () => {
    try {
      await removeCartItem(item.product_id)
      toast.success('Item removed from cart')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Remove failed')
    }
  }

  const emoji = EMOJIS[item.product_id % EMOJIS.length]

  return (
    <div className="cart-item" id={`cart-item-${item.product_id}`}>
      <div className="cart-item-image">
        {item.product_images?.[0] ? (
          <img src={item.product_images[0]} alt={item.title} />
        ) : (
          <span>{emoji}</span>
        )}
      </div>

      <div className="cart-item-info">
        <div>
          <div className="cart-item-title">{item.title}</div>
          <div className="cart-item-price">{formatPrice(item.price)} each</div>
        </div>

        <div className="cart-item-actions">
          <div className="qty-stepper">
            <button
              className="qty-btn"
              onClick={() => handleUpdate(item.quantity - 1)}
              id={`cart-decrease-${item.product_id}`}
            >
              <Minus size={13} />
            </button>
            <span className="qty-value">{item.quantity}</span>
            <button
              className="qty-btn"
              onClick={() => handleUpdate(item.quantity + 1)}
              id={`cart-increase-${item.product_id}`}
            >
              <Plus size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 700, color: 'var(--accent-light)', fontSize: '15px' }}>
              {formatPrice(item.item_total)}
            </span>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleRemove}
              id={`cart-remove-${item.product_id}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
