export type Person = 'person1' | 'person2' | 'both'
export type ExpenseType = 'fixed' | 'variable' | 'installment'
export type IncomeType = 'fixed' | 'variable'
export type ExpenseStatus = 'paid' | 'pending'
export type IncomeStatus = 'received' | 'pending'

export type ExpenseCategory =
  | 'housing'
  | 'food'
  | 'leisure'
  | 'transport'
  | 'health'
  | 'education'
  | 'utilities'
  | 'clothing'
  | 'subscriptions'
  | 'other'

export type IncomeCategory =
  | 'salary'
  | 'freelance'
  | 'bonus'
  | 'investment'
  | 'rental'
  | 'other'

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: 'Moradia',
  food: 'Alimentação',
  leisure: 'Lazer',
  transport: 'Transporte',
  health: 'Saúde',
  education: 'Educação',
  utilities: 'Contas/Utilidades',
  clothing: 'Vestuário',
  subscriptions: 'Assinaturas',
  other: 'Outros',
}

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  housing: '#6366f1',
  food: '#f59e0b',
  leisure: '#ec4899',
  transport: '#3b82f6',
  health: '#10b981',
  education: '#8b5cf6',
  utilities: '#14b8a6',
  clothing: '#f97316',
  subscriptions: '#84cc16',
  other: '#9ca3af',
}

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  salary: 'Salário',
  freelance: 'Freelance',
  bonus: 'Bônus',
  investment: 'Investimentos',
  rental: 'Aluguel',
  other: 'Outros',
}

export const PERSON_LABELS: Record<Person, string> = {
  person1: 'Pessoa 1',
  person2: 'Pessoa 2',
  both: 'Ambos',
}

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  fixed: 'Fixa',
  variable: 'Variável',
  installment: 'Parcelada',
}

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  fixed: 'Fixa',
  variable: 'Variável',
}

export interface Expense {
  id: string
  name: string
  category: ExpenseCategory
  type: ExpenseType
  baseValue: number
  dueDay: number
  responsible: Person
  notes?: string
  isActive: boolean
  createdAt: string
  totalInstallments?: number
  startMonth?: string
}

export interface Income {
  id: string
  name: string
  category: IncomeCategory
  type: IncomeType
  baseValue: number
  receiptDay: number
  responsible: Person
  notes?: string
  isActive: boolean
  createdAt: string
}

export interface MonthlyExpenseRecord {
  id: string
  expenseId: string
  year: number
  month: number
  value: number
  status: ExpenseStatus
  paidDate?: string
  notes?: string
  installmentNumber?: number
}

export interface MonthlyIncomeRecord {
  id: string
  incomeId: string
  year: number
  month: number
  value: number
  status: IncomeStatus
  receivedDate?: string
  notes?: string
}

export interface VariableEntry {
  id: string
  expenseId: string
  year: number
  month: number
  value: number
  description: string
  date: string
}

// One-time income (not recurring) with a specific date
export interface ExtraIncome {
  id: string
  name: string
  value: number
  date: string // YYYY-MM-DD
  category: IncomeCategory
  responsible: Person
  notes?: string
}

// Ad-hoc daily expense (gas, lunch, etc.) not tied to a template
export interface DailyExpense {
  id: string
  description: string
  category: ExpenseCategory
  value: number
  date: string // YYYY-MM-DD
  responsible: Person
  notes?: string
}

export interface Settings {
  person1Name: string
  person2Name: string
}

export interface MonthSummary {
  totalIncome: number
  totalExpenses: number
  totalFixed: number
  totalVariable: number
  totalInstallments: number
  totalDaily: number
  totalExtra: number
  balance: number
  person1Income: number
  person2Income: number
  person1Expenses: number
  person2Expenses: number
  byCategory: Record<string, number>
}
