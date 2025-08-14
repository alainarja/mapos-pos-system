import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full min-w-0 transition-all duration-300 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: [
          "border-input bg-transparent rounded-lg border px-3 py-2 text-base shadow-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-500/20",
          "aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
          "dark:bg-slate-800/80 dark:border-purple-500/30 dark:focus-visible:border-purple-400 dark:placeholder:text-slate-400",
          "dark:hover:border-purple-400/50 dark:focus-visible:ring-purple-500/30",
          "md:text-sm",
        ],
        glass: [
          "glass rounded-lg px-4 py-3 text-base",
          "placeholder:text-slate-600 dark:placeholder:text-slate-300",
          "focus-visible:border-purple-300 focus-visible:ring-2 focus-visible:ring-purple-500/30",
          "backdrop-blur-md shadow-glass",
        ],
        outlined: [
          "border-2 border-purple-200 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 text-base",
          "placeholder:text-purple-400",
          "focus-visible:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-500/20",
          "hover:border-purple-300 hover:bg-purple-50/50",
          "dark:bg-slate-800/80 dark:border-slate-600 dark:placeholder:text-slate-400",
        ],
        filled: [
          "bg-slate-100 dark:bg-slate-700 border-0 rounded-lg px-4 py-3 text-base",
          "placeholder:text-slate-500 dark:placeholder:text-slate-400",
          "focus-visible:ring-2 focus-visible:ring-purple-500/30 focus-visible:bg-white dark:focus-visible:bg-slate-600",
          "hover:bg-slate-50 dark:hover:bg-slate-600",
        ],
        floating: [
          "bg-white dark:bg-slate-800 rounded-xl px-4 py-3 text-base border shadow-lg",
          "placeholder:text-slate-400",
          "focus-visible:border-purple-400 focus-visible:ring-4 focus-visible:ring-purple-500/10 focus-visible:shadow-xl",
          "hover:shadow-md transition-shadow",
        ],
      },
      size: {
        default: "h-10",
        sm: "h-8 px-3 py-1 text-sm",
        lg: "h-12 px-4 py-3 text-lg",
        xl: "h-14 px-5 py-4 text-xl",
      },
      state: {
        default: "",
        error: "border-red-400 ring-2 ring-red-500/20 focus-visible:border-red-400 focus-visible:ring-red-500/20",
        success: "border-green-400 ring-2 ring-green-500/20 focus-visible:border-green-400 focus-visible:ring-green-500/20",
        warning: "border-yellow-400 ring-2 ring-yellow-500/20 focus-visible:border-yellow-400 focus-visible:ring-yellow-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

interface InputProps 
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  label?: string
  helperText?: string
  error?: boolean
  animated?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant,
    size,
    state,
    startIcon,
    endIcon,
    label,
    helperText,
    error,
    animated,
    ...props 
  }, ref) => {
    const inputState = error ? "error" : state

    const InputComponent = (
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {startIcon}
          </div>
        )}
        <input
          type={type}
          data-slot="input"
          className={cn(
            inputVariants({ variant, size, state: inputState }),
            startIcon && "pl-10",
            endIcon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {endIcon}
          </div>
        )}
      </div>
    )

    if (label || helperText) {
      return (
        <div className="space-y-2">
          {label && (
            <label className="text-label-medium font-medium text-slate-700 dark:text-slate-300">
              {label}
            </label>
          )}
          {InputComponent}
          {helperText && (
            <p className={cn(
              "text-label-small",
              error ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"
            )}>
              {helperText}
            </p>
          )}
        </div>
      )
    }

    return InputComponent
  }
)

Input.displayName = "Input"

export { Input, inputVariants }