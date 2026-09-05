import React from 'react';
import VectorScene, { SCENE_COLORS } from './VectorScene';
import { RANGE, vec, inRange, describeMove, formatVec } from './vecteurUtils';

/**
 * DisplacementLab — l'interaction SIGNATURE de la leçon : le robot du dépôt.
 *
 * ACTION            l'élève déplace un robot sur le sol carrelé (glisser sur
 *                   le repère, croix directionnelle, flèches du clavier).
 * CHANGEMENT        le robot change de case ; une flèche relie sa case de
 *                   départ à sa case actuelle ; la « recette » s'écrit en
 *                   mots sous la figure (3 vers la droite et 2 vers le haut).
 * OBSERVATION       la recette ne dépend que du trajet, pas de la case de
 *                   départ : deux robots partis d'ailleurs, même recette,
 *                   arrivées différentes. La recette du retour est l'inverse.
 * SENS MATHÉMATIQUE un déplacement se décrit indépendamment de son point de
 *                   départ — c'est l'objet que le module suivant nommera
 *                   VECTEUR. Aucune coordonnée, aucune notation ici.
 *
 * Un seul robot est actif à la fois (une variable). Les autres restent
 * visibles, figés, avec leur flèche : ce sont les comparaisons.
 *
 * @param robots  [{ id, start, pos, icon?, color?, name? }] — le premier actif est piloté
 * @param activeId
 * @param onMove(id, nextPos)
 * @param station {x,y} | null   la case à atteindre (anneau ambre)
 * @param model   { start, vector } | null   une flèche modèle en pointillé
 * @param trail   [{ from, to }]  flèches déjà faites (enchaînement), en fantôme
 */
export default function DisplacementLab({
  robots,
  activeId,
  onMove,
  station = null,
  model = null,
  trail = [],
  disabled = false,
  ariaLabel,
  range = RANGE,
}) {
  const active = robots.find((r) => r.id === activeId) ?? null;

  const moveBy = (dx, dy) => {
    if (!active || disabled) return;
    const next = { x: active.pos.x + dx, y: active.pos.y + dy };
    if (!inRange(next, range)) return;
    onMove(active.id, next);
  };

  const points = [];
  const arrows = [];
  for (const r of robots) {
    const moved = !(r.pos.x === r.start.x && r.pos.y === r.start.y);
    points.push({ id: `${r.id}-start`, x: r.start.x, y: r.start.y, hollow: true, color: r.color ?? SCENE_COLORS.main, name: moved ? (r.name ?? 'départ') : undefined, prefer: 'sw' });
    points.push({ id: r.id, x: r.pos.x, y: r.pos.y, icon: r.icon ?? '🤖', color: r.id === activeId ? '#c7d2fe' : '#e2e8f0' });
    if (moved) arrows.push({ id: `${r.id}-trace`, from: r.start, to: r.pos, color: r.color ?? SCENE_COLORS.main });
  }
  for (const [i, t] of trail.entries()) {
    arrows.push({ id: `trail-${i}`, from: t.from, to: t.to, ghost: true, name: t.name });
  }
  if (model) {
    arrows.push({ id: 'model', from: model.start, to: { x: model.start.x + model.vector.x, y: model.start.y + model.vector.y }, dashed: true, color: '#f59e0b', name: model.name ?? 'modèle' });
  }

  const dpad = [
    { k: 'up', label: 'Une case vers le haut', dx: 0, dy: 1, glyph: '↑', cls: 'col-start-2 row-start-1' },
    { k: 'left', label: 'Une case vers la gauche', dx: -1, dy: 0, glyph: '←', cls: 'col-start-1 row-start-2' },
    { k: 'right', label: 'Une case vers la droite', dx: 1, dy: 0, glyph: '→', cls: 'col-start-3 row-start-2' },
    { k: 'down', label: 'Une case vers le bas', dx: 0, dy: -1, glyph: '↓', cls: 'col-start-2 row-start-3' },
  ];

  const recipe = active ? vec(active.start, active.pos) : null;

  return (
    <div className="space-y-3">
      <VectorScene
        range={range}
        points={points}
        arrows={arrows}
        target={station}
        draggableId={active ? active.id : null}
        onPointChange={(p) => { if (active && !disabled) onMove(active.id, p); }}
        disabled={disabled}
        ariaLabel={ariaLabel ?? (active ? `Sol du dépôt — le robot est en ${formatVec(active.pos)}` : 'Sol du dépôt')}
      />
      <div className="flex flex-wrap items-center gap-4 justify-center">
        <div className="grid grid-cols-3 grid-rows-3 gap-1" role="group" aria-label="Croix directionnelle du robot">
          {dpad.map((b) => {
            const next = active ? { x: active.pos.x + b.dx, y: active.pos.y + b.dy } : null;
            const blocked = !active || disabled || !inRange(next, range);
            return (
              <button
                key={b.k}
                type="button"
                onClick={() => moveBy(b.dx, b.dy)}
                disabled={blocked}
                aria-label={`Robot : ${b.label.toLowerCase()}`}
                className={`${b.cls} w-11 h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold
                            disabled:bg-slate-200 disabled:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500`}
              >
                {b.glyph}
              </button>
            );
          })}
        </div>
        {recipe && (
          <p className="text-sm text-slate-700 min-w-[180px]" aria-live="polite">
            <span className="block text-xs font-semibold uppercase text-indigo-600">Recette du trajet</span>
            <span className="font-bold text-slate-900">{describeMove(recipe)}</span>
          </p>
        )}
      </div>
    </div>
  );
}
