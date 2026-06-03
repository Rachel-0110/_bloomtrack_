import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function AlertsScreen() {
  const navigate = useNavigate()
  const { stock, loading, error, refreshStock, dismissedAlerts, dismissAlert, markAsDiscounted, returnToSupplier, showToast, getDaysSinceArrival, getFreshnessStatus, getFreshnessLabel } = useApp()

  const alertItems = stock.filter(item => {
    const days = getDaysSinceArrival(item.arrivalDate)
    const status = getFreshnessStatus(days)
    return (status === 'ageing' || status === 'use-soon') && !dismissedAlerts.includes(item.id) && item.status !== 'Returned'
  })

  const handleLogWaste = (stockId) => {
    navigate(`/log-waste/${stockId}`)
  }

  const handleMarkDiscounted = (id) => {
    markAsDiscounted(id)
  }

  const handleReturnToSupplier = async (id, flowerName) => {
    try {
      await returnToSupplier(id)
      showToast(`${flowerName} returned to supplier.`)
      navigate('/success', {
        state: {
          title: 'Return Processed',
          detail: `${flowerName} has been marked as returned to supplier.`,
        }
      })
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
                    {item.discounted && ' • 🏷️ Discounted'}
                  </div>
                </div>
                <span className={`freshness-badge ${status}`}>
                  {getFreshnessLabel(days)}
                </span>
              </div>
              <div className="action-buttons" style={{ width: '100%', marginTop: 12 }}>
                <button 
                  className="btn btn-small btn-pink"
                  onClick={() => handleLogWaste(item.id)}
                >
                  Log Waste
                </button>
                <button 
                  className="btn btn-small btn-outline"
                  style={{ borderColor: 'var(--ageing-orange)', color: 'var(--ageing-orange)' }}
                  onClick={() => handleReturnToSupplier(item.id, item.flowerName)}
                >
                  🔄 Return
                </button>
                {!item.discounted && (
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => handleMarkDiscounted(item.id)}
                  >
                    🏷️ Discount
                  </button>
                )}
                <button 
                  className="btn btn-small btn-outline"
                  onClick={() => dismissAlert(item.id)}
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