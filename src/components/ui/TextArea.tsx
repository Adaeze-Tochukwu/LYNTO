import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  maxLength?: number
  showCount?: boolean
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      maxLength,
      showCount = false,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-white text-slate-800 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all duration-200 resize-none',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            error
              ? 'border-risk-red focus:ring-risk-red'
              : 'border-slate-200 hover:border-slate-300',
            className
          )}
          {...props}
        />
        <div className="flex justify-between items-center mt-1.5">
          <div>
            {hint && !error && (
              <p className="text-sm text-slate-500">{hint}</p>
            )}
            {error && <p className="text-sm text-risk-red">{error}</p>}
          </div>
          {showCount && maxLength && (
            <p
              className={cn(
                'text-sm',
                currentLength >= maxLength ? 'text-risk-red' : 'text-slate-400'
              )}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export { TextArea }
