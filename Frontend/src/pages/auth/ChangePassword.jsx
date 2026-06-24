import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { changePassword } from '../../api/auth.api'
import { useAuth } from '../../context/AuthContext'

export default function ChangePassword() {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.password || form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await changePassword(form.password)
      toast.success('OTP sent to your email!')
      navigate('/verify-otp', {
        state: { email: user?.email, context: 'change-password' }
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate password change')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="glow-orb glow-orb-1" style={{ opacity: 0.08 }} />

      <div className="auth-card fade-in" style={{ maxWidth: '440px' }}>
        <div className="auth-logo">NEXUS</div>
        <div className="auth-subtitle">Change your password</div>

        <div style={{
          padding: '12px 14px', background: 'rgba(124,92,252,0.06)',
          border: '1px solid var(--border-accent)', borderRadius: '10px',
          fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px',
          lineHeight: 1.6,
        }}>
          🔒 Enter your new password. We'll send an OTP to <strong style={{ color: 'var(--accent-light)' }}>{user?.email}</strong> to confirm the change.
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} id="change-password-form">
          <div className="input-group">
            <label className="input-label">New Password</label>
            <div className="input-wrapper">
              <Lock size={15} className="input-icon" />
              <input
                className="input-field"
                type={showPass ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                id="new-password"
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

            {/* Password strength indicator */}
            {form.password && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                {[...Array(4)].map((_, i) => {
                  const strength = Math.min(4, Math.floor(form.password.length / 3))
                  const colors = ['var(--danger)', 'var(--warning)', '#f59e0b', 'var(--success)']
                  return (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '99px',
                      background: i < strength ? colors[strength - 1] : 'var(--border)',
                      transition: 'background 0.2s ease',
                    }} />
                  )
                })}
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Confirm New Password</label>
            <div className="input-wrapper">
              <Lock size={15} className="input-icon" />
              <input
                className="input-field"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                id="confirm-password"
                style={{
                  paddingRight: '44px',
                  border: form.confirm && form.confirm !== form.password
                    ? '1px solid var(--danger)'
                    : undefined,
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {form.confirm && form.confirm !== form.password && (
              <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
                Passwords don't match
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '13px' }}
            id="change-password-submit"
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Sending OTP...
              </span>
            ) : (
              <><ShieldCheck size={16} /> Continue</>
            )}
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(-1)}
            style={{ width: '100%', marginTop: '8px' }}
            id="cancel-change-password"
          >
            <ArrowLeft size={14} /> Cancel
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
