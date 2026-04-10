import { useState } from 'react'
import { Save, Trash2, AlertTriangle, KeyRound, CheckCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { state, updateSettings } = useFinance()
  const { changeCredentials, username, mode } = useAuth()
  const isCouple = mode === 'couple'

  const [names, setNames] = useState({
    person1Name: state.settings.person1Name,
    person2Name: state.settings.person2Name,
  })
  const [namesSaved, setNamesSaved] = useState(false)

  const [creds, setCreds] = useState({ currentPassword: '', newUsername: username, newPassword: '', confirmPassword: '' })
  const [credsError, setCredsError] = useState('')
  const [credsSaved, setCredsSaved] = useState(false)

  const handleSaveNames = () => {
    updateSettings(names)
    setNamesSaved(true)
    setTimeout(() => setNamesSaved(false), 2000)
  }

  const handleSaveCreds = () => {
    setCredsError('')
    if (!creds.currentPassword) { setCredsError('Informe a senha atual.'); return }
    if (!creds.newUsername.trim()) { setCredsError('O usuário não pode ser vazio.'); return }
    if (!creds.newPassword) { setCredsError('A nova senha não pode ser vazia.'); return }
    if (creds.newPassword !== creds.confirmPassword) { setCredsError('As senhas não coincidem.'); return }

    const ok = changeCredentials(creds.currentPassword, creds.newUsername.trim(), creds.newPassword)
    if (!ok) {
      setCredsError('Senha atual incorreta.')
      return
    }
    setCredsSaved(true)
    setCreds({ currentPassword: '', newUsername: creds.newUsername, newPassword: '', confirmPassword: '' })
    setTimeout(() => setCredsSaved(false), 2000)
  }

  const handleClearData = () => {
    if (confirm('Tem certeza? Todos os dados serão apagados permanentemente.')) {
      if (confirm('Confirmação final: apagar TODOS os dados?')) {
        localStorage.removeItem('finance-casal-v1')
        window.location.reload()
      }
    }
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

      {/* Login credentials */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-700">Alterar credenciais de acesso</h3>
        </div>
        <p className="text-xs text-gray-500">Usuário atual: <span className="font-medium text-gray-700">{username}</span></p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha atual *</label>
          <input
            type="password"
            value={creds.currentPassword}
            onChange={e => setCreds(c => ({ ...c, currentPassword: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Senha atual"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Novo usuário *</label>
          <input
            type="text"
            value={creds.newUsername}
            onChange={e => setCreds(c => ({ ...c, newUsername: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha *</label>
            <input
              type="password"
              value={creds.newPassword}
              onChange={e => setCreds(c => ({ ...c, newPassword: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nova senha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar *</label>
            <input
              type="password"
              value={creds.confirmPassword}
              onChange={e => setCreds(c => ({ ...c, confirmPassword: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Confirmar"
            />
          </div>
        </div>

        {credsError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{credsError}</p>
        )}

        <button
          onClick={handleSaveCreds}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            credsSaved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {credsSaved ? <CheckCircle size={16} /> : <KeyRound size={16} />}
          {credsSaved ? 'Alterado com sucesso!' : 'Alterar credenciais'}
        </button>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
        <h3 className="font-semibold text-gray-700">Armazenamento</h3>
        <p className="text-sm text-gray-500">
          Todos os dados são armazenados localmente no seu navegador (localStorage).
          Limpar o cache do navegador ou trocar de dispositivo resultará na perda dos dados.
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
          Apaga permanentemente todos os dados do sistema. Esta ação não pode ser desfeita.
        </p>
        <button
          onClick={handleClearData}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Trash2 size={16} />
          Apagar todos os dados
        </button>
      </div>
    </div>
  )
}
