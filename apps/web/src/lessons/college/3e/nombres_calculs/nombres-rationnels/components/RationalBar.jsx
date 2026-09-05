import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { formatDec, formatFrac, normalize, plainFrac, toDecimal } from './rationalUtils';

/**
 * RationalBar — LA manipulation signature de « Nombres rationnels ».
 *
 * Activity: re-découper une barre unité en plus (ou moins) de parts, sans
 *   jamais changer la LONGUEUR coloriée.
 * Mathematical objective: voir qu'un rationnel est un POINT, et que 3/4, 6/8,
 *   0,75 ne sont que des façons différentes de découper le chemin qui y mène.
 * Student action: taper une puce « ×2 », « ×3 » (couper chaque part en deux
 *   ou trois) ou « ÷k » (regrouper k parts en une), ou « Recommencer ».
 * Controlled variable: le facteur de découpe — le dénominateur affiché.
 * Mathematical state: UN seul rationnel `{num, den}`, invariant `den > 0`.
 *   Les traits de coupe, la longueur coloriée, le marqueur sur la droite et
 *   la valeur décimale en sont TOUS dérivés.
 * Visual consequence: les traits de coupe se multiplient ou disparaissent ;
 *   le bord droit de la zone coloriée et le marqueur ne bougent pas d'un pixel.
 * Expected observation: « les nombres changent, le point reste ».
 * Misconception targeted: « 6/8 est plus grand que 3/4 parce que 6 > 3 » et
 *   « −3/4 et 3/(−4) sont deux nombres différents ».
 * Feedback: le module compare l'écriture courante à la cible et quantifie
 *   l'écart en nombre de parts ; le composant n'en rend aucun.
 * Formalization: équivalence = même point, obtenue en multipliant (ou
 *   divisant) numérateur ET dénominateur par le même entier.
 * Scaffolding: chaque puce est un bouton ≥ 44 px, désactivée quand la coupe
 *   est impossible (÷3 sur des quarts), avec la raison en aria-label.
 * Transfer: deux barres empilées (`second`) servent à l'addition ; la même
 *   barre figée sert de synthèse dans le boss.
 *
 * Composant CONTRÔLÉ : `value` appartient au module, `onValue` remonte la
 * nouvelle écriture. `frozen` rend la barre non interactive (synthèse).
 *
 * Négatifs : la barre est dessinée à GAUCHE de 0 lorsque num < 0 — un seul
 * point, quelle que soit l'écriture (l'invariant `den > 0` normalise tout).
 *
 * @param {{num:number, den:number}} value    l'écriture courante
 * @param {(v:{num:number,den:number})=>void} [onValue]
 * @param {{num:number, den:number}} [second] deuxième barre empilée (addition)
 * @param {(v:{num:number,den:number})=>void} [onSecond]
 * @param {number[]} [multiplyChips=[2,3]]    facteurs de re-découpe proposés
 * @param {boolean} [showDecimal=false]       affiche la valeur décimale
 * @param {boolean} [showLine=true]           affiche le miroir droite graduée
 * @param {boolean} [frozen=false]
 * @param {boolean} [compact=false]   masque la lecture chiffrée (synthèse)
 * @param {string}  [caption]
 */
const W = 660;
const PAD = 34;
const BAR_H = 46;
const MAX_CUTS = 24; // au-delà, les traits deviennent illisibles (playbook §10.7)

export default function RationalBar({
  value,
  onValue,
  second = null,
  onSecond = null,
  multiplyChips = [2, 3],
  showDecimal = false,
  showLine = true,
  frozen = false,
  compact = false,
  caption,
  min = -1,
  max = 2,
}) {
  const v = normalize(value);
  const w = second ? normalize(second) : null;

  const rowH = BAR_H + 30;
  const lineH = showLine ? 62 : 0;
  const H = rowH * (w ? 2 : 1) + lineH + 14;

  const span = max - min;
  const toX = (t) => PAD + ((t - min) / span) * (W - 2 * PAD);
  const zeroX = toX(0);

  return (
    <div className="space-y-3" role="group" aria-label="Barre des rationnels">
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white flex justify-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto min-w-[320px] max-w-[660px] mx-auto block select-none"
          role={frozen ? 'img' : 'group'}
          aria-label={
            w
              ? `Deux barres : ${plainFrac(v)} et ${plainFrac(w)}`
              : `Barre représentant ${plainFrac(v)}`
          }
          style={{ touchAction: 'manipulation' }}
        >
          <g pointerEvents="none">
            <Bar r={v} y={8} toX={toX} zeroX={zeroX} tone="indigo" />
            {w && <Bar r={w} y={8 + rowH} toX={toX} zeroX={zeroX} tone="violet" />}

            {showLine && (
              <Mirror
                y={8 + rowH * (w ? 2 : 1) + 12}
                toX={toX}
                min={min}
                max={max}
                marks={w ? [{ r: v, tone: '#4338ca' }, { r: w, tone: '#7c3aed' }] : [{ r: v, tone: '#4338ca' }]}
              />
            )}
          </g>
        </svg>
      </div>

      {/* ── Lecture chiffrée — dérivée de l'état, jamais recopiée ─────── */}
      {!compact && (
        <div className={`grid gap-2 ${w ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <Readout r={v} tone="indigo" showDecimal={showDecimal} />
          {w && <Readout r={w} tone="violet" showDecimal={showDecimal} />}
        </div>
      )}

      {/* ── Puces de re-découpe (tap-first) ──────────────────────────── */}
      {!frozen && onValue && (
        <ChipRow
          label={w ? 'Barre 1' : 'Re-découper'}
          r={v}
          onValue={onValue}
          multiplyChips={multiplyChips}
        />
      )}
      {!frozen && w && onSecond && (
        <ChipRow label="Barre 2" r={w} onValue={onSecond} multiplyChips={multiplyChips} />
      )}

      {caption && <p className="text-center text-xs text-slate-500">{caption}</p>}
      <p className="sr-only">
        {`La barre est coupée en ${v.den} parts égales ; ${Math.abs(v.num)} sont coloriées${
          v.num < 0 ? ', à gauche de zéro' : ''
        }. Valeur : ${formatDec(toDecimal(v, 4))}.`}
      </p>
    </div>
  );
}

/* ── Une barre : les traits de coupe et la longueur coloriée ───────── */
function Bar({ r, y, toX, zeroX, tone }) {
  const neg = r.num < 0;
  const n = Math.abs(r.num);
  const unitW = toX(1) - toX(0);
  const partW = unitW / r.den;
  // Le bord « rempli » : la seule chose qui compte, et elle ne bouge pas.
  const endX = zeroX + (neg ? -1 : 1) * n * partW;
  const fillX = Math.min(zeroX, endX);
  const fillW = Math.abs(endX - zeroX);

  const fill = tone === 'violet' ? '#a78bfa' : '#818cf8';
  const stroke = tone === 'violet' ? '#6d28d9' : '#4338ca';

  // Le cadre unité : de 0 à 1 (ou de −1 à 0 quand la barre est négative).
  const frameX = neg ? toX(-1) : toX(0);
  const cuts = [];
  if (r.den <= MAX_CUTS) {
    for (let i = 1; i < r.den; i += 1) cuts.push(frameX + (i * unitW) / r.den);
  }
  // Débordement (num > den) : on prolonge d'un second cadre unité.
  const overflow = n > r.den;

  return (
    <g>
      {/* cadre(s) unité */}
      <rect x={frameX} y={y} width={unitW} height={BAR_H} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="6" />
      {overflow && (
        <rect
          x={neg ? frameX - unitW : frameX + unitW}
          y={y}
          width={unitW}
          height={BAR_H}
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="2"
          rx="6"
        />
      )}
      {/* longueur coloriée — invariante quand on re-découpe */}
      <rect x={fillX} y={y + 3} width={fillW} height={BAR_H - 6} fill={fill} opacity="0.75" rx="4" />
      {/* traits de coupe */}
      {cuts.map((cx) => (
        <line key={`c${cx}`} x1={cx} y1={y + 3} x2={cx} y2={y + BAR_H - 3} stroke="#fff" strokeWidth="2" />
      ))}
      {r.den <= MAX_CUTS && overflow &&
        Array.from({ length: r.den - 1 }, (_, i) => {
          const base = neg ? frameX - unitW : frameX + unitW;
          return base + ((i + 1) * unitW) / r.den;
        }).map((cx) => (
          <line key={`o${cx}`} x1={cx} y1={y + 3} x2={cx} y2={y + BAR_H - 3} stroke="#fff" strokeWidth="2" />
        ))}
      {r.den > MAX_CUTS && (
        <text x={frameX + unitW / 2} y={y + BAR_H / 2 + 5} textAnchor="middle" fontSize="13" fill="#475569" fontFamily="monospace">
          ×{r.den} parts
        </text>
      )}
      {/* bord droit : le marqueur d'arrivée, épais, toujours au même endroit */}
      <line x1={endX} y1={y - 4} x2={endX} y2={y + BAR_H + 4} stroke={stroke} strokeWidth="3" />
      <text x={endX} y={y + BAR_H + 20} textAnchor="middle" fontSize="12" fontWeight="bold" fill={stroke} fontFamily="monospace">
        {plainFrac(r)}
      </text>
    </g>
  );
}

/* ── Le miroir : la droite graduée où le point ne bouge pas ────────── */
function Mirror({ y, toX, min, max, marks }) {
  const ticks = [];
  for (let t = min; t <= max; t += 1) ticks.push(t);
  return (
    <g>
      <line x1={toX(min)} y1={y} x2={toX(max)} y2={y} stroke="#94a3b8" strokeWidth="2" />
      {ticks.map((t) => (
        <g key={`t${t}`}>
          <line x1={toX(t)} y1={y - 7} x2={toX(t)} y2={y + 7} stroke="#94a3b8" strokeWidth="2" />
          <text x={toX(t)} y={y + 24} textAnchor="middle" fontSize="12" fill="#64748b" fontFamily="monospace">
            {formatDec(t)}
          </text>
        </g>
      ))}
      {marks.map((m, i) => {
        const x = toX(toDecimal(m.r, 6));
        return (
          <g key={`m${i}`}>
            {/* §17bis : le point EST le cercle. Un « ● » en <text> au-dessus faisait
                doublon et, quand deux rationnels sont proches (1/3 et 1/2), chevauchait
                l'étiquette voisine. Le décor cède la place à la lisibilité. */}
            <circle cx={x} cy={y} r="7" fill={m.tone} stroke="#fff" strokeWidth="2" />
          </g>
        );
      })}
    </g>
  );
}

/* ── La lecture chiffrée ───────────────────────────────────────────── */
function Readout({ r, tone, showDecimal }) {
  const cls = tone === 'violet' ? 'border-violet-300 bg-violet-50 text-violet-900' : 'border-indigo-300 bg-indigo-50 text-indigo-900';
  return (
    <div className={`rounded-2xl border-2 p-2.5 text-center ${cls}`}>
      <MathText className="text-xl">{`$${formatFrac(r)}$`}</MathText>
      <div className="text-[11px] font-mono text-slate-600 mt-0.5">
        {Math.abs(r.num)} part{Math.abs(r.num) > 1 ? 's' : ''} sur {r.den}
        {showDecimal && <> — {formatDec(toDecimal(r, 4))}</>}
      </div>
    </div>
  );
}

/* ── Les puces : couper plus fin (×k) ou regrouper (÷k) ────────────── */
function ChipRow({ label, r, onValue, multiplyChips }) {
  const canDivide = (k) => r.den % k === 0 && r.num % k === 0 && r.den / k >= 1;
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-slate-500 mr-1">{label} :</span>
      {multiplyChips.map((k) => (
        <button
          key={`m${k}`}
          type="button"
          onClick={() => onValue({ num: r.num * k, den: r.den * k })}
          disabled={r.den * k > 96}
          aria-label={`Couper chaque part en ${k} : ${label} devient ${r.num * k} sur ${r.den * k}`}
          className="min-w-[52px] min-h-[44px] px-3 rounded-xl border-2 border-indigo-300 bg-white text-sm font-extrabold text-indigo-700 hover:border-indigo-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          ×{k}
        </button>
      ))}
      {multiplyChips.map((k) => (
        <button
          key={`d${k}`}
          type="button"
          onClick={() => canDivide(k) && onValue({ num: r.num / k, den: r.den / k })}
          disabled={!canDivide(k)}
          aria-label={
            canDivide(k)
              ? `Regrouper les parts par ${k} : ${label} devient ${r.num / k} sur ${r.den / k}`
              : `Regrouper par ${k} impossible : ${k} ne divise pas à la fois ${r.num} et ${r.den}`
          }
          className="min-w-[52px] min-h-[44px] px-3 rounded-xl border-2 border-slate-300 bg-white text-sm font-extrabold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          ÷{k}
        </button>
      ))}
    </div>
  );
}
