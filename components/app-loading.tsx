'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function AppLoading({ 
  onLoadingComplete 
}: { 
  onLoadingComplete?: () => void 
}) {
  const [progress, setProgress] = useState(0)
  const [showContent, setShowContent] = useState(true)

  useEffect(() => {
    const duration = 1500
    const interval = 30
    const steps = duration / interval
    const increment = 100 / steps
    
    let currentProgress = 0
    const timer = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= 100) {
        setProgress(100)
        clearInterval(timer)
        setTimeout(() => {
          setShowContent(false)
          onLoadingComplete?.()
        }, 300)
      } else {
        setProgress(currentProgress)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [onLoadingComplete])

  if (!showContent) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-dark transition-opacity duration-300",
        progress >= 100 && "opacity-0 pointer-events-none"
      )}
    >
      {/* Background glow effects */}
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      
      {/* Logo and text */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" style={{ animationDuration: '2s' }} />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/30">
            <svg
              className="h-12 w-12 text-background-dark"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
        </div>
        
        {/* App name */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            NutriScan
          </h1>
          <p className="mt-1 text-sm font-medium text-primary">
            AI-Powered Nutrition Analysis
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="w-48">
          <div className="h-1 overflow-hidden rounded-full bg-primary/20">
            <div
              className="h-full rounded-full bg-primary transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    </div>
  )
}
