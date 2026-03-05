'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface PersonalHealthImpact {
  condition: string
  impact_level: 'safe' | 'caution' | 'warning' | 'danger'
  explanation: string
  ingredients_of_concern: string[]
}

interface FoodScan {
  id: string
  food_name: string
  image_url: string | null
  ingredients: string[]
  nutrition_data: {
    serving_size?: string
    calories: number
    total_fat: number
    saturated_fat?: number
    trans_fat?: number
    cholesterol?: number
    sodium?: number
    total_carbohydrates: number
    dietary_fiber?: number
    total_sugars?: number
    added_sugars?: number
    protein: number
    vitamin_d?: number
    calcium?: number
    iron?: number
    potassium?: number
    health_insights?: string[]
    recommendations?: string[]
    personal_health_impacts?: PersonalHealthImpact[]
  }
  health_score: number
  health_rating: string
  created_at: string
}

interface DashboardContentProps {
  user: SupabaseUser
  initialScans: FoodScan[]
}

function getHealthColor(score: number): string {
  if (score >= 80) return 'text-primary'
  if (score >= 60) return 'text-chart-2'
  if (score >= 40) return 'text-chart-4'
  return 'text-chart-5'
}

function getHealthBadgeVariant(rating: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (rating.toLowerCase()) {
    case 'excellent':
    case 'good':
    case 'very_healthy':
    case 'healthy':
      return 'default'
    case 'moderate':
      return 'secondary'
    case 'poor':
    case 'very poor':
    case 'unhealthy':
    case 'very_unhealthy':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getImpactColor(level: string) {
  switch (level) {
    case 'safe':
      return { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', icon: 'text-primary' }
    case 'caution':
      return { bg: 'bg-chart-2/10', border: 'border-chart-2/30', text: 'text-chart-2', icon: 'text-chart-2' }
    case 'warning':
      return { bg: 'bg-chart-4/10', border: 'border-chart-4/30', text: 'text-chart-4', icon: 'text-chart-4' }
    case 'danger':
      return { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive', icon: 'text-destructive' }
    default:
      return { bg: 'bg-muted', border: 'border-border', text: 'text-foreground', icon: 'text-muted-foreground' }
  }
}

function getImpactIcon(level: string) {
  switch (level) {
    case 'safe':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'caution':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )
    case 'warning':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      )
    case 'danger':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      )
    default:
      return null
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function formatRating(rating: string) {
  return rating.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function DashboardContent({ user, initialScans }: DashboardContentProps) {
  const router = useRouter()
  const [scans, setScans] = useState<FoodScan[]>(initialScans)
  const [selectedScan, setSelectedScan] = useState<FoodScan | null>(null)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('food_scans').delete().eq('id', id)
    
    if (!error) {
      setScans(prev => prev.filter(scan => scan.id !== id))
      if (selectedScan?.id === id) {
        setSelectedScan(null)
      }
    }
  }

  const todayScans = scans.filter(scan => {
    const scanDate = new Date(scan.created_at)
    const today = new Date()
    return scanDate.toDateString() === today.toDateString()
  })

  const todayCalories = todayScans.reduce((sum, scan) => sum + (scan.nutrition_data?.calories || 0), 0)
  const avgHealthScore = scans.length > 0 
    ? Math.round(scans.reduce((sum, scan) => sum + scan.health_score, 0) / scans.length)
    : 0

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/dashboard" className="group flex items-center gap-2">
            <div className="rounded-xl bg-primary p-1.5 shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
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
            <span className="text-lg font-extrabold tracking-tight">NutriScan</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link 
              href="/scan"
              className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Scan Food
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary/10">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Health Preferences
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 p-4">
        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Calories Today</p>
            <p className="mt-1 text-3xl font-bold">{todayCalories} <span className="text-lg font-normal text-muted-foreground">kcal</span></p>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Health Score</p>
            <p className="mt-1 text-3xl font-bold">{avgHealthScore} <span className="text-lg font-normal text-muted-foreground">/100</span></p>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Scans</p>
            <p className="mt-1 text-3xl font-bold">{scans.length}</p>
          </div>
        </div>

        {/* Scan History */}
        <div className="rounded-2xl border border-border/50 bg-card">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <h2 className="text-lg font-bold">Recent Scans</h2>
            {scans.length > 0 && (
              <button className="text-sm font-semibold text-primary">View All</button>
            )}
          </div>

          {scans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <svg className="h-10 w-10 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold">No scans yet</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Start scanning your food to track nutrition
              </p>
              <Link 
                href="/scan"
                className="flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Scan Your First Food
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedScan(scan)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-border/50 transition-transform group-hover:scale-[1.02]">
                    {scan.image_url ? (
                      <Image
                        src={scan.image_url}
                        alt={scan.food_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <svg className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute right-2 top-2 rounded-lg bg-background/80 px-2 py-1 backdrop-blur-sm">
                      <p className={`text-xs font-bold ${getHealthColor(scan.health_score)}`}>
                        {scan.health_score}/100
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="truncate text-sm font-bold">{scan.food_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(scan.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 border-t border-border/10 bg-background px-4 pb-6 pt-2">
        <div className="mx-auto flex max-w-4xl justify-around">
          <div className="flex flex-col items-center gap-1 text-primary">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
          </div>
          <Link href="/scan" className="flex flex-col items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Scan</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-muted-foreground/60">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">History</span>
          </div>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Detail Dialog */}
      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedScan && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedScan.food_name}</DialogTitle>
              </DialogHeader>
              
              {selectedScan.image_url && (
                <div className="relative h-40 w-full overflow-hidden rounded-xl">
                  <Image
                    src={selectedScan.image_url}
                    alt={selectedScan.food_name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-background/80 px-2 py-1 backdrop-blur-sm">
                    <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span className="text-[10px] font-semibold uppercase tracking-wider">AI Verified</span>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {/* Health Score Badge */}
                <div className="flex items-center justify-between">
                  <Badge variant={getHealthBadgeVariant(selectedScan.health_rating)}>
                    {formatRating(selectedScan.health_rating)}
                  </Badge>
                  <div className={`text-2xl font-bold ${getHealthColor(selectedScan.health_score)}`}>
                    {selectedScan.health_score}/100
                  </div>
                </div>

                {/* Nutrition Facts Table */}
                <div className="rounded-xl border border-border/50 bg-card">
                  <div className="border-b border-border/50 px-4 py-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Nutrition Facts</h4>
                    {selectedScan.nutrition_data?.serving_size && (
                      <p className="text-xs text-muted-foreground">Serving: {selectedScan.nutrition_data.serving_size}</p>
                    )}
                  </div>
                  <div className="divide-y divide-border/30">
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="font-bold">Calories</span>
                      <span className="font-bold">{selectedScan.nutrition_data?.calories || 0} kcal</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="font-medium">Total Fat</span>
                      <span>{selectedScan.nutrition_data?.total_fat || 0}g</span>
                    </div>
                    {selectedScan.nutrition_data?.saturated_fat !== undefined && (
                      <div className="flex items-center justify-between px-4 py-2 pl-8 text-sm text-muted-foreground">
                        <span>Saturated Fat</span>
                        <span>{selectedScan.nutrition_data.saturated_fat}g</span>
                      </div>
                    )}
                    {selectedScan.nutrition_data?.trans_fat !== undefined && (
                      <div className="flex items-center justify-between px-4 py-2 pl-8 text-sm text-muted-foreground">
                        <span>Trans Fat</span>
                        <span>{selectedScan.nutrition_data.trans_fat}g</span>
                      </div>
                    )}
                    {selectedScan.nutrition_data?.cholesterol !== undefined && (
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="font-medium">Cholesterol</span>
                        <span>{selectedScan.nutrition_data.cholesterol}mg</span>
                      </div>
                    )}
                    {selectedScan.nutrition_data?.sodium !== undefined && (
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="font-medium">Sodium</span>
                        <span>{selectedScan.nutrition_data.sodium}mg</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="font-medium">Total Carbs</span>
                      <span>{selectedScan.nutrition_data?.total_carbohydrates || 0}g</span>
                    </div>
                    {selectedScan.nutrition_data?.dietary_fiber !== undefined && (
                      <div className="flex items-center justify-between px-4 py-2 pl-8 text-sm text-muted-foreground">
                        <span>Dietary Fiber</span>
                        <span>{selectedScan.nutrition_data.dietary_fiber}g</span>
                      </div>
                    )}
                    {selectedScan.nutrition_data?.total_sugars !== undefined && (
                      <div className="flex items-center justify-between px-4 py-2 pl-8 text-sm text-muted-foreground">
                        <span>Total Sugars</span>
                        <span>{selectedScan.nutrition_data.total_sugars}g</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="font-medium">Protein</span>
                      <span>{selectedScan.nutrition_data?.protein || 0}g</span>
                    </div>
                    {(selectedScan.nutrition_data?.vitamin_d !== undefined || 
                      selectedScan.nutrition_data?.calcium !== undefined ||
                      selectedScan.nutrition_data?.iron !== undefined ||
                      selectedScan.nutrition_data?.potassium !== undefined) && (
                      <>
                        <div className="bg-muted/30 px-4 py-2">
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Vitamins & Minerals</span>
                        </div>
                        {selectedScan.nutrition_data?.vitamin_d !== undefined && (
                          <div className="flex items-center justify-between px-4 py-2 text-sm">
                            <span>Vitamin D</span>
                            <span>{selectedScan.nutrition_data.vitamin_d}mcg</span>
                          </div>
                        )}
                        {selectedScan.nutrition_data?.calcium !== undefined && (
                          <div className="flex items-center justify-between px-4 py-2 text-sm">
                            <span>Calcium</span>
                            <span>{selectedScan.nutrition_data.calcium}mg</span>
                          </div>
                        )}
                        {selectedScan.nutrition_data?.iron !== undefined && (
                          <div className="flex items-center justify-between px-4 py-2 text-sm">
                            <span>Iron</span>
                            <span>{selectedScan.nutrition_data.iron}mg</span>
                          </div>
                        )}
                        {selectedScan.nutrition_data?.potassium !== undefined && (
                          <div className="flex items-center justify-between px-4 py-2 text-sm">
                            <span>Potassium</span>
                            <span>{selectedScan.nutrition_data.potassium}mg</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Personal Health Impacts */}
                {selectedScan.nutrition_data?.personal_health_impacts && 
                 selectedScan.nutrition_data.personal_health_impacts.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">How This Affects You</h4>
                    <div className="space-y-3">
                      {selectedScan.nutrition_data.personal_health_impacts
                        .sort((a, b) => {
                          const order = { danger: 0, warning: 1, caution: 2, safe: 3 }
                          return (order[a.impact_level] || 4) - (order[b.impact_level] || 4)
                        })
                        .map((impact, index) => {
                          const colors = getImpactColor(impact.impact_level)
                          return (
                            <div
                              key={index}
                              className={`rounded-xl border p-4 ${colors.bg} ${colors.border}`}
                            >
                              <div className="mb-2 flex items-center gap-2">
                                <span className={colors.icon}>{getImpactIcon(impact.impact_level)}</span>
                                <span className={`font-bold ${colors.text}`}>{impact.condition}</span>
                                <Badge variant="outline" className={`ml-auto text-xs capitalize ${colors.text}`}>
                                  {impact.impact_level}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{impact.explanation}</p>
                              {impact.ingredients_of_concern && impact.ingredients_of_concern.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {impact.ingredients_of_concern.map((ing, i) => (
                                    <span
                                      key={i}
                                      className={`rounded-md px-2 py-0.5 text-xs ${colors.bg} ${colors.text}`}
                                    >
                                      {ing}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">Ingredients</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedScan.ingredients?.map((ing, i) => (
                      <span key={i} className="rounded-lg bg-muted px-3 py-1.5 text-sm">{ing}</span>
                    ))}
                  </div>
                </div>

                {/* Health Insights */}
                {selectedScan.nutrition_data?.health_insights && 
                 selectedScan.nutrition_data.health_insights.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">Health Insights</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {selectedScan.nutrition_data.health_insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {selectedScan.nutrition_data?.recommendations && 
                 selectedScan.nutrition_data.recommendations.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-chart-2">Recommendations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {selectedScan.nutrition_data.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4 shrink-0 text-chart-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDelete(selectedScan.id)}
                  >
                    <svg className="mr-2 h-4 w-4 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </Button>
                  <Button className="flex-1" onClick={() => setSelectedScan(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
