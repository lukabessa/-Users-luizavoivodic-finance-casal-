import { useState } from 'react'
import { Save, Trash2, AlertTriangle, KeyRound, CheckCircle, Cloud } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const { state, updateSettings } = useFinance()
  const { changePassword, email, mode, user } = useAuth()
  const isCouple = mode === 'couple'
  const userId = user?.id ?? null

  const [names, setNames] = useState({
    person1Name: state.settings.person1Name,
    person2Name: state.settings.person2Name,
  })
  const [namesSaved, setNamesSaved] = useState(false)

  const [pwForm, setPwForm] = useState({ newPassword: '', confirmPassword: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  const [clearLoading, setClearLoading] = useState(false)

  const handleSaveNames = () => {
    updateSettings(names)
    setNamesSaved(true)
    setTimeout(() => setNamesSaved(false), 2000)
  }

  const handleSavePassword = async () => {
    setPwError('')
    if (!pwForm.newPassword) { setPwError('A nova senha não pode ser vazia.'); return }
    if (pwForm.newPassword.length < 6) { setPwError('A senha deve ter pelo menos 6 caracteres.'); return }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('As senhas não coincidem.'); return }

    setPwLoading(true)
    const err = await changePassword(pwForm.newPassword)
    setPwLoading(false)
    if (err) {
      setPwError(err)
      return
    }
    setPwSaved(true)
    setPwForm({ newPassword: '', confirmPassword: '' })
    setTimeout(() => setPwSaved(false), 2000)
  }

  const handleClearData = async () => {
    if (!confirm('Tem certeza? Todos os dados serão apagados permanentemente.')) return
    if (!confirm('Confirmação final: apagar TODOS os dados?')) return
    if (!userId) return

    setClearLoading(true)
    await Promise.all([
      supabase.from('expenses').delete().eq('user_id', userId),
      supabase.from('incomes').delete().eq('user_id', userId),
      supabase.from('monthly_expenses').delete().eq('user_id', userId),
      supabase.from('monthly_incomes').delete().eq('user_id', userId),
      supabase.from('variable_entries').delete().eq('user_id', userId),
      supabase.from('extra_incomes').delete().eq('user_id', userId),
      supabase.from('daily_expenses').delete().eq('user_id', userId),
      supabase.from('settings').delete().eq('user_id', userId),
    ])
    window.location.reload()
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>

      {/* Names */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-700">{isCouple ? 'Nomes do casal' : 'Seu nome'}</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isCouple ? 'Pessoa 1' : 'Seu nome'}</label>
          <input
            type="text"
            value={names.person1Name}
            onChange={e => setNames(n => ({ ...n, person1Name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {isCouple && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pessoa 2</label>
            <input
              type="text"
              value={names.person2Name}
              onChange={e => setNames(n => ({ ...n, person2Name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
        <button
          onClick={handleSaveNames}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            namesSaved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {namesSaved ? <CheckCircle size={16} /> : <Save size={16} />}
          {namesSaved ? 'Salvo!' : 'Salvar nomes'}
        </button>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-700">Alterar senha</h3>
        </div>
        <p className="text-xs text-gray-500">Conta: <span className="font-medium text-gray-700">{email}</span></p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha *</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Mín. 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar *</label>
            <input
              type="password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Repita"
            />
          </div>
        </div>

        {pwError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwError}</p>
        )}

        <button
          onClick={handleSavePassword}
          disabled={pwLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            pwSaved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400'
          }`}
        >
          {pwSaved ? <CheckCircle size={16} /> : <KeyRound size={16} />}
          {pwLoading ? 'Salvando...' : pwSaved ? 'Senha alterada!' : 'Alterar senha'}
        </button>
      </div>

      {/* Storage info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Cloud size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-700">Armazenamento em nuvem</h3>
        </div>
        <p className="text-sm text-gray-500">
          Todos os dados são sincronizados em tempo real via Supabase.
          {isCouple && ' Ambos os parceiros acessam os mesmos dados de qualquer dispositivo.'}
        </p>
        <p className="text-sm text-gray-500">
          Despesas cadastradas: <strong className="text-gray-700">{state.expenses.length}</strong><br />
          Receitas cadastradas: <strong className="text-gray-700">{state.incomes.length}</strong><br />
          Registros mensais: <strong className="text-gray-700">{state.monthlyExpenses.length + state.monthlyIncomes.length}</strong>
        </p>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={18} />
          <h3 className="font-semibold">Zona de perigo</h3>
        </div>
        <p className="text-sm text-red-600">
          Apaga permanentemente todos os dados da conta na nuvem. Esta ação não pode ser desfeita.
        </p>
        <button
          onClick={handleClearData}
          disabled={clearLoading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-red-400 transition-colors"
        >
          <Trash2 size={16} />
          {clearLoading ? 'Apagando...' : 'Apagar todos os dados'}
        </button>
      </div>
    </div>
  )
}
