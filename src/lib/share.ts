/**
 * Encodes an array of article titles into a URL-safe string.
 * Uses base64url encoding of a pipe-delimited title list.
 */
export function encodeRabbitHole(titles: string[]): string {
  const payload = titles.join("|");
  if (typeof window !== "undefined") {
    return btoa(unescape(encodeURIComponent(payload)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return Buffer.from(payload, "utf-8")
    .toString("base64url");
}

/**
 * Decodes a share ID back into an array of article titles.
 */
export function decodeRabbitHole(encoded: string): string[] {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    let payload: string;
    if (typeof window !== "undefined") {
      payload = decodeURIComponent(escape(atob(base64)));
    } else {
      payload = Buffer.from(base64, "base64").toString("utf-8");
    }
    return payload.split("|").filter(Boolean);
  } catch {
    return [];
  }
}
