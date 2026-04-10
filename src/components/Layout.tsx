import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  CalendarDays,
  Calendar,
  History,
  CreditCard,
  Settings,
  Heart,
  LogOut,
  UserCircle,
  Users,
  Menu,
  X,
  Zap,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import MonthNav from './MonthNav'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/despesas', label: 'Despesas', icon: TrendingDown },
  { to: '/receitas', label: 'Receitas', icon: TrendingUp },
  { to: '/mensal', label: 'Mês Atual', icon: CalendarDays },
  { to: '/calendario', label: 'Calendário', icon: Calendar },
  { to: '/parcelamentos', label: 'Parcelamentos', icon: CreditCard },
  { to: '/gastos-diarios', label: 'Gastos Diários', icon: Zap },
  { to: '/historico', label: 'Histórico', icon: History },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { state } = useFinance()
  const { logout, username, mode } = useAuth()
  const isCouple = mode === 'couple'
  const [open, setOpen] = useState(false)

  const sidebarContent = (
    <>
      <div className="px-5 py-4 border-b border-indigo-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-pink-400 shrink-0" fill="currentColor" />
            <h1 className="font-bold text-base leading-tight">Finanças Pessoais</h1>
          </div>
          {/* Close btn — mobile only */}
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-indigo-300 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${isCouple ? 'bg-indigo-700 text-indigo-200' : 'bg-purple-700 text-purple-200'}`}>
            {isCouple ? <Users size={10} /> : <UserCircle size={10} />}
            {isCouple ? 'Casal' : 'Solo'}
          </span>
          <p className="text-indigo-300 text-xs truncate">
            {isCouple
              ? `${state.settings.person1Name} & ${state.settings.person2Name}`
              : state.settings.person1Name}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-indigo-800">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
          <UserCircle size={17} className="text-indigo-300 shrink-0" />
          <span className="text-indigo-200 text-sm flex-1 truncate">{username}</span>
          <button
            onClick={logout}
            title="Sair"
            className="text-indigo-400 hover:text-white hover:bg-indigo-700 p-1 rounded-lg transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
        <p className="text-indigo-500 text-xs text-center mt-1">v1.0 · dados locais</p>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Desktop sidebar (always visible) ── */}
      <aside className="hidden lg:flex w-56 xl:w-64 bg-indigo-900 text-white flex-col flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-indigo-900 text-white flex flex-col z-40
          transition-transform duration-250 ease-in-out
          lg:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors shrink-0"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <MonthNav />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
