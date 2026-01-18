// User types
export type UserRole = 'manager' | 'carer'
export type UserStatus = 'active' | 'inactive' | 'pending'

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

// Form state for multi-step visit entry
export interface VisitFormState {
  currentStep: number
  selectedSymptoms: Set<string>
  vitals: Vitals
  note: string
}
