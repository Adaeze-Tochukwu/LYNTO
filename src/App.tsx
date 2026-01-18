import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AppProvider } from '@/context/AppContext'

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { TermsPage } from '@/pages/auth/TermsPage'

// Manager pages
import { ManagerDashboard } from '@/pages/manager/ManagerDashboard'
import { AlertsPage } from '@/pages/manager/AlertsPage'
import { AlertDetailPage } from '@/pages/manager/AlertDetailPage'
import { ClientsPage } from '@/pages/manager/ClientsPage'
import { ClientDetailPage } from '@/pages/manager/ClientDetailPage'
import { CarersPage } from '@/pages/manager/CarersPage'
import { CarerDetailPage } from '@/pages/manager/CarerDetailPage'

// Carer pages
import { CarerHome } from '@/pages/carer/CarerHome'
import { CarerClientsPage } from '@/pages/carer/CarerClientsPage'
import { CarerHistoryPage } from '@/pages/carer/CarerHistoryPage'
import { VisitEntryPage } from '@/pages/carer/VisitEntryPage'
import { EntryDetailPage } from '@/pages/carer/EntryDetailPage'

// Protected route component
function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode
  allowedRole?: 'manager' | 'carer'
}) {
  const { isAuthenticated, isManager, isCarer } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole === 'manager' && !isManager) {
    return <Navigate to="/carer" replace />
  }

  if (allowedRole === 'carer' && !isCarer) {
    return <Navigate to="/manager" replace />
  }

  return <>{children}</>
}

// Auth route - redirect if already logged in
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isManager } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={isManager ? '/manager' : '/carer'} replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        }
      />
      <Route path="/terms" element={<TermsPage />} />

      {/* Manager routes */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRole="manager">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/alerts"
        element={
          <ProtectedRoute allowedRole="manager">
            <AlertsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/alerts/:id"
        element={
          <ProtectedRoute allowedRole="manager">
            <AlertDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/clients"
        element={
          <ProtectedRoute allowedRole="manager">
            <ClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/clients/:id"
        element={
          <ProtectedRoute allowedRole="manager">
            <ClientDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/carers"
        element={
          <ProtectedRoute allowedRole="manager">
            <CarersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/carers/:id"
        element={
          <ProtectedRoute allowedRole="manager">
            <CarerDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Carer routes */}
      <Route
        path="/carer"
        element={
          <ProtectedRoute allowedRole="carer">
            <CarerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carer/clients"
        element={
          <ProtectedRoute allowedRole="carer">
            <CarerClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carer/history"
        element={
          <ProtectedRoute allowedRole="carer">
            <CarerHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carer/visit/:clientId"
        element={
          <ProtectedRoute allowedRole="carer">
            <VisitEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carer/entry/:id"
        element={
          <ProtectedRoute allowedRole="carer">
            <EntryDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
