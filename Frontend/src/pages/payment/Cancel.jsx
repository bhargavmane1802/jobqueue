import { Link } from 'react-router-dom'
import { XCircle, RefreshCw, ShoppingCart } from 'lucide-react'

export default function PaymentCancel() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="glow-orb" style={{
        width: '400px', height: '400px', background: 'var(--danger)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        opacity: 0.06, filter: 'blur(100px)',
      }} />

      <div className="glass-card fade-in" style={{
        maxWidth: '460px', width: '100%', padding: '48px', textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, background: 'var(--danger-bg)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          border: '2px solid rgba(239,68,68,0.2)',
        }}>
          <XCircle size={36} color="var(--danger)" />
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Payment Cancelled
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
          Your payment was cancelled. Don't worry — your cart items and reserved
          stock will be released automatically.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/buyer/cart" className="btn btn-primary" id="retry-checkout-btn">
            <RefreshCw size={15} />
            Try Again
          </Link>
          <Link to="/buyer/home" className="btn btn-secondary" id="browse-products-btn">
            <ShoppingCart size={15} />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
