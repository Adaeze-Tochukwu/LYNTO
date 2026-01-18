import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string | ReactNode
  description?: string
  variant?: 'card' | 'inline'
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, onChange, id, variant = 'card', ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : 'checkbox')

    if (variant === 'inline') {
      return (
        <label
          htmlFor={inputId}
          className={cn(
            'flex items-start gap-3 cursor-pointer group',
            className
          )}
        >
          <div
            className={cn(
              'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 mt-0.5',
              checked
                ? 'bg-primary-500 border-primary-500'
                : 'bg-white border-slate-300 group-hover:border-slate-400'
            )}
          >
            {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            checked={checked}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <div className="flex-1 min-w-0">
            <span className="text-sm text-slate-600">
              {label}
            </span>
            {description && (
              <span className="block text-xs text-slate-400 mt-0.5">
                {description}
              </span>
            )}
          </div>
        </label>
      )
    }

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
          'active:scale-[0.99]',
          checked
            ? 'bg-primary-50 border-primary-500'
            : 'bg-white border-slate-200 hover:border-slate-300',
          className
        )}
      >
        <div
          className={cn(
            'flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200',
            checked
              ? 'bg-primary-500 border-primary-500'
              : 'bg-white border-slate-300'
          )}
        >
          {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </div>
        <input
          type="checkbox"
          id={inputId}
          ref={ref}
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div className="flex-1 min-w-0">
          <span className="block text-base font-medium text-slate-800">
            {label}
          </span>
          {description && (
            <span className="block text-sm text-slate-500 mt-0.5">
              {description}
            </span>
          )}
        </div>
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
