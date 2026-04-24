import { cn } from '@/lib/utils'
import { Card } from './Card'
import type { ScoreBreakdown, CategoryScores } from '@/types'
import { BarChart2 } from 'lucide-react'

interface Props {
  breakdown: ScoreBreakdown
  className?: string
}

const CATEGORY_LABELS: Record<keyof CategoryScores, string> = {
  generalCondition: 'General Condition',
  nutritionHydration: 'Nutrition & Hydration',
  mobilityFalls: 'Mobility & Falls',
  breathingCirculation: 'Breathing & Circulation',
  painDiscomfort: 'Pain & Discomfort',
  infection: 'Infection Signs',
  toiletingContinence: 'Toileting & Continence',
  mentalWellbeing: 'Mental Wellbeing',
  vitalSigns: 'Vital Signs',
}

function ScoreBar({ value, max = 35, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5">
      <div
        className={cn('h-1.5 rounded-full transition-all duration-500', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function scoreColor(score: number): string {
  if (score >= 20) return 'bg-risk-red'
  if (score >= 10) return 'bg-risk-amber'
  return 'bg-risk-green'
}

export function ScoreBreakdownCard({ breakdown, className }: Props) {
  const components = [
    { label: 'Base symptom score', value: breakdown.baseSymptomScore, max: 35 },
    { label: 'Vital signs score', value: breakdown.vitalSignScore, max: 25 },
    { label: 'Baseline change', value: breakdown.baselineChangeScore, max: 20 },
    { label: 'Condition adjustment', value: breakdown.conditionAdjustmentScore, max: 20 },
    { label: 'Trend detection', value: breakdown.trendScore, max: 10 },
    { label: 'High-risk combinations', value: breakdown.highRiskCombinationScore, max: 5 },
  ]

  const categoryEntries = Object.entries(breakdown.categoryScores) as [keyof CategoryScores, number][]
  const activeCategories = categoryEntries.filter(([, v]) => v > 0)

  return (
    <Card padding="md" className={className}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-800">Score Breakdown</h3>
      </div>

      {/* Final score display */}
      <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-xl">
        <div>
          <p className="text-xs text-slate-500">LYNTO Health Risk Score™</p>
          <p className="text-2xl font-bold text-slate-800">
            {breakdown.finalHealthRiskScore}
            <span className="text-sm font-normal text-slate-500">/100</span>
          </p>
        </div>
        <div
          className={cn(
            'px-3 py-1.5 rounded-xl text-sm font-semibold',
            breakdown.finalRiskLevel === 'red' && 'bg-risk-red-light text-risk-red',
            breakdown.finalRiskLevel === 'amber' && 'bg-risk-amber-light text-amber-800',
            breakdown.finalRiskLevel === 'green' && 'bg-risk-green-light text-green-800'
          )}
        >
          {breakdown.riskBandLabel.split('/')[0].trim()}
        </div>
      </div>

      {/* Component breakdown */}
      <div className="space-y-3 mb-4">
        {components.map(({ label, value, max }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-xs font-medium text-slate-700">{value}</span>
            </div>
            <ScoreBar value={value} max={max} color={scoreColor(value)} />
          </div>
        ))}
      </div>

      {/* Category scores */}
      {activeCategories.length > 0 && (
        <>
          <p className="text-xs font-medium text-slate-600 mb-2">Category risk areas</p>
          <div className="space-y-2">
            {activeCategories.map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{CATEGORY_LABELS[key]}</span>
                  <span className="text-xs font-medium text-slate-700">{value}</span>
                </div>
                <ScoreBar value={value} max={35} color={scoreColor(value)} />
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-slate-400 mt-4 text-center">
        Engine: {breakdown.scoringEngineVersion}
      </p>
    </Card>
  )
}
