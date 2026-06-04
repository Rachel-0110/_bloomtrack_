import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Header() {
  const { session, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-title">
        <span>BloomTrack 🌸</span>
      </div>
      {session && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="header-user">
            <div className="header-user-name">{session.staffName}</div>
            <div>{session.shopName}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 6,
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            title="Logout"
          >
            Logout ↗
          </button>
        </div>
      )}
    </header>
  )
}
