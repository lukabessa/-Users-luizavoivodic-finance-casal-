import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import type { Expense, ExpenseType } from '../types'
import { EXPENSE_CATEGORY_LABELS, EXPENSE_TYPE_LABELS, PERSON_LABELS } from '../types'
import { formatCurrency, getInstallmentInfo } from '../utils/finance'
import Modal from '../components/Modal'
import ExpenseForm from '../components/ExpenseForm'

const TYPE_COLORS: Record<ExpenseType, string> = {
  fixed: 'bg-blue-100 text-blue-700',
  variable: 'bg-amber-100 text-amber-700',
  installment: 'bg-purple-100 text-purple-700',
}

export default function Expenses() {
  const { state, deleteExpense } = useFinance()
  const { expenses, currentYear, currentMonth } = state

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [filter, setFilter] = useState<ExpenseType | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = expenses.filter(e => filter === 'all' || e.type === filter)

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir esta despesa? Os registros mensais relacionados serão mantidos.')) {
      deleteExpense(id)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Despesas</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Nova despesa
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'fixed', 'variable', 'installment'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === t
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t === 'all' ? 'Todas' : EXPENSE_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p>Nenhuma despesa cadastrada</p>
          </div>
        )}
        {filtered.map(expense => {
          const isExpanded = expandedId === expense.id
          const installInfo = expense.type === 'installment'
            ? getInstallmentInfo(expense, currentYear, currentMonth)
            : null

          return (
            <div key={expense.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${!expense.isActive ? 'opacity-60' : ''}`}>
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{expense.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[expense.type]}`}>
                      {EXPENSE_TYPE_LABELS[expense.type]}
                    </span>
                    {!expense.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inativa</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex gap-3">
                    <span>{EXPENSE_CATEGORY_LABELS[expense.category]}</span>
                    <span>{PERSON_LABELS[expense.responsible]}</span>
                    <span>Vence dia {expense.dueDay}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-800">
                    {expense.type === 'variable' ? 'Variável' : formatCurrency(expense.baseValue)}
                  </p>
                  {expense.type === 'installment' && installInfo && (
                    <p className="text-xs text-purple-600">
                      {installInfo.active
                        ? `${installInfo.number}/${expense.totalInstallments} no mês atual`
                        : 'Inativa este mês'}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : expense.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => { setEditing(expense); setShowForm(true) }}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {isExpanded && expense.notes && (
                <div className="px-4 pb-3 text-sm text-gray-500 border-t border-gray-100 pt-2">
                  <span className="font-medium text-gray-600">Obs:</span> {expense.notes}
                </div>
              )}

              {isExpanded && expense.type === 'installment' && (
                <div className="px-4 pb-3 border-t border-gray-100 pt-2">
                  <InstallmentProgress expense={expense} currentYear={currentYear} currentMonth={currentMonth} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {(showForm) && (
        <Modal
          title={editing ? 'Editar despesa' : 'Nova despesa'}
          onClose={() => { setShowForm(false); setEditing(null) }}
        >
          <ExpenseForm
            initial={editing ?? undefined}
            onSave={() => { setShowForm(false); setEditing(null) }}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </Modal>
      )}
    </div>
  )
}

function InstallmentProgress({ expense, currentYear, currentMonth }: { expense: Expense; currentYear: number; currentMonth: number }) {
  if (!expense.startMonth || !expense.totalInstallments) return null
  const info = getInstallmentInfo(expense, currentYear, currentMonth)
  const pct = Math.min(100, ((info.number - 1) / expense.totalInstallments) * 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Progresso do parcelamento</span>
        <span>{info.active ? info.number : Math.max(0, info.number - 1)}/{expense.totalInstallments} parcelas</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">
        Início: {expense.startMonth} · Total: {formatCurrency(expense.baseValue * expense.totalInstallments)}
      </p>
    </div>
  )
}
