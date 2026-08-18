import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Scope = "chat" | "booking" | "admin-login";

type LimitConfig = {
  limit: number;
  windowMs: number;
  upstashWindow: `${number} ${"s" | "m" | "h"}`;
};

const limits: Record<Scope, LimitConfig> = {
  chat: { limit: 15, windowMs: 60_000, upstashWindow: "60 s" },
  booking: { limit: 5, windowMs: 60 * 60_000, upstashWindow: "1 h" },
  "admin-login": { limit: 5, windowMs: 15 * 60_000, upstashWindow: "15 m" },
};

type MemoryStore = Map<string, number[]>;
const globalStore = globalThis as typeof globalThis & { apexRateLimitStore?: MemoryStore };
const memoryStore = globalStore.apexRateLimitStore ?? new Map<string, number[]>();
globalStore.apexRateLimitStore = memoryStore;

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

const distributedLimiters = redis
  ? Object.fromEntries(
      Object.entries(limits).map(([scope, config]) => [
        scope,
        new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(config.limit, config.upstashWindow), prefix: `apex:${scope}` }),
      ]),
    ) as Record<Scope, Ratelimit>
  : null;

function clientIdentifier(request: Request, scope: Scope) {
  const forwarded = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for");
  const address = forwarded?.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return createHash("sha256").update(`${scope}:${address}:${userAgent}`).digest("hex");
}

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

export async function checkRateLimit(request: Request, scope: Scope): Promise<RateLimitResult> {
  const config = limits[scope];
  const identifier = clientIdentifier(request, scope);

  if (distributedLimiters) {
    try {
      const result = await distributedLimiters[scope].limit(identifier);
      return {
        allowed: result.success,
        limit: config.limit,
        remaining: Math.max(0, result.remaining),
        retryAfterSeconds: Math.max(1, Math.ceil((result.reset - Date.now()) / 1_000)),
      };
    } catch {
      // A temporary Redis failure must not take the public site offline; use the local safety net.
    }
  }

  const now = Date.now();
  const key = `${scope}:${identifier}`;
  const requests = (memoryStore.get(key) ?? []).filter((timestamp) => timestamp > now - config.windowMs);
  const allowed = requests.length < config.limit;
  if (allowed) requests.push(now);
  memoryStore.set(key, requests);

  const oldest = requests[0] ?? now;
  return {
    allowed,
    limit: config.limit,
    remaining: Math.max(0, config.limit - requests.length),
    retryAfterSeconds: Math.max(1, Math.ceil((oldest + config.windowMs - now) / 1_000)),
  };
}

export function rateLimitResponse(result: RateLimitResult) {
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}
