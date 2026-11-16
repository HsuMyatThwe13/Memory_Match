export default function TestLinks({ links }) {
  return (
    <div className="testlinks">
      {links.map(({ label, onClick }) => (
        <button key={label} className="link testlink" type="button" onClick={onClick}>{label}</button>
      ))}
    </div>
  );
}
