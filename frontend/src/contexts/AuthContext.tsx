import { createContext, useContext, useState, type ReactNode } from 'react'
import { getToken, setToken } from '../api/client'
import * as authApi from '../api/auth'

interface AuthContextValue {
  username: string | null
  isLoggedIn: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USERNAME_KEY = 'auth_username'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restaura a sessão do localStorage ao recarregar a página
  const [username, setUsername] = useState<string | null>(() =>
    getToken() ? localStorage.getItem(USERNAME_KEY) : null,
  )

  function saveSession(token: string, name: string) {
    setToken(token)
    localStorage.setItem(USERNAME_KEY, name)
    setUsername(name)
  }

  async function login(user: string, password: string) {
    const data = await authApi.login(user, password)
    saveSession(data.access_token, data.username)
  }

  async function register(user: string, password: string) {
    const data = await authApi.register(user, password)
    saveSession(data.access_token, data.username)
  }

  function logout() {
    setToken(null)
    localStorage.removeItem(USERNAME_KEY)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ username, isLoggedIn: username !== null, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
