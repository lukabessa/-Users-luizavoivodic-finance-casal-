import { useState } from 'react'
import { Plus, Trash2, Pencil, Zap } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import type { DailyExpense, ExpenseCategory, Person } from '../types'
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_COLORS,
  PERSON_LABELS,
} from '../types'
import { formatCurrency, formatMonthYear, padDate } from '../utils/finance'
import Modal from '../components/Modal'

export default function DailyExpenses() {
  const { state, addDailyExpense, updateDailyExpense, deleteDailyExpense, getDailyExpenses } = useFinance()
  const { mode } = useAuth()
  const isCouple = mode === 'couple'
  const { currentYear, currentMonth, settings } = state

  const expenses = getDailyExpenses(currentYear, currentMonth)
    .sort((a, b) => b.date.localeCompare(a.date))

  const total = expenses.reduce((s, e) => s + e.value, 0)

  const today = padDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  )

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DailyExpense | null>(null)
  const [filterCat, setFilterCat] = useState<ExpenseCategory | 'all'>('all')

  const [form, setForm] = useState({
    description: '',
    category: 'food' as ExpenseCategory,
    value: '',
    date: today,
    responsible: 'both' as Person,
    notes: '',
  })

  const resetForm = () => setForm({ description: '', category: 'food', value: '', date: today, responsible: 'both', notes: '' })

  const openEdit = (e: DailyExpense) => {
    setEditing(e)
    setForm({ description: e.description, category: e.category, value: String(e.value), date: e.date, responsible: e.responsible, notes: e.notes ?? '' })
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.description || !form.value) return
    const data: Omit<DailyExpense, 'id'> = {
      description: form.description,
      category: form.category,
      value: Number(form.value),
      date: form.date,
      responsible: form.responsible,
      notes: form.notes,
    }
    if (editing) updateDailyExpense(editing.id, data)
    else addDailyExpense(data)
    setShowForm(false)
    setEditing(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir este gasto?')) deleteDailyExpense(id)
  }

  // Group by date
  const filtered = expenses.filter(e => filterCat === 'all' || e.category === filterCat)
  const grouped: Record<string, DailyExpense[]> = {}
  for (const e of filtered) {
    if (!grouped[e.date]) grouped[e.date] = []
    grouped[e.date].push(e)
  }

  // Category totals
  const byCategory: Record<string, number> = {}
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.value
  }
  const topCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gastos Diários</h2>
          <p className="text-sm text-gray-500">{formatMonthYear(currentYear, currentMonth)}</p>
        </div>
        <button
          onClick={() => { setEditing(null); resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} /> Novo gasto
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-700 font-medium">Total do mês</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{formatCurrency(total)}</p>
          <p className="text-xs text-amber-600 mt-0.5">{expenses.length} lançamentos</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-medium mb-2">Por categoria</p>
          <div className="space-y-1">
            {topCats.map(([cat, val]) => (
              <div key={cat} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-xs text-gray-600 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_CATEGORY_COLORS[cat as ExpenseCategory] }} />
                  {EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory]}
                </span>
                <span className="text-xs font-medium text-gray-700 shrink-0 ml-1">{formatCurrency(val)}</span>
              </div>
            ))}
            {topCats.length === 0 && <p className="text-xs text-gray-400">Sem gastos</p>}
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCat('all')}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${filterCat === 'all' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
        >
          Todas
        </button>
        {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => {
          if (!byCategory[k]) return null
          return (
            <button
              key={k}
              onClick={() => setFilterCat(k as ExpenseCategory)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${filterCat === k ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              {v}
            </button>
          )
        })}
      </div>

      {/* Grouped list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <Zap size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum gasto diário registrado</p>
          <p className="text-xs mt-1">Adicione gastos como gasolina, almoço, compras rápidas...</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, items]) => {
          const [y, m, d] = date.split('-')
          const dateLabel = `${d}/${m}/${y}`
          const dayTotal = items.reduce((s, e) => s + e.value, 0)
          return (
            <div key={date}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{dateLabel}</span>
                <span className="text-xs font-medium text-gray-600">{formatCurrency(dayTotal)}</span>
              </div>
              <div className="space-y-1.5">
                {items.map(e => (
                  <div key={e.id} className="bg-white rounded-xl border border-gray-200 px-3 py-2.5 flex items-center gap-3">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: EXPENSE_CATEGORY_COLORS[e.category] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{e.description}</p>
                      <p className="text-xs text-gray-400">
                        {EXPENSE_CATEGORY_LABELS[e.category]}
                        {isCouple && ` · ${PERSON_LABELS[e.responsible]}`}
                      </p>
                    </div>
                    <span className="font-semibold text-red-600 text-sm shrink-0">{formatCurrency(e.value)}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(e)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      {showForm && (
        <Modal
          title={editing ? 'Editar gasto' : 'Novo gasto diário'}
          onClose={() => { setShowForm(false); setEditing(null); resetForm() }}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <input
                type="text"
                autoFocus
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Ex: Almoço, gasolina, farmácia..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {(Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            {isCouple && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <select
                  value={form.responsible}
                  onChange={e => setForm(f => ({ ...f, responsible: e.target.value as Person }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {(Object.entries(PERSON_LABELS) as [Person, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v === 'Pessoa 1' ? settings.person1Name : v === 'Pessoa 2' ? settings.person2Name : v}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Opcional"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => { setShowForm(false); setEditing(null); resetForm() }} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium">
                {editing ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
