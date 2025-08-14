"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LoginScreen } from "@/components/auth/login-screen"
import { PinLock } from "@/components/auth/pin-lock"
import { MainSalesScreen } from "@/components/pos/main-sales-screen-simple"
import { slideTransitions } from "@/lib/animations"

type AuthMode = "login" | "pin" | "authenticated"

export default function HomePage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [user, setUser] = useState<string | null>(null)
  const [direction, setDirection] = useState(0)

  const handleLogin = (username: string, password: string) => {
    // Demo authentication - in real app, validate against backend
    if (username && password) {
      setUser(username)
      setDirection(1)
      setAuthMode("authenticated")
    }
  }

  const handlePinUnlock = (pin: string) => {
    // Demo PIN validation - in real app, validate against backend
    if (pin === "1234") {
      setUser("PIN User")
      setDirection(1)
      setAuthMode("authenticated")
    }
  }

  const handleLogout = () => {
    setUser(null)
    setDirection(-1)
    setAuthMode("pin") // Go to PIN lock instead of full logout
  }

  const handlePinMode = () => {
    setDirection(1)
    setAuthMode("pin")
  }

  const handleBackToLogin = () => {
    setDirection(-1)
    setAuthMode("login")
  }

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        {authMode === "login" && (
          <motion.div
            key="login"
            custom={direction}
            variants={slideTransitions}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <LoginScreen onLogin={handleLogin} onPinMode={handlePinMode} />
          </motion.div>
        )}

        {authMode === "pin" && (
          <motion.div
            key="pin"
            custom={direction}
            variants={slideTransitions}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PinLock onUnlock={handlePinUnlock} onBack={handleBackToLogin} />
          </motion.div>
        )}

        {authMode === "authenticated" && (
          <motion.div
            key="main"
            custom={direction}
            variants={slideTransitions}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <MainSalesScreen user={user!} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
