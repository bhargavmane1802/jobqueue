import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { verifyOtp, verifyPasswordChange } from '../../api/auth.api'

export default function VerifyOtp() {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()

  // context: 'register' | 'change-password'
  const context = location.state?.context || 'register'
  const email   = location.state?.email   || ''

  // Redirect if navigated to directly without state
  useEffect(() => {
    if (!location.state) {
      navigate(context === 'change-password' ? '/' : '/register', { replace: true })
    }
  }, [])

  // Auto-focus first box
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Handle individual digit input
  const handleDigit = (idx, value) => {
    if (!/^\d?$/.test(value)) return            // numbers only
    const next = [...digits]
    next[idx] = value
    setDigits(next)
    if (value && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  // Support paste of full 6-digit OTP
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const otp = digits.join('')
    if (otp.length < 6) {
      setError('Enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      if (context === 'register') {
        await verifyOtp(otp)
        toast.success('Email verified! You can now sign in.')
        navigate('/login')
      } else {
        // change-password context
        await verifyPasswordChange(otp)
        toast.success('Password changed successfully! Please sign in again.')
        navigate('/login')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP')
      // Clear boxes on error
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const title = context === 'register' ? 'Verify your email' : 'Confirm password change'
  const desc  = context === 'register'
    ? `We sent a 6-digit code to ${email || 'your email'}. Enter it below to complete registration.`
    : `We sent a 6-digit code to ${email || 'your email'}. Enter it to confirm your new password.`

  return (
    <div className="auth-page">
      <div className="glow-orb glow-orb-1" style={{ opacity: 0.08 }} />

      <div className="auth-card fade-in" style={{ maxWidth: '420px', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72,
          background: 'rgba(124,92,252,0.1)',
          border: '1px solid var(--border-accent)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <ShieldCheck size={32} color="var(--accent-light)" />
        </div>

        <div className="auth-logo" style={{ fontSize: '22px', marginBottom: '8px' }}>{title}</div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          marginBottom: '28px',
        }}>
          <Mail size={14} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
            {desc}
          </p>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '20px', textAlign: 'left' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id="otp-form">
          {/* 6-box OTP input */}
          <div style={{
            display: 'flex', gap: '10px', justifyContent: 'center',
            marginBottom: '28px',
          }}>
            {digits.map((d, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                id={`otp-digit-${idx}`}
                style={{
                  width: '48px', height: '56px',
                  textAlign: 'center', fontSize: '22px', fontWeight: 700,
                  background: 'var(--bg-elevated)',
                  border: d
                    ? '2px solid var(--accent)'
                    : '2px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  fontFamily: 'monospace',
                }}
              />
            ))}
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || digits.join('').length < 6}
            style={{ width: '100%', padding: '13px' }}
            id="otp-submit"
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Verifying...
              </span>
            ) : (
              <><ShieldCheck size={16} /> Verify OTP</>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)',
        }}>
          <p>OTP expires in 10 minutes.</p>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: '10px' }}
            onClick={() => navigate(-1)}
            id="back-to-form"
          >
            <ArrowLeft size={14} /> Go back
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
