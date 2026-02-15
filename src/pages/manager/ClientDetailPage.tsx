import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { MobileLayout, Header } from '@/components/layout'
import { Card, Button, Select, TextArea, Badge, Modal, RiskBadge } from '@/components/ui'
import { useApp } from '@/context/AppContext'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  User,
  UserPlus,
  UserMinus,
  AlertTriangle,
  FileText,
  Settings,
} from 'lucide-react'
import type { ClientDeactivationReason } from '@/types'

const DEACTIVATION_REASONS = [
  { value: 'moved_to_another_provider', label: 'Moved to another provider' },
  { value: 'deceased', label: 'Deceased' },
  { value: 'no_longer_receiving_service', label: 'No longer receiving service' },
  { value: 'other', label: 'Other' },
]

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const {
    getClientById,
    carers,
    getVisitEntriesForClient,
    assignCarerToClient,
    unassignCarerFromClient,
    updateClientStatus,
  } = useApp()

  const client = id ? getClientById(id) : undefined
  const visitEntries = id ? getVisitEntriesForClient(id) : []

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedCarerId, setSelectedCarerId] = useState('')
  const [deactivationReason, setDeactivationReason] = useState('')
  const [deactivationNote, setDeactivationNote] = useState('')

  if (!client) {
    return (
      <MobileLayout header={<Header title="Client" showBack />}>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Client not found</p>
        </div>
      </MobileLayout>
    )
  }

  const assignedCarers = carers.filter((c) =>
    c.assignedClientIds.includes(client.id)
  )
  const availableCarers = carers.filter(
    (c) => c.status === 'active' && !c.assignedClientIds.includes(client.id)
  )

  const handleAssign = async () => {
    if (!selectedCarerId) return
    try {
      await assignCarerToClient(client.id, selectedCarerId)
      setSelectedCarerId('')
      setShowAssignModal(false)
    } catch (err) {
      console.error('Failed to assign carer:', err)
    }
  }

  const handleUnassign = async (carerId: string) => {
    try {
      await unassignCarerFromClient(client.id, carerId)
    } catch (err) {
      console.error('Failed to unassign carer:', err)
    }
  }

  const handleStatusChange = async () => {
    try {
      if (client.status === 'active') {
        await updateClientStatus(
          client.id,
          'inactive',
          deactivationReason as ClientDeactivationReason,
          deactivationNote
        )
      } else {
        await updateClientStatus(client.id, 'active')
      }
      setShowStatusModal(false)
      setDeactivationReason('')
      setDeactivationNote('')
    } catch (err) {
      console.error('Failed to update client status:', err)
    }
  }

  return (
    <MobileLayout header={<Header title={client.displayName} showBack />}>
      <div className="space-y-4 pb-6 animate-fade-in">
        {/* Client Info Card */}
        <Card padding="md">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                client.status === 'active' ? 'bg-primary-50' : 'bg-slate-100'
              )}
            >
              <User
                className={cn(
                  'w-7 h-7',
                  client.status === 'active' ? 'text-primary-500' : 'text-slate-400'
                )}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-800">
                  {client.displayName}
                </h2>
                <Badge
                  variant={client.status === 'active' ? 'success' : 'default'}
                  size="sm"
                >
                  {client.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {client.internalReference && (
                <p className="text-sm text-slate-500">
                  Ref: {client.internalReference}
                </p>
              )}
            </div>
          </div>

          {client.status === 'inactive' && client.deactivationReason && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Deactivation Reason</p>
              <p className="text-sm text-slate-700 capitalize">
                {client.deactivationReason.replace(/_/g, ' ')}
              </p>
              {client.deactivationNote && (
                <p className="text-sm text-slate-600 mt-1">
                  {client.deactivationNote}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Assigned Carers */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Assigned Carers</h3>
            {client.status === 'active' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAssignModal(true)}
                disabled={availableCarers.length === 0}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Assign
              </Button>
            )}
          </div>

          {assignedCarers.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No carers assigned yet
            </p>
          ) : (
            <div className="space-y-2">
              {assignedCarers.map((carer) => (
                <div
                  key={carer.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="font-medium text-slate-700">
                      {carer.fullName}
                    </span>
                  </div>
                  {client.status === 'active' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUnassign(carer.id)}
                      className="text-slate-400 hover:text-risk-red"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Entries */}
        <Card padding="md">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Entries</h3>

          {visitEntries.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No visit entries recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {visitEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      entry.riskLevel === 'green' && 'bg-risk-green-light',
                      entry.riskLevel === 'amber' && 'bg-risk-amber-light',
                      entry.riskLevel === 'red' && 'bg-risk-red-light'
                    )}
                  >
                    {entry.riskLevel === 'green' ? (
                      <FileText className="w-4 h-4 text-risk-green" />
                    ) : (
                      <AlertTriangle
                        className={cn(
                          'w-4 h-4',
                          entry.riskLevel === 'amber'
                            ? 'text-risk-amber'
                            : 'text-risk-red'
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <RiskBadge level={entry.riskLevel} size="sm" />
                      <span className="text-sm text-slate-500">
                        Score: {entry.score}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Status Action */}
        <Button
          variant={client.status === 'active' ? 'outline' : 'primary'}
          fullWidth
          onClick={() => setShowStatusModal(true)}
        >
          <Settings className="w-5 h-5 mr-2" />
          {client.status === 'active' ? 'Deactivate Client' : 'Reactivate Client'}
        </Button>
      </div>

      {/* Assign Carer Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Carer"
      >
        <div className="space-y-4">
          <Select
            label="Select Carer"
            options={availableCarers.map((c) => ({
              value: c.id,
              label: c.fullName,
            }))}
            value={selectedCarerId}
            onChange={(e) => setSelectedCarerId(e.target.value)}
            placeholder="Choose a carer..."
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={handleAssign} disabled={!selectedCarerId}>
              Assign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={
          client.status === 'active' ? 'Deactivate Client' : 'Reactivate Client'
        }
      >
        <div className="space-y-4">
          {client.status === 'active' ? (
            <>
              <p className="text-sm text-slate-600">
                Deactivating this client will remove them from carers' client
                lists. All historical data will be preserved.
              </p>
              <Select
                label="Reason"
                options={DEACTIVATION_REASONS}
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder="Select a reason..."
              />
              <TextArea
                label="Additional Notes (optional)"
                value={deactivationNote}
                onChange={(e) => setDeactivationNote(e.target.value)}
                placeholder="Any additional details..."
                rows={2}
              />
            </>
          ) : (
            <p className="text-sm text-slate-600">
              Reactivating this client will make them available for carers to
              record visit entries again.
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={client.status === 'active' ? 'danger' : 'primary'}
              fullWidth
              onClick={handleStatusChange}
              disabled={client.status === 'active' && !deactivationReason}
            >
              {client.status === 'active' ? 'Deactivate' : 'Reactivate'}
            </Button>
          </div>
        </div>
      </Modal>
    </MobileLayout>
  )
}
