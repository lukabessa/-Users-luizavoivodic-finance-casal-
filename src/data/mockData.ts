import type { Expense, Income, Settings } from '../types'
import { generateId } from '../utils/finance'

export const defaultSettings: Settings = {
  person1Name: 'Pessoa 1',
  person2Name: 'Pessoa 2',
}

export const sampleExpenses: Expense[] = [
  {
    id: generateId(),
    name: 'Aluguel',
    category: 'housing',
    type: 'fixed',
    baseValue: 2200,
    dueDay: 5,
    responsible: 'both',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Conta de Luz',
    category: 'utilities',
    type: 'variable',
    baseValue: 0,
    dueDay: 10,
    responsible: 'both',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Internet',
    category: 'utilities',
    type: 'fixed',
    baseValue: 110,
    dueDay: 15,
    responsible: 'both',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Mercado',
    category: 'food',
    type: 'variable',
    baseValue: 0,
    dueDay: 1,
    responsible: 'both',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Netflix',
    category: 'subscriptions',
    type: 'fixed',
    baseValue: 55.9,
    dueDay: 20,
    responsible: 'both',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

export const sampleIncomes: Income[] = [
  {
    id: generateId(),
    name: 'Salário',
    category: 'salary',
    type: 'fixed',
    baseValue: 5000,
    receiptDay: 5,
    responsible: 'person1',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Salário',
    category: 'salary',
    type: 'fixed',
    baseValue: 4500,
    receiptDay: 5,
    responsible: 'person2',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]
