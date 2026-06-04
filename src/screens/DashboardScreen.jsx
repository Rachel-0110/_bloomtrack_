import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import formatCurrency from '../lib/formatCurrency'

export default function DashboardScreen() {
  const { stock, loading, error, refreshStock, getTotalStock, getAgeingItems, getNewArrivals, getTotalWaste, getWasteThisWeekLoss } = useApp()
  
  const ageingItems = getAgeingItems()
  const newArrivals = getNewArrivals()

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

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
          <div className="empty-title">Loading dashboard...</div>
          <div className="empty-text">Fetching your stock data from the server</div>
        </div>
      ) : (
      <>

      {ageingItems.length > 0 && (
        <div className="alert-banner">
          <span className="alert-banner-icon">⚠️</span>
          <span>{ageingItems.length} item{ageingItems.length !== 1 ? 's' : ''} need attention — ageing stock detected!</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{getTotalStock()}</div>
          <div className="stat-label">Total Stems</div>
        </div>
        <div className={`stat-card ${ageingItems.length > 0 ? 'ageing' : ''}`}>
          <div className="stat-icon">⏰</div>
          <div className="stat-value">{ageingItems.length}</div>
          <div className="stat-label">Ageing Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-value">{newArrivals.length}</div>
          <div className="stat-label">New Arrivals</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🗑️</div>
          <div className="stat-value">{getTotalWaste()}</div>
          <div className="stat-label">Waste Logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-value">{formatCurrency(getWasteThisWeekLoss())}</div>
          <div className="stat-label">Waste This Week</div>
        </div>
      </div>

      <div className="cta-buttons">
        <Link to="/stock" className="btn btn-primary">
          📋 View Stock
        </Link>
      </div>

      {stock.length === 0 && (
        <div className="card" style={{ textAlign: 'center', marginTop: 24 }}>
          <div className="empty-icon">🌷</div>
          <div className="empty-title">No stock yet</div>
          <div className="empty-text">Add your first batch of flowers to get started</div>
        </div>
      )}
      </>
      )}
    </div>
  )
}
