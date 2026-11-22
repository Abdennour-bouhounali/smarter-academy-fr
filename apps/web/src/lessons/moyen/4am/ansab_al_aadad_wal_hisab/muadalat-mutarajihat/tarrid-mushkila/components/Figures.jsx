
/**
 * Les figures des exercices de la leçon (réécrites avec les nombres de la PLATEFORME, rollout 2026-11-11), dessinées en SVG (jamais d'image) : elles
 * portent seulement des lettres latines, x et des mesures — tout texte arabe reste dans l'énoncé. Chaque figure est décrite par l'énoncé qui
 * l'accompagne : elle est donc `aria-hidden`, et sa largeur suit le conteneur.
 */
const Frame = ({ children, viewBox, label }) => (
  <figure className="mx-auto w-full max-w-[22rem]" dir="ltr" data-figure={label} data-paging-keep>
    <svg viewBox={viewBox} width="100%" aria-hidden="true" focusable="false" style={{ display: 'block' }}
      fontFamily="ui-sans-serif, system-ui" fontSize="13">
      {children}
    </svg>
  </figure>
);
const tick = (x1, y1, x2, y2) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#059669" strokeWidth="2" />;

/** Le MODULE 2 : un hexagone régulier de côté x et un carré de côté x + 5 (cm). */
export function HexSquareFigure() {
  const hex = [[70, 20], [130, 20], [160, 72], [130, 124], [70, 124], [40, 72]].map((p) => p.join(' ')).join(' ');
  return (
    <Frame viewBox="0 0 330 150" label="now-49-2">
      <polygon points={hex} fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2.5" />
      <text x="100" y="14" textAnchor="middle" fill="#1D4ED8" fontWeight="bold">x</text>
      <rect x="190" y="22" width="110" height="110" fill="#FEF2F2" stroke="#DC2626" strokeWidth="2.5" />
      <text x="245" y="16" textAnchor="middle" fill="#DC2626" fontWeight="bold">x + 5</text>
      {tick(245, 17, 245, 27)}{tick(100, 15, 100, 25)}
    </Frame>
  );
}

/** تمرين 30 : un rectangle x × 10 cm et un carré de côté x, côte à côte. */
export function RectSquareFigure() {
  return (
    <Frame viewBox="0 0 330 150" label="ex-30">
      <rect x="20" y="30" width="150" height="70" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2.5" />
      <text x="95" y="122" textAnchor="middle" fill="#1D4ED8" fontWeight="bold">x</text>
      <text x="178" y="70" fill="#1D4ED8" fontWeight="bold">10cm</text>
      <rect x="235" y="30" width="70" height="70" fill="#FEF2F2" stroke="#DC2626" strokeWidth="2.5" />
      <text x="270" y="122" textAnchor="middle" fill="#DC2626" fontWeight="bold">x</text>
    </Frame>
  );
}

/** تمرين 33 : le rectangle ABCD, BC = 4 cm, DC = x. */
export function RectangleFigure() {
  return (
    <Frame viewBox="0 0 280 150" label="ex-33">
      <rect x="40" y="25" width="200" height="80" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2.5" />
      <text x="30" y="22" fontWeight="bold">A</text><text x="244" y="22" fontWeight="bold">B</text>
      <text x="244" y="120" fontWeight="bold">C</text><text x="28" y="120" fontWeight="bold">D</text>
      <text x="140" y="125" textAnchor="middle" fill="#1D4ED8" fontWeight="bold">x</text>
      <text x="250" y="70" fill="#1D4ED8" fontWeight="bold">4cm</text>
    </Frame>
  );
}

/** تمرين 39 : ABCD carré de côté 10 cm, EFGH carré inscrit, AH = BE = CF = DG = x. */
export function TiltedSquareFigure() {
  const s = 180; const o = 30; const x = 72;
  const A = [o, o]; const B = [o + s, o]; const C = [o + s, o + s]; const D = [o, o + s];
  const E = [o + s - x, o]; const F = [o + s, o + s - x]; const G = [o + x, o + s]; const H = [o, o + x];
  const P = (p) => p.join(' ');
  return (
    <Frame viewBox="0 0 260 250" label="ex-39">
      <rect x={o} y={o} width={s} height={s} fill="#F8FAFC" stroke="#334155" strokeWidth="2" />
      <polygon points={[E, F, G, H].map(P).join(' ')} fill="#EFF6FF" stroke="#DC2626" strokeWidth="2.5" />
      {[['A', A, -14, -6], ['B', B, 6, -6], ['C', C, 6, 16], ['D', D, -14, 16], ['E', E, -4, -8], ['F', F, 8, 4], ['G', G, -4, 18], ['H', H, -16, 4]].map(([n, p, dx, dy]) => (
        <text key={n} x={p[0] + dx} y={p[1] + dy} fontWeight="bold">{n}</text>
      ))}
      <text x={o - 18} y={o + x / 2 + 4} fill="#1D4ED8" fontWeight="bold">x</text>
      <text x={o + s + 8} y={o + s / 2 + 30} fill="#334155" fontWeight="bold">10cm</text>
    </Frame>
  );
}

/** تمرين 40 : ABCD carré de côté x, BE = 6 cm, GD = 2 cm, AEFG coloré. */
export function ColouredRectFigure() {
  const o = 30; const s = 170; const e = 60; const g = 24;
  return (
    <Frame viewBox="0 0 280 240" label="ex-40">
      <rect x={o} y={o} width={s} height={s} fill="#F8FAFC" stroke="#334155" strokeWidth="2" />
      <rect x={o} y={o} width={s + e} height={s - g} fill="#FECACA" fillOpacity="0.8" stroke="#DC2626" strokeWidth="2.5" />
      <text x={o - 14} y={o - 6} fontWeight="bold">A</text><text x={o + s - 4} y={o - 6} fontWeight="bold">B</text>
      <text x={o + s + e - 4} y={o - 6} fontWeight="bold">E</text><text x={o + s + e + 4} y={o + s - g + 4} fontWeight="bold">F</text>
      <text x={o - 16} y={o + s - g + 4} fontWeight="bold">G</text><text x={o - 14} y={o + s + 14} fontWeight="bold">D</text>
      <text x={o + s + 4} y={o + s + 14} fontWeight="bold">C</text>
      <text x={o + s / 2} y={o - 6} textAnchor="middle" fill="#1D4ED8" fontWeight="bold">x</text>
      <text x={o + s + e / 2} y={o + 16} textAnchor="middle" fill="#0F172A" fontWeight="bold">6cm</text>
      <text x={o + 8} y={o + s - g / 2 + 4} fill="#0F172A" fontWeight="bold">2cm</text>
      <text x={o - 18} y={o + s / 2 + 30} fill="#1D4ED8" fontWeight="bold">x</text>
    </Frame>
  );
}
