import { deflateSync } from "node:zlib";

import { ADMIN_EMAIL, ADMIN_PASSWORD, API_URL } from "./env";

/** Bağımlılıksız, geçerli düz renk PNG üretir */
function makePng(width: number, height: number, [r, g, b]: [number, number, number]) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf: Buffer) => {
    let c = 0xffffffff;
    for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, sum]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit derinliği
  ihdr[9] = 2; // RGB
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: width }, () => [r, g, b]).flat())]);
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Giriş dakikada 5 denemeyle sınırlı: bir kez giriş yap, anahtarı paylaş
let tokenPromise: Promise<string> | undefined;
function getToken() {
  tokenPromise ??= fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  }).then(async (login) => {
    if (!login.ok) throw new Error(`API girişi başarısız (${login.status})`);
    return ((await login.json()) as { accessToken: string }).accessToken;
  });
  return tokenPromise;
}

/** Test hazırlığı için doğrudan API (tarayıcıdan değil) */
export async function adminApi() {
  const accessToken = await getToken();
  const headers = { "content-type": "application/json", Authorization: `Bearer ${accessToken}` };

  const call = async <T = unknown>(path: string, init: RequestInit = {}) => {
    const res = await fetch(`${API_URL}${path}`, { ...init, headers: { ...headers, ...(init.headers ?? {}) } });
    const text = await res.text();
    return { status: res.status, data: (text ? JSON.parse(text) : null) as T };
  };

  return {
    get: <T>(path: string) => call<T>(path),
    post: <T>(path: string, body: unknown) => call<T>(path, { method: "POST", body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) => call<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
    del: (path: string) => call(path, { method: "DELETE" }),
    /** Küçük bir PNG yükler (galeri testi için) */
    async uploadPng(): Promise<string> {
      const png = makePng(32, 32, [52, 104, 114]);
      const form = new FormData();
      form.append("file", new Blob([png], { type: "image/png" }), "e2e.png");
      const res = await fetch(`${API_URL}/admin/media/upload`, { method: "POST", headers: { Authorization: headers.Authorization }, body: form });
      if (!res.ok) throw new Error(`Görsel yüklenemedi (${res.status}): ${await res.text()}`);
      return ((await res.json()) as { url: string }).url;
    },
  };
}
