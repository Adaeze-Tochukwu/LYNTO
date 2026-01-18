import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MobileLayout, Header, BottomNav } from '@/components/layout'
import { Card, RiskBadge, Badge } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react'
import type { AlertFilter } from '@/types'

const FILTERS: { value: AlertFilter; label: string }[] = [
  { value: 'unreviewed', label: 'Unreviewed' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'amber', label: 'Amber' },
  { value: 'red', label: 'Red' },
  { value: 'all', label: 'All' },
]

export function AlertsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { agency } = useAuth()
  const { getAlertsByFilter, getClientById, getCarerById, getUnreviewedCount } = useApp()

  const currentFilter = (searchParams.get('filter') as AlertFilter) || 'unreviewed'

  const alerts = useMemo(() => {
    if (!agency) return []
    return getAlertsByFilter(currentFilter, agency.id)
  }, [agency, currentFilter, getAlertsByFilter])

  const unreviewedCount = agency ? getUnreviewedCount(agency.id) : 0

  const handleFilterChange = (filter: AlertFilter) => {
    setSearchParams({ filter })
  }

  return (
    <MobileLayout
      header={<Header title="Alerts" showLogout />}
      footer={<BottomNav />}
      noPadding
    >
      <div className="animate-fade-in">
        {/* Filter Tabs */}
        <div className="px-4 py-3 bg-white border-b border-slate-100">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleFilterChange(value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  currentFilter === value
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {label}
                {value === 'unreviewed' && unreviewedCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {unreviewedCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="p-4 space-y-3">
          {alerts.length === 0 ? (
            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">No alerts found</h3>
              <p className="text-sm text-slate-500">
                {currentFilter === 'unreviewed'
                  ? 'All alerts have been reviewed.'
                  : `No ${currentFilter} alerts to display.`}
              </p>
            </Card>
          ) : (
            alerts.map((alert) => {
              const client = getClientById(alert.clientId)
              const carer = getCarerById(alert.carerId)
              return (
                <Card
                  key={alert.id}
                  padding="md"
                  interactive
                  onClick={() => navigate(`/manager/alerts/${alert.id}`)}
                  className="flex items-center gap-4"
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      alert.riskLevel === 'red' ? 'bg-risk-red-light' : 'bg-risk-amber-light'
                    )}
                  >
                    {alert.isReviewed ? (
                      <CheckCircle
                        className={cn(
                          'w-6 h-6',
                          alert.riskLevel === 'red' ? 'text-risk-red' : 'text-risk-amber'
                        )}
                      />
                    ) : (
                      <AlertTriangle
                        className={cn(
                          'w-6 h-6',
                          alert.riskLevel === 'red' ? 'text-risk-red' : 'text-risk-amber'
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 truncate">
                        {client?.displayName || 'Unknown Client'}
                      </p>
                      <RiskBadge level={alert.riskLevel} size="sm" />
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      Recorded by {carer?.fullName || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-400">
                        {formatDateTime(alert.createdAt)}
                      </p>
                      {alert.isReviewed && (
                        <Badge variant="success" size="sm">
                          Reviewed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                </Card>
              )
            })
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
