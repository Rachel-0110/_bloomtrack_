import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerShop } from '../api'

export default function SignUpScreen() {
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [captcha, setCaptcha] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [registeredShop, setRegisteredShop] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!shopName.trim()) { setError('Please enter your shop name.'); return }
    if (!ownerName.trim()) { setError('Please enter the owner name.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (!captcha) { setError('Please confirm you are not a robot.'); return }

    setSubmitting(true)
    try {
      const result = await registerShop({
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim(),
      })
      setAccessCode(result.access_code)
      setRegisteredShop(result.shop_name)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Show success state after registration
  if (accessCode) {
    return (
      <div className="login-screen">
        <div className="login-logo">
          <div className="login-logo-icon">🌸</div>
          <div className="login-logo-text">BloomTrack</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 8 }}>
            Shop Registered Successfully!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray-medium)' }}>
            {registeredShop} is now registered with BloomTrack.
          </p>
        </div>

        <div style={{
          background: 'var(--green-light)',
          border: '2px solid var(--green-primary)',
          borderRadius: 'var(--radius)',
          padding: 24,
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <p style={{ fontSize: 13, color: 'var(--green-dark)', fontWeight: 600, marginBottom: 8 }}>
            Your Access Code
          </p>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--green-dark)',
            letterSpacing: 4,
            fontFamily: 'monospace',
          }}>
            {accessCode}
          </div>
          <p style={{ fontSize: 12, color: 'var(--gray-medium)', marginTop: 12, marginBottom: 0 }}>
            ⚠️ Save this code to access BloomTrack. You will need it every time you log in.
          </p>
        </div>

        <Link to="/" className="btn btn-primary btn-block">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="login-screen">
      <div className="login-logo">
        <div className="login-logo-icon">🌸</div>
        <div className="login-logo-text">BloomTrack</div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-dark)', marginBottom: 20, textAlign: 'center' }}>
        Register Your Shop
      </h2>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Shop Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Petals & Co"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Owner Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Sarah Johnson"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g., sarah@petalsco.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            id="captcha"
            checked={captcha}
            onChange={(e) => setCaptcha(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--green-primary)' }}
          />
          <label htmlFor="captcha" style={{ fontSize: 14, color: 'var(--gray-dark)', cursor: 'pointer' }}>
            I am not a robot
          </label>
        </div>

        {error && (
          <p style={{ fontSize: 12, color: 'var(--critical-red)', marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }} disabled={submitting}>
          {submitting ? 'Registering...' : 'Register Shop'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          <Link to="/" style={{ color: 'var(--green-primary)', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Login
          </Link>
        </p>
      </form>
    </div>
  )
}