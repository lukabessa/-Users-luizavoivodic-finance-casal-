import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import type { Expense } from '../types'
import { PERSON_LABELS } from '../types'
import { formatCurrency, getInstallmentInfo } from '../utils/finance'
import Modal from '../components/Modal'
import ExpenseForm from '../components/ExpenseForm'

export default function Installments() {
  const { state, deleteExpense } = useFinance()
  const { expenses, currentYear, currentMonth } = state

  const installments = expenses.filter(e => e.type === 'installment')

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)

  const activeNow = installments.filter(e => {
    const info = getInstallmentInfo(e, currentYear, currentMonth)
    return info.active
  })

  const allActive = installments.filter(e => e.isActive)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Parcelamentos</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} /> Novo parcelamento
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{activeNow.length}</p>
          <p className="text-sm text-purple-600">Ativos este mês</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">
            {formatCurrency(activeNow.reduce((s, e) => s + e.baseValue, 0))}
          </p>
          <p className="text-sm text-purple-600">Total este mês</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{allActive.length}</p>
          <p className="text-sm text-purple-600">Total cadastrados</p>
        </div>
      </div>

      {/* Active this month */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Ativos neste mês</h3>
        {activeNow.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            Nenhum parcelamento ativo este mês
          </div>
        ) : (
          <div className="space-y-2">
            {activeNow.map(e => <InstallmentCard key={e.id} expense={e} currentYear={currentYear} currentMonth={currentMonth} onEdit={() => { setEditing(e); setShowForm(true) }} onDelete={() => { if (confirm('Excluir parcelamento?')) deleteExpense(e.id) }} />)}
          </div>
        )}
      </div>

      {/* Others */}
      {installments.filter(e => !activeNow.includes(e)).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Outros parcelamentos</h3>
          <div className="space-y-2">
            {installments.filter(e => !activeNow.includes(e)).map(e => (
              <InstallmentCard key={e.id} expense={e} currentYear={currentYear} currentMonth={currentMonth} onEdit={() => { setEditing(e); setShowForm(true) }} onDelete={() => { if (confirm('Excluir parcelamento?')) deleteExpense(e.id) }} dimmed />
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <Modal
          title={editing ? 'Editar parcelamento' : 'Novo parcelamento'}
          onClose={() => { setShowForm(false); setEditing(null) }}
        >
          <ExpenseForm
            initial={editing ? { ...editing } : { type: 'installment' }}
            onSave={() => { setShowForm(false); setEditing(null) }}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </Modal>
      )}
    </div>
  )
}

function InstallmentCard({
  expense,
  currentYear,
  currentMonth,
  onEdit,
  onDelete,
  dimmed = false,
}: {
  expense: Expense
  currentYear: number
  currentMonth: number
  onEdit: () => void
  onDelete: () => void
  dimmed?: boolean
}) {
  const info = getInstallmentInfo(expense, currentYear, currentMonth)
  const progress = expense.totalInstallments
    ? Math.min(100, ((Math.max(0, info.number - 1)) / expense.totalInstallments) * 100)
    : 0
  const remaining = expense.totalInstallments ? expense.totalInstallments - Math.max(0, info.number - 1) : 0

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${dimmed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">{expense.name}</span>
            {info.active && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                Parcela {info.number}/{expense.totalInstallments}
              </span>
            )}
            {!info.active && info.number > (expense.totalInstallments ?? 0) && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Concluído</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {PERSON_LABELS[expense.responsible]} · Vence dia {expense.dueDay} · Início: {expense.startMonth}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-purple-700">{formatCurrency(expense.baseValue)}<span className="text-xs text-gray-400 font-normal">/parcela</span></p>
          <p className="text-xs text-gray-500">
            Total: {formatCurrency(expense.baseValue * (expense.totalInstallments ?? 1))}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{Math.max(0, info.number - 1)} pago{info.number - 1 !== 1 ? 's' : ''}</span>
          <span>{remaining} restante{remaining !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="flex justify-end gap-1 mt-3">
        <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
          <Pencil size={16} />
        </button>
        <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
