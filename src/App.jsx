import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/Layout'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import AddStockScreen from './screens/AddStockScreen'
import StockListScreen from './screens/StockListScreen'
import LogWasteScreen from './screens/LogWasteScreen'
import AlertsScreen from './screens/AlertsScreen'
import SuccessScreen from './screens/SuccessScreen'
import ReturnStockScreen from './screens/ReturnStockScreen'

function ProtectedRoute({ children }) {
  const { session } = useApp()
  if (!session) {
    return <Navigate to="/" replace />
  }
  return <Layout>{children}</Layout>
}

function PublicRoute({ children }) {
  const { session } = useApp()
  if (session) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <LoginScreen />
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardScreen />
        </ProtectedRoute>
      } />
      <Route path="/add-stock" element={
        <ProtectedRoute>
          <AddStockScreen />
        </ProtectedRoute>
      } />
      <Route path="/stock" element={
        <ProtectedRoute>
          <StockListScreen />
        </ProtectedRoute>
      } />
      <Route path="/log-waste/:stockId" element={
        <ProtectedRoute>
          <LogWasteScreen />
        </ProtectedRoute>
      } />
      <Route path="/alerts" element={
        <ProtectedRoute>
          <AlertsScreen />
        </ProtectedRoute>
      } />
      <Route path="/success" element={
        <ProtectedRoute>
          <SuccessScreen />
        </ProtectedRoute>
      } />
      <Route path="/return-stock" element={
        <ProtectedRoute>
          <ReturnStockScreen />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}