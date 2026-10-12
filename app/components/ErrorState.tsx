import { AlertCircle, X } from "lucide-react";

export default function ErrorState({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

      <div className="flex-1">
        <p className="text-sm font-semibold">We couldn&apos;t complete that search</p>
        <p className="mt-0.5 break-words text-sm text-red-700">{message}</p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 text-red-500 transition hover:bg-red-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
