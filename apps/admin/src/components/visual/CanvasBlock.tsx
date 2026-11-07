"use client";

type CanvasBlockProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
  /** Bloğun üzerine gelince sağ üstte görünen butonlar */
  toolbar?: React.ReactNode;
  muted?: boolean;
  children: React.ReactNode;
};

/** Önizlemedeki tıklanabilir blok: hover'da çerçeve + etiket, seçiliyken kalın çerçeve */
export function CanvasBlock({ label, selected, onSelect, toolbar, muted = false, children }: CanvasBlockProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${label} bloğunu düzenle`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`group/block relative cursor-pointer outline-none ${muted ? "opacity-45" : ""}`}
    >
      {children}

      {/* Çerçeve (içeriğin üstünde, tıklamayı engellemez) */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-10 transition ${
          selected
            ? "ring-[3px] ring-inset ring-[#2563eb]"
            : "ring-0 ring-inset ring-[#2563eb]/60 group-hover/block:ring-2 group-focus-visible/block:ring-2"
        }`}
      />

      <span
        className={`absolute left-3 top-3 z-20 rounded-md px-2 py-1 text-[11px] font-semibold text-white shadow-sm transition ${
          selected ? "bg-[#2563eb] opacity-100" : "bg-[#2563eb]/90 opacity-0 group-hover/block:opacity-100 group-focus-visible/block:opacity-100"
        }`}
      >
        {label}
      </span>

      {toolbar && (
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className={`absolute right-3 top-3 z-20 flex items-center gap-1 rounded-lg bg-white/95 p-1 text-neutral-700 shadow-md ring-1 ring-black/5 transition ${
            selected ? "opacity-100" : "opacity-0 group-hover/block:opacity-100 group-focus-within/block:opacity-100"
          }`}
        >
          {toolbar}
        </div>
      )}
    </div>
  );
}
