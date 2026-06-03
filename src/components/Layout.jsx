import React from 'react'
import Header from './Header'
import BottomNav from './BottomNav'
import Toast from './Toast'

export default function Layout({ children }) {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <BottomNav />
      <Toast />
    </div>
  )
}