import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-95 transform hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg hover:from-purple-700 hover:to-violet-700 hover:shadow-xl focus-visible:ring-purple-500/50",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl focus-visible:ring-red-500/50",
        outline:
          "border-2 border-purple-200 bg-white/80 backdrop-blur-sm text-purple-700 shadow-md hover:bg-purple-50 hover:border-purple-300 hover:shadow-lg focus-visible:ring-purple-500/50 dark:bg-slate-800/90 dark:border-purple-500/30 dark:text-slate-100 dark:hover:bg-slate-700/90 dark:hover:border-purple-400/50",
        secondary:
          "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 shadow-md hover:from-slate-200 hover:to-slate-300 hover:shadow-lg focus-visible:ring-slate-500/50 dark:from-slate-700/90 dark:to-slate-800/90 dark:text-slate-100 dark:hover:from-slate-600/90 dark:hover:to-slate-700/90 dark:border dark:border-purple-500/20",
        ghost:
          "bg-transparent text-slate-600 hover:bg-purple-50 hover:text-purple-700 hover:shadow-md dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100 dark:hover:border dark:hover:border-purple-500/20",
        link: "text-purple-600 underline-offset-4 hover:underline hover:text-purple-700",
        success:
          "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:from-emerald-600 hover:to-green-700 hover:shadow-xl focus-visible:ring-emerald-500/50",
        warning:
          "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:from-amber-600 hover:to-orange-700 hover:shadow-xl focus-visible:ring-amber-500/50",
        info:
          "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl focus-visible:ring-blue-500/50",
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-glass hover:bg-white/20 hover:shadow-lg focus-visible:ring-white/50",
        "glass-dark":
          "bg-black/10 backdrop-blur-md border border-black/20 text-slate-800 shadow-glass hover:bg-black/20 hover:shadow-lg focus-visible:ring-black/50",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-6 text-base has-[>svg]:px-5",
        xl: "h-14 rounded-xl px-8 text-lg has-[>svg]:px-7",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }