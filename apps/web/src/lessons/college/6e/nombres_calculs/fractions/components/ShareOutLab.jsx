import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

/**
 * ShareOutLab — on invite du monde, et les pizzas se recoupent toutes seules.
 *
 * Activity: glisser la piste des convives ; les pizzas se re-découpent
 *   ensemble, et la part d'une personne se re-colorie devant l'élève.
 * Mathematical objective: dans « a ÷ b », c'est b — le nombre de convives —
 *   qui COMMANDE la découpe, et la part obtenue s'écrit a/b. On ne l'apprend
 *   pas en lisant trois dessins côte à côte : on le voit parce qu'une seule
 *   grandeur bouge et que tout le reste suit.
 * Student action: on tire la piste des convives (ou les flèches) ; on peut
 *   aussi tirer la piste des pizzas pour changer ce qu'il y a à partager.
 * Controlled variable: `people` (les convives) et `pies` (ce qu'on partage).
 * Mathematical state: {pies, people}, deux entiers ≥ 1. La découpe de chaque
 *   pizza, la part coloriée, le nombre de parts reçues et l'écriture a/b en
 *   sont DÉRIVÉS — rien n'est écrit en dur, donc la figure ne peut pas mentir.
 * Visual consequence: inviter une personne de plus recoupe TOUTES les pizzas
 *   plus fin d'un coup ; la part de chacun rétrécit, et le nombre de pizzas
 *   sur la table, lui, ne change pas.
 * Expected observation: « le nombre de personnes est celui qui coupe ; c'est
 *   donc lui qui va en bas ».
 * Misconception targeted: écrire b/a — mettre le nombre de convives en haut.
 *   Ici le haut compte des pizzas, le bas compte des convives, et les deux
 *   pistes sont physiquement séparées : on ne peut plus les confondre.
 * Feedback: aucun ici ; le module compare à sa cible et interprète.
 * Formalization: a ÷ b = a/b, nommée APRÈS que le geste l'a rendue évidente.
 * Scaffolding: les deux prises restent vivantes en permanence, y compris
 *   après validation ; le clavier (role="slider", flèches, Début/Fin) atteint
 *   les mêmes états.
 *
 * Inspiré de l'ARCHITECTURE de `nombres-rationnels/components/CommonCutLab.jsx`
 * (3e) — une seule prise re-découpe DEUX figures à la fois, et l'écriture
 * affichée est dérivée de l'état d'origine, jamais recopiée — mais transposée
 * à la 6e : ici on ne cherche pas un dénominateur commun (procédure exclue du
 * programme), on regarde simplement QUI commande la découpe. Aucun négatif,
 * aucune simplification, aucune valeur décimale.
 *
 * §17bis — les nombres vivent dans le DOM sous la figure ; les libellés des
 * pistes sont ancrés à gauche, hors de la course des poignées.
 */

const W = 620;
const PAD = 28;
const TOP = 10;
const PIE_R = 46;
const LANE = 60;

/** Les parts d'une pizza coupée en `n` : chemins de secteurs égaux. */
function wedge(cx, cy, r, i, n) {
  const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}

export default function ShareOutLab({
  pies,
  people,
  onPies,
  onPeople,
  minPies = 1,
  maxPies = 4,
  minPeople = 2,
  maxPeople = 8,
  lockPies = false,
  caption = null,
}) {
  const svgRef = useRef(null);
  const [scale, setScale] = useState(1);

  // La taille tactile se MESURE : à 375 px la figure est rendue ~0,55×, donc
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

  const innerW = W - 2 * PAD;
  const pieRow = TOP + PIE_R + 6;
  const lanePeopleY = TOP + 2 * PIE_R + 30;
  const laneY2 = lanePeopleY + LANE;
  const H = (lockPies ? lanePeopleY : laneY2) + LANE + 6;

  // Le curseur d'une piste a un rayon de 11 : sa piste est rentrée d'autant,
  // sinon il déborderait du cadre aux deux extrémités (§17bis).
  const RAIL_R = 12;
  const railX = PAD + RAIL_R;
  const railW = innerW - 2 * RAIL_R;

  const xFromClient = useCallback((clientX) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return null;
    return ((clientX - r.left) / r.width) * W;
  }, []);

  const dragging = useRef(null);

  const peopleAt = useCallback((x) => {
    const ratio = Math.max(0, Math.min(1, (x - railX) / railW));
    const n = minPeople + Math.round(ratio * (maxPeople - minPeople));
    if (n === people) return;
    onPeople?.(n);
  }, [minPeople, maxPeople, people, onPeople, railX, railW]);

  const piesAt = useCallback((x) => {
    const ratio = Math.max(0, Math.min(1, (x - railX) / railW));
    const n = minPies + Math.round(ratio * (maxPies - minPies));
    if (n === pies) return;
    onPies?.(n);
  }, [minPies, maxPies, pies, onPies, railX, railW]);

  const down = (mode) => (e) => {
    dragging.current = mode;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* déjà relâché */ }
    const x = xFromClient(e.clientX);
    if (x != null) (mode === 'pies' ? piesAt : peopleAt)(x);
  };
  const move = (e) => {
    if (!dragging.current) return;
    const x = xFromClient(e.clientX);
    if (x != null) (dragging.current === 'pies' ? piesAt : peopleAt)(x);
  };
  const up = (e) => {
    if (!dragging.current) return;
    dragging.current = null;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* idem */ }
  };

  const keyFor = (cur, lo, hi, set) => (e) => {
    const at = (n) => set?.(Math.max(lo, Math.min(hi, n)));
    const m = {
      ArrowRight: () => at(cur + 1), ArrowUp: () => at(cur + 1),
      ArrowLeft: () => at(cur - 1), ArrowDown: () => at(cur - 1),
      Home: () => at(lo), End: () => at(hi),
    };
    if (m[e.key]) { e.preventDefault(); m[e.key](); }
  };

  // Les pizzas : centrées, écartées régulièrement, jamais hors du cadre.
  const gap = Math.min(2 * PIE_R + 22, innerW / Math.max(1, pies));
  const spanW = (pies - 1) * gap;
  const pieX = (i) => W / 2 - spanW / 2 + i * gap;

  const railPos = (v, lo, hi) => railX + (hi > lo ? ((v - lo) / (hi - lo)) * railW : railW / 2);

  return (
    <div
      className="space-y-3"
      role="group"
      aria-label="Partage de pizzas entre convives"
      data-so-pies={pies}
      data-so-people={people}
    >
      <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block select-none"
          style={{ touchAction: 'none' }}
          role="group"
          aria-label={`${pies} pizza${pies > 1 ? 's' : ''} partagée${pies > 1 ? 's' : ''} entre ${people} personnes : chacun reçoit ${pies} part${pies > 1 ? 's' : ''} de un ${people}ème`}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          {/* ── Les pizzas : le nombre de convives commande la découpe ── */}
          <g pointerEvents="none">
            {Array.from({ length: pies }, (_, p) => {
              const cx = pieX(p);
              return (
                <g key={p}>
                  <circle cx={cx} cy={pieRow} r={PIE_R + 3} fill="#fde68a" stroke="#d97706" strokeWidth="2.5" />
                  {Array.from({ length: people }, (_, i) => (
                    <path
                      key={i}
                      d={wedge(cx, pieRow, PIE_R, i, people)}
                      // Une seule part par pizza est celle de « ma » personne :
                      // c'est ce qui rend visible que j'en reçois `pies` en tout.
                      fill={i === 0 ? '#fb7185' : '#fff7ed'}
                      stroke="#d97706"
                      strokeWidth="2"
                    />
                  ))}
                </g>
              );
            })}
          </g>

          {/* ── PRISE 1 : les convives ──────────────────────────────────
              Peinte APRÈS le décor pour recevoir le pointeur (§25 : un décor
              posé au-dessus de la zone tactile avale le geste). */}
          <text
            x={PAD} y={lanePeopleY + 12}
            fontSize="12" fill="#4338ca" fontFamily="ui-monospace, monospace" fontWeight="700"
          >
            combien de personnes à table
          </text>
          <rect
            x={PAD} y={lanePeopleY + 17} width={innerW} height={grip}
            fill="transparent" cursor="ew-resize"
            role="slider" tabIndex={0}
            aria-label={`Personnes à table : glisse pour inviter plus ou moins de monde. Actuellement ${people}.`}
            aria-valuenow={people} aria-valuemin={minPeople} aria-valuemax={maxPeople}
            aria-valuetext={`${people} personnes — chacun reçoit ${pies} sur ${people} de pizza`}
            onPointerDown={down('people')}
            onKeyDown={keyFor(people, minPeople, maxPeople, onPeople)}
            style={{ touchAction: 'none' }}
          />
          <g pointerEvents="none">
            <rect
              x={railX} y={lanePeopleY + 17 + grip / 2 - 5} width={railW} height={10}
              rx="5" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1.5"
            />
            <circle
              cx={railPos(people, minPeople, maxPeople)} cy={lanePeopleY + 17 + grip / 2}
              r="11" fill="#4338ca" stroke="#fff" strokeWidth="3"
            />
          </g>

          {/* ── PRISE 2 : ce qu'on partage ─────────────────────────────── */}
          {!lockPies && (
            <>
              <text
                x={PAD} y={laneY2 + 12}
                fontSize="12" fill="#b45309" fontFamily="ui-monospace, monospace" fontWeight="700"
              >
                combien de pizzas à partager
              </text>
              <rect
                x={PAD} y={laneY2 + 17} width={innerW} height={grip}
                fill="transparent" cursor="ew-resize"
                role="slider" tabIndex={0}
                aria-label={`Pizzas à partager : glisse pour en mettre plus ou moins sur la table. Actuellement ${pies}.`}
                aria-valuenow={pies} aria-valuemin={minPies} aria-valuemax={maxPies}
                aria-valuetext={`${pies} pizza${pies > 1 ? 's' : ''} à partager`}
                onPointerDown={down('pies')}
                onKeyDown={keyFor(pies, minPies, maxPies, onPies)}
                style={{ touchAction: 'none' }}
              />
              <g pointerEvents="none">
                <rect
                  x={railX} y={laneY2 + 17 + grip / 2 - 5} width={railW} height={10}
                  rx="5" fill="#fde68a" stroke="#d97706" strokeWidth="1.5"
                />
                <circle
                  cx={railPos(pies, minPies, maxPies)} cy={laneY2 + 17 + grip / 2}
                  r="11" fill="#b45309" stroke="#fff" strokeWidth="3"
                />
              </g>
            </>
          )}
        </svg>
      </div>

      {/* Lecture chiffrée — dans le DOM, à l'abri de toute collision. */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 py-2">
          <div className="font-mono font-black text-xl text-amber-800 tabular-nums">{pies}</div>
          <div className="text-xs text-amber-700">pizza{pies > 1 ? 's' : ''} à partager</div>
        </div>
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 py-2">
          <div className="font-mono font-black text-xl text-indigo-800 tabular-nums">{people}</div>
          <div className="text-xs text-indigo-700">personnes à table</div>
        </div>
        <div className="rounded-xl border-2 border-slate-300 bg-slate-900 py-2" role="status" aria-live="polite">
          <div className="font-mono font-black text-xl text-rose-300 tabular-nums">{pies}/{people}</div>
          <div className="text-xs text-slate-300">de pizza chacun</div>
        </div>
      </div>

      {caption && <p className="text-center text-xs text-slate-500">{caption}</p>}
      <p className="sr-only">
        {`${pies} pizza${pies > 1 ? 's' : ''} partagée${pies > 1 ? 's' : ''} entre ${people} personnes : chaque pizza est coupée en ${people} parts égales, et chacun repart avec ${pies} de ces parts, soit ${pies} sur ${people} de pizza.`}
      </p>
    </div>
  );
}
