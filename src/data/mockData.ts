import type { Agency, Manager, Carer, Client, VisitEntry, Alert, PlatformAdmin, AgencyWithStats, ActivityLogEntry } from '@/types'

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

// ============================================
// PLATFORM ADMIN MOCK DATA
// ============================================

// Platform Admins
export const mockPlatformAdmins: PlatformAdmin[] = [
  {
    id: 'admin-1',
    email: 'admin@lynto.com',
    fullName: 'John Administrator',
    role: 'admin',
    adminRole: 'primary_admin',
    status: 'active',
    createdAt: '2024-01-01T09:00:00Z',
    lastLoginAt: '2024-06-15T08:00:00Z',
  },
  {
    id: 'admin-2',
    email: 'support@lynto.com',
    fullName: 'Jane Support',
    role: 'admin',
    adminRole: 'admin',
    status: 'active',
    createdAt: '2024-02-15T10:00:00Z',
    lastLoginAt: '2024-06-14T14:30:00Z',
  },
  {
    id: 'admin-3',
    email: 'viewer@lynto.com',
    fullName: 'Bob Viewer',
    role: 'admin',
    adminRole: 'readonly_admin',
    status: 'inactive',
    createdAt: '2024-03-01T11:00:00Z',
    deactivatedAt: '2024-05-01T16:00:00Z',
    deactivationReason: 'Role change',
  },
]

// All Agencies (for admin view)
export const mockAllAgencies: AgencyWithStats[] = [
  {
    id: 'agency-1',
    name: 'Sunrise Care Services',
    createdAt: '2024-01-15T09:00:00Z',
    managerId: 'manager-1',
    status: 'active',
    contactEmail: 'sarah.jones@sunrisecare.co.uk',
    contactName: 'Sarah Jones',
    totalCarers: 3,
    activeCarers: 2,
    totalClients: 5,
    activeClients: 4,
    totalAlerts: 4,
    unreviewedAlerts: 2,
    lastActivityAt: '2024-06-15T08:30:00Z',
  },
  {
    id: 'agency-2',
    name: 'Hope Homecare Ltd',
    createdAt: '2024-02-20T10:00:00Z',
    managerId: 'manager-2',
    status: 'active',
    contactEmail: 'mark.wilson@hopehomecare.co.uk',
    contactName: 'Mark Wilson',
    totalCarers: 5,
    activeCarers: 4,
    totalClients: 12,
    activeClients: 10,
    totalAlerts: 8,
    unreviewedAlerts: 1,
    lastActivityAt: '2024-06-14T16:45:00Z',
  },
  {
    id: 'agency-3',
    name: 'Comfort Care Solutions',
    createdAt: '2024-03-10T14:00:00Z',
    managerId: 'manager-3',
    status: 'active',
    contactEmail: 'lisa.brown@comfortcare.co.uk',
    contactName: 'Lisa Brown',
    totalCarers: 8,
    activeCarers: 7,
    totalClients: 20,
    activeClients: 18,
    totalAlerts: 15,
    unreviewedAlerts: 3,
    lastActivityAt: '2024-06-15T09:15:00Z',
  },
  {
    id: 'agency-4',
    name: 'Gentle Hands Care',
    createdAt: '2024-04-05T11:00:00Z',
    managerId: 'manager-4',
    status: 'suspended',
    contactEmail: 'peter.smith@gentlehands.co.uk',
    contactName: 'Peter Smith',
    totalCarers: 2,
    activeCarers: 0,
    totalClients: 6,
    activeClients: 0,
    totalAlerts: 3,
    unreviewedAlerts: 0,
    lastActivityAt: '2024-05-20T10:00:00Z',
    notes: 'Suspended due to non-payment',
  },
  {
    id: 'agency-5',
    name: 'Caring Hearts Agency',
    createdAt: '2024-05-01T09:00:00Z',
    managerId: 'manager-5',
    status: 'inactive',
    contactEmail: 'emma.davis@caringhearts.co.uk',
    contactName: 'Emma Davis',
    totalCarers: 4,
    activeCarers: 0,
    totalClients: 8,
    activeClients: 0,
    totalAlerts: 5,
    unreviewedAlerts: 0,
    lastActivityAt: '2024-05-15T14:30:00Z',
    notes: 'Agency closed operations',
  },
]

// Activity Log
export const mockActivityLog: ActivityLogEntry[] = [
  {
    id: 'log-1',
    eventType: 'admin_login',
    performedBy: 'admin-1',
    performedByName: 'John Administrator',
    timestamp: '2024-06-15T08:00:00Z',
  },
  {
    id: 'log-2',
    eventType: 'carer_created',
    agencyId: 'agency-3',
    agencyName: 'Comfort Care Solutions',
    entityId: 'carer-new',
    entityName: 'New Carer',
    performedBy: 'manager-3',
    performedByName: 'Lisa Brown',
    timestamp: '2024-06-15T09:15:00Z',
  },
  {
    id: 'log-3',
    eventType: 'client_created',
    agencyId: 'agency-2',
    agencyName: 'Hope Homecare Ltd',
    entityId: 'client-new',
    entityName: 'New Client',
    performedBy: 'manager-2',
    performedByName: 'Mark Wilson',
    timestamp: '2024-06-14T16:45:00Z',
  },
  {
    id: 'log-4',
    eventType: 'agency_status_changed',
    agencyId: 'agency-4',
    agencyName: 'Gentle Hands Care',
    performedBy: 'admin-1',
    performedByName: 'John Administrator',
    reason: 'Suspended due to non-payment',
    timestamp: '2024-05-20T10:00:00Z',
  },
  {
    id: 'log-5',
    eventType: 'carer_deactivated',
    agencyId: 'agency-1',
    agencyName: 'Sunrise Care Services',
    entityId: 'carer-3',
    entityName: 'Lisa Brown',
    performedBy: 'manager-1',
    performedByName: 'Sarah Jones',
    reason: 'Left organisation',
    timestamp: '2024-06-15T16:00:00Z',
  },
  {
    id: 'log-6',
    eventType: 'admin_deactivated',
    entityId: 'admin-3',
    entityName: 'Bob Viewer',
    performedBy: 'admin-1',
    performedByName: 'John Administrator',
    reason: 'Role change',
    timestamp: '2024-05-01T16:00:00Z',
  },
  {
    id: 'log-7',
    eventType: 'agency_created',
    agencyId: 'agency-5',
    agencyName: 'Caring Hearts Agency',
    performedBy: 'admin-2',
    performedByName: 'Jane Support',
    timestamp: '2024-05-01T09:00:00Z',
  },
  {
    id: 'log-8',
    eventType: 'client_deactivated',
    agencyId: 'agency-1',
    agencyName: 'Sunrise Care Services',
    entityId: 'client-5',
    entityName: 'Elizabeth S.',
    performedBy: 'manager-1',
    performedByName: 'Sarah Jones',
    reason: 'Moved to another provider',
    timestamp: '2024-05-20T15:00:00Z',
  },
]

// Admin helper functions
export function getAdminById(id: string) {
  return mockPlatformAdmins.find((a) => a.id === id)
}

export function getAgencyById(id: string) {
  return mockAllAgencies.find((a) => a.id === id)
}

export function getGlobalStats() {
  const totalAgencies = mockAllAgencies.length
  const activeAgencies = mockAllAgencies.filter((a) => a.status === 'active').length
  const totalCarers = mockAllAgencies.reduce((sum, a) => sum + a.totalCarers, 0)
  const activeCarers = mockAllAgencies.reduce((sum, a) => sum + a.activeCarers, 0)
  const totalClients = mockAllAgencies.reduce((sum, a) => sum + a.totalClients, 0)
  const activeClients = mockAllAgencies.reduce((sum, a) => sum + a.activeClients, 0)
  const totalAlerts = mockAllAgencies.reduce((sum, a) => sum + a.totalAlerts, 0)
  const unreviewedAlerts = mockAllAgencies.reduce((sum, a) => sum + a.unreviewedAlerts, 0)

  return {
    totalAgencies,
    activeAgencies,
    inactiveAgencies: totalAgencies - activeAgencies,
    totalCarers,
    activeCarers,
    inactiveCarers: totalCarers - activeCarers,
    totalClients,
    activeClients,
    inactiveClients: totalClients - activeClients,
    totalAlerts,
    unreviewedAlerts,
    reviewedAlerts: totalAlerts - unreviewedAlerts,
  }
}
