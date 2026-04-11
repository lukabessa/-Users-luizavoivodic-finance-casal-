import { useState } from 'react'
import { Heart, Mail, Eye, EyeOff, Lock, Users, UserCircle, UserPlus, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { Mode } from '../context/AuthContext'

export default function Login() {
  const { login, signup } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [activeMode, setActiveMode] = useState<Mode>('couple')
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const isSolo = activeMode === 'solo'

  const handleModeChange = (m: Mode) => {
    setActiveMode(m)
    setError('')
    setInfo('')
  }

  const toggleSignup = () => {
    setIsSignup(v => !v)
    setError('')
    setInfo('')
    setForm({ email: '', password: '', confirmPassword: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (isSignup && form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      if (isSignup) {
        const err = await signup(form.email, form.password, activeMode)
        if (err) {
          setError(err)
        } else {
          setInfo('Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.')
          setIsSignup(false)
          setForm({ email: form.email, password: '', confirmPassword: '' })
        }
      } else {
        const err = await login(form.email, form.password)
        if (err) setError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <Heart size={32} className="text-pink-400" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-white">Finanças Pessoais</h1>
          <p className="text-indigo-300 text-sm mt-1">Controle financeiro inteligente</p>
        </div>

        {/* Mode selector — shown only on signup */}
        {isSignup && (
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
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {isSignup ? 'Criar conta' : 'Entrar'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isSignup
                ? isSolo
                  ? 'Crie sua conta individual'
                  : 'Crie a conta do casal — ambos entram com o mesmo e-mail e senha'
                : 'Acesse sua conta para ver suas finanças'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                  placeholder="seu@email.com"
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
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                  placeholder={isSignup ? 'Mínimo 6 caracteres' : 'Sua senha'}
                  minLength={isSignup ? 6 : undefined}
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

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {info && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {isSignup ? 'Criando conta...' : 'Entrando...'}
                </>
              ) : (
                <>
                  {isSignup ? <UserPlus size={16} /> : <LogIn size={16} />}
                  {isSignup ? 'Criar conta' : 'Entrar'}
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={toggleSignup}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              {isSignup ? 'Já tem conta? Entrar' : 'Não tem conta? Criar conta'}
            </button>
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
