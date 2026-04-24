// Converters: DB row (snake_case) → Frontend type (camelCase)

import type {
  Agency,
  AgencyWithStats,
  PlatformAdmin,
  User,
  Manager,
  Carer,
  Client,
  VisitEntry,
  CorrectionNote,
  Alert,
  ActivityLogEntry,
  Vitals,
} from '@/types'
import type {
  DbAgencyStats,
  DbPlatformAdmin,
  DbUser,
  DbClient,
  DbVisitEntry,
  DbCorrectionNote,
  DbAlert,
  DbActivityLog,
  DbAgency,
} from './database.types'

export function dbAgencyToAgency(row: DbAgency): Agency {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    managerId: '', // Will be set separately if needed
  }
}

export function dbAgencyStatsToAgencyWithStats(row: DbAgencyStats): AgencyWithStats {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    managerId: row.manager_id || '',
    status: row.status,
    contactEmail: row.contact_email || '',
    contactName: row.contact_name || '',
    contactPhone: row.contact_phone || '',
    contactPosition: row.contact_position || '',
    addressLine1: row.address_line1 || '',
    countryUk: row.country_uk || '',
    region: row.region || '',
    council: row.council || '',
    postcode: row.postcode || '',
    totalCarers: Number(row.total_carers) || 0,
    activeCarers: Number(row.active_carers) || 0,
    totalClients: Number(row.total_clients) || 0,
    activeClients: Number(row.active_clients) || 0,
    totalAlerts: Number(row.total_alerts) || 0,
    unreviewedAlerts: Number(row.unreviewed_alerts) || 0,
    lastActivityAt: row.last_activity_at || undefined,
    notes: row.notes || undefined,
    rejectionReason: row.rejection_reason || undefined,
  }
}

export function dbPlatformAdminToPlatformAdmin(row: DbPlatformAdmin): PlatformAdmin {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: 'admin',
    adminRole: row.admin_role,
    status: row.status,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at || undefined,
    deactivatedAt: row.deactivated_at || undefined,
    deactivationReason: row.deactivation_reason || undefined,
  }
}

export function dbUserToUser(row: DbUser): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    status: row.status,
    agencyId: row.agency_id,
    createdAt: row.created_at,
  }
}

export function dbUserToManager(row: DbUser): Manager {
  return {
    ...dbUserToUser(row),
    role: 'manager' as const,
  }
}

export function dbUserToCarer(row: DbUser, assignedClientIds: string[]): Carer {
  return {
    ...dbUserToUser(row),
    role: 'carer' as const,
    assignedClientIds,
    deactivationReason: row.deactivation_reason || undefined,
    deactivatedAt: row.deactivated_at || undefined,
  }
}

export function dbClientToClient(row: DbClient): Client {
  return {
    id: row.id,
    displayName: row.display_name,
    internalReference: row.internal_reference || undefined,
    agencyId: row.agency_id,
    status: row.status,
    deactivationReason: row.deactivation_reason || undefined,
    deactivationNote: row.deactivation_note || undefined,
    deactivatedAt: row.deactivated_at || undefined,
    createdAt: row.created_at,
  }
}

export function dbVisitEntryToVisitEntry(
  row: DbVisitEntry,
  correctionNotes?: CorrectionNote[]
): VisitEntry {
  const vitals: Vitals = {}
  if (row.vitals) {
    const v = row.vitals as Record<string, number | undefined>
    vitals.temperature = v.temperature
    vitals.pulse = v.pulse
    vitals.systolicBp = v.systolic_bp ?? v.systolicBp
    vitals.diastolicBp = v.diastolic_bp ?? v.diastolicBp
    vitals.oxygenSaturation = v.oxygen_saturation ?? v.oxygenSaturation
    vitals.respiratoryRate = v.respiratory_rate ?? v.respiratoryRate
  }

  return {
    id: row.id,
    clientId: row.client_id,
    carerId: row.carer_id,
    agencyId: row.agency_id,
    selectedSymptomIds: row.selected_symptom_ids || [],
    vitals,
    note: row.note,
    score: row.score,
    riskLevel: row.risk_level,
    reasons: row.reasons || [],
    createdAt: row.created_at,
    correctionNotes,
  }
}

export function dbCorrectionNoteToCorrectionNote(row: DbCorrectionNote): CorrectionNote {
  return {
    id: row.id,
    text: row.text,
    carerId: row.carer_id,
    createdAt: row.created_at,
  }
}

export function dbAlertToAlert(row: DbAlert): Alert {
  return {
    id: row.id,
    visitEntryId: row.visit_entry_id,
    clientId: row.client_id,
    carerId: row.carer_id,
    agencyId: row.agency_id,
    riskLevel: row.risk_level,
    isReviewed: row.is_reviewed,
    reviewedBy: row.reviewed_by || undefined,
    reviewedAt: row.reviewed_at || undefined,
    actionTaken: row.action_taken || undefined,
    managerNote: row.manager_note || undefined,
    createdAt: row.created_at,
  }
}

export function dbActivityLogToActivityLogEntry(row: DbActivityLog): ActivityLogEntry {
  return {
    id: row.id,
    eventType: row.event_type as ActivityLogEntry['eventType'],
    agencyId: row.agency_id || undefined,
    agencyName: row.agency_name || undefined,
    entityId: row.entity_id || undefined,
    entityName: row.entity_name || undefined,
    performedBy: row.performed_by,
    performedByName: row.performed_by_name,
    reason: row.reason || undefined,
    timestamp: row.timestamp,
  }
}

// Helper: convert frontend Vitals to DB format (snake_case for JSONB)
export function vitalsToDb(vitals: Vitals): Record<string, number | undefined> {
  return {
    temperature: vitals.temperature,
    pulse: vitals.pulse,
    systolic_bp: vitals.systolicBp,
    diastolic_bp: vitals.diastolicBp,
    oxygen_saturation: vitals.oxygenSaturation,
    respiratory_rate: vitals.respiratoryRate,
  }
}

// ─── v2 Converters ────────────────────────────────────────────────────────────

import type {
  ClientBaseline,
  ClientCondition,
  ScoreBreakdown,
  AlertOutcome,
  CategoryScores,
  ClinicalParameterBreakdown,
} from '@/types'
import type {
  DbClientBaseline,
  DbClientCondition,
  DbVisitScoreBreakdown,
  DbAlertOutcome,
} from './database.types'

export function dbClientBaselineToClientBaseline(row: DbClientBaseline): ClientBaseline {
  return {
    id: row.id,
    clientId: row.client_id,
    agencyId: row.agency_id,
    isCurrent: row.is_current,
    dateOfBirth: row.date_of_birth || undefined,
    ageGroup: row.age_group || undefined,
    usualMobilityLevel: row.usual_mobility_level || undefined,
    usualAppetite: row.usual_appetite || undefined,
    usualFluidIntake: row.usual_fluid_intake || undefined,
    usualCommunicationLevel: row.usual_communication_level || undefined,
    usualCognitionLevel: row.usual_cognition_level || undefined,
    usualMoodBehaviour: row.usual_mood_behaviour || undefined,
    usualContinencePattern: row.usual_continence_pattern || undefined,
    usualGaitPattern: row.usual_gait_pattern || undefined,
    usualOxygenSaturation: row.usual_oxygen_saturation || undefined,
    usualBloodPressureRange: row.usual_blood_pressure_range || undefined,
    usualPulseRange: row.usual_pulse_range || undefined,
    fallsHistory: row.falls_history || undefined,
    medicationSupportNeeds: row.medication_support_needs || undefined,
    swallowingDifficulty: row.swallowing_difficulty,
    catheterUse: row.catheter_use,
    pressureSoreRisk: row.pressure_sore_risk,
    palliativeOrEndOfLifeStatus: row.palliative_or_end_of_life_status,
    baselineNotes: row.baseline_notes || undefined,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedBy: row.updated_by || undefined,
    updatedAt: row.updated_at,
    updateReason: row.update_reason || undefined,
  }
}

export function dbClientConditionToClientCondition(row: DbClientCondition): ClientCondition {
  return {
    id: row.id,
    clientId: row.client_id,
    agencyId: row.agency_id,
    conditionName: row.condition_name,
    severity: row.severity as ClientCondition['severity'],
    notes: row.notes || undefined,
    status: row.status as ClientCondition['status'],
    addedBy: row.added_by,
    addedAt: row.added_at,
    updatedAt: row.updated_at,
  }
}

export function dbVisitScoreBreakdownToScoreBreakdown(row: DbVisitScoreBreakdown): ScoreBreakdown {
  return {
    id: row.id,
    visitEntryId: row.visit_entry_id,
    clientId: row.client_id,
    agencyId: row.agency_id,
    baseSymptomScore: row.base_symptom_score,
    vitalSignScore: row.vital_sign_score,
    baselineChangeScore: row.baseline_change_score,
    conditionAdjustmentScore: row.condition_adjustment_score,
    trendScore: row.trend_score,
    highRiskCombinationScore: row.high_risk_combination_score,
    finalHealthRiskScore: row.final_health_risk_score,
    finalRiskLevel: row.final_risk_level as import('@/types').RiskLevel,
    riskBandLabel: row.risk_band_label,
    categoryScores: row.category_scores as unknown as CategoryScores,
    scoreReasons: row.score_reasons || [],
    baselineChangeReasons: row.baseline_change_reasons || [],
    conditionAdjustmentReasons: row.condition_adjustment_reasons || [],
    trendReasons: row.trend_reasons || [],
    combinationReasons: row.combination_reasons || [],
    explanationText: row.explanation_text || undefined,
    suggestedAttentionLevel: row.suggested_attention_level || undefined,
    clinicalWarningScore: row.clinical_warning_score,
    clinicalWarningBand: row.clinical_warning_band,
    clinicalWarningPartial: row.clinical_warning_partial,
    singleRedParameter: row.single_red_parameter,
    clinicalParameterBreakdown: row.clinical_parameter_breakdown as ClinicalParameterBreakdown,
    scoringEngineVersion: row.scoring_engine_version,
    createdAt: row.created_at,
  }
}

export function dbAlertOutcomeToAlertOutcome(row: DbAlertOutcome): AlertOutcome {
  return {
    id: row.id,
    alertId: row.alert_id,
    visitEntryId: row.visit_entry_id,
    clientId: row.client_id,
    agencyId: row.agency_id,
    reviewedBy: row.reviewed_by,
    outcome: row.outcome as AlertOutcome['outcome'],
    wasAlertUseful: row.was_alert_useful as AlertOutcome['wasAlertUseful'],
    followUpRequired: row.follow_up_required,
    followUpDate: row.follow_up_date || undefined,
    outcomeNotes: row.outcome_notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
