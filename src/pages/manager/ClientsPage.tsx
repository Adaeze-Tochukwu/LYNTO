import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout, Header, BottomNav } from '@/components/layout'
import { Card, Button, Input, Badge, Modal } from '@/components/ui'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { Plus, Search, User, ArrowRight, UserX } from 'lucide-react'

export function ClientsPage() {
  const navigate = useNavigate()
  const { clients, addClient } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientRef, setNewClientRef] = useState('')

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.internalReference?.toLowerCase().includes(searchQuery.toLowerCase())

    if (showInactive) return matchesSearch
    return matchesSearch && client.status === 'active'
  })

  const activeCount = clients.filter((c) => c.status === 'active').length
  const inactiveCount = clients.filter((c) => c.status === 'inactive').length

  const handleAddClient = () => {
    if (!newClientName.trim()) return
    addClient(newClientName.trim(), newClientRef.trim() || undefined)
    setNewClientName('')
    setNewClientRef('')
    setShowAddModal(false)
  }

  return (
    <MobileLayout
      header={
        <Header
          title="Clients"
          showLogout
          rightAction={
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          }
        />
      }
      footer={<BottomNav />}
      noPadding
    >
      <div className="animate-fade-in">
        {/* Search & Filter */}
        <div className="px-4 py-3 bg-white border-b border-slate-100 space-y-3">
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

          <div className="flex gap-2">
            <button
              onClick={() => setShowInactive(false)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                !showInactive
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setShowInactive(true)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                showInactive
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              All ({activeCount + inactiveCount})
            </button>
          </div>
        </div>

        {/* Clients List */}
        <div className="p-4 space-y-3">
          {filteredClients.length === 0 ? (
            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">No clients found</h3>
              <p className="text-sm text-slate-500">
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Add your first client to get started.'}
              </p>
            </Card>
          ) : (
            filteredClients.map((client) => (
              <Card
                key={client.id}
                padding="md"
                interactive
                onClick={() => navigate(`/manager/clients/${client.id}`)}
                className="flex items-center gap-4"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    client.status === 'active' ? 'bg-primary-50' : 'bg-slate-100'
                  )}
                >
                  {client.status === 'active' ? (
                    <User className="w-6 h-6 text-primary-500" />
                  ) : (
                    <UserX className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800 truncate">
                      {client.displayName}
                    </p>
                    {client.status === 'inactive' && (
                      <Badge variant="default" size="sm">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {client.internalReference && (
                    <p className="text-sm text-slate-500">
                      Ref: {client.internalReference}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Client"
      >
        <div className="space-y-4">
          <Input
            label="Client Display Name"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder="e.g., Margaret H."
          />
          <Input
            label="Internal Reference (optional)"
            value={newClientRef}
            onChange={(e) => setNewClientRef(e.target.value)}
            placeholder="e.g., MH-001"
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={handleAddClient} disabled={!newClientName.trim()}>
              Add Client
            </Button>
          </div>
        </div>
      </Modal>
    </MobileLayout>
  )
}
