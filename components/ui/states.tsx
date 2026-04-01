export function LoadingState({ message }: { message: string }) {
  return <p className="text-sm text-zinc-600">{message}</p>;
}

export function ErrorState({ message }: { message: string }) {
  return <p className="text-sm text-rose-700">{message}</p>;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-zinc-600">{message}</p>;
}
