import { useNavigate } from 'react-router-dom'
import { MobileLayout, Header, BottomNav } from '@/components/layout'
import { Card, Button, RiskBadge } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Users, Plus, Clock, Heart, ArrowRight } from 'lucide-react'

export function CarerHome() {
  const navigate = useNavigate()
  const { user, agency } = useAuth()
  const { getClientsForCarer, visitEntries, getClientById } = useApp()

  const assignedClients = user ? getClientsForCarer(user.id) : []

  // Get recent entries by this carer
  const recentEntries = visitEntries
    .filter((e) => e.carerId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  return (
    <MobileLayout
      header={<Header title="Home" showLogout />}
      footer={<BottomNav />}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Hello, {user?.fullName.split(' ')[0]}
          </h2>
          <p className="text-slate-500 mt-1">
            {agency?.name || 'Your Agency'}
          </p>
        </div>

        {/* Quick Action */}
        {assignedClients.length > 0 && (
          <Card
            padding="lg"
            interactive
            onClick={() => navigate('/carer/clients')}
            className="bg-gradient-to-br from-primary-500 to-primary-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Start a visit entry</p>
                <p className="text-lg font-semibold mt-1">Record Observations</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card padding="md" interactive onClick={() => navigate('/carer/clients')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Your Clients</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {assignedClients.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-500" />
              </div>
            </div>
          </Card>

          <Card padding="md" interactive onClick={() => navigate('/carer/history')}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">This Week</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {visitEntries.filter((e) => e.carerId === user?.id).length}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">entries</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Assigned Clients Section */}
        {assignedClients.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">No clients assigned</h3>
            <p className="text-sm text-slate-500">
              Contact your manager to get clients assigned to you.
            </p>
          </Card>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Your Clients</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/carer/clients')}
                className="text-primary-500"
              >
                View all
              </Button>
            </div>

            <div className="space-y-3">
              {assignedClients.slice(0, 3).map((client) => (
                <Card
                  key={client.id}
                  padding="md"
                  interactive
                  onClick={() => navigate(`/carer/visit/${client.id}`)}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800">{client.displayName}</p>
                    {client.internalReference && (
                      <p className="text-sm text-slate-500">
                        Ref: {client.internalReference}
                      </p>
                    )}
                  </div>
                  <Button variant="primary" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Visit
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Recent Entries</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/carer/history')}
                className="text-primary-500"
              >
                View all
              </Button>
            </div>

            <div className="space-y-3">
              {recentEntries.map((entry) => {
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
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        entry.riskLevel === 'green' && 'bg-risk-green-light',
                        entry.riskLevel === 'amber' && 'bg-risk-amber-light',
                        entry.riskLevel === 'red' && 'bg-risk-red-light'
                      )}
                    >
                      <span
                        className={cn(
                          'w-3 h-3 rounded-full',
                          entry.riskLevel === 'green' && 'bg-risk-green',
                          entry.riskLevel === 'amber' && 'bg-risk-amber',
                          entry.riskLevel === 'red' && 'bg-risk-red'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 truncate">
                          {client?.displayName || 'Unknown'}
                        </p>
                        <RiskBadge level={entry.riskLevel} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
