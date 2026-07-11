import { tmdbImage } from '../api/movies'
import { StarRating } from './StarRating'

interface Props {
  title: string
  posterPath: string | null
  score?: number // nota do usuário, se houver (página Filmes Avaliados)
  onClick: () => void
}

export function MovieCard({ title, posterPath, score, onClick }: Props) {
  const poster = tmdbImage(posterPath)

  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-lg bg-neutral-900 text-left ring-amber-400 transition hover:scale-[1.03] hover:ring-2"
    >
      {poster ? (
        <img src={poster} alt={`Pôster de ${title}`} loading="lazy" className="aspect-2/3 w-full object-cover" />
      ) : (
        <div className="flex aspect-2/3 w-full items-center justify-center bg-neutral-800 p-4 text-center text-sm text-neutral-500">
          Sem pôster
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium group-hover:text-amber-400">{title}</h3>
        {score !== undefined && <StarRating value={score} readOnly size="sm" />}
      </div>
    </button>
  )
}
