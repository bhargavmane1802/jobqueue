import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Package, Star, Zap, CreditCard, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import BuyerNavbar from '../../components/layout/BuyerNavbar'
import { getProductDetail, addToCart, buySingleProduct } from '../../api/buyer.api'

const EMOJIS = ['🖥️', '📱', '👟', '📷', '🎮', '⌚', '🎧', '💼']

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

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

  const handleBuyNow = async () => {
    if (product?.stock_quantity <= 0) {
      toast.error('This product is out of stock')
      return
    }
    setBuying(true)
    const loadingToast = toast.loading('Reserving stock & creating order...')
    try {
      const { data } = await buySingleProduct(product.id, quantity)
      toast.dismiss(loadingToast)
      toast.success('Order created! Redirecting to payment...')
      // Small delay so user sees the toast before redirect
      setTimeout(() => {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          toast.error('Could not get payment URL')
        }
      }, 800)
    } catch (err) {
      toast.dismiss(loadingToast)
      const msg = err.response?.data?.message || 'Purchase failed. Please try again.'
      toast.error(msg)
    } finally {
      setBuying(false)
    }
  }

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p)

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-wrapper">
        <BuyerNavbar />
        <div className="page-content">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '32px' }}>
              <div className="skeleton" style={{ height: '420px', borderRadius: '18px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="skeleton" style={{ height: '36px', width: '80%' }} />
                <div className="skeleton" style={{ height: '44px', width: '50%' }} />
                <div className="skeleton" style={{ height: '80px' }} />
                <div className="skeleton" style={{ height: '52px', borderRadius: '12px' }} />
                <div className="skeleton" style={{ height: '52px', borderRadius: '12px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const emoji = EMOJIS[Number(id) % EMOJIS.length]
  const isOutOfStock = (product?.stock_quantity ?? 0) <= 0

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

            {/* ── Product Image ─────────────────────────────────── */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '18px', height: '420px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '100px',
              overflow: 'hidden', position: 'relative',
            }}>
              {product?.product_images?.[0] ? (
                <img
                  src={product.product_images[0]}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span>{emoji}</span>
              )}
              {isOutOfStock && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '18px',
                }}>
                  <span style={{
                    background: 'var(--danger-bg)', color: 'var(--danger)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    padding: '8px 20px', borderRadius: '999px',
                    fontWeight: 700, fontSize: '14px',
                  }}>
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* ── Product Info ───────────────────────────────────── */}
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Title + Price */}
              <div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="var(--warning)" stroke="none" />
                  ))}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>4.8 (124 reviews)</span>
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '10px' }}>
                  {product?.title}
                </h1>
                <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-light)', letterSpacing: '-0.03em' }}>
                  {formatPrice(product?.price)}
                </div>
              </div>

              {/* Description */}
              <div style={{
                padding: '16px', background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px', border: '1px solid var(--border)',
              }}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
                  {product?.description || 'No description available for this product.'}
                </p>
              </div>

              {/* Stock badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={14} color={isOutOfStock ? 'var(--danger)' : 'var(--success)'} />
                <span style={{
                  fontSize: '13px', fontWeight: 600,
                  color: isOutOfStock ? 'var(--danger)' : 'var(--success)',
                }}>
                  {isOutOfStock ? 'Out of stock' : `${product?.stock_quantity} units in stock`}
                </span>
              </div>

              {/* Quantity stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Qty:</span>
                <div className="qty-stepper">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    id="qty-decrease"
                  >
                    −
                  </button>
                  <span className="qty-value" style={{ padding: '0 12px' }}>{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(product?.stock_quantity || 1, quantity + 1))}
                    disabled={isOutOfStock}
                    id="qty-increase"
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Subtotal: <strong style={{ color: 'var(--text-primary)' }}>
                    {formatPrice((product?.price || 0) * quantity)}
                  </strong>
                </span>
              </div>

              {/* ── Action Buttons ──────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* BUY NOW — calls buySingleItem backend */}
                <button
                  className="btn btn-primary"
                  onClick={handleBuyNow}
                  disabled={buying || adding || isOutOfStock}
                  style={{ width: '100%', padding: '15px', fontSize: '15px', fontWeight: 700 }}
                  id="buy-now-btn"
                >
                  {buying ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: 16, height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }} />
                      Creating order...
                    </span>
                  ) : (
                    <>
                      <Zap size={17} />
                      Buy Now
                      <ExternalLink size={13} style={{ opacity: 0.7 }} />
                    </>
                  )}
                </button>

                {/* ADD TO CART */}
                <button
                  className="btn btn-secondary"
                  onClick={handleAddToCart}
                  disabled={adding || buying || isOutOfStock}
                  style={{ width: '100%', padding: '13px', fontSize: '14px' }}
                  id="add-to-cart-detail"
                >
                  {adding ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: 14, height: 14,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }} />
                      Adding...
                    </span>
                  ) : (
                    <>
                      <ShoppingCart size={15} />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Info strip */}
              <div style={{
                padding: '14px 16px',
                background: 'rgba(124, 92, 252, 0.06)',
                border: '1px solid var(--border-accent)',
                borderRadius: '12px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={13} color="var(--accent-light)" />
                  <span><strong style={{ color: 'var(--accent-light)' }}>Buy Now</strong> — skips cart, reserves stock & goes directly to Stripe.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={13} color="var(--text-muted)" />
                  <span><strong style={{ color: 'var(--text-secondary)' }}>Add to Cart</strong> — save for later and checkout multiple items together.</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
