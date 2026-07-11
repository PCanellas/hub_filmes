import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MovieCard } from '../components/MovieCard'
import { MovieModal } from '../components/MovieModal'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../contexts/AuthContext'
import { useRatings } from '../contexts/RatingsContext'

export function RatedMoviesPage() {
  const { isLoggedIn } = useAuth()
  const { ratings, loading } = useRatings()
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null)

  if (!isLoggedIn) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-neutral-400">
          Você precisa{' '}
          <Link to="/login" className="text-amber-400 underline">
            entrar na sua conta
          </Link>{' '}
          para ver seus filmes avaliados.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-300">
        Filmes Avaliados {ratings.length > 0 && `(${ratings.length})`}
      </h2>

      {loading && <Spinner label="Carregando suas avaliações…" />}

      {!loading && ratings.length === 0 && (
        <p className="py-10 text-center text-neutral-500">
          Você ainda não avaliou nenhum filme.{' '}
          <Link to="/" className="text-amber-400 underline">
            Busque um filme
          </Link>{' '}
          e dê sua primeira nota!
        </p>
      )}

      {!loading && ratings.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {ratings.map((rating) => (
            <MovieCard
              key={rating.movie_id}
              title={rating.movie_title}
              posterPath={rating.movie_poster_path}
              score={rating.score}
              onClick={() => setSelectedMovieId(rating.movie_id)}
            />
          ))}
        </div>
      )}

      {selectedMovieId !== null && (
        <MovieModal movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} />
      )}
    </main>
  )
}