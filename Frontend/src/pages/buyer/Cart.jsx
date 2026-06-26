import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, CreditCard, ExternalLink, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import BuyerNavbar from '../../components/layout/BuyerNavbar'
import CartItem from '../../components/cart/CartItem'
import { getCart, cartToOrder } from '../../api/buyer.api'

export default function Cart() {
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const navigate = useNavigate()

  // ── Total derived from local items state — no separate totalCost state ─────
  // This means it updates instantly whenever qty changes, with zero extra renders
  const totalCost = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  useEffect(() => { fetchCart() }, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const { data } = await getCart()
      setItems(data.rows || [])
    } catch {
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  // ── Called by CartItem when qty changes (optimistic) ──────────────────────
  // Only updates the one item that changed — everything else stays untouched
  const handleQuantityChange = (productId, newQty) => {
    setItems(prev =>
      prev.map(item =>
        item.product_id === productId
          ? { ...item, quantity: newQty }   // mutate only this row
          : item                            // all others pass through unchanged
      )
    )
  }

  // ── Called by CartItem when item is removed ───────────────────────────────
  const handleRemove = (productId) => {
    setItems(prev => prev.filter(item => item.product_id !== productId))
  }

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    setCheckingOut(true)
    try {
      const { data } = await cartToOrder()
      toast.success('Order created! Redirecting to payment...')
      setItems([])   // clear cart immediately
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast.error('Could not create checkout session')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(p)

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-wrapper">
        <BuyerNavbar />
        <div className="page-content">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', marginTop: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
                ))}
              </div>
              <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <BuyerNavbar cartCount={items.length} />

      <div className="page-content">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Your Cart</h1>
            <p className="page-description">
              {items.length} item{items.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><ShoppingCart /></div>
              <div className="empty-state-title">Your cart is empty</div>
              <div className="empty-state-desc">Add some products to get started</div>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/buyer/home')}
                id="go-shopping-btn"
              >
                <ShoppingBag size={16} />
                Start Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>

              {/* ── Item list ───────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.map(item => (
                  <CartItem
                    key={item.product_id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* ── Order summary sidebar ────────────────────────── */}
              <div className="checkout-summary" style={{ position: 'sticky', top: '96px' }}>
                <div className="checkout-summary-title">Order Summary</div>

                <div className="checkout-row">
                  <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                  <span>{formatPrice(totalCost)}</span>
                </div>
                <div className="checkout-row">
                  <span>Shipping</span>
                  <span style={{ color: 'var(--success)' }}>Free</span>
                </div>
                <div className="checkout-row">
                  <span>Taxes</span>
                  <span>Included</span>
                </div>

                <div className="checkout-total">
                  <span>Total</span>
                  <span style={{
                    color: 'var(--accent-light)', fontSize: '22px', fontWeight: 800,
                    transition: 'all 0.15s ease',
                  }}>
                    {formatPrice(totalCost)}
                  </span>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  style={{ width: '100%', padding: '14px', marginTop: '20px', fontSize: '15px' }}
                  id="checkout-btn"
                >
                  {checkingOut ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: 16, height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }} />
                      Processing...
                    </span>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Proceed to Payment
                      <ExternalLink size={13} />
                    </>
                  )}
                </button>

                <div style={{
                  marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)',
                  textAlign: 'center', lineHeight: 1.6,
                }}>
                  🔒 Secured by Stripe. Stock is reserved atomically before payment.
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
