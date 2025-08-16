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
      setUser(response.user)
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
      setUser(response.user)
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

  return <MainSalesScreen user={user?.fullName || user?.email || 'User'} onLogout={handleLogout} />
}