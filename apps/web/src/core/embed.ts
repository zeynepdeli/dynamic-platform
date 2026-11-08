/**
 * Video adresinden güvenli gömme adresi üretir. Yalnızca YouTube ve Vimeo;
 * kimlik tek tek doğrulanır, başka hiçbir adres iframe'e girmez.
 * YouTube: çerezsiz (youtube-nocookie) · Vimeo: dnt=1 (takip yok)
 */
export function videoEmbedSrc(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== "https:") return undefined;
  const host = parsed.hostname.replace(/^(www\.|m\.)/, "");
  const YT_ID = /^[A-Za-z0-9_-]{11}$/;

  if (host === "youtube.com") {
    // /watch?v=ID · /shorts/ID · /embed/ID
    const id =
      parsed.pathname === "/watch"
        ? parsed.searchParams.get("v")
        : /^\/(shorts|embed)\/[^/]+$/.test(parsed.pathname)
          ? parsed.pathname.split("/")[2]
          : null;
    return id && YT_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;
  }
  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return YT_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
    return /^\d{6,12}$/.test(id) ? `https://player.vimeo.com/video/${id}?dnt=1` : undefined;
  }
  return undefined;
}

/** Adresten Google Haritalar gömme ve yol tarifi bağlantıları (API anahtarı gerekmez) */
export function mapLinks(address: string | null | undefined) {
  const q = address?.trim();
  if (!q) return undefined;
  const encoded = encodeURIComponent(q.slice(0, 300));
  return {
    embed: `https://www.google.com/maps?q=${encoded}&output=embed`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
  };
}
