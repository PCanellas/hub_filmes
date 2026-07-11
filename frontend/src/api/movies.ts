import { api } from './client'
import type { Genre, MovieDetails, MovieListResponse } from './types'

export function searchMovies(query: string, page = 1): Promise<MovieListResponse> {
  const params = new URLSearchParams({ query, page: String(page) })
  return api(`/movies/search?${params}`)
}

export function discoverMovies(
  page = 1,
  genreId?: number,
  year?: number,
): Promise<MovieListResponse> {
  const params = new URLSearchParams({ page: String(page) })
  if (genreId) params.set('genre_id', String(genreId))
  if (year) params.set('year', String(year))
  return api(`/movies/discover?${params}`)
}

export function getMovieDetails(movieId: number): Promise<MovieDetails> {
  return api(`/movies/${movieId}`)
}

export function getGenres(): Promise<Genre[]> {
  return api('/movies/genres')
}

// Monta a URL de imagem do TMDB (https://developer.themoviedb.org/docs/image-basics)
export function tmdbImage(path: string | null, size = 'w342'): string | null {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null
}
