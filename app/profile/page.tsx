'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  ChevronLeft,
  Leaf,
  User,
  Mail,
  Calendar,
  AlertTriangle,
  Heart,
  Activity,
  Utensils,
  Pencil,
  Check,
  X,
  LogOut,
} from 'lucide-react'

interface HealthProfile {
  full_name: string | null
  age: number | null
  allergies: string[]
  intolerances: string[]
  medical_conditions: string[]
  dietary_lifestyles: string[]
}

const ALLERGY_OPTIONS = [
  'Gluten', 'Dairy', 'Eggs', 'Peanuts', 'Tree Nuts', 'Soy', 'Fish', 
  'Shellfish', 'Wheat', 'Sesame', 'Mustard', 'Celery', 'Lupin', 'Molluscs'
]

const INTOLERANCE_OPTIONS = [
  'Lactose', 'Fructose', 'Histamine', 'Sulfites', 'Salicylates', 
  'FODMAPs', 'Caffeine', 'Alcohol', 'Artificial Sweeteners', 'MSG'
]

const CONDITION_OPTIONS = [
  'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'High Cholesterol',
  'Heart Disease', 'Kidney Disease', 'IBS', 'Crohn\'s Disease', 
  'Celiac Disease', 'GERD', 'Gout', 'Anemia', 'Thyroid Disorder', 'PCOS'
]

const LIFESTYLE_OPTIONS = [
  'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Mediterranean',
  'Low Carb', 'Low Fat', 'Low Sodium', 'Halal', 'Kosher', 'Gluten Free',
  'Dairy Free', 'Organic Only', 'No Processed Foods'
]

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<HealthProfile>({
    full_name: null,
    age: null,
    allergies: [],
    intolerances: [],
    medical_conditions: [],
    dietary_lifestyles: [],
  })
  const [editMode, setEditMode] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string | number | string[]>('')

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setEmail(user.email || '')

      const { data } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile({
          full_name: data.full_name,
          age: data.age,
          allergies: data.allergies || [],
          intolerances: data.intolerances || [],
          medical_conditions: data.medical_conditions || [],
          dietary_lifestyles: data.dietary_lifestyles || [],
        })
      }
      setIsLoading(false)
    }

    fetchProfile()
  }, [router])

  const handleSave = async (field: string, value: string | number | string[]) => {
    setIsSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const updateData: Record<string, string | number | string[]> = { [field]: value }

    const { error } = await supabase
      .from('health_profiles')
      .update(updateData)
      .eq('user_id', user.id)

    if (!error) {
      setProfile(prev => ({ ...prev, [field]: value }))
    }
    setEditMode(null)
    setIsSaving(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const startEdit = (field: string, currentValue: string | number | string[] | null) => {
    setEditMode(field)
    setTempValue(currentValue || (typeof currentValue === 'number' ? 0 : ''))
  }

  const toggleArrayItem = (item: string) => {
    const currentArray = tempValue as string[]
    if (currentArray.includes(item)) {
      setTempValue(currentArray.filter(i => i !== item))
    } else {
      setTempValue([...currentArray, item])
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Leaf className="h-8 w-8 animate-pulse text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  const renderEditableField = (
    field: string,
    label: string,
    icon: React.ReactNode,
    value: string | number | null,
    type: 'text' | 'number' = 'text'
  ) => (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          {editMode === field ? (
            <Input
              type={type}
              value={tempValue as string | number}
              onChange={(e) => setTempValue(type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
              className="mt-1 h-8 w-48"
              autoFocus
            />
          ) : (
            <p className="font-medium">{value || 'Not set'}</p>
          )}
        </div>
      </div>
      {editMode === field ? (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-primary"
            onClick={() => handleSave(field, tempValue as string | number)}
            disabled={isSaving}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setEditMode(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => startEdit(field, value)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  const renderArrayField = (
    field: string,
    label: string,
    icon: React.ReactNode,
    value: string[],
    options: string[]
  ) => (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">
              {value.length > 0 ? `${value.length} selected` : 'None'}
            </p>
          </div>
        </div>
        {editMode === field ? (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-primary"
              onClick={() => handleSave(field, tempValue as string[])}
              disabled={isSaving}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setEditMode(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => startEdit(field, value)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {editMode === field ? (
        <div className="flex flex-wrap gap-2 pt-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleArrayItem(option)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                (tempValue as string[]).includes(option)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : value.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-2">
          {value.map((item) => (
            <span
              key={item}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-lg font-bold">Profile</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Profile Header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold">{profile.full_name || 'User'}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>

        {/* Personal Info Section */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Personal Information
          </h3>
          <div className="space-y-3">
            {renderEditableField('full_name', 'Full Name', <User className="h-5 w-5" />, profile.full_name)}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{email}</p>
                </div>
              </div>
            </div>
            {renderEditableField('age', 'Age', <Calendar className="h-5 w-5" />, profile.age, 'number')}
          </div>
        </div>

        {/* Health Preferences Section */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Health Preferences
          </h3>
          <div className="space-y-3">
            {renderArrayField(
              'allergies',
              'Food Allergies',
              <AlertTriangle className="h-5 w-5" />,
              profile.allergies,
              ALLERGY_OPTIONS
            )}
            {renderArrayField(
              'intolerances',
              'Food Intolerances',
              <Heart className="h-5 w-5" />,
              profile.intolerances,
              INTOLERANCE_OPTIONS
            )}
            {renderArrayField(
              'medical_conditions',
              'Medical Conditions',
              <Activity className="h-5 w-5" />,
              profile.medical_conditions,
              CONDITION_OPTIONS
            )}
            {renderArrayField(
              'dietary_lifestyles',
              'Dietary Lifestyle',
              <Utensils className="h-5 w-5" />,
              profile.dietary_lifestyles,
              LIFESTYLE_OPTIONS
            )}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/scan" className="flex flex-col items-center gap-1 text-muted-foreground">
            <div className="flex h-12 w-12 -translate-y-2 items-center justify-center rounded-full bg-primary shadow-lg">
              <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-primary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
