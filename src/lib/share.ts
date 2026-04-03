const DELIMITER = "\x00";

/**
 * Encodes an array of article titles into a URL-safe string.
 * Uses base64url encoding of a null-byte-delimited title list.
 * Null bytes cannot appear in Wikipedia titles, making this safe.
 */
export function encodeRabbitHole(titles: string[]): string {
  const payload = titles.join(DELIMITER);
  if (typeof window !== "undefined") {
    const bytes = new TextEncoder().encode(payload);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return Buffer.from(payload, "utf-8").toString("base64url");
}

/**
 * Decodes a share ID back into an array of article titles.
 * Supports both new (null-byte) and legacy (pipe) delimiters.
 */
export function decodeRabbitHole(encoded: string): string[] {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    let payload: string;
    if (typeof window !== "undefined") {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      payload = new TextDecoder().decode(bytes);
    } else {
      payload = Buffer.from(base64, "base64").toString("utf-8");
    }
    if (payload.includes(DELIMITER)) {
      return payload.split(DELIMITER).filter(Boolean);
    }
    return payload.split("|").filter(Boolean);
  } catch {
    return [];
  }
}
