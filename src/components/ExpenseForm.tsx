import { useState } from 'react'
import type { Expense, ExpenseCategory, ExpenseType, Person } from '../types'
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_TYPE_LABELS,
  PERSON_LABELS,
} from '../types'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'

interface ExpenseFormProps {
  initial?: Partial<Expense>
  onSave: () => void
  onCancel: () => void
}

export default function ExpenseForm({ initial, onSave, onCancel }: ExpenseFormProps) {
  const { addExpense, updateExpense } = useFinance()
  const { mode } = useAuth()
  const isCouple = mode === 'couple'
  const now = new Date()
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    category: (initial?.category ?? 'other') as ExpenseCategory,
    type: (initial?.type ?? 'fixed') as ExpenseType,
    baseValue: initial?.baseValue ?? 0,
    dueDay: initial?.dueDay ?? 1,
    responsible: (initial?.responsible ?? 'both') as Person,
    notes: initial?.notes ?? '',
    isActive: initial?.isActive ?? true,
    totalInstallments: initial?.totalInstallments ?? 12,
    startMonth: initial?.startMonth ?? currentYM,
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: Omit<Expense, 'id' | 'createdAt'> = {
      name: form.name,
      category: form.category,
      type: form.type,
      baseValue: Number(form.baseValue),
      dueDay: Number(form.dueDay),
      responsible: form.responsible,
      notes: form.notes,
      isActive: form.isActive,
      ...(form.type === 'installment' && {
        totalInstallments: Number(form.totalInstallments),
        startMonth: form.startMonth,
      }),
    }
    if (initial?.id) {
      updateExpense(initial.id, data)
    } else {
      addExpense(data)
    }
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da conta *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={e => set('name', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ex: Aluguel"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
          <select
            value={form.category}
            onChange={e => set('category', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {(Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select
            value={form.type}
            onChange={e => set('type', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {(Object.entries(EXPENSE_TYPE_LABELS) as [ExpenseType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {form.type === 'variable' ? 'Valor inicial (opcional)' : form.type === 'installment' ? 'Valor da parcela *' : 'Valor *'}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.baseValue}
            onChange={e => set('baseValue', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0,00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dia de vencimento *</label>
          <input
            type="number"
            min="1"
            max="31"
            required
            value={form.dueDay}
            onChange={e => set('dueDay', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {form.type === 'installment' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nº de parcelas *</label>
            <input
              type="number"
              min="2"
              required
              value={form.totalInstallments}
              onChange={e => set('totalInstallments', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês de início *</label>
            <input
              type="month"
              required
              value={form.startMonth}
              onChange={e => set('startMonth', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {isCouple && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
          <select
            value={form.responsible}
            onChange={e => set('responsible', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {(Object.entries(PERSON_LABELS) as [Person, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Observações opcionais"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={e => set('isActive', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">Ativa</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          {initial?.id ? 'Salvar alterações' : 'Adicionar despesa'}
        </button>
      </div>
    </form>
  )
}
