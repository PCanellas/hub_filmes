import { api } from './client'
import type { Rating } from './types'

export function listMyRatings(): Promise<Rating[]> {
  return api('/ratings')
}

export function createRating(data: {
  movie_id: number
  score: number
  movie_title: string
  movie_poster_path: string | null
}): Promise<Rating> {
  return api('/ratings', { method: 'POST', body: JSON.stringify(data) })
}

export function updateRating(movieId: number, score: number): Promise<Rating> {
  return api(`/ratings/${movieId}`, { method: 'PUT', body: JSON.stringify({ score }) })
}

export function deleteRating(movieId: number): Promise<void> {
  return api(`/ratings/${movieId}`, { method: 'DELETE' })
}
