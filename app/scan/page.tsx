'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { parseApiError, getErrorMessage } from '@/lib/error-messages'
import { Button } from '@/components/ui/button'
import { CameraCapture } from '@/components/camera-capture'
import { ImageUpload } from '@/components/image-upload'
import { AnalysisQuestions } from '@/components/analysis-questions'
import { NutritionResults } from '@/components/nutrition-results'
import Link from 'next/link'
import Image from 'next/image'

interface HealthProfile {
  allergies: string[]
  intolerances: string[]
  medical_conditions: string[]
  dietary_lifestyles: string[]
}

interface Question {
  id: string
  question: string
  type?: string
  options: string[]
  allow_specify?: boolean
  specify_placeholder?: string
}

interface InitialAnalysis {
  food_name: string
  ingredients: string[]
  serving_size: string
  confidence: string
  questions: Question[]
}

interface PersonalHealthImpact {
  condition: string
  impact_level: 'safe' | 'caution' | 'warning' | 'danger'
  explanation: string
  ingredients_of_concern: string[]
}

interface NutritionData {
  food_name: string
  ingredients: string[]
  serving_size: string
  calories: number
  total_fat: number
  saturated_fat: number
  trans_fat: number
  cholesterol: number
  sodium: number
  total_carbohydrates: number
  dietary_fiber: number
  total_sugars: number
  added_sugars: number
  protein: number
  vitamin_d: number
  calcium: number
  iron: number
  potassium: number
  health_score: number
  health_rating: string
  health_insights: string[]
  recommendations: string[]
  personal_health_impacts?: PersonalHealthImpact[]
}

type ScanStep = 'capture' | 'identifying' | 'analyzing' | 'questions' | 'calculating' | 'results'

export default function ScanPage() {
  const router = useRouter()
  const [step, setStep] = useState<ScanStep>('capture')
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string>('image/jpeg')
  const [initialAnalysis, setInitialAnalysis] = useState<InitialAnalysis | null>(null)
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null)
  const [showFoodIdentifier, setShowFoodIdentifier] = useState(false)
  const [foodNameInput, setFoodNameInput] = useState('')
  const [pendingImage, setPendingImage] = useState<{ data: string; type: string } | null>(null)

  // Fetch user's health profile on mount
  useEffect(() => {
    const fetchHealthProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('health_profiles')
          .select('allergies, intolerances, medical_conditions, dietary_lifestyles')
          .eq('user_id', user.id)
          .single()
        
        if (data) {
          setHealthProfile(data)
        }
      }
    }
    
    fetchHealthProfile()
  }, [])

  const handleFoodNameSubmit = async () => {
    if (!foodNameInput.trim() || !pendingImage) return
    
    setCapturedImage(pendingImage.data)
    setMimeType(pendingImage.type)
    setPendingImage(null)
    setShowFoodIdentifier(false)
    setError(null)
    setStep('analyzing')

    console.log('[v0] Starting image analysis with food name:', foodNameInput)

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image_base64: pendingImage.data, 
          mime_type: pendingImage.type,
          health_profile: healthProfile,
          food_name_hint: foodNameInput 
        }),
      })

      console.log('[v0] Response status:', response.status)
      
      const responseText = await response.text()
      console.log('[v0] Response body:', responseText.substring(0, 500))

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`)
      }

      const data: InitialAnalysis = JSON.parse(responseText)
      console.log('[v0] Parsed data:', data)
      setInitialAnalysis(data)
      
      if (data.questions && data.questions.length > 0) {
        setStep('questions')
      } else {
        handleQuickAnalysis(pendingImage.data, pendingImage.type)
      }
    } catch (err) {
      console.error('[v0] Error in handleFoodNameSubmit:', err)
      const errorMessage = await (async () => {
        if (err instanceof Response) {
          return await parseApiError(err)
        }
        return getErrorMessage(err)
      })()
      setError(errorMessage)
      setStep('capture')
    } finally {
      setFoodNameInput('')
    }
  }

  const handleImageCapture = async (imageData: string, type: string) => {
    setCapturedImage(imageData)
    setMimeType(type)
    setShowCamera(false)
    setError(null)
    setStep('analyzing')

    console.log('[v0] Starting image analysis from camera...')
    console.log('[v0] Image data length:', imageData.length)
    console.log('[v0] MIME type:', type)

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image_base64: imageData, 
          mime_type: type,
          health_profile: healthProfile 
        }),
      })

      console.log('[v0] Response status:', response.status)
      
      const responseText = await response.text()
      console.log('[v0] Response body:', responseText.substring(0, 500))

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`)
      }

      const data: InitialAnalysis = JSON.parse(responseText)
      console.log('[v0] Parsed data:', data)
      setInitialAnalysis(data)
      
      if (data.questions && data.questions.length > 0) {
        setStep('questions')
      } else {
        handleQuickAnalysis(imageData, type)
      }
    } catch (err) {
      console.error('[v0] Error in handleImageCapture:', err)
      const errorMessage = await (async () => {
        if (err instanceof Response) {
          return await parseApiError(err)
        }
        return getErrorMessage(err)
      })()
      setError(errorMessage)
      setStep('capture')
    }
  }

  const handleImageUpload = (imageData: string, type: string) => {
    // For direct image uploads, ask what food product it is
    setPendingImage({ data: imageData, type })
    setShowFoodIdentifier(true)
  }

  const handleQuickAnalysis = async (imageData: string, type: string) => {
    setStep('calculating')
    try {
      const response = await fetch('/api/quick-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image_base64: imageData, 
          mime_type: type,
          health_profile: healthProfile 
        }),
      })

      if (!response.ok) {
        const errorMessage = await parseApiError(response)
        throw new Error(errorMessage)
      }

      const data: NutritionData = await response.json()
      setNutritionData(data)
      setStep('results')
    } catch (err) {
      setError(getErrorMessage(err))
      setStep('questions')
    }
  }

  const handleQuestionsSubmit = async (answers: Record<string, string>) => {
    if (!initialAnalysis) return
    
    setStep('calculating')
    try {
      const response = await fetch('/api/calculate-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: initialAnalysis.food_name,
          initial_ingredients: initialAnalysis.ingredients,
          answers,
          health_profile: healthProfile,
        }),
      })

      if (!response.ok) {
        const errorMessage = await parseApiError(response)
        throw new Error(errorMessage)
      }

      const data: NutritionData = await response.json()
      setNutritionData(data)
      setStep('results')
    } catch (err) {
      setError(getErrorMessage(err))
      setStep('questions')
    }
  }

  const handleSave = async () => {
    if (!nutritionData) return
    
    setIsSaving(true)
    console.log('[v0] Starting save...')
    
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      console.log('[v0] User:', user?.id, 'Error:', userError)
      
      if (!user) {
        console.log('[v0] No user, redirecting to login')
        router.push('/auth/login')
        return
      }

      // Map health rating to database allowed values
      const healthRatingMap: Record<string, string> = {
        'excellent': 'very_healthy',
        'good': 'healthy',
        'moderate': 'moderate',
        'poor': 'unhealthy',
        'very poor': 'very_unhealthy',
      }
      const dbHealthRating = healthRatingMap[nutritionData.health_rating.toLowerCase()] || 'moderate'

      const insertData = {
        user_id: user.id,
        food_name: nutritionData.food_name,
        image_url: capturedImage ? `data:${mimeType};base64,${capturedImage}` : null,
        ingredients: nutritionData.ingredients,
        nutrition_data: {
          serving_size: nutritionData.serving_size,
          calories: nutritionData.calories,
          total_fat: nutritionData.total_fat,
          saturated_fat: nutritionData.saturated_fat,
          trans_fat: nutritionData.trans_fat,
          cholesterol: nutritionData.cholesterol,
          sodium: nutritionData.sodium,
          total_carbohydrates: nutritionData.total_carbohydrates,
          dietary_fiber: nutritionData.dietary_fiber,
          total_sugars: nutritionData.total_sugars,
          added_sugars: nutritionData.added_sugars,
          protein: nutritionData.protein,
          vitamin_d: nutritionData.vitamin_d,
          calcium: nutritionData.calcium,
          iron: nutritionData.iron,
          potassium: nutritionData.potassium,
          health_insights: nutritionData.health_insights,
          recommendations: nutritionData.recommendations,
          personal_health_impacts: nutritionData.personal_health_impacts,
        },
        health_score: nutritionData.health_score,
        health_rating: dbHealthRating,
      }

      console.log('[v0] Insert data:', JSON.stringify(insertData).substring(0, 500))

      const { error: insertError } = await supabase.from('food_scans').insert(insertData)

      if (insertError) {
        console.error('[v0] Insert error:', insertError)
        throw insertError
      }
      
      console.log('[v0] Save successful, redirecting to dashboard')
      router.push('/dashboard')
    } catch (err) {
      console.error('[v0] Save error:', err)
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setCapturedImage(null)
    setInitialAnalysis(null)
    setNutritionData(null)
    setError(null)
    setStep('capture')
    setPendingImage(null)
    setFoodNameInput('')
  }

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleImageCapture}
        onClose={() => setShowCamera(false)}
      />
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-4 px-4">
          <Link 
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary/10"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 text-center text-lg font-bold">Scan Food</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 p-4">
        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Food Identifier Modal */}
        {showFoodIdentifier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
              <h2 className="mb-2 text-xl font-bold">What food product is this?</h2>
              <p className="mb-6 text-sm text-muted-foreground">Help us identify the product for accurate nutrition analysis. You can provide the brand name, product name, or a description.</p>
              
              <input
                type="text"
                value={foodNameInput}
                onChange={(e) => setFoodNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFoodNameSubmit()
                  }
                }}
                placeholder="e.g., 'Chocolate chip cookies', 'Almond milk', 'Granola cereal'"
                className="mb-6 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFoodIdentifier(false)
                    setPendingImage(null)
                    setFoodNameInput('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFoodNameSubmit}
                  disabled={!foodNameInput.trim()}
                  className="flex-1"
                >
                  Analyze
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Capture Step */}
        {step === 'capture' && (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
              {capturedImage ? (
                <div className="relative aspect-video">
                  <Image
                    src={`data:${mimeType};base64,${capturedImage}`}
                    alt="Captured food"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-background/80 px-3 py-1.5 backdrop-blur-sm">
                    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Ready to Scan</span>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-card/50">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                    <svg className="h-10 w-10 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">No image captured yet</p>
                    <p className="text-sm text-muted-foreground">Take a photo or upload an image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Button 
                size="lg" 
                onClick={() => setShowCamera(true)}
                className="h-16 rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                Take Photo
              </Button>
              <ImageUpload onUpload={handleImageUpload} />
            </div>

            {/* Description */}
            <div className="space-y-2 rounded-xl bg-primary/5 p-4">
              <h3 className="font-semibold text-foreground">How it works:</h3>
              <p className="text-sm text-muted-foreground">
                Nutriscan analyzes fresh foods, packaged items, and even nutritional labels to understand your nutrition. Upload or take a photo of any food product to get detailed nutritional analysis personalized to your health profile.
              </p>
            </div>

            {/* Recent Scans Link */}
            <div className="flex justify-center">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                View Recent Scans
              </Link>
            </div>
          </div>
        )}

        {/* Analyzing Step */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '2s' }} />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-12 w-12 animate-pulse text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold">Analyzing your food...</h2>
            <p className="text-muted-foreground">Our AI is identifying ingredients</p>
          </div>
        )}

        {/* Questions Step */}
        {step === 'questions' && initialAnalysis && (
          <div className="space-y-6">
            {capturedImage && (
              <div className="relative mx-auto w-48 overflow-hidden rounded-xl border-2 border-primary/30 shadow-lg shadow-primary/10">
                <div className="aspect-square">
                  <Image
                    src={`data:${mimeType};base64,${capturedImage}`}
                    alt="Captured food"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-background/80 px-2 py-1 backdrop-blur-sm">
                  <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase">Detected: {initialAnalysis.food_name}</span>
                </div>
              </div>
            )}
            <AnalysisQuestions
              foodName={initialAnalysis.food_name}
              questions={initialAnalysis.questions}
              onSubmit={handleQuestionsSubmit}
              isLoading={step === 'calculating'}
            />
          </div>
        )}

        {/* Calculating Step */}
        {step === 'calculating' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '2s' }} />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-12 w-12 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold">Calculating nutrition...</h2>
            <p className="text-muted-foreground">Building your nutrition profile</p>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && nutritionData && (
          <NutritionResults
            data={nutritionData}
            onSave={handleSave}
            onReset={handleReset}
            isSaving={isSaving}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 border-t border-border/10 bg-background px-4 pb-6 pt-2">
        <div className="mx-auto flex max-w-2xl justify-around">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-primary">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
              <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
              <path d="m9.5 4 2.5 3h-5l2.5-3Z" fill="currentColor" />
              <path d="m14.5 4 2.5 3h-5l2.5-3Z" fill="currentColor" />
              <circle cx="12" cy="13" r="3" fill="var(--background)" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Scan</span>
          </div>
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">History</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
      const dbHealthRating = healthRatingMap[nutritionData.health_rating.toLowerCase()] || 'moderate'

      const insertData = {
        user_id: user.id,
        food_name: nutritionData.food_name,
        image_url: capturedImage ? `data:${mimeType};base64,${capturedImage}` : null,
        ingredients: nutritionData.ingredients,
        nutrition_data: {
          serving_size: nutritionData.serving_size,
          calories: nutritionData.calories,
          total_fat: nutritionData.total_fat,
          saturated_fat: nutritionData.saturated_fat,
          trans_fat: nutritionData.trans_fat,
          cholesterol: nutritionData.cholesterol,
          sodium: nutritionData.sodium,
          total_carbohydrates: nutritionData.total_carbohydrates,
          dietary_fiber: nutritionData.dietary_fiber,
          total_sugars: nutritionData.total_sugars,
          added_sugars: nutritionData.added_sugars,
          protein: nutritionData.protein,
          vitamin_d: nutritionData.vitamin_d,
          calcium: nutritionData.calcium,
          iron: nutritionData.iron,
          potassium: nutritionData.potassium,
          health_insights: nutritionData.health_insights,
          recommendations: nutritionData.recommendations,
          personal_health_impacts: nutritionData.personal_health_impacts,
        },
        health_score: nutritionData.health_score,
        health_rating: dbHealthRating,
      }

      console.log('[v0] Insert data:', JSON.stringify(insertData).substring(0, 500))

      const { error: insertError } = await supabase.from('food_scans').insert(insertData)

      if (insertError) {
        console.error('[v0] Insert error:', insertError)
        throw insertError
      }
      
      console.log('[v0] Save successful, redirecting to dashboard')
      router.push('/dashboard')
    } catch (err) {
      console.error('[v0] Save error:', err)
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setCapturedImage(null)
    setInitialAnalysis(null)
    setNutritionData(null)
    setError(null)
    setStep('capture')
  }

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleImageCapture}
        onClose={() => setShowCamera(false)}
      />
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-4 px-4">
          <Link 
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary/10"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 text-center text-lg font-bold">Scan Food</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 p-4">
        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Capture Step */}
        {step === 'capture' && (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
              {capturedImage ? (
                <div className="relative aspect-video">
                  <Image
                    src={`data:${mimeType};base64,${capturedImage}`}
                    alt="Captured food"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-background/80 px-3 py-1.5 backdrop-blur-sm">
                    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Ready to Scan</span>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-card/50">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                    <svg className="h-10 w-10 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">No image captured yet</p>
                    <p className="text-sm text-muted-foreground">Take a photo or upload an image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Button 
                size="lg" 
                onClick={() => setShowCamera(true)}
                className="h-16 rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                Take Photo
              </Button>
              <ImageUpload onUpload={handleImageCapture} />
            </div>

            {/* Recent Scans Link */}
            <div className="flex justify-center">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                View Recent Scans
              </Link>
            </div>
          </div>
        )}

        {/* Analyzing Step */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '2s' }} />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-12 w-12 animate-pulse text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold">Analyzing your food...</h2>
            <p className="text-muted-foreground">Our AI is identifying ingredients</p>
          </div>
        )}

        {/* Questions Step */}
        {step === 'questions' && initialAnalysis && (
          <div className="space-y-6">
            {capturedImage && (
              <div className="relative mx-auto w-48 overflow-hidden rounded-xl border-2 border-primary/30 shadow-lg shadow-primary/10">
                <div className="aspect-square">
                  <Image
                    src={`data:${mimeType};base64,${capturedImage}`}
                    alt="Captured food"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-background/80 px-2 py-1 backdrop-blur-sm">
                  <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase">Detected: {initialAnalysis.food_name}</span>
                </div>
              </div>
            )}
            <AnalysisQuestions
              foodName={initialAnalysis.food_name}
              questions={initialAnalysis.questions}
              onSubmit={handleQuestionsSubmit}
              isLoading={step === 'calculating'}
            />
          </div>
        )}

        {/* Calculating Step */}
        {step === 'calculating' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '2s' }} />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-12 w-12 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold">Calculating nutrition...</h2>
            <p className="text-muted-foreground">Building your nutrition profile</p>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && nutritionData && (
          <NutritionResults
            data={nutritionData}
            onSave={handleSave}
            onReset={handleReset}
            isSaving={isSaving}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 border-t border-border/10 bg-background px-4 pb-6 pt-2">
        <div className="mx-auto flex max-w-2xl justify-around">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-primary">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
              <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
              <path d="m9.5 4 2.5 3h-5l2.5-3Z" fill="currentColor" />
              <path d="m14.5 4 2.5 3h-5l2.5-3Z" fill="currentColor" />
              <circle cx="12" cy="13" r="3" fill="var(--background)" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Scan</span>
          </div>
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">History</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wider">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
