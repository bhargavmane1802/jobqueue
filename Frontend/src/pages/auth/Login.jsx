import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff, User, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { login as loginApi } from '../../api/auth.api'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const { data } = await loginApi(form)
      login(data.token)
      toast.success('Welcome back!')
      // Decode role to redirect
      const payload = JSON.parse(atob(data.token.split('.')[1]))
      navigate(payload.role === 'seller' ? '/seller/dashboard' : '/buyer/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="glow-orb glow-orb-1" style={{ opacity: 0.08 }} />
      <div className="glow-orb glow-orb-2" style={{ opacity: 0.06 }} />

      <div className="auth-card fade-in">
        <div className="auth-logo">NEXUS</div>
        <div className="auth-subtitle">Sign in to your account</div>

        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-wrapper">
              <User size={15} className="input-icon" />
              <input
                className="input-field"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                id="login-username"
                autoComplete="username"
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
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                id="login-password"
                autoComplete="current-password"
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
                id="toggle-password"
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
            id="login-submit"
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Signing in...
              </span>
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
