"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/auth/login-screen"
import { PinLock } from "@/components/auth/pin-lock"
import { MainSalesScreen } from "@/components/pos/main-sales-screen-simple"

type AuthMode = "login" | "pin" | "authenticated"

export default function HomePage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [user, setUser] = useState<string | null>(null)

  const handleLogin = (username: string, password: string) => {
    // Demo authentication - in real app, validate against backend
    if (username && password) {
      setUser(username)
      setAuthMode("authenticated")
    }
  }

  const handlePinUnlock = (pin: string) => {
    // Demo PIN validation - in real app, validate against backend
    if (pin === "1234") {
      setUser("PIN User")
      setAuthMode("authenticated")
    }
  }

  const handleLogout = () => {
    setUser(null)
    setAuthMode("pin") // Go to PIN lock instead of full logout
  }

  if (authMode === "login") {
    return <LoginScreen onLogin={handleLogin} onPinMode={() => setAuthMode("pin")} />
  }

  if (authMode === "pin") {
    return <PinLock onUnlock={handlePinUnlock} onBack={() => setAuthMode("login")} />
  }

  return <MainSalesScreen user={user!} onLogout={handleLogout} />
}