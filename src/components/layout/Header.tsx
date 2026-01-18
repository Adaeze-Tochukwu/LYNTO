import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ArrowLeft, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'

interface HeaderProps {
  title: string
  showBack?: boolean
  showLogout?: boolean
  showMenu?: boolean
  onMenuClick?: () => void
  rightAction?: React.ReactNode
  className?: string
}

export function Header({
  title,
  showBack = false,
  showLogout = false,
  showMenu = false,
  onMenuClick,
  rightAction,
  className,
}: HeaderProps) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {showMenu && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="p-2 -ml-2 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
            {user && (
              <p className="text-xs text-slate-500">{user.fullName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rightAction}
          {showLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
