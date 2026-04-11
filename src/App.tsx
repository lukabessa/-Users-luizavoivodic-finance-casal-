import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FinanceProvider } from './context/FinanceContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Incomes from './pages/Incomes'
import Monthly from './pages/Monthly'
import CalendarPage from './pages/Calendar'
import Installments from './pages/Installments'
import DailyExpenses from './pages/DailyExpenses'
import History from './pages/History'
import Settings from './pages/Settings'

function AppRoutes() {
  const { isAuthenticated, mode, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  if (!isAuthenticated || !mode) return <Login />

  return (
    <FinanceProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/despesas" element={<Expenses />} />
          <Route path="/receitas" element={<Incomes />} />
          <Route path="/mensal" element={<Monthly />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/parcelamentos" element={<Installments />} />
          <Route path="/gastos-diarios" element={<DailyExpenses />} />
          <Route path="/historico" element={<History />} />
          <Route path="/configuracoes" element={<Settings />} />
        </Routes>
      </Layout>
    </FinanceProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
