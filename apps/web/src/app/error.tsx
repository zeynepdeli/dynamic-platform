"use client";

// Hata ayrıntıları ziyaretçiye GÖSTERİLMEZ (sunucu log'una yazılır)
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-28 text-center">
      <h1 className="text-2xl font-semibold">Bir şeyler ters gitti</h1>
      <p className="opacity-70">Lütfen birazdan tekrar deneyin.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-xl bg-secondary px-6 py-3 font-semibold text-on-secondary">
        Tekrar dene
      </button>
    </div>
  );
}
