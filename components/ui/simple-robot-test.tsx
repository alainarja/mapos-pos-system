"use client"

import { useRive, Fit, Alignment } from 'rive-react'

export function SimpleRobotTest() {
  const { RiveComponent, rive } = useRive({
    src: '/mapos.riv',
    artboard: 'Mapos',
    stateMachines: 'MaposStat',
    autoplay: true,
    fit: Fit.Contain,
    alignment: Alignment.Center,
    onLoad: () => {
      console.log('✅ Robot loaded successfully with correct artboard and state machine!')
      if (rive) {
        console.log('🎬 Available animations:', rive.animationNames)
        console.log('🎛️ Available state machines:', rive.stateMachineNames)
      }
    },
    onLoadError: (error) => {
      console.error('❌ Robot load error:', error)
    },
  })

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Simple Robot Test</h3>
      <div className="w-64 h-64 border bg-gray-50 flex items-center justify-center">
        <RiveComponent />
      </div>
    </div>
  )
}