export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto my-8 max-w-md rounded-lg border border-red-900 bg-red-950/50 p-4 text-center">
      <p className="text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded bg-red-800 px-4 py-1.5 text-sm hover:bg-red-700"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
