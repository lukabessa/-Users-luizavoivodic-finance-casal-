import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatMonthYear, getMonthList, formatMonthShort } from '../utils/finance'
import { EXPENSE_CATEGORY_LABELS } from '../types'

const PIE_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
]

export default function Dashboard() {
  const { state, getMonthSummary } = useFinance()
  const { mode } = useAuth()
  const { currentYear, currentMonth, settings } = state
  const isCouple = mode === 'couple'

  const summary = getMonthSummary(currentYear, currentMonth)

  // Last 6 months
  const months = getMonthList({ year: currentYear, month: currentMonth }, 6).reverse()
  const trendData = months.map(({ year, month }) => {
    const s = getMonthSummary(year, month)
    return { name: formatMonthShort(year, month), Receitas: s.totalIncome, Despesas: s.totalExpenses, Saldo: s.balance }
  })

  // Category pie
  const categoryData = Object.entries(summary.byCategory)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: EXPENSE_CATEGORY_LABELS[k as keyof typeof EXPENSE_CATEGORY_LABELS] ?? k,
      value: v,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // % renda comprometida
  const pctUsed = summary.totalIncome > 0 ? Math.min(100, Math.round((summary.totalExpenses / summary.totalIncome) * 100)) : 0
  const gaugeColor = pctUsed > 90 ? '#ef4444' : pctUsed > 70 ? '#f59e0b' : '#10b981'
  const gaugeData = [{ name: 'usado', value: pctUsed, fill: gaugeColor }]

  // Expense type breakdown
  const typeData = [
    { name: 'Fixas', value: summary.totalFixed, fill: '#6366f1' },
    { name: 'Variáveis', value: summary.totalVariable, fill: '#f59e0b' },
    { name: 'Parcelamentos', value: summary.totalInstallments, fill: '#8b5cf6' },
  ].filter(d => d.value > 0)

  // Category horizontal bars
  const topCategories = [...categoryData].slice(0, 6)

  const balanceColor = summary.balance > 0 ? 'text-green-600' : summary.balance < 0 ? 'text-red-600' : 'text-gray-600'
  const balanceBg = summary.balance > 0 ? 'bg-green-50 border-green-200' : summary.balance < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 capitalize">
        {formatMonthYear(currentYear, currentMonth)}
      </h2>

      {/* ── Row 1: Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total de Receitas"
          value={summary.totalIncome}
          icon={<TrendingUp className="text-green-500" size={20} />}
          bg="bg-green-50 border-green-200"
          text="text-green-600"
        />
        <SummaryCard
          title="Total de Despesas"
          value={summary.totalExpenses}
          icon={<TrendingDown className="text-red-500" size={20} />}
          bg="bg-red-50 border-red-200"
          text="text-red-600"
        />
        <div className={`rounded-xl border p-4 ${balanceBg}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Saldo do Mês</span>
            <Wallet className={balanceColor} size={18} />
          </div>
          <p className={`text-xl font-bold ${balanceColor}`}>{formatCurrency(summary.balance)}</p>
          <p className={`text-xs mt-1 font-semibold ${balanceColor}`}>
            {summary.balance > 0 ? '↑ Superávit' : summary.balance < 0 ? '↓ Déficit' : '→ Zerado'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Compromisso da Renda</span>
            <Target size={18} className="text-indigo-500" />
          </div>
          <p className={`text-xl font-bold ${pctUsed > 90 ? 'text-red-600' : pctUsed > 70 ? 'text-amber-600' : 'text-indigo-600'}`}>
            {pctUsed}%
          </p>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pctUsed}%`, backgroundColor: gaugeColor }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">da renda comprometida</p>
        </div>
      </div>

      {/* ── Row 2: Gauge + type breakdown + couple cards ── */}
      <div className={`grid gap-4 ${isCouple ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Gauge */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 self-start">Renda comprometida</h3>
          <div className="relative">
            <ResponsiveContainer width={180} height={120}>
              <RadialBarChart
                cx="50%"
                cy="85%"
                innerRadius={50}
                outerRadius={80}
                startAngle={180}
                endAngle={0}
                data={[{ value: 100, fill: '#f3f4f6' }, ...gaugeData]}
                barSize={16}
              >
                <RadialBar dataKey="value" cornerRadius={8} background={false} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <span className="text-2xl font-bold" style={{ color: gaugeColor }}>{pctUsed}%</span>
              <span className="text-xs text-gray-400">usado</span>
            </div>
          </div>
          <div className="w-full mt-3 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Receitas</span><span className="font-medium text-green-600">{formatCurrency(summary.totalIncome)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Despesas</span><span className="font-medium text-red-600">{formatCurrency(summary.totalExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Type breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Composição das despesas</h3>
          {typeData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Sem despesas</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={typeData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {typeData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {typeData.map(d => (
                  <div key={d.name} className="flex justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: d.fill }} />
                      {d.name}
                    </span>
                    <span className="font-medium text-gray-700">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Couple: person cards */}
        {isCouple && (
          <div className="space-y-3">
            <PersonCard name={settings.person1Name} income={summary.person1Income} expenses={summary.person1Expenses} />
            <PersonCard name={settings.person2Name} income={summary.person2Income} expenses={summary.person2Expenses} />
          </div>
        )}
      </div>

      {/* ── Row 3: Area chart + category bars ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Evolução dos últimos 6 meses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#colorReceitas)" dot={{ r: 3 }} />
              <Area type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={2} fill="url(#colorDespesas)" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Despesas por categoria</h3>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Nenhuma despesa registrada</div>
          ) : (
            <div className="flex gap-4 items-center">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {categoryData.slice(0, 6).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-gray-600 truncate flex-1">{d.name}</span>
                    <span className="text-xs font-medium text-gray-700 shrink-0">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Category horizontal bars ── */}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top categorias — comparativo com receita</h3>
          <div className="space-y-3">
            {topCategories.map((cat, i) => {
              const pct = summary.totalIncome > 0 ? (cat.value / summary.totalIncome) * 100 : 0
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {cat.name}
                    </span>
                    <span className="text-gray-500">{formatCurrency(cat.value)} <span className="text-gray-400">({pct.toFixed(1)}% da renda)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, pct)}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Row 5: Saldo mensal trend ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Saldo mês a mês</h3>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={trendData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Bar dataKey="Saldo" radius={[4, 4, 0, 0]}>
              {trendData.map((d, i) => (
                <Cell key={i} fill={d.Saldo >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, icon, bg, text }: { title: string; value: number; icon: React.ReactNode; bg: string; text: string }) {
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{title}</span>
        {icon}
      </div>
      <p className={`text-xl font-bold ${text}`}>{formatCurrency(value)}</p>
    </div>
  )
}

function PersonCard({ name, income, expenses }: { name: string; income: number; expenses: number }) {
  const balance = income - expenses
  const pct = income > 0 ? Math.min(100, Math.round((expenses / income) * 100)) : 0
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700 text-sm">{name}</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${balance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
        </span>
      </div>
      <div className="space-y-1 mb-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1"><ArrowUpRight size={11} className="text-green-500" />Receitas</span>
          <span className="font-medium text-green-600">{formatCurrency(income)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1"><ArrowDownRight size={11} className="text-red-500" />Despesas</span>
          <span className="font-medium text-red-600">{formatCurrency(expenses)}</span>
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">{pct}% da renda comprometida</p>
    </div>
  )
}
