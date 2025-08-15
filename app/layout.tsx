import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import { SoundProvider } from "@/components/sound-provider"
import { GradientAnimation } from "@/components/ui/gradient-animation"
import { InventoryLoader } from "@/components/inventory-loader"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const brunoAce = localFont({
  src: "../public/fonts/BrunoAceSC-Regular.ttf",
  display: "swap",
  variable: "--font-bruno-ace",
})

export const metadata: Metadata = {
  title: "MAPOS - Modern Point of Sale",
  description: "Advanced retail POS system with modern interface",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${brunoAce.variable} antialiased`}>
      <body className="min-h-screen">
        <div className="fixed inset-0 -z-10">
          <GradientAnimation
            pattern="aurora"
            intensity="subtle"
            speed="slow"
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/90 to-violet-100/80 backdrop-blur-sm" />
        </div>
        <SoundProvider>
          <InventoryLoader />
          {children}
        </SoundProvider>
      </body>
    </html>
  )
}
