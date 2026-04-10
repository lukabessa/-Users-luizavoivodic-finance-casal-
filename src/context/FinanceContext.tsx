import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
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
} from '../types'
import {
  generateId,
  generateMonthlyExpenses,
  generateMonthlyIncomes,
  computeMonthSummary,
} from '../utils/finance'
import { defaultSettings, sampleExpenses, sampleIncomes } from '../data/mockData'

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
  expenses: [],
  incomes: [],
  monthlyExpenses: [],
  monthlyIncomes: [],
  variableEntries: [],
  extraIncomes: [],
  dailyExpenses: [],
  settings: defaultSettings,
  currentYear: now.getFullYear(),
  currentMonth: now.getMonth() + 1,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
        extraIncomes: action.payload.extraIncomes ?? state.extraIncomes,
        dailyExpenses: action.payload.dailyExpenses ?? state.dailyExpenses,
      }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] }
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? { ...e, ...action.payload.updates } : e) }
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) }
    case 'ADD_INCOME':
      return { ...state, incomes: [...state.incomes, action.payload] }
    case 'UPDATE_INCOME':
      return { ...state, incomes: state.incomes.map(i => i.id === action.payload.id ? { ...i, ...action.payload.updates } : i) }
    case 'DELETE_INCOME':
      return { ...state, incomes: state.incomes.filter(i => i.id !== action.payload) }
    case 'ADD_MONTHLY_EXPENSES':
      return { ...state, monthlyExpenses: [...state.monthlyExpenses, ...action.payload] }
    case 'UPDATE_MONTHLY_EXPENSE':
      return { ...state, monthlyExpenses: state.monthlyExpenses.map(r => r.id === action.payload.id ? { ...r, ...action.payload.updates } : r) }
    case 'DELETE_MONTHLY_EXPENSE':
      return { ...state, monthlyExpenses: state.monthlyExpenses.filter(r => r.id !== action.payload) }
    case 'ADD_MONTHLY_INCOMES':
      return { ...state, monthlyIncomes: [...state.monthlyIncomes, ...action.payload] }
    case 'UPDATE_MONTHLY_INCOME':
      return { ...state, monthlyIncomes: state.monthlyIncomes.map(r => r.id === action.payload.id ? { ...r, ...action.payload.updates } : r) }
    case 'DELETE_MONTHLY_INCOME':
      return { ...state, monthlyIncomes: state.monthlyIncomes.filter(r => r.id !== action.payload) }
    case 'ADD_VARIABLE_ENTRY':
      return { ...state, variableEntries: [...state.variableEntries, action.payload] }
    case 'UPDATE_VARIABLE_ENTRY':
      return { ...state, variableEntries: state.variableEntries.map(e => e.id === action.payload.id ? { ...e, ...action.payload.updates } : e) }
    case 'DELETE_VARIABLE_ENTRY':
      return { ...state, variableEntries: state.variableEntries.filter(e => e.id !== action.payload) }
    case 'ADD_EXTRA_INCOME':
      return { ...state, extraIncomes: [...state.extraIncomes, action.payload] }
    case 'UPDATE_EXTRA_INCOME':
      return { ...state, extraIncomes: state.extraIncomes.map(e => e.id === action.payload.id ? { ...e, ...action.payload.updates } : e) }
    case 'DELETE_EXTRA_INCOME':
      return { ...state, extraIncomes: state.extraIncomes.filter(e => e.id !== action.payload) }
    case 'ADD_DAILY_EXPENSE':
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

interface FinanceContextValue {
  state: State
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

export function FinanceProvider({ children, storageKey }: { children: React.ReactNode; storageKey: string }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        const saved = JSON.parse(raw)
        dispatch({ type: 'LOAD_STATE', payload: saved })
      } catch {
        dispatch({ type: 'LOAD_STATE', payload: { expenses: sampleExpenses, incomes: sampleIncomes } })
      }
    } else {
      dispatch({ type: 'LOAD_STATE', payload: { expenses: sampleExpenses, incomes: sampleIncomes } })
    }
  }, [])

  useEffect(() => {
    const { currentYear, currentMonth, ...rest } = state
    localStorage.setItem(storageKey, JSON.stringify(rest))
  }, [state, storageKey])

  useEffect(() => {
    const newExp = generateMonthlyExpenses(state.expenses, state.currentYear, state.currentMonth, state.monthlyExpenses)
    if (newExp.length > 0) dispatch({ type: 'ADD_MONTHLY_EXPENSES', payload: newExp })
    const newInc = generateMonthlyIncomes(state.incomes, state.currentYear, state.currentMonth, state.monthlyIncomes)
    if (newInc.length > 0) dispatch({ type: 'ADD_MONTHLY_INCOMES', payload: newInc })
  }, [state.currentYear, state.currentMonth, state.expenses, state.incomes])

  const addExpense = useCallback((data: Omit<Expense, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_EXPENSE', payload: { ...data, id: generateId(), createdAt: new Date().toISOString() } })
  }, [])
  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: { id, updates } })
  }, [])
  const deleteExpense = useCallback((id: string) => dispatch({ type: 'DELETE_EXPENSE', payload: id }), [])

  const addIncome = useCallback((data: Omit<Income, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_INCOME', payload: { ...data, id: generateId(), createdAt: new Date().toISOString() } })
  }, [])
  const updateIncome = useCallback((id: string, updates: Partial<Income>) => {
    dispatch({ type: 'UPDATE_INCOME', payload: { id, updates } })
  }, [])
  const deleteIncome = useCallback((id: string) => dispatch({ type: 'DELETE_INCOME', payload: id }), [])

  const updateMonthlyExpense = useCallback((id: string, updates: Partial<MonthlyExpenseRecord>) => {
    dispatch({ type: 'UPDATE_MONTHLY_EXPENSE', payload: { id, updates } })
  }, [])
  const deleteMonthlyExpense = useCallback((id: string) => dispatch({ type: 'DELETE_MONTHLY_EXPENSE', payload: id }), [])

  const addMonthlyIncome = useCallback((data: Omit<MonthlyIncomeRecord, 'id'>) => {
    dispatch({ type: 'ADD_MONTHLY_INCOMES', payload: [{ ...data, id: generateId() }] })
  }, [])
  const updateMonthlyIncome = useCallback((id: string, updates: Partial<MonthlyIncomeRecord>) => {
    dispatch({ type: 'UPDATE_MONTHLY_INCOME', payload: { id, updates } })
  }, [])
  const deleteMonthlyIncome = useCallback((id: string) => dispatch({ type: 'DELETE_MONTHLY_INCOME', payload: id }), [])

  const addVariableEntry = useCallback((data: Omit<VariableEntry, 'id'>) => {
    dispatch({ type: 'ADD_VARIABLE_ENTRY', payload: { ...data, id: generateId() } })
  }, [])
  const updateVariableEntry = useCallback((id: string, updates: Partial<VariableEntry>) => {
    dispatch({ type: 'UPDATE_VARIABLE_ENTRY', payload: { id, updates } })
  }, [])
  const deleteVariableEntry = useCallback((id: string) => dispatch({ type: 'DELETE_VARIABLE_ENTRY', payload: id }), [])

  const addExtraIncome = useCallback((data: Omit<ExtraIncome, 'id'>) => {
    dispatch({ type: 'ADD_EXTRA_INCOME', payload: { ...data, id: generateId() } })
  }, [])
  const updateExtraIncome = useCallback((id: string, updates: Partial<ExtraIncome>) => {
    dispatch({ type: 'UPDATE_EXTRA_INCOME', payload: { id, updates } })
  }, [])
  const deleteExtraIncome = useCallback((id: string) => dispatch({ type: 'DELETE_EXTRA_INCOME', payload: id }), [])

  const addDailyExpense = useCallback((data: Omit<DailyExpense, 'id'>) => {
    dispatch({ type: 'ADD_DAILY_EXPENSE', payload: { ...data, id: generateId() } })
  }, [])
  const updateDailyExpense = useCallback((id: string, updates: Partial<DailyExpense>) => {
    dispatch({ type: 'UPDATE_DAILY_EXPENSE', payload: { id, updates } })
  }, [])
  const deleteDailyExpense = useCallback((id: string) => dispatch({ type: 'DELETE_DAILY_EXPENSE', payload: id }), [])

  const setCurrentMonth = useCallback((year: number, month: number) => {
    dispatch({ type: 'SET_CURRENT_MONTH', payload: { year, month } })
  }, [])
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates })
  }, [])

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
    state.variableEntries.filter(e => e.expenseId === expenseId && e.year === year && e.month === month)
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
      year, month
    ),
  [state.expenses, state.incomes, state.monthlyExpenses, state.monthlyIncomes,
   state.variableEntries, state.extraIncomes, state.dailyExpenses])

  const value: FinanceContextValue = {
    state,
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
