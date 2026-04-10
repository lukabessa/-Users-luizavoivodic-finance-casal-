import { useState } from 'react'
import { TrendingDown, TrendingUp, Zap, X } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import {
  formatCurrency,
  formatMonthYear,
  getDaysInMonth,
  getFirstDayOfWeek,
  getInstallmentInfo,
} from '../utils/finance'
import { EXPENSE_CATEGORY_COLORS } from '../types'

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface DayEvent {
  id: string
  label: string
  value: number
  color: string
  kind: 'expense' | 'income' | 'daily' | 'extra'
}

export default function CalendarPage() {
  const { state } = useFinance()
  const { currentYear, currentMonth, expenses, incomes, dailyExpenses, extraIncomes } = state

  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDow = getFirstDayOfWeek(currentYear, currentMonth)
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth
  const todayDay = isCurrentMonth ? today.getDate() : -1

  // Build events per day
  const eventsByDay: Record<number, DayEvent[]> = {}

  const addEvent = (day: number, ev: DayEvent) => {
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push(ev)
  }

  // Expenses (fixed, variable, installment) — show on due day
  for (const exp of expenses) {
    if (!exp.isActive) continue
    if (exp.type === 'installment') {
      const info = getInstallmentInfo(exp, currentYear, currentMonth)
      if (!info.active) continue
    }
    if (exp.dueDay >= 1 && exp.dueDay <= daysInMonth) {
      addEvent(exp.dueDay, {
        id: exp.id,
        label: exp.name,
        value: exp.type === 'variable' ? 0 : exp.baseValue,
        color: EXPENSE_CATEGORY_COLORS[exp.category],
        kind: 'expense',
      })
    }
  }

  // Fixed incomes — show on receipt day
  for (const inc of incomes) {
    if (!inc.isActive || inc.type !== 'fixed') continue
    if (inc.receiptDay >= 1 && inc.receiptDay <= daysInMonth) {
      addEvent(inc.receiptDay, {
        id: inc.id,
        label: inc.name,
        value: inc.baseValue,
        color: '#10b981',
        kind: 'income',
      })
    }
  }

  // Daily expenses
  const prefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}-`
  for (const d of dailyExpenses) {
    if (!d.date.startsWith(prefix)) continue
    const day = parseInt(d.date.slice(8, 10))
    addEvent(day, {
      id: d.id,
      label: d.description,
      value: d.value,
      color: EXPENSE_CATEGORY_COLORS[d.category],
      kind: 'daily',
    })
  }

  // Extra incomes
  for (const e of extraIncomes) {
    if (!e.date.startsWith(prefix)) continue
    const day = parseInt(e.date.slice(8, 10))
    addEvent(day, {
      id: e.id,
      label: e.name,
      value: e.value,
      color: '#6366f1',
      kind: 'extra',
    })
  }

  // Build calendar grid (6 rows × 7 cols)
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : []

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 capitalize">
        Calendário — {formatMonthYear(currentYear, currentMonth)}
      </h2>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { color: 'bg-red-400', label: 'Despesa' },
          { color: 'bg-green-500', label: 'Receita fixa' },
          { color: 'bg-indigo-400', label: 'Renda extra' },
          { color: 'bg-amber-400', label: 'Gasto diário' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5 text-gray-600">
            <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Week headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEK_DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="border-b border-r border-gray-100 min-h-[70px] sm:min-h-[90px] bg-gray-50/50" />
            }
            const events = eventsByDay[day] ?? []
            const isToday = day === todayDay
            const isSelected = day === selectedDay

            const expenseEvents = events.filter(e => e.kind === 'expense')
            const incomeEvents = events.filter(e => e.kind === 'income')
            const dailyEvents = events.filter(e => e.kind === 'daily')
            const extraEvents = events.filter(e => e.kind === 'extra')

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`
                  border-b border-r border-gray-100 min-h-[70px] sm:min-h-[90px] p-1 sm:p-1.5
                  text-left transition-colors relative
                  ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'}
                  ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                `}
              >
                <span className={`
                  inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full mb-0.5
                  ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}
                `}>
                  {day}
                </span>

                {/* Event dots / pills */}
                <div className="space-y-0.5">
                  {expenseEvents.slice(0, 2).map(ev => (
                    <div key={ev.id} className="flex items-center gap-1 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-400" />
                      <span className="text-[10px] text-gray-600 truncate hidden sm:block">{ev.label}</span>
                    </div>
                  ))}
                  {incomeEvents.slice(0, 1).map(ev => (
                    <div key={ev.id} className="flex items-center gap-1 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-green-500" />
                      <span className="text-[10px] text-green-700 truncate hidden sm:block">{ev.label}</span>
                    </div>
                  ))}
                  {dailyEvents.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-400" />
                      <span className="text-[10px] text-amber-700 hidden sm:block">
                        {dailyEvents.length}x gasto
                      </span>
                    </div>
                  )}
                  {extraEvents.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-indigo-400" />
                      <span className="text-[10px] text-indigo-700 hidden sm:block">
                        {extraEvents.length}x extra
                      </span>
                    </div>
                  )}
                  {/* Overflow indicator */}
                  {events.length > 3 && (
                    <span className="text-[10px] text-gray-400">+{events.length - 3}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">
              Dia {selectedDay} — {String(currentMonth).padStart(2, '0')}/{currentYear}
            </h3>
            <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum evento neste dia.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50">
                  <span className={`p-1.5 rounded-lg ${
                    ev.kind === 'income' || ev.kind === 'extra' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {ev.kind === 'income' || ev.kind === 'extra'
                      ? <TrendingUp size={14} className="text-green-600" />
                      : ev.kind === 'daily'
                      ? <Zap size={14} className="text-amber-600" />
                      : <TrendingDown size={14} className="text-red-600" />
                    }
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{ev.label}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {ev.kind === 'expense' ? 'Vencimento' :
                       ev.kind === 'income' ? 'Recebimento fixo' :
                       ev.kind === 'daily' ? 'Gasto diário' : 'Renda extra'}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ${
                    ev.kind === 'income' || ev.kind === 'extra' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {ev.value > 0 ? formatCurrency(ev.value) : '—'}
                  </span>
                </div>
              ))}

              <div className="flex justify-between pt-2 border-t border-gray-100 text-sm">
                <span className="text-gray-500">
                  Entradas: <span className="font-medium text-green-600">
                    {formatCurrency(selectedEvents.filter(e => e.kind === 'income' || e.kind === 'extra').reduce((s, e) => s + e.value, 0))}
                  </span>
                </span>
                <span className="text-gray-500">
                  Saídas: <span className="font-medium text-red-600">
                    {formatCurrency(selectedEvents.filter(e => e.kind === 'expense' || e.kind === 'daily').reduce((s, e) => s + e.value, 0))}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
