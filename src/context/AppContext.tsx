import {
  createContext,
  useContext,
  useState,
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
import {
  mockClients,
  mockCarers,
  mockVisitEntries,
  mockAlerts,
} from '@/data/mockData'
import { getSymptomById } from '@/data/symptoms'
import { generateId } from '@/lib/utils'

interface AppContextType {
  // Data
  clients: Client[]
  carers: Carer[]
  visitEntries: VisitEntry[]
  alerts: Alert[]

  // Client actions
  addClient: (displayName: string, internalReference?: string) => Client
  updateClientStatus: (
    clientId: string,
    status: 'active' | 'inactive',
    reason?: ClientDeactivationReason,
    note?: string
  ) => void
  assignCarerToClient: (clientId: string, carerId: string) => void
  unassignCarerFromClient: (clientId: string, carerId: string) => void
  getClientById: (id: string) => Client | undefined
  getClientsForCarer: (carerId: string) => Client[]

  // Carer actions
  addCarer: (fullName: string, email: string) => Carer
  deactivateCarer: (carerId: string, reason: CarerDeactivationReason) => void
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
  ) => VisitEntry
  addCorrectionNote: (visitEntryId: string, carerId: string, text: string) => void
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
  ) => void
  getAlertById: (id: string) => Alert | undefined
  getUnreviewedCount: (agencyId: string) => number
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [carers, setCarers] = useState<Carer[]>(mockCarers)
  const [visitEntries, setVisitEntries] = useState<VisitEntry[]>(mockVisitEntries)
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)

  // Client actions
  const addClient = useCallback(
    (displayName: string, internalReference?: string): Client => {
      const newClient: Client = {
        id: `client-${generateId()}`,
        displayName,
        internalReference,
        agencyId: 'agency-1', // In real app, get from auth context
        status: 'active',
        createdAt: new Date().toISOString(),
      }
      setClients((prev) => [...prev, newClient])
      return newClient
    },
    []
  )

  const updateClientStatus = useCallback(
    (
      clientId: string,
      status: 'active' | 'inactive',
      reason?: ClientDeactivationReason,
      note?: string
    ) => {
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
    },
    []
  )

  const assignCarerToClient = useCallback((clientId: string, carerId: string) => {
    setCarers((prev) =>
      prev.map((c) =>
        c.id === carerId && !c.assignedClientIds.includes(clientId)
          ? { ...c, assignedClientIds: [...c.assignedClientIds, clientId] }
          : c
      )
    )
  }, [])

  const unassignCarerFromClient = useCallback((clientId: string, carerId: string) => {
    setCarers((prev) =>
      prev.map((c) =>
        c.id === carerId
          ? {
              ...c,
              assignedClientIds: c.assignedClientIds.filter((id) => id !== clientId),
            }
          : c
      )
    )
  }, [])

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
  const addCarer = useCallback((fullName: string, email: string): Carer => {
    const newCarer: Carer = {
      id: `carer-${generateId()}`,
      email,
      fullName,
      role: 'carer',
      status: 'pending',
      agencyId: 'agency-1', // In real app, get from auth context
      createdAt: new Date().toISOString(),
      assignedClientIds: [],
    }
    setCarers((prev) => [...prev, newCarer])
    return newCarer
  }, [])

  const deactivateCarer = useCallback(
    (carerId: string, reason: CarerDeactivationReason) => {
      setCarers((prev) =>
        prev.map((c) =>
          c.id === carerId
            ? {
                ...c,
                status: 'inactive',
                deactivationReason: reason,
                deactivatedAt: new Date().toISOString(),
              }
            : c
        )
      )
    },
    []
  )

  const getCarerById = useCallback(
    (id: string) => carers.find((c) => c.id === id),
    [carers]
  )

  const getActiveCarers = useCallback(
    () => carers.filter((c) => c.status === 'active'),
    [carers]
  )

  // Risk calculation
  const calculateRisk = (
    selectedSymptomIds: string[],
    vitals: Vitals
  ): { score: number; riskLevel: RiskLevel; reasons: string[] } => {
    let score = 0
    const reasons: string[] = []

    // Calculate from symptoms
    for (const symptomId of selectedSymptomIds) {
      const symptom = getSymptomById(symptomId)
      if (symptom) {
        score += symptom.points
        reasons.push(symptom.label)
      }
    }

    // Calculate from vitals (abnormal values)
    if (vitals.temperature !== undefined) {
      if (vitals.temperature >= 38) {
        score += 2
        reasons.push(`High temperature (${vitals.temperature}°C)`)
      } else if (vitals.temperature < 36) {
        score += 1
        reasons.push(`Low temperature (${vitals.temperature}°C)`)
      }
    }

    if (vitals.pulse !== undefined) {
      if (vitals.pulse > 100 || vitals.pulse < 50) {
        score += 1
        reasons.push(`Abnormal pulse (${vitals.pulse} bpm)`)
      }
    }

    if (vitals.oxygenSaturation !== undefined && vitals.oxygenSaturation < 95) {
      score += 2
      reasons.push(`Low oxygen saturation (${vitals.oxygenSaturation}%)`)
    }

    if (vitals.respiratoryRate !== undefined) {
      if (vitals.respiratoryRate > 20 || vitals.respiratoryRate < 12) {
        score += 1
        reasons.push(`Abnormal respiratory rate (${vitals.respiratoryRate}/min)`)
      }
    }

    if (vitals.systolicBp !== undefined && vitals.diastolicBp !== undefined) {
      if (vitals.systolicBp > 140 || vitals.systolicBp < 90) {
        score += 1
        reasons.push(`Abnormal blood pressure (${vitals.systolicBp}/${vitals.diastolicBp})`)
      }
    }

    // Determine risk level
    let riskLevel: RiskLevel = 'green'
    if (score >= 5) {
      riskLevel = 'red'
    } else if (score >= 3) {
      riskLevel = 'amber'
    }

    return { score, riskLevel, reasons }
  }

  // Visit entry actions
  const createVisitEntry = useCallback(
    (
      clientId: string,
      carerId: string,
      agencyId: string,
      selectedSymptomIds: string[],
      vitals: Vitals,
      note: string
    ): VisitEntry => {
      const { score, riskLevel, reasons } = calculateRisk(selectedSymptomIds, vitals)

      const newEntry: VisitEntry = {
        id: `visit-${generateId()}`,
        clientId,
        carerId,
        agencyId,
        selectedSymptomIds,
        vitals,
        note,
        score,
        riskLevel,
        reasons,
        createdAt: new Date().toISOString(),
      }

      setVisitEntries((prev) => [...prev, newEntry])

      // Create alert if amber or red
      if (riskLevel === 'amber' || riskLevel === 'red') {
        const newAlert: Alert = {
          id: `alert-${generateId()}`,
          visitEntryId: newEntry.id,
          clientId,
          carerId,
          agencyId,
          riskLevel,
          isReviewed: false,
          createdAt: new Date().toISOString(),
        }
        setAlerts((prev) => [...prev, newAlert])
      }

      return newEntry
    },
    []
  )

  const addCorrectionNote = useCallback(
    (visitEntryId: string, carerId: string, text: string) => {
      const note: CorrectionNote = {
        id: `note-${generateId()}`,
        text,
        carerId,
        createdAt: new Date().toISOString(),
      }

      setVisitEntries((prev) =>
        prev.map((v) =>
          v.id === visitEntryId
            ? { ...v, correctionNotes: [...(v.correctionNotes || []), note] }
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
    (
      filter: 'unreviewed' | 'reviewed' | 'amber' | 'red' | 'all',
      agencyId: string
    ) => {
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
    (
      alertId: string,
      managerId: string,
      actionTaken: AlertActionTaken,
      note?: string
    ) => {
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

  const value: AppContextType = {
    clients,
    carers,
    visitEntries,
    alerts,
    addClient,
    updateClientStatus,
    assignCarerToClient,
    unassignCarerFromClient,
    getClientById,
    getClientsForCarer,
    addCarer,
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
