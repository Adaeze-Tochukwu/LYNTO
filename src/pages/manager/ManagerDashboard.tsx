import { useNavigate } from 'react-router-dom'
import { MobileLayout, Header, BottomNav } from '@/components/layout'
import { Card, Button, RiskBadge } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { formatDateTime } from '@/lib/utils'
import { AlertTriangle, Users, UserCheck, ArrowRight, Bell } from 'lucide-react'

export function ManagerDashboard() {
  const navigate = useNavigate()
  const { agency } = useAuth()
  const { getAlertsByFilter, clients, carers, getClientById, getCarerById } = useApp()

  const unreviewedAlerts = agency ? getAlertsByFilter('unreviewed', agency.id) : []
  const activeClients = clients.filter((c) => c.status === 'active')
  const activeCarers = carers.filter((c) => c.status === 'active')

  return (
    <MobileLayout
      header={<Header title="Dashboard" showLogout />}
      footer={<BottomNav />}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Welcome back
          </h2>
          <p className="text-slate-500 mt-1">
            {agency?.name || 'Your Agency'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            padding="md"
            interactive
            onClick={() => navigate('/manager/alerts?filter=unreviewed')}
            className="relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Unreviewed</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {unreviewedAlerts.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-risk-amber-light flex items-center justify-center">
                <Bell className="w-5 h-5 text-risk-amber" />
              </div>
            </div>
            {unreviewedAlerts.length > 0 && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-risk-red rounded-full animate-pulse" />
            )}
          </Card>

          <Card
            padding="md"
            interactive
            onClick={() => navigate('/manager/clients')}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Clients</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {activeClients.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-500" />
              </div>
            </div>
          </Card>

          <Card
            padding="md"
            interactive
            onClick={() => navigate('/manager/carers')}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Carers</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {activeCarers.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-risk-green" />
              </div>
            </div>
          </Card>

          <Card
            padding="md"
            interactive
            onClick={() => navigate('/manager/alerts')}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">All Alerts</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {agency ? getAlertsByFilter('all', agency.id).length : 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Alerts Section */}
        {unreviewedAlerts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Needs Attention</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/manager/alerts?filter=unreviewed')}
                className="text-primary-500"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {unreviewedAlerts.slice(0, 3).map((alert) => {
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
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        alert.riskLevel === 'red'
                          ? 'bg-risk-red-light'
                          : 'bg-risk-amber-light'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-6 h-6 ${
                          alert.riskLevel === 'red'
                            ? 'text-risk-red'
                            : 'text-risk-amber'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 truncate">
                          {client?.displayName || 'Unknown Client'}
                        </p>
                        <RiskBadge level={alert.riskLevel} size="sm" />
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        By {carer?.fullName || 'Unknown Carer'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDateTime(alert.createdAt)}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {unreviewedAlerts.length === 0 && (
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 rounded-full bg-risk-green-light mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-8 h-8 text-risk-green" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">All caught up!</h3>
            <p className="text-sm text-slate-500">
              No unreviewed alerts at the moment.
            </p>
          </Card>
        )}
      </div>
    </MobileLayout>
  )
}
