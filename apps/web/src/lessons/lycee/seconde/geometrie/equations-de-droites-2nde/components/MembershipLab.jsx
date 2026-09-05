import React from 'react';
import { Feedback } from '../../../../../common/components/LessonUI';
import LineScene from './LineScene';
import { reducedOf, isOnLine, formatPoint, formatReduced, RANGE } from './lineUtils';
import { formatDec } from '@smarter-academy/core';

/**
 * MembershipLab — ce point est-il sur la droite ? (module 5)
 *
 * Activity: une droite et cinq points suspects, dont deux à 0,1 unité de
 *   la droite — indiscernables à l'écran (3 px).
 * Student action: pour chaque point, prédire (oui / non, SANS verdict), puis
 *   « Tester » : le calcul m·x + p est déroulé et comparé à y.
 * Mathematical state: la droite, les prédictions, les points testés.
 * Visual consequence: le point devient vert (dessus) ou rose (à côté) après
 *   le test seulement.
 * Expected observation (aha): l'œil dit oui, l'équation dit non — le test
 *   par l'équation est le seul fiable.
 */
const f = (v) => formatDec(v);
const par = (v) => (v < 0 ? `(${f(v)})` : f(v));

export default function MembershipLab({ line, candidates, predictions, onPredict, tested, onTest, disabled = false, range = RANGE }) {
  const red = reducedOf(line);
  const points = candidates.map((c) => {
    const done = tested.includes(c.id);
    const on = isOnLine(line, c);
    return { id: c.id, name: c.name, x: c.x, y: c.y, color: !done ? '#0284c7' : on ? '#059669' : '#e11d48' };
  });
  const chip = (on, tone) => `min-h-[44px] px-3 rounded-lg border-2 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${on ? `${tone} text-white` : 'bg-white border-slate-300 text-slate-700'} disabled:opacity-60`;
  return (
    <div className="space-y-3">
      <LineScene range={range} line={line} nameA={null} points={points} ariaLabel={`Droite ${formatReduced(red)} et cinq points à tester`} />
      <p className="text-sm text-slate-600">Droite <span className="font-mono font-bold text-slate-900">{formatReduced(red)}</span>. Pour chaque point : ton avis d’abord, le calcul ensuite.</p>
      <ul className="space-y-2">
        {candidates.map((c) => {
          const pred = predictions[c.id] ?? null;
          const done = tested.includes(c.id);
          const on = isOnLine(line, c);
          const val = red.m * c.x + red.p;
          return (
            <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-slate-900 tabular-nums">{c.name} {formatPoint(c)}</span>
                <div className="flex gap-2" role="group" aria-label={`Prédiction pour ${c.name}`}>
                  <button type="button" className={chip(pred === 'oui', 'bg-indigo-600 border-indigo-700')} aria-pressed={pred === 'oui'} disabled={disabled || done} onClick={() => onPredict(c.id, 'oui')}>Oui, dessus</button>
                  <button type="button" className={chip(pred === 'non', 'bg-indigo-600 border-indigo-700')} aria-pressed={pred === 'non'} disabled={disabled || done} onClick={() => onPredict(c.id, 'non')}>Non, à côté</button>
                </div>
                <button type="button" disabled={disabled || done || !pred} onClick={() => onTest(c.id, on, pred)} aria-label={`Tester ${c.name} avec l’équation`}
                  className="min-h-[44px] px-4 rounded-lg bg-slate-900 text-white text-sm font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">🧮 Tester</button>
              </div>
              {done && (
                <Feedback tone={on ? 'ok' : 'ko'}>
                  <span className="font-mono tabular-nums">{f(red.m)} × {par(c.x)} + {f(red.p)} = {f(val)}</span>
                  {' '}{on ? `= y : ${c.name} est sur la droite.` : `≠ ${f(c.y)} = y : ${c.name} n’est PAS sur la droite (écart de ${f(Math.abs(val - c.y))} sur y).`}
                  {' '}{pred === (on ? 'oui' : 'non') ? 'Ton avis était juste.' : 'Ton œil s’est trompé — l’équation, non.'}
                </Feedback>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
