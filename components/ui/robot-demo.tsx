"use client"

import { useState, useEffect } from 'react'
import { MaposRobot, useMaposRobotController, useMaposRobotPerformance, type AnimationState, type EyeColor, type RobotSize } from './mapos-robot'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Separator } from './separator'
import { Switch } from './switch'
import { Label } from './label'

export function RobotDemo() {
  const [animation, setAnimation] = useState<AnimationState>('idle')
  const [eyeColor, setEyeColor] = useState<EyeColor>('default')
  const [size, setSize] = useState<RobotSize>('lg')
  const [autoReset, setAutoReset] = useState(false)
  const [showLoadingState, setShowLoadingState] = useState(true)
  const [showErrorState, setShowErrorState] = useState(true)
  const [responsive, setResponsive] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [simulatePOS, setSimulatePOS] = useState(false)

  // Use the robot controller for POS simulation
  const controller = useMaposRobotController()
  const performance = useMaposRobotPerformance()

  // POS system simulation
  useEffect(() => {
    if (!simulatePOS) return

    const events = [
      'cart:add',
      'payment:start', 
      'payment:success',
      'system:idle'
    ]

    let currentEventIndex = 0
    const interval = setInterval(() => {
      controller.handlePOSEvent(events[currentEventIndex])
      currentEventIndex = (currentEventIndex + 1) % events.length
    }, 3000)

    return () => clearInterval(interval)
  }, [simulatePOS, controller])

  // Sync controller state when in POS mode
  useEffect(() => {
    if (simulatePOS) {
      setAnimation(controller.currentState)
      setEyeColor(controller.currentEyeColor)
    }
  }, [simulatePOS, controller.currentState, controller.currentEyeColor])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Mapos Robot Integration Demo
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isLoaded ? "default" : "secondary"}>
                {isLoaded ? "Loaded" : "Loading"}
              </Badge>
              <Badge variant={performance.isVisible ? "default" : "outline"}>
                {performance.isVisible ? "Visible" : "Hidden"}
              </Badge>
              <Badge variant="outline">
                {performance.performanceMode.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Robot Display */}
          <div className="flex justify-center">
            <div 
              ref={performance.intersectionRef}
              className="relative"
            >
              <MaposRobot
                size={size}
                animation={animation}
                eyeColor={eyeColor}
                autoResetAfter={autoReset ? 3000 : undefined}
                showLoadingState={showLoadingState}
                showErrorState={showErrorState}
                responsive={responsive}
                className="drop-shadow-2xl"
                onLoad={() => setIsLoaded(true)}
                onAnimationComplete={(animationName) => {
                  console.log(`Animation completed: ${animationName}`)
                }}
              />
            </div>
          </div>

          {/* Settings Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Robot Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Size Controls */}
              <div>
                <Label className="text-sm font-medium">Size</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {(['sm', 'md', 'lg', 'xl', 'custom'] as RobotSize[]).map((s) => (
                    <Button
                      key={s}
                      onClick={() => setSize(s)}
                      variant={size === s ? 'default' : 'outline'}
                      size="sm"
                    >
                      {s.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Configuration Switches */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-reset" 
                    checked={autoReset}
                    onCheckedChange={setAutoReset}
                  />
                  <Label htmlFor="auto-reset" className="text-sm">Auto Reset (3s)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="responsive" 
                    checked={responsive}
                    onCheckedChange={setResponsive}
                  />
                  <Label htmlFor="responsive" className="text-sm">Responsive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="loading-state" 
                    checked={showLoadingState}
                    onCheckedChange={setShowLoadingState}
                  />
                  <Label htmlFor="loading-state" className="text-sm">Loading State</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="error-state" 
                    checked={showErrorState}
                    onCheckedChange={setShowErrorState}
                  />
                  <Label htmlFor="error-state" className="text-sm">Error State</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Control Panels */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Manual Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Manual Controls
                  <Switch 
                    checked={!simulatePOS}
                    onCheckedChange={(checked) => setSimulatePOS(!checked)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Animation States</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['idle', 'excited', 'processing', 'error', 'blinking', 'hovering', 'cart-interaction', 'payment-success'] as AnimationState[]).map((anim) => (
                      <Button
                        key={anim}
                        onClick={() => {
                          setSimulatePOS(false)
                          setAnimation(anim)
                        }}
                        variant={animation === anim ? 'default' : 'outline'}
                        size="sm"
                        disabled={simulatePOS}
                      >
                        {anim.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Eye Colors</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['default', 'red', 'yellow', 'green', 'blue', 'gray'] as EyeColor[]).map((color) => (
                      <Button
                        key={color}
                        onClick={() => {
                          setSimulatePOS(false)
                          setEyeColor(color)
                        }}
                        variant={eyeColor === color ? 'default' : 'outline'}
                        size="sm"
                        disabled={simulatePOS}
                      >
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* POS Simulation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  POS System Simulation
                  <Switch 
                    checked={simulatePOS}
                    onCheckedChange={setSimulatePOS}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">POS Events (Auto: {simulatePOS ? 'ON' : 'OFF'})</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { event: 'cart:add', label: 'Add Item' },
                      { event: 'cart:remove', label: 'Remove Item' },
                      { event: 'payment:start', label: 'Start Payment' },
                      { event: 'payment:success', label: 'Payment Success' },
                      { event: 'payment:error', label: 'Payment Error' },
                      { event: 'system:error', label: 'System Error' },
                      { event: 'system:loading', label: 'Loading' },
                      { event: 'system:idle', label: 'Idle' },
                    ].map(({ event, label }) => (
                      <Button
                        key={event}
                        onClick={() => {
                          setSimulatePOS(false)
                          controller.handlePOSEvent(event)
                        }}
                        variant="outline"
                        size="sm"
                        disabled={simulatePOS}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}