import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300",
  {
    variants: {
      variant: {
        success: "bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800",
        error: "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800",
        warning: "bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-950 dark:to-yellow-900 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800",
        info: "bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800",
        neutral: "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
        online: "bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800",
        offline: "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
        processing: "bg-gradient-to-r from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-2 text-sm",
      },
      interactive: {
        true: "cursor-pointer hover:scale-105 active:scale-95",
        false: "",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
      interactive: false,
    },
  }
)

const statusDotVariants = cva(
  "rounded-full",
  {
    variants: {
      variant: {
        success: "bg-emerald-500",
        error: "bg-red-500",
        warning: "bg-amber-500",
        info: "bg-blue-500",
        neutral: "bg-slate-400",
        online: "bg-emerald-500",
        offline: "bg-slate-400",
        processing: "bg-purple-500",
      },
      size: {
        sm: "w-1.5 h-1.5",
        default: "w-2 h-2",
        lg: "w-2.5 h-2.5",
      },
      animated: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
      animated: false,
    },
  }
)

interface StatusIndicatorProps 
  extends React.ComponentProps<"div">,
    VariantProps<typeof statusIndicatorVariants> {
  dot?: boolean
  animated?: boolean
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ 
    className, 
    variant, 
    size, 
    interactive,
    dot = true,
    animated = false,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statusIndicatorVariants({ variant, size, interactive }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(statusDotVariants({ 
              variant, 
              size, 
              animated: animated || variant === "processing" 
            }))}
          />
        )}
        {children}
      </div>
    )
  }
)

StatusIndicator.displayName = "StatusIndicator"

// Standalone dot component for minimal usage
const StatusDot = React.forwardRef<HTMLSpanElement, 
  React.ComponentProps<"span"> & 
  VariantProps<typeof statusDotVariants>
>(({ className, variant, size, animated, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(statusDotVariants({ variant, size, animated }), className)}
      {...props}
    />
  )
})

StatusDot.displayName = "StatusDot"

export { StatusIndicator, StatusDot, statusIndicatorVariants, statusDotVariants }