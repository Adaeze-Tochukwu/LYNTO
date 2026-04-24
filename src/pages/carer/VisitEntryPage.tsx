import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MobileLayout, Header } from '@/components/layout'
import {
  Card,
  Button,
  Checkbox,
  Input,
  VoiceTextInput,
  Progress,
  RiskAlert,
  ClinicalWarningCard,
  WhyThisScore,
} from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { supabase } from '@/lib/supabase'
import { symptomCategories } from '@/data/symptoms'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import type { Vitals, RiskLevel, ScoringEngineResult } from '@/types'

// Define all form steps
const STEPS = [
  ...symptomCategories.map((cat) => ({ type: 'symptoms' as const, category: cat })),
  { type: 'vital' as const, name: 'temperature', label: 'Temperature', unit: '°C', placeholder: '36.5' },
  { type: 'vital' as const, name: 'pulse', label: 'Pulse', unit: 'bpm', placeholder: '72' },
  { type: 'vitals-bp' as const, label: 'Blood Pressure' },
  { type: 'vital' as const, name: 'oxygenSaturation', label: 'Oxygen Saturation', unit: '%', placeholder: '98' },
  { type: 'vital' as const, name: 'respiratoryRate', label: 'Respiratory Rate', unit: '/min', placeholder: '16' },
  { type: 'note' as const },
  { type: 'review' as const },
]

const TOTAL_STEPS = STEPS.length

export function VisitEntryPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { user, agency } = useAuth()
  const { getClientById, createVisitEntry } = useApp()

  const client = clientId ? getClientById(clientId) : undefined

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set())
  const [vitals, setVitals] = useState<Vitals>({})
  const [note, setNote] = useState('')
  const [result, setResult] = useState<{
    score: number
    riskLevel: RiskLevel
    reasons: string[]
    engineResult?: ScoringEngineResult
  } | null>(null)
  const [saving, setSaving] = useState(false)

  if (!client) {
    return (
      <MobileLayout header={<Header title="Visit Entry" showBack />}>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Client not found</p>
        </div>
      </MobileLayout>
    )
  }

  const step = STEPS[currentStep]

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms((prev) => {
      const next = new Set(prev)
      if (next.has(symptomId)) {
        next.delete(symptomId)
      } else {
        next.add(symptomId)
      }
      return next
    })
  }

  const handleVitalChange = (name: keyof Vitals, value: string) => {
    const numValue = value ? parseFloat(value) : undefined
    setVitals((prev) => ({
      ...prev,
      [name]: numValue,
    }))
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    } else {
      navigate(-1)
    }
  }

  const handleSubmit = async () => {
    if (!user || !agency) return

    setSaving(true)
    try {
      const entry = await createVisitEntry(
        client.id,
        user.id,
        agency.id,
        Array.from(selectedSymptoms),
        vitals,
        note
      )
      if (entry) {
        const engineResult = (entry as any)._engineResult as ScoringEngineResult | undefined
        setResult({
          score: entry.score,
          riskLevel: entry.riskLevel,
          reasons: entry.reasons,
          engineResult,
        })
        handleNext()

        // Auto-call manager on red alert
        if (entry.riskLevel === 'red') {
          supabase.functions.invoke('notify-red-alert', {
            body: {
              clientName: client.displayName,
              carerName: user.fullName,
              agencyId: agency.id,
            },
          }).then(({ data, error }) => {
            if (error) console.error('notify-red-alert error:', error)
            else console.log('notify-red-alert response:', data)
          })
        }
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDone = () => {
    navigate('/carer')
  }

  // Render current step content
  const renderStepContent = () => {
    // Result screen
    if (result) {
      const eng = result.engineResult
      const displayRiskLevel = eng?.finalRiskLevel ?? result.riskLevel

      return (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center">
            <div
              className={cn(
                'w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center',
                displayRiskLevel === 'green' && 'bg-risk-green-light',
                displayRiskLevel === 'amber' && 'bg-risk-amber-light',
                displayRiskLevel === 'red' && 'bg-risk-red-light'
              )}
            >
              <Check
                className={cn(
                  'w-8 h-8',
                  displayRiskLevel === 'green' && 'text-risk-green',
                  displayRiskLevel === 'amber' && 'text-risk-amber',
                  displayRiskLevel === 'red' && 'text-risk-red'
                )}
              />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Entry Saved</h2>
          </div>

          {/* Primary risk display */}
          {eng ? (
            <Card padding="md">
              <p className="text-xs text-slate-400 mb-1">LYNTO Health Risk Score™</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-slate-800">
                  {eng.finalHealthRiskScore}
                  <span className="text-base font-normal text-slate-400">/100</span>
                </span>
                <div
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-sm font-semibold',
                    displayRiskLevel === 'red' && 'bg-risk-red-light text-risk-red',
                    displayRiskLevel === 'amber' && 'bg-risk-amber-light text-amber-800',
                    displayRiskLevel === 'green' && 'bg-risk-green-light text-green-800'
                  )}
                >
                  {eng.riskBandLabel.split('/')[0].trim()}
                </div>
              </div>
              {eng.riskBandLabel.includes('/') && (
                <p className="text-xs text-slate-500 mt-1">{eng.riskBandLabel.split('/')[1]?.trim()}</p>
              )}
            </Card>
          ) : (
            <RiskAlert level={result.riskLevel} score={result.score} />
          )}

          {/* Clinical Warning Score */}
          {eng && (
            <ClinicalWarningCard
              score={eng.clinicalWarningScore}
              band={eng.clinicalWarningBand}
              partial={eng.clinicalWarningPartial}
              singleRedParameter={eng.singleRedParameter}
              parameterBreakdown={eng.clinicalParameterBreakdown}
            />
          )}

          {/* Why this score */}
          {eng && (
            <WhyThisScore
              breakdown={{
                id: '',
                visitEntryId: '',
                clientId: '',
                agencyId: '',
                baseSymptomScore: eng.baseSymptomScore,
                vitalSignScore: eng.vitalSignScore,
                baselineChangeScore: eng.baselineChangeScore,
                conditionAdjustmentScore: eng.conditionAdjustmentScore,
                trendScore: eng.trendScore,
                highRiskCombinationScore: eng.highRiskCombinationScore,
                finalHealthRiskScore: eng.finalHealthRiskScore,
                finalRiskLevel: eng.finalRiskLevel,
                riskBandLabel: eng.riskBandLabel,
                categoryScores: eng.categoryScores,
                scoreReasons: eng.reasons,
                baselineChangeReasons: eng.baselineChangeReasons,
                conditionAdjustmentReasons: eng.conditionAdjustmentReasons,
                trendReasons: eng.trendReasons,
                combinationReasons: eng.combinationReasons,
                explanationText: eng.explanationText,
                suggestedAttentionLevel: eng.suggestedAttentionLevel,
                clinicalWarningScore: eng.clinicalWarningScore,
                clinicalWarningBand: eng.clinicalWarningBand,
                clinicalWarningPartial: eng.clinicalWarningPartial,
                singleRedParameter: eng.singleRedParameter,
                clinicalParameterBreakdown: eng.clinicalParameterBreakdown,
                scoringEngineVersion: 'v2_baseline_plus_clinical_warning',
                createdAt: new Date().toISOString(),
              }}
              defaultOpen={displayRiskLevel !== 'green'}
            />
          )}

          {/* Legacy reasons fallback */}
          {!eng && result.reasons.length > 0 && (
            <Card padding="md">
              <h3 className="font-semibold text-slate-800 mb-3">Contributing Factors</h3>
              <ul className="space-y-2">
                {result.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                      result.riskLevel === 'green' && 'bg-risk-green',
                      result.riskLevel === 'amber' && 'bg-risk-amber',
                      result.riskLevel === 'red' && 'bg-risk-red'
                    )} />
                    {reason}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <p className="text-xs text-center text-slate-400 px-4">
            LYNTO supports observation and escalation decisions. It does not diagnose conditions or
            replace professional clinical judgement.
          </p>

          <Button fullWidth size="lg" onClick={handleDone}>
            Done
          </Button>
        </div>
      )
    }

    // Symptoms step
    if (step.type === 'symptoms') {
      const category = step.category
      return (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              {category.name}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select any that apply, or skip this section
            </p>
          </div>

          <div className="space-y-3">
            {category.symptoms.map((symptom) => (
              <Checkbox
                key={symptom.id}
                label={symptom.label}
                checked={selectedSymptoms.has(symptom.id)}
                onChange={() => handleSymptomToggle(symptom.id)}
              />
            ))}
          </div>
        </div>
      )
    }

    // Single vital step
    if (step.type === 'vital') {
      const vitalName = step.name as keyof Vitals
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800">{step.label}</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter if available, or skip
            </p>
          </div>

          <div className="max-w-xs mx-auto">
            <div className="relative">
              <Input
                type="number"
                value={vitals[vitalName]?.toString() || ''}
                onChange={(e) => handleVitalChange(vitalName, e.target.value)}
                placeholder={step.placeholder}
                className="text-center text-2xl font-semibold py-6"
                inputMode="decimal"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {step.unit}
              </span>
            </div>
          </div>
        </div>
      )
    }

    // Blood pressure step (two fields)
    if (step.type === 'vitals-bp') {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800">Blood Pressure</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter if available, or skip
            </p>
          </div>

          <div className="flex items-center gap-4 max-w-xs mx-auto">
            <div className="flex-1">
              <Input
                type="number"
                value={vitals.systolicBp?.toString() || ''}
                onChange={(e) => handleVitalChange('systolicBp', e.target.value)}
                placeholder="120"
                className="text-center text-xl font-semibold py-4"
                inputMode="numeric"
              />
              <p className="text-xs text-slate-400 text-center mt-1">Systolic</p>
            </div>
            <span className="text-2xl text-slate-300 font-light">/</span>
            <div className="flex-1">
              <Input
                type="number"
                value={vitals.diastolicBp?.toString() || ''}
                onChange={(e) => handleVitalChange('diastolicBp', e.target.value)}
                placeholder="80"
                className="text-center text-xl font-semibold py-4"
                inputMode="numeric"
              />
              <p className="text-xs text-slate-400 text-center mt-1">Diastolic</p>
            </div>
          </div>
        </div>
      )
    }

    // Note step
    if (step.type === 'note') {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800">Short Note</h2>
            <p className="text-sm text-slate-500 mt-1">
              Add any additional observations (optional)
            </p>
          </div>

          <VoiceTextInput
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Client quieter than usual, ate half lunch, mild cough."
            rows={4}
            maxLength={200}
            showCount
          />
        </div>
      )
    }

    // Review step
    if (step.type === 'review') {
      const symptomCount = selectedSymptoms.size
      const vitalCount = Object.values(vitals).filter((v) => v !== undefined).length

      return (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800">Review Entry</h2>
            <p className="text-sm text-slate-500 mt-1">
              Confirm and save your observations
            </p>
          </div>

          <Card padding="md">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Client</span>
                <span className="font-medium text-slate-800">{client.displayName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Symptoms selected</span>
                <span className="font-medium text-slate-800">{symptomCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Vitals recorded</span>
                <span className="font-medium text-slate-800">{vitalCount}</span>
              </div>
              {note && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-sm text-slate-500">Note:</span>
                  <p className="text-sm text-slate-700 mt-1">"{note}"</p>
                </div>
              )}
            </div>
          </Card>

          <Button fullWidth size="lg" onClick={handleSubmit} loading={saving}>
            <Check className="w-5 h-5 mr-2" />
            Save Entry
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <MobileLayout
      header={
        <Header
          title={result ? 'Result' : client.displayName}
          showBack={!result}
        />
      }
      noPadding
    >
      <div className="flex flex-col min-h-full">
        {/* Progress bar - hide on result */}
        {!result && (
          <div className="px-4 pt-4">
            <Progress current={currentStep + 1} total={TOTAL_STEPS} />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 px-4 py-6">{renderStepContent()}</div>

        {/* Navigation buttons - hide on result and review */}
        {!result && step.type !== 'review' && (
          <div className="sticky bottom-0 px-4 py-4 bg-white border-t border-slate-100 pb-safe">
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                {step.type === 'note' ? 'Review' : 'Next'}
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Back button on review step */}
        {!result && step.type === 'review' && (
          <div className="px-4 pb-4 pb-safe">
            <Button variant="ghost" onClick={handleBack} fullWidth>
              <ArrowLeft className="w-5 h-5 mr-1" />
              Go Back
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
