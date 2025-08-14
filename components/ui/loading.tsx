import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { loadingVariants } from "@/lib/animations"

interface LoadingSpinnerProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg"
  variant?: "primary" | "secondary" | "white"
}

export function LoadingSpinner({ 
  className, 
  size = "md", 
  variant = "primary", 
  ...props 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  const variantClasses = {
    primary: "border-purple-200 border-t-purple-600",
    secondary: "border-slate-200 border-t-slate-600",
    white: "border-white/30 border-t-white"
  }

  return (
    <motion.div
      className={cn(
        "border-2 rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      {...props}
    />
  )
}

interface LoadingDotsProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg"
  variant?: "primary" | "secondary" | "white"
}

export function LoadingDots({ 
  className, 
  size = "md", 
  variant = "primary", 
  ...props 
}: LoadingDotsProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  }

  const variantClasses = {
    primary: "bg-purple-600",
    secondary: "bg-slate-600", 
    white: "bg-white"
  }

  return (
    <div className={cn("flex space-x-1", className)} {...props}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            "rounded-full",
            sizeClasses[size],
            variantClasses[variant]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

interface LoadingPulseProps extends React.ComponentProps<"div"> {
  variant?: "primary" | "secondary"
  children?: React.ReactNode
}

export function LoadingPulse({ 
  className, 
  variant = "primary", 
  children,
  ...props 
}: LoadingPulseProps) {
  const variantClasses = {
    primary: "bg-purple-100 text-purple-600",
    secondary: "bg-slate-100 text-slate-600"
  }

  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
        variantClasses[variant],
        className
      )}
      variants={loadingVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface ProgressBarProps extends React.ComponentProps<"div"> {
  progress: number // 0-100
  variant?: "primary" | "secondary" | "success" | "error"
  showLabel?: boolean
}

export function ProgressBar({ 
  className, 
  progress, 
  variant = "primary", 
  showLabel = false,
  ...props 
}: ProgressBarProps) {
  const variantClasses = {
    primary: "bg-purple-600",
    secondary: "bg-slate-600",
    success: "bg-emerald-600",
    error: "bg-red-600"
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-slate-700">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={cn("h-2 rounded-full", variantClasses[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

// Skeleton loading components for different content types
export function ProductCardSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("animate-pulse", className)} {...props}>
      <div className="aspect-square bg-slate-200 rounded-lg mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-1/4" />
      </div>
    </div>
  )
}

export function CategoryCardSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("animate-pulse p-4 text-center", className)} {...props}>
      <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-2" />
      <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto mb-1" />
      <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto" />
    </div>
  )
}

export function CartItemSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("animate-pulse p-3 rounded-lg bg-slate-50", className)} {...props}>
      <div className="flex justify-between items-center mb-2">
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="w-6 h-6 bg-slate-200 rounded" />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-200 rounded" />
          <div className="w-6 h-4 bg-slate-200 rounded" />
          <div className="w-7 h-7 bg-slate-200 rounded" />
        </div>
        <div className="h-4 bg-slate-200 rounded w-16" />
      </div>
    </div>
  )
}