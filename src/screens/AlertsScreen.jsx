import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import formatCurrency from '../lib/formatCurrency'

export default function AlertsScreen() {
  const navigate = useNavigate()
  const { stock, loading, error, refreshStock, markAsDiscounted, returnToSupplier, dismissAlert, showToast, getDaysSinceArrival, getFreshnessStatus, getFreshnessLabel } = useApp()

  const alertItems = stock.filter(item => {
    if (item.status === 'Returned' || item.status === 'Dismissed') return false
    const days = getDaysSinceArrival(item.arrivalDate)
    const status = getFreshnessStatus(days)
    return status === 'ageing' || status === 'use-soon'
  })

  const handleLogWaste = (stockId) => {
    navigate(`/log-waste/${stockId}`)
  }

  const handleMarkDiscounted = async (id) => {
    try {
      await markAsDiscounted(id)
      showToast('Marked as discounted — stock updated')
    } catch {
      // error is set in context
    }
  }

  const handleReturnToSupplier = async (id, flowerName) => {
    try {
      await returnToSupplier(id)
      showToast('Returned to supplier — stock updated')
    } catch {
      // error is set in context
    }
  }

  const handleDismiss = async (id) => {
    try {
      await dismissAlert(id)
      showToast('Dismissed — stock updated')
    } catch {
      // error is set in context
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
  }

  return (
    <div>
      <h1 className="page-title">Alerts</h1>

      {error && (
        <div className="alert-banner" style={{ marginBottom: 12 }}>
          <span className="alert-banner-icon">❌</span>
          <span>{error}</span>
          <button 
            className="btn btn-small btn-outline" 
            style={{ marginLeft: 'auto' }}
            onClick={refreshStock}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">Loading alerts...</div>
          <div className="empty-text">Checking your stock for items needing attention</div>
        </div>
      ) : alertItems.length > 0 ? (
        alertItems.map(item => {
          const days = getDaysSinceArrival(item.arrivalDate)
          const status = getFreshnessStatus(days)
          const isDiscounted = item.status === 'Discounted'

          return (
            <div key={item.id} className="stock-card" style={{ flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div className="stock-info">
                  <div className="stock-name">{item.flowerName}</div>
                  <div className="stock-meta">
                    {item.quantity} stems{item.category ? ` • ${item.category}` : ''} • Arrived {formatDate(item.arrivalDate)}
                  </div>
                  <div className="stock-days">
                    {days} day{days !== 1 ? 's' : ''} since arrival
                    {isDiscounted && ' • 🏷️ Discounted'}
                  </div>
                  {isDiscounted && item.costPerUnit > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--gray-medium)', marginTop: 4 }}>
                      <span style={{ textDecoration: 'line-through' }}>
                        {formatCurrency(item.costPerUnit)} / {item.unit || 'stem'}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`freshness-badge ${status}`}>
                  {getFreshnessLabel(days)}
                </span>
              </div>
              <div className="action-buttons" style={{ width: '100%', marginTop: 12, flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-small btn-pink"
                  onClick={() => handleLogWaste(item.id)}
                >
                  Log Waste
                </button>
                {!isDiscounted && (
                  <button 
                    className="btn btn-small btn-secondary"
                    style={{ borderColor: 'var(--moderate-yellow)', color: '#F57F17', background: 'rgba(255,193,7,0.1)' }}
                    onClick={() => handleMarkDiscounted(item.id)}
                  >
                    🏷️ Discount
                  </button>
                )}
                <button 
                  className="btn btn-small btn-outline"
                  style={{ borderColor: 'var(--gray-medium)', color: 'var(--gray-dark)' }}
                  onClick={() => handleReturnToSupplier(item.id, item.flowerName)}
                >
                  🔄 Return
                </button>
                <button 
                  className="btn btn-small btn-outline"
                  onClick={() => handleDismiss(item.id)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )
        })
      ) : (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <div className="empty-title">All clear!</div>
          <div className="empty-text">No ageing stock needs attention right now</div>
        </div>
      )}
    </div>
  )
}