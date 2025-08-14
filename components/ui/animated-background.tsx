"use client"

import React, { useEffect, useRef } from 'react'

interface FloatingShapeProps {
  x: number
  y: number
  size: number
  speed: number
  rotation: number
  shape: 'circle' | 'triangle' | 'square' | 'hexagon'
  color: string
  opacity: number
}

interface AnimatedBackgroundProps {
  isDarkMode?: boolean
  intensity?: 'low' | 'medium' | 'high'
  interactionMode?: boolean
}

export function AnimatedBackground({ 
  isDarkMode = false, 
  intensity = 'medium',
  interactionMode = true 
}: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const shapesRef = useRef<FloatingShapeProps[]>([])
  const animationFrameRef = useRef<number>()

  // Shape generation based on intensity
  const getShapeCount = () => {
    switch (intensity) {
      case 'low': return 8
      case 'medium': return 15
      case 'high': return 25
      default: return 15
    }
  }

  // Initialize floating shapes
  useEffect(() => {
    const initializeShapes = () => {
      const shapes: FloatingShapeProps[] = []
      const shapeCount = getShapeCount()
      const shapeTypes: FloatingShapeProps['shape'][] = ['circle', 'triangle', 'square', 'hexagon']
      
      for (let i = 0; i < shapeCount; i++) {
        shapes.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 60 + 20, // 20-80px
          speed: Math.random() * 0.5 + 0.1, // 0.1-0.6
          rotation: Math.random() * 360,
          shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
          color: isDarkMode 
            ? `hsl(${260 + Math.random() * 60}, 60%, ${50 + Math.random() * 30}%)`
            : `hsl(${260 + Math.random() * 60}, 70%, ${60 + Math.random() * 20}%)`,
          opacity: Math.random() * 0.3 + 0.1 // 0.1-0.4
        })
      }
      
      shapesRef.current = shapes
    }

    initializeShapes()
    
    // Reinitialize on window resize
    const handleResize = () => initializeShapes()
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isDarkMode, intensity])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) return

      shapesRef.current.forEach((shape) => {
        // Update position with floating motion
        shape.y -= shape.speed
        shape.x += Math.sin(shape.y * 0.001) * 0.5
        shape.rotation += 0.2

        // Reset position when shape goes off screen
        if (shape.y < -shape.size) {
          shape.y = window.innerHeight + shape.size
          shape.x = Math.random() * window.innerWidth
        }
        if (shape.x < -shape.size) {
          shape.x = window.innerWidth + shape.size
        }
        if (shape.x > window.innerWidth + shape.size) {
          shape.x = -shape.size
        }
      })

      // Trigger re-render by updating container data
      if (containerRef.current) {
        containerRef.current.style.setProperty('--animation-tick', Date.now().toString())
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Mouse interaction effect
  useEffect(() => {
    if (!interactionMode) return

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      
      shapesRef.current.forEach((shape) => {
        const distance = Math.sqrt(
          Math.pow(clientX - shape.x, 2) + Math.pow(clientY - shape.y, 2)
        )
        
        if (distance < 150) {
          const force = (150 - distance) / 150
          const angle = Math.atan2(shape.y - clientY, shape.x - clientX)
          shape.x += Math.cos(angle) * force * 2
          shape.y += Math.sin(angle) * force * 2
        }
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [interactionMode])

  // Render shapes as SVG
  const renderShape = (shape: FloatingShapeProps, index: number) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: shape.x - shape.size / 2,
      top: shape.y - shape.size / 2,
      width: shape.size,
      height: shape.size,
      opacity: shape.opacity,
      transform: `rotate(${shape.rotation}deg)`,
      pointerEvents: 'none' as const,
      filter: isDarkMode ? 'blur(1px)' : 'blur(0.5px)',
    }

    const svgProps = {
      width: shape.size,
      height: shape.size,
      viewBox: `0 0 ${shape.size} ${shape.size}`,
      style: { filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))' }
    }

    switch (shape.shape) {
      case 'circle':
        return (
          <div key={index} style={baseStyle}>
            <svg {...svgProps}>
              <circle 
                cx={shape.size / 2} 
                cy={shape.size / 2} 
                r={shape.size / 3} 
                fill={shape.color}
                stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                strokeWidth="1"
              />
            </svg>
          </div>
        )
      
      case 'triangle':
        const trianglePoints = `${shape.size/2},${shape.size*0.2} ${shape.size*0.2},${shape.size*0.8} ${shape.size*0.8},${shape.size*0.8}`
        return (
          <div key={index} style={baseStyle}>
            <svg {...svgProps}>
              <polygon 
                points={trianglePoints} 
                fill={shape.color}
                stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                strokeWidth="1"
              />
            </svg>
          </div>
        )
      
      case 'square':
        return (
          <div key={index} style={baseStyle}>
            <svg {...svgProps}>
              <rect 
                x={shape.size * 0.25} 
                y={shape.size * 0.25} 
                width={shape.size * 0.5} 
                height={shape.size * 0.5}
                fill={shape.color}
                stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                strokeWidth="1"
                rx="4"
              />
            </svg>
          </div>
        )
      
      case 'hexagon':
        const hexPoints = Array.from({length: 6}, (_, i) => {
          const angle = (i * 60) * Math.PI / 180
          const x = shape.size/2 + (shape.size/3) * Math.cos(angle)
          const y = shape.size/2 + (shape.size/3) * Math.sin(angle)
          return `${x},${y}`
        }).join(' ')
        
        return (
          <div key={index} style={baseStyle}>
            <svg {...svgProps}>
              <polygon 
                points={hexPoints} 
                fill={shape.color}
                stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                strokeWidth="1"
              />
            </svg>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: isDarkMode 
          ? 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.05) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.03) 0%, transparent 70%)'
      }}
    >
      {shapesRef.current.map((shape, index) => renderShape(shape, index))}
      
      {/* Additional ambient light effects */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDarkMode
            ? `radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
               radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%),
               radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.04) 0%, transparent 50%)`
            : `radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.04) 0%, transparent 50%),
               radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.03) 0%, transparent 50%),
               radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.02) 0%, transparent 50%)`
        }}
      />
    </div>
  )
}