import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ReturnStockScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { stockId, flowerName: prefillName } = location.state || {}
  const { stock, logReturn, showToast } = useApp()
  
  const stockItem = stockId ? stock.find(item => item.id === parseInt(stockId)) : null
  const [flowerName, setFlowerName] = useState(prefillName || '')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('Damaged on arrival')
  const [supplierName, setSupplierName] = useState('')
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0])

  const maxQuantity = stockItem ? stockItem.quantity : 999

  const handleSubmit = (e) => {
    e.preventDefault()
    const returnQty = parseInt(quantity)
    if (flowerName.trim() && returnQty > 0 && supplierName.trim()) {
      if (stockItem) {
        logReturn(stockItem.id, returnQty, reason, flowerName.trim(), supplierName.trim())
      }
      showToast('Return logged successfully. Stock updated.')
      navigate('/stock')
    }
  }

  return (
    <div>
      <div className="screen-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Return to Supplier</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Flower Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Pink Roses"
            value={flowerName}
            onChange={(e) => setFlowerName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Quantity to Return{stockItem ? ` (max: ${maxQuantity})` : ''}</label>
          <input
            type="number"
            className="form-input"
            placeholder="Enter quantity"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Reason for Return</label>
          <select
            className="form-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="Damaged on arrival">Damaged on arrival</option>
            <option value="Poor quality">Poor quality</option>
            <option value="Wrong order">Wrong order</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Supplier Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Fresh Flowers Co."
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Date of Return</label>
          <input
            type="date"
            className="form-input"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
          Log Return
        </button>
      </form>
    </div>
  )
}