// User types
export type UserRole = 'manager' | 'carer' | 'admin'
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'
export type AdminRole = 'primary_admin' | 'admin' | 'readonly_admin'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  status: UserStatus
  agencyId: string
  createdAt: string
}

export interface Manager extends User {
  role: 'manager'
}

export interface Carer extends User {
  role: 'carer'
  assignedClientIds: string[]
  deactivationReason?: CarerDeactivationReason
  deactivatedAt?: string
}

export type CarerDeactivationReason =
  | 'left_organisation'
  | 'on_long_term_leave'
  | 'internal_decision'

// Agency
export interface Agency {
  id: string
  name: string
  createdAt: string
  managerId: string
  contactPhone?: string
  contactPosition?: string
  addressLine1?: string
  countryUk?: string
  region?: string
  council?: string
  postcode?: string
}

// Client
export type ClientStatus = 'active' | 'inactive'

export type ClientDeactivationReason =
  | 'moved_to_another_provider'
  | 'deceased'
  | 'no_longer_receiving_service'
  | 'other'

export interface Client {
  id: string
  displayName: string
  internalReference?: string
  agencyId: string
  status: ClientStatus
  deactivationReason?: ClientDeactivationReason
  deactivationNote?: string
  deactivatedAt?: string
  createdAt: string
}

// Symptoms - organized by category
export interface SymptomCategory {
  id: string
  name: string
  symptoms: Symptom[]
}

export interface Symptom {
  id: string
  label: string
  points: number
}

// Vitals
export interface Vitals {
  temperature?: number
  pulse?: number
  systolicBp?: number
  diastolicBp?: number
  oxygenSaturation?: number
  respiratoryRate?: number
}

// Risk levels
export type RiskLevel = 'green' | 'amber' | 'red'

// Visit Entry
export interface VisitEntry {
  id: string
  clientId: string
  carerId: string
  agencyId: string
  selectedSymptomIds: string[]
  vitals: Vitals
  note: string
  score: number
  riskLevel: RiskLevel
  reasons: string[]
  createdAt: string
  correctionNotes?: CorrectionNote[]
}

export interface CorrectionNote {
  id: string
  text: string
  carerId: string
  createdAt: string
}

// Alert
export type AlertActionTaken =
  | 'monitor'
  | 'called_family'
  | 'informed_gp'
  | 'community_nurse'
  | 'emergency_escalation'

export interface Alert {
  id: string
  visitEntryId: string
  clientId: string
  carerId: string
  agencyId: string
  riskLevel: 'amber' | 'red'
  isReviewed: boolean
  reviewedBy?: string
  reviewedAt?: string
  actionTaken?: AlertActionTaken
  managerNote?: string
  createdAt: string
}

// Filter types for alerts dashboard
export type AlertFilter = 'unreviewed' | 'reviewed' | 'amber' | 'red' | 'all'

// ============================================================
// v2: Baseline, Conditions, Score Breakdown, Outcomes
// ============================================================

// Client Baseline
export interface ClientBaseline {
  id: string
  clientId: string
  agencyId: string
  isCurrent: boolean

  dateOfBirth?: string
  ageGroup?: string

  usualMobilityLevel?: string
  usualAppetite?: string
  usualFluidIntake?: string
  usualCommunicationLevel?: string
  usualCognitionLevel?: string
  usualMoodBehaviour?: string
  usualContinencePattern?: string
  usualGaitPattern?: string

  usualOxygenSaturation?: string
  usualBloodPressureRange?: string
  usualPulseRange?: string

  fallsHistory?: string
  medicationSupportNeeds?: string
  swallowingDifficulty: boolean
  catheterUse: boolean
  pressureSoreRisk: boolean
  palliativeOrEndOfLifeStatus: boolean

  baselineNotes?: string

  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt: string
  updateReason?: string
}

// Client Condition
export interface ClientCondition {
  id: string
  clientId: string
  agencyId: string
  conditionName: string
  severity: 'mild' | 'moderate' | 'severe' | 'unknown'
  notes?: string
  status: 'active' | 'inactive'
  addedBy: string
  addedAt: string
  updatedAt: string
}

// Score Breakdown Category Scores
export interface CategoryScores {
  generalCondition: number
  nutritionHydration: number
  mobilityFalls: number
  breathingCirculation: number
  painDiscomfort: number
  infection: number
  toiletingContinence: number
  mentalWellbeing: number
  vitalSigns: number
}

// Clinical Warning Parameter Breakdown
export interface ClinicalParameterBreakdown {
  respiratoryRate?: number
  oxygenSaturation?: number
  temperature?: number
  systolicBp?: number
  pulse?: number
  confusion?: number
}

// Full Score Breakdown (stored per visit entry)
export interface ScoreBreakdown {
  id: string
  visitEntryId: string
  clientId: string
  agencyId: string

  baseSymptomScore: number
  vitalSignScore: number
  baselineChangeScore: number
  conditionAdjustmentScore: number
  trendScore: number
  highRiskCombinationScore: number

  finalHealthRiskScore: number
  finalRiskLevel: RiskLevel
  riskBandLabel: string

  categoryScores: CategoryScores
  scoreReasons: string[]
  baselineChangeReasons: string[]
  conditionAdjustmentReasons: string[]
  trendReasons: string[]
  combinationReasons: string[]

  explanationText?: string
  suggestedAttentionLevel?: string

  clinicalWarningScore: number
  clinicalWarningBand: string
  clinicalWarningPartial: boolean
  singleRedParameter: boolean
  clinicalParameterBreakdown: ClinicalParameterBreakdown

  scoringEngineVersion: string
  createdAt: string
}

// Alert Outcome
export type AlertOutcomeValue =
  | 'no_further_action'
  | 'continue_monitoring'
  | 'family_contacted'
  | 'gp_contacted'
  | 'community_nurse_contacted'
  | '111_contacted'
  | '999_emergency'
  | 'hospital_admission'
  | 'medication_issue'
  | 'suspected_uti'
  | 'suspected_infection'
  | 'fall_confirmed'
  | 'care_plan_updated'
  | 'baseline_updated'
  | 'other'

export type AlertUsefulnessFeedback =
  | 'yes_correct_concern'
  | 'partly_useful'
  | 'no_false_alarm'
  | 'needs_monitoring'
  | 'unsure'

export interface AlertOutcome {
  id: string
  alertId: string
  visitEntryId: string
  clientId: string
  agencyId: string
  reviewedBy: string
  outcome?: AlertOutcomeValue
  wasAlertUseful?: AlertUsefulnessFeedback
  followUpRequired: boolean
  followUpDate?: string
  outcomeNotes?: string
  createdAt: string
  updatedAt: string
}

// Extended Alert type with clinical urgency
export interface AlertWithUrgency extends Alert {
  hasClinicalUrgency?: boolean
}

// Extended VisitEntry with new scoring fields
export interface VisitEntryExtended extends VisitEntry {
  healthRiskScore?: number
  riskBandLabel?: string
  clinicalWarningScore?: number
  clinicalWarningBand?: string
  clinicalWarningPartial?: boolean
  singleRedParameter?: boolean
  scoringEngineVersion?: string
}

// Scoring engine result (returned by scoringEngine.ts)
export interface ScoringEngineResult {
  // Legacy fields (backward compat)
  score: number
  riskLevel: RiskLevel
  reasons: string[]

  // Component scores
  baseSymptomScore: number
  vitalSignScore: number
  baselineChangeScore: number
  conditionAdjustmentScore: number
  trendScore: number
  highRiskCombinationScore: number

  // Final
  finalHealthRiskScore: number
  finalRiskLevel: RiskLevel
  riskBandLabel: string

  // Reasons by type
  baselineChangeReasons: string[]
  conditionAdjustmentReasons: string[]
  trendReasons: string[]
  combinationReasons: string[]

  // Explanation
  explanationText: string
  suggestedAttentionLevel: string

  // Category scores
  categoryScores: CategoryScores

  // Clinical warning
  clinicalWarningScore: number
  clinicalWarningBand: string
  clinicalWarningPartial: boolean
  singleRedParameter: boolean
  clinicalParameterBreakdown: ClinicalParameterBreakdown
}

// Form state for multi-step visit entry
export interface VisitFormState {
  currentStep: number
  selectedSymptoms: Set<string>
  vitals: Vitals
  note: string
}

// Platform Admin types
export interface PlatformAdmin {
  id: string
  email: string
  fullName: string
  role: 'admin'
  adminRole: AdminRole
  status: UserStatus
  createdAt: string
  lastLoginAt?: string
  deactivatedAt?: string
  deactivationReason?: string
}

// Agency status for admin view
export type AgencyStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'rejected'

// Extended Agency for admin view
export interface AgencyWithStats extends Agency {
  status: AgencyStatus
  contactEmail: string
  contactName: string
  contactPhone: string
  contactPosition: string
  addressLine1: string
  countryUk: string
  region: string
  council: string
  postcode: string
  totalCarers: number
  activeCarers: number
  totalClients: number
  activeClients: number
  totalAlerts: number
  unreviewedAlerts: number
  lastActivityAt?: string
  notes?: string
  rejectionReason?: string
}

// Activity log types
export type ActivityEventType =
  | 'agency_created'
  | 'agency_status_changed'
  | 'carer_created'
  | 'carer_deactivated'
  | 'carer_reactivated'
  | 'client_created'
  | 'client_deactivated'
  | 'client_reactivated'
  | 'admin_created'
  | 'admin_deactivated'
  | 'admin_reactivated'
  | 'admin_login'
  | 'admin_logout'

export interface ActivityLogEntry {
  id: string
  eventType: ActivityEventType
  agencyId?: string
  agencyName?: string
  entityId?: string
  entityName?: string
  performedBy: string
  performedByName: string
  reason?: string
  timestamp: string
}
