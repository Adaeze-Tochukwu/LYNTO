import { useNavigate } from 'react-router-dom'
import { MobileLayout, Header, BottomNav } from '@/components/layout'
import { Card, RiskBadge } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { FileText, ArrowRight, ClipboardList } from 'lucide-react'

export function CarerHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { visitEntries, getClientById } = useApp()

  // Get all entries by this carer, sorted by date
  const carerEntries = visitEntries
    .filter((e) => e.carerId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Group entries by date
  const groupedEntries = carerEntries.reduce((groups, entry) => {
    const date = new Date(entry.createdAt).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, typeof carerEntries>)

  return (
    <MobileLayout
      header={<Header title="History" showLogout />}
      footer={<BottomNav />}
    >
      <div className="space-y-6 animate-fade-in">
        {carerEntries.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">No entries yet</h3>
            <p className="text-sm text-slate-500">
              Your recorded visit entries will appear here.
            </p>
          </Card>
        ) : (
          Object.entries(groupedEntries).map(([date, entries]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-slate-500 mb-3">{date}</h3>
              <div className="space-y-3">
                {entries.map((entry) => {
                  const client = getClientById(entry.clientId)
                  return (
                    <Card
                      key={entry.id}
                      padding="md"
                      interactive
                      onClick={() => navigate(`/carer/entry/${entry.id}`)}
                      className="flex items-center gap-4"
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                          entry.riskLevel === 'green' && 'bg-risk-green-light',
                          entry.riskLevel === 'amber' && 'bg-risk-amber-light',
                          entry.riskLevel === 'red' && 'bg-risk-red-light'
                        )}
                      >
                        <FileText
                          className={cn(
                            'w-6 h-6',
                            entry.riskLevel === 'green' && 'text-risk-green',
                            entry.riskLevel === 'amber' && 'text-risk-amber',
                            entry.riskLevel === 'red' && 'text-risk-red'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800 truncate">
                            {client?.displayName || 'Unknown Client'}
                          </p>
                          <RiskBadge level={entry.riskLevel} size="sm" />
                        </div>
                        <p className="text-sm text-slate-500">
                          Score: {entry.score}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(entry.createdAt).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </MobileLayout>
  )
}
