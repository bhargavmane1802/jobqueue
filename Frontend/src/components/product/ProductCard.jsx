import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { addToCart } from '../../api/buyer.api'

const PLACEHOLDER_IMAGES = ['🖥️', '📱', '👟', '📷', '🎮', '⌚', '🎧', '💼']

function getEmoji(title = '') {
  const idx = title.length % PLACEHOLDER_IMAGES.length
  return PLACEHOLDER_IMAGES[idx]
}

export default function ProductCard({ product, showAddToCart = true }) {
  const navigate = useNavigate()

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    try {
      await addToCart(product.id, 1)
      toast.success(`${product.title} added to cart!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)

  return (
    <div
      className="product-card fade-in"
      onClick={() => navigate(`/buyer/product/${product.id}`)}
      id={`product-card-${product.id}`}
    >
      <div className="product-card-image">
        {product.product_images?.[0] ? (
          <img src={product.product_images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 56 }}>{getEmoji(product.title)}</span>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-title">{product.title}</div>
        <div className="product-card-desc">{product.description || 'No description available.'}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} fill="var(--warning)" stroke="none" />
          ))}
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
            (4.{Math.floor(Math.random() * 9) + 1})
          </span>
        </div>

        <div className="product-card-footer">
          <div>
            <div className="product-price">{formatPrice(product.price)}</div>
            <div className="product-price-unit text-xs text-muted">
              {product.stock_quantity != null ? `${product.stock_quantity} in stock` : ''}
            </div>
          </div>
          {showAddToCart && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddToCart}
              id={`add-to-cart-${product.id}`}
            >
              <ShoppingCart size={13} />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
