'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppLoading } from '@/components/app-loading'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if this is the first visit
    const hasLoaded = sessionStorage.getItem('nutriscan-loaded')
    if (hasLoaded) {
      setIsLoading(false)
    }
  }, [])

  const handleLoadingComplete = () => {
    sessionStorage.setItem('nutriscan-loaded', 'true')
    setIsLoading(false)
  }

  return (
    <>
      {isLoading && <AppLoading onLoadingComplete={handleLoadingComplete} />}
      
      <div className="min-h-svh overflow-x-hidden">
        {/* Header */}
        <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/10 bg-background/70 backdrop-blur-xl">
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-10">
              <Link href="/" className="group flex items-center gap-2.5">
                <div className="rounded-xl bg-primary p-1.5 shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                  <svg
                    className="h-6 w-6 text-primary-foreground"
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
                <span className="text-xl font-extrabold tracking-tight">NutriScan</span>
              </Link>
              <div className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex">
                <a href="#features" className="transition-colors hover:text-primary">Features</a>
                <a href="#how-it-works" className="transition-colors hover:text-primary">How it Works</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login" 
                className="px-4 py-2 text-sm font-bold transition-colors hover:text-primary"
              >
                Login
              </Link>
              <Link 
                href="/auth/sign-up"
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/30"
              >
                Sign Up Free
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative flex min-h-[90vh] items-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <div 
              className="h-full w-full bg-cover bg-center opacity-40"
              style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&q=80')"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>
          
          {/* Glow effects */}
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
                <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  AI-Powered Nutrition Analysis
                </span>
              </div>
              
              <h1 className="mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
                Scan Your Food,
                <br />
                <span className="text-primary">Know Your Health</span>
              </h1>
              
              <p className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
                Instantly identify ingredients and get comprehensive health insights from any meal photo. Your AI personal nutritionist in the cloud.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link 
                  href="/auth/sign-up"
                  className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-primary px-10 text-xl font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  Start Scanning
                </Link>
                <Link 
                  href="/auth/login"
                  className="flex h-16 items-center justify-center gap-3 rounded-2xl border border-border bg-card/50 px-10 text-xl font-bold backdrop-blur-md transition-colors hover:bg-card/80"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  Upload Image
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-3">
                  <div className="h-8 w-8 rounded-full border-2 border-background bg-primary/30" />
                  <div className="h-8 w-8 rounded-full border-2 border-background bg-primary/40" />
                  <div className="h-8 w-8 rounded-full border-2 border-background bg-primary/50" />
                </div>
                <p>Join 50,000+ users tracking daily</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="border-y border-border/10 bg-card/30 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-xl">
                <span className="mb-3 block text-sm font-extrabold uppercase tracking-[0.3em] text-primary">
                  Simple Process
                </span>
                <h2 className="text-4xl font-bold tracking-tight">How NutriScan Works</h2>
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                Our proprietary AI model processes your meal images in seconds to deliver lab-grade nutritional data.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="group rounded-3xl border border-border/50 bg-card p-8 transition-colors hover:border-primary/30">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-hover:scale-110">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl font-black text-primary/20">01</span>
                  <h3 className="text-xl font-bold">Snap or Upload</h3>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  Take a photo of your plate or upload an existing image from your gallery. Our AI works with any food type or lighting condition.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="group rounded-3xl border border-border/50 bg-card p-8 transition-colors hover:border-primary/30">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-hover:scale-110">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
                  </svg>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl font-black text-primary/20">02</span>
                  <h3 className="text-xl font-bold">AI Processing</h3>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  Our advanced neural network identifies ingredients, estimates portion sizes, and calculates macros with 98% accuracy.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="group rounded-3xl border border-border/50 bg-card p-8 transition-colors hover:border-primary/30">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-hover:scale-110">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" x2="18" y1="20" y2="10" />
                    <line x1="12" x2="12" y1="20" y2="4" />
                    <line x1="6" x2="6" y1="20" y2="14" />
                  </svg>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl font-black text-primary/20">03</span>
                  <h3 className="text-xl font-bold">Deep Insights</h3>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  Receive instant breakdown of calories, vitamins, and potential allergens, alongside personalized health recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <span className="mb-3 block text-sm font-extrabold uppercase tracking-[0.3em] text-primary">
                Features
              </span>
              <h2 className="text-4xl font-bold tracking-tight">Everything You Need</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="mb-2 font-bold">Calorie Tracking</h3>
                <p className="text-sm text-muted-foreground">Accurate calorie counts for any meal</p>
              </div>
              
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </div>
                <h3 className="mb-2 font-bold">Macro Analysis</h3>
                <p className="text-sm text-muted-foreground">Protein, carbs, and fat breakdown</p>
              </div>
              
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <h3 className="mb-2 font-bold">Health Score</h3>
                <p className="text-sm text-muted-foreground">Instant health rating 0-100</p>
              </div>
              
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="mb-2 font-bold">Scan History</h3>
                <p className="text-sm text-muted-foreground">Track your meals over time</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 to-card p-8 text-center md:p-16">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Ready to eat smarter?
              </h2>
              <p className="max-w-md text-base text-muted-foreground md:text-lg">
                Join over 50,000 health-conscious users tracking their nutrition effortlessly with AI.
              </p>
              <Link 
                href="/auth/sign-up"
                className="rounded-full bg-primary px-10 py-4 text-lg font-extrabold text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105"
              >
                Get Started Free
              </Link>
              <p className="text-xs text-muted-foreground">
                No credit card required. Cancel anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/20 px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary p-1">
                  <svg
                    className="h-5 w-5 text-primary-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>
                <span className="text-lg font-extrabold">NutriScan</span>
              </div>
              <div className="flex gap-6 text-sm font-medium text-muted-foreground">
                <a href="#" className="transition-colors hover:text-primary">Privacy</a>
                <a href="#" className="transition-colors hover:text-primary">Terms</a>
                <a href="#" className="transition-colors hover:text-primary">Support</a>
              </div>
            </div>
            <div className="mt-8 text-center text-xs text-muted-foreground">
              2024 NutriScan AI. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
