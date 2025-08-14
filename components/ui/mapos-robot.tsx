"use client"

import { useRive, useStateMachineInput, Fit, Alignment, Layout } from 'rive-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// Enhanced TypeScript interfaces
export type AnimationState = 
  | 'idle' 
  | 'excited' 
  | 'processing' 
  | 'error' 
  | 'blinking' 
  | 'hovering' 
  | 'cart-interaction' 
  | 'payment-success'
  | 'loading'

export type EyeColor = 'default' | 'red' | 'yellow' | 'green' | 'blue' | 'gray'

export type RobotSize = 'sm' | 'md' | 'lg' | 'xl' | 'custom'

interface MaposRobotProps {
  width?: number
  height?: number
  size?: RobotSize
  className?: string
  animation?: AnimationState
  eyeColor?: EyeColor
  autoResetAfter?: number // Auto reset to idle after ms
  showLoadingState?: boolean
  showErrorState?: boolean
  responsive?: boolean
  onLoad?: () => void
  onLoadError?: (error: any) => void
  onAnimationComplete?: (animationName: string) => void
  'aria-label'?: string
}

// Size presets for responsive design
const SIZE_PRESETS: Record<RobotSize, { width: number; height: number }> = {
  sm: { width: 80, height: 80 },
  md: { width: 120, height: 120 },
  lg: { width: 200, height: 200 },
  xl: { width: 300, height: 300 },
  custom: { width: 200, height: 200 }, // Will use provided width/height
}

export function MaposRobot({ 
  width, 
  height, 
  size = 'lg',
  className = '',
  animation = 'idle',
  eyeColor = 'default',
  autoResetAfter,
  showLoadingState = true,
  showErrorState = true,
  responsive = true,
  onLoad,
  onLoadError,
  onAnimationComplete,
  'aria-label': ariaLabel = 'Mapos Robot Animation'
}: MaposRobotProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentAnimation, setCurrentAnimation] = useState<AnimationState>(animation)
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate dimensions based on size preset or custom values
  const dimensions = size === 'custom' 
    ? { width: width || SIZE_PRESETS.lg.width, height: height || SIZE_PRESETS.lg.height }
    : SIZE_PRESETS[size]

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setLoadError(null)
    onLoad?.()
  }, [onLoad])

  const handleLoadError = useCallback((error: any) => {
    setLoadError(error?.message || 'Failed to load robot animation')
    console.error('Failed to load Mapos robot:', error)
    onLoadError?.(error)
  }, [onLoadError])

  const { RiveComponent, rive } = useRive({
    src: '/mapos.riv',
    artboard: 'Mapos',
    stateMachines: 'MaposStat',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    onLoad: handleLoad,
    onLoadError: handleLoadError,
  })

  // Get state machine inputs for controlling animations
  const cartHideInput = useStateMachineInput(rive, 'MaposStat', 'CartHide')
  const cartRevealInput = useStateMachineInput(rive, 'MaposStat', 'CartReveal')
  const promoHideInput = useStateMachineInput(rive, 'MaposStat', 'PromoHide')
  const promoRevealInput = useStateMachineInput(rive, 'MaposStat', 'PromoReveal')
  const eyeResetInput = useStateMachineInput(rive, 'MaposStat', 'EyeReset')

  // Simplified animation handler - just let the robot play its default animation
  const playAnimation = useCallback((animationType: AnimationState) => {
    if (!rive || !isLoaded) return

    // Clear any existing reset timeout
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }

    setCurrentAnimation(animationType)
    
    // Just let the robot run its default animations - don't try to control specific ones
    onAnimationComplete?.(animationType)

    // Auto reset to idle after specified time
    if (autoResetAfter && animationType !== 'idle' && animationType !== 'loading') {
      resetTimeoutRef.current = setTimeout(() => {
        playAnimation('idle')
      }, autoResetAfter)
    }
  }, [rive, isLoaded, autoResetAfter, onAnimationComplete])

  // Handle animation changes
  useEffect(() => {
    playAnimation(animation)
  }, [animation, playAnimation])

  // Enhanced eye color handler
  const setEyeColor = useCallback((color: EyeColor) => {
    if (!rive || !isLoaded) return

    switch (color) {
      case 'red':
        rive.play('EyeColorRed')
        break
      case 'yellow':
        rive.play('EyeColorYellow')
        break
      case 'green':
        rive.play('EyeColorGreen')
        break
      case 'blue':
        rive.play('EyeColorBlue')
        break
      case 'gray':
        rive.play('EyeColorGray')
        break
      case 'default':
      default:
        rive.play('EyeColorDefault')
        break
    }
  }, [rive, isLoaded])

  // Handle eye color changes
  useEffect(() => {
    setEyeColor(eyeColor)
  }, [eyeColor, setEyeColor])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  // Loading state component
  const LoadingState = () => (
    <div 
      className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200 animate-pulse"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-blue-600 font-medium">Loading Robot...</p>
      </div>
    </div>
  )

  // Error state component
  const ErrorState = () => (
    <div 
      className="flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-red-200"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <div className="text-center p-4">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="text-white text-xs font-bold">!</span>
        </div>
        <p className="text-sm text-red-600 font-medium">Robot Error</p>
        <p className="text-xs text-red-500 mt-1">Failed to load animation</p>
      </div>
    </div>
  )

  // Main container classes with responsive support
  const containerClasses = cn(
    'mapos-robot-container relative inline-block',
    {
      'w-full max-w-full': responsive,
      'transition-all duration-300 ease-in-out hover:scale-105': !loadError && isLoaded,
    },
    className
  )

  // Canvas classes - Force visibility
  const canvasClasses = cn(
    'mapos-robot-canvas',
    {
      'w-full h-full': responsive,
    }
  )

  return (
    <div 
      className={containerClasses}
      role="img" 
      aria-label={ariaLabel}
      style={{ 
        width: `${dimensions.width}px`, 
        height: `${dimensions.height}px`,
        minWidth: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
        display: 'block'
      }}
    >
      {/* Loading state */}
      {!isLoaded && !loadError && showLoadingState && <LoadingState />}
      
      {/* Error state */}
      {loadError && showErrorState && <ErrorState />}
      
      {/* Robot animation */}
      {!loadError && (
        <RiveComponent 
          className={canvasClasses}
          style={{
            // Force visibility and dimensions - always show the robot
            display: 'block',
            visibility: 'visible !important',
            width: '100%',
            height: '100%',
          }}
        />
      )}
      
    </div>
  )
}

// Enhanced hook for POS system integration
export function useMaposRobotController() {
  const [currentState, setCurrentState] = useState<AnimationState>('idle')
  const [currentEyeColor, setCurrentEyeColor] = useState<EyeColor>('default')
  
  // Animation control methods
  const playAnimation = useCallback((animation: AnimationState) => {
    setCurrentState(animation)
  }, [])

  const changeEyeColor = useCallback((color: EyeColor) => {
    setCurrentEyeColor(color)
  }, [])

  // POS-specific animation helpers
  const onCartAction = useCallback(() => {
    playAnimation('cart-interaction')
  }, [playAnimation])

  const onItemAdded = useCallback(() => {
    playAnimation('excited')
    changeEyeColor('green')
  }, [playAnimation, changeEyeColor])

  const onPaymentProcessing = useCallback(() => {
    playAnimation('processing')
    changeEyeColor('yellow')
  }, [playAnimation, changeEyeColor])

  const onPaymentSuccess = useCallback(() => {
    playAnimation('payment-success')
    changeEyeColor('green')
  }, [playAnimation, changeEyeColor])

  const onPaymentError = useCallback(() => {
    playAnimation('error')
    changeEyeColor('red')
  }, [playAnimation, changeEyeColor])

  const onSystemError = useCallback(() => {
    playAnimation('error')
    changeEyeColor('red')
  }, [playAnimation, changeEyeColor])

  const onIdle = useCallback(() => {
    playAnimation('idle')
    changeEyeColor('default')
  }, [playAnimation, changeEyeColor])

  const onLoading = useCallback(() => {
    playAnimation('loading')
    changeEyeColor('blue')
  }, [playAnimation, changeEyeColor])

  // System state manager
  const handlePOSEvent = useCallback((event: string, data?: any) => {
    switch (event) {
      case 'cart:add':
      case 'cart:update':
        onItemAdded()
        break
      case 'cart:remove':
        onCartAction()
        break
      case 'payment:start':
        onPaymentProcessing()
        break
      case 'payment:success':
        onPaymentSuccess()
        break
      case 'payment:error':
      case 'payment:failed':
        onPaymentError()
        break
      case 'system:error':
        onSystemError()
        break
      case 'system:loading':
        onLoading()
        break
      case 'system:idle':
      default:
        onIdle()
        break
    }
  }, [onItemAdded, onCartAction, onPaymentProcessing, onPaymentSuccess, onPaymentError, onSystemError, onLoading, onIdle])

  return {
    // Current state
    currentState,
    currentEyeColor,
    
    // Direct animation controls
    playAnimation,
    changeEyeColor,
    
    // POS-specific helpers
    onCartAction,
    onItemAdded,
    onPaymentProcessing,
    onPaymentSuccess,
    onPaymentError,
    onSystemError,
    onIdle,
    onLoading,
    
    // Event handler
    handlePOSEvent,
  }
}

// Performance optimization hook for POS systems
export function useMaposRobotPerformance() {
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('high')
  const [isVisible, setIsVisible] = useState(true)
  
  // Automatically adjust performance based on system load
  useEffect(() => {
    // Simple performance detection (can be enhanced with more sophisticated metrics)
    const checkPerformance = () => {
      const start = performance.now()
      requestAnimationFrame(() => {
        const delta = performance.now() - start
        if (delta > 16.67) { // Dropping below 60fps
          setPerformanceMode('medium')
        } else if (delta > 33.33) { // Dropping below 30fps
          setPerformanceMode('low')
        } else {
          setPerformanceMode('high')
        }
      })
    }

    const interval = setInterval(checkPerformance, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [])

  // Intersection observer to pause animations when not visible
  const intersectionRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )
    
    if (intersectionRef.current) {
      observer.observe(intersectionRef.current)
    }
    
    return () => observer.disconnect()
  }, [])

  return {
    performanceMode,
    isVisible,
    intersectionRef,
    setPerformanceMode,
  }
}