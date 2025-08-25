"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RestaurantPOS from "@/components/restaurant/restaurant-pos"
import { useUserStore } from "@/stores/user"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChefHat, Loader2 } from "lucide-react"

export default function RestaurantPage() {
  const router = useRouter()
  const { currentUser, isAuthenticated, login, logout } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  
  // Check if restaurant mode is enabled
  const isRestaurantMode = process.env.NEXT_PUBLIC_RESTAURANT_MODE === 'true'
  
  useEffect(() => {
    if (!isRestaurantMode) {
      router.push('/')
    }
  }, [isRestaurantMode, router])
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const success = await login(username, password)
      if (!success) {
        setError("Invalid username or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleLogout = () => {
    logout()
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
  
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Card className="w-96 bg-slate-800/50 backdrop-blur-xl border-slate-700">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-6">
                <ChefHat className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold">Restaurant POS</h2>
                <p className="text-sm text-muted-foreground">Sign in to access the system</p>
              </div>
              
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}
              
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="bg-slate-700/50 border-slate-600"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-slate-700/50 border-slate-600"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <RestaurantPOS 
      user={currentUser.username} 
      onLogout={handleLogout}
      warehouseId="WH1"
    />
  )
}