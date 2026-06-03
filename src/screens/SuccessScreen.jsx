import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function SuccessScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { flowerName, quantity, unit, title, detail } = location.state || {}

  // Auto-redirect to dashboard after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  const heading = title || 'Stock Added Successfully'
  const message = detail || (flowerName && quantity
    ? `${quantity} ${unit || 'Stem'}${quantity !== 1 ? 's' : ''} added`
    : null)

  return (
    <div className="success-screen">
      <div className="success-content">
        <div className="success-checkmark">✅</div>
        <h1 className="success-heading">{heading}</h1>
        {message && (
          <div className="success-detail-card">
            {flowerName && (
              <div className="success-flower-name">{flowerName}</div>
            )}
            <div className="success-quantity">{message}</div>
          </div>
        )}
        <p style={{ fontSize: 13, color: 'var(--gray-medium)', marginTop: 8 }}>
          Returning to dashboard in a moment...
        </p>
      </div>
      <button 
        className="btn btn-primary btn-block success-btn"
        onClick={() => navigate('/dashboard')}
      >
        Back to Dashboard
      </button>
    </div>
  )
}