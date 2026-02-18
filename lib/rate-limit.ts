type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

function now() {
  return Date.now();
}

function buildKey(scope: string, key: string) {
  return `${scope}:${key}`;
}

export function checkRateLimit(scope: string, key: string, options: RateLimitOptions): RateLimitResult {
  const current = now();
  const storageKey = buildKey(scope, key);
  const existing = store.get(storageKey);

  if (!existing || current >= existing.resetAt) {
    const resetAt = current + options.windowMs;
    store.set(storageKey, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: Math.max(options.limit - 1, 0),
      retryAfterMs: 0,
    };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(existing.resetAt - current, 0),
    };
  }

  existing.count += 1;
  store.set(storageKey, existing);

  return {
    allowed: true,
    remaining: Math.max(options.limit - existing.count, 0),
    retryAfterMs: 0,
  };
}

export function getClientIpFromHeaders(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

