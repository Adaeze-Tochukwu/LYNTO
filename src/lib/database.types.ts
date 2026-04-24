// Database row types matching the Supabase schema (snake_case)

export interface DbAgency {
  id: string
  name: string
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'rejected'
  contact_email: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_position: string | null
  address_line1: string | null
  country_uk: string | null
  region: string | null
  council: string | null
  postcode: string | null
  notes: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface DbPlatformAdmin {
  id: string
  email: string
  full_name: string
  admin_role: 'primary_admin' | 'admin' | 'readonly_admin'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  last_login_at: string | null
  deactivated_at: string | null
  deactivation_reason: string | null
  created_at: string
  updated_at: string
}

export interface DbUser {
  id: string
  email: string
  full_name: string
  role: 'manager' | 'carer'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  agency_id: string
  deactivation_reason: 'left_organisation' | 'on_long_term_leave' | 'internal_decision' | null
  deactivated_at: string | null
  created_at: string
  updated_at: string
}

export interface DbClient {
  id: string
  display_name: string
  internal_reference: string | null
  agency_id: string
  status: 'active' | 'inactive'
  deactivation_reason: 'moved_to_another_provider' | 'deceased' | 'no_longer_receiving_service' | 'other' | null
  deactivation_note: string | null
  deactivated_at: string | null
  created_at: string
  updated_at: string
}

export interface DbCarerClientAssignment {
  id: string
  carer_id: string
  client_id: string
  agency_id: string
  created_at: string
}

export interface DbVisitEntry {
  id: string
  client_id: string
  carer_id: string
  agency_id: string
  selected_symptom_ids: string[]
  vitals: Record<string, number | undefined>
  note: string
  score: number
  risk_level: 'green' | 'amber' | 'red'
  reasons: string[]
  health_risk_score: number | null
  risk_band_label: string | null
  clinical_warning_score: number | null
  clinical_warning_band: string | null
  clinical_warning_partial: boolean | null
  single_red_parameter: boolean | null
  scoring_engine_version: string | null
  created_at: string
}

export interface DbCorrectionNote {
  id: string
  visit_entry_id: string
  carer_id: string
  text: string
  created_at: string
}

export interface DbAlert {
  id: string
  visit_entry_id: string
  client_id: string
  carer_id: string
  agency_id: string
  risk_level: 'amber' | 'red'
  is_reviewed: boolean
  reviewed_by: string | null
  reviewed_at: string | null
  action_taken: 'monitor' | 'called_family' | 'informed_gp' | 'community_nurse' | 'emergency_escalation' | null
  manager_note: string | null
  has_clinical_urgency: boolean | null
  created_at: string
}

export interface DbActivityLog {
  id: string
  event_type: string
  agency_id: string | null
  agency_name: string | null
  entity_id: string | null
  entity_name: string | null
  performed_by: string
  performed_by_name: string
  reason: string | null
  timestamp: string
}

// Agency stats view row
export interface DbAgencyStats {
  id: string
  name: string
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'rejected'
  contact_email: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_position: string | null
  address_line1: string | null
  country_uk: string | null
  region: string | null
  council: string | null
  postcode: string | null
  notes: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  manager_id: string | null
  total_carers: number
  active_carers: number
  total_clients: number
  active_clients: number
  total_alerts: number
  unreviewed_alerts: number
  last_activity_at: string | null
}

// v2 New table types
export interface DbClientBaseline {
  id: string
  client_id: string
  agency_id: string
  is_current: boolean
  date_of_birth: string | null
  age_group: string | null
  usual_mobility_level: string | null
  usual_appetite: string | null
  usual_fluid_intake: string | null
  usual_communication_level: string | null
  usual_cognition_level: string | null
  usual_mood_behaviour: string | null
  usual_continence_pattern: string | null
  usual_gait_pattern: string | null
  usual_oxygen_saturation: string | null
  usual_blood_pressure_range: string | null
  usual_pulse_range: string | null
  falls_history: string | null
  medication_support_needs: string | null
  swallowing_difficulty: boolean
  catheter_use: boolean
  pressure_sore_risk: boolean
  palliative_or_end_of_life_status: boolean
  baseline_notes: string | null
  created_by: string
  created_at: string
  updated_by: string | null
  updated_at: string
  update_reason: string | null
}

export interface DbClientCondition {
  id: string
  client_id: string
  agency_id: string
  condition_name: string
  severity: string
  notes: string | null
  status: string
  added_by: string
  added_at: string
  updated_at: string
}

export interface DbVisitScoreBreakdown {
  id: string
  visit_entry_id: string
  client_id: string
  agency_id: string
  base_symptom_score: number
  vital_sign_score: number
  baseline_change_score: number
  condition_adjustment_score: number
  trend_score: number
  high_risk_combination_score: number
  final_health_risk_score: number
  final_risk_level: string
  risk_band_label: string
  category_scores: Record<string, number>
  score_reasons: string[]
  baseline_change_reasons: string[]
  condition_adjustment_reasons: string[]
  trend_reasons: string[]
  combination_reasons: string[]
  explanation_text: string | null
  suggested_attention_level: string | null
  clinical_warning_score: number
  clinical_warning_band: string
  clinical_warning_partial: boolean
  single_red_parameter: boolean
  clinical_parameter_breakdown: Record<string, number>
  scoring_engine_version: string
  created_at: string
}

export interface DbAlertOutcome {
  id: string
  alert_id: string
  visit_entry_id: string
  client_id: string
  agency_id: string
  reviewed_by: string
  outcome: string | null
  was_alert_useful: string | null
  follow_up_required: boolean
  follow_up_date: string | null
  outcome_notes: string | null
  created_at: string
  updated_at: string
}
