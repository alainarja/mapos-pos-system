"use client"

import React, { useEffect, useRef, useState } from 'react'
import { AnimatedBackground } from './animated-background'
import { ParticleSystem } from './particle-system'
import { GradientAnimation } from './gradient-animation'

interface InteractiveBackgroundProps {
  isDarkMode?: boolean
  children?: React.ReactNode
  className?: string
  enableShapes?: boolean
  enableParticles?: boolean
  enableGradients?: boolean
  intensity?: 'minimal' | 'moderate' | 'dynamic'
  responseMode?: 'subtle' | 'moderate' | 'energetic'
}

interface RippleEffect {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  startTime: number
}

export function InteractiveBackground({
  isDarkMode = false,
  children,
  className = '',
  enableShapes = true,
  enableParticles = true,
  enableGradients = true,
  intensity = 'moderate',
  responseMode = 'moderate'
}: InteractiveBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<RippleEffect[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [lastInteraction, setLastInteraction] = useState(Date.now())
  
  // Get settings based on intensity
  const getSettings = () => {
    switch (intensity) {
      case 'minimal':
        return {
          shapesIntensity: 'low' as const,
          particleDensity: 'low' as const,
          gradientIntensity: 'subtle' as const,
          interactionRadius: 80,
          rippleDuration: 1000
        }
      case 'dynamic':
        return {
          shapesIntensity: 'high' as const,
          particleDensity: 'high' as const,
          gradientIntensity: 'vibrant' as const,
          interactionRadius: 150,
          rippleDuration: 1500
        }
      default: // moderate
        return {
          shapesIntensity: 'medium' as const,
          particleDensity: 'medium' as const,
          gradientIntensity: 'medium' as const,
          interactionRadius: 120,
          rippleDuration: 1200
        }
    }
  }

  const settings = getSettings()

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsHovering(true)
      setLastInteraction(Date.now())
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
    }

    const handleClick = (e: MouseEvent) => {
      createRipple(e.clientX, e.clientY)
      setLastInteraction(Date.now())
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  // Create ripple effect
  const createRipple = (x: number, y: number) => {
    const newRipple: RippleEffect = {
      x,
      y,
      radius: 0,
      maxRadius: settings.interactionRadius,
      opacity: responseMode === 'energetic' ? 0.6 : responseMode === 'subtle' ? 0.2 : 0.4,
      startTime: Date.now()
    }

    setRipples(prev => [...prev, newRipple])
  }

  // Animate ripples
  useEffect(() => {
    const animateRipples = () => {
      const now = Date.now()
      
      setRipples(prev => prev
        .map(ripple => {
          const elapsed = now - ripple.startTime
          const progress = Math.min(elapsed / settings.rippleDuration, 1)
          
          return {
            ...ripple,
            radius: ripple.maxRadius * progress,
            opacity: ripple.opacity * (1 - progress)
          }
        })
        .filter(ripple => now - ripple.startTime < settings.rippleDuration)
      )

      requestAnimationFrame(animateRipples)
    }

    animateRipples()
  }, [settings.rippleDuration])

  // Idle animation trigger
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteraction
      
      // Create ambient ripples when idle for more than 10 seconds
      if (timeSinceLastInteraction > 10000 && intensity !== 'minimal') {
        const x = Math.random() * window.innerWidth
        const y = Math.random() * window.innerHeight
        createRipple(x, y)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [lastInteraction, intensity])

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Gradient animations layer */}
      {enableGradients && (
        <GradientAnimation
          isDarkMode={isDarkMode}
          pattern="flow"
          intensity={settings.gradientIntensity}
          speed="slow"
          className="absolute inset-0"
        />
      )}

      {/* Floating shapes layer */}
      {enableShapes && (
        <AnimatedBackground
          isDarkMode={isDarkMode}
          intensity={settings.shapesIntensity}
          interactionMode={responseMode !== 'subtle'}
        />
      )}

      {/* Particle system layer */}
      {enableParticles && (
        <ParticleSystem
          isDarkMode={isDarkMode}
          density={settings.particleDensity}
          type="mixed"
          interactive={responseMode !== 'subtle'}
        />
      )}

      {/* Interactive ripple effects */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {ripples.map((ripple, index) => (
          <div
            key={`${ripple.startTime}-${index}`}
            className="absolute rounded-full border-2 pointer-events-none"
            style={{
              left: ripple.x - ripple.radius,
              top: ripple.y - ripple.radius,
              width: ripple.radius * 2,
              height: ripple.radius * 2,
              borderColor: isDarkMode 
                ? `rgba(139, 92, 246, ${ripple.opacity})`
                : `rgba(139, 92, 246, ${ripple.opacity * 0.8})`,
              boxShadow: `0 0 ${ripple.radius * 0.3}px rgba(139, 92, 246, ${ripple.opacity * 0.5})`,
            }}
          />
        ))}
      </div>

      {/* Mouse follower effect */}
      {isHovering && responseMode !== 'subtle' && (
        <div
          className="fixed pointer-events-none z-30 transition-opacity duration-300"
          style={{
            left: mousePosition.x - 40,
            top: mousePosition.y - 40,
            width: 80,
            height: 80,
          }}
        >
          <div 
            className="w-full h-full rounded-full opacity-20 animate-ping"
            style={{
              background: isDarkMode 
                ? 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)'
            }}
          />
        </div>
      )}

      {/* Ambient glow effects */}
      {intensity === 'dynamic' && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div 
            className="absolute w-96 h-96 rounded-full opacity-30 animate-pulse"
            style={{
              background: isDarkMode
                ? 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
              left: '10%',
              top: '20%',
              animation: 'float 20s infinite ease-in-out'
            }}
          />
          <div 
            className="absolute w-64 h-64 rounded-full opacity-20 animate-pulse"
            style={{
              background: isDarkMode
                ? 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
              right: '15%',
              bottom: '25%',
              animation: 'float 25s infinite ease-in-out reverse'
            }}
          />
        </div>
      )}

      {/* Content layer */}
      <div className="relative z-40">
        {children}
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -40px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(40px, 10px) scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}

// Specialized background components
export function MinimalInteractiveBackground(props: Omit<InteractiveBackgroundProps, 'intensity'>) {
  return (
    <InteractiveBackground 
      {...props} 
      intensity="minimal"
      responseMode="subtle"
    />
  )
}

export function DynamicInteractiveBackground(props: Omit<InteractiveBackgroundProps, 'intensity'>) {
  return (
    <InteractiveBackground 
      {...props} 
      intensity="dynamic"
      responseMode="energetic"
    />
  )
}

export function SmartPOSBackground(props: Omit<InteractiveBackgroundProps, 'intensity' | 'enableShapes' | 'enableParticles' | 'enableGradients'>) {
  return (
    <InteractiveBackground 
      {...props}
      intensity="minimal"
      enableShapes={true}
      enableParticles={false}
      enableGradients={true}
      responseMode="minimal"
    />
  )
}