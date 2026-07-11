import { useEffect, useState } from 'react'
import { getGenres } from '../api/movies'
import type { Genre } from '../api/types'

interface Props {
  genreId: number | null
  year: number | null
  onChange: (genreId: number | null, year: number | null) => void
  disabled?: boolean
}

const CURRENT_YEAR = new Date().getFullYear()

export function Filters({ genreId, year, onChange, disabled = false }: Props) {
  const [genres, setGenres] = useState<Genre[]>([])

  useEffect(() => {
    // Se a lista de gêneros falhar, o filtro simplesmente não aparece
    getGenres().then(setGenres).catch(() => setGenres([]))
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-3">
      {genres.length > 0 && (
        <select
          value={genreId ?? ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null, year)}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm disabled:opacity-50"
          aria-label="Filtrar por gênero"
        >
          <option value="">Todos os gêneros</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      )}

      <select
        value={year ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(genreId, e.target.value ? Number(e.target.value) : null)}
        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm disabled:opacity-50"
        aria-label="Filtrar por ano"
      >
        <option value="">Todos os anos</option>
        {Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - i).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {(genreId || year) && (
        <button
          onClick={() => onChange(null, null)}
          className="text-sm text-amber-400 underline"
          disabled={disabled}
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
