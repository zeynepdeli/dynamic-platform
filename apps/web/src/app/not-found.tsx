import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-28 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold">Sayfa bulunamadı</h1>
      <p className="opacity-70">Aradığınız sayfa taşınmış ya da kaldırılmış olabilir.</p>
      <Link href="/" className="mt-4 rounded-xl bg-secondary px-6 py-3 font-semibold text-on-secondary">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
