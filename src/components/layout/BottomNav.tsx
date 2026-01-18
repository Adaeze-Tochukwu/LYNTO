import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  AlertTriangle,
  Home,
  ClipboardList,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'

interface NavItem {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: number
}

export function BottomNav() {
  const { isManager, agency } = useAuth()
  const { getUnreviewedCount } = useApp()

  const unreviewedCount = agency ? getUnreviewedCount(agency.id) : 0

  const managerNav: NavItem[] = [
    { to: '/manager', icon: LayoutDashboard, label: 'Dashboard' },
    {
      to: '/manager/alerts',
      icon: AlertTriangle,
      label: 'Alerts',
      badge: unreviewedCount,
    },
    { to: '/manager/clients', icon: Users, label: 'Clients' },
    { to: '/manager/carers', icon: UserCheck, label: 'Carers' },
  ]

  const carerNav: NavItem[] = [
    { to: '/carer', icon: Home, label: 'Home' },
    { to: '/carer/clients', icon: Users, label: 'Clients' },
    { to: '/carer/history', icon: ClipboardList, label: 'History' },
  ]

  const navItems = isManager ? managerNav : carerNav

  return (
    <nav className="sticky bottom-0 bg-white border-t border-slate-100 px-2 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/manager' || to === '/carer'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-2 px-3 min-w-[64px] transition-colors',
                isActive
                  ? 'text-primary-500'
                  : 'text-slate-400 hover:text-slate-600'
              )
            }
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-risk-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
