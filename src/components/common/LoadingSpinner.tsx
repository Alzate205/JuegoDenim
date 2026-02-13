export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="h-10 w-10 border-4 border-slate-600 border-t-accent rounded-full animate-spin" />
      {message && (
        <p className="text-sm text-slate-300">{message}</p>
      )}
    </div>
  );
}
