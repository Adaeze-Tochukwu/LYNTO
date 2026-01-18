import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { Shield } from 'lucide-react'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { adminLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await adminLogin(email, password)
      if (success) {
        navigate('/admin')
      } else {
        setError('Invalid email or password')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileLayout className="flex flex-col justify-center items-center min-h-screen py-8 bg-slate-900">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 mt-2">LYNTO Platform Administration</p>
        </div>

        <Card padding="lg" className="bg-slate-800 border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lynto.com"
              required
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="bg-indigo-600 hover:bg-indigo-700 mt-6"
            >
              Sign In to Admin Portal
            </Button>
          </form>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-6">
          Platform Admin access only.
        </p>
      </div>
    </MobileLayout>
  )
}
