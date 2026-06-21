import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'var(--bg-primary)',
    }}>
      <div className="glow-orb" style={{
        width: '400px', height: '400px', background: 'var(--success)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        opacity: 0.07, filter: 'blur(100px)',
      }} />

      <div className="glass-card fade-in" style={{
        maxWidth: '500px', width: '100%', padding: '48px', textAlign: 'center',
      }}>
        {/* Animated checkmark */}
        <div style={{
          width: 80, height: 80, background: 'var(--success-bg)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          border: '2px solid rgba(34, 211, 165, 0.3)',
          animation: 'popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        }}>
          <CheckCircle size={36} color="var(--success)" />
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Payment Successful!
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>
          Your order has been placed and payment confirmed. Our system is now processing
          your inventory and you'll receive a confirmation email shortly.
        </p>

        {sessionId && (
          <div style={{
            padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
            borderRadius: '10px', border: '1px solid var(--border)',
            marginBottom: '24px', fontFamily: 'monospace',
            fontSize: '11px', color: 'var(--text-muted)', wordBreak: 'break-all',
          }}>
            Session: {sessionId}
          </div>
        )}

        <div style={{
          padding: '14px', background: 'var(--success-bg)', borderRadius: '12px',
          border: '1px solid rgba(34,211,165,0.2)', marginBottom: '28px',
          display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left',
        }}>
          <Package size={16} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--success)' }}>Job Queue Processing</strong><br />
            Your payment has triggered an async pipeline: inventory is being updated
            and a confirmation email is queued. This happens reliably in the background.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/buyer/orders/pending" className="btn btn-success" id="view-orders-btn">
            <Package size={15} />
            View Orders
          </Link>
          <Link to="/buyer/home" className="btn btn-secondary" id="continue-shopping-btn">
            Continue Shopping
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
