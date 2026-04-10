import { useState } from 'react'
import { CheckCircle2, Clock, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import type { ExpenseType, IncomeType, Person } from '../types'
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_TYPE_LABELS,
  INCOME_TYPE_LABELS,
  PERSON_LABELS,
} from '../types'
import { formatCurrency, formatMonthYear, generateId } from '../utils/finance'
import Modal from '../components/Modal'

type TabType = 'expenses' | 'incomes'

export default function Monthly() {
  const {
    state,
    updateMonthlyExpense,
    deleteMonthlyExpense,
    addMonthlyIncome,
    updateMonthlyIncome,
    deleteMonthlyIncome,
    addVariableEntry,
    deleteVariableEntry,
    getMonthlyExpenses,
    getMonthlyIncomes,
    getVariableEntries,
    getVariableTotal,
  } = useFinance()

  const { currentYear, currentMonth, expenses, incomes, settings } = state
  const expMap = Object.fromEntries(expenses.map(e => [e.id, e]))
  const incMap = Object.fromEntries(incomes.map(i => [i.id, i]))

  const [tab, setTab] = useState<TabType>('expenses')
  const [filterType, setFilterType] = useState<ExpenseType | IncomeType | 'all'>('all')
  const [filterPerson, setFilterPerson] = useState<Person | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [variableModal, setVariableModal] = useState<{ expenseId: string; name: string } | null>(null)
  const [variableForm, setVariableForm] = useState({ value: '', description: '', date: new Date().toISOString().slice(0, 10) })
  const [editValueModal, setEditValueModal] = useState<{ id: string; value: number; label: string } | null>(null)
  const [editValueInput, setEditValueInput] = useState('')
  const [addIncomeModal, setAddIncomeModal] = useState(false)
  const [incomeForm, setIncomeForm] = useState({ name: '', value: '', responsible: 'person1' as Person, notes: '', date: new Date().toISOString().slice(0, 10) })

  const mExpenses = getMonthlyExpenses(currentYear, currentMonth)
  const mIncomes = getMonthlyIncomes(currentYear, currentMonth)
  const vEntries = getVariableEntries(currentYear, currentMonth)

  const filteredExpenses = mExpenses.filter(r => {
    const exp = expMap[r.expenseId]
    if (!exp) return false
    if (filterType !== 'all' && exp.type !== filterType) return false
    if (filterPerson !== 'all' && exp.responsible !== filterPerson && exp.responsible !== 'both') return false
    return true
  })

  const filteredIncomes = mIncomes.filter(r => {
    const inc = incMap[r.incomeId]
    if (!inc) return false
    if (filterType !== 'all' && inc.type !== filterType) return false
    if (filterPerson !== 'all' && inc.responsible !== filterPerson && inc.responsible !== 'both') return false
    return true
  })

  const totalPaid = filteredExpenses.reduce((s, r) => {
    const exp = expMap[r.expenseId]
    const val = exp?.type === 'variable' ? getVariableTotal(r.expenseId, currentYear, currentMonth) : r.value
    return r.status === 'paid' ? s + val : s
  }, 0)
  const totalPending = filteredExpenses.reduce((s, r) => {
    const exp = expMap[r.expenseId]
    const val = exp?.type === 'variable' ? getVariableTotal(r.expenseId, currentYear, currentMonth) : r.value
    return r.status === 'pending' ? s + val : s
  }, 0)

  const addVariableEntrySubmit = () => {
    if (!variableModal || !variableForm.value) return
    addVariableEntry({
      expenseId: variableModal.expenseId,
      year: currentYear,
      month: currentMonth,
      value: Number(variableForm.value),
      description: variableForm.description || 'Lançamento',
      date: variableForm.date,
    })
    setVariableForm({ value: '', description: '', date: new Date().toISOString().slice(0, 10) })
    setVariableModal(null)
  }

  const submitEditValue = () => {
    if (!editValueModal) return
    updateMonthlyExpense(editValueModal.id, { value: Number(editValueInput) })
    setEditValueModal(null)
  }

  const submitAddIncome = () => {
    addMonthlyIncome({
      incomeId: generateId(),
      year: currentYear,
      month: currentMonth,
      value: Number(incomeForm.value),
      status: 'pending',
      notes: incomeForm.notes,
    })
    setAddIncomeModal(false)
    setIncomeForm({ name: '', value: '', responsible: 'person1', notes: '', date: new Date().toISOString().slice(0, 10) })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 capitalize">
          {formatMonthYear(currentYear, currentMonth)}
        </h2>
        {tab === 'incomes' && (
          <button
            onClick={() => setAddIncomeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Plus size={16} /> Receita extra
          </button>
        )}
      </div>

      {/* Summary pills */}
      {tab === 'expenses' && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-green-700 font-medium">Pagos: {formatCurrency(totalPaid)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <Clock size={14} className="text-amber-500" />
            <span className="text-amber-700 font-medium">Pendentes: {formatCurrency(totalPending)}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['expenses', 'incomes'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setFilterType('all') }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'expenses' ? 'Despesas' : 'Receitas'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filterPerson}
          onChange={e => setFilterPerson(e.target.value as Person | 'all')}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Todos</option>
          <option value="person1">{settings.person1Name}</option>
          <option value="person2">{settings.person2Name}</option>
          <option value="both">Ambos</option>
        </select>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${filterType === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
        >
          Todos
        </button>
        {tab === 'expenses' ? (
          (['fixed', 'variable', 'installment'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${filterType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              {EXPENSE_TYPE_LABELS[t]}
            </button>
          ))
        ) : (
          (['fixed', 'variable'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${filterType === t ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              {INCOME_TYPE_LABELS[t]}
            </button>
          ))
        )}
      </div>

      {/* Expense records */}
      {tab === 'expenses' && (
        <div className="space-y-2">
          {filteredExpenses.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              Nenhuma despesa neste mês
            </div>
          )}
          {filteredExpenses.map(record => {
            const exp = expMap[record.expenseId]
            if (!exp) return null
            const isVariable = exp.type === 'variable'
            const displayValue = isVariable ? getVariableTotal(record.expenseId, currentYear, currentMonth) : record.value
            const entries = vEntries.filter(e => e.expenseId === record.expenseId)
            const isExpanded = expandedId === record.id

            return (
              <div key={record.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-3">
                  <button
                    onClick={() => updateMonthlyExpense(record.id, {
                      status: record.status === 'paid' ? 'pending' : 'paid',
                      paidDate: record.status === 'pending' ? new Date().toISOString().slice(0, 10) : undefined,
                    })}
                    className={`shrink-0 ${record.status === 'paid' ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                  >
                    <CheckCircle2 size={22} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${record.status === 'paid' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {exp.name}
                      </span>
                      {record.installmentNumber && (
                        <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded font-medium">
                          {record.installmentNumber}/{exp.totalInstallments}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 flex gap-2">
                      <span>{EXPENSE_CATEGORY_LABELS[exp.category]}</span>
                      <span>·</span>
                      <span>{PERSON_LABELS[exp.responsible]}</span>
                      <span>·</span>
                      <span>Vence dia {exp.dueDay}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`font-semibold ${record.status === 'paid' ? 'text-gray-400' : 'text-gray-800'}`}>
                      {formatCurrency(displayValue)}
                    </p>
                    {record.paidDate && (
                      <p className="text-xs text-gray-400">Pago {record.paidDate}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isVariable && (
                      <button
                        onClick={() => setVariableModal({ expenseId: record.expenseId, name: exp.name })}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Adicionar lançamento"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                    {!isVariable && (
                      <button
                        onClick={() => { setEditValueModal({ id: record.id, value: record.value, label: exp.name }); setEditValueInput(String(record.value)) }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar valor"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {isVariable && entries.length > 0 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : record.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm('Remover este registro?')) deleteMonthlyExpense(record.id) }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && entries.length > 0 && (
                  <div className="px-4 pb-3 border-t border-gray-100 pt-2 space-y-1">
                    {entries.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{entry.description}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs">{entry.date}</span>
                          <span className="font-medium">{formatCurrency(entry.value)}</span>
                          <button
                            onClick={() => deleteVariableEntry(entry.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Income records */}
      {tab === 'incomes' && (
        <div className="space-y-2">
          {filteredIncomes.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              Nenhuma receita neste mês
            </div>
          )}
          {filteredIncomes.map(record => {
            const inc = incMap[record.incomeId]
            const name = inc?.name ?? 'Receita extra'
            const responsible = inc?.responsible ?? 'both'

            return (
              <div key={record.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => updateMonthlyIncome(record.id, {
                    status: record.status === 'received' ? 'pending' : 'received',
                    receivedDate: record.status === 'pending' ? new Date().toISOString().slice(0, 10) : undefined,
                  })}
                  className={`shrink-0 ${record.status === 'received' ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                >
                  <CheckCircle2 size={22} />
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${record.status === 'received' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {name}
                  </p>
                  <p className="text-xs text-gray-400">{PERSON_LABELS[responsible]}</p>
                  {record.notes && <p className="text-xs text-gray-400">{record.notes}</p>}
                </div>

                <p className={`font-semibold shrink-0 ${record.status === 'received' ? 'text-gray-400' : 'text-green-600'}`}>
                  {formatCurrency(record.value)}
                </p>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { if (confirm('Remover esta receita?')) deleteMonthlyIncome(record.id) }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Variable entry modal */}
      {variableModal && (
        <Modal title={`Lançamento — ${variableModal.name}`} onClose={() => setVariableModal(null)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={variableForm.value}
                onChange={e => setVariableForm(f => ({ ...f, value: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                type="text"
                value={variableForm.description}
                onChange={e => setVariableForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Compra no supermercado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={variableForm.date}
                onChange={e => setVariableForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setVariableModal(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={addVariableEntrySubmit} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">Adicionar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit value modal */}
      {editValueModal && (
        <Modal title={`Editar valor — ${editValueModal.label}`} onClose={() => setEditValueModal(null)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editValueInput}
                onChange={e => setEditValueInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditValueModal(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={submitEditValue} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">Salvar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add extra income modal */}
      {addIncomeModal && (
        <Modal title="Receita extra" onClose={() => setAddIncomeModal(false)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={incomeForm.value}
                onChange={e => setIncomeForm(f => ({ ...f, value: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <input
                type="text"
                value={incomeForm.notes}
                onChange={e => setIncomeForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Freelance, bônus..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setAddIncomeModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={submitAddIncome} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">Adicionar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
