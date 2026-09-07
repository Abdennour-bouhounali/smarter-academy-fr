import React, { useMemo, useRef, useState } from 'react';
import { cellValue, formatCell, cellMeaning } from './tableUtils';

/**
 * CrossFinder — le croisement se FABRIQUE sous le doigt.
 *
 * Activity: l'élève traîne un viseur sur la grille. La bande de LIGNE et la
 *   bande de COLONNE le suivent en continu, et ne se rencontrent qu'en une
 *   seule case, dont la phrase de lecture s'écrit sous la grille au fur et à
 *   mesure — « Inès, Saut : 10 pts ».
 * Mathematical objective: une cellule n'est pas un nombre posé quelque part,
 *   c'est l'INTERSECTION d'une ligne et d'une colonne. Tant que le viseur
 *   bouge, l'élève voit la même case changer de sens dès qu'il change de
 *   ligne — la position porte le sens, et ça se vit.
 * Student action: un glissement continu sur la grille elle-même (jamais un
 *   `+`/`−`, jamais deux clics pour désigner ligne puis colonne).
 * Controlled variable: la position `{ r, c }` du viseur.
 * Mathematical state: `{ r, c }`. La valeur, l'en-tête de ligne, l'en-tête
 *   de colonne et la phrase lue sont tous dérivés du `TableModel` par
 *   `cellMeaning` — il est donc impossible que la bande éclairée et la
 *   phrase affichée se contredisent.
 * Visual consequence: deux bandes se croisent ; la case du croisement se
 *   détache.
 * Expected observation: « je glisse d'une ligne, le nombre change ET la
 *   phrase change de propriétaire » — c'est exactement l'erreur n°1 que le
 *   module combat, rendue visible au lieu d'être corrigée après coup.
 * Misconception targeted: lire la case de la ligne d'à côté ; croire qu'un
 *   nombre « appartient » à sa colonne seule.
 * Formalization: aucune. Le module pose ses briques après le geste.
 *
 * PÉRIMÈTRE 6e : aucune notion de proportionnalité ici — ce tableau range
 * des faits, il ne relie pas deux grandeurs par un coefficient. Le viseur ne
 * calcule rien, ne compare rien : il DÉSIGNE. C'est la leçon « Tableaux »,
 * pas la leçon « Proportionnalité ».
 *
 * SÉCURITÉ VISUELLE : les bandes sont des fonds de cellule (jamais des
 * éléments flottants), la phrase de lecture vit SOUS la grille dans son
 * propre bloc du flux, et la grille défile dans son conteneur
 * `overflow-x-auto` — aucun chevauchement possible, quelle que soit la
 * longueur des en-têtes.
 */

const HEAD_W = 84;
const CELL_W = 76;
const ROW_H = 46;   // + bordures : la case tappable dépasse 44 px

export default function CrossFinder({
  table,
  cross,                    // { r, c } — état contrôlé, possédé par le module
  onCrossChange,
  caption = 'Traîne le viseur : la ligne et la colonne te suivent',
  tone = 'violet',
}) {
  const frameRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const nR = table.rowLabels.length;
  const nC = table.colHeaders.length;
  const gridW = HEAD_W + nC * CELL_W;

  const cellFromPoint = (clientX, clientY) => {
    const frame = frameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const px = clientX - rect.left + frame.scrollLeft;
    const py = clientY - rect.top;
    // La première bande verticale est celle des en-têtes de ligne, la
    // première bande horizontale celle des en-têtes de colonne : on les
    // retire avant de convertir en index.
    const c = Math.max(0, Math.min(nC - 1, Math.floor((px - HEAD_W) / CELL_W)));
    const r = Math.max(0, Math.min(nR - 1, Math.floor((py - ROW_H) / ROW_H)));
    return { r, c };
  };

  const push = (clientX, clientY) => {
    const next = cellFromPoint(clientX, clientY);
    if (next && (next.r !== cross.r || next.c !== cross.c)) onCrossChange(next);
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

  const onKeyDown = (e) => {
    const map = {
      ArrowRight: { r: 0, c: 1 },
      ArrowLeft: { r: 0, c: -1 },
      ArrowDown: { r: 1, c: 0 },
      ArrowUp: { r: -1, c: 0 },
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    onCrossChange({
      r: Math.max(0, Math.min(nR - 1, cross.r + d.r)),
      c: Math.max(0, Math.min(nC - 1, cross.c + d.c)),
    });
  };

  const reading = useMemo(() => cellMeaning(table, cross.r, cross.c), [table, cross]);

  const TONE = {
    violet: { head: 'bg-violet-600', band: 'bg-violet-50', hit: 'bg-violet-500 text-white', ring: 'ring-violet-400', text: 'text-violet-700' },
    emerald: { head: 'bg-emerald-600', band: 'bg-emerald-50', hit: 'bg-emerald-500 text-white', ring: 'ring-emerald-400', text: 'text-emerald-700' },
  }[tone] ?? { head: 'bg-violet-600', band: 'bg-violet-50', hit: 'bg-violet-500 text-white', ring: 'ring-violet-400', text: 'text-violet-700' };

  const a11yText = `Viseur sur ${reading.row}, ${reading.col} : ${formatCell(table, reading.value)}`;

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 text-center font-medium">{caption}</p>

      <div className="w-full overflow-x-auto">
        <div
          ref={frameRef}
          role="group"
          aria-label="Grille : traîne le viseur jusqu’au croisement"
          onPointerDown={begin}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="relative mx-auto select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg"
          style={{
            width: gridW,
            height: ROW_H * (nR + 1),
            touchAction: 'none',
            cursor: dragging ? 'grabbing' : 'grab',
          }}
        >
          {/* ── Bandeau d'en-têtes de colonnes ─────────────────────── */}
          <div className="absolute left-0 top-0 flex" style={{ height: ROW_H }}>
            <div
              className={`flex items-center px-2 ${TONE.head} text-white text-xs font-semibold border border-slate-300 rounded-tl-lg`}
              style={{ width: HEAD_W }}
            >
              {table.rowHeader}
            </div>
            {table.colHeaders.map((h, c) => (
              <div
                key={h}
                className={`flex items-center justify-center px-1 ${TONE.head} text-white text-xs font-semibold border border-slate-300 text-center ${
                  cross.c === c ? `ring-2 ring-inset ${TONE.ring}` : ''
                }`}
                style={{ width: CELL_W }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* ── Les lignes ─────────────────────────────────────────── */}
          {table.rowLabels.map((label, r) => (
            <div key={label} className="absolute left-0 flex" style={{ top: ROW_H * (r + 1), height: ROW_H }}>
              <div
                className={`flex items-center px-2 text-xs font-semibold border border-slate-300 text-slate-700 ${
                  cross.r === r ? `${TONE.band} ring-2 ring-inset ${TONE.ring}` : 'bg-slate-100'
                }`}
                style={{ width: HEAD_W }}
              >
                {label}
              </div>
              {table.colHeaders.map((h, c) => {
                const hit = cross.r === r && cross.c === c;
                const inBand = cross.r === r || cross.c === c;
                const v = cellValue(table, r, c);
                return (
                  <div
                    key={h}
                    aria-hidden="true"
                    className={`flex items-center justify-center border border-slate-300 font-mono text-sm ${
                      hit ? `${TONE.hit} font-bold` : inBand ? `${TONE.band} text-slate-800` : 'bg-white text-slate-800'
                    }`}
                    style={{ width: CELL_W }}
                  >
                    {v === null ? '?' : formatCell(table, v)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── LA PHRASE DE LECTURE : sous la grille, dans le flux ───── */}
      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 min-h-[64px] flex flex-col justify-center gap-0.5">
        <p className="text-xs text-slate-500 text-center">
          Ligne <strong className={TONE.text}>{reading.row}</strong> × colonne{' '}
          <strong className={TONE.text}>{reading.col}</strong>
        </p>
        <p className="font-mono text-base font-bold text-slate-800 text-center">
          {formatCell(table, reading.value)}
        </p>
      </div>

      <p className="text-xs text-slate-500 text-center sm:hidden">
        Pose le doigt sur la grille et fais-le glisser.
      </p>

      <p className="sr-only" role="status" aria-live="polite">
        {a11yText}
      </p>
    </div>
  );
}
