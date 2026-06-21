import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Package, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import BuyerNavbar from '../../components/layout/BuyerNavbar'
import { getProductDetail, addToCart } from '../../api/buyer.api'

const EMOJIS = ['🖥️', '📱', '👟', '📷', '🎮', '⌚', '🎧', '💼']

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductDetail(id)
        setProduct(data.product || data)
      } catch (err) {
        toast.error('Product not found')
        navigate('/buyer/home')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    setAdding(true)
    try {
      await addToCart(product.id, quantity)
      toast.success(`Added ${quantity}× ${product.title} to cart!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p)

  if (loading) {
    return (
      <div className="page-wrapper">
        <BuyerNavbar />
        <div className="page-content">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '32px' }}>
              <div className="skeleton" style={{ height: '400px', borderRadius: '18px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="skeleton" style={{ height: '36px', width: '80%' }} />
                <div className="skeleton" style={{ height: '20px', width: '60%' }} />
                <div className="skeleton" style={{ height: '80px' }} />
                <div className="skeleton" style={{ height: '48px', borderRadius: '12px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const emoji = EMOJIS[Number(id) % EMOJIS.length]

  return (
    <div className="page-wrapper">
      <BuyerNavbar />

      <div className="page-content">
        <div className="container">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(-1)}
            style={{ marginBottom: '24px' }}
            id="back-btn"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
            {/* Image */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '18px', height: '400px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '100px',
              overflow: 'hidden',
            }}>
              {product?.product_images?.[0] ? (
                <img src={product.product_images[0]} alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{emoji}</span>
              )}
            </div>

            {/* Info */}
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="var(--warning)" stroke="none" />
                  ))}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>4.8 (124 reviews)</span>
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                  {product?.title}
                </h1>
                <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-light)', letterSpacing: '-0.03em' }}>
                  {formatPrice(product?.price)}
                </div>
              </div>

              <div style={{
                padding: '16px', background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px', border: '1px solid var(--border)',
              }}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
                  {product?.description || 'No description available for this product.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={14} color="var(--success)" />
                  <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
                    {product?.stock_quantity || 0} in stock
                  </span>
                </div>
              </div>

              {/* Quantity + Add */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="qty-stepper">
                  <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} id="qty-decrease">
                    −
                  </button>
                  <span className="qty-value" style={{ padding: '0 8px' }}>{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity(quantity + 1)} id="qty-increase">
                    +
                  </button>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleAddToCart}
                  disabled={adding}
                  style={{ flex: 1, padding: '13px' }}
                  id="add-to-cart-detail"
                >
                  <ShoppingCart size={16} />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>

              <div style={{
                padding: '14px 16px',
                background: 'rgba(124, 92, 252, 0.06)',
                border: '1px solid var(--border-accent)',
                borderRadius: '12px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}>
                ⚡ Stock is reserved instantly at checkout. Powered by job queue processing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
