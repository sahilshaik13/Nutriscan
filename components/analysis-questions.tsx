'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ChevronRight, Loader2, PenLine } from 'lucide-react'

interface Question {
  id: string
  question: string
  type?: string
  options: string[]
  allow_specify?: boolean
  specify_placeholder?: string
}

interface AnalysisQuestionsProps {
  foodName: string
  questions: Question[]
  onSubmit: (answers: Record<string, string>) => void
  isLoading: boolean
}

export function AnalysisQuestions({ 
  foodName, 
  questions, 
  onSubmit,
  isLoading 
}: AnalysisQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [specifyMode, setSpecifyMode] = useState<Record<string, boolean>>({})
  const [specifyValues, setSpecifyValues] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleAnswer = (questionId: string, answer: string) => {
    // If selecting a predefined option, exit specify mode
    setSpecifyMode(prev => ({ ...prev, [questionId]: false }))
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSpecifyToggle = (questionId: string) => {
    setSpecifyMode(prev => ({ ...prev, [questionId]: !prev[questionId] }))
    // Clear the radio selection when entering specify mode
    if (!specifyMode[questionId]) {
      setAnswers(prev => {
        const newAnswers = { ...prev }
        delete newAnswers[questionId]
        return newAnswers
      })
    }
  }

  const handleSpecifyValue = (questionId: string, value: string) => {
    setSpecifyValues(prev => ({ ...prev, [questionId]: value }))
    if (value.trim()) {
      setAnswers(prev => ({ ...prev, [questionId]: `Custom: ${value}` }))
    } else {
      setAnswers(prev => {
        const newAnswers = { ...prev }
        delete newAnswers[questionId]
        return newAnswers
      })
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(answers)
  }

  const currentQuestion = questions[currentIndex]
  const isAnswered = answers[currentQuestion?.id]
  const isLastQuestion = currentIndex === questions.length - 1
  const allAnswered = questions.every(q => answers[q.id])
  const isInSpecifyMode = specifyMode[currentQuestion?.id]

  return (
    <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Help us improve accuracy</CardTitle>
        <CardDescription>
          {"We identified this as"} <span className="font-semibold text-primary">{foodName}</span>. 
          Answer a few questions for better nutrition estimates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < currentIndex 
                  ? 'bg-primary' 
                  : i === currentIndex 
                    ? 'bg-primary/70' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Question Counter */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          {isAnswered && <span className="text-primary">Answered</span>}
        </div>

        {currentQuestion && (
          <div className="space-y-4">
            <p className="text-lg font-medium">{currentQuestion.question}</p>
            
            <RadioGroup
              value={isInSpecifyMode ? '' : (answers[currentQuestion.id] || '')}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              className="space-y-2"
            >
              {currentQuestion.options.map((option) => (
                <div 
                  key={option} 
                  className={`flex items-center space-x-3 rounded-xl border p-4 transition-all ${
                    answers[currentQuestion.id] === option 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border/50 hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value={option} id={`${currentQuestion.id}-${option}`} />
                  <Label 
                    htmlFor={`${currentQuestion.id}-${option}`}
                    className="flex-1 cursor-pointer font-medium"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Specify Option */}
            {currentQuestion.allow_specify && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSpecifyToggle(currentQuestion.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-all ${
                    isInSpecifyMode 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border/50 hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    isInSpecifyMode ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <PenLine className="h-4 w-4" />
                  </div>
                  <span className="font-medium">
                    {isInSpecifyMode ? 'Enter your own value' : 'Specify exact value'}
                  </span>
                </button>

                {isInSpecifyMode && (
                  <Input
                    type="text"
                    placeholder={currentQuestion.specify_placeholder || 'Enter your value...'}
                    value={specifyValues[currentQuestion.id] || ''}
                    onChange={(e) => handleSpecifyValue(currentQuestion.id, e.target.value)}
                    className="h-12 rounded-xl border-primary/30 bg-background pl-4"
                    autoFocus
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-2">
          {currentIndex > 0 && (
            <Button 
              variant="outline"
              onClick={handlePrevious}
              className="rounded-xl"
            >
              Back
            </Button>
          )}
          
          {!isLastQuestion ? (
            <Button 
              onClick={handleNext} 
              disabled={!isAnswered}
              className="flex-1 rounded-xl bg-primary font-semibold"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!allAnswered || isLoading}
              className="flex-1 rounded-xl bg-primary font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Get Nutrition Info'
              )}
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          Skip questions and get quick results
        </Button>
      </CardContent>
    </Card>
  )
}
