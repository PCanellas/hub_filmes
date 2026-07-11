export function Spinner({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10" role="status" aria-label={label}>
      <div className="size-8 animate-spin rounded-full border-2 border-neutral-700 border-t-amber-400" />
      <span className="text-sm text-neutral-400">{label}</span>
    </div>
  )
}
