import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MobileLayout, Header } from '@/components/layout'
import {
  Card,
  Button,
  Select,
  TextArea,
  RiskAlert,
  Badge,
} from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { formatDateTime, cn } from '@/lib/utils'
import {
  AlertTriangle,
  User,
  Clock,
  Activity,
  FileText,
  CheckCircle,
  Copy,
  Check,
} from 'lucide-react'
import type { AlertActionTaken } from '@/types'

const ACTION_OPTIONS = [
  { value: 'monitor', label: 'Monitor' },
  { value: 'called_family', label: 'Called family' },
  { value: 'informed_gp', label: 'Informed GP' },
  { value: 'community_nurse', label: 'Community nurse' },
  { value: 'emergency_escalation', label: 'Emergency escalation' },
]

const ACTION_LABELS: Record<AlertActionTaken, string> = {
  monitor: 'Monitor',
  called_family: 'Called family',
  informed_gp: 'Informed GP',
  community_nurse: 'Community nurse',
  emergency_escalation: 'Emergency escalation',
}

export function AlertDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    getAlertById,
    getVisitEntryById,
    getClientById,
    getCarerById,
    reviewAlert,
  } = useApp()

  const alert = id ? getAlertById(id) : undefined
  const visitEntry = alert ? getVisitEntryById(alert.visitEntryId) : undefined
  const client = alert ? getClientById(alert.clientId) : undefined
  const carer = alert ? getCarerById(alert.carerId) : undefined

  const [actionTaken, setActionTaken] = useState<string>('')
  const [managerNote, setManagerNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!alert || !visitEntry) {
    return (
      <MobileLayout header={<Header title="Alert" showBack />}>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Alert not found</p>
        </div>
      </MobileLayout>
    )
  }

  const handleReview = async () => {
    if (!actionTaken || !user) return
    setLoading(true)

    try {
      await reviewAlert(alert.id, user.id, actionTaken as AlertActionTaken, managerNote)
      navigate('/manager/alerts')
    } catch (err) {
      console.error('Failed to review alert:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateSummary = (): string => {
    const lines = [
      `LYNTO ALERT SUMMARY`,
      `==================`,
      `Risk Level: ${alert.riskLevel.toUpperCase()}`,
      `Client: ${client?.displayName || 'Unknown'}`,
      `Date/Time: ${formatDateTime(alert.createdAt)}`,
      `Recorded by: ${carer?.fullName || 'Unknown'}`,
      ``,
      `OBSERVATIONS:`,
      ...visitEntry.reasons.map((r) => `- ${r}`),
      ``,
      `Score: ${visitEntry.score}`,
    ]

    if (visitEntry.note) {
      lines.push(``, `CARER NOTE:`, visitEntry.note)
    }

    if (Object.keys(visitEntry.vitals).length > 0) {
      lines.push(``, `VITALS:`)
      if (visitEntry.vitals.temperature)
        lines.push(`- Temperature: ${visitEntry.vitals.temperature}°C`)
      if (visitEntry.vitals.pulse)
        lines.push(`- Pulse: ${visitEntry.vitals.pulse} bpm`)
      if (visitEntry.vitals.systolicBp && visitEntry.vitals.diastolicBp)
        lines.push(`- BP: ${visitEntry.vitals.systolicBp}/${visitEntry.vitals.diastolicBp}`)
      if (visitEntry.vitals.oxygenSaturation)
        lines.push(`- SpO2: ${visitEntry.vitals.oxygenSaturation}%`)
      if (visitEntry.vitals.respiratoryRate)
        lines.push(`- Resp Rate: ${visitEntry.vitals.respiratoryRate}/min`)
    }

    if (alert.isReviewed && alert.actionTaken) {
      lines.push(
        ``,
        `REVIEW:`,
        `Action: ${ACTION_LABELS[alert.actionTaken]}`,
        `Reviewed: ${formatDateTime(alert.reviewedAt!)}`
      )
      if (alert.managerNote) {
        lines.push(`Manager Note: ${alert.managerNote}`)
      }
    }

    return lines.join('\n')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateSummary())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = generateSummary()
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <MobileLayout header={<Header title="Alert Details" showBack />}>
      <div className="space-y-4 pb-6 animate-fade-in">
        {/* Risk Banner */}
        <RiskAlert level={alert.riskLevel} score={visitEntry.score} />

        {/* Client & Carer Info */}
        <Card padding="md">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Client</p>
                <p className="font-medium text-slate-800">
                  {client?.displayName || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Recorded by</p>
                <p className="font-medium text-slate-800">
                  {carer?.fullName || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Date & Time</p>
                <p className="font-medium text-slate-800">
                  {formatDateTime(alert.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Observations */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">Observations</h3>
          </div>
          <ul className="space-y-2">
            {visitEntry.reasons.map((reason, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <span
                  className={cn(
                    'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                    alert.riskLevel === 'red' ? 'bg-risk-red' : 'bg-risk-amber'
                  )}
                />
                {reason}
              </li>
            ))}
          </ul>
        </Card>

        {/* Vitals */}
        {Object.keys(visitEntry.vitals).length > 0 && (
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-800">Vitals Recorded</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {visitEntry.vitals.temperature && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Temperature</p>
                  <p className="font-semibold text-slate-800">
                    {visitEntry.vitals.temperature}°C
                  </p>
                </div>
              )}
              {visitEntry.vitals.pulse && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Pulse</p>
                  <p className="font-semibold text-slate-800">
                    {visitEntry.vitals.pulse} bpm
                  </p>
                </div>
              )}
              {visitEntry.vitals.systolicBp && visitEntry.vitals.diastolicBp && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Blood Pressure</p>
                  <p className="font-semibold text-slate-800">
                    {visitEntry.vitals.systolicBp}/{visitEntry.vitals.diastolicBp}
                  </p>
                </div>
              )}
              {visitEntry.vitals.oxygenSaturation && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Oxygen Saturation</p>
                  <p className="font-semibold text-slate-800">
                    {visitEntry.vitals.oxygenSaturation}%
                  </p>
                </div>
              )}
              {visitEntry.vitals.respiratoryRate && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Respiratory Rate</p>
                  <p className="font-semibold text-slate-800">
                    {visitEntry.vitals.respiratoryRate}/min
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Carer Note */}
        {visitEntry.note && (
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-800">Carer's Note</h3>
            </div>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
              "{visitEntry.note}"
            </p>
          </Card>
        )}

        {/* Correction Notes */}
        {visitEntry.correctionNotes && visitEntry.correctionNotes.length > 0 && (
          <Card padding="md">
            <h3 className="font-semibold text-slate-800 mb-3">Correction Notes</h3>
            <div className="space-y-2">
              {visitEntry.correctionNotes.map((note) => {
                const noteCarer = getCarerById(note.carerId)
                return (
                  <div key={note.id} className="bg-amber-50 rounded-xl p-3">
                    <p className="text-sm text-slate-700">{note.text}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      By {noteCarer?.fullName || 'Unknown'} • {formatDateTime(note.createdAt)}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Review Section */}
        {alert.isReviewed ? (
          <Card padding="md" className="border-2 border-risk-green">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-risk-green" />
              <h3 className="font-semibold text-slate-800">Reviewed</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Action Taken</p>
                <Badge variant="success" className="mt-1">
                  {alert.actionTaken ? ACTION_LABELS[alert.actionTaken] : 'Unknown'}
                </Badge>
              </div>
              {alert.managerNote && (
                <div>
                  <p className="text-sm text-slate-500">Manager Note</p>
                  <p className="text-sm text-slate-700 mt-1">{alert.managerNote}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500">Reviewed</p>
                <p className="text-sm text-slate-700">{formatDateTime(alert.reviewedAt!)}</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card padding="md">
            <h3 className="font-semibold text-slate-800 mb-4">Review Alert</h3>
            <div className="space-y-4">
              <Select
                label="Action Taken"
                options={ACTION_OPTIONS}
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="Select an action..."
              />

              <TextArea
                label="Note (optional)"
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                maxLength={500}
                showCount
              />

              <Button
                fullWidth
                onClick={handleReview}
                loading={loading}
                disabled={!actionTaken}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark as Reviewed
              </Button>
            </div>
          </Card>
        )}

        {/* Copy Summary Button */}
        <Button
          variant="outline"
          fullWidth
          onClick={handleCopy}
          className="flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-risk-green" />
              Copied to Clipboard
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy Summary for DSCR App
            </>
          )}
        </Button>

        <p className="text-xs text-center text-slate-400">
          Decision support only. Follow usual escalation procedures.
        </p>
      </div>
    </MobileLayout>
  )
}
