import { cn } from '@/lib/utils'

export interface ProgressProps {
  current: number
  total: number
  className?: string
}

const Progress = ({ current, total, className }: ProgressProps) => {
  const percentage = Math.min((current / total) * 100, 100)

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-600">
          Step {current} of {total}
        </span>
        <span className="text-sm text-slate-400">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  className?: string
}

const StepIndicator = ({ steps, currentStep, className }: StepIndicatorProps) => {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {steps.map((_, index) => (
        <div
          key={index}
          className={cn(
            'w-2 h-2 rounded-full transition-all duration-200',
            index < currentStep
              ? 'bg-primary-500'
              : index === currentStep
              ? 'bg-primary-400 w-6'
              : 'bg-slate-200'
          )}
        />
      ))}
    </div>
  )
}

export { Progress, StepIndicator }
