/**
 * Sound Generator Utility
 * Creates lightweight sound effects programmatically using Web Audio API
 */

export type SoundType = 'click' | 'success' | 'error' | 'special' | 'beep' | 'notify'

export interface SoundConfig {
  frequency: number
  duration: number
  volume: number
  type: OscillatorType
  envelope?: {
    attack: number
    decay: number
    sustain: number
    release: number
  }
}

const soundConfigs: Record<SoundType, SoundConfig> = {
  click: {
    frequency: 600,
    duration: 0.08,
    volume: 0.15,
    type: 'sine',
    envelope: { attack: 0.005, decay: 0.02, sustain: 0.2, release: 0.055 }
  },
  success: {
    frequency: 523, // C5 note
    duration: 0.3,
    volume: 0.2,
    type: 'sine',
    envelope: { attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.21 }
  },
  error: {
    frequency: 250,
    duration: 0.3,
    volume: 0.18,
    type: 'sine',
    envelope: { attack: 0.005, decay: 0.05, sustain: 0.3, release: 0.245 }
  },
  special: {
    frequency: 659, // E5 note
    duration: 0.2,
    volume: 0.2,
    type: 'sine',
    envelope: { attack: 0.01, decay: 0.06, sustain: 0.4, release: 0.13 }
  },
  beep: {
    frequency: 800,
    duration: 0.12,
    volume: 0.15,
    type: 'sine',
    envelope: { attack: 0.005, decay: 0.03, sustain: 0.5, release: 0.085 }
  },
  notify: {
    frequency: 440, // A4 note
    duration: 0.25,
    volume: 0.18,
    type: 'sine',
    envelope: { attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.15 }
  }
}

export class SoundGenerator {
  private audioContext: AudioContext | null = null
  private isEnabled = true
  private globalVolume = 1.0

  constructor() {
    // Initialize AudioContext lazily to avoid issues with autoplay policies
    this.initializeAudioContext()
  }

  private initializeAudioContext() {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        this.audioContext = new AudioContext()
      } else if (typeof window !== 'undefined' && 'webkitAudioContext' in window) {
        this.audioContext = new (window as any).webkitAudioContext()
      }
    } catch (error) {
      console.warn('Audio not supported in this browser:', error)
      this.audioContext = null
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initializeAudioContext()
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume()
      } catch (error) {
        console.warn('Could not resume audio context:', error)
      }
    }
  }

  async play(soundType: SoundType): Promise<void> {
    if (!this.isEnabled || !this.audioContext) return

    try {
      await this.ensureAudioContext()
      if (!this.audioContext) return

      const config = soundConfigs[soundType]
      await this.playTone(config)
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error)
    }
  }

  private async playTone(config: SoundConfig): Promise<void> {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    // Configure oscillator
    oscillator.type = config.type
    oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime)

    // Configure gain with envelope
    const now = this.audioContext.currentTime
    const volume = config.volume * this.globalVolume
    const env = config.envelope || { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 }

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume, now + env.attack)
    gainNode.gain.linearRampToValueAtTime(volume * env.sustain, now + env.attack + env.decay)
    gainNode.gain.setValueAtTime(volume * env.sustain, now + config.duration - env.release)
    gainNode.gain.linearRampToValueAtTime(0, now + config.duration)

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Play sound
    oscillator.start(now)
    oscillator.stop(now + config.duration)
  }

  async playSuccess(): Promise<void> {
    // Play a pleasant ascending chord
    if (!this.isEnabled || !this.audioContext) return

    try {
      await this.ensureAudioContext()
      if (!this.audioContext) return

      const frequencies = [523, 659, 784] // C5, E5, G5 chord
      const promises = frequencies.map((freq, index) => 
        this.playTone({
          frequency: freq,
          duration: 0.4,
          volume: 0.12 * this.globalVolume,
          type: 'sine',
          envelope: { 
            attack: 0.03 + (index * 0.015), 
            decay: 0.08, 
            sustain: 0.5, 
            release: 0.25 
          }
        })
      )
      
      await Promise.all(promises)
    } catch (error) {
      console.warn('Failed to play success sound:', error)
    }
  }

  async playError(): Promise<void> {
    // Play a descending error sound
    if (!this.isEnabled || !this.audioContext) return

    try {
      await this.ensureAudioContext()
      if (!this.audioContext) return

      const frequencies = [350, 300, 250] // Descending tones
      
      for (let i = 0; i < frequencies.length; i++) {
        setTimeout(() => {
          if (this.audioContext) {
            this.playTone({
              frequency: frequencies[i],
              duration: 0.12,
              volume: 0.15 * this.globalVolume,
              type: 'sine',
              envelope: { attack: 0.005, decay: 0.03, sustain: 0.4, release: 0.085 }
            })
          }
        }, i * 80)
      }
    } catch (error) {
      console.warn('Failed to play error sound:', error)
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  setVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume))
  }

  getEnabled(): boolean {
    return this.isEnabled
  }

  getVolume(): number {
    return this.globalVolume
  }
}

// Create a singleton instance
export const soundGenerator = new SoundGenerator()