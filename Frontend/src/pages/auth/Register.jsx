import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, User, Mail, Lock, Eye, EyeOff, ShoppingBag, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import { register } from '../../api/auth.api'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'buyer' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="glow-orb glow-orb-1" style={{ opacity: 0.08 }} />
      <div className="glow-orb glow-orb-2" style={{ opacity: 0.06 }} />

      <div className="auth-card fade-in" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">NEXUS</div>
        <div className="auth-subtitle">Create your account</div>

        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          {/* Role Selector */}
          <div className="input-group">
            <label className="input-label">I want to</label>
            <div className="role-selector">
              <div
                className={`role-option ${form.role === 'buyer' ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, role: 'buyer' })}
                id="role-buyer"
              >
                <ShoppingBag size={22} />
                <span className="role-label">Shop (Buyer)</span>
              </div>
              <div
                className={`role-option ${form.role === 'seller' ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, role: 'seller' })}
                id="role-seller"
              >
                <Store size={22} />
                <span className="role-label">Sell (Seller)</span>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-wrapper">
              <User size={15} className="input-icon" />
              <input
                className="input-field"
                type="text"
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                id="register-username"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-wrapper">
              <Mail size={15} className="input-icon" />
              <input
                className="input-field"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                id="register-email"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock size={15} className="input-icon" />
              <input
                className="input-field"
                type={showPass ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                id="register-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '13px' }}
            id="register-submit"
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Creating account...
              </span>
            ) : (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
