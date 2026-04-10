import { useState } from 'react'
import type { Income, IncomeCategory, IncomeType, Person } from '../types'
import { INCOME_CATEGORY_LABELS, INCOME_TYPE_LABELS, PERSON_LABELS } from '../types'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'

interface IncomeFormProps {
  initial?: Partial<Income>
  onSave: () => void
  onCancel: () => void
}

export default function IncomeForm({ initial, onSave, onCancel }: IncomeFormProps) {
  const { addIncome, updateIncome } = useFinance()
  const { mode } = useAuth()
  const isCouple = mode === 'couple'

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    category: (initial?.category ?? 'salary') as IncomeCategory,
    type: (initial?.type ?? 'fixed') as IncomeType,
    baseValue: initial?.baseValue ?? 0,
    receiptDay: initial?.receiptDay ?? 5,
    responsible: (initial?.responsible ?? 'person1') as Person,
    notes: initial?.notes ?? '',
    isActive: initial?.isActive ?? true,
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: Omit<Income, 'id' | 'createdAt'> = {
      name: form.name,
      category: form.category,
      type: form.type,
      baseValue: Number(form.baseValue),
      receiptDay: Number(form.receiptDay),
      responsible: form.responsible,
      notes: form.notes,
      isActive: form.isActive,
    }
    if (initial?.id) updateIncome(initial.id, data)
    else addIncome(data)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={e => set('name', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Ex: Salário"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
          <select
            value={form.category}
            onChange={e => set('category', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {(Object.entries(INCOME_CATEGORY_LABELS) as [IncomeCategory, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select
            value={form.type}
            onChange={e => set('type', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {(Object.entries(INCOME_TYPE_LABELS) as [IncomeType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={form.baseValue}
            onChange={e => set('baseValue', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dia de recebimento *</label>
          <input
            type="number"
            min="1"
            max="31"
            required
            value={form.receiptDay}
            onChange={e => set('receiptDay', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {isCouple && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
          <select
            value={form.responsible}
            onChange={e => set('responsible', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
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
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
          {initial?.id ? 'Salvar alterações' : 'Adicionar receita'}
        </button>
      </div>
    </form>
  )
}
