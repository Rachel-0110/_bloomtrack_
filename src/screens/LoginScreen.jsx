import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const VALID_CODES = ['BLOOM2026', 'FLORA2026', 'PETAL2026']

export default function LoginScreen() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [accessCode, setAccessCode] = useState('')
  const [accessCodeError, setAccessCodeError] = useState('')
  const [shopName, setShopName] = useState('')
  const [staffName, setStaffName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!accessCode.trim()) {
      setAccessCodeError('Invalid access code. Please contact BloomTrack support.')
      return
    }
    if (!VALID_CODES.includes(accessCode.trim().toUpperCase())) {
      setAccessCodeError('Invalid access code. Please contact BloomTrack support.')
      return
    }
    if (shopName.trim() && staffName.trim()) {
      login(accessCode.trim().toUpperCase(), shopName.trim(), staffName.trim())
      navigate('/dashboard')
    }
  }

  return (
    <div className="login-screen">
      <div className="login-logo">
        <div className="login-logo-icon">🌸</div>
        <div className="login-logo-text">BloomTrack</div>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Shop Access Code</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter your shop access code"
            value={accessCode}
            onChange={(e) => {
              setAccessCode(e.target.value)
              setAccessCodeError('')
            }}
            style={{ borderColor: 'var(--pink-accent)' }}
            required
          />
          <p style={{ fontSize: 11, color: 'var(--gray-medium)', marginTop: 4, marginBottom: 0 }}>
            Your access code is provided when your shop signs up with BloomTrack.
          </p>
          {accessCodeError && (
            <p style={{ fontSize: 12, color: 'var(--critical-red)', marginTop: 4, marginBottom: 0 }}>
              {accessCodeError}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Florist Shop Name</label>
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
          <label className="form-label">Staff Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Sarah"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
          Start Managing Stock
        </button>

        <div className="privacy-notice">
          <span className="privacy-icon">🔒</span>
          <p className="privacy-text">
            We only collect what you need to manage your stock. No data is shared externally.
          </p>
        </div>
      </form>
    </div>
  )
}