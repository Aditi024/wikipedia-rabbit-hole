const windowMs = 60_000;
const maxRequests = 30;

const clients = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of clients) {
    if (val.resetAt <= now) clients.delete(key);
  }
}, 60_000);

export function checkRateLimit(ip: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = clients.get(ip);

  if (!entry || entry.resetAt <= now) {
    clients.set(ip, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1 };
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    return { ok: false, remaining: 0 };
  }
  return { ok: true, remaining: maxRequests - entry.count };
}
