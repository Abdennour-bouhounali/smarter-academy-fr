import React from 'react';
import * as L from '../../logic/sizeLadder';

/**
 * Le dessin de « سلّم الأحجام » (size-ladder) : le mur peint du couloir de la foire des sciences, le slide de barreaux de bois (un par décade 10ⁿ → 10ⁿ⁺¹), neuf cases entre les
 * graduations 1 … 10 placées LOGARITHMIQUEMENT, la carte-étiquette et son aiguille. Tout est du DOM stylé (CLAUDE.md « Images »), l'arabe est du texte vivant ; chaque rangée est un îlot LTR
 * (les petits nombres à gauche, comme une règle).
 */
export const ROW = 66;
export const ZONE = 36;
const BOARD = 30;

export const CSS = `
@keyframes slShakeA { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 40% { transform: translateX(6px) } 60% { transform: translateX(-4px) } 80% { transform: translateX(3px) } }
@keyframes slShakeB { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 40% { transform: translateX(6px) } 60% { transform: translateX(-4px) } 80% { transform: translateX(3px) } }
@keyframes slPulse { 0%,100% { opacity: .45 } 50% { opacity: 1 } }
@keyframes slPop { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
.sl-shake-a { animation: slShakeA .45s ease-in-out both }
.sl-shake-b { animation: slShakeB .45s ease-in-out both }
.sl-pulse { animation: slPulse 1.3s ease-in-out infinite }
.sl-pop { animation: slPop .35s ease-out both }
.sl-rows { transition: transform .28s ease-out }
.sl-card { transition: left .22s ease-out }
@media (prefers-reduced-motion: reduce) { .sl-shake-a, .sl-shake-b, .sl-pulse, .sl-pop { animation: none !important } .sl-rows, .sl-card { transition: none !important } }
`;

const NBSP = ' ';
/** 10ⁿ avec un vrai exposant (les chiffres en exposant Unicode manquent dans la police : « ⁴ » devenait une tache). */
const Pow = ({ n }) => <>10<sup className="text-[0.72em] font-black leading-none" style={{ verticalAlign: '0.5em' }}>{String(n).replace('-', '−')}</sup></>;
/** « 1 950 000 » → groupes insécables ; « 0,048 × 10^-3 » → 0,048 × 10⁻³ (vrai exposant). */
export function Given({ given }) {
  const m = /^(.*?)\s*×\s*10\^(-?\d+)$/.exec(String(given));
  const num = (t) => t.replace(/(\d) (?=\d{3}(?:\D|$))/g, `$1${NBSP}`);
  return m ? <>{num(m[1])} × <Pow n={m[2]} /></> : <>{num(String(given))}</>;
}
/** « 2,65 × 10² » */
export const SciNode = ({ a, n }) => <>{String(a).replace('-', '−')} × <Pow n={n} /></>;
/** a × 10ⁿ (LaTeX) pour une phrase. */
export const sciTexOf = (a, n) => `${String(a).replace('-', '−').replace(',', '{,}')}\\times10^{${n}}`;

/** Une rangée : barreau de bois, deux bouts étiquetés (10ⁿ et 10ⁿ⁺¹), neuf cases, les demi-graduations en filet. */
export function Rung({ n, active, unit, showNums, hoverCell, goodCell, refused, children, cardLayer }) {
  const marks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return (
    <div data-sl-rung={n} data-active={active ? 'true' : 'false'} className="relative" style={{ height: ROW }}>
      <div className={`absolute inset-x-0 top-0 rounded-lg ${active ? 'bg-amber-100/80' : ''}`} style={{ height: ROW - 2 }} aria-hidden="true" />
      <div dir="ltr" className="relative flex items-start justify-between px-1" style={{ height: ZONE }}>
        <span className="pt-0.5 text-[11px] font-black text-amber-950 tabular-nums" data-sl-end="lo"><bdi dir="ltr"><Pow n={n} /><span className="ms-1.5">{unit}</span></bdi></span>
        <span className="pt-0.5 text-[11px] font-black text-amber-950 tabular-nums" data-sl-end="hi"><bdi dir="ltr"><Pow n={n + 1} /><span className="ms-1.5">{unit}</span></bdi></span>
      </div>
      <div className="relative mx-1" dir="ltr" style={{ height: BOARD }} data-sl-board={n} {...(active ? { 'data-sl-board-active': true } : {})}>
        <div className="absolute inset-0 rounded-md border-2 border-amber-800" style={{ background: 'linear-gradient(#EBC983,#D9A857)' }} aria-hidden="true" />
        {L.CELLS.map((c) => {
          const lo = L.markFrac(c); const hi = L.markFrac(c + 1);
          const lit = hoverCell === c; const good = goodCell === c;
          return (
            <div key={c} data-sl-cell={`${n}:${c}`} data-lit={lit ? 'true' : 'false'} className="absolute inset-y-0"
              style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%`, background: good ? 'rgba(16,185,129,.45)' : lit ? (refused ? 'rgba(244,63,94,.35)' : 'rgba(255,255,255,.55)') : 'transparent' }} aria-hidden="true" />
          );
        })}
        {L.CELLS.map((c) => (
          <div key={`h${c}`} className="absolute" style={{ left: `${Math.log10(c + 0.5) * 100}%`, top: 8, bottom: 2, borderLeft: '1px dashed rgba(120,53,15,.35)' }} aria-hidden="true" />
        ))}
        {marks.map((k) => (
          <React.Fragment key={k}>
            <div className="absolute" style={{ left: `${L.markFrac(k) * 100}%`, top: 0, bottom: 0, width: 0, borderLeft: `${k === 1 || k === 10 ? 3 : 2}px solid #78350F` }} aria-hidden="true" />
            {showNums && k < 10 && <span className="absolute text-[9px] font-black leading-none text-amber-950 tabular-nums" style={{ left: `${L.markFrac(k) * 100}%`, bottom: 1, marginLeft: 2 }} aria-hidden="true">{k}</span>}
          </React.Fragment>
        ))}
        {children}
      </div>
      {cardLayer}
    </div>
  );
}
