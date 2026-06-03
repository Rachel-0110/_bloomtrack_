import React from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function BottomNav() {
  const { getAgeingItems } = useApp()
  const alertCount = getAgeingItems().length

  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">🏠</span>
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/stock" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">📦</span>
        <span>Stock List</span>
      </NavLink>
      <NavLink to="/alerts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">🔔</span>
        <span>Alerts</span>
        {alertCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 4,
            right: 8,
            background: '#F44336',
            color: 'white',
            borderRadius: '50%',
            width: 18,
            height: 18,
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {alertCount}
          </span>
        )}
      </NavLink>
    </nav>
  )
}