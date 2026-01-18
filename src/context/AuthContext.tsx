import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Manager, Carer, Agency } from '@/types'
import { mockManager, mockCarers, mockAgency } from '@/data/mockData'

interface AuthContextType {
  user: User | null
  agency: Agency | null
  isAuthenticated: boolean
  isManager: boolean
  isCarer: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  registerAgency: (agencyName: string, fullName: string, email: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [agency, setAgency] = useState<Agency | null>(null)

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if manager
    if (email.toLowerCase() === mockManager.email.toLowerCase()) {
      setUser(mockManager)
      setAgency(mockAgency)
      return true
    }

    // Check if carer
    const carer = mockCarers.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.status === 'active'
    )
    if (carer) {
      setUser(carer)
      setAgency(mockAgency)
      return true
    }

    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAgency(null)
  }, [])

  const registerAgency = useCallback(
    async (
      _agencyName: string,
      fullName: string,
      email: string,
      _password: string
    ): Promise<boolean> => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Create new agency and manager (in real app this would be API call)
      const newAgency: Agency = {
        id: 'agency-new',
        name: _agencyName,
        createdAt: new Date().toISOString(),
        managerId: 'manager-new',
      }

      const newManager: Manager = {
        id: 'manager-new',
        email,
        fullName,
        role: 'manager',
        status: 'active',
        agencyId: newAgency.id,
        createdAt: new Date().toISOString(),
      }

      setUser(newManager)
      setAgency(newAgency)
      return true
    },
    []
  )

  const value: AuthContextType = {
    user,
    agency,
    isAuthenticated: !!user,
    isManager: user?.role === 'manager',
    isCarer: user?.role === 'carer',
    login,
    logout,
    registerAgency,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hook to get typed user
export function useManager(): Manager | null {
  const { user, isManager } = useAuth()
  return isManager ? (user as Manager) : null
}

export function useCarer(): Carer | null {
  const { user, isCarer } = useAuth()
  return isCarer ? (user as Carer) : null
}
