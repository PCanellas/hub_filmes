import { useCallback, useEffect, useRef, useState } from 'react'
import { discoverMovies, searchMovies } from '../api/movies'
import type { MovieListItem } from '../api/types'
import { ErrorMessage } from '../components/ErrorMessage'
import { Filters } from '../components/Filters'
import { MovieCard } from '../components/MovieCard'
import { MovieModal } from '../components/MovieModal'
import { Spinner } from '../components/Spinner'
import { useDebounce } from '../hooks/useDebounce'

export function HomePage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query.trim())

  const [genreId, setGenreId] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)

  const [movies, setMovies] = useState<MovieListItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true) // primeira página
  const [loadingMore, setLoadingMore] = useState(false) // páginas seguintes
  const [error, setError] = useState<string | null>(null)

  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null)

  // Sem busca digitada mostramos os populares (discover); com busca, o search.
  // Os filtros de gênero/ano só existem no discover — a API do TMDB não filtra o search.
  const isSearching = debouncedQuery.length > 0

  const fetchPage = useCallback(
    (pageToLoad: number) =>
      isSearching
        ? searchMovies(debouncedQuery, pageToLoad)
        : discoverMovies(pageToLoad, genreId ?? undefined, year ?? undefined),
    [isSearching, debouncedQuery, genreId, year],
  )

  // Recomeça da página 1 sempre que a busca ou os filtros mudam
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setMovies([])
    setPage(1)

    fetchPage(1)
      .then((data) => {
        if (cancelled) return
        setMovies(data.results)
        setTotalPages(data.total_pages)
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
  }, [fetchPage])

  // ---- Scroll infinito ----
  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasMore = page < totalPages

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || loading || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        const nextPage = page + 1
        setLoadingMore(true)
        fetchPage(nextPage)
          .then((data) => {
            setMovies((prev) => {
              // O TMDB pode repetir filmes entre páginas; deduplicamos por id
              const seen = new Set(prev.map((m) => m.id))
              return [...prev, ...data.results.filter((m) => !seen.has(m.id))]
            })
            setPage(nextPage)
            setTotalPages(data.total_pages)
          })
          .catch(() => {
            // Falha ao carregar mais: não derruba a lista já exibida
          })
          .finally(() => setLoadingMore(false))
      },
      { rootMargin: '400px' }, // começa a carregar antes de chegar no fim
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchPage, page, hasMore, loading, loadingMore])

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Barra de pesquisa */}
      <div className="mb-6 flex flex-col gap-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar filmes…"
          autoFocus
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-base outline-none placeholder:text-neutral-500 focus:border-amber-400"
          aria-label="Buscar filmes"
        />
        {!isSearching && (
          <Filters
            genreId={genreId}
            year={year}
            onChange={(g, y) => {
              setGenreId(g)
              setYear(y)
            }}
          />
        )}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-neutral-300">
        {isSearching ? `Resultados para "${debouncedQuery}"` : 'Filmes populares'}
      </h2>

      {loading && <Spinner label="Buscando filmes…" />}
      {error && <ErrorMessage message={error} onRetry={() => setQuery((q) => q)} />}

      {!loading && !error && movies.length === 0 && (
        <p className="py-10 text-center text-neutral-500">
          Nenhum filme encontrado{isSearching ? ` para "${debouncedQuery}"` : ''}.
        </p>
      )}

      {!loading && movies.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              onClick={() => setSelectedMovieId(movie.id)}
            />
          ))}
        </div>
      )}

      {/* Sentinela do scroll infinito */}
      <div ref={sentinelRef} />
      {loadingMore && <Spinner label="Carregando mais filmes…" />}

      {selectedMovieId !== null && (
        <MovieModal movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} />
      )}
    </main>
  )
}
