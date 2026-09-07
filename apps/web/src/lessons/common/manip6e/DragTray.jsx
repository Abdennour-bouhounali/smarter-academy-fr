import React, { useCallback, useRef, useState } from 'react';

/**
 * DragTray — prendre un objet dans une réserve et le POSER dans une zone.
 *
 * Le pendant discret de `useDragValue` : quand la grandeur ne varie pas de
 * façon continue mais se compte (des blocs de numération, des jetons, des
 * parts), la manipulation juste n'est pas un curseur, c'est un DÉPLACEMENT
 * d'objet. L'élève attrape un bloc « centaine » et le pose dans la colonne
 * des centaines ; le nombre change parce que l'objet a bougé, pas parce qu'un
 * compteur a été incrémenté (règle projet du 2026-09-06 : jamais de +/−).
 *
 * Le composant ne connaît aucune mathématique. Il gère le geste (pointeur ET
 * clavier) et signale « tel objet a été déposé dans telle zone » ; la leçon
 * décide de ce que cela veut dire.
 *
 * Accessibilité — la manipulation est intégralement faisable au clavier :
 * chaque objet de la réserve est un bouton ; l'activer le « prend » (état
 * `held`), puis activer une zone l'y dépose. Un lecteur d'écran annonce donc
 * une séquence prendre → poser, équivalente au glisser-déposer.
 *
 * @param {Array}  sources  [{ id, label, node, hint? }] les objets à prendre
 * @param {Array}  zones    [{ id, label, node, accepts? }] les zones d'accueil
 * @param {func}   onDrop   (sourceId, zoneId) => void
 * @param {func}   [onRemove] (zoneId) => void — retirer le dernier objet posé
 * @param {bool}   [locked=false]
 */
export default function DragTray({
  sources,
  zones,
  onDrop,
  onRemove,
  locked = false,
  sourcesLabel = 'À prendre',
  zonesLabel = 'À remplir',
  className = '',
}) {
  // `held` sert au clavier ET au pointeur : c'est l'objet actuellement en main.
  const [held, setHeld] = useState(null);
  const [hoverZone, setHoverZone] = useState(null);
  const pointerActive = useRef(false);

  const take = useCallback((id) => {
    if (locked) return;
    setHeld((cur) => (cur === id ? null : id));
  }, [locked]);

  const drop = useCallback((zoneId) => {
    if (locked || !held) return;
    const zone = zones.find((z) => z.id === zoneId);
    // `accepts` laisse la leçon refuser un dépôt — et c'est une contrainte qui
    // ENSEIGNE (on ne pose pas une dizaine dans la colonne des unités).
    if (zone?.accepts && !zone.accepts(held)) return;
    onDrop(held, zoneId);
    setHeld(null);
    setHoverZone(null);
  }, [held, locked, onDrop, zones]);

  /* Pointeur : on prend au pointerdown, on suit, on dépose sur la zone
     survolée. `elementFromPoint` évite d'avoir à câbler un événement par
     zone et fonctionne au doigt comme à la souris. */
  const beginPointer = (id) => (e) => {
    if (locked) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointerActive.current = true;
    setHeld(id);
  };
  const movePointer = (e) => {
    if (!pointerActive.current || locked) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const zone = el?.closest?.('[data-drop-zone]');
    setHoverZone(zone ? zone.getAttribute('data-drop-zone') : null);
  };
  const endPointer = (e) => {
    if (!pointerActive.current || locked) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    pointerActive.current = false;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const zone = el?.closest?.('[data-drop-zone]');
    if (zone) drop(zone.getAttribute('data-drop-zone'));
    else setHeld(null);
    setHoverZone(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ── La réserve ─────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          {sourcesLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {sources.map((s) => {
            const isHeld = held === s.id;
            return (
              <button
                key={s.id}
                type="button"
                disabled={locked}
                aria-pressed={isHeld}
                aria-label={`${s.label}${isHeld ? ' — en main, choisis une zone' : ''}`}
                onPointerDown={beginPointer(s.id)}
                onPointerMove={movePointer}
                onPointerUp={endPointer}
                onPointerCancel={endPointer}
                onClick={() => take(s.id)}
                className={`min-h-[44px] px-3 py-2 rounded-xl border-2 transition-all select-none
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${isHeld
                    ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                    : 'border-slate-200 bg-white hover:border-blue-300'}`}
                style={{ touchAction: 'none', cursor: locked ? 'default' : 'grab' }}
              >
                {s.node ?? s.label}
              </button>
            );
          })}
        </div>
        {held && (
          <p className="text-xs text-blue-700 mt-1.5 font-semibold" role="status">
            En main. Dépose-le dans une zone ci-dessous.
          </p>
        )}
      </div>

      {/* ── Les zones d'accueil ────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          {zonesLabel}
        </p>
        {/* §17 — À 375 px, quatre colonnes donnent 85 px par zone : trop étroit
            pour une étiquette et deux boutons de 44 px. On laisse la grille
            choisir son nombre de colonnes selon la place réelle. */}
        <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
          {zones.map((z) => {
            const refused = held && z.accepts && !z.accepts(held);
            const active = hoverZone === z.id && !refused;
            return (
              <div
                key={z.id}
                data-drop-zone={z.id}
                className={`rounded-xl border-2 border-dashed p-2 min-h-[104px] flex flex-col items-center justify-center gap-1 transition-colors
                  ${active ? 'border-blue-500 bg-blue-50'
                    : refused ? 'border-rose-200 bg-rose-50/40'
                    : 'border-slate-200 bg-slate-50/60'}`}
              >
                <span className="text-[11px] font-mono font-bold text-slate-500">{z.label}</span>
                {z.node}
                {!locked && (
                  <div className="flex gap-1">
                    {/* 44 px minimum, y compris pour ces deux boutons de
                        réglage : ce sont les seules cibles tactiles du chemin
                        clavier / doigt d'une zone (INTERACTION_PEDAGOGY §17,
                        règle projet 4). Ils étaient à 32 px. */}
                    <button
                      type="button"
                      onClick={() => drop(z.id)}
                      disabled={!held || refused}
                      className="min-h-[44px] px-2 rounded-lg text-[11px] font-bold border border-slate-200 bg-white text-slate-600 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      Poser ici
                    </button>
                    {onRemove && (
                      <button
                        type="button"
                        onClick={() => onRemove(z.id)}
                        aria-label={`Retirer un objet de ${z.label}`}
                        className="min-h-[44px] px-2 rounded-lg text-[11px] font-bold border border-slate-200 bg-white text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
