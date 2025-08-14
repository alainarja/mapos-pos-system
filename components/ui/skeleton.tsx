import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { skeletonVariants } from "@/lib/animations"

interface SkeletonProps extends React.ComponentProps<"div"> {
  animated?: boolean
}

function Skeleton({ className, animated = true, ...props }: SkeletonProps) {
  if (!animated) {
    return (
      <div
        data-slot="skeleton"
        className={cn("bg-accent animate-pulse rounded-md", className)}
        {...props}
      />
    )
  }

  return (
    <motion.div
      data-slot="skeleton"
      className={cn("bg-accent rounded-md", className)}
      variants={skeletonVariants}
      initial="initial"
      animate="animate"
      {...props}
    />
  )
}

export { Skeleton }
