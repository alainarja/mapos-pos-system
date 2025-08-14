"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import { containerVariants, itemVariants, floatVariants, loadingVariants } from "@/lib/animations"

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void
  onPinMode: () => void
}

export function LoginScreen({ onLogin, onPinMode }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login delay
    setTimeout(() => {
      onLogin(username, password)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.55, 0.25]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.h1 
            className="text-4xl font-bruno-ace text-white mb-2"
            variants={itemVariants}
          >
            MAPOS
          </motion.h1>
          <motion.p 
            className="text-slate-300"
            variants={itemVariants}
          >
            Modern Point of Sale System
          </motion.p>
        </motion.div>

        <Card 
          className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500"
        >
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <motion.div className="relative">
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Image
                    src="/images/mapos-robot.png"
                    alt="MAPOS Robot"
                    width={64}
                    height={64}
                    className="rounded-lg"
                  />
                </motion.div>
                <motion.div 
                  className="absolute inset-0 bg-cyan-400/30 rounded-lg blur-lg"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
            <motion.h2 
              className="text-2xl font-semibold text-white"
              variants={itemVariants}
            >
              Welcome Back
            </motion.h2>
            <motion.p 
              className="text-slate-300"
              variants={itemVariants}
            >
              Sign in to access your POS system
            </motion.p>
          </CardHeader>

          <CardContent className="space-y-4">
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-4"
              variants={containerVariants}
            >
              <motion.div className="relative group" variants={itemVariants}>
                <motion.div
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10"
                  animate={{
                    color: username ? "#a855f7" : "#94a3b8"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <User />
                </motion.div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:bg-white/15 transition-all duration-300 hover:bg-white/12"
                  required
                  animated
                />
              </motion.div>

              <motion.div className="relative group" variants={itemVariants}>
                <motion.div
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10"
                  animate={{
                    color: password ? "#a855f7" : "#94a3b8"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Lock />
                </motion.div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:bg-white/15 transition-all duration-300 hover:bg-white/12"
                  required
                  animated
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-300 z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <motion.div 
                      className="flex items-center gap-2"
                      variants={loadingVariants}
                      animate="animate"
                    >
                      <motion.div 
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Signing In...
                    </motion.div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </motion.div>
            </motion.form>

            <motion.div 
              className="pt-4 border-t border-white/20"
              variants={itemVariants}
            >
              <Button
                onClick={onPinMode}
                variant="outline"
                className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Use PIN Instead
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        <motion.div 
          className="text-center mt-6 text-slate-400 text-sm"
          variants={itemVariants}
        >
          <p>© 2024 MAPOS. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
