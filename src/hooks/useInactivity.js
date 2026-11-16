import { useState, useEffect } from "react";

export default function useInactivity({ enabled, limit, grace, onTimeout }) {
  const [idle, setIdle] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setIdle((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [enabled]);

  useEffect(() => {
    if (enabled && idle >= limit + grace) onTimeout();
  }, [idle]);

  return {
    warning: idle >= limit,
    secondsLeft: Math.max(0, limit + grace - idle),
    touch: () => setIdle(0),
    expire: () => setIdle(limit),
  };
}
