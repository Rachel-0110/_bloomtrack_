import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, COLOUR_MAP } from '../context/AppContext'

export default function StockCard({ item, showActions = true }) {
  const navigate = useNavigate()
  const { getDaysSinceArrival, getFreshnessStatus, getFreshnessLabel, deleteStock, adjustStockQuantity, showToast } = useApp()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const days = getDaysSinceArrival(item.arrivalDate)
  const status = getFreshnessStatus(days)
  const freshnessLabel = getFreshnessLabel(days)
  
  const handleLogWaste = () => {
    navigate(`/log-waste/${item.id}`)
  }

  const handleReturn = () => {
    navigate('/return-stock', { state: { stockId: item.id, flowerName: item.flowerName } })
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    deleteStock(item.id)
    showToast('Stock entry deleted.')
    setShowDeleteModal(false)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
  }

  return (
    <>
      <div className="stock-card">
        <div className="stock-info">
          <div className="stock-name">
            {item.colour && (
              <span 
                className="colour-dot" 
                style={{ backgroundColor: COLOUR_MAP[item.colour] || '#9E9E9E' }}
              />
            )}
            {item.colour ? `${item.colour} • ${item.flowerName}` : item.flowerName}
          </div>
          <div className="stock-meta">
            <span className="qty-row">
              <button
                className="qty-adjust-btn qty-minus"
                onClick={() => adjustStockQuantity(item.id, -1)}
                disabled={item.quantity <= 0}
                title="Decrease quantity"
              >
                −
              </button>
              <span className="qty-display">
                {item.quantity} {item.unit || 'Stem'}{item.quantity !== 1 ? 's' : ''}
              </span>
              <button
                className="qty-adjust-btn qty-plus"
                onClick={() => adjustStockQuantity(item.id, 1)}
                title="Increase quantity"
              >
                +
              </button>
            </span>
            {item.category ? ` • ${item.category} • ` : ' • '}Arrived {formatDate(item.arrivalDate)}
          </div>
          <div className="stock-days">
            {days === 0 ? 'Arrived today' : `${days} day${days !== 1 ? 's' : ''} since arrival`}
            {item.discounted && ' • 🏷️ Discounted'}
          </div>
          {item.lastUpdated && (
            <div className="last-updated">
              Last updated: {new Date(item.lastUpdated).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <span className={`freshness-badge ${status}`}>
            {freshnessLabel}
          </span>
          {showActions && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn btn-small btn-pink"
                onClick={handleLogWaste}
              >
                Log Waste
              </button>
              <button 
                className="btn btn-small btn-secondary"
                onClick={handleReturn}
                style={{ border: '1px solid #BDBDBD' }}
                title="Return to supplier"
              >
                🔄
              </button>
              <button 
                className="btn btn-small btn-secondary"
                onClick={handleDelete}
                style={{ border: '1px solid #BDBDBD' }}
                title="Delete stock entry"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-message">
              Delete this entry? This cannot be undone.
            </div>
            <div className="modal-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}