import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import formatCurrency from '../lib/formatCurrency'

export default function LogWasteScreen() {
  const navigate = useNavigate()
  const { stockId } = useParams()
  const { stock, logWaste, showToast, getDaysSinceArrival } = useApp()
  
  const stockItem = stock.find(item => item.id === stockId)
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('Overstock')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [quantityError, setQuantityError] = useState('')

  if (!stockItem) {
    return (
      <div className="empty-state">
        <div className="empty-icon">❌</div>
        <div className="empty-title">Stock item not found</div>
        <div className="empty-text">This item may have been removed</div>
        <button className="btn btn-primary" onClick={() => navigate('/stock')}>
          Back to Stock List
        </button>
      </div>
    )
  }

  const days = getDaysSinceArrival(stockItem.arrivalDate)
  const maxQuantity = stockItem.quantity

  const handleSubmit = async (e) => {
    e.preventDefault()
    const wasteQty = parseInt(quantity)
    if (!quantity || wasteQty <= 0) {
      setQuantityError('Please enter a valid quantity (at least 1).')
      return
    }
    if (wasteQty > maxQuantity) {
      setQuantityError(`Maximum available quantity is ${maxQuantity}.`)
      return
    }
    setQuantityError('')

    if (wasteQty > 0 && wasteQty <= maxQuantity) {
      setSubmitting(true)
      setSubmitError('')
      try {
        await logWaste(stockItem.id, wasteQty, reason, stockItem.flowerName)
        showToast('Waste logged. Stock updated.')
        navigate('/success', {
          state: {
            title: 'Waste Logged',
            detail: `${wasteQty} ${stockItem.flowerName} discarded — ${formatCurrency(wasteQty * (stockItem.costPerUnit || 0))} loss recorded.`,
            flowerName: stockItem.flowerName,
          }
        })
      } catch (err) {
        setSubmitError(err.message || 'Failed to log waste. Please try again.')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div className="screen-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Log Waste</h1>
      </div>

      {days >= 5 && (
        <div className="alert-banner">
          <span className="alert-banner-icon">⚠️</span>
          <span>This item has been in stock for {days} days — past optimal freshness. Consider discarding to prevent further loss.</span>
        </div>
      )}

      <div className="item-detail-card">
        <div className="item-detail-name">{stockItem.flowerName}</div>
        <div className="item-detail-meta">
          {stockItem.quantity} stems available{stockItem.category ? ` • ${stockItem.category}` : ''}<br />
          Arrived {formatDate(stockItem.arrivalDate)} • {days} day{days !== 1 ? 's' : ''} ago
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Quantity to Discard (max: {maxQuantity})</label>
          <input
            type="number"
            className="form-input"
            placeholder="Enter quantity"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setQuantityError('') }}
            required
          />
          {quantityError && (
            <p style={{ fontSize: 12, color: 'var(--critical-red)', marginTop: 4, marginBottom: 0 }}>
              {quantityError}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Reason for Waste</label>
          <select
            className="form-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="Rotten">Rotten</option>
            <option value="Wilted">Wilted</option>
            <option value="Stem Damage">Stem Damage</option>
            <option value="Overstock">Overstock</option>
            <option value="Unsold Past Prime">Unsold Past Prime</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {quantity && parseInt(quantity) > 0 && stockItem.costPerUnit > 0 && (
          <div className="estimated-loss">
          Estimated Loss: {formatCurrency(parseInt(quantity) * stockItem.costPerUnit)}
          </div>
        )}

        {submitError && (
          <div className="alert-banner" style={{ marginBottom: 12 }}>
            <span className="alert-banner-icon">❌</span>
            <span>{submitError}</span>
          </div>
        )}

        <button type="submit" className="btn btn-danger btn-block" style={{ marginTop: 8 }} disabled={submitting}>
          {submitting ? 'Logging...' : 'Log Waste'}
        </button>
      </form>
    </div>
  )
}