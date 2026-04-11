import React, { createContext, useContext, useEffect, useReducer, useCallback, useState, useRef } from 'react'
import type {
  Expense,
  Income,
  MonthlyExpenseRecord,
  MonthlyIncomeRecord,
  VariableEntry,
  ExtraIncome,
  DailyExpense,
  Settings,
  MonthSummary,
  ExpenseCategory,
  ExpenseType,
  IncomeCategory,
  IncomeType,
  ExpenseStatus,
  IncomeStatus,
  Person,
} from '../types'
import {
  generateId,
  generateMonthlyExpenses,
  generateMonthlyIncomes,
  computeMonthSummary,
} from '../utils/finance'
import { defaultSettings } from '../data/mockData'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

// ─── Mappers: Supabase row ↔ TypeScript type ─────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExpense(r: any): Expense {
  return {
    id: r.id,
    name: r.name,
    category: r.category as ExpenseCategory,
    type: r.type as ExpenseType,
    baseValue: Number(r.base_value),
    dueDay: Number(r.due_day),
    responsible: r.responsible as Person,
    notes: r.notes ?? undefined,
    isActive: r.is_active,
    createdAt: r.created_at,
    totalInstallments: r.total_installments ?? undefined,
    startMonth: r.start_month ?? undefined,
  }
}
function expenseRow(e: Expense, userId: string) {
  return {
    id: e.id, user_id: userId, name: e.name, category: e.category, type: e.type,
    base_value: e.baseValue, due_day: e.dueDay, responsible: e.responsible,
    notes: e.notes ?? null, is_active: e.isActive, created_at: e.createdAt,
    total_installments: e.totalInstallments ?? null, start_month: e.startMonth ?? null,
  }
}
function expenseUpdateRow(u: Partial<Expense>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: Record<string, any> = {}
  if (u.name !== undefined) r.name = u.name
  if (u.category !== undefined) r.category = u.category
  if (u.type !== undefined) r.type = u.type
  if (u.baseValue !== undefined) r.base_value = u.baseValue
  if (u.dueDay !== undefined) r.due_day = u.dueDay
  if (u.responsible !== undefined) r.responsible = u.responsible
  if (u.notes !== undefined) r.notes = u.notes
  if (u.isActive !== undefined) r.is_active = u.isActive
  if (u.totalInstallments !== undefined) r.total_installments = u.totalInstallments
  if (u.startMonth !== undefined) r.start_month = u.startMonth
  return r
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapIncome(r: any): Income {
  return {
    id: r.id, name: r.name, category: r.category as IncomeCategory,
    type: r.type as IncomeType, baseValue: Number(r.base_value),
    receiptDay: Number(r.receipt_day), responsible: r.responsible as Person,
    notes: r.notes ?? undefined, isActive: r.is_active, createdAt: r.created_at,
  }
}
function incomeRow(i: Income, userId: string) {
  return {
    id: i.id, user_id: userId, name: i.name, category: i.category, type: i.type,
    base_value: i.baseValue, receipt_day: i.receiptDay, responsible: i.responsible,
    notes: i.notes ?? null, is_active: i.isActive, created_at: i.createdAt,
  }
}
function incomeUpdateRow(u: Partial<Income>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: Record<string, any> = {}
  if (u.name !== undefined) r.name = u.name
  if (u.category !== undefined) r.category = u.category
  if (u.type !== undefined) r.type = u.type
  if (u.baseValue !== undefined) r.base_value = u.baseValue
  if (u.receiptDay !== undefined) r.receipt_day = u.receiptDay
  if (u.responsible !== undefined) r.responsible = u.responsible
  if (u.notes !== undefined) r.notes = u.notes
  if (u.isActive !== undefined) r.is_active = u.isActive
  return r
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMonthlyExpense(r: any): MonthlyExpenseRecord {
  return {
    id: r.id, expenseId: r.expense_id, year: Number(r.year), month: Number(r.month),
    value: Number(r.value), status: r.status as ExpenseStatus,
    paidDate: r.paid_date ?? undefined, notes: r.notes ?? undefined,
    installmentNumber: r.installment_number ?? undefined,
  }
}
function monthlyExpenseRow(rec: MonthlyExpenseRecord, userId: string) {
  return {
    id: rec.id, user_id: userId, expense_id: rec.expenseId, year: rec.year, month: rec.month,
    value: rec.value, status: rec.status, paid_date: rec.paidDate ?? null,
    notes: rec.notes ?? null, installment_number: rec.installmentNumber ?? null,
  }
}
function monthlyExpenseUpdateRow(u: Partial<MonthlyExpenseRecord>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: Record<string, any> = {}
  if (u.value !== undefined) r.value = u.value
  if (u.status !== undefined) r.status = u.status
  if (u.paidDate !== undefined) r.paid_date = u.paidDate
  if (u.notes !== undefined) r.notes = u.notes
  return r
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMonthlyIncome(r: any): MonthlyIncomeRecord {
  return {
    id: r.id, incomeId: r.income_id, year: Number(r.year), month: Number(r.month),
    value: Number(r.value), status: r.status as IncomeStatus,
    receivedDate: r.received_date ?? undefined, notes: r.notes ?? undefined,
  }
}
function monthlyIncomeRow(rec: MonthlyIncomeRecord, userId: string) {
  return {
    id: rec.id, user_id: userId, income_id: rec.incomeId, year: rec.year, month: rec.month,
    value: rec.value, status: rec.status, received_date: rec.receivedDate ?? null,
    notes: rec.notes ?? null,
  }
}
function monthlyIncomeUpdateRow(u: Partial<MonthlyIncomeRecord>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: Record<string, any> = {}
  if (u.value !== undefined) r.value = u.value
  if (u.status !== undefined) r.status = u.status
  if (u.receivedDate !== undefined) r.received_date = u.receivedDate
  if (u.notes !== undefined) r.notes = u.notes
  return r
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVariableEntry(r: any): VariableEntry {
  return {
    id: r.id, expenseId: r.expense_id, year: Number(r.year), month: Number(r.month),
    value: Number(r.value), description: r.description, date: r.date,
  }
}
function variableEntryRow(e: VariableEntry, userId: string) {
  return {
    id: e.id, user_id: userId, expense_id: e.expenseId, year: e.year, month: e.month,
    value: e.value, description: e.description, date: e.date,
  }
}
function variableEntryUpdateRow(u: Partial<VariableEntry>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: Record<string, any> = {}
  if (u.value !== undefined) r.value = u.value
  if (u.description !== undefined) r.description = u.description
  if (u.date !== undefined) r.date = u.date
  return r
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExtraIncome(r: any): ExtraIncome {
  return {
    id: r.id, name: r.name, value: Number(r.value), date: r.date,
    category: r.category as IncomeCategory, responsible: r.responsible as Person,
    notes: r.notes ?? undefined,
  }
}
function extraIncomeRow(e: ExtraIncome, userId: string) {
  return {
    id: e.id, user_id: userId, name: e.name, value: e.value, date: e.date,
    category: e.category, responsible: e.responsible, notes: e.notes ?? null,
  }
}
function extraIncomeUpdateRow(u: Partial<ExtraIncome>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: Record<string, any> = {}
  if (u.name !== undefined) r.name = u.name
  if (u.value !== undefined) r.value = u.value
  if (u.date !== undefined) r.date = u.date
  if (u.category !== undefined) r.category = u.category
  if (u.responsible !== undefined) r.responsible = u.responsible
  if (u.notes !== undefined) r.notes = u.notes
  return r
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDailyExpense(r: any): DailyExpense {
  return {
    id: r.id, description: r.description, category: r.category as ExpenseCategory,
    value: Number(r.value), date: r.date, responsible: r.responsible as Person,
    notes: r.notes ?? undefined,
  }
}
function dailyExpenseRow(e: DailyExpense, userId: string) {
  return {
    id: e.id, user_id: userId, description: e.description, category: e.category,
    value: e.value, date: e.date, responsible: e.responsible, notes: e.notes ?? null,
  }
}
function dailyExpenseUpdateRow(u: Partial<DailyExpense>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: Record<string, any> = {}
  if (u.description !== undefined) r.description = u.description
  if (u.category !== undefined) r.category = u.category
  if (u.value !== undefined) r.value = u.value
  if (u.date !== undefined) r.date = u.date
  if (u.responsible !== undefined) r.responsible = u.responsible
  if (u.notes !== undefined) r.notes = u.notes
  return r
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSettings(r: any): Settings {
  return { person1Name: r.person1_name, person2Name: r.person2_name }
}

// ─── State & Reducer ─────────────────────────────────────────────────────────

interface State {
  expenses: Expense[]
  incomes: Income[]
  monthlyExpenses: MonthlyExpenseRecord[]
  monthlyIncomes: MonthlyIncomeRecord[]
  variableEntries: VariableEntry[]
  extraIncomes: ExtraIncome[]
  dailyExpenses: DailyExpense[]
  settings: Settings
  currentYear: number
  currentMonth: number
}

type Action =
  | { type: 'LOAD_STATE'; payload: Partial<State> }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: { id: string; updates: Partial<Expense> } }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_INCOME'; payload: Income }
  | { type: 'UPDATE_INCOME'; payload: { id: string; updates: Partial<Income> } }
  | { type: 'DELETE_INCOME'; payload: string }
  | { type: 'ADD_MONTHLY_EXPENSES'; payload: MonthlyExpenseRecord[] }
  | { type: 'UPDATE_MONTHLY_EXPENSE'; payload: { id: string; updates: Partial<MonthlyExpenseRecord> } }
  | { type: 'DELETE_MONTHLY_EXPENSE'; payload: string }
  | { type: 'ADD_MONTHLY_INCOMES'; payload: MonthlyIncomeRecord[] }
  | { type: 'UPDATE_MONTHLY_INCOME'; payload: { id: string; updates: Partial<MonthlyIncomeRecord> } }
  | { type: 'DELETE_MONTHLY_INCOME'; payload: string }
  | { type: 'ADD_VARIABLE_ENTRY'; payload: VariableEntry }
  | { type: 'UPDATE_VARIABLE_ENTRY'; payload: { id: string; updates: Partial<VariableEntry> } }
  | { type: 'DELETE_VARIABLE_ENTRY'; payload: string }
  | { type: 'ADD_EXTRA_INCOME'; payload: ExtraIncome }
  | { type: 'UPDATE_EXTRA_INCOME'; payload: { id: string; updates: Partial<ExtraIncome> } }
  | { type: 'DELETE_EXTRA_INCOME'; payload: string }
  | { type: 'ADD_DAILY_EXPENSE'; payload: DailyExpense }
  | { type: 'UPDATE_DAILY_EXPENSE'; payload: { id: string; updates: Partial<DailyExpense> } }
  | { type: 'DELETE_DAILY_EXPENSE'; payload: string }
  | { type: 'SET_CURRENT_MONTH'; payload: { year: number; month: number } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }

const now = new Date()
const initialState: State = {
  expenses: [], incomes: [], monthlyExpenses: [], monthlyIncomes: [],
  variableEntries: [], extraIncomes: [], dailyExpenses: [],
  settings: defaultSettings,
  currentYear: now.getFullYear(), currentMonth: now.getMonth() + 1,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload }

    // Idempotent adds — realtime may fire for our own inserts; skip duplicates
    case 'ADD_EXPENSE':
      if (state.expenses.some(e => e.id === action.payload.id)) return state
      return { ...state, expenses: [...state.expenses, action.payload] }
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? { ...e, ...action.payload.updates } : e) }
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) }

    case 'ADD_INCOME':
      if (state.incomes.some(i => i.id === action.payload.id)) return state
      return { ...state, incomes: [...state.incomes, action.payload] }
    case 'UPDATE_INCOME':
      return { ...state, incomes: state.incomes.map(i => i.id === action.payload.id ? { ...i, ...action.payload.updates } : i) }
    case 'DELETE_INCOME':
      return { ...state, incomes: state.incomes.filter(i => i.id !== action.payload) }

    case 'ADD_MONTHLY_EXPENSES': {
      const existing = new Set(state.monthlyExpenses.map(r => r.id))
      const fresh = action.payload.filter(r => !existing.has(r.id))
      return fresh.length === 0 ? state : { ...state, monthlyExpenses: [...state.monthlyExpenses, ...fresh] }
    }
    case 'UPDATE_MONTHLY_EXPENSE':
      return { ...state, monthlyExpenses: state.monthlyExpenses.map(r => r.id === action.payload.id ? { ...r, ...action.payload.updates } : r) }
    case 'DELETE_MONTHLY_EXPENSE':
      return { ...state, monthlyExpenses: state.monthlyExpenses.filter(r => r.id !== action.payload) }

    case 'ADD_MONTHLY_INCOMES': {
      const existing = new Set(state.monthlyIncomes.map(r => r.id))
      const fresh = action.payload.filter(r => !existing.has(r.id))
      return fresh.length === 0 ? state : { ...state, monthlyIncomes: [...state.monthlyIncomes, ...fresh] }
    }
    case 'UPDATE_MONTHLY_INCOME':
      return { ...state, monthlyIncomes: state.monthlyIncomes.map(r => r.id === action.payload.id ? { ...r, ...action.payload.updates } : r) }
    case 'DELETE_MONTHLY_INCOME':
      return { ...state, monthlyIncomes: state.monthlyIncomes.filter(r => r.id !== action.payload) }

    case 'ADD_VARIABLE_ENTRY':
      if (state.variableEntries.some(e => e.id === action.payload.id)) return state
      return { ...state, variableEntries: [...state.variableEntries, action.payload] }
    case 'UPDATE_VARIABLE_ENTRY':
      return { ...state, variableEntries: state.variableEntries.map(e => e.id === action.payload.id ? { ...e, ...action.payload.updates } : e) }
    case 'DELETE_VARIABLE_ENTRY':
      return { ...state, variableEntries: state.variableEntries.filter(e => e.id !== action.payload) }

    case 'ADD_EXTRA_INCOME':
      if (state.extraIncomes.some(e => e.id === action.payload.id)) return state
      return { ...state, extraIncomes: [...state.extraIncomes, action.payload] }
    case 'UPDATE_EXTRA_INCOME':
      return { ...state, extraIncomes: state.extraIncomes.map(e => e.id === action.payload.id ? { ...e, ...action.payload.updates } : e) }
    case 'DELETE_EXTRA_INCOME':
      return { ...state, extraIncomes: state.extraIncomes.filter(e => e.id !== action.payload) }

    case 'ADD_DAILY_EXPENSE':
      if (state.dailyExpenses.some(e => e.id === action.payload.id)) return state
      return { ...state, dailyExpenses: [...state.dailyExpenses, action.payload] }
    case 'UPDATE_DAILY_EXPENSE':
      return { ...state, dailyExpenses: state.dailyExpenses.map(e => e.id === action.payload.id ? { ...e, ...action.payload.updates } : e) }
    case 'DELETE_DAILY_EXPENSE':
      return { ...state, dailyExpenses: state.dailyExpenses.filter(e => e.id !== action.payload) }

    case 'SET_CURRENT_MONTH':
      return { ...state, currentYear: action.payload.year, currentMonth: action.payload.month }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    default:
      return state
  }
}

// ─── Context interface ────────────────────────────────────────────────────────

interface FinanceContextValue {
  state: State
  dbLoading: boolean
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => void
  updateExpense: (id: string, updates: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  addIncome: (data: Omit<Income, 'id' | 'createdAt'>) => void
  updateIncome: (id: string, updates: Partial<Income>) => void
  deleteIncome: (id: string) => void
  updateMonthlyExpense: (id: string, updates: Partial<MonthlyExpenseRecord>) => void
  deleteMonthlyExpense: (id: string) => void
  addMonthlyIncome: (data: Omit<MonthlyIncomeRecord, 'id'>) => void
  updateMonthlyIncome: (id: string, updates: Partial<MonthlyIncomeRecord>) => void
  deleteMonthlyIncome: (id: string) => void
  addVariableEntry: (data: Omit<VariableEntry, 'id'>) => void
  updateVariableEntry: (id: string, updates: Partial<VariableEntry>) => void
  deleteVariableEntry: (id: string) => void
  addExtraIncome: (data: Omit<ExtraIncome, 'id'>) => void
  updateExtraIncome: (id: string, updates: Partial<ExtraIncome>) => void
  deleteExtraIncome: (id: string) => void
  addDailyExpense: (data: Omit<DailyExpense, 'id'>) => void
  updateDailyExpense: (id: string, updates: Partial<DailyExpense>) => void
  deleteDailyExpense: (id: string) => void
  setCurrentMonth: (year: number, month: number) => void
  updateSettings: (updates: Partial<Settings>) => void
  getMonthSummary: (year: number, month: number) => MonthSummary
  getMonthlyExpenses: (year: number, month: number) => MonthlyExpenseRecord[]
  getMonthlyIncomes: (year: number, month: number) => MonthlyIncomeRecord[]
  getVariableEntries: (year: number, month: number) => VariableEntry[]
  getVariableTotal: (expenseId: string, year: number, month: number) => number
  getExtraIncomes: (year: number, month: number) => ExtraIncome[]
  getDailyExpenses: (year: number, month: number) => DailyExpense[]
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [state, dispatch] = useReducer(reducer, initialState)
  const [dbLoading, setDbLoading] = useState(true)
  const dbLoadedRef = useRef(false)
  const settingsRef = useRef(state.settings)
  useEffect(() => { settingsRef.current = state.settings }, [state.settings])

  // ── Initial load from Supabase ──
  useEffect(() => {
    if (!userId) {
      dispatch({ type: 'LOAD_STATE', payload: initialState })
      dbLoadedRef.current = false
      setDbLoading(false)
      return
    }
    dbLoadedRef.current = false
    setDbLoading(true)

    async function loadAll() {
      const [expR, incR, meR, miR, veR, eiR, deR, setR] = await Promise.all([
        supabase.from('expenses').select('*'),
        supabase.from('incomes').select('*'),
        supabase.from('monthly_expenses').select('*'),
        supabase.from('monthly_incomes').select('*'),
        supabase.from('variable_entries').select('*'),
        supabase.from('extra_incomes').select('*'),
        supabase.from('daily_expenses').select('*'),
        supabase.from('settings').select('*').maybeSingle(),
      ])
      dispatch({
        type: 'LOAD_STATE',
        payload: {
          expenses: (expR.data ?? []).map(mapExpense),
          incomes: (incR.data ?? []).map(mapIncome),
          monthlyExpenses: (meR.data ?? []).map(mapMonthlyExpense),
          monthlyIncomes: (miR.data ?? []).map(mapMonthlyIncome),
          variableEntries: (veR.data ?? []).map(mapVariableEntry),
          extraIncomes: (eiR.data ?? []).map(mapExtraIncome),
          dailyExpenses: (deR.data ?? []).map(mapDailyExpense),
          settings: setR.data ? mapSettings(setR.data) : defaultSettings,
        },
      })
      dbLoadedRef.current = true
      setDbLoading(false)
    }

    loadAll()
  }, [userId])

  // ── Realtime subscriptions ──
  useEffect(() => {
    if (!userId) return

    const ch = supabase
      .channel(`finance-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, ({ eventType, new: n, old: o }) => {
        if (eventType === 'INSERT') dispatch({ type: 'ADD_EXPENSE', payload: mapExpense(n) })
        else if (eventType === 'UPDATE') dispatch({ type: 'UPDATE_EXPENSE', payload: { id: n.id, updates: mapExpense(n) } })
        else if (eventType === 'DELETE') dispatch({ type: 'DELETE_EXPENSE', payload: o.id })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incomes' }, ({ eventType, new: n, old: o }) => {
        if (eventType === 'INSERT') dispatch({ type: 'ADD_INCOME', payload: mapIncome(n) })
        else if (eventType === 'UPDATE') dispatch({ type: 'UPDATE_INCOME', payload: { id: n.id, updates: mapIncome(n) } })
        else if (eventType === 'DELETE') dispatch({ type: 'DELETE_INCOME', payload: o.id })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monthly_expenses' }, ({ eventType, new: n, old: o }) => {
        if (eventType === 'INSERT') dispatch({ type: 'ADD_MONTHLY_EXPENSES', payload: [mapMonthlyExpense(n)] })
        else if (eventType === 'UPDATE') dispatch({ type: 'UPDATE_MONTHLY_EXPENSE', payload: { id: n.id, updates: mapMonthlyExpense(n) } })
        else if (eventType === 'DELETE') dispatch({ type: 'DELETE_MONTHLY_EXPENSE', payload: o.id })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monthly_incomes' }, ({ eventType, new: n, old: o }) => {
        if (eventType === 'INSERT') dispatch({ type: 'ADD_MONTHLY_INCOMES', payload: [mapMonthlyIncome(n)] })
        else if (eventType === 'UPDATE') dispatch({ type: 'UPDATE_MONTHLY_INCOME', payload: { id: n.id, updates: mapMonthlyIncome(n) } })
        else if (eventType === 'DELETE') dispatch({ type: 'DELETE_MONTHLY_INCOME', payload: o.id })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'variable_entries' }, ({ eventType, new: n, old: o }) => {
        if (eventType === 'INSERT') dispatch({ type: 'ADD_VARIABLE_ENTRY', payload: mapVariableEntry(n) })
        else if (eventType === 'UPDATE') dispatch({ type: 'UPDATE_VARIABLE_ENTRY', payload: { id: n.id, updates: mapVariableEntry(n) } })
        else if (eventType === 'DELETE') dispatch({ type: 'DELETE_VARIABLE_ENTRY', payload: o.id })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'extra_incomes' }, ({ eventType, new: n, old: o }) => {
        if (eventType === 'INSERT') dispatch({ type: 'ADD_EXTRA_INCOME', payload: mapExtraIncome(n) })
        else if (eventType === 'UPDATE') dispatch({ type: 'UPDATE_EXTRA_INCOME', payload: { id: n.id, updates: mapExtraIncome(n) } })
        else if (eventType === 'DELETE') dispatch({ type: 'DELETE_EXTRA_INCOME', payload: o.id })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_expenses' }, ({ eventType, new: n, old: o }) => {
        if (eventType === 'INSERT') dispatch({ type: 'ADD_DAILY_EXPENSE', payload: mapDailyExpense(n) })
        else if (eventType === 'UPDATE') dispatch({ type: 'UPDATE_DAILY_EXPENSE', payload: { id: n.id, updates: mapDailyExpense(n) } })
        else if (eventType === 'DELETE') dispatch({ type: 'DELETE_DAILY_EXPENSE', payload: o.id })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, ({ new: n }) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: mapSettings(n) })
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [userId])

  // ── Auto-generate monthly records when navigating ──
  useEffect(() => {
    if (!userId || !dbLoadedRef.current) return
    const newExp = generateMonthlyExpenses(state.expenses, state.currentYear, state.currentMonth, state.monthlyExpenses)
    if (newExp.length > 0) {
      dispatch({ type: 'ADD_MONTHLY_EXPENSES', payload: newExp })
      newExp.forEach(rec => {
        supabase.from('monthly_expenses').insert(monthlyExpenseRow(rec, userId)).then(() => {})
      })
    }
    const newInc = generateMonthlyIncomes(state.incomes, state.currentYear, state.currentMonth, state.monthlyIncomes)
    if (newInc.length > 0) {
      dispatch({ type: 'ADD_MONTHLY_INCOMES', payload: newInc })
      newInc.forEach(rec => {
        supabase.from('monthly_incomes').insert(monthlyIncomeRow(rec, userId)).then(() => {})
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, state.currentYear, state.currentMonth, state.expenses, state.incomes])

  // ── CRUD callbacks ──

  const addExpense = useCallback((data: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!userId) return
    const item: Expense = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_EXPENSE', payload: item })
    supabase.from('expenses').insert(expenseRow(item, userId)).then(() => {})
  }, [userId])

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    if (!userId) return
    dispatch({ type: 'UPDATE_EXPENSE', payload: { id, updates } })
    supabase.from('expenses').update(expenseUpdateRow(updates)).eq('id', id).then(() => {})
  }, [userId])

  const deleteExpense = useCallback((id: string) => {
    if (!userId) return
    dispatch({ type: 'DELETE_EXPENSE', payload: id })
    supabase.from('expenses').delete().eq('id', id).then(() => {})
  }, [userId])

  const addIncome = useCallback((data: Omit<Income, 'id' | 'createdAt'>) => {
    if (!userId) return
    const item: Income = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_INCOME', payload: item })
    supabase.from('incomes').insert(incomeRow(item, userId)).then(() => {})
  }, [userId])

  const updateIncome = useCallback((id: string, updates: Partial<Income>) => {
    if (!userId) return
    dispatch({ type: 'UPDATE_INCOME', payload: { id, updates } })
    supabase.from('incomes').update(incomeUpdateRow(updates)).eq('id', id).then(() => {})
  }, [userId])

  const deleteIncome = useCallback((id: string) => {
    if (!userId) return
    dispatch({ type: 'DELETE_INCOME', payload: id })
    supabase.from('incomes').delete().eq('id', id).then(() => {})
  }, [userId])

  const updateMonthlyExpense = useCallback((id: string, updates: Partial<MonthlyExpenseRecord>) => {
    if (!userId) return
    dispatch({ type: 'UPDATE_MONTHLY_EXPENSE', payload: { id, updates } })
    supabase.from('monthly_expenses').update(monthlyExpenseUpdateRow(updates)).eq('id', id).then(() => {})
  }, [userId])

  const deleteMonthlyExpense = useCallback((id: string) => {
    if (!userId) return
    dispatch({ type: 'DELETE_MONTHLY_EXPENSE', payload: id })
    supabase.from('monthly_expenses').delete().eq('id', id).then(() => {})
  }, [userId])

  const addMonthlyIncome = useCallback((data: Omit<MonthlyIncomeRecord, 'id'>) => {
    if (!userId) return
    const item: MonthlyIncomeRecord = { ...data, id: generateId() }
    dispatch({ type: 'ADD_MONTHLY_INCOMES', payload: [item] })
    supabase.from('monthly_incomes').insert(monthlyIncomeRow(item, userId)).then(() => {})
  }, [userId])

  const updateMonthlyIncome = useCallback((id: string, updates: Partial<MonthlyIncomeRecord>) => {
    if (!userId) return
    dispatch({ type: 'UPDATE_MONTHLY_INCOME', payload: { id, updates } })
    supabase.from('monthly_incomes').update(monthlyIncomeUpdateRow(updates)).eq('id', id).then(() => {})
  }, [userId])

  const deleteMonthlyIncome = useCallback((id: string) => {
    if (!userId) return
    dispatch({ type: 'DELETE_MONTHLY_INCOME', payload: id })
    supabase.from('monthly_incomes').delete().eq('id', id).then(() => {})
  }, [userId])

  const addVariableEntry = useCallback((data: Omit<VariableEntry, 'id'>) => {
    if (!userId) return
    const item: VariableEntry = { ...data, id: generateId() }
    dispatch({ type: 'ADD_VARIABLE_ENTRY', payload: item })
    supabase.from('variable_entries').insert(variableEntryRow(item, userId)).then(() => {})
  }, [userId])

  const updateVariableEntry = useCallback((id: string, updates: Partial<VariableEntry>) => {
    if (!userId) return
    dispatch({ type: 'UPDATE_VARIABLE_ENTRY', payload: { id, updates } })
    supabase.from('variable_entries').update(variableEntryUpdateRow(updates)).eq('id', id).then(() => {})
  }, [userId])

  const deleteVariableEntry = useCallback((id: string) => {
    if (!userId) return
    dispatch({ type: 'DELETE_VARIABLE_ENTRY', payload: id })
    supabase.from('variable_entries').delete().eq('id', id).then(() => {})
  }, [userId])

  const addExtraIncome = useCallback((data: Omit<ExtraIncome, 'id'>) => {
    if (!userId) return
    const item: ExtraIncome = { ...data, id: generateId() }
    dispatch({ type: 'ADD_EXTRA_INCOME', payload: item })
    supabase.from('extra_incomes').insert(extraIncomeRow(item, userId)).then(() => {})
  }, [userId])

  const updateExtraIncome = useCallback((id: string, updates: Partial<ExtraIncome>) => {
    if (!userId) return
    dispatch({ type: 'UPDATE_EXTRA_INCOME', payload: { id, updates } })
    supabase.from('extra_incomes').update(extraIncomeUpdateRow(updates)).eq('id', id).then(() => {})
  }, [userId])

  const deleteExtraIncome = useCallback((id: string) => {
    if (!userId) return
    dispatch({ type: 'DELETE_EXTRA_INCOME', payload: id })
    supabase.from('extra_incomes').delete().eq('id', id).then(() => {})
  }, [userId])

  const addDailyExpense = useCallback((data: Omit<DailyExpense, 'id'>) => {
    if (!userId) return
    const item: DailyExpense = { ...data, id: generateId() }
    dispatch({ type: 'ADD_DAILY_EXPENSE', payload: item })
    supabase.from('daily_expenses').insert(dailyExpenseRow(item, userId)).then(() => {})
  }, [userId])

  const updateDailyExpense = useCallback((id: string, updates: Partial<DailyExpense>) => {
    if (!userId) return
    dispatch({ type: 'UPDATE_DAILY_EXPENSE', payload: { id, updates } })
    supabase.from('daily_expenses').update(dailyExpenseUpdateRow(updates)).eq('id', id).then(() => {})
  }, [userId])

  const deleteDailyExpense = useCallback((id: string) => {
    if (!userId) return
    dispatch({ type: 'DELETE_DAILY_EXPENSE', payload: id })
    supabase.from('daily_expenses').delete().eq('id', id).then(() => {})
  }, [userId])

  const setCurrentMonth = useCallback((year: number, month: number) => {
    dispatch({ type: 'SET_CURRENT_MONTH', payload: { year, month } })
  }, [])

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    if (!userId) return
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates })
    const merged = { ...settingsRef.current, ...updates }
    supabase.from('settings').upsert({
      user_id: userId,
      person1_name: merged.person1Name,
      person2_name: merged.person2Name,
    }).then(() => {})
  }, [userId])

  // ── Getters ──

  const getMonthlyExpenses = useCallback((year: number, month: number) =>
    state.monthlyExpenses.filter(r => r.year === year && r.month === month),
  [state.monthlyExpenses])

  const getMonthlyIncomes = useCallback((year: number, month: number) =>
    state.monthlyIncomes.filter(r => r.year === year && r.month === month),
  [state.monthlyIncomes])

  const getVariableEntries = useCallback((year: number, month: number) =>
    state.variableEntries.filter(e => e.year === year && e.month === month),
  [state.variableEntries])

  const getVariableTotal = useCallback((expenseId: string, year: number, month: number) =>
    state.variableEntries
      .filter(e => e.expenseId === expenseId && e.year === year && e.month === month)
      .reduce((sum, e) => sum + e.value, 0),
  [state.variableEntries])

  const getExtraIncomes = useCallback((year: number, month: number) => {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return state.extraIncomes.filter(e => e.date.startsWith(prefix))
  }, [state.extraIncomes])

  const getDailyExpenses = useCallback((year: number, month: number) => {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return state.dailyExpenses.filter(e => e.date.startsWith(prefix))
  }, [state.dailyExpenses])

  const getMonthSummary = useCallback((year: number, month: number) =>
    computeMonthSummary(
      state.expenses, state.incomes,
      state.monthlyExpenses, state.monthlyIncomes,
      state.variableEntries, state.extraIncomes, state.dailyExpenses,
      year, month,
    ),
  [state.expenses, state.incomes, state.monthlyExpenses, state.monthlyIncomes,
   state.variableEntries, state.extraIncomes, state.dailyExpenses])

  const value: FinanceContextValue = {
    state, dbLoading,
    addExpense, updateExpense, deleteExpense,
    addIncome, updateIncome, deleteIncome,
    updateMonthlyExpense, deleteMonthlyExpense,
    addMonthlyIncome, updateMonthlyIncome, deleteMonthlyIncome,
    addVariableEntry, updateVariableEntry, deleteVariableEntry,
    addExtraIncome, updateExtraIncome, deleteExtraIncome,
    addDailyExpense, updateDailyExpense, deleteDailyExpense,
    setCurrentMonth, updateSettings,
    getMonthSummary, getMonthlyExpenses, getMonthlyIncomes,
    getVariableEntries, getVariableTotal, getExtraIncomes, getDailyExpenses,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider')
  return ctx
}
