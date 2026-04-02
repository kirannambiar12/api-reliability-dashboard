export function LoadingState({ message }: { message: string }) {
  return <p className="text-sm text-zinc-600 italic text-center mt-10">{message}</p>;
}

export function ErrorState({ message }: { message: string }) {
  return <p className="text-sm text-rose-700 italic text-center mt-10">{message}</p>;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-zinc-600 italic text-center mt-10">{message}</p>;
}
