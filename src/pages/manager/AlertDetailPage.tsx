import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MobileLayout, Header } from '@/components/layout'
import {
  Card,
  Button,
  Select,
  TextArea,
  RiskAlert,
  Badge,
  ScoreBreakdownCard,
  WhyThisScore,
  ClinicalWarningCard,
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
  Stethoscope,
} from 'lucide-react'
import type { AlertActionTaken, AlertOutcomeValue, AlertUsefulnessFeedback, ScoreBreakdown, AlertOutcome } from '@/types'

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

const OUTCOME_OPTIONS: { value: AlertOutcomeValue; label: string }[] = [
  { value: 'no_further_action', label: 'No further action required' },
  { value: 'continue_monitoring', label: 'Continue monitoring' },
  { value: 'family_contacted', label: 'Family / next of kin contacted' },
  { value: 'gp_contacted', label: 'GP contacted' },
  { value: 'community_nurse_contacted', label: 'Community nurse contacted' },
  { value: '111_contacted', label: '111 contacted' },
  { value: '999_emergency', label: '999 / emergency services contacted' },
  { value: 'hospital_admission', label: 'Hospital admission' },
  { value: 'medication_issue', label: 'Medication issue identified' },
  { value: 'suspected_uti', label: 'Suspected UTI' },
  { value: 'suspected_infection', label: 'Suspected infection' },
  { value: 'fall_confirmed', label: 'Fall confirmed' },
  { value: 'care_plan_updated', label: 'Care plan updated' },
  { value: 'baseline_updated', label: 'Baseline updated' },
  { value: 'other', label: 'Other' },
]

const USEFULNESS_OPTIONS: { value: AlertUsefulnessFeedback; label: string }[] = [
  { value: 'yes_correct_concern', label: 'Yes, correct concern' },
  { value: 'partly_useful', label: 'Partly useful' },
  { value: 'no_false_alarm', label: 'No, false alarm' },
  { value: 'needs_monitoring', label: 'Needs monitoring' },
  { value: 'unsure', label: 'Unsure' },
]

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
    fetchScoreBreakdown,
    fetchAlertOutcome,
    saveAlertOutcome,
  } = useApp()

  const alert = id ? getAlertById(id) : undefined
  const visitEntry = alert ? getVisitEntryById(alert.visitEntryId) : undefined
  const client = alert ? getClientById(alert.clientId) : undefined
  const carer = alert ? getCarerById(alert.carerId) : undefined

  const [actionTaken, setActionTaken] = useState<string>('')
  const [managerNote, setManagerNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [gpCopied, setGpCopied] = useState(false)

  // v2 score breakdown + outcome
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null)
  const [alertOutcome, setAlertOutcome] = useState<AlertOutcome | null>(null)

  // v2 outcome form state
  const [outcome, setOutcome] = useState<string>('')
  const [wasAlertUseful, setWasAlertUseful] = useState<string>('')
  const [followUpRequired, setFollowUpRequired] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [outcomeNotes, setOutcomeNotes] = useState('')

  useEffect(() => {
    if (visitEntry?.id) {
      fetchScoreBreakdown(visitEntry.id).then(setScoreBreakdown)
    }
    if (alert?.id) {
      fetchAlertOutcome(alert.id).then((o) => {
        if (o) {
          setAlertOutcome(o)
          setOutcome(o.outcome || '')
          setWasAlertUseful(o.wasAlertUseful || '')
          setFollowUpRequired(o.followUpRequired)
          setFollowUpDate(o.followUpDate || '')
          setOutcomeNotes(o.outcomeNotes || '')
        }
      })
    }
  }, [visitEntry?.id, alert?.id])

  if (!alert || !visitEntry) {
    return (
      <MobileLayout header={<Header title="Alert" showBack />}>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Alert not found</p>
        </div>
      </MobileLayout>
    )
  }

  const hasClinicalUrgency = (alert as any).hasClinicalUrgency

  const handleReview = async () => {
    if (!actionTaken || !user) return
    setLoading(true)
    try {
      await reviewAlert(alert.id, user.id, actionTaken as AlertActionTaken, managerNote)

      // Save outcome / feedback
      await saveAlertOutcome(
        alert.id,
        alert.visitEntryId,
        alert.clientId,
        outcome as AlertOutcomeValue || undefined,
        wasAlertUseful as AlertUsefulnessFeedback || undefined,
        followUpRequired,
        followUpDate || undefined,
        outcomeNotes || undefined
      )

      navigate('/manager/alerts')
    } catch (err) {
      console.error('Failed to review alert:', err)
    } finally {
      setLoading(false)
    }
  }

  // DSCR summary (existing)
  const generateSummary = (): string => {
    const lines = [
      `LYNTO ALERT SUMMARY`,
      `==================`,
      `Risk Level: ${alert.riskLevel.toUpperCase()}`,
    ]
    if (scoreBreakdown) {
      lines.push(`LYNTO Health Risk Score™: ${scoreBreakdown.finalHealthRiskScore}/100 — ${scoreBreakdown.riskBandLabel}`)
    }
    lines.push(
      `Client: ${client?.displayName || 'Unknown'}`,
      `Date/Time: ${formatDateTime(alert.createdAt)}`,
      `Recorded by: ${carer?.fullName || 'Unknown'}`,
      ``,
      `OBSERVATIONS:`,
      ...visitEntry.reasons.map((r) => `- ${r}`)
    )
    if (scoreBreakdown?.baselineChangeReasons.length) {
      lines.push(``, `BASELINE CHANGES:`, ...scoreBreakdown.baselineChangeReasons.map((r) => `- ${r}`))
    }
    if (scoreBreakdown?.conditionAdjustmentReasons.length) {
      lines.push(``, `CONDITION FACTORS:`, ...scoreBreakdown.conditionAdjustmentReasons.map((r) => `- ${r}`))
    }
    if (scoreBreakdown?.trendReasons.length) {
      lines.push(``, `TREND FACTORS:`, ...scoreBreakdown.trendReasons.map((r) => `- ${r}`))
    }
    if (visitEntry.note) {
      lines.push(``, `CARER NOTE:`, visitEntry.note)
    }
    if (Object.keys(visitEntry.vitals).length > 0) {
      lines.push(``, `VITALS:`)
      if (visitEntry.vitals.temperature) lines.push(`- Temperature: ${visitEntry.vitals.temperature}°C`)
      if (visitEntry.vitals.pulse) lines.push(`- Pulse: ${visitEntry.vitals.pulse} bpm`)
      if (visitEntry.vitals.systolicBp && visitEntry.vitals.diastolicBp)
        lines.push(`- BP: ${visitEntry.vitals.systolicBp}/${visitEntry.vitals.diastolicBp}`)
      if (visitEntry.vitals.oxygenSaturation) lines.push(`- SpO2: ${visitEntry.vitals.oxygenSaturation}%`)
      if (visitEntry.vitals.respiratoryRate) lines.push(`- Resp Rate: ${visitEntry.vitals.respiratoryRate}/min`)
    }
    if (alert.isReviewed && alert.actionTaken) {
      lines.push(``, `REVIEW:`, `Action: ${ACTION_LABELS[alert.actionTaken]}`, `Reviewed: ${formatDateTime(alert.reviewedAt!)}`)
      if (alert.managerNote) lines.push(`Manager Note: ${alert.managerNote}`)
    }
    return lines.join('\n')
  }

  // GP Handover summary (new)
  const generateGpHandover = (): string => {
    const vitalsText: string[] = []
    if (visitEntry.vitals.pulse) vitalsText.push(`pulse ${visitEntry.vitals.pulse} bpm`)
    if (visitEntry.vitals.oxygenSaturation) vitalsText.push(`oxygen saturation ${visitEntry.vitals.oxygenSaturation}%`)
    if (visitEntry.vitals.temperature) vitalsText.push(`temperature ${visitEntry.vitals.temperature}°C`)
    if (visitEntry.vitals.respiratoryRate) vitalsText.push(`respiratory rate ${visitEntry.vitals.respiratoryRate}/min`)
    if (visitEntry.vitals.systolicBp) vitalsText.push(`blood pressure ${visitEntry.vitals.systolicBp}/${visitEntry.vitals.diastolicBp ?? '?'}`)

    const cws = scoreBreakdown?.clinicalWarningScore
    const cwb = scoreBreakdown?.clinicalWarningBand
    const hrs = scoreBreakdown?.finalHealthRiskScore

    const baselineText = scoreBreakdown?.baselineChangeReasons.length
      ? scoreBreakdown.baselineChangeReasons.slice(0, 2).join('; ').toLowerCase() + '.'
      : ''

    const conditionText = scoreBreakdown?.conditionAdjustmentReasons.length
      ? scoreBreakdown.conditionAdjustmentReasons[0].toLowerCase() + '.'
      : ''

    const lines = [
      `GP HANDOVER — LYNTO CLINICAL SUMMARY`,
      `=====================================`,
      `Client: ${client?.displayName || 'Unknown'}`,
      `Date/Time: ${formatDateTime(alert.createdAt)}`,
      `Recorded by: ${carer?.fullName || 'Unknown'}`,
      ``,
    ]

    if (cws !== undefined && cwb) {
      lines.push(`LYNTO Clinical Warning Score™: ${cws} (${cwb})`)
    }
    if (hrs !== undefined) {
      lines.push(`LYNTO Health Risk Score™: ${hrs}/100 — ${scoreBreakdown?.riskBandLabel}`)
    }

    lines.push(``)
    const summary = [
      `Client has LYNTO Clinical Warning Score ${cws ?? 'N/A'} (${cwb ?? alert.riskLevel})`,
      baselineText,
      vitalsText.length ? vitalsText.join(', ') + ' recorded.' : '',
      conditionText,
    ].filter(Boolean).join(' ')

    lines.push(summary)
    lines.push(``, `Please review.`)

    return lines.join('\n')
  }

  const handleCopy = async () => {
    const text = generateSummary()
    await navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGpCopy = async () => {
    const text = generateGpHandover()
    await navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
    setGpCopied(true)
    setTimeout(() => setGpCopied(false), 2000)
  }

  return (
    <MobileLayout header={<Header title="Alert Details" showBack />}>
      <div className="space-y-4 pb-6 animate-fade-in">

        {/* Clinical urgency banner */}
        {hasClinicalUrgency && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl p-3">
            <Stethoscope className="w-5 h-5 text-risk-red flex-shrink-0" />
            <p className="text-sm font-medium text-risk-red">
              Clinical warning indicators elevated — consider contacting clinician
            </p>
          </div>
        )}

        {/* Primary Risk Banner */}
        {scoreBreakdown ? (
          <Card padding="md">
            <p className="text-xs text-slate-400 mb-1">LYNTO Health Risk Score™</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-slate-800">
                {scoreBreakdown.finalHealthRiskScore}
                <span className="text-base font-normal text-slate-400">/100</span>
              </span>
              <div
                className={cn(
                  'px-3 py-1.5 rounded-xl text-sm font-semibold',
                  scoreBreakdown.finalRiskLevel === 'red' && 'bg-risk-red-light text-risk-red',
                  scoreBreakdown.finalRiskLevel === 'amber' && 'bg-risk-amber-light text-amber-800',
                  scoreBreakdown.finalRiskLevel === 'green' && 'bg-risk-green-light text-green-800'
                )}
              >
                {scoreBreakdown.riskBandLabel.split('/')[0].trim()}
              </div>
            </div>
          </Card>
        ) : (
          <RiskAlert level={alert.riskLevel} score={visitEntry.score} />
        )}

        {/* Clinical Warning Score */}
        {scoreBreakdown && (
          <ClinicalWarningCard
            score={scoreBreakdown.clinicalWarningScore}
            band={scoreBreakdown.clinicalWarningBand}
            partial={scoreBreakdown.clinicalWarningPartial}
            singleRedParameter={scoreBreakdown.singleRedParameter}
            parameterBreakdown={scoreBreakdown.clinicalParameterBreakdown}
          />
        )}

        {/* Score Breakdown */}
        {scoreBreakdown && <ScoreBreakdownCard breakdown={scoreBreakdown} />}

        {/* Why this score */}
        {scoreBreakdown && (
          <WhyThisScore breakdown={scoreBreakdown} defaultOpen={alert.riskLevel === 'red'} />
        )}

        {/* Client & Carer Info */}
        <Card padding="md">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Client</p>
                <p className="font-medium text-slate-800">{client?.displayName || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Recorded by</p>
                <p className="font-medium text-slate-800">{carer?.fullName || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Date & Time</p>
                <p className="font-medium text-slate-800">{formatDateTime(alert.createdAt)}</p>
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
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
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
        {Object.keys(visitEntry.vitals).filter(k => visitEntry.vitals[k as keyof typeof visitEntry.vitals] != null).length > 0 && (
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-800">Vitals Recorded</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {visitEntry.vitals.temperature && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Temperature</p>
                  <p className="font-semibold text-slate-800">{visitEntry.vitals.temperature}°C</p>
                </div>
              )}
              {visitEntry.vitals.pulse && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Pulse</p>
                  <p className="font-semibold text-slate-800">{visitEntry.vitals.pulse} bpm</p>
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
                  <p className="font-semibold text-slate-800">{visitEntry.vitals.oxygenSaturation}%</p>
                </div>
              )}
              {visitEntry.vitals.respiratoryRate && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Respiratory Rate</p>
                  <p className="font-semibold text-slate-800">{visitEntry.vitals.respiratoryRate}/min</p>
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
            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">"{visitEntry.note}"</p>
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

              {/* Show outcome if saved */}
              {alertOutcome?.outcome && (
                <div>
                  <p className="text-sm text-slate-500">Outcome</p>
                  <p className="text-sm text-slate-700 mt-1">
                    {OUTCOME_OPTIONS.find((o) => o.value === alertOutcome.outcome)?.label}
                  </p>
                </div>
              )}
              {alertOutcome?.wasAlertUseful && (
                <div>
                  <p className="text-sm text-slate-500">Alert usefulness</p>
                  <p className="text-sm text-slate-700 mt-1">
                    {USEFULNESS_OPTIONS.find((o) => o.value === alertOutcome.wasAlertUseful)?.label}
                  </p>
                </div>
              )}
              {alertOutcome?.followUpRequired && alertOutcome.followUpDate && (
                <div>
                  <p className="text-sm text-slate-500">Follow-up scheduled</p>
                  <p className="text-sm text-slate-700">{alertOutcome.followUpDate}</p>
                </div>
              )}
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
                label="Manager note (optional)"
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
                placeholder="Add any additional notes..."
                rows={2}
                maxLength={500}
                showCount
              />

              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Outcome & feedback</p>
                <div className="space-y-3">
                  <Select
                    label="Outcome"
                    options={OUTCOME_OPTIONS}
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    placeholder="Select outcome..."
                  />
                  <Select
                    label="Was this alert useful?"
                    options={USEFULNESS_OPTIONS}
                    value={wasAlertUseful}
                    onChange={(e) => setWasAlertUseful(e.target.value)}
                    placeholder="Select..."
                  />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={followUpRequired}
                      onChange={(e) => setFollowUpRequired(e.target.checked)}
                      className="w-4 h-4 rounded accent-primary-500"
                    />
                    <span className="text-sm text-slate-700">Follow-up required</span>
                  </label>
                  {followUpRequired && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Follow-up date
                      </label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                  <TextArea
                    label="Outcome notes (optional)"
                    value={outcomeNotes}
                    onChange={(e) => setOutcomeNotes(e.target.value)}
                    placeholder="Any additional outcome detail..."
                    rows={2}
                  />
                </div>
              </div>

              <Button fullWidth onClick={handleReview} loading={loading} disabled={!actionTaken}>
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark as Reviewed
              </Button>
            </div>
          </Card>
        )}

        {/* Copy buttons */}
        <Button variant="outline" fullWidth onClick={handleCopy}>
          {copied ? (
            <><Check className="w-5 h-5 text-risk-green mr-2" />Copied</>
          ) : (
            <><Copy className="w-5 h-5 mr-2" />Copy Summary for DSCR App</>
          )}
        </Button>

        <Button variant="outline" fullWidth onClick={handleGpCopy}>
          {gpCopied ? (
            <><Check className="w-5 h-5 text-risk-green mr-2" />GP Summary Copied</>
          ) : (
            <><Stethoscope className="w-5 h-5 mr-2" />Copy GP Handover Summary</>
          )}
        </Button>

        <p className="text-xs text-center text-slate-400">
          LYNTO supports observation and escalation decisions. It does not diagnose conditions or
          replace professional clinical judgement.
        </p>
      </div>
    </MobileLayout>
  )
}
