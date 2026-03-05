'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Leaf, Check, X, Plus } from 'lucide-react'

const ALLERGIES = [
  { id: 'gluten', label: 'Gluten', description: 'Wheat, barley, rye' },
  { id: 'dairy', label: 'Dairy', description: 'Milk, cheese, butter' },
  { id: 'eggs', label: 'Eggs', description: 'Whole eggs, egg products' },
  { id: 'peanuts', label: 'Peanuts', description: 'Peanuts, peanut butter' },
  { id: 'tree_nuts', label: 'Tree Nuts', description: 'Almonds, walnuts, cashews' },
  { id: 'soy', label: 'Soy', description: 'Soy sauce, tofu, tempeh' },
  { id: 'fish', label: 'Fish', description: 'All types of fish' },
  { id: 'shellfish', label: 'Shellfish', description: 'Shrimp, crab, lobster' },
  { id: 'sesame', label: 'Sesame', description: 'Sesame seeds, tahini' },
  { id: 'mustard', label: 'Mustard', description: 'Mustard seeds, condiments' },
  { id: 'celery', label: 'Celery', description: 'Celery stalks, seeds' },
  { id: 'lupin', label: 'Lupin', description: 'Lupin beans, flour' },
  { id: 'mollusks', label: 'Mollusks', description: 'Oysters, mussels, clams' },
  { id: 'sulfites', label: 'Sulfites', description: 'Wine, dried fruits' },
]

const INTOLERANCES = [
  { id: 'lactose', label: 'Lactose', description: 'Milk sugar sensitivity' },
  { id: 'fructose', label: 'Fructose', description: 'Fruit sugar sensitivity' },
  { id: 'histamine', label: 'Histamine', description: 'Aged foods, fermented' },
  { id: 'fodmap', label: 'FODMAPs', description: 'Fermentable carbs' },
  { id: 'caffeine', label: 'Caffeine', description: 'Coffee, tea, energy drinks' },
  { id: 'alcohol', label: 'Alcohol', description: 'All alcoholic beverages' },
  { id: 'msg', label: 'MSG', description: 'Monosodium glutamate' },
  { id: 'artificial_sweeteners', label: 'Artificial Sweeteners', description: 'Aspartame, sucralose' },
]

const CONDITIONS = [
  { id: 'diabetes_type1', label: 'Diabetes Type 1', description: 'Insulin-dependent' },
  { id: 'diabetes_type2', label: 'Diabetes Type 2', description: 'Insulin-resistant' },
  { id: 'prediabetes', label: 'Prediabetes', description: 'Elevated blood sugar' },
  { id: 'hypertension', label: 'Hypertension', description: 'High blood pressure' },
  { id: 'heart_disease', label: 'Heart Disease', description: 'Cardiovascular conditions' },
  { id: 'high_cholesterol', label: 'High Cholesterol', description: 'Elevated lipid levels' },
  { id: 'celiac_disease', label: 'Celiac Disease', description: 'Gluten autoimmune' },
  { id: 'ibs', label: 'IBS', description: 'Irritable bowel syndrome' },
  { id: 'crohns_disease', label: "Crohn's Disease", description: 'Inflammatory bowel' },
  { id: 'ulcerative_colitis', label: 'Ulcerative Colitis', description: 'Colon inflammation' },
  { id: 'gerd', label: 'GERD', description: 'Acid reflux disease' },
  { id: 'kidney_disease', label: 'Kidney Disease', description: 'Renal conditions' },
  { id: 'gout', label: 'Gout', description: 'Uric acid buildup' },
  { id: 'osteoporosis', label: 'Osteoporosis', description: 'Bone density loss' },
  { id: 'anemia', label: 'Anemia', description: 'Iron deficiency' },
  { id: 'thyroid_disorders', label: 'Thyroid Disorders', description: 'Hypo/hyperthyroidism' },
  { id: 'pcos', label: 'PCOS', description: 'Polycystic ovary syndrome' },
]

const LIFESTYLES = [
  { id: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
  { id: 'vegan', label: 'Vegan', description: 'No animal products' },
  { id: 'pescatarian', label: 'Pescatarian', description: 'Fish but no meat' },
  { id: 'keto', label: 'Keto', description: 'Low carb, high fat' },
  { id: 'paleo', label: 'Paleo', description: 'Whole foods, no grains' },
  { id: 'mediterranean', label: 'Mediterranean', description: 'Plant-based, olive oil' },
  { id: 'low_carb', label: 'Low Carb', description: 'Reduced carbohydrates' },
  { id: 'low_fat', label: 'Low Fat', description: 'Reduced fat intake' },
  { id: 'low_sodium', label: 'Low Sodium', description: 'Reduced salt intake' },
  { id: 'halal', label: 'Halal', description: 'Islamic dietary laws' },
  { id: 'kosher', label: 'Kosher', description: 'Jewish dietary laws' },
  { id: 'whole30', label: 'Whole30', description: '30-day clean eating' },
  { id: 'dash', label: 'DASH Diet', description: 'For hypertension' },
  { id: 'intermittent_fasting', label: 'Intermittent Fasting', description: 'Time-restricted eating' },
]

const STEPS = [
  { id: 'allergies', title: 'Food Allergies', subtitle: 'Select any food allergies you have', data: ALLERGIES },
  { id: 'intolerances', title: 'Food Intolerances', subtitle: 'Select any food sensitivities', data: INTOLERANCES },
  { id: 'conditions', title: 'Medical Conditions', subtitle: 'Select conditions that affect your diet', data: CONDITIONS },
  { id: 'lifestyles', title: 'Dietary Lifestyle', subtitle: 'Select your dietary preferences', data: LIFESTYLES },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selections, setSelections] = useState<{
    allergies: string[]
    intolerances: string[]
    conditions: string[]
    lifestyles: string[]
  }>({
    allergies: [],
    intolerances: [],
    conditions: [],
    lifestyles: [],
  })
  const [customInputs, setCustomInputs] = useState<{
    allergies: string[]
    intolerances: string[]
    conditions: string[]
    lifestyles: string[]
  }>({
    allergies: [],
    intolerances: [],
    conditions: [],
    lifestyles: [],
  })
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [noneSelected, setNoneSelected] = useState<{
    allergies: boolean
    intolerances: boolean
    conditions: boolean
    lifestyles: boolean
  }>({
    allergies: false,
    intolerances: false,
    conditions: false,
    lifestyles: false,
  })

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const currentCategory = step.id as keyof typeof selections

  const toggleSelection = (category: keyof typeof selections, id: string) => {
    // If "None" was selected, deselect it when selecting something else
    if (noneSelected[category]) {
      setNoneSelected(prev => ({ ...prev, [category]: false }))
    }
    
    setSelections(prev => ({
      ...prev,
      [category]: prev[category].includes(id)
        ? prev[category].filter(item => item !== id)
        : [...prev[category], id]
    }))
  }

  const toggleNone = (category: keyof typeof selections) => {
    const isCurrentlyNone = noneSelected[category]
    setNoneSelected(prev => ({ ...prev, [category]: !isCurrentlyNone }))
    
    // If selecting "None", clear all other selections
    if (!isCurrentlyNone) {
      setSelections(prev => ({ ...prev, [category]: [] }))
      setCustomInputs(prev => ({ ...prev, [category]: [] }))
    }
  }

  const addCustomItem = () => {
    if (customValue.trim()) {
      // Deselect "None" if it was selected
      if (noneSelected[currentCategory]) {
        setNoneSelected(prev => ({ ...prev, [currentCategory]: false }))
      }
      
      setCustomInputs(prev => ({
        ...prev,
        [currentCategory]: [...prev[currentCategory], customValue.trim()]
      }))
      setCustomValue('')
      setShowCustomInput(false)
    }
  }

  const removeCustomItem = (category: keyof typeof customInputs, item: string) => {
    setCustomInputs(prev => ({
      ...prev,
      [category]: prev[category].filter(i => i !== item)
    }))
  }

  const handleNext = () => {
    setShowCustomInput(false)
    setCustomValue('')
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setShowCustomInput(false)
    setCustomValue('')
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Combine predefined selections with custom inputs
      const profileData = {
        user_id: user.id,
        allergies: noneSelected.allergies ? [] : [...selections.allergies, ...customInputs.allergies],
        intolerances: noneSelected.intolerances ? [] : [...selections.intolerances, ...customInputs.intolerances],
        medical_conditions: noneSelected.conditions ? [] : [...selections.conditions, ...customInputs.conditions],
        dietary_lifestyles: noneSelected.lifestyles ? [] : [...selections.lifestyles, ...customInputs.lifestyles],
        onboarding_completed: true,
      }

      const { error } = await supabase
        .from('health_profiles')
        .upsert(profileData, { onConflict: 'user_id' })

      if (error) throw error

      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to save health profile:', err)
      setIsLoading(false)
    }
  }

  const totalSelections = selections[currentCategory].length + customInputs[currentCategory].length
  const hasAnySelection = totalSelections > 0 || noneSelected[currentCategory]

  return (
    <div className="min-h-screen bg-background">
      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Leaf className="h-8 w-8 animate-pulse text-primary-foreground" />
          </div>
          <div className="mb-4 h-2 w-48 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full animate-[loading_1.5s_ease-in-out_infinite] bg-primary" />
          </div>
          <p className="text-lg font-medium">Saving your preferences...</p>
          <p className="text-sm text-muted-foreground">Setting up your personalized experience</p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">NutriScan</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSkip} disabled={isLoading}>
            Skip for now
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">{step.title}</h1>
          <p className="text-muted-foreground">{step.subtitle}</p>
        </div>

        {/* None Option */}
        <Card 
          className={`mb-4 cursor-pointer transition-all hover:border-primary/50 ${
            noneSelected[currentCategory] ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
          }`}
          onClick={() => toggleNone(currentCategory)}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <Checkbox checked={noneSelected[currentCategory]} className="mt-0.5" />
            <div className="flex-1">
              <Label className="cursor-pointer font-medium">None</Label>
              <p className="text-sm text-muted-foreground">{"I don't have any " + step.title.toLowerCase()}</p>
            </div>
            {noneSelected[currentCategory] && <Check className="h-5 w-5 text-primary" />}
          </CardContent>
        </Card>

        {/* Options Grid */}
        <div className={`mb-4 grid gap-3 sm:grid-cols-2 ${noneSelected[currentCategory] ? 'pointer-events-none opacity-50' : ''}`}>
          {step.data.map((item) => {
            const isSelected = selections[currentCategory].includes(item.id)
            return (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
                }`}
                onClick={() => toggleSelection(currentCategory, item.id)}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <Checkbox checked={isSelected} className="mt-0.5" />
                  <div className="flex-1">
                    <Label className="cursor-pointer font-medium">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-primary" />}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Custom Items Display */}
        {customInputs[currentCategory].length > 0 && !noneSelected[currentCategory] && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Custom items:</p>
            <div className="flex flex-wrap gap-2">
              {customInputs[currentCategory].map((item, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {item}
                  <button
                    onClick={() => removeCustomItem(currentCategory, item)}
                    className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Option */}
        {!noneSelected[currentCategory] && (
          <div className="mb-8">
            {showCustomInput ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your own..."
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
                  autoFocus
                  className="flex-1"
                />
                <Button onClick={addCustomItem} disabled={!customValue.trim()}>
                  Add
                </Button>
                <Button variant="outline" onClick={() => { setShowCustomInput(false); setCustomValue('') }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Card 
                className="cursor-pointer border-dashed transition-all hover:border-primary/50 hover:bg-muted/50"
                onClick={() => setShowCustomInput(true)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-dashed border-muted-foreground/50">
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="cursor-pointer font-medium">Other (Please specify)</Label>
                    <p className="text-sm text-muted-foreground">Add a custom item not listed above</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Selection Summary */}
        {hasAnySelection && !noneSelected[currentCategory] && totalSelections > 0 && (
          <div className="mb-8 rounded-xl bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium">Selected ({totalSelections})</p>
            <div className="flex flex-wrap gap-2">
              {selections[currentCategory].map(id => {
                const item = step.data.find(d => d.id === id)
                return (
                  <span 
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {item?.label}
                  </span>
                )
              })}
              {customInputs[currentCategory].map((item, index) => (
                <span 
                  key={`custom-${index}`}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : isLastStep ? (
              'Complete'
            ) : (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
