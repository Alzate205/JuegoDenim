interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="border border-red-500/60 bg-red-500/10 text-red-200 text-sm rounded-xl px-4 py-3">
      {message}
    </div>
  );
}
