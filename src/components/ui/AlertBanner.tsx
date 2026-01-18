import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { RiskLevel } from '@/types'
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

export interface AlertBannerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  icon?: boolean
}

const AlertBanner = ({
  className,
  variant = 'info',
  title,
  icon = true,
  children,
  ...props
}: AlertBannerProps) => {
  const variants = {
    info: 'bg-primary-50 border-primary-200 text-primary-800',
    success: 'bg-risk-green-light border-green-200 text-green-800',
    warning: 'bg-risk-amber-light border-amber-200 text-amber-800',
    danger: 'bg-risk-red-light border-red-200 text-red-800',
  }

  const icons = {
    info: AlertCircle,
    success: CheckCircle,
    warning: AlertTriangle,
    danger: AlertCircle,
  }

  const Icon = icons[variant]

  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        variants[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex gap-3">
        {icon && (
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}

// Risk level specific alert with predefined messages
export interface RiskAlertProps extends Omit<AlertBannerProps, 'variant' | 'title'> {
  level: RiskLevel
  score?: number
}

const RiskAlert = ({ level, score, className, ...props }: RiskAlertProps) => {
  const config: Record<RiskLevel, { variant: AlertBannerProps['variant']; title: string; message: string }> = {
    green: {
      variant: 'success',
      title: 'GREEN',
      message: 'No concerning signs recorded. Continue usual monitoring.',
    },
    amber: {
      variant: 'warning',
      title: 'AMBER',
      message: 'Some concerning signs recorded. Please follow your agency\'s observation and monitoring policy and inform your manager if you are worried.',
    },
    red: {
      variant: 'danger',
      title: 'RED',
      message: 'Concerning signs recorded. This is decision support only. Please follow your agency\'s escalation policy now and inform your manager / on-call lead immediately.',
    },
  }

  const { variant, title, message } = config[level]

  return (
    <AlertBanner
      variant={variant}
      title={score !== undefined ? `${title} (Score: ${score})` : title}
      className={className}
      {...props}
    >
      {message}
    </AlertBanner>
  )
}

export { AlertBanner, RiskAlert }
