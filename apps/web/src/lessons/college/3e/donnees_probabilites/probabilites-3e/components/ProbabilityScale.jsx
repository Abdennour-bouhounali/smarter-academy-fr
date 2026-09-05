import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { fracLatex } from './probaUtils';

/**
 * ProbabilityScale — l'échelle de 0 à 1, en douzièmes.
 *
 * Activity            placer des événements sur l'échelle : toucher un
 *                     événement, puis toucher la graduation où il va.
 * Mathematical objective  faire sentir qu'une probabilité est un NOMBRE entre
 *                     0 (impossible) et 1 (certain), et que 1/2, 1/6, 1/4, 1/3
 *                     ont une place précise sur cette échelle commune.
 * Student action      toucher un chip d'événement, puis une graduation.
 * Controlled variable la graduation (en douzièmes) attribuée à chaque événement.
 * Mathematical state  `placed` {id → douzièmes} appartient au module ; la
 *                     valeur attendue de chaque événement est dérivée de sa
 *                     fraction.
 * Visual consequence  une lettre (A, B, C…) apparaît au-dessus de la
 *                     graduation ; à la révélation, un ✓ / ✗ par événement.
 * Expected observation « 1/2 est au milieu ; 1/6 est plus petit que 1/4 ».
 * Misconception targeted  « une probabilité peut dépasser 1 » ; « 1/6 > 1/4
 *                     parce que 6 > 4 ».
 *
 * SÉCURITÉ D'AFFICHAGE : les marqueurs sur l'échelle sont des LETTRES (un
 * caractère), empilés verticalement quand plusieurs partagent une graduation ;
 * la légende complète (lettre → événement → fraction) vit dans le DOM. Aucune
 * étiquette longue dans le SVG : aucun chevauchement possible.
 */
const W = 600;
const H = 120;
const X0 = 30;
const X1 = W - 30;
const LINE_Y = 84;
const TICKS = 12;

const LETTERS = 'ABCDEFGH';

export default function ProbabilityScale({
  items,                 // [{ id, label, num, den }]
  placed,                // { id: twelfths }
  selected,              // id en cours de placement
  onSelect,              // (id) => void
  onPlace,               // (id, twelfths) => void
  revealed = false,
  disabled = false,
}) {
  const xAt = (t) => X0 + ((X1 - X0) * t) / TICKS;
  const letterOf = (id) => LETTERS[items.findIndex((it) => it.id === id)];
  const expectedTick = (it) => (it.num * TICKS) / it.den;
  const byTick = {};
  Object.entries(placed).forEach(([id, t]) => { (byTick[t] ??= []).push(id); });
  const allPlaced = items.every((it) => placed[it.id] !== undefined);

  return (
    <div className="w-full rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3" role="group" aria-label="Échelle des probabilités de 0 à 1">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Événements à placer">
        {items.map((it) => {
          const done = placed[it.id] !== undefined;
          const on = selected === it.id;
          const ok = revealed && done && placed[it.id] === expectedTick(it);
          const ko = revealed && done && placed[it.id] !== expectedTick(it);
          return (
            <button key={it.id} type="button" disabled={disabled || revealed}
              onClick={() => onSelect?.(it.id)} aria-pressed={on}
              aria-label={`Placer l'événement ${letterOf(it.id)} : ${it.label}${done ? ' (déjà placé — toucher pour déplacer)' : ''}`}
              className={`min-h-[44px] px-3 rounded-xl border-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-70
                ${ok ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : ko ? 'bg-rose-50 border-rose-400 text-rose-800'
                  : on ? 'bg-violet-600 border-violet-600 text-white' : done ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-white border-slate-300 text-slate-700 hover:border-violet-400'}`}
              style={{ touchAction: 'manipulation' }}>
              <span className="font-mono font-bold mr-1.5">{letterOf(it.id)}</span>{it.label}
              {revealed && (
                <span className="ml-1.5 font-mono"><MathText>{`$= ${fracLatex(it.num, it.den)}$`}</MathText></span>
              )}
            </button>
          );
        })}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block select-none" style={{ touchAction: 'manipulation' }}>
        <line x1={X0} y1={LINE_Y} x2={X1} y2={LINE_Y} stroke="#0f172a" strokeWidth="2.5" style={{ pointerEvents: 'none' }} />
        {Array.from({ length: TICKS + 1 }, (_, t) => {
          const x = xAt(t);
          const major = t === 0 || t === 6 || t === 12;
          const ids = byTick[t] ?? [];
          return (
            <g key={t}>
              <line x1={x} y1={LINE_Y - (major ? 12 : 7)} x2={x} y2={LINE_Y + (major ? 12 : 7)} stroke="#0f172a" strokeWidth={major ? 2.5 : 1.5} style={{ pointerEvents: 'none' }} />
              {major && (
                <text x={x} y={LINE_Y + 28} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b" className="font-mono" style={{ pointerEvents: 'none' }}>
                  {t === 0 ? '0' : t === 12 ? '1' : '1/2'}
                </text>
              )}
              {ids.map((id, k) => {
                const it = items.find((i) => i.id === id);
                const good = revealed ? placed[id] === expectedTick(it) : null;
                const fill = good === null ? '#7c3aed' : good ? '#059669' : '#e11d48';
                return (
                  <g key={id} style={{ pointerEvents: 'none' }}>
                    <circle cx={x} cy={LINE_Y - 24 - k * 22} r="10" fill={fill} />
                    <text x={x} y={LINE_Y - 20 - k * 22} textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff" className="font-mono">{letterOf(id)}</text>
                  </g>
                );
              })}
              {!revealed && (
                <rect x={x - 22} y={LINE_Y - 30} width="44" height="60" fill="transparent" role="button" tabIndex={disabled || !selected ? -1 : 0}
                  aria-label={`Graduation ${t} douzième${t > 1 ? 's' : ''} sur 12`}
                  className="focus:outline-none focus-visible:stroke-blue-500 focus-visible:stroke-[2px]"
                  style={{ cursor: selected && !disabled ? 'pointer' : 'default' }}
                  onClick={() => selected && !disabled && onPlace?.(selected, t)}
                  onKeyDown={(e) => { if (selected && !disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onPlace?.(selected, t); } }} />
              )}
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-slate-500 text-center">
        {selected && !revealed ? `Touche la graduation où placer ${letterOf(selected)}.` : allPlaced ? 'Tous les événements sont placés.' : 'Touche un événement, puis sa place sur l’échelle (graduations en douzièmes).'}
      </p>
    </div>
  );
}
