import "server-only";

export type Features = { commerce: boolean };

const OFF: Features = { commerce: false };

/**
 * API'de hangi modüllerin açık olduğu (COMMERCE_ENABLED vb.).
 * Kapalı modülün ekranları admin'de gösterilmez.
 */
export async function getFeatures(): Promise<Features> {
  const apiUrl = process.env.API_URL?.replace(/\/$/, "");
  if (!apiUrl) return OFF;
  try {
    const response = await fetch(`${apiUrl}/features`, {
      next: { revalidate: 30 },
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return OFF;
    const data = (await response.json()) as Partial<Features>;
    return { commerce: data.commerce === true };
  } catch {
    return OFF;
  }
}
