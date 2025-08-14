import { Variants } from "framer-motion"

// Page transition variants
export const pageTransitions: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    filter: "blur(10px)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Slide transition variants for page changes
export const slideTransitions: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 300 : -300,
    scale: 0.9,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 300 : -300,
    scale: 0.9,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
}

// Button interaction variants
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
}

// Touch-friendly button variants for mobile
export const touchButtonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.01,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.96,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
}

// Card hover variants
export const cardVariants: Variants = {
  initial: { 
    scale: 1,
    y: 0,
    boxShadow: "0 4px 15px rgba(139,92,246,0.1)",
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 15px 40px rgba(139,92,246,0.2)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.98,
    y: -2,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
}

// Stagger container variants
export const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

// Stagger item variants
export const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Product grid stagger variants
export const gridContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

export const gridItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Modal/Dialog variants
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 100,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 100,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Backdrop variants
export const backdropVariants: Variants = {
  initial: {
    opacity: 0,
    backdropFilter: "blur(0px)",
  },
  animate: {
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

// Sidebar slide variants
export const sidebarVariants: Variants = {
  initial: {
    x: "100%",
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Loading animation variants
export const loadingVariants: Variants = {
  initial: {
    opacity: 0.5,
    scale: 0.8,
  },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [0.8, 1, 0.8],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// Skeleton loading variants
export const skeletonVariants: Variants = {
  initial: {
    opacity: 0.4,
  },
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// Float animation variants
export const floatVariants: Variants = {
  initial: {
    y: 0,
  },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// Pulse variants for attention-grabbing elements
export const pulseVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 0 0 0 rgba(139,92,246,0.4)",
  },
  animate: {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 0 rgba(139,92,246,0.4)",
      "0 0 0 10px rgba(139,92,246,0)",
      "0 0 0 0 rgba(139,92,246,0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeOut",
    },
  },
}

// Success animation variants
export const successVariants: Variants = {
  initial: {
    scale: 0,
    rotate: -180,
  },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
}

// Error shake variants
export const errorVariants: Variants = {
  initial: {
    x: 0,
  },
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
}

// Form field focus variants
export const formFieldVariants: Variants = {
  initial: {
    scale: 1,
    borderColor: "rgb(209 213 219)",
  },
  focus: {
    scale: 1.01,
    borderColor: "rgb(147 51 234)",
    boxShadow: "0 0 0 3px rgba(147,51,234,0.1)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  error: {
    borderColor: "rgb(239 68 68)",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.1)",
    x: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
}

// Cart animation variants
export const cartItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -50,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Navigation variants
export const navItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

export const navContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Enhanced background animation variants
export const backgroundShapeVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    rotate: 0,
  },
  animate: {
    opacity: [0.1, 0.3, 0.1],
    scale: [0.8, 1.2, 0.8],
    rotate: [0, 360],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

// Gradient animation variants
export const gradientFlowVariants: Variants = {
  initial: {
    backgroundPosition: "0% 50%",
  },
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

// Interactive element variants
export const interactiveHoverVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 4px 15px rgba(139,92,246,0.1)",
    filter: "brightness(1)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 15px 40px rgba(139,92,246,0.25)",
    filter: "brightness(1.05)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
}

// Smart card variants with enhanced effects
export const smartCardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    boxShadow: "0 4px 15px rgba(139,92,246,0.1)",
  },
  hover: {
    scale: 1.03,
    y: -8,
    rotateX: 5,
    rotateY: 5,
    boxShadow: "0 20px 50px rgba(139,92,246,0.3)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.97,
    y: -4,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
}

// Ambient particle variants
export const particleFloatVariants: Variants = {
  initial: {
    y: 0,
    x: 0,
    opacity: 0.2,
  },
  animate: {
    y: [-20, 20, -20],
    x: [-10, 10, -10],
    opacity: [0.2, 0.6, 0.2],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// Page transition with smart effects
export const smartPageTransitions: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(10px) brightness(0.8)",
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px) brightness(1)",
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    filter: "blur(10px) brightness(1.2)",
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Ripple effect variants
export const rippleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0.6,
  },
  animate: {
    scale: 4,
    opacity: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
}

// Glow effect variants
export const glowVariants: Variants = {
  initial: {
    boxShadow: "0 0 0 rgba(139,92,246,0)",
    filter: "brightness(1)",
  },
  animate: {
    boxShadow: [
      "0 0 20px rgba(139,92,246,0.3)",
      "0 0 40px rgba(139,92,246,0.5)",
      "0 0 20px rgba(139,92,246,0.3)",
    ],
    filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// Morphing shape variants
export const morphingShapeVariants: Variants = {
  initial: {
    borderRadius: "20%",
    rotate: 0,
    scale: 1,
  },
  animate: {
    borderRadius: ["20%", "50%", "25%", "45%", "20%"],
    rotate: [0, 90, 180, 270, 360],
    scale: [1, 1.1, 0.9, 1.05, 1],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// Enhanced loading variants
export const smartLoadingVariants: Variants = {
  initial: {
    opacity: 0.3,
    scale: 0.8,
    filter: "blur(2px)",
  },
  animate: {
    opacity: [0.3, 1, 0.3],
    scale: [0.8, 1.2, 0.8],
    filter: ["blur(2px)", "blur(0px)", "blur(2px)"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// Magnetic attraction variants
export const magneticVariants: Variants = {
  initial: {
    x: 0,
    y: 0,
  },
  hover: {
    x: 0,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
}