import React, { useMemo, useRef, useState } from 'react';
import { applyRule, formatDec } from './proportionUtils';

/**
 * ArrowReader — le tableau se LIT au doigt, dans ses deux sens.
 *
 * Activity: l'élève attrape une flèche et la traîne SUR le tableau. Posée
 *   verticalement dans une colonne, elle affiche la multiplication qui mène
 *   de la grandeur du haut à celle du bas ; posée horizontalement entre deux
 *   colonnes, elle affiche celle qui mène d'une colonne à l'autre — et elle
 *   s'applique alors aux DEUX lignes en même temps.
 * Mathematical objective: un tableau de proportionnalité ne se lit pas
 *   « case par case ». Il porte deux lectures, et l'élève doit pouvoir les
 *   distinguer : vers le BAS c'est toujours le même nombre (le coefficient),
 *   sur le CÔTÉ c'est un nombre qui change avec les colonnes choisies.
 * Student action: un glissement continu de la flèche (jamais un `+`/`−`,
 *   jamais un `<input type="range">` — règle projet du 2026-09-06).
 * Controlled variable: la POSITION de la flèche — sa colonne d'ancrage, et
 *   son orientation, toutes deux déduites du point saisi.
 * Mathematical state: `{ dir, from, to }`. Les deux facteurs affichés sont
 *   calculés par `applyRule` à partir de la règle : il est impossible que la
 *   flèche annonce une multiplication que la situation ne fait pas.
 * Visual consequence: la ou les colonnes concernées s'allument, et la
 *   légende écrit l'opération lue.
 * Expected observation: « en descendant, c'est toujours × 3, où que je pose
 *   la flèche ; en allant sur le côté, ça dépend des deux colonnes — mais le
 *   MÊME nombre agit sur les deux lignes ».
 * Misconception targeted: « le tableau se remplit avec + » et « le nombre
 *   qui fait passer d'une colonne à l'autre est le coefficient ».
 * Formalization: aucune. Aucun mot nouveau ici ; le module pose ses briques
 *   après le geste.
 *
 * PÉRIMÈTRE 6e — ce que la flèche N'ÉCRIT JAMAIS : aucun quotient y ÷ x
 * (c'est la lecture de 3e), aucune écriture y = a·x, aucun pourcentage,
 * aucune échelle. La flèche n'écrit que des MULTIPLICATIONS, l'opération que
 * la 6e travaille. Le nombre qu'elle affiche est toujours obtenu par
 * `applyRule`, jamais par une division posée à l'écran.
 *
 * SÉCURITÉ VISUELLE : la flèche et ses libellés vivent dans une couche
 * `absolute` calée sur la grille CSS du tableau, jamais au-dessus des
 * nombres — la légende est SOUS la grille, dans son propre bloc du flux, si
 * bien qu'aucun chevauchement n'est possible quelle que soit la largeur des
 * nombres. La grille défile dans son conteneur `overflow-x-auto`.
 */

const CELL_W = 76;   // largeur d'une colonne de valeurs
const HEAD_W = 96;   // largeur de la colonne des en-têtes de ligne
const ROW_H = 48;    // hauteur d'une ligne : 44 px pleins pour la poignée
const GAP_H = 56;    // hauteur de la bande entre les deux lignes (couloir de la flèche)

/** Le facteur d'une colonne à l'autre, dérivé des x — jamais écrit à la main. */
const factorBetween = (a, b) => (a === 0 ? null : b / a);

export default function ArrowReader({
  rule,
  xs,                       // les abscisses des colonnes, ordonnées
  xLabel = 'Crêpes',
  yLabel = 'Prix',
  yUnit = '',
  arrow,                    // { dir: 'down'|'across', from, to } — état contrôlé
  onArrowChange,
  caption = 'Traîne la flèche sur le tableau',
}) {
  const frameRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const cols = useMemo(
    () => xs.map((x) => ({ x, y: applyRule(rule, x) })),
    [rule, xs],
  );

  const n = cols.length;
  const gridW = HEAD_W + n * CELL_W;

  /* ── Le geste : une position de pointeur → un état mathématique ──────
     La règle de lecture est franche et se raconte : si le doigt est dans la
     bande CENTRALE (entre les deux lignes), la flèche se couche et relie
     deux colonnes voisines ; ailleurs, elle se dresse dans la colonne
     survolée. L'élève découvre donc les deux lectures par le même geste,
     sans aucun bouton de bascule. */
  const arrowFromPoint = (clientX, clientY) => {
    const frame = frameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const px = clientX - rect.left + frame.scrollLeft;
    const py = clientY - rect.top;

    const raw = Math.floor((px - HEAD_W) / CELL_W);
    const i = Math.max(0, Math.min(n - 1, raw));

    const inCorridor = py > ROW_H && py < ROW_H + GAP_H;
    if (inCorridor && n >= 2) {
      // Couché : on relie la colonne survolée à sa voisine de droite ; sur la
      // dernière colonne, on relie la précédente à celle-ci.
      const from = Math.min(i, n - 2);
      return { dir: 'across', from, to: from + 1 };
    }
    return { dir: 'down', from: i, to: i };
  };

  const sameArrow = (a, b) =>
    !!a && !!b && a.dir === b.dir && a.from === b.from && a.to === b.to;

  const push = (clientX, clientY) => {
    const next = arrowFromPoint(clientX, clientY);
    if (next && !sameArrow(next, arrow)) onArrowChange(next);
  };

  const begin = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    push(e.clientX, e.clientY);
  };
  const move = (e) => {
    if (!dragging) return;
    push(e.clientX, e.clientY);
  };
  const end = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  /* ── Pilotage clavier : les mêmes états, sans souris ni doigt ─────── */
  const onKeyDown = (e) => {
    const a = arrow;
    const step = (d) => {
      if (a.dir === 'down') {
        const i = Math.max(0, Math.min(n - 1, a.from + d));
        onArrowChange({ dir: 'down', from: i, to: i });
      } else {
        const f = Math.max(0, Math.min(n - 2, a.from + d));
        onArrowChange({ dir: 'across', from: f, to: f + 1 });
      }
    };
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); return; }
    if (e.key === 'ArrowDown' && a.dir === 'across') {
      e.preventDefault();
      onArrowChange({ dir: 'down', from: a.from, to: a.from });
      return;
    }
    if (e.key === 'ArrowUp' && a.dir === 'down' && n >= 2) {
      e.preventDefault();
      const f = Math.min(a.from, n - 2);
      onArrowChange({ dir: 'across', from: f, to: f + 1 });
    }
  };

  /* ── Ce que la flèche LIT — dérivé, jamais stocké ─────────────────── */
  const reading = useMemo(() => {
    if (!arrow) return null;
    if (arrow.dir === 'down') {
      const c = cols[arrow.from];
      if (!c || c.x === 0) return null;
      return {
        kind: 'down',
        factor: c.y / c.x,
        text: `${formatDec(c.x)} × ${formatDec(c.y / c.x)} = ${formatDec(c.y)}`,
      };
    }
    const a = cols[arrow.from];
    const b = cols[arrow.to];
    if (!a || !b) return null;
    const f = factorBetween(a.x, b.x);
    if (f === null) return null;
    return {
      kind: 'across',
      factor: f,
      // Le MÊME facteur sur les deux lignes : c'est exactement ce que la
      // lecture horizontale affirme, et on l'écrit deux fois pour le montrer.
      topText: `${formatDec(a.x)} × ${formatDec(f)} = ${formatDec(b.x)}`,
      botText: `${formatDec(a.y)} × ${formatDec(f)} = ${formatDec(b.y)}`,
      agrees: Math.abs(a.y * f - b.y) < 1e-9,
    };
  }, [arrow, cols]);

  const lit = (i) =>
    !!arrow && (arrow.dir === 'down' ? arrow.from === i : i === arrow.from || i === arrow.to);

  // Position de la flèche dans la couche absolue.
  const arrowLeft = arrow
    ? arrow.dir === 'down'
      ? HEAD_W + arrow.from * CELL_W
      : HEAD_W + arrow.from * CELL_W + CELL_W / 2
    : 0;
  const arrowW = arrow && arrow.dir === 'across' ? CELL_W : CELL_W;

  const a11yText = !arrow || !reading
    ? 'Flèche non posée'
    : reading.kind === 'down'
    ? `Flèche verticale sur la colonne ${formatDec(cols[arrow.from].x)} : ${reading.text}`
    : `Flèche horizontale de la colonne ${formatDec(cols[arrow.from].x)} à la colonne ${formatDec(cols[arrow.to].x)} : ${reading.topText}, et ${reading.botText}`;

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 text-center font-medium">{caption}</p>

      <div className="w-full overflow-x-auto">
        <div
          ref={frameRef}
          role="group"
          aria-label="Tableau : traîne la flèche pour lire les multiplications"
          onPointerDown={begin}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          className="relative mx-auto select-none"
          style={{ width: gridW, height: ROW_H * 2 + GAP_H, touchAction: 'none' }}
        >
          {/* ── Ligne du haut : la première grandeur ───────────────── */}
          <div className="absolute left-0 top-0 flex" style={{ height: ROW_H }}>
            <div
              className="flex items-center px-2 bg-slate-700 text-white text-xs font-semibold border border-slate-300 rounded-tl-lg"
              style={{ width: HEAD_W }}
            >
              {xLabel}
            </div>
            {cols.map((c, i) => (
              <div
                key={`x${c.x}`}
                className={`flex items-center justify-center border border-slate-300 font-mono font-bold text-sm ${
                  lit(i) ? 'bg-indigo-100 text-indigo-900' : 'bg-slate-50 text-slate-800'
                }`}
                style={{ width: CELL_W }}
              >
                {formatDec(c.x)}
              </div>
            ))}
          </div>

          {/* ── Le couloir : c'est là que la flèche se couche ──────── */}
          <div
            className="absolute left-0 flex"
            style={{ top: ROW_H, height: GAP_H, width: gridW }}
            aria-hidden="true"
          >
            <div
              className="flex items-center justify-end pr-2 text-[13px] text-slate-400"
              style={{ width: HEAD_W }}
            >
              {arrow?.dir === 'across' ? '' : '↓'}
            </div>
          </div>

          {/* ── Ligne du bas : la seconde grandeur ─────────────────── */}
          <div className="absolute left-0 flex" style={{ top: ROW_H + GAP_H, height: ROW_H }}>
            <div
              className="flex items-center px-2 bg-slate-700 text-white text-xs font-semibold border border-slate-300 rounded-bl-lg"
              style={{ width: HEAD_W }}
            >
              {yLabel}
              {yUnit && <span className="font-normal text-slate-300 ml-1">({yUnit})</span>}
            </div>
            {cols.map((c, i) => (
              <div
                key={`y${c.x}`}
                className={`flex items-center justify-center border border-slate-300 font-mono font-bold text-sm ${
                  lit(i) ? 'bg-emerald-100 text-emerald-900' : 'bg-white text-slate-800'
                }`}
                style={{ width: CELL_W }}
              >
                {formatDec(c.y)}
              </div>
            ))}
          </div>

          {/* ── LA FLÈCHE : l'objet qu'on saisit ───────────────────── */}
          {arrow && (
            <div
              className="absolute"
              style={{
                left: arrowLeft,
                top: arrow.dir === 'down' ? ROW_H - 2 : ROW_H + (GAP_H - 44) / 2,
                width: arrowW,
                height: arrow.dir === 'down' ? GAP_H + 4 : 44,
                cursor: dragging ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              tabIndex={0}
              role="slider"
              aria-label="Flèche de lecture du tableau"
              aria-valuemin={0}
              aria-valuemax={n - 1}
              aria-valuenow={arrow.from}
              aria-valuetext={a11yText}
              onKeyDown={onKeyDown}
            >
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
                aria-hidden="true"
              >
                {arrow.dir === 'down' ? (
                  <g>
                    <line x1="50" y1="4" x2="50" y2="82" stroke="#4f46e5" strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    <polygon points="50,98 38,74 62,74" fill="#4f46e5" />
                  </g>
                ) : (
                  <g>
                    <line x1="4" y1="50" x2="82" y2="50" stroke="#d97706" strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    <polygon points="98,50 74,38 74,62" fill="#d97706" />
                  </g>
                )}
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* ── La LÉGENDE : sous la grille, dans le flux. Aucun chevauchement
             possible avec les nombres, quelle que soit leur largeur. ─── */}
      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 min-h-[76px] flex flex-col justify-center gap-1">
        {!reading ? (
          <p className="text-sm text-slate-500 text-center">
            Attrape la flèche et pose-la où tu veux sur le tableau.
          </p>
        ) : reading.kind === 'down' ? (
          <>
            <p className="text-xs font-bold text-indigo-700 text-center">
              ↓ Vers le bas, dans cette colonne
            </p>
            <p className="font-mono text-sm font-bold text-slate-800 text-center">{reading.text}</p>
            <p className="text-xs text-slate-500 text-center">
              Déplace la flèche : ce nombre change-t-il de colonne en colonne ?
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold text-amber-700 text-center">
              → Sur le côté, d’une colonne à l’autre
            </p>
            <p className="font-mono text-sm font-bold text-slate-800 text-center">{reading.topText}</p>
            <p className="font-mono text-sm font-bold text-slate-800 text-center">{reading.botText}</p>
            <p className="text-xs text-slate-500 text-center">
              Le même × {formatDec(reading.factor)} sur les DEUX lignes.
            </p>
          </>
        )}
      </div>

      <p className="text-xs text-slate-500 text-center sm:hidden">
        Fais glisser la flèche ; passe entre les deux lignes pour la coucher.
      </p>

      <p className="sr-only" role="status" aria-live="polite">
        {a11yText}
      </p>
    </div>
  );
}
