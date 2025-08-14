"use client"

import React, { useState } from 'react'
import { AnimatedBackground } from './animated-background'
import { GradientAnimation, AuroraGradient, WaveGradient, PulseGradient } from './gradient-animation'
import { ParticleSystem, SparkleEffect, BubbleSystem } from './particle-system'
import { InteractiveBackground, SmartPOSBackground } from './interactive-background'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Badge } from './badge'
import { Sun, Moon } from 'lucide-react'

export function AnimationShowcase() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentDemo, setCurrentDemo] = useState<'shapes' | 'gradients' | 'particles' | 'interactive' | 'smart'>('smart')

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      {/* Demo Selection Header */}
      <header className={`${isDarkMode ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-xl border-b ${isDarkMode ? 'border-slate-700' : 'border-purple-100'} p-4 sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            MAPOS Animation System
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Demo Selection */}
            <div className="flex gap-2">
              {[
                { id: 'smart', label: 'Smart POS' },
                { id: 'shapes', label: 'Shapes' },
                { id: 'gradients', label: 'Gradients' },
                { id: 'particles', label: 'Particles' },
                { id: 'interactive', label: 'Interactive' },
              ].map((demo) => (
                <Button
                  key={demo.id}
                  variant={currentDemo === demo.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentDemo(demo.id as any)}
                  className="transition-all duration-200"
                >
                  {demo.label}
                </Button>
              ))}
            </div>
            
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-lg"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <div className="relative">
        {/* Background based on current demo */}
        {currentDemo === 'shapes' && (
          <AnimatedBackground 
            isDarkMode={isDarkMode} 
            intensity="high"
            interactionMode={true}
          />
        )}
        
        {currentDemo === 'gradients' && (
          <div className="absolute inset-0">
            <AuroraGradient isDarkMode={isDarkMode} className="absolute inset-0" />
          </div>
        )}
        
        {currentDemo === 'particles' && (
          <ParticleSystem 
            isDarkMode={isDarkMode}
            density="high"
            type="mixed"
            interactive={true}
          />
        )}
        
        {currentDemo === 'interactive' && (
          <InteractiveBackground
            isDarkMode={isDarkMode}
            intensity="dynamic"
            responseMode="energetic"
          />
        )}
        
        {currentDemo === 'smart' && (
          <SmartPOSBackground isDarkMode={isDarkMode} />
        )}

        {/* Content Area */}
        <div className="relative z-10 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Demo Description */}
            <div className="mb-8 text-center">
              <Badge variant="secondary" className="mb-4">
                {currentDemo.charAt(0).toUpperCase() + currentDemo.slice(1)} Demo
              </Badge>
              <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {currentDemo === 'smart' && 'Complete animated background system optimized for POS interfaces'}
                {currentDemo === 'shapes' && 'Floating geometric shapes with physics-based interactions'}
                {currentDemo === 'gradients' && 'Dynamic color-shifting gradients that respond to time'}
                {currentDemo === 'particles' && 'Subtle particle systems with interactive mouse effects'}
                {currentDemo === 'interactive' && 'Full interactive background with ripples, glows, and mouse tracking'}
              </p>
            </div>

            {/* Sample Cards to demonstrate interaction */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card 
                  key={i} 
                  className={`interactive-element cursor-pointer group transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/80' 
                      : 'bg-white/80 border-purple-100 hover:bg-white/90'
                  } backdrop-blur-sm`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Interactive Card {i}</h3>
                      <div className={`w-3 h-3 rounded-full animate-gentle-pulse ${
                        i % 3 === 0 ? 'bg-green-500' : i % 3 === 1 ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-4`}>
                      This card demonstrates the interactive animations. Hover to see the magnetic effect and enhanced shadows.
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge 
                        variant="outline" 
                        className="animate-smart-glow"
                      >
                        Smart Effect
                      </Badge>
                      <Button size="sm" className="animate-magnetic-pull">
                        Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Animation Controls */}
            <div className="mt-12 text-center">
              <Card className={`inline-block ${isDarkMode ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-xl`}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Animation Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 animate-smooth-float" />
                      <span>Smooth Float</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 animate-gentle-pulse" />
                      <span>Gentle Pulse</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 rounded mx-auto mb-2 animate-morph-shape" />
                      <span>Morph Shape</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-2 animate-sparkle" />
                      <span>Sparkle</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}