import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMovieDetails, tmdbImage } from '../api/movies'
import type { MovieDetails } from '../api/types'
import { useAuth } from '../contexts/AuthContext'
import { useRatings } from '../contexts/RatingsContext'
import { ErrorMessage } from './ErrorMessage'
import { Spinner } from './Spinner'
import { StarRating } from './StarRating'

interface Props {
  movieId: number
  onClose: () => void
}

function formatDate(date: string | null): string {
  if (!date) return 'Data desconhecida'
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
}

export function MovieModal({ movieId, onClose }: Props) {
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const { isLoggedIn } = useAuth()
  const { getRating, rate, removeRating } = useRatings()
  const navigate = useNavigate()

  const myRating = getRating(movieId)

  // Busca os detalhes ao abrir (e refaz se trocar de filme)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getMovieDetails(movieId)
      .then((data) => {
        if (!cancelled) setMovie(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [movieId])

  // Fecha com a tecla Esc e trava o scroll da página atrás do modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function handleRate(score: number) {
    if (!movie) return
    setSaving(true)
    setActionError(null)
    try {
      await rate({ id: movie.id, title: movie.title, poster_path: movie.poster_path }, score)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao salvar avaliação')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    setSaving(true)
    setActionError(null)
    try {
      await removeRating(movieId)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao remover avaliação')
    } finally {
      setSaving(false)
    }
  }

  return (
    // Fundo escurecido: clicar fora fecha o modal
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl rounded-xl bg-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-lg hover:bg-black"
          aria-label="Fechar"
        >
          ✕
        </button>

        {loading && <Spinner label="Carregando detalhes…" />}
        {error && <ErrorMessage message={error} />}

        {movie && !loading && !error && (
          <>
            {tmdbImage(movie.backdrop_path, 'w780') && (
              <img
                src={tmdbImage(movie.backdrop_path, 'w780')!}
                alt=""
                className="h-48 w-full rounded-t-xl object-cover opacity-60 sm:h-64"
              />
            )}

            <div className="flex flex-col gap-6 p-6 sm:flex-row">
              {tmdbImage(movie.poster_path) && (
                <img
                  src={tmdbImage(movie.poster_path)!}
                  alt={`Pôster de ${movie.title}`}
                  className="mx-auto w-40 shrink-0 rounded-lg sm:mx-0 sm:-mt-24 sm:w-44"
                />
              )}

              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold">{movie.title}</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  {formatDate(movie.release_date)}
                  {movie.runtime ? ` · ${movie.runtime} min` : ''}
                  {movie.genres.length > 0 && ` · ${movie.genres.map((g) => g.name).join(', ')}`}
                </p>

                <h3 className="mt-4 font-semibold text-neutral-300">Sinopse</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                  {movie.overview || 'Sinopse não disponível.'}
                </p>

                {/* ---- Avaliação ---- */}
                <div className="mt-5 rounded-lg bg-neutral-800/70 p-4">
                  {!isLoggedIn ? (
                    <p className="text-sm text-neutral-400">
                      <button onClick={() => navigate('/login')} className="text-amber-400 underline">
                        Entre na sua conta
                      </button>{' '}
                      para avaliar este filme.
                    </p>
                  ) : (
                    <>
                      <p className="mb-2 text-sm font-semibold text-neutral-300">
                        {myRating ? 'Sua avaliação (clique para editar)' : 'Avalie este filme'}
                      </p>
                      <div className="flex items-center gap-4">
                        <StarRating value={myRating?.score ?? 0} onChange={handleRate} readOnly={saving} />
                        {myRating && (
                          <button
                            onClick={handleRemove}
                            disabled={saving}
                            className="text-sm text-red-400 underline hover:text-red-300 disabled:opacity-50"
                          >
                            Remover avaliação
                          </button>
                        )}
                      </div>
                      {saving && <p className="mt-2 text-xs text-neutral-500">Salvando…</p>}
                      {actionError && <p className="mt-2 text-xs text-red-400">{actionError}</p>}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ---- Elenco ---- */}
            {movie.cast.length > 0 && (
              <div className="px-6 pb-6">
                <h3 className="mb-3 font-semibold text-neutral-300">Elenco principal</h3>
                <ul className="flex gap-4 overflow-x-auto pb-2">
                  {movie.cast.map((person) => (
                    <li key={`${person.name}-${person.character}`} className="w-24 shrink-0 text-center">
                      {tmdbImage(person.profile_path, 'w185') ? (
                        <img
                          src={tmdbImage(person.profile_path, 'w185')!}
                          alt={person.name}
                          loading="lazy"
                          className="mx-auto aspect-2/3 w-full rounded-lg object-cover"
                        />
                      ) : (
                        <div className="mx-auto flex aspect-2/3 w-full items-center justify-center rounded-lg bg-neutral-800 text-2xl">
                          🎭
                        </div>
                      )}
                      <p className="mt-1 truncate text-xs font-medium" title={person.name}>
                        {person.name}
                      </p>
                      {person.character && (
                        <p className="truncate text-xs text-neutral-500" title={person.character}>
                          {person.character}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
