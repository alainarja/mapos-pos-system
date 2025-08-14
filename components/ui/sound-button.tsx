import * as React from "react"
import { Button, type buttonVariants } from "./button"
import { useSound } from "@/hooks/use-sound"
import { type SoundType } from "@/lib/sound-generator"
import { type VariantProps } from "class-variance-authority"

interface SoundButtonProps 
  extends React.ComponentProps<typeof Button>,
    VariantProps<typeof buttonVariants> {
  soundType?: SoundType
  enableSound?: boolean
  onSoundPlay?: (soundType: SoundType) => void
}

/**
 * Enhanced Button component with integrated sound effects
 * Automatically plays sounds on click based on button variant or explicit soundType
 */
const SoundButton = React.forwardRef<
  HTMLButtonElement,
  SoundButtonProps
>(({ 
  soundType,
  enableSound = true,
  onSoundPlay,
  onClick,
  variant = "default",
  disabled,
  ...props 
}, ref) => {
  const { play, playSuccess, playError, isEnabled: soundEnabled } = useSound()

  // Determine the sound type based on button variant if not explicitly provided
  const getAutoSoundType = (): SoundType => {
    if (soundType) return soundType
    
    switch (variant) {
      case 'destructive':
        return 'error'
      case 'success':
        return 'success'
      case 'warning':
        return 'notify'
      case 'info':
        return 'beep'
      case 'ghost':
      case 'outline':
        return 'click'
      default:
        return 'click'
    }
  }

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Play sound if enabled
    if (enableSound && soundEnabled && !disabled) {
      const targetSoundType = getAutoSoundType()
      
      try {
        // Use specialized sounds for success/error, regular play for others
        if (targetSoundType === 'success') {
          await playSuccess()
        } else if (targetSoundType === 'error') {
          await playError()
        } else {
          await play(targetSoundType)
        }
        
        // Call optional sound callback
        onSoundPlay?.(targetSoundType)
      } catch (error) {
        console.warn('Failed to play button sound:', error)
      }
    }

    // Call the original onClick handler
    onClick?.(event)
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    />
  )
})

SoundButton.displayName = "SoundButton"

export { SoundButton, type SoundButtonProps }