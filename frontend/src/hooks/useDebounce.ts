import { useEffect, useState } from 'react'

/** Retorna o valor apenas após `delay` ms sem mudanças.
 *  Evita uma chamada à API a cada tecla digitada na busca. */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
