import React from 'react'
import { useApp } from '../context/AppContext'

export default function Header() {
  const { session } = useApp()

  return (
    <header className="header">
      <div className="header-title">
        <span>BloomTrack 🌸</span>
      </div>
      {session && (
        <div className="header-user">
          <div className="header-user-name">{session.staffName}</div>
          <div>{session.shopName}</div>
        </div>
      )}
    </header>
  )
}