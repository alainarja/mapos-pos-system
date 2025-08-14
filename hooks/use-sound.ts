import { useCallback, useEffect, useState } from 'react'
import { soundGenerator, type SoundType } from '@/lib/sound-generator'
import { useSettingsStore } from '@/stores/settings'

export interface UseSoundReturn {
  play: (soundType: SoundType) => Promise<void>
  playClick: () => Promise<void>
  playSuccess: () => Promise<void>
  playError: () => Promise<void>
  playSpecial: () => Promise<void>
  playBeep: () => Promise<void>
  playNotify: () => Promise<void>
  isEnabled: boolean
  volume: number
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
}

/**
 * Custom hook for managing sound effects in the POS application
 * Integrates with the settings store for persistent preferences
 */
export function useSound(): UseSoundReturn {
  const { settings, updateSoundSettings } = useSettingsStore()
  const [isEnabled, setIsEnabledLocal] = useState(settings.sound?.enabled ?? true)
  const [volume, setVolumeLocal] = useState(settings.sound?.volume ?? 0.7)

  // Sync with sound generator on mount and when settings change
  useEffect(() => {
    soundGenerator.setEnabled(isEnabled)
    soundGenerator.setVolume(volume)
  }, [isEnabled, volume])

  // Sync local state with store
  useEffect(() => {
    setIsEnabledLocal(settings.sound?.enabled ?? true)
    setVolumeLocal(settings.sound?.volume ?? 0.7)
  }, [settings.sound])

  const play = useCallback(async (soundType: SoundType): Promise<void> => {
    if (!isEnabled) return
    
    try {
      await soundGenerator.play(soundType)
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error)
    }
  }, [isEnabled])

  const playClick = useCallback(async (): Promise<void> => {
    await play('click')
  }, [play])

  const playSuccess = useCallback(async (): Promise<void> => {
    if (!isEnabled) return
    try {
      await soundGenerator.playSuccess()
    } catch (error) {
      console.warn('Failed to play success sound:', error)
    }
  }, [isEnabled])

  const playError = useCallback(async (): Promise<void> => {
    if (!isEnabled) return
    try {
      await soundGenerator.playError()
    } catch (error) {
      console.warn('Failed to play error sound:', error)
    }
  }, [isEnabled])

  const playSpecial = useCallback(async (): Promise<void> => {
    await play('special')
  }, [play])

  const playBeep = useCallback(async (): Promise<void> => {
    await play('beep')
  }, [play])

  const playNotify = useCallback(async (): Promise<void> => {
    await play('notify')
  }, [play])

  const setEnabled = useCallback((enabled: boolean): void => {
    setIsEnabledLocal(enabled)
    soundGenerator.setEnabled(enabled)
    updateSoundSettings({ enabled })
  }, [updateSoundSettings])

  const setVolume = useCallback((newVolume: number): void => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeLocal(clampedVolume)
    soundGenerator.setVolume(clampedVolume)
    updateSoundSettings({ volume: clampedVolume })
  }, [updateSoundSettings])

  return {
    play,
    playClick,
    playSuccess,
    playError,
    playSpecial,
    playBeep,
    playNotify,
    isEnabled,
    volume,
    setEnabled,
    setVolume,
  }
}

// Export individual functions for ease of use
export const useSoundClick = () => {
  const { playClick } = useSound()
  return playClick
}

export const useSoundSuccess = () => {
  const { playSuccess } = useSound()
  return playSuccess
}

export const useSoundError = () => {
  const { playError } = useSound()
  return playError
}

export const useSoundSpecial = () => {
  const { playSpecial } = useSound()
  return playSpecial
}