import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { verifyShop } from '../api'

export default function ForgotCodeScreen() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const data = await verifyShop(email.trim())
      setResult(data)
    } catch (err) {
      if (err.message.includes('404') || err.message.includes('No shop found')) {
        setError('No shop found with that email address.')
      } else {
        setError(err.message || 'Verification failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-logo">
        <div className="login-logo-icon">🌸</div>
        <div className="login-logo-text">BloomTrack</div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-dark)', marginBottom: 8, textAlign: 'center' }}>
        Recover Access Code
      </h2>
      <p style={{ fontSize: 13, color: 'var(--gray-medium)', marginBottom: 24, textAlign: 'center' }}>
        Enter the email you used to register your shop.
      </p>

      {!result ? (
        <form className="login-form" onSubmit={handleSubmit}>
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

          {error && (
            <p style={{ fontSize: 12, color: 'var(--critical-red)', marginBottom: 12 }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }} disabled={submitting}>
            {submitting ? 'Looking up...' : 'Recover Access Code'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
            <Link to="/" style={{ color: 'var(--green-primary)', textDecoration: 'none', fontWeight: 600 }}>
              ← Back to Login
            </Link>
          </p>
        </form>
      ) : (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
            <p style={{ fontSize: 14, color: 'var(--gray-dark)', marginBottom: 4 }}>
              <strong>{result.shop_name}</strong>
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
              {result.access_code}
            </div>
          </div>

          <Link to="/" className="btn btn-primary btn-block">
            Go to Login
          </Link>
        </div>
      )}
    </div>
  )
}