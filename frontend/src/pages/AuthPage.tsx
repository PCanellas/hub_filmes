import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') await login(username, password)
      else await register(username, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h2 className="mb-6 text-center text-2xl font-bold">
        {mode === 'login' ? 'Entrar' : 'Criar conta'}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nome de usuário"
          required
          minLength={3}
          maxLength={50}
          autoFocus
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 outline-none focus:border-amber-400"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha (mínimo 6 caracteres)"
          required
          minLength={6}
          maxLength={100}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 outline-none focus:border-amber-400"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-amber-400 py-3 font-semibold text-neutral-950 hover:bg-amber-300 disabled:opacity-50"
        >
          {submitting ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-neutral-400">
        {mode === 'login' ? (
          <>
            Não tem conta?{' '}
            <button onClick={() => setMode('register')} className="text-amber-400 underline">
              Cadastre-se
            </button>
          </>
        ) : (
          <>
            Já tem conta?{' '}
            <button onClick={() => setMode('login')} className="text-amber-400 underline">
              Entre
            </button>
          </>
        )}
      </p>
    </main>
  )
}
