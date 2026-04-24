import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MobileLayout, Header } from '@/components/layout'
import {
  Card,
  Button,
  Select,
  TextArea,
  Badge,
  Modal,
  RiskBadge,
  Input,
} from '@/components/ui'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { formatDateTime, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  User,
  UserPlus,
  UserMinus,
  AlertTriangle,
  FileText,
  Settings,
  Plus,
  ChevronDown,
  ChevronUp,
  ClipboardList,
} from 'lucide-react'
import type { ClientDeactivationReason, ClientBaseline, ClientCondition } from '@/types'

// ─── Option lists ─────────────────────────────────────────────────────────────

const DEACTIVATION_REASONS = [
  { value: 'moved_to_another_provider', label: 'Moved to another provider' },
  { value: 'deceased', label: 'Deceased' },
  { value: 'no_longer_receiving_service', label: 'No longer receiving service' },
  { value: 'other', label: 'Other' },
]

const MOBILITY_OPTIONS = [
  { value: 'independent', label: 'Independent' },
  { value: 'minimal_assistance', label: 'Minimal assistance' },
  { value: 'moderate_assistance', label: 'Moderate assistance' },
  { value: 'full_assistance', label: 'Full assistance' },
  { value: 'bedbound', label: 'Bedbound' },
]

const APPETITE_OPTIONS = [
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'very_poor', label: 'Very poor' },
]

const FLUID_OPTIONS = [
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
]

const COGNITION_OPTIONS = [
  { value: 'alert_and_oriented', label: 'Alert and oriented' },
  { value: 'mild_confusion', label: 'Mild confusion (occasional)' },
  { value: 'moderate_confusion', label: 'Moderate confusion (regular)' },
  { value: 'severe_confusion', label: 'Severe confusion' },
]

const MOOD_OPTIONS = [
  { value: 'stable_positive', label: 'Stable / Positive' },
  { value: 'variable', label: 'Variable' },
  { value: 'frequently_low_mood', label: 'Frequently low mood' },
  { value: 'agitated', label: 'Often agitated' },
  { value: 'withdrawn', label: 'Often withdrawn' },
]

const COMMUNICATION_OPTIONS = [
  { value: 'normal', label: 'Normal communication' },
  { value: 'some_difficulty', label: 'Some difficulty' },
  { value: 'significant_difficulty', label: 'Significant difficulty' },
  { value: 'non_verbal', label: 'Non-verbal' },
]

const CONTINENCE_OPTIONS = [
  { value: 'fully_continent', label: 'Fully continent' },
  { value: 'occasional_incontinence', label: 'Occasional incontinence' },
  { value: 'regular_incontinence', label: 'Regular incontinence' },
  { value: 'catheter_in_situ', label: 'Catheter in situ' },
]

const GAIT_OPTIONS = [
  { value: 'steady_unaided', label: 'Steady unaided' },
  { value: 'steady_with_aid', label: 'Steady with walking aid' },
  { value: 'mildly_unsteady', label: 'Mildly unsteady' },
  { value: 'significantly_unsteady', label: 'Significantly unsteady' },
  { value: 'non_ambulant', label: 'Non-ambulant' },
]

const FALLS_HISTORY_OPTIONS = [
  { value: 'none', label: 'No history of falls' },
  { value: 'one_in_last_year', label: 'One fall in last year' },
  { value: 'recurrent', label: 'Recurrent falls' },
  { value: 'unknown', label: 'Unknown' },
]

const MEDICATION_OPTIONS = [
  { value: 'independent', label: 'Independent' },
  { value: 'prompting_only', label: 'Prompting only' },
  { value: 'full_assistance', label: 'Full assistance' },
  { value: 'unknown', label: 'Unknown' },
]

const AGE_GROUP_OPTIONS = [
  { value: '18-45', label: '18–45' },
  { value: '46-65', label: '46–65' },
  { value: '66-75', label: '66–75' },
  { value: '76-85', label: '76–85' },
  { value: '86+', label: '86+' },
]

const CONDITION_LIST = [
  'Dementia', 'Diabetes', 'COPD', 'Stroke history', 'Heart disease',
  'Kidney disease', "Parkinson's disease", 'Epilepsy', 'Recurrent UTI',
  'Falls risk', 'Frailty', 'Pressure sore risk', 'Swallowing difficulty',
  'Catheter use', 'Mental health condition', 'Palliative/end-of-life care', 'Other',
]

const SEVERITY_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
]

type Tab = 'overview' | 'baseline' | 'conditions' | 'assignments' | 'history'

// ─── Baseline form initial state ──────────────────────────────────────────────

const EMPTY_BASELINE: Partial<ClientBaseline> = {
  ageGroup: '',
  usualMobilityLevel: '',
  usualAppetite: '',
  usualFluidIntake: '',
  usualCommunicationLevel: '',
  usualCognitionLevel: '',
  usualMoodBehaviour: '',
  usualContinencePattern: '',
  usualGaitPattern: '',
  usualOxygenSaturation: '',
  usualBloodPressureRange: '',
  usualPulseRange: '',
  fallsHistory: '',
  medicationSupportNeeds: '',
  swallowingDifficulty: false,
  catheterUse: false,
  pressureSoreRisk: false,
  palliativeOrEndOfLifeStatus: false,
  baselineNotes: '',
}

function labelFor(options: { value: string; label: string }[], value?: string) {
  return options.find((o) => o.value === value)?.label || value || '—'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  useAuth()
  const {
    getClientById,
    carers,
    getVisitEntriesForClient,
    assignCarerToClient,
    unassignCarerFromClient,
    updateClientStatus,
    fetchClientBaseline,
    saveClientBaseline,
    fetchClientConditions,
    addClientCondition,
    updateClientCondition,
  } = useApp()

  const client = id ? getClientById(id) : undefined
  const visitEntries = id ? getVisitEntriesForClient(id) : []

  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // Baseline state
  const [currentBaseline, setCurrentBaseline] = useState<ClientBaseline | null>(null)
  const [baselineHistory, setBaselineHistory] = useState<ClientBaseline[]>([])
  const [showBaselineForm, setShowBaselineForm] = useState(false)
  const [baselineForm, setBaselineForm] = useState<Partial<ClientBaseline>>(EMPTY_BASELINE)
  const [updateReason, setUpdateReason] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [savingBaseline, setSavingBaseline] = useState(false)

  // Conditions state
  const [conditions, setConditions] = useState<ClientCondition[]>([])
  const [showAddCondition, setShowAddCondition] = useState(false)
  const [newConditionName, setNewConditionName] = useState('')
  const [newConditionSeverity, setNewConditionSeverity] = useState('unknown')
  const [newConditionNotes, setNewConditionNotes] = useState('')
  const [savingCondition, setSavingCondition] = useState(false)

  // Assignments state
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCarerId, setSelectedCarerId] = useState('')

  // Status modal
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [deactivationReason, setDeactivationReason] = useState('')
  const [deactivationNote, setDeactivationNote] = useState('')

  // Load baseline + conditions when their tabs are first opened
  useEffect(() => {
    if (!id) return
    if (activeTab === 'baseline') {
      fetchClientBaseline(id).then(({ current, history }) => {
        setCurrentBaseline(current)
        setBaselineHistory(history)
        if (current) setBaselineForm({ ...current })
      })
    }
    if (activeTab === 'conditions') {
      fetchClientConditions(id).then(setConditions)
    }
  }, [activeTab, id])

  if (!client) {
    return (
      <MobileLayout header={<Header title="Client" showBack />}>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Client not found</p>
        </div>
      </MobileLayout>
    )
  }

  const assignedCarers = carers.filter((c) => c.assignedClientIds.includes(client.id))
  const availableCarers = carers.filter(
    (c) => c.status === 'active' && !c.assignedClientIds.includes(client.id)
  )

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleAssign = async () => {
    if (!selectedCarerId) return
    await assignCarerToClient(client.id, selectedCarerId)
    setSelectedCarerId('')
    setShowAssignModal(false)
  }

  const handleUnassign = async (carerId: string) => {
    await unassignCarerFromClient(client.id, carerId)
  }

  const handleStatusChange = async () => {
    if (client.status === 'active') {
      await updateClientStatus(client.id, 'inactive', deactivationReason as ClientDeactivationReason, deactivationNote)
    } else {
      await updateClientStatus(client.id, 'active')
    }
    setShowStatusModal(false)
    setDeactivationReason('')
    setDeactivationNote('')
  }

  const handleSaveBaseline = async () => {
    if (!id) return
    setSavingBaseline(true)
    try {
      const saved = await saveClientBaseline(id, baselineForm, updateReason || undefined)
      setCurrentBaseline(saved)
      setBaselineHistory((prev) => prev.map((b) => ({ ...b, isCurrent: false })))
      setShowBaselineForm(false)
      setUpdateReason('')
    } finally {
      setSavingBaseline(false)
    }
  }

  const handleAddCondition = async () => {
    if (!id || !newConditionName) return
    setSavingCondition(true)
    try {
      const c = await addClientCondition(id, {
        conditionName: newConditionName,
        severity: newConditionSeverity as ClientCondition['severity'],
        notes: newConditionNotes || undefined,
        status: 'active',
      })
      setConditions((prev) => [c, ...prev])
      setNewConditionName('')
      setNewConditionSeverity('unknown')
      setNewConditionNotes('')
      setShowAddCondition(false)
    } finally {
      setSavingCondition(false)
    }
  }

  const handleDeactivateCondition = async (conditionId: string) => {
    await updateClientCondition(conditionId, { status: 'inactive' })
    setConditions((prev) =>
      prev.map((c) => (c.id === conditionId ? { ...c, status: 'inactive' } : c))
    )
  }

  // ─── Tab content ─────────────────────────────────────────────────────────────

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'baseline', label: 'Baseline' },
    { id: 'conditions', label: 'Conditions' },
    { id: 'assignments', label: 'Carers' },
    { id: 'history', label: 'History' },
  ]

  return (
    <MobileLayout header={<Header title={client.displayName} showBack />}>
      <div className="pb-6 animate-fade-in">
        {/* Tab navigation */}
        <div className="flex overflow-x-auto gap-1 mb-4 pb-1 -mx-4 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
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
                    <h2 className="text-lg font-semibold text-slate-800">{client.displayName}</h2>
                    <Badge variant={client.status === 'active' ? 'success' : 'default'} size="sm">
                      {client.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {client.internalReference && (
                    <p className="text-sm text-slate-500">Ref: {client.internalReference}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Client since {formatDate(client.createdAt)}
                  </p>
                </div>
              </div>

              {client.status === 'inactive' && client.deactivationReason && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Deactivation Reason</p>
                  <p className="text-sm text-slate-700 capitalize">
                    {client.deactivationReason.replace(/_/g, ' ')}
                  </p>
                  {client.deactivationNote && (
                    <p className="text-sm text-slate-600 mt-1">{client.deactivationNote}</p>
                  )}
                </div>
              )}
            </Card>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card padding="sm" className="text-center">
                <p className="text-xl font-bold text-slate-800">{visitEntries.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Visits</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-xl font-bold text-slate-800">{assignedCarers.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Carers</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-xl font-bold text-slate-800">
                  {currentBaseline ? '✓' : '—'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Baseline</p>
              </Card>
            </div>

            <Button
              variant={client.status === 'active' ? 'outline' : 'primary'}
              fullWidth
              onClick={() => setShowStatusModal(true)}
            >
              <Settings className="w-5 h-5 mr-2" />
              {client.status === 'active' ? 'Deactivate Client' : 'Reactivate Client'}
            </Button>
          </div>
        )}

        {/* ── Baseline Tab ── */}
        {activeTab === 'baseline' && (
          <div className="space-y-4">
            {!currentBaseline && !showBaselineForm && (
              <Card padding="md" className="text-center py-8">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">No baseline profile recorded yet.</p>
                <Button onClick={() => setShowBaselineForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Set Up Baseline
                </Button>
              </Card>
            )}

            {currentBaseline && !showBaselineForm && (
              <>
                <Card padding="md">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800">Current Baseline</h3>
                    <Button size="sm" variant="outline" onClick={() => setShowBaselineForm(true)}>
                      Update
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    {currentBaseline.ageGroup && (
                      <Row label="Age group" value={currentBaseline.ageGroup} />
                    )}
                    {currentBaseline.usualCognitionLevel && (
                      <Row label="Cognition" value={labelFor(COGNITION_OPTIONS, currentBaseline.usualCognitionLevel)} />
                    )}
                    {currentBaseline.usualMobilityLevel && (
                      <Row label="Mobility" value={labelFor(MOBILITY_OPTIONS, currentBaseline.usualMobilityLevel)} />
                    )}
                    {currentBaseline.usualGaitPattern && (
                      <Row label="Gait" value={labelFor(GAIT_OPTIONS, currentBaseline.usualGaitPattern)} />
                    )}
                    {currentBaseline.usualAppetite && (
                      <Row label="Appetite" value={labelFor(APPETITE_OPTIONS, currentBaseline.usualAppetite)} />
                    )}
                    {currentBaseline.usualFluidIntake && (
                      <Row label="Fluid intake" value={labelFor(FLUID_OPTIONS, currentBaseline.usualFluidIntake)} />
                    )}
                    {currentBaseline.usualContinencePattern && (
                      <Row label="Continence" value={labelFor(CONTINENCE_OPTIONS, currentBaseline.usualContinencePattern)} />
                    )}
                    {currentBaseline.usualMoodBehaviour && (
                      <Row label="Mood / behaviour" value={labelFor(MOOD_OPTIONS, currentBaseline.usualMoodBehaviour)} />
                    )}
                    {currentBaseline.usualCommunicationLevel && (
                      <Row label="Communication" value={labelFor(COMMUNICATION_OPTIONS, currentBaseline.usualCommunicationLevel)} />
                    )}
                    {currentBaseline.usualOxygenSaturation && (
                      <Row label="Usual SpO2" value={`${currentBaseline.usualOxygenSaturation}%`} />
                    )}
                    {currentBaseline.usualBloodPressureRange && (
                      <Row label="Usual BP range" value={currentBaseline.usualBloodPressureRange} />
                    )}
                    {currentBaseline.usualPulseRange && (
                      <Row label="Usual pulse range" value={`${currentBaseline.usualPulseRange} bpm`} />
                    )}
                    {currentBaseline.fallsHistory && (
                      <Row label="Falls history" value={labelFor(FALLS_HISTORY_OPTIONS, currentBaseline.fallsHistory)} />
                    )}
                    {currentBaseline.medicationSupportNeeds && (
                      <Row label="Medication support" value={labelFor(MEDICATION_OPTIONS, currentBaseline.medicationSupportNeeds)} />
                    )}

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                      {currentBaseline.swallowingDifficulty && (
                        <Badge variant="warning" size="sm">Swallowing difficulty</Badge>
                      )}
                      {currentBaseline.catheterUse && (
                        <Badge variant="info" size="sm">Catheter in use</Badge>
                      )}
                      {currentBaseline.pressureSoreRisk && (
                        <Badge variant="warning" size="sm">Pressure sore risk</Badge>
                      )}
                      {currentBaseline.palliativeOrEndOfLifeStatus && (
                        <Badge variant="danger" size="sm">Palliative / EOL</Badge>
                      )}
                    </div>

                    {currentBaseline.baselineNotes && (
                      <div className="pt-2">
                        <p className="text-slate-500 text-xs mb-1">Notes</p>
                        <p className="text-slate-700">{currentBaseline.baselineNotes}</p>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 pt-1">
                      Last updated {formatDate(currentBaseline.updatedAt)}
                      {currentBaseline.updateReason && ` — ${currentBaseline.updateReason}`}
                    </p>
                  </div>
                </Card>

                {/* Baseline history */}
                {baselineHistory.length > 0 && (
                  <Card padding="md">
                    <button
                      onClick={() => setShowHistory((v) => !v)}
                      className="w-full flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800 text-sm">
                        Baseline history ({baselineHistory.length})
                      </span>
                      {showHistory ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    {showHistory && (
                      <div className="mt-3 space-y-3">
                        {baselineHistory.map((b) => (
                          <div key={b.id} className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500">
                              Recorded {formatDate(b.createdAt)}
                            </p>
                            {b.updateReason && (
                              <p className="text-xs text-slate-600 mt-0.5">
                                Reason: {b.updateReason}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}

            {/* Baseline form */}
            {showBaselineForm && (
              <Card padding="md">
                <h3 className="font-semibold text-slate-800 mb-4">
                  {currentBaseline ? 'Update Baseline' : 'Set Up Baseline'}
                </h3>

                <div className="space-y-4">
                  {currentBaseline && (
                    <TextArea
                      label="Reason for update"
                      value={updateReason}
                      onChange={(e) => setUpdateReason(e.target.value)}
                      placeholder="e.g. Clinical review on 24 Apr — mobility assessment updated"
                      rows={2}
                    />
                  )}

                  <Select
                    label="Age group"
                    options={AGE_GROUP_OPTIONS}
                    value={baselineForm.ageGroup || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, ageGroup: e.target.value }))}
                    placeholder="Select..."
                  />
                  <Select
                    label="Usual cognition level"
                    options={COGNITION_OPTIONS}
                    value={baselineForm.usualCognitionLevel || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, usualCognitionLevel: e.target.value }))}
                    placeholder="Select..."
                  />
                  <Select
                    label="Usual mobility level"
                    options={MOBILITY_OPTIONS}
                    value={baselineForm.usualMobilityLevel || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, usualMobilityLevel: e.target.value }))}
                    placeholder="Select..."
                  />
                  <Select
                    label="Usual gait pattern"
                    options={GAIT_OPTIONS}
                    value={baselineForm.usualGaitPattern || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, usualGaitPattern: e.target.value }))}
                    placeholder="Select..."
                  />
                  <Select
                    label="Usual appetite"
                    options={APPETITE_OPTIONS}
                    value={baselineForm.usualAppetite || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, usualAppetite: e.target.value }))}
                    placeholder="Select..."
                  />
                  <Select
                    label="Usual fluid intake"
                    options={FLUID_OPTIONS}
                    value={baselineForm.usualFluidIntake || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, usualFluidIntake: e.target.value }))}
                    placeholder="Select..."
                  />
                  <Select
                    label="Usual continence pattern"
                    options={CONTINENCE_OPTIONS}
                    value={baselineForm.usualContinencePattern || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, usualContinencePattern: e.target.value }))}
                    placeholder="Select..."
                  />
                  <Select
                    label="Usual mood / behaviour"
                    options={MOOD_OPTIONS}
                    value={baselineForm.usualMoodBehaviour || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, usualMoodBehaviour: e.target.value }))}
                    placeholder="Select..."
                  />
                  <Select
                    label="Usual communication level"
                    options={COMMUNICATION_OPTIONS}
                    value={baselineForm.usualCommunicationLevel || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, usualCommunicationLevel: e.target.value }))}
                    placeholder="Select..."
                  />
                  <Select
                    label="Falls history"
                    options={FALLS_HISTORY_OPTIONS}
                    value={baselineForm.fallsHistory || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, fallsHistory: e.target.value }))}
                    placeholder="Select..."
                  />
                  <Select
                    label="Medication support needs"
                    options={MEDICATION_OPTIONS}
                    value={baselineForm.medicationSupportNeeds || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, medicationSupportNeeds: e.target.value }))}
                    placeholder="Select..."
                  />

                  <p className="text-xs font-medium text-slate-600">Usual vital sign ranges (optional)</p>
                  <Input
                    label="Usual oxygen saturation (e.g. 95–99)"
                    value={baselineForm.usualOxygenSaturation || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, usualOxygenSaturation: e.target.value }))}
                    placeholder="e.g. 95-99"
                  />
                  <Input
                    label="Usual blood pressure range (e.g. 110-140/70-90)"
                    value={baselineForm.usualBloodPressureRange || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, usualBloodPressureRange: e.target.value }))}
                    placeholder="e.g. 110-140/70-90"
                  />
                  <Input
                    label="Usual pulse range (e.g. 60-80)"
                    value={baselineForm.usualPulseRange || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, usualPulseRange: e.target.value }))}
                    placeholder="e.g. 60-80"
                  />

                  <p className="text-xs font-medium text-slate-600">Risk flags</p>
                  <div className="space-y-3">
                    {[
                      { key: 'swallowingDifficulty' as const, label: 'Swallowing difficulty' },
                      { key: 'catheterUse' as const, label: 'Catheter in use' },
                      { key: 'pressureSoreRisk' as const, label: 'Pressure sore risk' },
                      { key: 'palliativeOrEndOfLifeStatus' as const, label: 'Palliative / end-of-life care' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!baselineForm[key]}
                          onChange={(e) => setBaselineForm((f) => ({ ...f, [key]: e.target.checked }))}
                          className="w-4 h-4 rounded accent-primary-500"
                        />
                        <span className="text-sm text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>

                  <TextArea
                    label="Baseline notes (optional)"
                    value={baselineForm.baselineNotes || ''}
                    onChange={(e) => setBaselineForm((f) => ({ ...f, baselineNotes: e.target.value }))}
                    placeholder="Any additional baseline information..."
                    rows={3}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        setShowBaselineForm(false)
                        if (currentBaseline) setBaselineForm({ ...currentBaseline })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button fullWidth onClick={handleSaveBaseline} loading={savingBaseline}>
                      Save Baseline
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── Conditions Tab ── */}
        {activeTab === 'conditions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{conditions.filter((c) => c.status === 'active').length} active condition(s)</p>
              <Button size="sm" onClick={() => setShowAddCondition(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {conditions.length === 0 && (
              <Card padding="md" className="text-center py-6">
                <p className="text-slate-500 text-sm">No conditions recorded yet.</p>
              </Card>
            )}

            {conditions.map((cond) => (
              <Card key={cond.id} padding="md">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-800">{cond.conditionName}</p>
                      <Badge
                        variant={
                          cond.severity === 'severe'
                            ? 'danger'
                            : cond.severity === 'moderate'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {cond.severity}
                      </Badge>
                      {cond.status === 'inactive' && (
                        <Badge variant="secondary" size="sm">Inactive</Badge>
                      )}
                    </div>
                    {cond.notes && (
                      <p className="text-sm text-slate-500 mt-1">{cond.notes}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Added {formatDate(cond.addedAt)}
                    </p>
                  </div>
                  {cond.status === 'active' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeactivateCondition(cond.id)}
                      className="text-slate-400 hover:text-risk-red flex-shrink-0"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── Assignments Tab ── */}
        {activeTab === 'assignments' && (
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
              <p className="text-sm text-slate-500 text-center py-4">No carers assigned yet</p>
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
                      <span className="font-medium text-slate-700">{carer.fullName}</span>
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
        )}

        {/* ── History Tab ── */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {visitEntries.length === 0 ? (
              <Card padding="md" className="text-center py-6">
                <p className="text-slate-500 text-sm">No visit entries recorded yet</p>
              </Card>
            ) : (
              visitEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-4 bg-white rounded-2xl shadow-sm"
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
                          entry.riskLevel === 'amber' ? 'text-risk-amber' : 'text-risk-red'
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <RiskBadge level={entry.riskLevel} size="sm" />
                      {(entry as any).healthRiskScore != null && (
                        <span className="text-xs text-primary-600 font-medium">
                          HRS: {(entry as any).healthRiskScore}/100
                        </span>
                      )}
                      <span className="text-sm text-slate-500">Score: {entry.score}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{formatDateTime(entry.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Assign Carer Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Carer">
        <div className="space-y-4">
          <Select
            label="Select Carer"
            options={availableCarers.map((c) => ({ value: c.id, label: c.fullName }))}
            value={selectedCarerId}
            onChange={(e) => setSelectedCarerId(e.target.value)}
            placeholder="Choose a carer..."
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button fullWidth onClick={handleAssign} disabled={!selectedCarerId}>Assign</Button>
          </div>
        </div>
      </Modal>

      {/* Add Condition Modal */}
      <Modal isOpen={showAddCondition} onClose={() => setShowAddCondition(false)} title="Add Condition">
        <div className="space-y-4">
          <Select
            label="Condition"
            options={CONDITION_LIST.map((c) => ({ value: c, label: c }))}
            value={newConditionName}
            onChange={(e) => setNewConditionName(e.target.value)}
            placeholder="Select condition..."
          />
          <Select
            label="Severity"
            options={SEVERITY_OPTIONS}
            value={newConditionSeverity}
            onChange={(e) => setNewConditionSeverity(e.target.value)}
          />
          <TextArea
            label="Notes (optional)"
            value={newConditionNotes}
            onChange={(e) => setNewConditionNotes(e.target.value)}
            placeholder="Any relevant notes about this condition..."
            rows={2}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setShowAddCondition(false)}>Cancel</Button>
            <Button
              fullWidth
              onClick={handleAddCondition}
              loading={savingCondition}
              disabled={!newConditionName}
            >
              Add Condition
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={client.status === 'active' ? 'Deactivate Client' : 'Reactivate Client'}
      >
        <div className="space-y-4">
          {client.status === 'active' ? (
            <>
              <p className="text-sm text-slate-600">
                Deactivating this client will remove them from carers' client lists. All historical
                data will be preserved.
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
              Reactivating this client will make them available for carers to record visit entries
              again.
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setShowStatusModal(false)}>Cancel</Button>
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

// Small helper row component
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-slate-800 text-right">{value}</span>
    </div>
  )
}
