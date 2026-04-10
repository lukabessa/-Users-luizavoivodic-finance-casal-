import { format, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type {
  Expense,
  Income,
  MonthlyExpenseRecord,
  MonthlyIncomeRecord,
  VariableEntry,
  ExtraIncome,
  DailyExpense,
  MonthSummary,
} from '../types'

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function yearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function parseYearMonth(ym: string): { year: number; month: number } {
  const [y, m] = ym.split('-')
  return { year: parseInt(y), month: parseInt(m) }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1, 1)
  return format(date, "MMMM 'de' yyyy", { locale: ptBR })
}

export function formatMonthShort(year: number, month: number): string {
  const date = new Date(year, month - 1, 1)
  return format(date, 'MMM/yy', { locale: ptBR })
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function getInstallmentInfo(expense: Expense, year: number, month: number): { active: boolean; number: number } {
  if (expense.type !== 'installment' || !expense.startMonth || !expense.totalInstallments) {
    return { active: false, number: 0 }
  }
  const start = parseYearMonth(expense.startMonth)
  const startDate = new Date(start.year, start.month - 1)
  const currentDate = new Date(year, month - 1)
  const diff =
    (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
    (currentDate.getMonth() - startDate.getMonth())
  const installmentNumber = diff + 1
  if (installmentNumber < 1 || installmentNumber > expense.totalInstallments) {
    return { active: false, number: installmentNumber }
  }
  return { active: true, number: installmentNumber }
}

export function generateMonthlyExpenses(
  expenses: Expense[],
  year: number,
  month: number,
  existing: MonthlyExpenseRecord[]
): MonthlyExpenseRecord[] {
  const ym = yearMonth(year, month)
  const existingIds = new Set(
    existing.filter(r => yearMonth(r.year, r.month) === ym).map(r => r.expenseId)
  )
  const newRecords: MonthlyExpenseRecord[] = []

  for (const expense of expenses) {
    if (!expense.isActive) continue
    if (existingIds.has(expense.id)) continue

    if (expense.type === 'fixed' || expense.type === 'variable') {
      newRecords.push({
        id: generateId(),
        expenseId: expense.id,
        year,
        month,
        value: expense.type === 'variable' ? 0 : expense.baseValue,
        status: 'pending',
      })
    } else if (expense.type === 'installment') {
      const info = getInstallmentInfo(expense, year, month)
      if (info.active) {
        newRecords.push({
          id: generateId(),
          expenseId: expense.id,
          year,
          month,
          value: expense.baseValue,
          status: 'pending',
          installmentNumber: info.number,
        })
      }
    }
  }

  return newRecords
}

export function generateMonthlyIncomes(
  incomes: Income[],
  year: number,
  month: number,
  existing: MonthlyIncomeRecord[]
): MonthlyIncomeRecord[] {
  const ym = yearMonth(year, month)
  const existingIds = new Set(
    existing.filter(r => yearMonth(r.year, r.month) === ym).map(r => r.incomeId)
  )
  const newRecords: MonthlyIncomeRecord[] = []

  for (const income of incomes) {
    if (!income.isActive || income.type !== 'fixed') continue
    if (existingIds.has(income.id)) continue

    newRecords.push({
      id: generateId(),
      incomeId: income.id,
      year,
      month,
      value: income.baseValue,
      status: 'pending',
    })
  }

  return newRecords
}

export function computeMonthSummary(
  expenses: Expense[],
  incomes: Income[],
  monthlyExpenses: MonthlyExpenseRecord[],
  monthlyIncomes: MonthlyIncomeRecord[],
  variableEntries: VariableEntry[],
  extraIncomes: ExtraIncome[],
  dailyExpenses: DailyExpense[],
  year: number,
  month: number
): MonthSummary {
  const expMap = Object.fromEntries(expenses.map(e => [e.id, e]))
  const incMap = Object.fromEntries(incomes.map(i => [i.id, i]))

  const ym = yearMonth(year, month)
  const mExpenses = monthlyExpenses.filter(r => r.year === year && r.month === month)
  const mIncomes = monthlyIncomes.filter(r => r.year === year && r.month === month)
  const mEntries = variableEntries.filter(e => e.year === year && e.month === month)
  const mExtra = extraIncomes.filter(e => e.date.startsWith(ym))
  const mDaily = dailyExpenses.filter(e => e.date.startsWith(ym))

  let totalFixed = 0
  let totalVariable = 0
  let totalInstallments = 0
  let person1Expenses = 0
  let person2Expenses = 0
  const byCategory: Record<string, number> = {}

  for (const rec of mExpenses) {
    const exp = expMap[rec.expenseId]
    if (!exp) continue
    let val = rec.value
    if (exp.type === 'variable') {
      val = mEntries.filter(e => e.expenseId === rec.expenseId).reduce((s, e) => s + e.value, 0)
    }
    if (exp.type === 'fixed') totalFixed += val
    else if (exp.type === 'variable') totalVariable += val
    else if (exp.type === 'installment') totalInstallments += val
    byCategory[exp.category] = (byCategory[exp.category] || 0) + val
    if (exp.responsible === 'person1') person1Expenses += val
    else if (exp.responsible === 'person2') person2Expenses += val
    else { person1Expenses += val / 2; person2Expenses += val / 2 }
  }

  // Daily expenses
  const totalDaily = mDaily.reduce((s, e) => s + e.value, 0)
  for (const d of mDaily) {
    byCategory[d.category] = (byCategory[d.category] || 0) + d.value
    if (d.responsible === 'person1') person1Expenses += d.value
    else if (d.responsible === 'person2') person2Expenses += d.value
    else { person1Expenses += d.value / 2; person2Expenses += d.value / 2 }
  }

  let totalIncome = 0
  let person1Income = 0
  let person2Income = 0

  for (const rec of mIncomes) {
    const inc = incMap[rec.incomeId]
    if (!inc) continue
    totalIncome += rec.value
    if (inc.responsible === 'person1') person1Income += rec.value
    else if (inc.responsible === 'person2') person2Income += rec.value
    else { person1Income += rec.value / 2; person2Income += rec.value / 2 }
  }

  // Extra incomes
  const totalExtra = mExtra.reduce((s, e) => s + e.value, 0)
  for (const e of mExtra) {
    totalIncome += e.value
    if (e.responsible === 'person1') person1Income += e.value
    else if (e.responsible === 'person2') person2Income += e.value
    else { person1Income += e.value / 2; person2Income += e.value / 2 }
  }

  const totalExpenses = totalFixed + totalVariable + totalInstallments + totalDaily
  const balance = totalIncome - totalExpenses

  return {
    totalIncome,
    totalExpenses,
    totalFixed,
    totalVariable,
    totalInstallments,
    totalDaily,
    totalExtra,
    balance,
    person1Income,
    person2Income,
    person1Expenses,
    person2Expenses,
    byCategory,
  }
}

export function getMonthList(
  from: { year: number; month: number },
  count: number
): Array<{ year: number; month: number }> {
  const result = []
  let date = new Date(from.year, from.month - 1)
  for (let i = 0; i < count; i++) {
    result.push({ year: date.getFullYear(), month: date.getMonth() + 1 })
    date = addMonths(date, -1)
  }
  return result
}

// Returns all days in a month as date strings YYYY-MM-DD
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay() // 0=Sun
}

export function padDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
