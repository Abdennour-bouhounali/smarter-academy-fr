import React, { useCallback, useRef, useState } from 'react';

/**
 * PaveLab — poser des carreaux-unités AU DOIGT, en balayant la surface.
 *
 * ACTION       l'élève appuie sur la figure et BALAIE : chaque carreau
 *              touché se pose sous son doigt (un vrai geste de carreleur,
 *              pas un tap par cellule).
 * CHANGE       le compte de carreaux posés monte à chaque carreau touché,
 *              en direct, sans clic de validation.
 * OBSERVATION  la figure se remplit ; deux figures de formes très
 *              différentes peuvent demander le même nombre de carreaux.
 * SENS         mesurer une aire = compter combien de fois l'unité de
 *              surface recouvre la figure. Le nombre EST le compte.
 *
 * Pourquoi un balayage et non `AreaGrid` (tap cellule par cellule) : paver
 * 14 carreaux au tap, c'est 14 clics et zéro geste ; le carreleur pose les
 * carreaux d'un mouvement continu. Le geste EST le recouvrement
 * (INTERACTION_PEDAGOGY §16, règle projet du 2026-09-06).
 *
 * Le composant est un affichage contrôlé pur : le module possède `cells`.
 * Aucune prop `disabled` — la manipulation ne se fige jamais après
 * validation de l'étape ; `readOnly` est réservé aux figures d'illustration.
 *
 * Accessibilité : chaque carreau reste un bouton focalisable (le pavage se
 * fait donc entièrement au clavier), et le compte vit dans le DOM sous
 * `role="status"`, jamais dans un <text> SVG.
 */
const TONES = {
  emerald: { fill: '#10b981', stroke: '#047857', soft: '#d1fae5' },
  sky: { fill: '#0ea5e9', stroke: '#0369a1', soft: '#e0f2fe' },
  violet: { fill: '#8b5cf6', stroke: '#6d28d9', soft: '#ede9fe' },
  amber: { fill: '#f59e0b', stroke: '#b45309', soft: '#fef3c7' },
};

export default function PaveLab({
  rows,
  cols,
  cells = [],
  onPave,            // (index) => void — un carreau vient d'être touché
  onUnpave = null,   // (index) => void — retirer (mode gomme)
  outline = null,    // indices appartenant à la figure ; les autres sont hors-figure
  cellSize = 34,
  minCellSize = 18,
  tone = 'emerald',
  unit = 'carreau',
  readOnly = false,
  ariaLabel = 'Surface à paver',
}) {
  const t = TONES[tone] ?? TONES.emerald;
  /* Taille de carreau adaptée à la largeur réellement disponible : à 375 px
     un quadrillage de 12 colonnes à 34 px déborderait de la colonne de
     contenu. On mesure, on ne suppose pas (§6ter.5). */
  const wrapRef = useRef(null);
  const [cell, setCell] = useState(cellSize);
  React.useEffect(() => {
    const fit = () => {
      const w = wrapRef.current?.clientWidth;
      if (!w) return;
      setCell(Math.max(minCellSize, Math.min(cellSize, Math.floor((w - 4) / cols))));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [cols, cellSize, minCellSize]);
  const painting = useRef(false);
  const eraseMode = useRef(false);
  const [erasing, setErasing] = useState(false);

  const inFigure = useCallback((i) => !outline || outline.includes(i), [outline]);
  const total = outline ? outline.length : rows * cols;
  const posed = cells.length;

  /* Un balayage : on décide au premier carreau si l'on pose ou si l'on
     retire, puis on garde ce mode jusqu'au relâchement — sinon le doigt
     poserait et retirerait alternativement sur le même carreau. */
  const touch = useCallback((i) => {
    if (readOnly || !inFigure(i)) return;
    if (eraseMode.current) {
      if (cells.includes(i)) onUnpave?.(i);
    } else if (!cells.includes(i)) {
      onPave?.(i);
    }
  }, [cells, inFigure, onPave, onUnpave, readOnly]);

  const begin = (i) => (e) => {
    if (readOnly) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    painting.current = true;
    eraseMode.current = !!onUnpave && cells.includes(i);
    setErasing(eraseMode.current);
    touch(i);
  };

  const over = (e) => {
    if (!painting.current || readOnly) return;
    // `elementFromPoint` suit le doigt d'un carreau à l'autre : la capture
    // de pointeur garde les événements sur le carreau de départ, donc c'est
    // la seule façon de savoir sur QUEL carreau le doigt se trouve.
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const idx = el?.closest?.('[data-cell]')?.getAttribute('data-cell');
    if (idx != null) touch(Number(idx));
  };

  const end = (e) => {
    if (readOnly) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    painting.current = false;
    eraseMode.current = false;
    setErasing(false);
  };

  return (
    <div className="space-y-2">
      <div className="w-full" ref={wrapRef}>
        <div
          className="inline-block rounded-xl"
          role="group"
          aria-label={ariaLabel}
          style={{ touchAction: 'none' }}
        >
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex">
              {Array.from({ length: cols }).map((_, c) => {
                const i = r * cols + c;
                const fig = inFigure(i);
                const on = cells.includes(i);
                return (
                  <div
                    key={c}
                    data-cell={i}
                    aria-hidden="true"
                    onPointerDown={fig ? begin(i) : undefined}
                    onPointerMove={fig ? over : undefined}
                    onPointerUp={fig ? end : undefined}
                    onPointerCancel={fig ? end : undefined}
                    className="border transition-colors"
                    style={{
                      width: cell,
                      height: cell,
                      background: !fig ? '#f1f5f9' : on ? t.fill : '#ffffff',
                      borderColor: !fig ? '#e2e8f0' : on ? t.stroke : '#cbd5e1',
                      opacity: fig ? 1 : 0.35,
                      cursor: readOnly || !fig ? 'default' : erasing ? 'crosshair' : 'pointer',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {!readOnly && (
        <div className="flex flex-wrap gap-1.5 justify-center" role="group" aria-label="Poser une rangée entière (accès clavier)">
          {Array.from({ length: rows }).map((_, r) => {
            const idx = Array.from({ length: cols }, (_, c) => r * cols + c).filter(inFigure);
            if (idx.length === 0) return null;
            const allOn = idx.every((i) => cells.includes(i));
            return (
              <button
                key={r}
                type="button"
                aria-pressed={allOn}
                aria-label={`Rangée ${r + 1}${allOn ? ', posée' : ''}`}
                onClick={() => idx.forEach((i) => (allOn ? onUnpave?.(i) : onPave?.(i)))}
                className={`min-h-[44px] min-w-[44px] px-2 rounded-lg border-2 text-xs font-mono font-bold transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${allOn ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}`}
              >
                {allOn ? '✓' : '+'} L{r + 1}
              </button>
            );
          })}
        </div>
      )}

      <div className="text-center" role="status" aria-live="polite">
        <span className="font-mono font-black text-2xl text-slate-800">{posed}</span>
        <span className="text-sm text-slate-500"> / {total} {unit}{total > 1 ? 'x' : ''} posé{posed > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
