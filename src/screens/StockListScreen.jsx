import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import StockCard from '../components/StockCard'

export default function StockListScreen() {
  const { stock, loading, error, refreshStock } = useApp()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStock = stock.filter(item =>
    item.flowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.colour && item.colour.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div>
      <h1 className="page-title">Stock List</h1>

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
            {searchTerm ? '🔍' : '🌷'}
          </div>
          <div className="empty-title">
            {searchTerm ? 'No matches found' : 'No stock yet'}
          </div>
          <div className="empty-text">
            {searchTerm 
              ? `No flowers matching "${searchTerm}"`
              : 'Add your first batch of flowers to get started'
            }
          </div>
        </div>
      )}
    </div>
  )
}
