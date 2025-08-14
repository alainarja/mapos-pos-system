import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressIndicatorVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        linear: "w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden",
        circular: "rounded-full border-4 border-slate-200 dark:border-slate-700",
        dots: "flex items-center justify-center space-x-2",
        pulse: "rounded-lg",
      },
      size: {
        sm: "",
        default: "",
        lg: "",
        xl: "",
      },
    },
    defaultVariants: {
      variant: "linear",
      size: "default",
    },
  }
)

// Linear Progress Bar
interface LinearProgressProps extends React.ComponentProps<"div"> {
  value?: number
  max?: number
  indeterminate?: boolean
  color?: "primary" | "success" | "warning" | "error" | "info"
}

const LinearProgress = React.forwardRef<HTMLDivElement, LinearProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    indeterminate = false,
    color = "primary",
    ...props 
  }, ref) => {
    const percentage = indeterminate ? 100 : Math.min((value / max) * 100, 100)
    
    const colorClasses = {
      primary: "bg-gradient-to-r from-purple-500 to-violet-600",
      success: "bg-gradient-to-r from-emerald-500 to-green-600",
      warning: "bg-gradient-to-r from-amber-500 to-orange-600",
      error: "bg-gradient-to-r from-red-500 to-red-600",
      info: "bg-gradient-to-r from-blue-500 to-indigo-600",
    }

    return (
      <div
        ref={ref}
        className={cn("w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden h-2", className)}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            colorClasses[color],
            indeterminate && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)

LinearProgress.displayName = "LinearProgress"

// Circular Progress
interface CircularProgressProps extends React.ComponentProps<"div"> {
  value?: number
  max?: number
  size?: number
  strokeWidth?: number
  indeterminate?: boolean
  color?: "primary" | "success" | "warning" | "error" | "info"
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    className,
    value = 0,
    max = 100,
    size = 40,
    strokeWidth = 4,
    indeterminate = false,
    color = "primary",
    ...props
  }, ref) => {
    const percentage = indeterminate ? 75 : Math.min((value / max) * 100, 100)
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const colorClasses = {
      primary: "stroke-purple-600",
      success: "stroke-emerald-600",
      warning: "stroke-amber-600",
      error: "stroke-red-600",
      info: "stroke-blue-600",
    }

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className={cn("transform -rotate-90", indeterminate && "animate-spin")}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-300 ease-out", colorClasses[color])}
          />
        </svg>
        {!indeterminate && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-700 dark:text-slate-300">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }
)

CircularProgress.displayName = "CircularProgress"

// Dot Loading Indicator
interface DotLoadingProps extends React.ComponentProps<"div"> {
  color?: "primary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "default" | "lg"
}

const DotLoading = React.forwardRef<HTMLDivElement, DotLoadingProps>(
  ({ className, color = "primary", size = "default", ...props }, ref) => {
    const colorClasses = {
      primary: "bg-purple-600",
      success: "bg-emerald-600",
      warning: "bg-amber-600",
      error: "bg-red-600",
      info: "bg-blue-600",
    }

    const sizeClasses = {
      sm: "w-2 h-2",
      default: "w-3 h-3",
      lg: "w-4 h-4",
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center space-x-1", className)}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full animate-bounce",
              colorClasses[color],
              sizeClasses[size]
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
    )
  }
)

DotLoading.displayName = "DotLoading"

// Pulse Loading
interface PulseLoadingProps extends React.ComponentProps<"div"> {
  color?: "primary" | "success" | "warning" | "error" | "info"
}

const PulseLoading = React.forwardRef<HTMLDivElement, PulseLoadingProps>(
  ({ className, color = "primary", ...props }, ref) => {
    const colorClasses = {
      primary: "bg-gradient-to-r from-purple-200 to-violet-200 dark:from-purple-800 dark:to-violet-800",
      success: "bg-gradient-to-r from-emerald-200 to-green-200 dark:from-emerald-800 dark:to-green-800",
      warning: "bg-gradient-to-r from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800",
      error: "bg-gradient-to-r from-red-200 to-red-200 dark:from-red-800 dark:to-red-800",
      info: "bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-lg",
          colorClasses[color],
          className
        )}
        {...props}
      />
    )
  }
)

PulseLoading.displayName = "PulseLoading"

export { 
  LinearProgress, 
  CircularProgress, 
  DotLoading, 
  PulseLoading,
  progressIndicatorVariants 
}