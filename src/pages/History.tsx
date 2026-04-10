import { useFinance } from '../context/FinanceContext'
import { formatCurrency, formatMonthYear, getMonthList } from '../utils/finance'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { formatMonthShort } from '../utils/finance'

export default function History() {
  const { state, getMonthSummary, setCurrentMonth } = useFinance()
  const { currentYear, currentMonth } = state

  // Show last 12 months
  const months = getMonthList({ year: currentYear, month: currentMonth }, 12).reverse()

  const rows = months.map(({ year, month }) => {
    const s = getMonthSummary(year, month)
    return { year, month, ...s }
  })

  const chartData = rows.map(r => ({
    name: formatMonthShort(r.year, r.month),
    Receitas: r.totalIncome,
    Despesas: r.totalExpenses,
    Saldo: r.balance,
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Histórico</h2>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Evolução dos últimos 12 meses</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Saldo" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Mês</th>
              <th className="text-right px-4 py-3 text-gray-600 font-semibold">Receitas</th>
              <th className="text-right px-4 py-3 text-gray-600 font-semibold">Fixas</th>
              <th className="text-right px-4 py-3 text-gray-600 font-semibold">Variáveis</th>
              <th className="text-right px-4 py-3 text-gray-600 font-semibold">Parcelamentos</th>
              <th className="text-right px-4 py-3 text-gray-600 font-semibold">Total Desp.</th>
              <th className="text-right px-4 py-3 text-gray-600 font-semibold">Saldo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const isCurrentMonth = r.year === currentYear && r.month === currentMonth
              return (
                <tr
                  key={`${r.year}-${r.month}`}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isCurrentMonth ? 'bg-indigo-50' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800 capitalize">
                    {formatMonthYear(r.year, r.month)}
                    {isCurrentMonth && <span className="ml-2 text-xs text-indigo-600 font-medium">atual</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">{formatCurrency(r.totalIncome)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(r.totalFixed)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(r.totalVariable)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(r.totalInstallments)}</td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">{formatCurrency(r.totalExpenses)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${r.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(r.balance)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setCurrentMonth(r.year, r.month)}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
