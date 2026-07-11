import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-amber-400 text-neutral-950' : 'text-neutral-300 hover:bg-neutral-800'
  }`

export function Header() {
  const { isLoggedIn, username, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
      {/* flex-wrap: no celular a navegação quebra para uma segunda linha,
          em vez de espremer logo, links e botão de login na mesma */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <span className="shrink-0 text-lg font-bold text-amber-400">🎬 CineRate</span>

        <nav className="order-last flex w-full justify-center gap-1 sm:order-none sm:w-auto sm:justify-start">
          <NavLink to="/" className={linkClass} end>
            Buscar
          </NavLink>
          <NavLink to="/avaliados" className={linkClass}>
            Filmes Avaliados
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {isLoggedIn ? (
            <>
              <span className="hidden text-neutral-400 sm:inline">Olá, {username}</span>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="rounded border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800"
              >
                Sair
              </button>
            </>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Entrar
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
