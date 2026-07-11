import { useState } from 'react'

interface Props {
  value: number // 0 = sem nota
  onChange?: (score: number) => void
  readOnly?: boolean
  size?: 'sm' | 'lg'
}

/** Nota de 1 a 5 estrelas. Interativa (hover + clique) ou somente leitura. */
export function StarRating({ value, onChange, readOnly = false, size = 'lg' }: Props) {
  const [hovered, setHovered] = useState(0)
  const shown = hovered || value
  const starSize = size === 'lg' ? 'text-3xl' : 'text-lg'

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          className={`${starSize} leading-none transition-transform ${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } ${star <= shown ? 'text-amber-400' : 'text-neutral-700'}`}
          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
