import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card } from './Card'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import type { ScoreBreakdown } from '@/types'

interface Props {
  breakdown: ScoreBreakdown
  className?: string
  defaultOpen?: boolean
}

const ATTENTION_STYLES: Record<string, string> = {
  'Monitor': 'bg-risk-green-light text-green-800',
  'Review today': 'bg-risk-amber-light text-amber-800',
  'Consider GP / community nurse contact': 'bg-orange-100 text-orange-800',
  'Urgent escalation': 'bg-risk-red-light text-risk-red',
}

export function WhyThisScore({ breakdown, className, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  const allReasons = [
    ...breakdown.baselineChangeReasons,
    ...breakdown.conditionAdjustmentReasons,
    ...breakdown.trendReasons,
    ...breakdown.combinationReasons,
  ]

  const attentionLevel = breakdown.suggestedAttentionLevel || 'Monitor'
  const attentionStyle = ATTENTION_STYLES[attentionLevel] || 'bg-slate-100 text-slate-700'

  return (
    <Card padding="md" className={className}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary-500" />
          <span className="font-semibold text-slate-800">Why this score?</span>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* Suggested attention level */}
          <div className={cn('rounded-xl px-4 py-3', attentionStyle)}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-0.5">
              Suggested attention
            </p>
            <p className="font-semibold">{attentionLevel}</p>
          </div>

          {/* Explanation text */}
          {breakdown.explanationText && (
            <p className="text-sm text-slate-700 leading-relaxed">
              {breakdown.explanationText.replace(
                'LYNTO supports observation and escalation decisions. It does not diagnose conditions or replace professional clinical judgement.',
                ''
              ).trim()}
            </p>
          )}

          {/* Key reasons */}
          {allReasons.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Key contributing factors</p>
              <ul className="space-y-2">
                {allReasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Score sources */}
          <div className="text-xs text-slate-500 space-y-1">
            {breakdown.baselineChangeScore > 0 && (
              <p>+{breakdown.baselineChangeScore} pts from baseline comparison</p>
            )}
            {breakdown.conditionAdjustmentScore > 0 && (
              <p>+{breakdown.conditionAdjustmentScore} pts from known conditions</p>
            )}
            {breakdown.trendScore > 0 && (
              <p>+{breakdown.trendScore} pts from recent trend analysis</p>
            )}
            {breakdown.highRiskCombinationScore > 0 && (
              <p>+{breakdown.highRiskCombinationScore} pts from high-risk combinations</p>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              LYNTO supports observation and escalation decisions. It does not diagnose conditions or
              replace professional clinical judgement.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
