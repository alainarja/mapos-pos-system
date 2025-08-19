"use client"

import { useState, useRef } from "react"
import { LoginScreen } from "@/components/auth/login-screen"
import { PinLock, type PinLockRef } from "@/components/auth/pin-lock"
import { MainSalesScreen } from "@/components/pos/main-sales-screen-simple"
import { maposUsersAuth, type AuthUser } from "@/lib/services/maposusers-auth"

type AuthMode = "login" | "pin" | "authenticated"

// Force rebuild to update environment variables - $(date)

export default function HomePage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const pinLockRef = useRef<PinLockRef>(null)

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true)
    setLoginError(null)
    try {
      const response = await maposUsersAuth.loginWithPassword({ email: username, password })
      
      // Log user data to check for warehouse info
      console.log('=== LOGIN SUCCESSFUL ===')
      console.log('User data received:', response.user)
      console.log('Warehouse/Store info in user:', {
        warehouseId: (response.user as any)?.warehouseId,
        warehouse: (response.user as any)?.warehouse,
        storeId: (response.user as any)?.storeId,
        store: (response.user as any)?.store,
        location: (response.user as any)?.location
      })
      
      // TEMPORARY: Add default warehouse to user if not provided by maposusers
      // This ensures invoices have warehouse prefix until maposusers is updated
      const userWithWarehouse = {
        ...response.user,
        warehouseId: (response.user as any)?.warehouseId || 'WH1',
        warehouseName: (response.user as any)?.warehouseName || 'Main Warehouse'
      }
      
      setUser(userWithWarehouse)
      setAuthMode("authenticated")
      setLoginError(null)
    } catch (error) {
      console.error('Login failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setLoginError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinUnlock = async (pin: string) => {
    try {
      const response = await maposUsersAuth.loginWithPin({ pin })
      
      // Log user data to check for warehouse info
      console.log('=== PIN LOGIN SUCCESSFUL ===')
      console.log('User data received:', response.user)
      console.log('Warehouse/Store info in user:', {
        warehouseId: (response.user as any)?.warehouseId,
        warehouse: (response.user as any)?.warehouse,
        storeId: (response.user as any)?.storeId,
        store: (response.user as any)?.store,
        location: (response.user as any)?.location
      })
      
      // TEMPORARY: Add default warehouse to user if not provided by maposusers
      // This ensures invoices have warehouse prefix until maposusers is updated
      const userWithWarehouse = {
        ...response.user,
        warehouseId: (response.user as any)?.warehouseId || 'WH1',
        warehouseName: (response.user as any)?.warehouseName || 'Main Warehouse'
      }
      
      setUser(userWithWarehouse)
      setAuthMode("authenticated")
      pinLockRef.current?.handleAuthResult(true)
    } catch (error) {
      console.error('PIN authentication failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      pinLockRef.current?.handleAuthResult(false, errorMessage)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setAuthMode("pin") // Go to PIN lock instead of full logout
  }

  if (authMode === "login") {
    return <LoginScreen 
      onLogin={handleLogin} 
      onPinMode={() => {
        setLoginError(null)
        setAuthMode("pin")
      }} 
      errorMessage={loginError}
    />
  }

  if (authMode === "pin") {
    return <PinLock ref={pinLockRef} onUnlock={handlePinUnlock} onBack={() => setAuthMode("login")} />
  }

  return <MainSalesScreen 
    user={user?.fullName || user?.email || 'User'} 
    userWarehouseId={(user as any)?.warehouseId}
    onLogout={handleLogout} 
  />
}