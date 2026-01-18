import type { SymptomCategory } from '@/types'

export const symptomCategories: SymptomCategory[] = [
  {
    id: 'general-condition',
    name: 'General Condition',
    symptoms: [
      { id: 'gc-1', label: 'Client not themselves / unusual behaviour', points: 1 },
      { id: 'gc-2', label: 'Increased confusion', points: 2 },
      { id: 'gc-3', label: 'Reduced alertness / drowsy', points: 2 },
      { id: 'gc-4', label: 'Agitation or restlessness', points: 1 },
      { id: 'gc-5', label: 'Appears weaker than usual', points: 1 },
    ],
  },
  {
    id: 'eating-drinking',
    name: 'Eating & Drinking',
    symptoms: [
      { id: 'ed-1', label: 'Reduced food intake', points: 1 },
      { id: 'ed-2', label: 'Reduced fluid intake', points: 1 },
      { id: 'ed-3', label: 'Refusing meals', points: 2 },
      { id: 'ed-4', label: 'Difficulty swallowing', points: 2 },
    ],
  },
  {
    id: 'mobility-falls',
    name: 'Mobility & Falls',
    symptoms: [
      { id: 'mf-1', label: 'Reduced mobility', points: 1 },
      { id: 'mf-2', label: 'Unsteady on feet', points: 1 },
      { id: 'mf-3', label: 'Recent fall', points: 2 },
      { id: 'mf-4', label: 'New difficulty transferring (bed/chair)', points: 1 },
    ],
  },
  {
    id: 'breathing-circulation',
    name: 'Breathing & Circulation',
    symptoms: [
      { id: 'bc-1', label: 'Shortness of breath', points: 2 },
      { id: 'bc-2', label: 'Cough', points: 1 },
      { id: 'bc-3', label: 'Chest discomfort', points: 2 },
      { id: 'bc-4', label: 'Cold or clammy skin', points: 2 },
    ],
  },
  {
    id: 'pain-discomfort',
    name: 'Pain & Discomfort',
    symptoms: [
      { id: 'pd-1', label: 'Complaining of pain', points: 1 },
      { id: 'pd-2', label: 'Appears in pain', points: 1 },
      { id: 'pd-3', label: 'New or worsening pain', points: 2 },
    ],
  },
  {
    id: 'infection-signs',
    name: 'Infection Signs',
    symptoms: [
      { id: 'is-1', label: 'Feverish / hot to touch', points: 2 },
      { id: 'is-2', label: 'Shivering or chills', points: 2 },
      { id: 'is-3', label: 'New or worsening wound', points: 1 },
      { id: 'is-4', label: 'Signs of infection (general)', points: 2 },
    ],
  },
  {
    id: 'toileting-continence',
    name: 'Toileting & Continence',
    symptoms: [
      { id: 'tc-1', label: 'Reduced urine output', points: 1 },
      { id: 'tc-2', label: 'Dark or strong-smelling urine', points: 1 },
      { id: 'tc-3', label: 'New incontinence', points: 1 },
      { id: 'tc-4', label: 'Constipation', points: 1 },
      { id: 'tc-5', label: 'Diarrhoea', points: 1 },
    ],
  },
  {
    id: 'mental-wellbeing',
    name: 'Mental Wellbeing',
    symptoms: [
      { id: 'mw-1', label: 'Low mood', points: 1 },
      { id: 'mw-2', label: 'Anxiety', points: 1 },
      { id: 'mw-3', label: 'Withdrawal / not engaging', points: 1 },
    ],
  },
]

// Helper to get all symptoms flat
export function getAllSymptoms() {
  return symptomCategories.flatMap((cat) => cat.symptoms)
}

// Helper to get symptom by ID
export function getSymptomById(id: string) {
  return getAllSymptoms().find((s) => s.id === id)
}

// Helper to get category by symptom ID
export function getCategoryBySymptomId(symptomId: string) {
  return symptomCategories.find((cat) =>
    cat.symptoms.some((s) => s.id === symptomId)
  )
}
