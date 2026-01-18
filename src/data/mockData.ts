import type { Agency, Manager, Carer, Client, VisitEntry, Alert } from '@/types'

// Agency
export const mockAgency: Agency = {
  id: 'agency-1',
  name: 'Sunrise Care Services',
  createdAt: '2024-01-15T09:00:00Z',
  managerId: 'manager-1',
}

// Manager
export const mockManager: Manager = {
  id: 'manager-1',
  email: 'sarah.jones@sunrisecare.co.uk',
  fullName: 'Sarah Jones',
  role: 'manager',
  status: 'active',
  agencyId: 'agency-1',
  createdAt: '2024-01-15T09:00:00Z',
}

// Carers
export const mockCarers: Carer[] = [
  {
    id: 'carer-1',
    email: 'emma.wilson@sunrisecare.co.uk',
    fullName: 'Emma Wilson',
    role: 'carer',
    status: 'active',
    agencyId: 'agency-1',
    createdAt: '2024-01-20T10:00:00Z',
    assignedClientIds: ['client-1', 'client-2', 'client-3'],
  },
  {
    id: 'carer-2',
    email: 'james.taylor@sunrisecare.co.uk',
    fullName: 'James Taylor',
    role: 'carer',
    status: 'active',
    agencyId: 'agency-1',
    createdAt: '2024-01-22T11:00:00Z',
    assignedClientIds: ['client-2', 'client-4'],
  },
  {
    id: 'carer-3',
    email: 'lisa.brown@sunrisecare.co.uk',
    fullName: 'Lisa Brown',
    role: 'carer',
    status: 'inactive',
    agencyId: 'agency-1',
    createdAt: '2024-02-01T09:00:00Z',
    assignedClientIds: [],
    deactivationReason: 'left_organisation',
    deactivatedAt: '2024-06-15T16:00:00Z',
  },
]

// Clients
export const mockClients: Client[] = [
  {
    id: 'client-1',
    displayName: 'Margaret H.',
    internalReference: 'MH-001',
    agencyId: 'agency-1',
    status: 'active',
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'client-2',
    displayName: 'Robert P.',
    internalReference: 'RP-002',
    agencyId: 'agency-1',
    status: 'active',
    createdAt: '2024-02-05T14:00:00Z',
  },
  {
    id: 'client-3',
    displayName: 'Dorothy M.',
    internalReference: 'DM-003',
    agencyId: 'agency-1',
    status: 'active',
    createdAt: '2024-02-10T11:00:00Z',
  },
  {
    id: 'client-4',
    displayName: 'William T.',
    internalReference: 'WT-004',
    agencyId: 'agency-1',
    status: 'active',
    createdAt: '2024-02-15T09:00:00Z',
  },
  {
    id: 'client-5',
    displayName: 'Elizabeth S.',
    internalReference: 'ES-005',
    agencyId: 'agency-1',
    status: 'inactive',
    deactivationReason: 'moved_to_another_provider',
    deactivatedAt: '2024-05-20T15:00:00Z',
    createdAt: '2024-02-20T10:00:00Z',
  },
]

// Visit Entries
export const mockVisitEntries: VisitEntry[] = [
  {
    id: 'visit-1',
    clientId: 'client-1',
    carerId: 'carer-1',
    agencyId: 'agency-1',
    selectedSymptomIds: ['gc-1', 'ed-1'],
    vitals: { temperature: 37.2, pulse: 78 },
    note: 'Client seemed a bit quieter today but ate most of lunch.',
    score: 2,
    riskLevel: 'green',
    reasons: ['Client not themselves / unusual behaviour', 'Reduced food intake'],
    createdAt: '2024-06-10T14:30:00Z',
  },
  {
    id: 'visit-2',
    clientId: 'client-2',
    carerId: 'carer-1',
    agencyId: 'agency-1',
    selectedSymptomIds: ['gc-2', 'is-1', 'tc-2'],
    vitals: { temperature: 38.1, pulse: 92, oxygenSaturation: 96 },
    note: 'More confused than usual, feels warm. Family aware.',
    score: 5,
    riskLevel: 'red',
    reasons: ['Increased confusion', 'Feverish / hot to touch', 'Dark or strong-smelling urine'],
    createdAt: '2024-06-12T10:15:00Z',
  },
  {
    id: 'visit-3',
    clientId: 'client-3',
    carerId: 'carer-1',
    agencyId: 'agency-1',
    selectedSymptomIds: ['mf-2', 'pd-1', 'mw-1'],
    vitals: { pulse: 72 },
    note: 'Bit unsteady this morning, complained of hip discomfort.',
    score: 3,
    riskLevel: 'amber',
    reasons: ['Unsteady on feet', 'Complaining of pain', 'Low mood'],
    createdAt: '2024-06-13T09:45:00Z',
  },
  {
    id: 'visit-4',
    clientId: 'client-4',
    carerId: 'carer-2',
    agencyId: 'agency-1',
    selectedSymptomIds: ['bc-1', 'bc-2', 'is-1'],
    vitals: { temperature: 37.8, pulse: 88, respiratoryRate: 22, oxygenSaturation: 94 },
    note: 'New cough started, breathing seems laboured. Monitoring closely.',
    score: 5,
    riskLevel: 'red',
    reasons: ['Shortness of breath', 'Cough', 'Feverish / hot to touch'],
    createdAt: '2024-06-14T11:00:00Z',
  },
  {
    id: 'visit-5',
    clientId: 'client-1',
    carerId: 'carer-1',
    agencyId: 'agency-1',
    selectedSymptomIds: ['ed-2', 'tc-1'],
    vitals: { temperature: 36.8 },
    note: 'Not drinking as much, will encourage fluids.',
    score: 2,
    riskLevel: 'green',
    reasons: ['Reduced fluid intake', 'Reduced urine output'],
    createdAt: '2024-06-14T15:30:00Z',
  },
  {
    id: 'visit-6',
    clientId: 'client-2',
    carerId: 'carer-2',
    agencyId: 'agency-1',
    selectedSymptomIds: ['gc-3', 'ed-3', 'is-2'],
    vitals: { temperature: 38.4, pulse: 96 },
    note: 'Very drowsy, refused breakfast. GP visit requested.',
    score: 6,
    riskLevel: 'red',
    reasons: ['Reduced alertness / drowsy', 'Refusing meals', 'Shivering or chills'],
    createdAt: '2024-06-15T08:30:00Z',
  },
]

// Alerts (only for amber and red entries)
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    visitEntryId: 'visit-2',
    clientId: 'client-2',
    carerId: 'carer-1',
    agencyId: 'agency-1',
    riskLevel: 'red',
    isReviewed: true,
    reviewedBy: 'manager-1',
    reviewedAt: '2024-06-12T11:00:00Z',
    actionTaken: 'informed_gp',
    managerNote: 'GP notified, antibiotics prescribed. Family called.',
    createdAt: '2024-06-12T10:15:00Z',
  },
  {
    id: 'alert-2',
    visitEntryId: 'visit-3',
    clientId: 'client-3',
    carerId: 'carer-1',
    agencyId: 'agency-1',
    riskLevel: 'amber',
    isReviewed: true,
    reviewedBy: 'manager-1',
    reviewedAt: '2024-06-13T10:30:00Z',
    actionTaken: 'monitor',
    managerNote: 'Continue monitoring, physio referral being considered.',
    createdAt: '2024-06-13T09:45:00Z',
  },
  {
    id: 'alert-3',
    visitEntryId: 'visit-4',
    clientId: 'client-4',
    carerId: 'carer-2',
    agencyId: 'agency-1',
    riskLevel: 'red',
    isReviewed: false,
    createdAt: '2024-06-14T11:00:00Z',
  },
  {
    id: 'alert-4',
    visitEntryId: 'visit-6',
    clientId: 'client-2',
    carerId: 'carer-2',
    agencyId: 'agency-1',
    riskLevel: 'red',
    isReviewed: false,
    createdAt: '2024-06-15T08:30:00Z',
  },
]

// Helper functions to get related data
export function getClientById(id: string) {
  return mockClients.find((c) => c.id === id)
}

export function getCarerById(id: string) {
  return mockCarers.find((c) => c.id === id)
}

export function getVisitEntryById(id: string) {
  return mockVisitEntries.find((v) => v.id === id)
}

export function getAlertsByFilter(filter: string, agencyId: string) {
  const agencyAlerts = mockAlerts.filter((a) => a.agencyId === agencyId)

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
}

export function getClientsForCarer(carerId: string) {
  const carer = getCarerById(carerId)
  if (!carer) return []
  return mockClients.filter(
    (c) => carer.assignedClientIds.includes(c.id) && c.status === 'active'
  )
}

export function getActiveCarers(agencyId: string) {
  return mockCarers.filter((c) => c.agencyId === agencyId && c.status === 'active')
}

export function getActiveClients(agencyId: string) {
  return mockClients.filter((c) => c.agencyId === agencyId && c.status === 'active')
}
