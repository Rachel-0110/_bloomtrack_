import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function AddStockScreen() {
  const navigate = useNavigate()
  const { addStock, showToast } = useApp()
  const [flowerName, setFlowerName] = useState('')
  const [colour, setColour] = useState('Red')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('Stem')
  const [costPerUnit, setCostPerUnit] = useState('')
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('Roses')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [validationErrors, setValidationErrors] = useState({})

  const validate = () => {
    const errors = {}
    if (!flowerName.trim()) errors.flowerName = 'Please enter a flower name.'
    if (!quantity || parseInt(quantity) <= 0) errors.quantity = 'Quantity must be at least 1.'
    if (!costPerUnit || parseFloat(costPerUnit) < 0) errors.costPerUnit = 'Please enter a valid cost per unit.'
    if (!arrivalDate) errors.arrivalDate = 'Please select an arrival date.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) return

    if (flowerName.trim() && quantity && parseInt(quantity) > 0) {
      setSubmitting(true)
      setSubmitError('')
      try {
        await addStock({
          flowerName: flowerName.trim(),
          colour,
          quantity: parseInt(quantity),
          unit,
          costPerUnit: costPerUnit ? parseFloat(costPerUnit) : 0,
          arrivalDate,
          category
        })
        showToast('Stock added successfully!')
        navigate('/success', { 
          state: { 
            flowerName: flowerName.trim(), 
            colour,
            quantity: parseInt(quantity),
            unit
          } 
        })
      } catch (err) {
        setSubmitError(err.message || 'Failed to add stock. Please try again.')
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <div>
      <div className="screen-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Add Stock</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Flower Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Roses, Lilies, Sunflowers"
            value={flowerName}
            onChange={(e) => setFlowerName(e.target.value)}
            required
          />
          {validationErrors.flowerName ? (
            <p style={{ fontSize: 12, color: 'var(--critical-red)', marginTop: 4, marginBottom: 0 }}>
              {validationErrors.flowerName}
            </p>
          ) : (
            <p style={{ fontSize: 11, color: 'var(--gray-medium)', marginTop: 4, marginBottom: 0 }}>
              Enter flower type only — not colour
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Colour</label>
          <select
            className="form-select"
            value={colour}
            onChange={(e) => setColour(e.target.value)}
          >
            <option value="Red">🔴 Red</option>
            <option value="Pink">🩷 Pink</option>
            <option value="White">⚪ White</option>
            <option value="Yellow">🟡 Yellow</option>
            <option value="Orange">🟠 Orange</option>
            <option value="Peach">🍑 Peach</option>
            <option value="Purple">🟣 Purple</option>
            <option value="Lavender">💜 Lavender</option>
            <option value="Mixed">🎨 Mixed</option>
            <option value="Other">🔘 Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g., 50"
            min="1"
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setValidationErrors(prev => ({ ...prev, quantity: undefined })) }}
            required
          />
          {validationErrors.quantity && (
            <p style={{ fontSize: 12, color: 'var(--critical-red)', marginTop: 4, marginBottom: 0 }}>
              {validationErrors.quantity}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Unit</label>
          <select
            className="form-select"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <optgroup label="Individual">
              <option value="Stem">Stem</option>
              <option value="Cutting">Cutting</option>
            </optgroup>
            <optgroup label="Grouped">
              <option value="Bunch (×10)">Bunch (×10)</option>
              <option value="Bundle (×25)">Bundle (×25)</option>
              <option value="Box (bulk)">Box (bulk)</option>
            </optgroup>
            <optgroup label="Arranged">
              <option value="Bouquet">Bouquet</option>
              <option value="Arrangement">Arrangement</option>
              <option value="Wreath">Wreath</option>
            </optgroup>
            <optgroup label="Living">
              <option value="Potted Plant">Potted Plant</option>
              <option value="Seedling">Seedling</option>
            </optgroup>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Cost per Unit ($)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g., 2.50"
            min="0"
            step="0.01"
            value={costPerUnit}
            onChange={(e) => { setCostPerUnit(e.target.value); setValidationErrors(prev => ({ ...prev, costPerUnit: undefined })) }}
          />
          {validationErrors.costPerUnit && (
            <p style={{ fontSize: 12, color: 'var(--critical-red)', marginTop: 4, marginBottom: 0 }}>
              {validationErrors.costPerUnit}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Arrival Date</label>
          <input
            type="date"
            className="form-input"
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Roses">Roses</option>
            <option value="Lilies">Lilies</option>
            <option value="Native">Native</option>
            <option value="Mixed">Mixed</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {submitError && (
          <div className="alert-banner" style={{ marginBottom: 12 }}>
            <span className="alert-banner-icon">❌</span>
            <span>{submitError}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Stock'}
        </button>
      </form>
    </div>
  )
}