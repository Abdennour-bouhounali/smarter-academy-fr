/** « −1 ❤️ » : ce que coûte un geste, toujours lu de gauche à droite, même en RTL. */
export default function CostBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-slate-950/15 px-2 py-0.5 font-inter text-sm font-bold ${className}`} dir="ltr" style={{ unicodeBidi: 'isolate' }}>
      <span>−1</span>
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.4C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.6.8-1.4 2.3-2.6 4.4-2.6 3.6 0 5.7 3.7 4.2 7.1C19.5 16.4 12 21 12 21z" fill="#e11d48" /></svg>
    </span>
  );
}
