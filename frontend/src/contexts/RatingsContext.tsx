import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as ratingsApi from '../api/ratings'
import type { Rating } from '../api/types'
import { useAuth } from './AuthContext'

interface RatingsContextValue {
  ratings: Rating[]
  loading: boolean
  /** Nota do usuário para um filme, ou undefined se não avaliou */
  getRating: (movieId: number) => Rating | undefined
  rate: (movie: { id: number; title: string; poster_path: string | null }, score: number) => Promise<void>
  removeRating: (movieId: number) => Promise<void>
}

const RatingsContext = createContext<RatingsContextValue | null>(null)

export function RatingsProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(false)

  // Carrega as avaliações quando o usuário loga; limpa quando desloga
  useEffect(() => {
    if (!isLoggedIn) {
      setRatings([])
      return
    }
    let cancelled = false
    setLoading(true)
    ratingsApi
      .listMyRatings()
      .then((data) => {
        if (!cancelled) setRatings(data)
      })
      .catch(() => {
        if (!cancelled) setRatings([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  function getRating(movieId: number) {
    return ratings.find((r) => r.movie_id === movieId)
  }

  async function rate(movie: { id: number; title: string; poster_path: string | null }, score: number) {
    const existing = getRating(movie.id)
    const saved = existing
      ? await ratingsApi.updateRating(movie.id, score)
      : await ratingsApi.createRating({
          movie_id: movie.id,
          score,
          movie_title: movie.title,
          movie_poster_path: movie.poster_path,
        })
    setRatings((prev) => [saved, ...prev.filter((r) => r.movie_id !== movie.id)])
  }

  async function removeRating(movieId: number) {
    await ratingsApi.deleteRating(movieId)
    setRatings((prev) => prev.filter((r) => r.movie_id !== movieId))
  }

  return (
    <RatingsContext.Provider value={{ ratings, loading, getRating, rate, removeRating }}>
      {children}
    </RatingsContext.Provider>
  )
}

export function useRatings(): RatingsContextValue {
  const ctx = useContext(RatingsContext)
  if (!ctx) throw new Error('useRatings deve ser usado dentro de <RatingsProvider>')
  return ctx
}
