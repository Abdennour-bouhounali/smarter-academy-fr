import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { formatDec, isqrt, rootProduct, formatRoot, formatSqrt } from './rootUtils';

/**
 * SquareComposer — deux carrés qu'on colle, en produit ou en somme.
 *
 * Activity: choisir deux aires a et b parmi des puces, puis basculer entre
 *   deux assemblages : le RECTANGLE de côtés √a et √b (dont l'aire vaut ab)
 *   et les deux carrés posés BOUT À BOUT (dont les côtés s'additionnent).
 * Mathematical objective: voir que √a × √b = √(ab) — l'aire du rectangle est
 *   bien ab — et que √a + √b ≠ √(a+b), parce que 3 + 4 = 7 alors que le
 *   carré d'aire 25 a un côté de 5.
 * Student action: taper une puce d'aire, taper l'onglet « × » ou « + ».
 * Controlled variable: (a, b, mode).
 * Mathematical state: a, b, mode. Les côtés √a, √b, l'aire du rectangle et
 *   la longueur cumulée en sont DÉRIVÉS.
 * Visual consequence: en mode « × », un rectangle plein étiqueté ab ; en
 *   mode « + », les deux carrés alignés avec une règle sous eux, et le carré
 *   d'aire a + b tracé en pointillés à côté pour comparer les côtés.
 * Expected observation: 3 + 4 = 7 dépasse franchement le côté 5 du carré
 *   d'aire 25 — la somme des racines n'est pas la racine de la somme.
 * Misconception targeted: « √(a + b) = √a + √b ».
 * Feedback: rendu par le module ; le composant affiche les nombres exacts.
 * Formalization: √a × √b = √(ab), et pas de règle pour l'addition.
 * Scaffolding: seules des aires de carrés parfaits sont proposées, pour que
 *   les côtés soient lisibles à l'œil.
 * Transfer: le mode « × » sert au quotient (module 4, étape 3).
 *
 * Composant CONTRÔLÉ. 2 onglets + 2 × 4 puces = 10 nœuds interactifs.
 *
 * @param {number} a   aire du premier carré (carré parfait)
 * @param {number} b   aire du second carré
 * @param {'product'|'sum'} mode
 * @param {(m:'product'|'sum')=>void} [onMode]
 * @param {(a:number)=>void} [onA] @param {(b:number)=>void} [onB]
 * @param {number[]} [choices]
 * @param {boolean} [frozen=false]
 */
const W = 560;
const H_PRODUCT = 170;
const H_SUM = 230;
const PAD = 18;


export default function SquareComposer({
  a,
  b,
  mode = 'product',
  onMode,
  onA,
  onB,
  choices = [1, 4, 9, 16],
  frozen = false,
}) {
  const sa = isqrt(a);
  const sb = isqrt(b);
  const product = rootProduct(a, b);      // √(ab)
  const sumSide = sa + sb;                // √a + √b
  const sumArea = a + b;
  const sumAreaSide = Math.sqrt(sumArea); // √(a+b)

  const H = mode === 'product' ? H_PRODUCT : H_SUM;
  const BASE = H - 46;

  // Une seule unité de longueur pour toute la figure : les côtés se comparent.
  const unit =
    mode === 'product'
      ? Math.min(22, (W * 0.42) / Math.max(sa, 1), (BASE - 20) / Math.max(sb, 1))
      : Math.min(22, (W - 3 * PAD) / (sumSide + sumAreaSide + 1), (BASE - 24) / Math.max(sa, sb, sumAreaSide));
  const px = (v) => v * unit;

  return (
    <div className="space-y-3" role="group" aria-label="Assemblage de deux carrés">
      {/* ── Choix des deux aires ─────────────────────────────────────── */}
      {!frozen && (
        <div className="grid grid-cols-2 gap-2">
          <ChipRow label="Aire du carré A" value={a} choices={choices} onPick={onA} name="A" />
          <ChipRow label="Aire du carré B" value={b} choices={choices} onPick={onB} name="B" />
        </div>
      )}

      {/* ── Onglets produit / somme ──────────────────────────────────── */}
      {!frozen && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'product', label: 'Les coller en RECTANGLE (×)' },
            { key: 'sum', label: 'Les poser BOUT À BOUT (+)' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onMode?.(t.key)}
              aria-pressed={mode === t.key}
              className={`min-h-[48px] px-3 rounded-xl border-2 text-xs sm:text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                mode === t.key
                  ? 'bg-sky-600 border-sky-700 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-sky-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── La figure ────────────────────────────────────────────────── */}
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto min-w-[330px] select-none"
          role="img"
          aria-label={
            mode === 'product'
              ? `Rectangle de côtés racine de ${a} et racine de ${b}, d'aire ${a * b}`
              : `Deux carrés bout à bout, côtés ${sa} et ${sb}, comparés au carré d'aire ${sumArea}`
          }
        >
          {mode === 'product' ? (
            <g pointerEvents="none">
              {/* le rectangle √a × √b */}
              <rect
                x={PAD} y={BASE - px(sb)} width={px(sa)} height={px(sb)}
                fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5"
              />
              {/* le quadrillage : sa × sb petits carrés unité */}
              {Array.from({ length: sa + 1 }, (_, i) => (
                <line key={`v${i}`} x1={PAD + px(i)} y1={BASE - px(sb)} x2={PAD + px(i)} y2={BASE} stroke="#bae6fd" strokeWidth="1" />
              ))}
              {Array.from({ length: sb + 1 }, (_, i) => (
                <line key={`h${i}`} x1={PAD} y1={BASE - px(i)} x2={PAD + px(sa)} y2={BASE - px(i)} stroke="#bae6fd" strokeWidth="1" />
              ))}
              <text x={PAD + px(sa) / 2} y={BASE + 18} textAnchor="middle" fontSize="13" fill="#0369a1" fontFamily="monospace">
                √{formatDec(a)} = {formatDec(sa)}
              </text>
              <text x={PAD - 6} y={BASE - px(sb) / 2 + 4} textAnchor="end" fontSize="13" fill="#0369a1" fontFamily="monospace">
                {formatDec(sb)}
              </text>
              {/* Une seule étiquette dans la figure : l'aire du rectangle.
                  La lecture complète (√a × √b = √ab) est sous la figure. */}
              <text
                x={PAD + px(sa) + 18} y={BASE - px(sb) / 2 + 5}
                fontSize="15" fill="#0c4a6e" fontFamily="monospace" fontWeight="bold"
              >
                Aire = {formatDec(sa * sb)}
              </text>
            </g>
          ) : (
            <g pointerEvents="none">
              {/* les deux carrés bout à bout */}
              <rect x={PAD} y={BASE - px(sa)} width={px(sa)} height={px(sa)} fill="#fce7f3" stroke="#db2777" strokeWidth="2.5" />
              <text x={PAD + px(sa) / 2} y={BASE - px(sa) / 2 + 5} textAnchor="middle" fontSize="12" fill="#9d174d" fontFamily="monospace" fontWeight="bold">
                {formatDec(a)}
              </text>
              <rect x={PAD + px(sa)} y={BASE - px(sb)} width={px(sb)} height={px(sb)} fill="#fce7f3" stroke="#db2777" strokeWidth="2.5" />
              <text x={PAD + px(sa) + px(sb) / 2} y={BASE - px(sb) / 2 + 5} textAnchor="middle" fontSize="12" fill="#9d174d" fontFamily="monospace" fontWeight="bold">
                {formatDec(b)}
              </text>
              {/* la règle sous les deux */}
              <line x1={PAD} y1={BASE + 10} x2={PAD + px(sumSide)} y2={BASE + 10} stroke="#db2777" strokeWidth="3" />
              <text x={PAD + px(sumSide) / 2} y={BASE + 27} textAnchor="middle" fontSize="13" fill="#9d174d" fontFamily="monospace" fontWeight="bold">
                {formatDec(sa)} + {formatDec(sb)} = {formatDec(sumSide)}
              </text>

              {/* le carré d'aire a + b, en pointillés, pour comparer */}
              <rect
                x={PAD + px(sumSide) + 34} y={BASE - px(sumAreaSide)}
                width={px(sumAreaSide)} height={px(sumAreaSide)}
                fill="#f1f5f9" stroke="#475569" strokeWidth="2.5" strokeDasharray="6 4"
              />
              <text
                x={PAD + px(sumSide) + 34 + px(sumAreaSide) / 2} y={BASE - px(sumAreaSide) / 2 + 5}
                textAnchor="middle" fontSize="12" fill="#334155" fontFamily="monospace" fontWeight="bold"
              >
                {formatDec(sumArea)}
              </text>
              <line
                x1={PAD + px(sumSide) + 34} y1={BASE + 10}
                x2={PAD + px(sumSide) + 34 + px(sumAreaSide)} y2={BASE + 10}
                stroke="#475569" strokeWidth="3"
              />
              <text
                x={PAD + px(sumSide) + 34 + px(sumAreaSide) / 2} y={BASE + 27}
                textAnchor="middle" fontSize="13" fill="#334155" fontFamily="monospace" fontWeight="bold"
              >
                {Number.isInteger(sumAreaSide) ? formatDec(sumAreaSide) : `√${formatDec(sumArea)}`}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* ── La lecture chiffrée ──────────────────────────────────────── */}
      <p className="text-center text-sm text-slate-700">
        {mode === 'product' ? (
          <MathText>
            {`$${formatSqrt(a)} \\times ${formatSqrt(b)} = ${formatDec(sa)} \\times ${formatDec(sb)} = ${formatRoot(product)} = ${formatSqrt(a * b)}$`}
          </MathText>
        ) : (
          <MathText>
            {`$${formatSqrt(a)} + ${formatSqrt(b)} = ${formatDec(sa)} + ${formatDec(sb)} = ${formatDec(sumSide)} \\;\\neq\\; ${formatSqrt(sumArea)}$`}
          </MathText>
        )}
      </p>

      <p className="sr-only">
        {mode === 'product'
          ? `Rectangle de côtés ${sa} et ${sb}, aire ${sa * sb}, qui est aussi le côté du carré d'aire ${a * b}.`
          : `Les deux côtés mis bout à bout font ${sumSide}, alors que le carré d'aire ${sumArea} a un côté de ${formatDec(Math.round(sumAreaSide * 100) / 100)}.`}
      </p>
    </div>
  );
}

function ChipRow({ label, value, choices, onPick, name }) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 space-y-1.5">
      <div className="text-[11px] font-mono uppercase tracking-wide text-slate-500 text-center">{label}</div>
      <div className="flex justify-center gap-1.5 flex-wrap">
        {choices.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onPick?.(c)}
            aria-label={`${name} = ${c}`}
            aria-pressed={value === c}
            className={`min-w-[44px] min-h-[44px] rounded-xl border-2 font-mono text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              value === c
                ? 'bg-slate-800 border-slate-900 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-sky-400'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
