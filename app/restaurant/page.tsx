"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import RestaurantPOS from "@/components/restaurant/restaurant-pos"
import { LoginScreen } from "@/components/auth/login-screen"
import { PinLock, type PinLockRef } from "@/components/auth/pin-lock"
import { maposUsersAuth, type AuthUser } from "@/lib/services/maposusers-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChefHat } from "lucide-react"

type AuthMode = "login" | "pin" | "authenticated"

export default function RestaurantPage() {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const pinLockRef = useRef<PinLockRef>(null)
  
  // Check if restaurant mode is enabled
  const isRestaurantMode = process.env.NEXT_PUBLIC_RESTAURANT_MODE === 'true'
  
  useEffect(() => {
    if (!isRestaurantMode) {
      router.push('/')
    }
  }, [isRestaurantMode, router])
  
  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true)
    setLoginError(null)
    try {
      const response = await maposUsersAuth.loginWithPassword({ email: username, password })
      
      // Log user data to check for warehouse info
      console.log('=== LOGIN SUCCESSFUL ===')
      console.log('Full response:', response)
      console.log('User data received:', response.user)
      console.log('Warehouse data in user:', {
        warehouseId: response.user.warehouseId,
        warehouseName: response.user.warehouseName,
        locationId: response.user.locationId,
        locationName: response.user.locationName
      })
      
      // Set user directly from response
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
    setIsLoading(true)
    try {
      // Check if we have a stored user ID in localStorage for PIN unlock
      const storedUserId = localStorage.getItem('mapos_pin_user_id')
      
      if (storedUserId) {
        const response = await maposUsersAuth.loginWithPin({ userId: storedUserId, pin })
        
        console.log('=== PIN LOGIN SUCCESSFUL ===')
        console.log('User data received:', response.user)
        
        setUser(response.user)
        setAuthMode("authenticated")
      } else {
        pinLockRef.current?.setError("Please use password login first")
      }
    } catch (error) {
      console.error('PIN unlock failed:', error)
      pinLockRef.current?.setError("Invalid PIN")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setAuthMode("pin")
  }

  const handleFullLogout = () => {
    localStorage.removeItem('mapos_pin_user_id')
    setUser(null)
    setAuthMode("login")
    router.push('/')
  }
  
  if (!isRestaurantMode) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Card className="w-96 bg-slate-800/50 backdrop-blur-xl border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <ChefHat className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h2 className="text-xl font-semibold mb-2">Restaurant Mode Disabled</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Restaurant mode is not enabled. Please set NEXT_PUBLIC_RESTAURANT_MODE=true in your environment variables.
              </p>
              <Button onClick={() => router.push('/')}>
                Return to POS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render based on authentication mode
  if (authMode === "login") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onSwitchToPin={() => setAuthMode("pin")}
        error={loginError}
        isLoading={isLoading}
      />
    )
  }

  if (authMode === "pin") {
    return (
      <PinLock
        ref={pinLockRef}
        onUnlock={handlePinUnlock}
        onSwitchToLogin={() => setAuthMode("login")}
        isLoading={isLoading}
      />
    )
  }

  // Authenticated - show restaurant POS
  if (user) {
    return (
      <RestaurantPOS 
        user={user.name || user.email || "User"} 
        onLogout={handleLogout}
        warehouseId={user.warehouseId}
      />
    )
  }

  return null
}