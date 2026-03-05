'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  Flame, 
  Droplets, 
  Wheat, 
  Beef, 
  Heart,
  AlertCircle,
  CheckCircle,
  Save,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CircleX,
  User
} from 'lucide-react'

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

interface NutritionResultsProps {
  data: NutritionData
  onSave: () => void
  onReset: () => void
  isSaving: boolean
}

function getHealthColor(score: number): string {
  if (score >= 80) return 'bg-chart-1 text-primary-foreground'
  if (score >= 60) return 'bg-chart-2 text-foreground'
  if (score >= 40) return 'bg-chart-4 text-foreground'
  return 'bg-chart-5 text-primary-foreground'
}

function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-chart-1'
  if (score >= 60) return 'bg-chart-2'
  if (score >= 40) return 'bg-chart-4'
  return 'bg-chart-5'
}

function getImpactIcon(level: string) {
  switch (level) {
    case 'safe':
      return <ShieldCheck className="h-5 w-5 text-green-500" />
    case 'caution':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    case 'warning':
      return <ShieldAlert className="h-5 w-5 text-orange-500" />
    case 'danger':
      return <CircleX className="h-5 w-5 text-red-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-muted-foreground" />
  }
}

function getImpactBgColor(level: string): string {
  switch (level) {
    case 'safe':
      return 'bg-green-500/10 border-green-500/30'
    case 'caution':
      return 'bg-yellow-500/10 border-yellow-500/30'
    case 'warning':
      return 'bg-orange-500/10 border-orange-500/30'
    case 'danger':
      return 'bg-red-500/10 border-red-500/30'
    default:
      return 'bg-muted'
  }
}

function getImpactBadgeColor(level: string): string {
  switch (level) {
    case 'safe':
      return 'bg-green-500/20 text-green-700 border-green-500/30'
    case 'caution':
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
    case 'warning':
      return 'bg-orange-500/20 text-orange-700 border-orange-500/30'
    case 'danger':
      return 'bg-red-500/20 text-red-700 border-red-500/30'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

// Daily values for reference
const dailyValues = {
  calories: 2000,
  total_fat: 78,
  saturated_fat: 20,
  cholesterol: 300,
  sodium: 2300,
  total_carbohydrates: 275,
  dietary_fiber: 28,
  total_sugars: 50,
  protein: 50,
  vitamin_d: 20,
  calcium: 1300,
  iron: 18,
  potassium: 4700,
}

export function NutritionResults({ data, onSave, onReset, isSaving }: NutritionResultsProps) {
  const dvPercent = (value: number, dv: number) => Math.round((value / dv) * 100)
  
  const hasPersonalImpacts = data.personal_health_impacts && data.personal_health_impacts.length > 0
  const dangerImpacts = data.personal_health_impacts?.filter(i => i.impact_level === 'danger') || []
  const warningImpacts = data.personal_health_impacts?.filter(i => i.impact_level === 'warning') || []
  const cautionImpacts = data.personal_health_impacts?.filter(i => i.impact_level === 'caution') || []
  const safeImpacts = data.personal_health_impacts?.filter(i => i.impact_level === 'safe') || []

  return (
    <div className="space-y-4">
      {/* Health Score Card */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground">{data.food_name}</h3>
              <p className="text-sm text-muted-foreground">{data.serving_size}</p>
            </div>
            <div className={`flex h-16 w-16 flex-col items-center justify-center rounded-full ${getHealthColor(data.health_score)}`}>
              <span className="text-xl font-bold">{data.health_score}</span>
              <span className="text-xs">/ 100</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Health Score</span>
              <Badge variant="secondary">{data.health_rating}</Badge>
            </div>
            <Progress value={data.health_score} className={`h-2 ${getProgressColor(data.health_score)}`} />
          </div>
        </CardContent>
      </Card>

      {/* Personal Health Impacts - PROMINENT SECTION */}
      {hasPersonalImpacts && (
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              How This Affects You
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on your health profile, here's how this food may impact you
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Danger Alerts First */}
            {dangerImpacts.map((impact, i) => (
              <div 
                key={`danger-${i}`} 
                className={`rounded-xl border p-4 ${getImpactBgColor(impact.impact_level)}`}
              >
                <div className="flex items-start gap-3">
                  {getImpactIcon(impact.impact_level)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{impact.condition}</span>
                      <Badge className={`text-xs ${getImpactBadgeColor(impact.impact_level)}`}>
                        AVOID
                      </Badge>
                    </div>
                    <p className="text-sm">{impact.explanation}</p>
                    {impact.ingredients_of_concern && impact.ingredients_of_concern.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-xs text-muted-foreground">Contains:</span>
                        {impact.ingredients_of_concern.map((ing, j) => (
                          <Badge key={j} variant="outline" className="text-xs border-red-500/50 text-red-600">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Warning Alerts */}
            {warningImpacts.map((impact, i) => (
              <div 
                key={`warning-${i}`} 
                className={`rounded-xl border p-4 ${getImpactBgColor(impact.impact_level)}`}
              >
                <div className="flex items-start gap-3">
                  {getImpactIcon(impact.impact_level)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{impact.condition}</span>
                      <Badge className={`text-xs ${getImpactBadgeColor(impact.impact_level)}`}>
                        Warning
                      </Badge>
                    </div>
                    <p className="text-sm">{impact.explanation}</p>
                    {impact.ingredients_of_concern && impact.ingredients_of_concern.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-xs text-muted-foreground">Watch out for:</span>
                        {impact.ingredients_of_concern.map((ing, j) => (
                          <Badge key={j} variant="outline" className="text-xs border-orange-500/50 text-orange-600">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Caution Alerts */}
            {cautionImpacts.map((impact, i) => (
              <div 
                key={`caution-${i}`} 
                className={`rounded-xl border p-4 ${getImpactBgColor(impact.impact_level)}`}
              >
                <div className="flex items-start gap-3">
                  {getImpactIcon(impact.impact_level)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{impact.condition}</span>
                      <Badge className={`text-xs ${getImpactBadgeColor(impact.impact_level)}`}>
                        Caution
                      </Badge>
                    </div>
                    <p className="text-sm">{impact.explanation}</p>
                    {impact.ingredients_of_concern && impact.ingredients_of_concern.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-xs text-muted-foreground">Note:</span>
                        {impact.ingredients_of_concern.map((ing, j) => (
                          <Badge key={j} variant="outline" className="text-xs border-yellow-500/50 text-yellow-600">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Safe Items */}
            {safeImpacts.map((impact, i) => (
              <div 
                key={`safe-${i}`} 
                className={`rounded-xl border p-4 ${getImpactBgColor(impact.impact_level)}`}
              >
                <div className="flex items-start gap-3">
                  {getImpactIcon(impact.impact_level)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{impact.condition}</span>
                      <Badge className={`text-xs ${getImpactBadgeColor(impact.impact_level)}`}>
                        Safe
                      </Badge>
                    </div>
                    <p className="text-sm">{impact.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Macros */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nutrition Facts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
              <Flame className="mb-1 h-5 w-5 text-chart-4" />
              <span className="text-2xl font-bold">{data.calories}</span>
              <span className="text-xs text-muted-foreground">Calories</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
              <Droplets className="mb-1 h-5 w-5 text-chart-4" />
              <span className="text-2xl font-bold">{data.total_fat}g</span>
              <span className="text-xs text-muted-foreground">Fat</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
              <Wheat className="mb-1 h-5 w-5 text-chart-2" />
              <span className="text-2xl font-bold">{data.total_carbohydrates}g</span>
              <span className="text-xs text-muted-foreground">Carbs</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
              <Beef className="mb-1 h-5 w-5 text-chart-5" />
              <span className="text-2xl font-bold">{data.protein}g</span>
              <span className="text-xs text-muted-foreground">Protein</span>
            </div>
          </div>

          <Separator />

          {/* Detailed Nutrition */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between font-semibold">
              <span>Total Fat</span>
              <span>{data.total_fat}g ({dvPercent(data.total_fat, dailyValues.total_fat)}% DV)</span>
            </div>
            <div className="flex justify-between pl-4 text-muted-foreground">
              <span>Saturated Fat</span>
              <span>{data.saturated_fat}g ({dvPercent(data.saturated_fat, dailyValues.saturated_fat)}% DV)</span>
            </div>
            <div className="flex justify-between pl-4 text-muted-foreground">
              <span>Trans Fat</span>
              <span>{data.trans_fat}g</span>
            </div>
            
            <div className="flex justify-between font-semibold">
              <span>Cholesterol</span>
              <span>{data.cholesterol}mg ({dvPercent(data.cholesterol, dailyValues.cholesterol)}% DV)</span>
            </div>
            
            <div className="flex justify-between font-semibold">
              <span>Sodium</span>
              <span>{data.sodium}mg ({dvPercent(data.sodium, dailyValues.sodium)}% DV)</span>
            </div>
            
            <div className="flex justify-between font-semibold">
              <span>Total Carbohydrates</span>
              <span>{data.total_carbohydrates}g ({dvPercent(data.total_carbohydrates, dailyValues.total_carbohydrates)}% DV)</span>
            </div>
            <div className="flex justify-between pl-4 text-muted-foreground">
              <span>Dietary Fiber</span>
              <span>{data.dietary_fiber}g ({dvPercent(data.dietary_fiber, dailyValues.dietary_fiber)}% DV)</span>
            </div>
            <div className="flex justify-between pl-4 text-muted-foreground">
              <span>Total Sugars</span>
              <span>{data.total_sugars}g</span>
            </div>
            <div className="flex justify-between pl-6 text-muted-foreground">
              <span>Added Sugars</span>
              <span>{data.added_sugars}g</span>
            </div>
            
            <div className="flex justify-between font-semibold">
              <span>Protein</span>
              <span>{data.protein}g ({dvPercent(data.protein, dailyValues.protein)}% DV)</span>
            </div>

            <Separator />

            <div className="flex justify-between text-muted-foreground">
              <span>Vitamin D</span>
              <span>{data.vitamin_d}mcg ({dvPercent(data.vitamin_d, dailyValues.vitamin_d)}% DV)</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Calcium</span>
              <span>{data.calcium}mg ({dvPercent(data.calcium, dailyValues.calcium)}% DV)</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Iron</span>
              <span>{data.iron}mg ({dvPercent(data.iron, dailyValues.iron)}% DV)</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Potassium</span>
              <span>{data.potassium}mg ({dvPercent(data.potassium, dailyValues.potassium)}% DV)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Identified Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.ingredients.map((ingredient, i) => (
              <Badge key={i} variant="secondary" className="rounded-lg">
                {ingredient}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Insights */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4 text-primary" />
            Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.health_insights.map((insight, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-chart-1" />
              <span>{insight}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4 text-accent" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-accent">•</span>
              <span>{rec}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <Button onClick={onSave} disabled={isSaving} className="flex-1 rounded-xl bg-primary font-semibold">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save to History'}
        </Button>
        <Button variant="outline" onClick={onReset} className="rounded-xl">
          <RotateCcw className="mr-2 h-4 w-4" />
          Scan Another
        </Button>
      </div>
    </div>
  )
}
