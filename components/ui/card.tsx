import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "flex flex-col gap-6 py-6 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground rounded-xl border shadow-sm hover:shadow-md",
        glass: "glass rounded-xl shadow-glass hover:shadow-lg backdrop-blur-xl text-slate-900 dark:text-white",
        "glass-dark": "glass-dark rounded-xl shadow-glass hover:shadow-lg backdrop-blur-xl text-slate-900 dark:text-white",
        elevated: "bg-white dark:bg-slate-800/90 rounded-2xl shadow-lg hover:shadow-xl border-0 text-slate-900 dark:text-slate-100 dark:border dark:border-purple-500/10",
        outlined: "bg-transparent border-2 border-purple-200 dark:border-purple-500/30 rounded-xl hover:border-purple-300 dark:hover:border-purple-400/50 hover:shadow-md text-slate-900 dark:text-slate-100",
        gradient: "bg-gradient-to-br from-purple-50 via-white to-violet-50 dark:from-slate-800/90 dark:via-slate-700/90 dark:to-purple-900/90 dark:border dark:border-purple-500/20 rounded-xl shadow-md hover:shadow-lg text-slate-900 dark:text-slate-100",
        floating: "bg-white dark:bg-slate-800/95 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-transform duration-300 text-slate-900 dark:text-slate-100 dark:border dark:border-purple-500/15 dark:shadow-[0_20px_40px_rgba(0,0,0,0.6),_0_0_0_1px_rgba(139,92,246,0.1)]",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-10",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  }
)

function Card({ 
  className, 
  variant,
  size,
  interactive,
  ...props 
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, size, interactive, className }))}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold text-heading-medium", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-body-small", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}