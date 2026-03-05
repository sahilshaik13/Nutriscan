'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background p-4 pb-2">
        <Link 
          href="/" 
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary/10"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8L2 12l4 4" />
            <path d="M2 12h20" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/20 p-1.5">
            <svg
              className="h-6 w-6 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">NutriScan</h2>
        </div>
        <div className="h-12 w-12 shrink-0" />
      </div>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-start px-6 pt-10">
        {/* Header Section */}
        <div className="mb-10 w-full text-center">
          <h1 className="mb-3 text-[32px] font-extrabold leading-tight tracking-tight">
            Create Account
          </h1>
          <p className="text-base font-normal text-muted-foreground">
            Start your journey to healthier eating
          </p>
        </div>

        {/* Divider */}
        <div className="mb-8 flex w-full items-center">
          <div className="h-px flex-1 bg-border" />
          <span className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Sign Up
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSignUp} className="flex w-full flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="ml-1 text-sm font-semibold">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-xl border-border bg-card px-4 text-base font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="ml-1 text-sm font-semibold">
              Password
            </Label>
            <div className="relative flex w-full">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-xl border-border bg-card px-4 pr-12 text-base font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-muted-foreground"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" x2="23" y1="1" y2="23" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword" className="ml-1 text-sm font-semibold">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-14 rounded-xl border-border bg-card px-4 text-base font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button 
            type="submit" 
            className="mt-4 h-14 rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Footer / Toggle */}
        <div className="mt-auto py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Legal Links */}
        <div className="flex gap-4 pb-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <a href="#" className="hover:text-primary">Terms</a>
          <span>-</span>
          <a href="#" className="hover:text-primary">Privacy</a>
          <span>-</span>
          <a href="#" className="hover:text-primary">Help</a>
        </div>
      </main>
    </div>
  )
}
