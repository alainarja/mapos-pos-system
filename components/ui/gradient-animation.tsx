"use client"

import React, { useEffect, useState } from 'react'

interface GradientAnimationProps {
  children?: React.ReactNode
  className?: string
  isDarkMode?: boolean
  speed?: 'slow' | 'normal' | 'fast'
  pattern?: 'wave' | 'pulse' | 'flow' | 'aurora'
  intensity?: 'subtle' | 'medium' | 'vibrant'
}

export function GradientAnimation({ 
  children, 
  className = '',
  isDarkMode = false,
  speed = 'normal',
  pattern = 'flow',
  intensity = 'medium'
}: GradientAnimationProps) {
  const [animationState, setAnimationState] = useState(0)

  useEffect(() => {
    const speedMultiplier = speed === 'slow' ? 0.5 : speed === 'fast' ? 2 : 1
    const interval = setInterval(() => {
      setAnimationState(prev => (prev + (1 * speedMultiplier)) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [speed])

  const getIntensityValues = () => {
    switch (intensity) {
      case 'subtle':
        return { opacity: isDarkMode ? 0.1 : 0.05, blur: '40px', saturation: 40 }
      case 'medium':
        return { opacity: isDarkMode ? 0.15 : 0.08, blur: '30px', saturation: 60 }
      case 'vibrant':
        return { opacity: isDarkMode ? 0.25 : 0.12, blur: '20px', saturation: 80 }
      default:
        return { opacity: isDarkMode ? 0.15 : 0.08, blur: '30px', saturation: 60 }
    }
  }

  const { opacity, blur, saturation } = getIntensityValues()

  const getGradientStyle = () => {
    const baseHue = 260 // Purple base
    const hue1 = (baseHue + animationState * 0.5) % 360
    const hue2 = (baseHue + 40 + animationState * 0.3) % 360
    const hue3 = (baseHue - 20 + animationState * 0.7) % 360

    switch (pattern) {
      case 'wave':
        return {
          background: `
            radial-gradient(ellipse at ${50 + Math.sin(animationState * 0.02) * 30}% ${50 + Math.cos(animationState * 0.01) * 20}%, 
              hsla(${hue1}, ${saturation}%, ${isDarkMode ? 30 : 70}%, ${opacity}) 0%, 
              transparent 70%),
            radial-gradient(ellipse at ${50 + Math.cos(animationState * 0.015) * 40}% ${50 + Math.sin(animationState * 0.025) * 30}%, 
              hsla(${hue2}, ${saturation}%, ${isDarkMode ? 35 : 75}%, ${opacity * 0.8}) 0%, 
              transparent 60%),
            radial-gradient(ellipse at ${50 + Math.sin(animationState * 0.01) * 20}% ${50 + Math.cos(animationState * 0.02) * 25}%, 
              hsla(${hue3}, ${saturation}%, ${isDarkMode ? 25 : 65}%, ${opacity * 0.6}) 0%, 
              transparent 80%)
          `,
          filter: `blur(${blur})`
        }

      case 'pulse':
        const pulseScale = 1 + Math.sin(animationState * 0.05) * 0.3
        return {
          background: `
            radial-gradient(circle at 50% 50%, 
              hsla(${hue1}, ${saturation}%, ${isDarkMode ? 30 : 70}%, ${opacity * pulseScale}) 0%, 
              transparent ${60 + pulseScale * 10}%),
            radial-gradient(circle at 30% 70%, 
              hsla(${hue2}, ${saturation}%, ${isDarkMode ? 35 : 75}%, ${opacity * 0.7}) 0%, 
              transparent 50%),
            radial-gradient(circle at 70% 30%, 
              hsla(${hue3}, ${saturation}%, ${isDarkMode ? 25 : 65}%, ${opacity * 0.5}) 0%, 
              transparent 50%)
          `,
          filter: `blur(${blur})`
        }

      case 'aurora':
        return {
          background: `
            linear-gradient(${animationState}deg, 
              hsla(${hue1}, ${saturation}%, ${isDarkMode ? 30 : 70}%, ${opacity}) 0%, 
              hsla(${hue2}, ${saturation}%, ${isDarkMode ? 35 : 75}%, ${opacity * 0.8}) 25%,
              transparent 50%,
              hsla(${hue3}, ${saturation}%, ${isDarkMode ? 25 : 65}%, ${opacity * 0.6}) 75%,
              hsla(${hue1}, ${saturation}%, ${isDarkMode ? 30 : 70}%, ${opacity}) 100%),
            radial-gradient(ellipse at ${50 + Math.sin(animationState * 0.01) * 20}% ${50 + Math.cos(animationState * 0.01) * 20}%, 
              hsla(${hue2}, ${saturation}%, ${isDarkMode ? 40 : 80}%, ${opacity * 0.5}) 0%, 
              transparent 70%)
          `,
          filter: `blur(${blur})`
        }

      case 'flow':
      default:
        return {
          background: `
            conic-gradient(from ${animationState}deg at 20% 30%, 
              hsla(${hue1}, ${saturation}%, ${isDarkMode ? 30 : 70}%, ${opacity}) 0deg, 
              transparent 120deg, 
              hsla(${hue2}, ${saturation}%, ${isDarkMode ? 35 : 75}%, ${opacity * 0.8}) 180deg, 
              transparent 300deg),
            conic-gradient(from ${-animationState * 0.8}deg at 80% 70%, 
              hsla(${hue2}, ${saturation}%, ${isDarkMode ? 25 : 65}%, ${opacity * 0.7}) 0deg, 
              transparent 120deg, 
              hsla(${hue3}, ${saturation}%, ${isDarkMode ? 35 : 75}%, ${opacity * 0.6}) 180deg, 
              transparent 300deg),
            radial-gradient(ellipse at center, 
              hsla(${hue1}, ${saturation}%, ${isDarkMode ? 20 : 60}%, ${opacity * 0.3}) 0%, 
              transparent 70%)
          `,
          filter: `blur(${blur})`
        }
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={getGradientStyle()}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Additional overlay for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDarkMode 
            ? 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.1) 100%)'
            : 'radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.1) 100%)',
          mixBlendMode: isDarkMode ? 'multiply' : 'overlay'
        }}
      />
    </div>
  )
}

// Specialized gradient components
export function WaveGradient({ children, className, isDarkMode }: Omit<GradientAnimationProps, 'pattern'>) {
  return (
    <GradientAnimation 
      pattern="wave" 
      className={className} 
      isDarkMode={isDarkMode}
    >
      {children}
    </GradientAnimation>
  )
}

export function PulseGradient({ children, className, isDarkMode }: Omit<GradientAnimationProps, 'pattern'>) {
  return (
    <GradientAnimation 
      pattern="pulse" 
      className={className} 
      isDarkMode={isDarkMode}
    >
      {children}
    </GradientAnimation>
  )
}

export function AuroraGradient({ children, className, isDarkMode }: Omit<GradientAnimationProps, 'pattern'>) {
  return (
    <GradientAnimation 
      pattern="aurora" 
      className={className} 
      isDarkMode={isDarkMode}
      speed="slow"
      intensity="vibrant"
    >
      {children}
    </GradientAnimation>
  )
}

export function FlowGradient({ children, className, isDarkMode }: Omit<GradientAnimationProps, 'pattern'>) {
  return (
    <GradientAnimation 
      pattern="flow" 
      className={className} 
      isDarkMode={isDarkMode}
    >
      {children}
    </GradientAnimation>
  )
}