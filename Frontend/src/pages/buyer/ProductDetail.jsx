import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Package, Star, Zap, CreditCard, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import BuyerNavbar from '../../components/layout/BuyerNavbar'
import { getProductDetail, addToCart, buySingleProduct, addComment } from '../../api/buyer.api'
import { useAuth } from '../../context/AuthContext'
const EMOJIS = ['🖥️', '📱', '👟', '📷', '🎮', '⌚', '🎧', '💼']

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductDetail(id)
        setProduct(data.product || data)
        setComments(data.comments?.comments || data.comments || [])
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
    // [Issue 1] Frontend stock validation — don't allow adding more than available stock
    const available = (product?.stock_quantity ?? 0) - (product?.reserved_quantity ?? 0)
    if (quantity > available) {
      toast.error(
        available <= 0
          ? 'This product is out of stock'
          : `Only ${available} unit${available !== 1 ? 's' : ''} available`
      )
      return
    }
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

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!user) {
      toast.error('Please login to add a comment')
      return
    }
    
    setSubmittingComment(true)
    try {
      const { data } = await addComment(product.id, user.id, newComment)
      // Assuming backend returns { result: { text: "...", user_id: "...", ... } }
      const addedComment = data.result || { comment: newComment, text: newComment, user_id: user.id, username: user.username }
      // Push the new comment to the top of the list
      setComments([{ 
        ...addedComment, 
        comment: addedComment.comment || addedComment.text || newComment,
        username: addedComment.username || user.username 
      }, ...comments])
      setNewComment('')
      toast.success('Comment added successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment')
    } finally {
      setSubmittingComment(false)
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

          {/* ── Comments Section ───────────────────────────────────── */}
          <div style={{ marginTop: '72px', borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{ 
                background: 'rgba(124, 92, 252, 0.1)', 
                padding: '10px', 
                borderRadius: '12px',
                display: 'flex'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Reviews & Comments <span style={{ fontSize: '18px', color: 'var(--text-muted)', fontWeight: 500 }}>({comments.length})</span>
              </h2>
            </div>

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              {comments.length > 0 ? (
                comments.map((c, idx) => (
                  <div key={idx} className="fade-in" style={{
                    padding: '24px',
                    background: 'var(--bg-card)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--accent-dark) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: 'white',
                        fontSize: '18px',
                        boxShadow: '0 2px 8px rgba(124, 92, 252, 0.3)',
                        flexShrink: 0
                      }}>
                        {(c.username?.[0] || 'U').toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <h4 style={{ fontWeight: 700, fontSize: '16px', margin: 0 }}>{c.username || 'Anonymous User'}</h4>
                          {/* If backend adds timestamps in future, they can go here */}
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill="var(--warning)" stroke="none" style={{ opacity: 0.8 }} />
                            ))}
                          </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '15px' }}>
                          {c.comment || c.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '48px 24px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '16px',
                  border: '1px dashed var(--border-accent)'
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', opacity: 0.5 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 15h8"></path>
                    <path d="M9 9h.01"></path>
                    <path d="M15 9h.01"></path>
                  </svg>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>No comments yet</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Be the first to share your thoughts about this product!</p>
                </div>
              )}
            </div>
            
            {/* Add Comment Form */}
            <div style={{ 
              background: 'var(--bg-card)', 
              borderRadius: '20px', 
              padding: '32px',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: 'linear-gradient(90deg, var(--accent-light), var(--accent-dark))'
              }} />
              
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Leave your review
              </h3>
              
              <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="What did you like or dislike? How did this product meet your expectations?"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-accent)',
                    borderRadius: '12px',
                    padding: '20px',
                    color: 'var(--text-primary)',
                    minHeight: '120px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: '15px',
                    lineHeight: 1.6,
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onBlur={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.03)'}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Your review will be posted publicly.
                  </span>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={!newComment.trim() || submittingComment}
                    style={{ 
                      padding: '12px 28px',
                      borderRadius: '99px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {submittingComment ? (
                      <>
                        <span style={{
                          width: 14, height: 14,
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white', borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite',
                        }} />
                        Posting...
                      </>
                    ) : (
                      'Post Review'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
