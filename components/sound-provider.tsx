"use client"

import React, { createContext, useContext, useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings'
import { soundGenerator } from '@/lib/sound-generator'

interface SoundContextValue {
  isEnabled: boolean
  volume: number
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

export function useSoundContext() {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSoundContext must be used within a SoundProvider')
  }
  return context
}

interface SoundProviderProps {
  children: React.ReactNode
}

/**
 * Global sound provider that manages sound settings across the application
 * Synchronizes with the settings store and the sound generator
 */
export function SoundProvider({ children }: SoundProviderProps) {
  const { settings, updateSoundSettings } = useSettingsStore()

  // Initialize sound generator with settings
  useEffect(() => {
    if (settings.sound) {
      soundGenerator.setEnabled(settings.sound.enabled)
      soundGenerator.setVolume(settings.sound.volume)
    }
  }, [settings.sound])

  const setEnabled = (enabled: boolean) => {
    soundGenerator.setEnabled(enabled)
    updateSoundSettings({ enabled })
  }

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    soundGenerator.setVolume(clampedVolume)
    updateSoundSettings({ volume: clampedVolume })
  }

  const contextValue: SoundContextValue = {
    isEnabled: settings.sound?.enabled ?? true,
    volume: settings.sound?.volume ?? 0.7,
    setEnabled,
    setVolume,
  }

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  )
}