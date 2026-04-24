/**
 * LYNTO Baseline Change Engine™ + LYNTO Clinical Warning Score™
 * v2_baseline_plus_clinical_warning
 *
 * Transparent rule-based scoring. Every score has an explicit reason.
 * This system supports observation and escalation decisions.
 * It does not diagnose conditions or replace professional clinical judgement.
 */

import { symptomCategories, getSymptomById } from '@/data/symptoms'
import type {
  Vitals,
  RiskLevel,
  ClientBaseline,
  ClientCondition,
  ScoringEngineResult,
  CategoryScores,
  ClinicalParameterBreakdown,
} from '@/types'

export const SCORING_ENGINE_VERSION = 'v2_baseline_plus_clinical_warning'

// Recent entry data needed for trend detection
export interface RecentEntryForTrend {
  selectedSymptomIds: string[]
  vitals: Vitals
  healthRiskScore: number | null
  riskLevel: RiskLevel
  createdAt: string
}

// ─── Band helpers ──────────────────────────────────────────────────────────────

export function getRiskBandLabel(score: number): string {
  if (score >= 75) return 'Red / Urgent escalation'
  if (score >= 50) return 'Amber High / Manager review needed'
  if (score >= 25) return 'Amber Low / Monitor closely'
  return 'Green / Stable'
}

export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 75) return 'red'
  if (score >= 25) return 'amber'
  return 'green'
}

export function getAmberSubLabel(score: number): string {
  if (score >= 50 && score < 75) return 'Amber High'
  if (score >= 25 && score < 50) return 'Amber Low'
  return ''
}

export function getClinicalWarningBand(score: number): string {
  if (score >= 7) return 'High Concern'
  if (score >= 5) return 'Medium Concern'
  if (score >= 1) return 'Low Concern'
  return 'Normal'
}

export function getSuggestedAttentionLevel(score: number, isPalliative: boolean): string {
  if (isPalliative && score >= 25) return 'Review today'
  if (score >= 75) return 'Urgent escalation'
  if (score >= 50) return 'Consider GP / community nurse contact'
  if (score >= 25) return 'Review today'
  return 'Monitor'
}

// ─── Legacy symptom + vital score (backward compat) ───────────────────────────

function calcLegacyScore(
  selectedSymptomIds: string[],
  vitals: Vitals
): { rawSymptomPoints: number; rawVitalPoints: number; legacyScore: number; reasons: string[] } {
  let rawSymptomPoints = 0
  let rawVitalPoints = 0
  const reasons: string[] = []

  for (const id of selectedSymptomIds) {
    const symptom = getSymptomById(id)
    if (symptom) {
      rawSymptomPoints += symptom.points
      reasons.push(symptom.label)
    }
  }

  if (vitals.temperature !== undefined) {
    if (vitals.temperature >= 38) {
      rawVitalPoints += 2
      reasons.push(`High temperature (${vitals.temperature}°C)`)
    } else if (vitals.temperature < 36) {
      rawVitalPoints += 1
      reasons.push(`Low temperature (${vitals.temperature}°C)`)
    }
  }
  if (vitals.pulse !== undefined) {
    if (vitals.pulse > 100 || vitals.pulse < 50) {
      rawVitalPoints += 1
      reasons.push(`Abnormal pulse (${vitals.pulse} bpm)`)
    }
  }
  if (vitals.oxygenSaturation !== undefined && vitals.oxygenSaturation < 95) {
    rawVitalPoints += 2
    reasons.push(`Low oxygen saturation (${vitals.oxygenSaturation}%)`)
  }
  if (vitals.respiratoryRate !== undefined) {
    if (vitals.respiratoryRate > 20 || vitals.respiratoryRate < 12) {
      rawVitalPoints += 1
      reasons.push(`Abnormal respiratory rate (${vitals.respiratoryRate}/min)`)
    }
  }
  if (vitals.systolicBp !== undefined) {
    if (vitals.systolicBp > 140 || vitals.systolicBp < 90) {
      rawVitalPoints += 1
      reasons.push(`Abnormal blood pressure (${vitals.systolicBp}/${vitals.diastolicBp ?? '?'})`)
    }
  }

  const legacyScore = rawSymptomPoints + rawVitalPoints
  return { rawSymptomPoints, rawVitalPoints, legacyScore, reasons }
}

// ─── Category scores ──────────────────────────────────────────────────────────

function calcCategoryScores(selectedSymptomIds: string[], vitals: Vitals): CategoryScores {
  const catMap: Record<string, keyof CategoryScores> = {
    'general-condition': 'generalCondition',
    'eating-drinking': 'nutritionHydration',
    'mobility-falls': 'mobilityFalls',
    'breathing-circulation': 'breathingCirculation',
    'pain-discomfort': 'painDiscomfort',
    'infection-signs': 'infection',
    'toileting-continence': 'toiletingContinence',
    'mental-wellbeing': 'mentalWellbeing',
  }

  const scores: CategoryScores = {
    generalCondition: 0,
    nutritionHydration: 0,
    mobilityFalls: 0,
    breathingCirculation: 0,
    painDiscomfort: 0,
    infection: 0,
    toiletingContinence: 0,
    mentalWellbeing: 0,
    vitalSigns: 0,
  }

  for (const cat of symptomCategories) {
    const key = catMap[cat.id]
    if (!key) continue
    for (const symptom of cat.symptoms) {
      if (selectedSymptomIds.includes(symptom.id)) {
        scores[key] += symptom.points * 6
      }
    }
    scores[key] = Math.min(scores[key], 35)
  }

  // Vital signs category
  let vitalScore = 0
  if (vitals.temperature !== undefined) {
    if (vitals.temperature >= 38.1) vitalScore += 5
    else if (vitals.temperature <= 35.0) vitalScore += 5
    else if (vitals.temperature <= 36.0) vitalScore += 3
  }
  if (vitals.oxygenSaturation !== undefined) {
    if (vitals.oxygenSaturation <= 91) vitalScore += 8
    else if (vitals.oxygenSaturation <= 93) vitalScore += 5
    else if (vitals.oxygenSaturation <= 95) vitalScore += 3
  }
  if (vitals.pulse !== undefined) {
    if (vitals.pulse <= 40 || vitals.pulse >= 131) vitalScore += 6
    else if (vitals.pulse >= 111) vitalScore += 4
    else if (vitals.pulse > 100 || vitals.pulse < 50) vitalScore += 3
  }
  if (vitals.respiratoryRate !== undefined) {
    if (vitals.respiratoryRate <= 8 || vitals.respiratoryRate >= 25) vitalScore += 6
    else if (vitals.respiratoryRate >= 21) vitalScore += 4
    else if (vitals.respiratoryRate < 12) vitalScore += 3
  }
  if (vitals.systolicBp !== undefined) {
    if (vitals.systolicBp <= 90 || vitals.systolicBp >= 220) vitalScore += 6
    else if (vitals.systolicBp <= 100) vitalScore += 4
    else if (vitals.systolicBp <= 110) vitalScore += 3
    else if (vitals.systolicBp > 140) vitalScore += 3
  }
  scores.vitalSigns = Math.min(vitalScore, 25)

  return scores
}

// ─── Baseline change scoring ──────────────────────────────────────────────────

function calcBaselineChangeScore(
  baseline: ClientBaseline | null,
  selectedSymptomIds: string[],
  vitals: Vitals
): { score: number; reasons: string[] } {
  if (!baseline) return { score: 0, reasons: [] }

  let score = 0
  const reasons: string[] = []

  const has = (id: string) => selectedSymptomIds.includes(id)

  // Cognition
  if (
    (baseline.usualCognitionLevel === 'alert_and_oriented' ||
      baseline.usualCognitionLevel === 'mild_confusion') &&
    (has('gc-2') || has('gc-3'))
  ) {
    score += 5
    reasons.push('New confusion or reduced alertness compared with usual baseline')
  }

  // Appetite
  if (baseline.usualAppetite === 'good' && (has('ed-1') || has('ed-3'))) {
    score += 3
    reasons.push('Reduced food intake compared with usually good appetite')
  }

  // Fluid intake
  if (baseline.usualFluidIntake === 'good' && has('ed-2')) {
    score += 3
    reasons.push('Reduced fluid intake compared with usual baseline')
  }

  // Mobility
  if (
    (baseline.usualMobilityLevel === 'independent' ||
      baseline.usualMobilityLevel === 'minimal_assistance') &&
    (has('mf-1') || has('mf-4'))
  ) {
    score += 3
    reasons.push('Mobility worse than usual baseline')
  }

  // Gait
  if (
    (baseline.usualGaitPattern === 'steady_unaided' ||
      baseline.usualGaitPattern === 'steady_with_aid') &&
    has('mf-2')
  ) {
    score += 3
    reasons.push('Unsteady gait compared with usually steady baseline')
  }

  // Continence
  if (baseline.usualContinencePattern === 'fully_continent' && (has('tc-1') || has('tc-2') || has('tc-3'))) {
    score += 3
    reasons.push('Continence change from normally continent baseline')
  }

  // Mood / behaviour
  if (baseline.usualMoodBehaviour === 'stable_positive' && (has('mw-1') || has('mw-2') || has('mw-3') || has('gc-4'))) {
    score += 2
    reasons.push('Mood or behaviour change from stable positive baseline')
  }

  // Communication
  if (baseline.usualCommunicationLevel === 'normal' && has('mw-3')) {
    score += 2
    reasons.push('Withdrawal from normally communicative baseline')
  }

  // Swallowing (from baseline risk flag + today's observation)
  if (!baseline.swallowingDifficulty && has('ed-4')) {
    score += 3
    reasons.push('New difficulty swallowing not present in baseline')
  }

  // Vital sign baselines (parse text ranges)
  if (baseline.usualOxygenSaturation && vitals.oxygenSaturation !== undefined) {
    const baseO2 = parseRangeLow(baseline.usualOxygenSaturation)
    if (baseO2 !== null && vitals.oxygenSaturation < baseO2 - 2) {
      score += 4
      reasons.push(`Oxygen saturation (${vitals.oxygenSaturation}%) below usual baseline (${baseline.usualOxygenSaturation}%)`)
    }
  }

  if (baseline.usualPulseRange && vitals.pulse !== undefined) {
    const [pulseLow, pulseHigh] = parseRange(baseline.usualPulseRange)
    if (pulseLow !== null && pulseHigh !== null) {
      if (vitals.pulse < pulseLow - 10 || vitals.pulse > pulseHigh + 15) {
        score += 2
        reasons.push(`Pulse (${vitals.pulse} bpm) outside usual range (${baseline.usualPulseRange})`)
      }
    }
  }

  if (baseline.usualBloodPressureRange && vitals.systolicBp !== undefined) {
    const systolicRange = baseline.usualBloodPressureRange.split('/')[0]
    const [bpLow, bpHigh] = parseRange(systolicRange)
    if (bpLow !== null && bpHigh !== null) {
      if (vitals.systolicBp < bpLow - 15 || vitals.systolicBp > bpHigh + 20) {
        score += 3
        reasons.push(`Blood pressure (${vitals.systolicBp}/${vitals.diastolicBp ?? '?'}) outside usual range`)
      }
    }
  }

  return { score: Math.min(score, 20), reasons }
}

function parseRange(rangeStr: string): [number | null, number | null] {
  const cleaned = rangeStr.trim()
  const parts = cleaned.split('-')
  if (parts.length === 2) {
    const low = parseFloat(parts[0])
    const high = parseFloat(parts[1])
    if (!isNaN(low) && !isNaN(high)) return [low, high]
  }
  const single = parseFloat(cleaned)
  if (!isNaN(single)) return [single, single]
  return [null, null]
}

function parseRangeLow(rangeStr: string): number | null {
  const [low] = parseRange(rangeStr)
  return low
}

// ─── Condition-specific adjustment scoring ─────────────────────────────────────

function calcConditionAdjustmentScore(
  conditions: ClientCondition[],
  selectedSymptomIds: string[],
  vitals: Vitals
): { score: number; reasons: string[] } {
  const active = conditions.filter((c) => c.status === 'active')
  if (active.length === 0) return { score: 0, reasons: [] }

  let score = 0
  const reasons: string[] = []
  const has = (id: string) => selectedSymptomIds.includes(id)

  const hasCondition = (name: string) =>
    active.some((c) => c.conditionName.toLowerCase() === name.toLowerCase())

  // Dementia
  if (hasCondition('Dementia')) {
    if (has('gc-2')) { score += 5; reasons.push('Dementia increases risk from new confusion') }
    if (has('gc-3')) { score += 5; reasons.push('Dementia increases risk from reduced alertness') }
  }

  // Diabetes
  if (hasCondition('Diabetes')) {
    if (has('ed-1')) { score += 4; reasons.push('Diabetes increases risk from reduced food intake') }
    if (has('ed-2')) { score += 4; reasons.push('Diabetes increases risk from reduced fluid intake') }
  }

  // COPD
  if (hasCondition('COPD')) {
    if (has('bc-1')) { score += 5; reasons.push('COPD increases risk from shortness of breath') }
    if (vitals.oxygenSaturation !== undefined && vitals.oxygenSaturation < 95) {
      score += 5; reasons.push('COPD increases risk from reduced oxygen saturation')
    }
  }

  // Heart disease
  if (hasCondition('Heart disease')) {
    if (has('bc-3')) { score += 5; reasons.push('Heart disease increases risk from chest discomfort') }
    if (has('bc-4')) { score += 3; reasons.push('Heart disease increases risk from cold or clammy skin') }
  }

  // Stroke history
  if (hasCondition('Stroke history')) {
    if (has('mf-1')) { score += 4; reasons.push('Stroke history increases risk from reduced mobility') }
    if (has('gc-5')) { score += 4; reasons.push('Stroke history increases risk from weakness') }
    if (has('gc-2')) { score += 4; reasons.push('Stroke history increases risk from new confusion') }
  }

  // Falls risk
  if (hasCondition('Falls risk')) {
    if (has('mf-2')) { score += 4; reasons.push('Falls risk increases concern from unsteady gait') }
    if (has('mf-3')) { score += 4; reasons.push('Falls risk increases concern from recent fall') }
  }

  // Falls history (from condition tag)
  if (hasCondition('Frailty') && (has('mf-1') || has('mf-2') || has('mf-3'))) {
    score += 3; reasons.push('Frailty increases risk from mobility or fall concerns')
  }

  // Catheter use
  if (hasCondition('Catheter use')) {
    if (has('tc-2')) { score += 4; reasons.push('Catheter use increases risk from dark or strong urine') }
    if (has('tc-1')) { score += 3; reasons.push('Catheter use increases concern from reduced urine output') }
  }

  // Recurrent UTI
  if (hasCondition('Recurrent UTI')) {
    if (has('gc-2')) { score += 5; reasons.push('Recurrent UTI increases risk from new confusion') }
    if (has('tc-2')) { score += 4; reasons.push('Recurrent UTI increases risk from dark or strong urine') }
    if (has('is-1')) { score += 4; reasons.push('Recurrent UTI increases risk from fever') }
    if (has('is-2')) { score += 4; reasons.push('Recurrent UTI increases risk from shivering or chills') }
  }

  // Pressure sore risk
  if (hasCondition('Pressure sore risk')) {
    if (has('is-3')) { score += 4; reasons.push('Pressure sore risk increases concern from wound deterioration') }
  }

  // Swallowing difficulty
  if (hasCondition('Swallowing difficulty')) {
    if (has('ed-4')) { score += 4; reasons.push('Known swallowing difficulty increases risk from swallowing problems today') }
    if (has('ed-3')) { score += 4; reasons.push('Known swallowing difficulty increases risk from refusing meals') }
  }

  // Parkinson's
  if (hasCondition("Parkinson's disease")) {
    if (has('mf-1') || has('mf-2')) { score += 3; reasons.push("Parkinson's disease increases concern from mobility changes") }
    if (has('ed-4')) { score += 3; reasons.push("Parkinson's disease increases risk from swallowing difficulty") }
  }

  // Kidney disease
  if (hasCondition('Kidney disease')) {
    if (has('ed-2')) { score += 3; reasons.push('Kidney disease increases concern from reduced fluid intake') }
    if (has('tc-1')) { score += 3; reasons.push('Kidney disease increases concern from reduced urine output') }
  }

  // Epilepsy — note if confusion present, as post-ictal state possible
  if (hasCondition('Epilepsy') && has('gc-2')) {
    score += 3; reasons.push('Epilepsy: new confusion may indicate post-ictal state')
  }

  // Mental health
  if (hasCondition('Mental health condition')) {
    if (has('mw-1') || has('mw-2') || has('mw-3')) {
      score += 2; reasons.push('Mental health condition: mood or wellbeing changes noted')
    }
  }

  // Palliative / end of life — flag for manager review on any baseline change
  if (hasCondition('Palliative/end-of-life care') || hasCondition('Palliative or end-of-life care')) {
    score += 5
    reasons.push('Palliative or end-of-life care: any change warrants manager awareness')
  }

  return { score: Math.min(score, 20), reasons }
}

// ─── Trend scoring ────────────────────────────────────────────────────────────

function calcTrendScore(
  recentEntries: RecentEntryForTrend[],
  _currentSymptomIds: string[],
  _currentVitals: Vitals
): { score: number; reasons: string[] } {
  if (recentEntries.length === 0) return { score: 0, reasons: [] }

  let score = 0
  const reasons: string[] = []

  const now = Date.now()
  const day7 = 7 * 24 * 60 * 60 * 1000
  const day14 = 14 * 24 * 60 * 60 * 1000
  const day30 = 30 * 24 * 60 * 60 * 1000

  const last7 = recentEntries.filter((e) => now - new Date(e.createdAt).getTime() <= day7)
  const last14 = recentEntries.filter((e) => now - new Date(e.createdAt).getTime() <= day14)
  const last30 = recentEntries.filter((e) => now - new Date(e.createdAt).getTime() <= day30)

  const has = (entry: RecentEntryForTrend, id: string) => entry.selectedSymptomIds.includes(id)

  // 3+ amber/red in 7 days
  const amberRed7 = last7.filter((e) => e.riskLevel === 'amber' || e.riskLevel === 'red')
  if (amberRed7.length >= 3) {
    score += 5
    reasons.push(`${amberRed7.length} amber or red visits recorded in the last 7 days`)
  } else if (amberRed7.length >= 2) {
    score += 2
    reasons.push('Multiple amber or red visits recorded in the last 7 days')
  }

  // Rising health risk score across last 3 consecutive entries
  const lastThreeScores = recentEntries
    .filter((e) => e.healthRiskScore !== null)
    .slice(0, 3)
    .map((e) => e.healthRiskScore!)
  if (lastThreeScores.length === 3) {
    if (lastThreeScores[2] < lastThreeScores[1] && lastThreeScores[1] < lastThreeScores[0]) {
      score += 3
      reasons.push('Health risk score has been increasing across the last 3 visits')
    }
  }

  // Repeated reduced food intake in 7 days
  const foodIssues7 = last7.filter((e) => has(e, 'ed-1') || has(e, 'ed-3'))
  if (foodIssues7.length >= 2) {
    score += 3
    reasons.push('Reduced food intake recorded on multiple visits in the last 7 days')
  }

  // Repeated reduced fluid intake in 7 days
  const fluidIssues7 = last7.filter((e) => has(e, 'ed-2'))
  if (fluidIssues7.length >= 2) {
    score += 3
    reasons.push('Reduced fluid intake recorded on multiple visits in the last 7 days')
  }

  // Repeated confusion in 7 days
  const confusion7 = last7.filter((e) => has(e, 'gc-2') || has(e, 'gc-3'))
  if (confusion7.length >= 2) {
    score += 4
    reasons.push('Confusion or reduced alertness recorded on multiple visits in the last 7 days')
  }

  // Repeated mobility concerns in 14 days
  const mobility14 = last14.filter((e) => has(e, 'mf-1') || has(e, 'mf-2') || has(e, 'mf-4'))
  if (mobility14.length >= 2) {
    score += 3
    reasons.push('Mobility decline recorded on multiple visits in the last 14 days')
  }

  // Repeated falls in 30 days
  const falls30 = last30.filter((e) => has(e, 'mf-3'))
  if (falls30.length >= 1) {
    score += 4
    reasons.push('Previous fall recorded within the last 30 days')
  }

  // Worsening O2 trend (3 entries with decreasing O2)
  const o2Entries = recentEntries
    .filter((e) => e.vitals.oxygenSaturation !== undefined)
    .slice(0, 3)
  if (o2Entries.length === 3) {
    const o2s = o2Entries.map((e) => e.vitals.oxygenSaturation!)
    if (o2s[0] < o2s[1] && o2s[1] < o2s[2]) {
      score += 3
      reasons.push('Oxygen saturation has been declining across recent visits')
    }
  }

  // Repeated dark/strong urine in 14 days
  const urineIssues14 = last14.filter((e) => has(e, 'tc-2') || has(e, 'tc-1'))
  if (urineIssues14.length >= 2) {
    score += 3
    reasons.push('Urine concerns recorded on multiple visits in the last 14 days')
  }

  return { score: Math.min(score, 10), reasons }
}

// ─── High-risk combination rules ─────────────────────────────────────────────

function calcCombinationScore(
  selectedSymptomIds: string[],
  vitals: Vitals
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []
  const has = (id: string) => selectedSymptomIds.includes(id)

  // Sepsis signal: confusion + fever + reduced urine
  if ((has('gc-2') || has('gc-3')) && (has('is-1') || has('is-2')) && has('tc-1')) {
    score += 5
    reasons.push('High-risk combination: confusion, fever, and reduced urine (possible infection or sepsis signal)')
  }

  // Cardiac signal: chest discomfort + cold/clammy + abnormal pulse/BP
  if (has('bc-3') && has('bc-4') && (
    (vitals.pulse !== undefined && (vitals.pulse > 110 || vitals.pulse < 50)) ||
    (vitals.systolicBp !== undefined && (vitals.systolicBp < 90 || vitals.systolicBp > 180))
  )) {
    score += 5
    reasons.push('High-risk combination: chest discomfort, clammy skin, and abnormal vital signs (possible cardiac signal)')
  }

  // UTI / delirium: confusion + dark urine + fever (in absence of above)
  if (score < 5 && has('gc-2') && has('tc-2') && has('is-1')) {
    score += 4
    reasons.push('High-risk combination: confusion, dark urine, and fever (possible UTI with delirium)')
  }

  // Multiple abnormal vitals simultaneously
  let abnormalVitalCount = 0
  if (vitals.temperature !== undefined && (vitals.temperature >= 38.5 || vitals.temperature <= 35.5)) abnormalVitalCount++
  if (vitals.oxygenSaturation !== undefined && vitals.oxygenSaturation < 93) abnormalVitalCount++
  if (vitals.pulse !== undefined && (vitals.pulse > 120 || vitals.pulse < 45)) abnormalVitalCount++
  if (vitals.respiratoryRate !== undefined && (vitals.respiratoryRate >= 25 || vitals.respiratoryRate <= 8)) abnormalVitalCount++
  if (vitals.systolicBp !== undefined && (vitals.systolicBp <= 90 || vitals.systolicBp >= 200)) abnormalVitalCount++

  if (abnormalVitalCount >= 3) {
    score += 3
    reasons.push(`${abnormalVitalCount} vital signs critically abnormal simultaneously`)
  }

  return { score: Math.min(score, 5), reasons }
}

// ─── Clinical Warning Score (NEWS2-inspired) ──────────────────────────────────

function calcClinicalWarningScore(
  vitals: Vitals,
  selectedSymptomIds: string[]
): {
  score: number
  band: string
  partial: boolean
  singleRedParameter: boolean
  parameterBreakdown: ClinicalParameterBreakdown
} {
  const breakdown: ClinicalParameterBreakdown = {}
  let total = 0
  let singleRed = false
  let physiologicalCount = 0

  // Respiratory rate
  if (vitals.respiratoryRate !== undefined) {
    physiologicalCount++
    let pts = 0
    const rr = vitals.respiratoryRate
    if (rr <= 8) pts = 3
    else if (rr <= 11) pts = 1
    else if (rr <= 20) pts = 0
    else if (rr <= 24) pts = 2
    else pts = 3
    breakdown.respiratoryRate = pts
    if (pts === 3) singleRed = true
    total += pts
  }

  // Oxygen saturation
  if (vitals.oxygenSaturation !== undefined) {
    physiologicalCount++
    let pts = 0
    const o2 = vitals.oxygenSaturation
    if (o2 >= 96) pts = 0
    else if (o2 >= 94) pts = 1
    else if (o2 >= 92) pts = 2
    else pts = 3
    breakdown.oxygenSaturation = pts
    if (pts === 3) singleRed = true
    total += pts
  }

  // Temperature
  if (vitals.temperature !== undefined) {
    physiologicalCount++
    let pts = 0
    const t = vitals.temperature
    if (t <= 35.0) pts = 3
    else if (t <= 36.0) pts = 1
    else if (t <= 38.0) pts = 0
    else if (t <= 39.0) pts = 1
    else pts = 2
    breakdown.temperature = pts
    if (pts === 3) singleRed = true
    total += pts
  }

  // Systolic BP
  if (vitals.systolicBp !== undefined) {
    physiologicalCount++
    let pts = 0
    const sbp = vitals.systolicBp
    if (sbp <= 90) pts = 3
    else if (sbp <= 100) pts = 2
    else if (sbp <= 110) pts = 1
    else if (sbp <= 219) pts = 0
    else pts = 3
    breakdown.systolicBp = pts
    if (pts === 3) singleRed = true
    total += pts
  }

  // Pulse
  if (vitals.pulse !== undefined) {
    physiologicalCount++
    let pts = 0
    const hr = vitals.pulse
    if (hr <= 40) pts = 3
    else if (hr <= 50) pts = 1
    else if (hr <= 90) pts = 0
    else if (hr <= 110) pts = 1
    else if (hr <= 130) pts = 2
    else pts = 3
    breakdown.pulse = pts
    if (pts === 3) singleRed = true
    total += pts
  }

  // New confusion / reduced alertness
  const hasConfusion =
    selectedSymptomIds.includes('gc-2') || selectedSymptomIds.includes('gc-3')
  if (hasConfusion) {
    breakdown.confusion = 3
    singleRed = true
    total += 3
  }

  const partial = physiologicalCount < 3
  const band = getClinicalWarningBand(total)

  return { score: total, band, partial, singleRedParameter: singleRed, parameterBreakdown: breakdown }
}

// ─── Explanation text builder ─────────────────────────────────────────────────

function buildExplanationText(
  finalScore: number,
  scoreReasons: string[],
  baselineChangeReasons: string[],
  conditionAdjustmentReasons: string[],
  trendReasons: string[],
  clinicalWarningScore: number,
  clinicalWarningBand: string
): string {
  const parts: string[] = []

  if (finalScore === 0 && scoreReasons.length === 0) {
    parts.push('No concerning observations were recorded during this visit.')
  } else {
    if (scoreReasons.length > 0) {
      parts.push(`Today's observations include: ${scoreReasons.slice(0, 3).join(', ')}.`)
    }
    if (baselineChangeReasons.length > 0) {
      parts.push(baselineChangeReasons[0])
      if (baselineChangeReasons.length > 1) parts.push(baselineChangeReasons[1])
    }
    if (conditionAdjustmentReasons.length > 0) {
      parts.push(conditionAdjustmentReasons[0])
    }
    if (trendReasons.length > 0) {
      parts.push(trendReasons[0])
    }
    if (clinicalWarningScore >= 5) {
      parts.push(`Clinical warning indicators suggest ${clinicalWarningBand.toLowerCase()} (clinical score: ${clinicalWarningScore}).`)
    }
  }

  parts.push(
    'LYNTO supports observation and escalation decisions. It does not diagnose conditions or replace professional clinical judgement.'
  )

  return parts.join(' ')
}

// ─── Main scoring engine entry point ─────────────────────────────────────────

export function runScoringEngine(
  selectedSymptomIds: string[],
  vitals: Vitals,
  baseline: ClientBaseline | null,
  conditions: ClientCondition[],
  recentEntries: RecentEntryForTrend[]
): ScoringEngineResult {
  // Legacy score (backward compat, stored as `score` in visit_entries)
  const { rawSymptomPoints, rawVitalPoints, legacyScore, reasons: legacyReasons } =
    calcLegacyScore(selectedSymptomIds, vitals)

  // Component contributions to 0-100 final score
  const symptomsContribution = Math.min(35, rawSymptomPoints * 6)
  const vitalsContribution = Math.min(25, rawVitalPoints * 6)

  const { score: baselineChangeScore, reasons: baselineChangeReasons } =
    calcBaselineChangeScore(baseline, selectedSymptomIds, vitals)

  const { score: conditionAdjustmentScore, reasons: conditionAdjustmentReasons } =
    calcConditionAdjustmentScore(conditions, selectedSymptomIds, vitals)

  const { score: trendScore, reasons: trendReasons } =
    calcTrendScore(recentEntries, selectedSymptomIds, vitals)

  const { score: highRiskCombinationScore, reasons: combinationReasons } =
    calcCombinationScore(selectedSymptomIds, vitals)

  const categoryScores = calcCategoryScores(selectedSymptomIds, vitals)

  const rawFinal =
    symptomsContribution +
    vitalsContribution +
    baselineChangeScore +
    conditionAdjustmentScore +
    trendScore +
    highRiskCombinationScore

  const finalHealthRiskScore = Math.min(100, rawFinal)
  const finalRiskLevel = getRiskLevelFromScore(finalHealthRiskScore)
  const riskBandLabel = getRiskBandLabel(finalHealthRiskScore)

  const isPalliative = conditions.some(
    (c) =>
      c.status === 'active' &&
      (c.conditionName.toLowerCase().includes('palliative') ||
        c.conditionName.toLowerCase().includes('end-of-life'))
  )

  const suggestedAttentionLevel = getSuggestedAttentionLevel(finalHealthRiskScore, isPalliative)

  const { score: clinicalWarningScore, band: clinicalWarningBand, partial: clinicalWarningPartial,
    singleRedParameter, parameterBreakdown: clinicalParameterBreakdown } =
    calcClinicalWarningScore(vitals, selectedSymptomIds)

  const allScoreReasons = [...legacyReasons]
  const explanationText = buildExplanationText(
    finalHealthRiskScore,
    allScoreReasons,
    baselineChangeReasons,
    conditionAdjustmentReasons,
    trendReasons,
    clinicalWarningScore,
    clinicalWarningBand
  )

  // Legacy risk level (for backward compat, DB trigger uses this)
  let legacyRiskLevel: RiskLevel = 'green'
  if (legacyScore >= 5) legacyRiskLevel = 'red'
  else if (legacyScore >= 3) legacyRiskLevel = 'amber'

  return {
    score: legacyScore,
    riskLevel: legacyRiskLevel,
    reasons: legacyReasons,

    baseSymptomScore: symptomsContribution,
    vitalSignScore: vitalsContribution,
    baselineChangeScore,
    conditionAdjustmentScore,
    trendScore,
    highRiskCombinationScore,

    finalHealthRiskScore,
    finalRiskLevel,
    riskBandLabel,

    baselineChangeReasons,
    conditionAdjustmentReasons,
    trendReasons,
    combinationReasons,

    explanationText,
    suggestedAttentionLevel,

    categoryScores,

    clinicalWarningScore,
    clinicalWarningBand,
    clinicalWarningPartial,
    singleRedParameter,
    clinicalParameterBreakdown,
  }
}
