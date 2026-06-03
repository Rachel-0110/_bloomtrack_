import React from 'react'
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast } = useApp()

  if (!toast) return null

  return (
    <div className="toast-overlay">
      <div className="toast toast-success">
        <div className="toast-icon">✅</div>
        <div className="toast-message">{toast}</div>
      </div>
    </div>
  )
}