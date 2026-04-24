import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  Client,
  Carer,
  VisitEntry,
  Alert,
  AlertActionTaken,
  Vitals,
  RiskLevel,
  ClientDeactivationReason,
  CarerDeactivationReason,
  CorrectionNote,
} from '@/types'
import { supabase, createFreshClient } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import {
  dbClientToClient,
  dbUserToCarer,
  dbVisitEntryToVisitEntry,
  dbCorrectionNoteToCorrectionNote,
  dbAlertToAlert,
  vitalsToDb,
} from '@/lib/converters'
import type { DbClient, DbUser, DbVisitEntry, DbCorrectionNote, DbAlert, DbCarerClientAssignment } from '@/lib/database.types'
import { runScoringEngine, SCORING_ENGINE_VERSION } from '@/lib/scoringEngine'
import type { RecentEntryForTrend } from '@/lib/scoringEngine'
import {
  dbClientBaselineToClientBaseline,
  dbClientConditionToClientCondition,
  dbVisitScoreBreakdownToScoreBreakdown,
  dbAlertOutcomeToAlertOutcome,
} from '@/lib/converters'
import type { ClientBaseline, ClientCondition, ScoreBreakdown, AlertOutcome, AlertOutcomeValue, AlertUsefulnessFeedback } from '@/types'

interface AppContextType {
  // Data
  clients: Client[]
  carers: Carer[]
  visitEntries: VisitEntry[]
  alerts: Alert[]
  isLoading: boolean

  // Client actions
  addClient: (displayName: string, internalReference?: string) => Promise<Client>
  updateClientStatus: (
    clientId: string,
    status: 'active' | 'inactive',
    reason?: ClientDeactivationReason,
    note?: string
  ) => Promise<void>
  assignCarerToClient: (clientId: string, carerId: string) => Promise<void>
  unassignCarerFromClient: (clientId: string, carerId: string) => Promise<void>
  getClientById: (id: string) => Client | undefined
  getClientsForCarer: (carerId: string) => Client[]

  // Carer actions
  addCarer: (fullName: string, email: string) => Promise<Carer>
  resendInvite: (email: string) => Promise<void>
  deactivateCarer: (carerId: string, reason: CarerDeactivationReason) => Promise<void>
  getCarerById: (id: string) => Carer | undefined
  getActiveCarers: () => Carer[]

  // Visit entry actions
  createVisitEntry: (
    clientId: string,
    carerId: string,
    agencyId: string,
    selectedSymptomIds: string[],
    vitals: Vitals,
    note: string
  ) => Promise<VisitEntry>
  addCorrectionNote: (visitEntryId: string, carerId: string, text: string) => Promise<void>
  getVisitEntriesForClient: (clientId: string) => VisitEntry[]
  getVisitEntryById: (id: string) => VisitEntry | undefined

  // Alert actions
  getAlertsByFilter: (
    filter: 'unreviewed' | 'reviewed' | 'amber' | 'red' | 'all',
    agencyId: string
  ) => Alert[]
  reviewAlert: (
    alertId: string,
    managerId: string,
    actionTaken: AlertActionTaken,
    note?: string
  ) => Promise<void>
  getAlertById: (id: string) => Alert | undefined
  getUnreviewedCount: (agencyId: string) => number

  // Refresh
  refreshData: () => Promise<void>

  // v2: Baseline
  fetchClientBaseline: (clientId: string) => Promise<{ current: ClientBaseline | null; history: ClientBaseline[] }>
  saveClientBaseline: (clientId: string, data: Partial<ClientBaseline>, updateReason?: string) => Promise<ClientBaseline>

  // v2: Conditions
  fetchClientConditions: (clientId: string) => Promise<ClientCondition[]>
  addClientCondition: (clientId: string, data: Omit<ClientCondition, 'id' | 'clientId' | 'agencyId' | 'addedBy' | 'addedAt' | 'updatedAt'>) => Promise<ClientCondition>
  updateClientCondition: (conditionId: string, updates: Partial<Pick<ClientCondition, 'severity' | 'notes' | 'status'>>) => Promise<void>

  // v2: Score breakdown
  fetchScoreBreakdown: (visitEntryId: string) => Promise<ScoreBreakdown | null>

  // v2: Alert outcomes
  fetchAlertOutcome: (alertId: string) => Promise<AlertOutcome | null>
  saveAlertOutcome: (
    alertId: string,
    visitEntryId: string,
    clientId: string,
    outcome: AlertOutcomeValue | undefined,
    wasAlertUseful: AlertUsefulnessFeedback | undefined,
    followUpRequired: boolean,
    followUpDate: string | undefined,
    outcomeNotes: string | undefined
  ) => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, agency, isAuthenticated, isAdmin } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [carers, setCarers] = useState<Carer[]>([])
  const [visitEntries, setVisitEntries] = useState<VisitEntry[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!isAuthenticated || isAdmin || !user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // Load clients
      const { data: clientRows } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (clientRows) {
        setClients(clientRows.map((r: DbClient) => dbClientToClient(r)))
      }

      // Load carers (users with role='carer') and their assignments
      const { data: carerRows } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'carer')
        .order('created_at', { ascending: false })

      const { data: assignmentRows } = await supabase
        .from('carer_client_assignments')
        .select('*')

      if (carerRows) {
        const assignments = (assignmentRows || []) as DbCarerClientAssignment[]
        setCarers(
          carerRows.map((r: DbUser) => {
            const carerAssignments = assignments
              .filter((a) => a.carer_id === r.id)
              .map((a) => a.client_id)
            return dbUserToCarer(r, carerAssignments)
          })
        )
      }

      // Load visit entries with correction notes
      const { data: visitRows } = await supabase
        .from('visit_entries')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: noteRows } = await supabase
        .from('correction_notes')
        .select('*')
        .order('created_at', { ascending: true })

      if (visitRows) {
        const notes = (noteRows || []) as DbCorrectionNote[]
        setVisitEntries(
          visitRows.map((r: DbVisitEntry) => {
            const entryNotes = notes
              .filter((n) => n.visit_entry_id === r.id)
              .map(dbCorrectionNoteToCorrectionNote)
            return dbVisitEntryToVisitEntry(r, entryNotes.length > 0 ? entryNotes : undefined)
          })
        )
      }

      // Load alerts
      const { data: alertRows } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })

      if (alertRows) {
        setAlerts(alertRows.map((r: DbAlert) => dbAlertToAlert(r)))
      }
    } catch (err) {
      console.error('Error loading app data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, isAdmin, user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Client actions
  const addClient = useCallback(
    async (displayName: string, internalReference?: string): Promise<Client> => {
      const agencyId = agency?.id || user?.agencyId
      if (!agencyId) throw new Error('No agency found')

      const { data, error } = await supabase
        .from('clients')
        .insert({
          display_name: displayName,
          internal_reference: internalReference || null,
          agency_id: agencyId,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      const newClient = dbClientToClient(data as DbClient)
      setClients((prev) => [newClient, ...prev])

      // Log activity
      await supabase.from('activity_log').insert({
        event_type: 'client_created',
        agency_id: agencyId,
        agency_name: agency?.name || '',
        entity_id: newClient.id,
        entity_name: displayName,
        performed_by: user!.id,
        performed_by_name: user!.fullName,
      })

      return newClient
    },
    [agency, user]
  )

  const updateClientStatus = useCallback(
    async (
      clientId: string,
      status: 'active' | 'inactive',
      reason?: ClientDeactivationReason,
      note?: string
    ): Promise<void> => {
      const updates: Record<string, unknown> = { status }
      if (status === 'inactive') {
        updates.deactivation_reason = reason || null
        updates.deactivation_note = note || null
        updates.deactivated_at = new Date().toISOString()
      } else {
        updates.deactivation_reason = null
        updates.deactivation_note = null
        updates.deactivated_at = null
      }

      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)

      if (error) throw error

      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? {
                ...c,
                status,
                deactivationReason: status === 'inactive' ? reason : undefined,
                deactivationNote: status === 'inactive' ? note : undefined,
                deactivatedAt: status === 'inactive' ? new Date().toISOString() : undefined,
              }
            : c
        )
      )

      // Log activity
      const client = clients.find((c) => c.id === clientId)
      if (user && client) {
        await supabase.from('activity_log').insert({
          event_type: status === 'inactive' ? 'client_deactivated' : 'client_reactivated',
          agency_id: agency?.id,
          agency_name: agency?.name || '',
          entity_id: clientId,
          entity_name: client.displayName,
          performed_by: user.id,
          performed_by_name: user.fullName,
          reason: reason || undefined,
        })
      }
    },
    [agency, user, clients]
  )

  const assignCarerToClient = useCallback(
    async (clientId: string, carerId: string): Promise<void> => {
      const agencyId = agency?.id || user?.agencyId
      if (!agencyId) throw new Error('No agency found')

      const { error } = await supabase
        .from('carer_client_assignments')
        .insert({
          carer_id: carerId,
          client_id: clientId,
          agency_id: agencyId,
        })

      if (error) throw error

      setCarers((prev) =>
        prev.map((c) =>
          c.id === carerId && !c.assignedClientIds.includes(clientId)
            ? { ...c, assignedClientIds: [...c.assignedClientIds, clientId] }
            : c
        )
      )
    },
    [agency, user]
  )

  const unassignCarerFromClient = useCallback(
    async (clientId: string, carerId: string): Promise<void> => {
      const { error } = await supabase
        .from('carer_client_assignments')
        .delete()
        .eq('carer_id', carerId)
        .eq('client_id', clientId)

      if (error) throw error

      setCarers((prev) =>
        prev.map((c) =>
          c.id === carerId
            ? { ...c, assignedClientIds: c.assignedClientIds.filter((id) => id !== clientId) }
            : c
        )
      )
    },
    []
  )

  const getClientById = useCallback(
    (id: string) => clients.find((c) => c.id === id),
    [clients]
  )

  const getClientsForCarer = useCallback(
    (carerId: string) => {
      const carer = carers.find((c) => c.id === carerId)
      if (!carer) return []
      return clients.filter(
        (c) => carer.assignedClientIds.includes(c.id) && c.status === 'active'
      )
    },
    [carers, clients]
  )

  // Carer actions
  const addCarer = useCallback(
    async (fullName: string, email: string): Promise<Carer> => {
      const agencyId = agency?.id || user?.agencyId
      if (!agencyId) throw new Error('No agency found')

      // 1. Create auth user with random password (fresh client to avoid session conflict)
      const freshClient = createFreshClient()
      const tempPassword = crypto.randomUUID()

      const { data: signUpData, error: signUpError } = await freshClient.auth.signUp({
        email,
        password: tempPassword,
      })

      if (signUpError || !signUpData.user) {
        throw new Error(signUpError?.message || 'Failed to create user')
      }

      // 2. Create users row
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user.id,
          email,
          full_name: fullName,
          role: 'carer',
          status: 'pending',
          agency_id: agencyId,
        })

      if (insertError) throw insertError

      // 3. Send password reset email (this is the "set password" email)
      const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
      await freshClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/set-password`,
      })

      // 4. Log activity
      await supabase.from('activity_log').insert({
        event_type: 'carer_created',
        agency_id: agencyId,
        agency_name: agency?.name || '',
        entity_id: signUpData.user.id,
        entity_name: fullName,
        performed_by: user!.id,
        performed_by_name: user!.fullName,
      })

      // 5. Update local state
      const newCarer: Carer = {
        id: signUpData.user.id,
        email,
        fullName,
        role: 'carer',
        status: 'pending',
        agencyId,
        createdAt: new Date().toISOString(),
        assignedClientIds: [],
      }
      setCarers((prev) => [newCarer, ...prev])
      return newCarer
    },
    [agency, user]
  )

  const resendInvite = useCallback(
    async (email: string): Promise<void> => {
      const freshClient = createFreshClient()
      const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
      const { error } = await freshClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/set-password`,
      })
      if (error) throw error
    },
    []
  )

  const deactivateCarer = useCallback(
    async (carerId: string, reason: CarerDeactivationReason): Promise<void> => {
      const { error } = await supabase
        .from('users')
        .update({
          status: 'inactive',
          deactivation_reason: reason,
          deactivated_at: new Date().toISOString(),
        })
        .eq('id', carerId)

      if (error) throw error

      setCarers((prev) =>
        prev.map((c) =>
          c.id === carerId
            ? {
                ...c,
                status: 'inactive' as const,
                deactivationReason: reason,
                deactivatedAt: new Date().toISOString(),
              }
            : c
        )
      )

      // Log activity
      const carer = carers.find((c) => c.id === carerId)
      if (user && carer) {
        await supabase.from('activity_log').insert({
          event_type: 'carer_deactivated',
          agency_id: agency?.id,
          agency_name: agency?.name || '',
          entity_id: carerId,
          entity_name: carer.fullName,
          performed_by: user.id,
          performed_by_name: user.fullName,
          reason,
        })
      }
    },
    [agency, user, carers]
  )

  const getCarerById = useCallback(
    (id: string) => carers.find((c) => c.id === id),
    [carers]
  )

  const getActiveCarers = useCallback(
    () => carers.filter((c) => c.status === 'active'),
    [carers]
  )

  // Visit entry actions
  const createVisitEntry = useCallback(
    async (
      clientId: string,
      carerId: string,
      agencyId: string,
      selectedSymptomIds: string[],
      vitals: Vitals,
      note: string
    ): Promise<VisitEntry> => {
      // Fetch baseline, conditions, and recent entries for enhanced scoring
      const [baselineResult, conditionsResult, recentResult] = await Promise.all([
        supabase
          .from('client_baselines')
          .select('*')
          .eq('client_id', clientId)
          .eq('is_current', true)
          .maybeSingle(),
        supabase
          .from('client_conditions')
          .select('*')
          .eq('client_id', clientId)
          .eq('status', 'active'),
        supabase
          .from('visit_entries')
          .select('selected_symptom_ids, vitals, health_risk_score, risk_level, created_at')
          .eq('client_id', clientId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      const baseline = baselineResult.data
        ? dbClientBaselineToClientBaseline(baselineResult.data)
        : null

      const conditions = (conditionsResult.data || []).map(dbClientConditionToClientCondition)

      const recentEntries: RecentEntryForTrend[] = (recentResult.data || []).map((r) => {
        const v = r.vitals as Record<string, number | undefined>
        return {
          selectedSymptomIds: r.selected_symptom_ids || [],
          vitals: {
            temperature: v?.temperature,
            pulse: v?.pulse,
            systolicBp: v?.systolic_bp ?? v?.systolicBp,
            diastolicBp: v?.diastolic_bp ?? v?.diastolicBp,
            oxygenSaturation: v?.oxygen_saturation ?? v?.oxygenSaturation,
            respiratoryRate: v?.respiratory_rate ?? v?.respiratoryRate,
          },
          healthRiskScore: r.health_risk_score ?? null,
          riskLevel: r.risk_level as RiskLevel,
          createdAt: r.created_at,
        }
      })

      // Run scoring engine
      const engineResult = runScoringEngine(
        selectedSymptomIds,
        vitals,
        baseline,
        conditions,
        recentEntries
      )

      const { data, error } = await supabase
        .from('visit_entries')
        .insert({
          client_id: clientId,
          carer_id: carerId,
          agency_id: agencyId,
          selected_symptom_ids: selectedSymptomIds,
          vitals: vitalsToDb(vitals),
          note,
          score: engineResult.score,
          risk_level: engineResult.riskLevel,
          reasons: engineResult.reasons,
          health_risk_score: engineResult.finalHealthRiskScore,
          risk_band_label: engineResult.riskBandLabel,
          clinical_warning_score: engineResult.clinicalWarningScore,
          clinical_warning_band: engineResult.clinicalWarningBand,
          clinical_warning_partial: engineResult.clinicalWarningPartial,
          single_red_parameter: engineResult.singleRedParameter,
          scoring_engine_version: SCORING_ENGINE_VERSION,
        })
        .select()
        .single()

      if (error) throw error

      const newEntry = dbVisitEntryToVisitEntry(data as DbVisitEntry)
      setVisitEntries((prev) => [newEntry, ...prev])

      // Save score breakdown
      await supabase.from('visit_score_breakdowns').insert({
        visit_entry_id: newEntry.id,
        client_id: clientId,
        agency_id: agencyId,
        base_symptom_score: engineResult.baseSymptomScore,
        vital_sign_score: engineResult.vitalSignScore,
        baseline_change_score: engineResult.baselineChangeScore,
        condition_adjustment_score: engineResult.conditionAdjustmentScore,
        trend_score: engineResult.trendScore,
        high_risk_combination_score: engineResult.highRiskCombinationScore,
        final_health_risk_score: engineResult.finalHealthRiskScore,
        final_risk_level: engineResult.finalRiskLevel,
        risk_band_label: engineResult.riskBandLabel,
        category_scores: engineResult.categoryScores,
        score_reasons: engineResult.reasons,
        baseline_change_reasons: engineResult.baselineChangeReasons,
        condition_adjustment_reasons: engineResult.conditionAdjustmentReasons,
        trend_reasons: engineResult.trendReasons,
        combination_reasons: engineResult.combinationReasons,
        explanation_text: engineResult.explanationText,
        suggested_attention_level: engineResult.suggestedAttentionLevel,
        clinical_warning_score: engineResult.clinicalWarningScore,
        clinical_warning_band: engineResult.clinicalWarningBand,
        clinical_warning_partial: engineResult.clinicalWarningPartial,
        single_red_parameter: engineResult.singleRedParameter,
        clinical_parameter_breakdown: engineResult.clinicalParameterBreakdown,
        scoring_engine_version: SCORING_ENGINE_VERSION,
      })

      // Alert is auto-created by DB trigger, so refresh alerts
      if (engineResult.riskLevel === 'amber' || engineResult.riskLevel === 'red') {
        const { data: alertRows } = await supabase
          .from('alerts')
          .select('*')
          .eq('visit_entry_id', newEntry.id)
          .single()

        if (alertRows) {
          const newAlert = dbAlertToAlert(alertRows as DbAlert)
          setAlerts((prev) => [newAlert, ...prev])
        }
      }

      // Attach engine result to the entry for immediate display on result screen
      ;(newEntry as VisitEntry & { _engineResult: typeof engineResult })._engineResult = engineResult

      return newEntry
    },
    []
  )

  const addCorrectionNote = useCallback(
    async (visitEntryId: string, carerId: string, text: string): Promise<void> => {
      const { data, error } = await supabase
        .from('correction_notes')
        .insert({
          visit_entry_id: visitEntryId,
          carer_id: carerId,
          text,
        })
        .select()
        .single()

      if (error) throw error

      const newNote: CorrectionNote = dbCorrectionNoteToCorrectionNote(data as DbCorrectionNote)

      setVisitEntries((prev) =>
        prev.map((v) =>
          v.id === visitEntryId
            ? { ...v, correctionNotes: [...(v.correctionNotes || []), newNote] }
            : v
        )
      )
    },
    []
  )

  const getVisitEntriesForClient = useCallback(
    (clientId: string) =>
      visitEntries
        .filter((v) => v.clientId === clientId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [visitEntries]
  )

  const getVisitEntryById = useCallback(
    (id: string) => visitEntries.find((v) => v.id === id),
    [visitEntries]
  )

  // Alert actions
  const getAlertsByFilter = useCallback(
    (filter: 'unreviewed' | 'reviewed' | 'amber' | 'red' | 'all', agencyId: string) => {
      const agencyAlerts = alerts
        .filter((a) => a.agencyId === agencyId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      switch (filter) {
        case 'unreviewed':
          return agencyAlerts.filter((a) => !a.isReviewed)
        case 'reviewed':
          return agencyAlerts.filter((a) => a.isReviewed)
        case 'amber':
          return agencyAlerts.filter((a) => a.riskLevel === 'amber')
        case 'red':
          return agencyAlerts.filter((a) => a.riskLevel === 'red')
        case 'all':
        default:
          return agencyAlerts
      }
    },
    [alerts]
  )

  const reviewAlert = useCallback(
    async (
      alertId: string,
      managerId: string,
      actionTaken: AlertActionTaken,
      note?: string
    ): Promise<void> => {
      const { error } = await supabase
        .from('alerts')
        .update({
          is_reviewed: true,
          reviewed_by: managerId,
          reviewed_at: new Date().toISOString(),
          action_taken: actionTaken,
          manager_note: note || null,
        })
        .eq('id', alertId)

      if (error) throw error

      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? {
                ...a,
                isReviewed: true,
                reviewedBy: managerId,
                reviewedAt: new Date().toISOString(),
                actionTaken,
                managerNote: note,
              }
            : a
        )
      )
    },
    []
  )

  const getAlertById = useCallback(
    (id: string) => alerts.find((a) => a.id === id),
    [alerts]
  )

  const getUnreviewedCount = useCallback(
    (agencyId: string) =>
      alerts.filter((a) => a.agencyId === agencyId && !a.isReviewed).length,
    [alerts]
  )

  const refreshData = useCallback(async () => {
    await loadData()
  }, [loadData])

  // ─── v2: Baseline actions ─────────────────────────────────────────────────

  const fetchClientBaseline = useCallback(
    async (clientId: string): Promise<{ current: ClientBaseline | null; history: ClientBaseline[] }> => {
      const { data } = await supabase
        .from('client_baselines')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (!data) return { current: null, history: [] }
      const all = data.map(dbClientBaselineToClientBaseline)
      return {
        current: all.find((b) => b.isCurrent) ?? null,
        history: all.filter((b) => !b.isCurrent),
      }
    },
    []
  )

  const saveClientBaseline = useCallback(
    async (clientId: string, formData: Partial<ClientBaseline>, updateReason?: string): Promise<ClientBaseline> => {
      const agencyId = agency?.id || user?.agencyId
      if (!agencyId || !user) throw new Error('No agency or user')

      // Mark existing current baseline as not current
      await supabase
        .from('client_baselines')
        .update({ is_current: false })
        .eq('client_id', clientId)
        .eq('is_current', true)

      const { data, error } = await supabase
        .from('client_baselines')
        .insert({
          client_id: clientId,
          agency_id: agencyId,
          is_current: true,
          date_of_birth: formData.dateOfBirth || null,
          age_group: formData.ageGroup || null,
          usual_mobility_level: formData.usualMobilityLevel || null,
          usual_appetite: formData.usualAppetite || null,
          usual_fluid_intake: formData.usualFluidIntake || null,
          usual_communication_level: formData.usualCommunicationLevel || null,
          usual_cognition_level: formData.usualCognitionLevel || null,
          usual_mood_behaviour: formData.usualMoodBehaviour || null,
          usual_continence_pattern: formData.usualContinencePattern || null,
          usual_gait_pattern: formData.usualGaitPattern || null,
          usual_oxygen_saturation: formData.usualOxygenSaturation || null,
          usual_blood_pressure_range: formData.usualBloodPressureRange || null,
          usual_pulse_range: formData.usualPulseRange || null,
          falls_history: formData.fallsHistory || null,
          medication_support_needs: formData.medicationSupportNeeds || null,
          swallowing_difficulty: formData.swallowingDifficulty ?? false,
          catheter_use: formData.catheterUse ?? false,
          pressure_sore_risk: formData.pressureSoreRisk ?? false,
          palliative_or_end_of_life_status: formData.palliativeOrEndOfLifeStatus ?? false,
          baseline_notes: formData.baselineNotes || null,
          created_by: user.id,
          updated_by: user.id,
          update_reason: updateReason || null,
        })
        .select()
        .single()

      if (error) throw error
      return dbClientBaselineToClientBaseline(data)
    },
    [agency, user]
  )

  // ─── v2: Condition actions ────────────────────────────────────────────────

  const fetchClientConditions = useCallback(
    async (clientId: string): Promise<ClientCondition[]> => {
      const { data } = await supabase
        .from('client_conditions')
        .select('*')
        .eq('client_id', clientId)
        .order('added_at', { ascending: false })

      return (data || []).map(dbClientConditionToClientCondition)
    },
    []
  )

  const addClientCondition = useCallback(
    async (
      clientId: string,
      conditionData: Omit<ClientCondition, 'id' | 'clientId' | 'agencyId' | 'addedBy' | 'addedAt' | 'updatedAt'>
    ): Promise<ClientCondition> => {
      const agencyId = agency?.id || user?.agencyId
      if (!agencyId || !user) throw new Error('No agency or user')

      const { data, error } = await supabase
        .from('client_conditions')
        .insert({
          client_id: clientId,
          agency_id: agencyId,
          condition_name: conditionData.conditionName,
          severity: conditionData.severity,
          notes: conditionData.notes || null,
          status: 'active',
          added_by: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return dbClientConditionToClientCondition(data)
    },
    [agency, user]
  )

  const updateClientCondition = useCallback(
    async (conditionId: string, updates: Partial<Pick<ClientCondition, 'severity' | 'notes' | 'status'>>): Promise<void> => {
      const { error } = await supabase
        .from('client_conditions')
        .update({
          severity: updates.severity,
          notes: updates.notes,
          status: updates.status,
        })
        .eq('id', conditionId)

      if (error) throw error
    },
    []
  )

  // ─── v2: Score breakdown ──────────────────────────────────────────────────

  const fetchScoreBreakdown = useCallback(
    async (visitEntryId: string): Promise<ScoreBreakdown | null> => {
      const { data } = await supabase
        .from('visit_score_breakdowns')
        .select('*')
        .eq('visit_entry_id', visitEntryId)
        .maybeSingle()

      return data ? dbVisitScoreBreakdownToScoreBreakdown(data) : null
    },
    []
  )

  // ─── v2: Alert outcomes ───────────────────────────────────────────────────

  const fetchAlertOutcome = useCallback(
    async (alertId: string): Promise<AlertOutcome | null> => {
      const { data } = await supabase
        .from('alert_outcomes')
        .select('*')
        .eq('alert_id', alertId)
        .maybeSingle()

      return data ? dbAlertOutcomeToAlertOutcome(data) : null
    },
    []
  )

  const saveAlertOutcome = useCallback(
    async (
      alertId: string,
      visitEntryId: string,
      clientId: string,
      outcome: AlertOutcomeValue | undefined,
      wasAlertUseful: AlertUsefulnessFeedback | undefined,
      followUpRequired: boolean,
      followUpDate: string | undefined,
      outcomeNotes: string | undefined
    ): Promise<void> => {
      const agencyId = agency?.id || user?.agencyId
      if (!agencyId || !user) throw new Error('No agency or user')

      // Upsert outcome (one per alert)
      await supabase.from('alert_outcomes').upsert(
        {
          alert_id: alertId,
          visit_entry_id: visitEntryId,
          client_id: clientId,
          agency_id: agencyId,
          reviewed_by: user.id,
          outcome: outcome || null,
          was_alert_useful: wasAlertUseful || null,
          follow_up_required: followUpRequired,
          follow_up_date: followUpDate || null,
          outcome_notes: outcomeNotes || null,
        },
        { onConflict: 'alert_id' }
      )
    },
    [agency, user]
  )

  const value: AppContextType = {
    clients,
    carers,
    visitEntries,
    alerts,
    isLoading,
    addClient,
    updateClientStatus,
    assignCarerToClient,
    unassignCarerFromClient,
    getClientById,
    getClientsForCarer,
    addCarer,
    resendInvite,
    deactivateCarer,
    getCarerById,
    getActiveCarers,
    createVisitEntry,
    addCorrectionNote,
    getVisitEntriesForClient,
    getVisitEntryById,
    getAlertsByFilter,
    reviewAlert,
    getAlertById,
    getUnreviewedCount,
    refreshData,
    fetchClientBaseline,
    saveClientBaseline,
    fetchClientConditions,
    addClientCondition,
    updateClientCondition,
    fetchScoreBreakdown,
    fetchAlertOutcome,
    saveAlertOutcome,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
