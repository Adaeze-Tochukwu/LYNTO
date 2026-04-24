import { cn } from '@/lib/utils'
import { Card } from './Card'
import { Stethoscope } from 'lucide-react'
import type { ClinicalParameterBreakdown } from '@/types'

interface Props {
  score: number
  band: string
  partial: boolean
  singleRedParameter: boolean
  parameterBreakdown?: ClinicalParameterBreakdown
  className?: string
  compact?: boolean
}

const BAND_STYLES: Record<string, string> = {
  'Normal': 'bg-risk-green-light text-green-800 border-green-200',
  'Low Concern': 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'Medium Concern': 'bg-risk-amber-light text-amber-800 border-amber-200',
  'High Concern': 'bg-risk-red-light text-risk-red border-red-200',
}

const PARAM_LABELS: Record<keyof ClinicalParameterBreakdown, string> = {
  respiratoryRate: 'Resp. Rate',
  oxygenSaturation: 'O2 Sat',
  temperature: 'Temp',
  systolicBp: 'Systolic BP',
  pulse: 'Pulse',
  confusion: 'Confusion',
}

const POINT_COLORS: Record<number, string> = {
  0: 'bg-risk-green text-white',
  1: 'bg-yellow-400 text-white',
  2: 'bg-risk-amber text-white',
  3: 'bg-risk-red text-white',
}

export function ClinicalWarningCard({
  score,
  band,
  partial,
  singleRedParameter,
  parameterBreakdown,
  className,
  compact = false,
}: Props) {
  const bandStyle = BAND_STYLES[band] || 'bg-slate-100 text-slate-700 border-slate-200'

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Stethoscope className="w-4 h-4 text-slate-500" />
        <div>
          <p className="text-xs text-slate-500">Clinical Warning Score™</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{score}</span>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full border font-medium',
                bandStyle
              )}
            >
              {band}
            </span>
            {partial && (
              <span className="text-xs text-slate-400 italic">Partial data</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card padding="md" className={cn('border', bandStyle.split(' ')[2], className)}>
      <div className="flex items-center gap-2 mb-3">
        <Stethoscope className="w-5 h-5 text-slate-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 text-sm">LYNTO Clinical Warning Score™</h3>
          <p className="text-xs text-slate-400">Inspired by hospital early warning scoring principles</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl font-bold text-slate-800">{score}</div>
        <div>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-semibold border',
              bandStyle
            )}
          >
            {band}
          </span>
          {partial && (
            <p className="text-xs text-slate-400 mt-1 italic">Calculated from partial observations</p>
          )}
          {singleRedParameter && (
            <p className="text-xs text-risk-red mt-1 font-medium">Single high-concern parameter detected</p>
          )}
        </div>
      </div>

      {/* Parameter breakdown */}
      {parameterBreakdown && Object.keys(parameterBreakdown).length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2">Observed parameters</p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(parameterBreakdown) as [keyof ClinicalParameterBreakdown, number][]).map(
              ([key, pts]) => (
                <div
                  key={key}
                  className="flex flex-col items-center bg-slate-50 rounded-xl p-2"
                >
                  <p className="text-xs text-slate-500 text-center leading-tight">
                    {PARAM_LABELS[key]}
                  </p>
                  <span
                    className={cn(
                      'mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      POINT_COLORS[pts] || 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {pts}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-3 leading-relaxed">
        This score supports communication and escalation decisions. It does not diagnose illness or
        replace clinical judgement.
      </p>
    </Card>
  )
}
