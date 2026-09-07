import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

/**
 * FractionBar — la barre unité qu'on DÉCOUPE et dont on PREND des parts, au
 * doigt.
 *
 * Activity: attraper le peigne (toute la barre) pour changer le nombre de
 *   parts, ou le bord colorié pour changer le nombre de parts prises.
 * Mathematical objective: les deux nombres d'une fraction commandent deux
 *   choses différentes — le bas DÉCOUPE, le haut PREND. Ce sont donc deux
 *   prises distinctes, pas deux cases d'un formulaire.
 * Student action: on glisse sur la figure elle-même ; les traits de coupe
 *   apparaissent ou disparaissent sous le doigt, la zone coloriée s'étend ou
 *   se rétracte, sans clic de validation.
 * Controlled variable: `den` par le peigne, `num` par le bord.
 * Mathematical state: {num, den}, avec 0 ≤ num ≤ den (6e : ni négatif, ni
 *   fraction impropre par défaut — `maxNum` ouvre l'improper quand la leçon
 *   en a besoin). Traits, longueur coloriée, compteur et écriture en dérivent.
 * Visual consequence: couper plus fin RÉTRÉCIT chaque part sans que la barre
 *   change de taille ; prendre une part de plus allonge la zone coloriée.
 * Expected observation: quand on coupe plus fin sans changer le nombre de
 *   parts prises, on a MOINS de tablette — le nombre du bas ne se lit pas
 *   comme le nombre du haut.
 * Misconception targeted: « 1/8 est plus grand que 1/4 parce que 8 > 4 ».
 * Feedback: aucun ici ; le module compare à sa cible et interprète.
 * Formalization: les mots « numérateur » et « dénominateur » n'apparaissent
 *   pas dans ce composant — ils sont posés au module 3.
 * Scaffolding: les deux prises restent vivantes en permanence ; le clavier
 *   (role="slider", flèches, Début/Fin) atteint les mêmes états.
 * Transfer: la même barre sert à construire (M2), à comparer (M4) et à
 *   retrouver 1/2 = 2/4 en re-découpant.
 *
 * Inspiré de la QUALITÉ de `nombres-rationnels/components/RationalBar.jsx`
 * (3e) — deux prises, l'une change l'écriture, l'autre change le nombre —
 * mais adapté à la 6e : pas de négatifs, pas de simplification, pas de droite
 * graduée, et un vocabulaire qui reste celui du partage.
 *
 * §17bis — la barre a une largeur fixe ; les traits de coupe sont bornés par
 * `maxDen`, et les nombres vivent dans le DOM sous la figure.
 */

const W = 620;
const BAR_Y = 26;
const BAR_H = 74;
const PAD = 30;
const LANE = 66;          // couloir de découpe, sous la barre (sans bande morte)

export default function FractionBar({
  num,
  den,
  onNum,
  onDen,
  denOptions = [2, 3, 4, 5, 6, 8, 10, 12],
  maxNum = null,          // par défaut : on ne dépasse pas l'unité (6e)
  tone = 'amber',
  showWriting = true,
  caption = null,
}) {
  const svgRef = useRef(null);
  const [scale, setScale] = useState(1);

  // La taille tactile se MESURE : à 375 px la barre est rendue ~0,55×, donc
  // une prise de 24 unités SVG ne ferait que 13 px réels (§6ter.5).
  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0) setScale(W / r.width);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  // 45 et non 44 : la conversion viewBox → pixels perd une fraction (43,99 px
  // mesuré dans nombres-rationnels), et « presque atteint » n'est pas atteint.
  const grip = Math.max(26, 45 * scale);

  const H = BAR_Y + BAR_H + LANE + 16;
  const innerW = W - 2 * PAD;
  const laneY = BAR_Y + BAR_H + 14;
  // Le curseur du couloir a un rayon de 10 : sa piste est rentrée d'autant,
  // sinon il déborderait du cadre aux deux extrémités (§17bis).
  const LANE_R = 11;
  const laneX = PAD + LANE_R;
  const laneW = innerW - 2 * LANE_R;

  const topNum = maxNum ?? den;
  const partW = innerW / den;
  const endX = PAD + num * partW;

  const xFromClient = useCallback((clientX) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return null;
    return ((clientX - r.left) / r.width) * W;
  }, []);

  const dragging = useRef(null);

  /** Le BORD colorié : combien de parts on prend. */
  const takeAt = useCallback((x) => {
    const n = Math.round((x - PAD) / (innerW / den));
    const clamped = Math.max(0, Math.min(topNum, n));
    if (clamped !== num) onNum?.(clamped);
  }, [den, num, topNum, onNum, innerW]);

  /** Le PEIGNE : en combien de parts on coupe l'unité. */
  const cutAt = useCallback((x) => {
    const t = Math.max(0, Math.min(1, (x - laneX) / laneW));
    const d = denOptions[Math.min(denOptions.length - 1, Math.round(t * (denOptions.length - 1)))];
    if (d === den) return;
    onDen?.(d);
  }, [den, denOptions, onDen, laneX, laneW]);

  const down = (mode) => (e) => {
    dragging.current = mode;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* déjà relâché */ }
    const x = xFromClient(e.clientX);
    if (x != null) (mode === 'cut' ? cutAt : takeAt)(x);
  };
  const move = (e) => {
    if (!dragging.current) return;
    const x = xFromClient(e.clientX);
    if (x != null) (dragging.current === 'cut' ? cutAt : takeAt)(x);
  };
  const up = (e) => {
    if (!dragging.current) return;
    dragging.current = null;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* idem */ }
  };

  /* Clavier — l'alternative obligatoire au glisser (§27). */
  const takeKey = (e) => {
    const at = (n) => onNum?.(Math.max(0, Math.min(topNum, n)));
    const m = {
      ArrowRight: () => at(num + 1), ArrowUp: () => at(num + 1),
      ArrowLeft: () => at(num - 1), ArrowDown: () => at(num - 1),
      Home: () => at(0), End: () => at(topNum),
    };
    if (m[e.key]) { e.preventDefault(); m[e.key](); }
  };
  const cutKey = (e) => {
    const i = denOptions.indexOf(den);
    const at = (j) => onDen?.(denOptions[Math.max(0, Math.min(denOptions.length - 1, j))]);
    const m = {
      ArrowRight: () => at(i + 1), ArrowUp: () => at(i + 1),
      ArrowLeft: () => at(i - 1), ArrowDown: () => at(i - 1),
      Home: () => at(0), End: () => at(denOptions.length - 1),
    };
    if (m[e.key]) { e.preventDefault(); m[e.key](); }
  };

  const TONE = {
    amber: { fill: '#f59e0b', soft: '#fffbeb', edge: '#b45309' },
    emerald: { fill: '#10b981', soft: '#ecfdf5', edge: '#047857' },
    sky: { fill: '#0ea5e9', soft: '#f0f9ff', edge: '#0369a1' },
    violet: { fill: '#8b5cf6', soft: '#f5f3ff', edge: '#6d28d9' },
  };
  const t = TONE[tone] || TONE.amber;

  const cuts = [];
  for (let i = 1; i < den; i += 1) cuts.push(PAD + i * partW);

  return (
    <div
      className="space-y-3"
      role="group"
      aria-label="Barre à découper"
      data-fb-num={num}
      data-fb-den={den}
    >
      <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block select-none"
          style={{ touchAction: 'none' }}
          role="group"
          aria-label={`Unité coupée en ${den} parts, ${num} prise${num > 1 ? 's' : ''}`}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          {/* L'unité — sa largeur ne change JAMAIS. C'est l'invariant. */}
          <g pointerEvents="none">
            <rect x={PAD} y={BAR_Y} width={innerW} height={BAR_H} fill={t.soft} stroke="#cbd5e1" strokeWidth="2.5" rx="8" />
            {/* la longueur prise */}
            <rect x={PAD} y={BAR_Y + 3} width={Math.max(0, endX - PAD)} height={BAR_H - 6} fill={t.fill} opacity="0.85" rx="5" />
            {/* les traits de coupe */}
            {cuts.map((cx) => (
              <line key={cx} x1={cx} y1={BAR_Y + 3} x2={cx} y2={BAR_Y + BAR_H - 3} stroke="#fff" strokeWidth="2.5" />
            ))}
            <rect x={PAD} y={BAR_Y} width={innerW} height={BAR_H} fill="none" stroke="#94a3b8" strokeWidth="2.5" rx="8" />
          </g>

          {/* ── LA PRISE « prendre des parts » : le bord colorié ────────
              Peinte APRÈS le décor pour recevoir le pointeur (§25 : un décor
              posé au-dessus de la zone tactile avale le geste). */}
          <rect
            x={endX - grip / 2}
            y={BAR_Y - 6}
            width={grip}
            height={BAR_H + 12}
            fill="transparent"
            cursor="ew-resize"
            role="slider"
            tabIndex={0}
            aria-label={`Parts prises : glisse le bord colorié. Actuellement ${num} sur ${den}.`}
            aria-valuenow={num}
            aria-valuemin={0}
            aria-valuemax={topNum}
            aria-valuetext={`${num} part${num > 1 ? 's' : ''} sur ${den}`}
            onPointerDown={down('take')}
            onKeyDown={takeKey}
            style={{ touchAction: 'none' }}
          />
          <g pointerEvents="none">
            <line x1={endX} y1={BAR_Y - 6} x2={endX} y2={BAR_Y + BAR_H + 6} stroke={t.edge} strokeWidth="4" />
            <circle cx={endX} cy={BAR_Y + BAR_H / 2} r="10" fill={t.edge} stroke="#fff" strokeWidth="3" />
            <circle cx={endX} cy={BAR_Y + BAR_H / 2} r="3" fill="#fff" />
          </g>

          {/* ── LA PRISE « découper » : un couloir séparé sous la barre ──
              Un couloir plutôt que la barre entière : les deux prises se
              recouvriraient sur la figure, et à 375 px deux zones de 44 px ne
              peuvent pas cohabiter sur une barre de 200 px. */}
          <text x={PAD} y={laneY + grip / 2 - 12} fontSize="12" fill="#4338ca" fontFamily="ui-monospace, monospace" fontWeight="700">
            découper l’unité
          </text>
          <rect
            x={PAD} y={laneY} width={innerW} height={grip}
            fill="transparent"
            cursor="ew-resize"
            role="slider"
            tabIndex={0}
            aria-label={`Découpe de l’unité : glisse pour couper en plus ou moins de parts. Actuellement ${den} parts.`}
            aria-valuenow={den}
            aria-valuemin={denOptions[0]}
            aria-valuemax={denOptions[denOptions.length - 1]}
            aria-valuetext={`${den} parts égales`}
            onPointerDown={down('cut')}
            onKeyDown={cutKey}
            style={{ touchAction: 'none' }}
          />
          <g pointerEvents="none">
            <rect x={laneX} y={laneY + grip / 2 - 5} width={laneW} height={10} rx="5" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1.5" />
            {denOptions.map((d, i) => (
              <circle
                key={d}
                cx={laneX + (denOptions.length > 1 ? (i / (denOptions.length - 1)) * laneW : laneW / 2)}
                cy={laneY + grip / 2}
                r={d === den ? 0 : 3}
                fill="#a5b4fc"
              />
            ))}
            <circle
              cx={laneX + (denOptions.length > 1 ? (Math.max(0, denOptions.indexOf(den)) / (denOptions.length - 1)) * laneW : laneW / 2)}
              cy={laneY + grip / 2}
              r="10" fill="#4338ca" stroke="#fff" strokeWidth="3"
            />
          </g>
        </svg>
      </div>

      {/* Lecture chiffrée — dans le DOM, à l'abri de toute collision. */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 py-2">
          <div className="font-mono font-black text-xl text-amber-800 tabular-nums">{num}</div>
          <div className="text-xs text-amber-700">part{num > 1 ? 's' : ''} prise{num > 1 ? 's' : ''}</div>
        </div>
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 py-2">
          <div className="font-mono font-black text-xl text-indigo-800 tabular-nums">{den}</div>
          <div className="text-xs text-indigo-700">parts égales</div>
        </div>
        {showWriting ? (
          <div className="rounded-xl border-2 border-slate-300 bg-slate-900 py-2" role="status" aria-live="polite">
            <div className="font-mono font-black text-xl text-amber-300 tabular-nums">{num}/{den}</div>
            <div className="text-xs text-slate-300">ce que tu as pris</div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 py-2" role="status" aria-live="polite">
            <div className="font-mono font-black text-xl text-slate-700 tabular-nums">{num} sur {den}</div>
            <div className="text-xs text-slate-500">ce que tu as pris</div>
          </div>
        )}
      </div>

      {caption && <p className="text-center text-xs text-slate-500">{caption}</p>}
    </div>
  );
}
