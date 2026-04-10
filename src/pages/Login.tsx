import { useState } from 'react'
import { Heart, User2, Eye, EyeOff, Lock, Users, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { Mode } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [activeMode, setActiveMode] = useState<Mode>('couple')
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleModeChange = (m: Mode) => {
    setActiveMode(m)
    setForm({ username: '', password: '' })
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const ok = login(form.username, form.password, activeMode)
      if (!ok) { setError('Usuário ou senha incorretos.'); setLoading(false) }
    }, 400)
  }

  const isSolo = activeMode === 'solo'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <Heart size={32} className="text-pink-400" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-white">Finanças Pessoais</h1>
          <p className="text-indigo-300 text-sm mt-1">Controle financeiro inteligente</p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 mb-4 bg-white/10 backdrop-blur p-1 rounded-xl">
          <ModeTab
            active={activeMode === 'couple'}
            onClick={() => handleModeChange('couple')}
            icon={<Users size={16} />}
            label="Casal"
            sublabel="Conta compartilhada"
            color="indigo"
          />
          <ModeTab
            active={activeMode === 'solo'}
            onClick={() => handleModeChange('solo')}
            icon={<UserCircle size={16} />}
            label="Solo"
            sublabel="Conta individual"
            color="purple"
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Mode header */}
          <div className={`flex items-center gap-3 mb-6 p-3 rounded-xl ${isSolo ? 'bg-purple-50' : 'bg-indigo-50'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSolo ? 'bg-purple-100' : 'bg-indigo-100'}`}>
              {isSolo
                ? <UserCircle size={20} className="text-purple-600" />
                : <Users size={20} className="text-indigo-600" />
              }
            </div>
            <div>
              <p className={`font-semibold text-sm ${isSolo ? 'text-purple-700' : 'text-indigo-700'}`}>
                {isSolo ? 'Conta Solo' : 'Conta Casal'}
              </p>
              <p className="text-xs text-gray-500">
                {isSolo ? 'Controle financeiro individual' : 'Controle financeiro do casal'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuário</label>
              <div className="relative">
                <User2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className={`w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 transition-shadow ${isSolo ? 'focus:ring-purple-500' : 'focus:ring-indigo-500'}`}
                  placeholder={isSolo ? 'ex: eu' : 'ex: casal'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 transition-shadow ${isSolo ? 'focus:ring-purple-500' : 'focus:ring-indigo-500'}`}
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                isSolo
                  ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Entrando...
                </>
              ) : (
                `Entrar na conta ${isSolo ? 'solo' : 'do casal'}`
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center space-y-1">
            <p className="text-xs text-gray-400">
              Acesso padrão {isSolo ? 'solo' : 'casal'}:{' '}
              <span className="font-mono font-medium text-gray-500">{isSolo ? 'eu' : 'casal'}</span>
              {' / '}
              <span className="font-mono font-medium text-gray-500">1234</span>
            </p>
            <p className="text-xs text-gray-400">Altere nas Configurações após entrar</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModeTab({
  active, onClick, icon, label, sublabel, color,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  sublabel: string
  color: 'indigo' | 'purple'
}) {
  const activeClass = color === 'indigo'
    ? 'bg-white text-indigo-700 shadow-sm'
    : 'bg-white text-purple-700 shadow-sm'

  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all ${
        active ? activeClass : 'text-white/60 hover:text-white/80'
      }`}
    >
      {icon}
      <div className="text-left">
        <p className={`text-sm font-semibold leading-none ${active ? '' : 'text-white/80'}`}>{label}</p>
        <p className={`text-xs mt-0.5 leading-none ${active ? 'text-gray-400' : 'text-white/50'}`}>{sublabel}</p>
      </div>
    </button>
  )
}
