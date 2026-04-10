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
  const { isAuthenticated, mode } = useAuth()

  if (!isAuthenticated || !mode) return <Login />

  const storageKey = mode === 'couple' ? 'finance-casal-v1' : 'finance-solo-v1'

  return (
    <FinanceProvider storageKey={storageKey}>
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
