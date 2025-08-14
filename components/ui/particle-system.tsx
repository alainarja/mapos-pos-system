"use client"

import React, { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
  opacity: number
  type: 'dot' | 'star' | 'sparkle' | 'bubble'
}

interface ParticleSystemProps {
  isDarkMode?: boolean
  density?: 'low' | 'medium' | 'high'
  type?: 'floating' | 'sparkles' | 'bubbles' | 'stars' | 'mixed'
  interactive?: boolean
  className?: string
}

export function ParticleSystem({
  isDarkMode = false,
  density = 'medium',
  type = 'mixed',
  interactive = true,
  className = ''
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Get particle count based on density
  const getParticleCount = () => {
    const base = Math.floor((dimensions.width * dimensions.height) / 15000)
    switch (density) {
      case 'low': return Math.max(base * 0.5, 10)
      case 'medium': return Math.max(base, 20)
      case 'high': return Math.max(base * 1.5, 30)
      default: return Math.max(base, 20)
    }
  }

  // Initialize particles
  const createParticle = (x?: number, y?: number): Particle => {
    const particleTypes: Particle['type'][] = 
      type === 'mixed' 
        ? ['dot', 'star', 'sparkle', 'bubble']
        : [type as Particle['type']]
    
    const particleType = particleTypes[Math.floor(Math.random() * particleTypes.length)]
    
    return {
      x: x ?? Math.random() * dimensions.width,
      y: y ?? Math.random() * dimensions.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      life: Math.random() * 300 + 200,
      maxLife: Math.random() * 300 + 200,
      color: isDarkMode 
        ? `hsl(${260 + Math.random() * 60}, 60%, ${60 + Math.random() * 30}%)`
        : `hsl(${260 + Math.random() * 60}, 70%, ${50 + Math.random() * 30}%)`,
      opacity: Math.random() * 0.6 + 0.2,
      type: particleType
    }
  }

  // Update canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        })
        
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Initialize particle system
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const particleCount = getParticleCount()
    particlesRef.current = Array.from({ length: particleCount }, () => createParticle())
  }, [dimensions, density, type, isDarkMode])

  // Mouse interaction
  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleClick = (e: MouseEvent) => {
      // Create burst of particles at click location
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
          ...createParticle(e.clientX, e.clientY),
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 60,
          maxLife: 60,
          size: Math.random() * 5 + 2,
          type: 'sparkle'
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [interactive])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life--

        // Apply physics
        particle.vy += 0.001 // gentle gravity
        particle.vx *= 0.999 // air resistance

        // Mouse interaction
        if (interactive) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 100) {
            const force = (100 - distance) / 100 * 0.02
            particle.vx += (dx / distance) * force
            particle.vy += (dy / distance) * force
          }
        }

        // Wrap around screen edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Calculate alpha based on life
        const lifeRatio = particle.life / particle.maxLife
        const alpha = particle.opacity * Math.min(lifeRatio * 2, 1)

        // Draw particle based on type
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = particle.color

        switch (particle.type) {
          case 'dot':
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fill()
            break

          case 'star':
            drawStar(ctx, particle.x, particle.y, particle.size, particle.color)
            break

          case 'sparkle':
            drawSparkle(ctx, particle.x, particle.y, particle.size, particle.color)
            break

          case 'bubble':
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.strokeStyle = particle.color
            ctx.lineWidth = 1
            ctx.stroke()
            // Add inner highlight
            ctx.beginPath()
            ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
            ctx.fill()
            break
        }

        ctx.restore()

        // Remove dead particles
        return particle.life > 0
      })

      // Add new particles to maintain count
      while (particlesRef.current.length < getParticleCount()) {
        particlesRef.current.push(createParticle())
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [dimensions, interactive, isDarkMode])

  // Helper function to draw star
  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    const spikes = 5
    const outerRadius = size
    const innerRadius = size * 0.4

    ctx.beginPath()
    ctx.moveTo(x, y - outerRadius)

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI) / spikes
      const pointX = x + Math.cos(angle - Math.PI / 2) * radius
      const pointY = y + Math.sin(angle - Math.PI / 2) * radius
      ctx.lineTo(pointX, pointY)
    }

    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  // Helper function to draw sparkle
  const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    const rays = 4
    const length = size * 2

    ctx.strokeStyle = color
    ctx.lineWidth = size * 0.3

    for (let i = 0; i < rays; i++) {
      const angle = (i * Math.PI) / (rays / 2)
      const x1 = x + Math.cos(angle) * length
      const y1 = y + Math.sin(angle) * length
      const x2 = x - Math.cos(angle) * length
      const y2 = y - Math.sin(angle) * length

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    // Center dot
    ctx.beginPath()
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-10 ${className}`}
      style={{
        mixBlendMode: isDarkMode ? 'screen' : 'multiply',
        filter: 'blur(0.5px)'
      }}
    />
  )
}

// Specialized particle components
export function FloatingDots(props: Omit<ParticleSystemProps, 'type'>) {
  return <ParticleSystem {...props} type="floating" />
}

export function SparkleEffect(props: Omit<ParticleSystemProps, 'type'>) {
  return <ParticleSystem {...props} type="sparkles" />
}

export function BubbleSystem(props: Omit<ParticleSystemProps, 'type'>) {
  return <ParticleSystem {...props} type="bubbles" />
}

export function StarField(props: Omit<ParticleSystemProps, 'type'>) {
  return <ParticleSystem {...props} type="stars" />
}