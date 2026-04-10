import { useState } from 'react'
import { Plus, Pencil, Trash2, AlertCircle, Sparkles } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import type { Income, IncomeType, ExtraIncome, IncomeCategory, Person } from '../types'
import { INCOME_CATEGORY_LABELS, INCOME_TYPE_LABELS, PERSON_LABELS } from '../types'
import { formatCurrency, formatMonthYear, padDate } from '../utils/finance'
import Modal from '../components/Modal'
import IncomeForm from '../components/IncomeForm'

const TYPE_COLORS: Record<IncomeType, string> = {
  fixed: 'bg-green-100 text-green-700',
  variable: 'bg-teal-100 text-teal-700',
}

type Tab = 'recorrentes' | 'extras'

export default function Incomes() {
  const { state, deleteIncome, addExtraIncome, updateExtraIncome, deleteExtraIncome, getExtraIncomes } = useFinance()
  const { mode } = useAuth()
  const isCouple = mode === 'couple'
  const { incomes, currentYear, currentMonth, settings } = state

  const [tab, setTab] = useState<Tab>('recorrentes')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Income | null>(null)
  const [filter, setFilter] = useState<IncomeType | 'all'>('all')

  // Extra income form
  const today = padDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
  const [showExtraForm, setShowExtraForm] = useState(false)
  const [editingExtra, setEditingExtra] = useState<ExtraIncome | null>(null)
  const [extraForm, setExtraForm] = useState({
    name: '',
    value: '',
    date: today,
    category: 'other' as IncomeCategory,
    responsible: 'person1' as Person,
    notes: '',
  })

  const extraIncomes = getExtraIncomes(currentYear, currentMonth)
  const totalExtra = extraIncomes.reduce((s, e) => s + e.value, 0)
  const filtered = incomes.filter(i => filter === 'all' || i.type === filter)
  const totalFixed = incomes.filter(i => i.type === 'fixed' && i.isActive).reduce((s, i) => s + i.baseValue, 0)

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir esta receita?')) deleteIncome(id)
  }

  const resetExtraForm = () => setExtraForm({ name: '', value: '', date: today, category: 'other', responsible: 'person1', notes: '' })

  const openEditExtra = (e: ExtraIncome) => {
    setEditingExtra(e)
    setExtraForm({ name: e.name, value: String(e.value), date: e.date, category: e.category, responsible: e.responsible, notes: e.notes ?? '' })
    setShowExtraForm(true)
  }

  const handleSaveExtra = () => {
    if (!extraForm.name || !extraForm.value) return
    const data: Omit<ExtraIncome, 'id'> = {
      name: extraForm.name,
      value: Number(extraForm.value),
      date: extraForm.date,
      category: extraForm.category,
      responsible: extraForm.responsible,
      notes: extraForm.notes,
    }
    if (editingExtra) updateExtraIncome(editingExtra.id, data)
    else addExtraIncome(data)
    setShowExtraForm(false)
    setEditingExtra(null)
    resetExtraForm()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Receitas</h2>
        {tab === 'recorrentes' ? (
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Plus size={16} /> Nova receita
          </button>
        ) : (
          <button
            onClick={() => { setEditingExtra(null); resetExtraForm(); setShowExtraForm(true) }}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} /> Renda extra
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {([
          { id: 'recorrentes', label: 'Receitas recorrentes' },
          { id: 'extras', label: `Rendas extras (${formatMonthYear(currentYear, currentMonth).split(' ')[0]})` },
        ] as { id: Tab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Recorrentes ── */}
      {tab === 'recorrentes' && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-700 font-medium">Receitas fixas mensais (ativas)</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalFixed)}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['all', 'fixed', 'variable'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  filter === t ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t === 'all' ? 'Todas' : INCOME_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>Nenhuma receita cadastrada</p>
              </div>
            )}
            {filtered.map(income => (
              <div key={income.id} className={`bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 ${!income.isActive ? 'opacity-60' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{income.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[income.type]}`}>
                      {INCOME_TYPE_LABELS[income.type]}
                    </span>
                    {!income.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inativa</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex gap-2 flex-wrap">
                    <span>{INCOME_CATEGORY_LABELS[income.category]}</span>
                    {isCouple && <span>{PERSON_LABELS[income.responsible]}</span>}
                    <span>Dia {income.receiptDay}</span>
                  </div>
                  {income.notes && <p className="text-xs text-gray-400 mt-0.5">{income.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-green-600">{formatCurrency(income.baseValue)}</p>
                  <p className="text-xs text-gray-400">{income.type === 'fixed' ? 'por mês' : 'variável'}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditing(income); setShowForm(true) }} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(income.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Rendas extras ── */}
      {tab === 'extras' && (
        <>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-700 font-medium">Total de rendas extras no mês</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{formatCurrency(totalExtra)}</p>
            </div>
            <Sparkles size={32} className="text-indigo-300" />
          </div>

          <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            Rendas extras são entradas pontuais — venda de item, bico, prêmio, etc. Informe a data exata do recebimento.
          </p>

          <div className="space-y-2">
            {extraIncomes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                <Sparkles size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhuma renda extra este mês</p>
              </div>
            ) : (
              extraIncomes.sort((a, b) => b.date.localeCompare(a.date)).map(e => {
                const [y, m, d] = e.date.split('-')
                return (
                  <div key={e.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">{e.name}</p>
                      <div className="text-xs text-gray-400 flex gap-2">
                        <span>{INCOME_CATEGORY_LABELS[e.category]}</span>
                        {isCouple && <span>{PERSON_LABELS[e.responsible]}</span>}
                        <span>{d}/{m}/{y}</span>
                      </div>
                      {e.notes && <p className="text-xs text-gray-400">{e.notes}</p>}
                    </div>
                    <p className="font-semibold text-indigo-600 shrink-0">{formatCurrency(e.value)}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEditExtra(e)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => { if (confirm('Excluir esta renda extra?')) deleteExtraIncome(e.id) }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* Recurring income form */}
      {showForm && (
        <Modal
          title={editing ? 'Editar receita' : 'Nova receita recorrente'}
          onClose={() => { setShowForm(false); setEditing(null) }}
        >
          <IncomeForm
            initial={editing ?? undefined}
            onSave={() => { setShowForm(false); setEditing(null) }}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </Modal>
      )}

      {/* Extra income form */}
      {showExtraForm && (
        <Modal
          title={editingExtra ? 'Editar renda extra' : 'Nova renda extra'}
          onClose={() => { setShowExtraForm(false); setEditingExtra(null); resetExtraForm() }}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-500 bg-indigo-50 rounded-lg p-2">
              Use para registrar uma entrada pontual — venda de algo, bico, prêmio, etc.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                autoFocus
                value={extraForm.name}
                onChange={e => setExtraForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Venda do celular, freela..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={extraForm.value}
                  onChange={e => setExtraForm(f => ({ ...f, value: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data recebida *</label>
                <input
                  type="date"
                  value={extraForm.date}
                  onChange={e => setExtraForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={extraForm.category}
                onChange={e => setExtraForm(f => ({ ...f, category: e.target.value as IncomeCategory }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {(Object.entries(INCOME_CATEGORY_LABELS) as [IncomeCategory, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            {isCouple && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <select
                  value={extraForm.responsible}
                  onChange={e => setExtraForm(f => ({ ...f, responsible: e.target.value as Person }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="person1">{settings.person1Name}</option>
                  <option value="person2">{settings.person2Name}</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <input
                type="text"
                value={extraForm.notes}
                onChange={e => setExtraForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Opcional"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => { setShowExtraForm(false); setEditingExtra(null); resetExtraForm() }} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveExtra} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                {editingExtra ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
