import { Redis } from "@upstash/redis";

// In-memory store: used for local development and tests. Data is lost when the process restarts.
export function memoryStore() {
  const data = new Map();
  return {
    async get(key) {
      return data.has(key) ? structuredClone(data.get(key)) : null;
    },
    async set(key, value) {
      data.set(key, structuredClone(value));
    },
    async setIfAbsent(key, value) {
      if (data.has(key)) return false;
      data.set(key, structuredClone(value));
      return true;
    },
    async increment(key) {
      const next = (Number(data.get(key)) || 0) + 1;
      data.set(key, next);
      return next;
    },
    async expire() {},
    async remove(key) {
      data.delete(key);
    },
  };
}

// Redis store: used on Vercel (Upstash Redis). Reads the URL and token that Vercel adds to the project.
export function redisStore(redis) {
  return {
    get: (key) => redis.get(key),
    set: (key, value) => redis.set(key, value),
    setIfAbsent: async (key, value) => (await redis.set(key, value, { nx: true })) === "OK",
    increment: (key) => redis.incr(key),
    expire: (key, seconds) => redis.expire(key, seconds),
    remove: (key) => redis.del(key),
  };
}

let shared;

export function getStore(env = process.env) {
  if (shared) return shared;
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (url && token) {
    shared = redisStore(new Redis({ url, token }));
  } else if (env.VERCEL) {
    // never fall back to memory in production: accounts would silently vanish
    throw new Error("The database is not set up yet.");
  } else {
    shared = memoryStore();
  }
  return shared;
}
