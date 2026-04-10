import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { formatMonthYear } from '../utils/finance'

export default function MonthNav() {
  const { state, setCurrentMonth } = useFinance()
  const { currentYear, currentMonth } = state

  const prev = () => {
    if (currentMonth === 1) setCurrentMonth(currentYear - 1, 12)
    else setCurrentMonth(currentYear, currentMonth - 1)
  }

  const next = () => {
    if (currentMonth === 12) setCurrentMonth(currentYear + 1, 1)
    else setCurrentMonth(currentYear, currentMonth + 1)
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prev}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="text-center">
        <span className="font-semibold text-gray-800 capitalize text-base">
          {formatMonthYear(currentYear, currentMonth)}
        </span>
        {!isCurrentMonth() && (
          <button
            onClick={() => {
              const now = new Date()
              setCurrentMonth(now.getFullYear(), now.getMonth() + 1)
            }}
            className="ml-2 text-xs text-indigo-600 hover:underline"
          >
            Hoje
          </button>
        )}
      </div>
      <button
        onClick={next}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
