import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '../api'

const AppContext = createContext()

export const COLOUR_MAP = {
  Red: '#F44336',
  Pink: '#E91E63',
  White: '#9E9E9E',
  Yellow: '#FFC107',
  Orange: '#FF9800',
  Peach: '#FFAB91',
  Purple: '#9C27B0',
  Lavender: '#B39DDB',
  Mixed: '#607D8B',
  Other: '#795548'
}

export function useApp() {
  return useContext(AppContext)
}

export function AppProvider({ children }) {
  const [session, setSession] = useState(null)
  const [stock, setStock] = useState([])
  const [wasteLog, setWasteLog] = useState([])
  const [returnLog, setReturnLog] = useState([])
  const [dismissedAlerts, setDismissedAlerts] = useState([])
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── Fetch stock from backend when session is set ─────────────────────────

  const refreshStock = useCallback(async () => {
    if (!session?.shopCode) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.fetchStock(session.shopCode)
      setStock(data)
    } catch (err) {
      console.error('Failed to fetch stock:', err)
      setError(err.message || 'Failed to load stock data')
    } finally {
      setLoading(false)
    }
  }, [session?.shopCode])

  // Fetch waste log when session is set
  const refreshWaste = useCallback(async () => {
    if (!session?.shopCode) return
    try {
      const wasteData = await api.fetchWaste(session.shopCode)
      setWasteLog(wasteData)
    } catch {
      // non-critical
    }
  }, [session?.shopCode])

  useEffect(() => {
    refreshStock()
    refreshWaste()
  }, [refreshStock, refreshWaste])

  // ── Session / Auth ───────────────────────────────────────────────────────

  const login = (shopCode, shopName, staffName) => {
    setSession({ shopCode, shopName, staffName })
  }

  const logout = () => {
    setSession(null)
    setStock([])
    setWasteLog([])
    setError(null)
  }

  // ── Stock CRUD ───────────────────────────────────────────────────────────

  const addStock = async (stockData) => {
    setLoading(true)
    setError(null)
    try {
      await api.createStock({
        ...stockData,
        shopCode: session.shopCode,
      })
      await refreshStock()
    } catch (err) {
      console.error('Failed to add stock:', err)
      setError(err.message || 'Failed to add stock')
      setLoading(false)
      throw err
    }
  }

  const updateStockQuantity = async (id, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await api.deleteStock(id)
        setStock(prev => prev.filter(item => item.id !== id))
      } else {
        await api.updateStock(id, { quantity: newQuantity })
        setStock(prev =>
          prev.map(item =>
            item.id === id ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString() } : item
          )
        )
      }
    } catch (err) {
      console.error('Failed to update stock quantity:', err)
      setError(err.message || 'Failed to update stock')
    }
  }

  const markAsDiscounted = async (id) => {
    setError(null)
    try {
      await api.updateStock(id, { status: 'Discounted' })
      await refreshStock()
    } catch (err) {
      console.error('Failed to mark as discounted:', err)
      setError(err.message || 'Failed to mark as discounted')
      throw err
    }
  }

  const returnToSupplier = async (id) => {
    setError(null)
    try {
      await api.updateStock(id, { status: 'Returned' })
      await refreshStock()
    } catch (err) {
      console.error('Failed to return stock to supplier:', err)
      setError(err.message || 'Failed to return stock to supplier')
      throw err
    }
  }

  const deleteStock = async (id) => {
    try {
      await api.deleteStock(id)
      setStock(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error('Failed to delete stock:', err)
      setError(err.message || 'Failed to delete stock')
      throw err
    }
  }

  const adjustStockQuantity = async (id, delta) => {
    const item = stock.find(s => s.id === id)
    if (!item) return
    const newQty = Math.max(0, item.quantity + delta)
    await updateStockQuantity(id, newQty)
  }

  // ── Waste ────────────────────────────────────────────────────────────────

  const logWaste = async (stockId, quantityWasted, reason, flowerName) => {
    setError(null)
    try {
      const stockItem = stock.find(item => item.id === stockId)
      const estimatedLoss = stockItem ? quantityWasted * (stockItem.costPerUnit || 0) : 0

      await api.createWaste({
        stockId,
        flowerName,
        quantityWasted,
        reason,
        estimatedLoss,
        shopCode: session.shopCode,
      })

      // Reduce stock quantity locally (and on backend)
      if (stockItem) {
        await updateStockQuantity(stockId, stockItem.quantity - quantityWasted)
      }

      // Re-fetch waste log
      await refreshWaste()
    } catch (err) {
      console.error('Failed to log waste:', err)
      setError(err.message || 'Failed to log waste')
      throw err
    }
  }

  // ── Returns (local-only for now) ─────────────────────────────────────────

  const [nextReturnId, setNextReturnId] = useState(1)

  const logReturn = (stockId, quantity, reason, flowerName, supplierName) => {
    const returnEntry = {
      id: nextReturnId,
      stockId,
      flowerName,
      quantity,
      reason,
      supplierName,
      date: new Date().toISOString()
    }
    setReturnLog(prev => [...prev, returnEntry])
    setNextReturnId(prev => prev + 1)

    const stockItem = stock.find(item => item.id === stockId)
    if (stockItem) {
      updateStockQuantity(stockId, stockItem.quantity - quantity)
    }
  }

  // ── Alerts ───────────────────────────────────────────────────────────────

  const dismissAlert = async (id) => {
    setError(null)
    try {
      await api.updateStock(id, { status: 'Dismissed' })
      await refreshStock()
    } catch (err) {
      console.error('Failed to dismiss alert:', err)
      setError(err.message || 'Failed to dismiss')
      throw err
    }
  }

  // ── Toast ────────────────────────────────────────────────────────────────

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  // ── Derived helpers ──────────────────────────────────────────────────────

  const getTotalStock = () => {
    return stock.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getAgeingItems = () => {
    return stock.filter(item => {
      if (item.status === 'Returned' || item.status === 'Dismissed') return false
      const days = getDaysSinceArrival(item.arrivalDate)
      return days >= 7
    })
  }

  const getNewArrivals = () => {
    return stock.filter(item => {
      const days = getDaysSinceArrival(item.arrivalDate)
      return days <= 3
    })
  }

  const getTotalWaste = () => {
    return wasteLog.reduce((sum, item) => sum + (item.quantityWasted || item.quantity || 0), 0)
  }

  const getWasteThisWeekLoss = () => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return wasteLog
      .filter(item => {
        const itemDate = new Date(item.createdAt || item.date)
        return itemDate >= sevenDaysAgo
      })
      .reduce((sum, item) => sum + (item.estimatedLoss || 0), 0)
  }

  const getDaysSinceArrival = (arrivalDate) => {
    const arrival = new Date(arrivalDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    arrival.setHours(0, 0, 0, 0)
    const diffTime = today - arrival
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  const getFreshnessStatus = (days) => {
    if (days <= 3) return 'fresh'
    if (days <= 6) return 'use-soon'
    return 'ageing'
  }

  const getFreshnessLabel = (days) => {
    if (days <= 3) return 'Fresh'
    if (days <= 6) return 'Use Soon'
    return 'Ageing'
  }

  const value = {
    session,
    stock,
    wasteLog,
    dismissedAlerts,
    toast,
    loading,
    error,
    login,
    logout,
    addStock,
    updateStockQuantity,
    markAsDiscounted,
    returnToSupplier,
    deleteStock,
    adjustStockQuantity,
    logWaste,
    logReturn,
    dismissAlert,
    showToast,
    refreshStock,
    getTotalStock,
    getAgeingItems,
    getNewArrivals,
    getTotalWaste,
    getWasteThisWeekLoss,
    getDaysSinceArrival,
    getFreshnessStatus,
    getFreshnessLabel
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}