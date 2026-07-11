// Tipos espelhando os schemas Pydantic do backend

export interface MovieListItem {
  id: number
  title: string
  poster_path: string | null
  release_date: string | null
  vote_average: number | null
}

export interface MovieListResponse {
  page: number
  total_pages: number
  total_results: number
  results: MovieListItem[]
}

export interface Genre {
  id: number
  name: string
}

export interface CastMember {
  name: string
  character: string | null
  profile_path: string | null
}

export interface MovieDetails {
  id: number
  title: string
  overview: string | null
  poster_path: string | null
  backdrop_path: string | null
  release_date: string | null
  runtime: number | null
  vote_average: number | null
  genres: Genre[]
  cast: CastMember[]
}

export interface Rating {
  movie_id: number
  score: number
  movie_title: string
  movie_poster_path: string | null
  updated_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  username: string
}
