import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout, Header, BottomNav } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { Search, Heart, Plus, Users } from 'lucide-react'

export function CarerClientsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getClientsForCarer } = useApp()
  const [searchQuery, setSearchQuery] = useState('')

  const assignedClients = user ? getClientsForCarer(user.id) : []

  const filteredClients = assignedClients.filter((client) =>
    client.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.internalReference?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <MobileLayout
      header={<Header title="My Clients" showLogout />}
      footer={<BottomNav />}
      noPadding
    >
      <div className="animate-fade-in">
        {/* Search */}
        <div className="px-4 py-3 bg-white border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Clients List */}
        <div className="p-4 space-y-3">
          {assignedClients.length === 0 ? (
            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">
                No clients assigned
              </h3>
              <p className="text-sm text-slate-500">
                Contact your manager to get clients assigned to you.
              </p>
            </Card>
          ) : filteredClients.length === 0 ? (
            <Card padding="lg" className="text-center">
              <p className="text-slate-500">No clients match your search.</p>
            </Card>
          ) : (
            filteredClients.map((client) => (
              <Card
                key={client.id}
                padding="lg"
                className="flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-7 h-7 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-lg">
                    {client.displayName}
                  </p>
                  {client.internalReference && (
                    <p className="text-sm text-slate-500">
                      Ref: {client.internalReference}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => navigate(`/carer/visit/${client.id}`)}
                  className="flex-shrink-0"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  Visit
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
