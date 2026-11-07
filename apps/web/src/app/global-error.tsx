"use client";

// API tamamen kapalıysa layout da çizilemez; bu sade sayfa gösterilir.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="tr">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "6rem 1rem" }}>
        <h1>Site şu anda kullanılamıyor</h1>
        <p>Lütfen birkaç dakika sonra tekrar deneyin.</p>
        <button type="button" onClick={reset}>Tekrar dene</button>
      </body>
    </html>
  );
}
