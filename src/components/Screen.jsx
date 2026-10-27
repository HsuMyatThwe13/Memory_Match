export default function Screen({ bg, className = "", children }) {
  return (
    <main className={`screen ${className}`} style={{ backgroundImage: `url(${bg})` }}>
      {children}
    </main>
  );
}
