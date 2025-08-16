"use client"

import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SoundButton } from "@/components/ui/sound-button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Delete } from "lucide-react"
import { useSound } from "@/hooks/use-sound"

interface PinLockProps {
  onUnlock: (pin: string) => void
  onBack: () => void
  title?: string
  subtitle?: string
}

export interface PinLockRef {
  handleAuthResult: (success: boolean, error?: string) => void
  clearPin: () => void
}

export const PinLock = forwardRef<PinLockRef, PinLockProps>(({
  onUnlock,
  onBack,
  title = "Enter PIN",
  subtitle = "Enter your 4-digit PIN to continue",
}, ref) => {
  const [pin, setPin] = useState("")
  const [isShaking, setIsShaking] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { playBeep, playSuccess, playError } = useSound()

  const handleNumberClick = (number: string) => {
    if (pin.length < 4 && !isLocked && !isProcessing) {
      const newPin = pin + number
      setPin(newPin)
      playBeep() // Play beep for each digit entry

      // Auto-submit when 4 digits entered
      if (newPin.length === 4) {
        setIsProcessing(true)
        setTimeout(() => {
          // Pass the PIN to the parent component for authentication
          onUnlock(newPin)
          setIsProcessing(false)
        }, 300)
      }
    }
  }

  const handleDelete = () => {
    if (!isLocked && !isProcessing) {
      setPin(pin.slice(0, -1))
      playBeep() // Play beep for delete action
    }
  }

  const handleClear = () => {
    if (!isLocked && !isProcessing) {
      setPin("")
    }
  }

  const handleFailedAttempt = (error?: string) => {
    const newFailedAttempts = failedAttempts + 1
    setFailedAttempts(newFailedAttempts)
    setIsShaking(true)
    playError() // Play error sound for wrong PIN

    // Set appropriate error message
    if (error?.includes('fetch') || error?.includes('CORS') || error?.includes('ERR_FAILED')) {
      setErrorMessage("Connection error. Please check your network.")
    } else {
      setErrorMessage("Invalid PIN. Please try again.")
    }

    setTimeout(() => {
      setPin("")
      setIsShaking(false)
      setErrorMessage(null) // Clear error message after a delay
    }, 3000)

    // Lock after 3 failed attempts
    if (newFailedAttempts >= 3) {
      setIsLocked(true)
      setLockoutTime(30) // 30 seconds lockout
    }
  }

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleAuthResult: (success: boolean, error?: string) => {
      if (success) {
        playSuccess()
        setErrorMessage(null)
      } else {
        handleFailedAttempt(error)
      }
    },
    clearPin: () => {
      setPin("")
    }
  }))

  // Lockout countdown
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => {
        setLockoutTime(lockoutTime - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isLocked && lockoutTime === 0) {
      setIsLocked(false)
      setFailedAttempts(0)
    }
  }, [lockoutTime, isLocked])

  const numberPad = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["clear", "0", "delete"],
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Back Button - Top Left */}
      <Button
        onClick={onBack}
        variant="outline"
        className="absolute top-6 left-6 z-20 bg-transparent border-white/20 text-white/90 hover:text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm hover:scale-105"
        disabled={isProcessing}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-32 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-28 h-28 bg-violet-500/20 rounded-full blur-xl animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-spin"
          style={{ animationDuration: "20s" }}
        ></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-2xl blur-lg animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-2xl">
                <Image
                  src="/images/mapos-robot.png"
                  alt="MAPOS Robot"
                  width={80}
                  height={80}
                  className="rounded-lg animate-bounce"
                  style={{ animationDuration: "2s" }}
                />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bruno-ace bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-3 animate-fade-in">
            {title}
          </h1>
          <p className="text-purple-200/80 text-sm animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {subtitle}
          </p>
          {isLocked && (
            <p className="text-red-400 text-sm mt-2 animate-pulse">
              Too many failed attempts. Try again in {lockoutTime}s
            </p>
          )}
          {failedAttempts > 0 && !isLocked && (
            <p className="text-orange-400 text-sm mt-2">{3 - failedAttempts} attempts remaining</p>
          )}
          {errorMessage && (
            <p className="text-red-400 text-sm mt-2 animate-pulse bg-red-900/20 px-3 py-1 rounded-md border border-red-400/30">
              {errorMessage}
            </p>
          )}
        </div>

        <div className={`flex justify-center space-x-6 mb-8 ${isShaking ? "animate-shake" : ""}`}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`relative transition-all duration-300 ${index < pin.length ? "animate-scale-in" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                  index < pin.length
                    ? "bg-gradient-to-r from-purple-400 to-blue-400 border-white shadow-lg shadow-purple-400/50"
                    : "border-white/40 hover:border-white/60"
                }`}
              />
              {index < pin.length && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-ping opacity-20"></div>
              )}
            </div>
          ))}
        </div>

        <Card className="backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl shadow-purple-900/20 animate-slide-up">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {numberPad.map((row, rowIndex) =>
                row.map((item, colIndex) => {
                  if (item === "clear") {
                    return (
                      <Button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={handleClear}
                        variant="ghost"
                        className="h-16 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 backdrop-blur-sm border border-white/5 hover:border-white/20 disabled:opacity-30"
                        disabled={pin.length === 0 || isLocked || isProcessing}
                      >
                        Clear
                      </Button>
                    )
                  }

                  if (item === "delete") {
                    return (
                      <Button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={handleDelete}
                        variant="ghost"
                        className="h-16 text-white/80 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 backdrop-blur-sm border border-white/5 hover:border-white/20 disabled:opacity-30"
                        disabled={pin.length === 0 || isLocked || isProcessing}
                      >
                        <Delete className="w-6 h-6" />
                      </Button>
                    )
                  }

                  return (
                    <Button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleNumberClick(item)}
                      variant="ghost"
                      className="h-16 text-2xl font-semibold text-white/90 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 backdrop-blur-sm border border-white/5 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-30"
                      disabled={isLocked || isProcessing}
                    >
                      {item}
                    </Button>
                  )
                }),
              )}
            </div>

            {isProcessing && (
              <div className="flex justify-center mt-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  )
})

PinLock.displayName = 'PinLock'
