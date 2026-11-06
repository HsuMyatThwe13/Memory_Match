const ICONS = {
  peek: (
    <>
      <path d="M4 32C12 18 22 12 32 12s20 6 28 20C52 46 42 52 32 52S12 46 4 32Z" fill="#fff" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="10" fill="currentColor" />
      <circle cx="35" cy="29" r="3" fill="#fff" />
    </>
  ),
  autoMatch: (
    <>
      <rect x="6" y="14" width="26" height="34" rx="4" fill="#fff" stroke="currentColor" strokeWidth="4" transform="rotate(-10 19 31)" />
      <rect x="32" y="16" width="26" height="34" rx="4" fill="#fff" stroke="currentColor" strokeWidth="4" transform="rotate(10 45 33)" />
      <path d="M24 34l6 6 11-14" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  freeze: (
    <>
      <path d="M32 6v52M9.5 19l45 26M9.5 45l45-26M25 13l7-7 7 7M25 51l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="7" fill="#fff" stroke="currentColor" strokeWidth="4" />
    </>
  ),
};

export default function PowerIcon({ id, size = 48 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      {ICONS[id]}
    </svg>
  );
}
