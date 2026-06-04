import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import StockCard from '../components/StockCard'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'fresh', label: 'Fresh' },
  { key: 'use-soon', label: 'Use Soon' },
  { key: 'ageing', label: 'Ageing' },
  { key: 'returned', label: 'Returned' },
]

const COLOUR_OPTIONS = [
  { value: 'Red', emoji: '🔴' },
  { value: 'Pink', emoji: '🩷' },
  { value: 'White', emoji: '⚪' },
  { value: 'Yellow', emoji: '🟡' },
  { value: 'Orange', emoji: '🟠' },
  { value: 'Peach', emoji: '🍑' },
  { value: 'Purple', emoji: '🟣' },
  { value: 'Lavender', emoji: '💜' },
  { value: 'Mixed', emoji: '🎨' },
  { value: 'Other', emoji: '🔘' },
]

const UNIT_OPTIONS = [
  { value: 'Stem', group: 'Individual' },
  { value: 'Cutting', group: 'Individual' },
  { value: 'Bunch (×10)', group: 'Grouped' },
  { value: 'Bundle (×25)', group: 'Grouped' },
  { value: 'Box (bulk)', group: 'Grouped' },
  { value: 'Bouquet', group: 'Arranged' },
  { value: 'Arrangement', group: 'Arranged' },
  { value: 'Wreath', group: 'Arranged' },
  { value: 'Potted Plant', group: 'Living' },
  { value: 'Seedling', group: 'Living' },
]

export default function StockListScreen() {
  const { stock, loading, error, refreshStock, addStock, showToast, getDaysSinceArrival, getFreshnessStatus } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Add Stock form state
  const [flowerName, setFlowerName] = useState('')
  const [colour, setColour] = useState('Red')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('Stem')
  const [costPerUnit, setCostPerUnit] = useState('')
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('Roses')
  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Filter stock
  const filteredStock = stock.filter(item => {
    // Search filter
    const matchesSearch =
      item.flowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.colour && item.colour.toLowerCase().includes(searchTerm.toLowerCase()))
    if (!matchesSearch) return false

    // Status filter
    if (activeFilter === 'all') return true
    if (activeFilter === 'returned') return item.status === 'Returned'
    const days = getDaysSinceArrival(item.arrivalDate)
    const status = getFreshnessStatus(days)
    return status === activeFilter
  })

  const validate = () => {
    const errors = {}
    if (!flowerName.trim()) errors.flowerName = 'Please enter a flower name.'
    if (!quantity || parseInt(quantity) <= 0) errors.quantity = 'Quantity must be at least 1.'
    if (!costPerUnit || parseFloat(costPerUnit) < 0) errors.costPerUnit = 'Please enter a valid cost per unit.'
    if (!arrivalDate) errors.arrivalDate = 'Please select an arrival date.'
    return errors
  }

  const resetForm = () => {
    setFlowerName('')
    setColour('Red')
    setQuantity('')
    setUnit('Stem')
    setCostPerUnit('')
    setArrivalDate(new Date().toISOString().split('T')[0])
    setCategory('Roses')
    setValidationErrors({})
  }

  const handleAddStock = async (e) => {
    e.preventDefault()
    const errors = validate()
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
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
      setShowAddModal(false)
      resetForm()
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">Stock</h1>

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

      {/* Search bar */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by flower name or colour..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter pills */}
      <div className="filter-bar">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-pill ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">Loading stock...</div>
          <div className="empty-text">Fetching your stock data from the server</div>
        </div>
      ) : filteredStock.length > 0 ? (
        filteredStock.map(item => (
          <StockCard key={item.id} item={item} />
        ))
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            {searchTerm || activeFilter !== 'all' ? '🔍' : '🌷'}
          </div>
          <div className="empty-title">
            {searchTerm || activeFilter !== 'all' ? 'No matches found' : 'No stock yet'}
          </div>
          <div className="empty-text">
            {searchTerm || activeFilter !== 'all'
              ? 'Try a different search term or filter'
              : 'Tap the + button to add your first batch of flowers'
            }
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => setShowAddModal(true)}
        title="Add Stock"
      >
        +
      </button>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-sheet-header">
              <h2 className="modal-sheet-title">Add Stock</h2>
              <button className="modal-sheet-close" onClick={() => { setShowAddModal(false); resetForm() }}>✕</button>
            </div>
            <form onSubmit={handleAddStock} className="modal-sheet-body">
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
                <select className="form-select" value={colour} onChange={e => setColour(e.target.value)}>
                  {COLOUR_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.value}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
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
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Unit</label>
                  <select className="form-select" value={unit} onChange={e => setUnit(e.target.value)}>
                    <optgroup label="Individual">
                      {UNIT_OPTIONS.filter(u => u.group === 'Individual').map(u => (
                        <option key={u.value} value={u.value}>{u.value}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Grouped">
                      {UNIT_OPTIONS.filter(u => u.group === 'Grouped').map(u => (
                        <option key={u.value} value={u.value}>{u.value}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Arranged">
                      {UNIT_OPTIONS.filter(u => u.group === 'Arranged').map(u => (
                        <option key={u.value} value={u.value}>{u.value}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Living">
                      {UNIT_OPTIONS.filter(u => u.group === 'Living').map(u => (
                        <option key={u.value} value={u.value}>{u.value}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
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
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Arrival Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Roses">Roses</option>
                  <option value="Lilies">Lilies</option>
                  <option value="Native">Native</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Stock'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}