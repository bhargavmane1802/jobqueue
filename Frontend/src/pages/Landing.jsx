import { Link } from 'react-router-dom'
import { ShoppingBag, Store, Zap, Shield, TrendingUp, Layers } from 'lucide-react'

export default function Landing() {
  return (
    <div className="page-wrapper">
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      {/* Minimal nav */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-logo">NEXUS<span>.store</span></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero fade-in">
        <div className="hero-eyebrow">
          <span className="notif-dot" />
          Powered by BullMQ · Real-time Job Processing
        </div>

        <h1 className="hero-title">
          The marketplace that<br />
          <span className="gradient-text">never misses an order</span>
        </h1>

        <p className="hero-desc">
          NEXUS uses a distributed job queue architecture to handle payments, inventory,
          and notifications with bulletproof reliability. Shop or sell with confidence.
        </p>

        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary btn-lg" id="hero-get-started">
            <ShoppingBag size={18} />
            Start Shopping
          </Link>
          <Link to="/register?role=seller" className="btn btn-secondary btn-lg" id="hero-become-seller">
            <Store size={18} />
            Become a Seller
          </Link>
        </div>

        {/* Feature cards */}
        <div className="features-grid">
          {[
            {
              icon: <Zap size={24} color="var(--accent-light)" />,
              title: 'Instant Checkout',
              desc: 'Stripe-powered checkout with atomic inventory reservation — no overselling ever.',
            },
            {
              icon: <Shield size={24} color="var(--success)" />,
              title: 'Job Queue Reliability',
              desc: 'Every payment, inventory update and email is processed asynchronously with retry logic.',
            },
            {
              icon: <TrendingUp size={24} color="var(--warning)" />,
              title: 'Role-Based Access',
              desc: 'Separate seller and buyer dashboards with JWT-secured endpoints.',
            },
            {
              icon: <Layers size={24} color="var(--info)" />,
              title: 'Dead Letter Queue',
              desc: 'Failed jobs are captured and auditable. Nothing gets lost, ever.',
            },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
