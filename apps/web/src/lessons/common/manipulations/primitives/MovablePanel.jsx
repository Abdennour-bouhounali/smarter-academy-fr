import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, RotateCcw } from 'lucide-react';
import { clampOffset, keyStep, readStored, writeStored } from './movablePanel';

/**
 * UN PANNEAU QUE L'ÉLÈVE DÉPLACE — pour voir ce qu'il cachait (MANIPULATION_CONTRACT §8bis, règle du
 * propriétaire 2026-10-01). Dans une grande activité, une jauge, une légende ou la ligne écrite peut
 * flotter SUR la scène pour que tout tienne dans un écran ; si elle couvre ce que l'élève veut voir,
 * il la déplace (poignée ⠿ : glisser au doigt / à la souris, flèches au clavier, Maj + flèche = grand
 * pas) ou la remet à sa place (↺). Le panneau reste toujours entier dans son conteneur.
 *
 *   <div ref={sceneRef} className="relative">…scène…
 *     <MovablePanel id="pair-scoreboard.gauges" bounds={sceneRef} title={k('gauges')} className="absolute bottom-2 start-2">
 *       …jauges…
 *     </MovablePanel>
 *   </div>
 *
 * - `bounds` : ref du conteneur (la scène) ; sans lui, le parent direct ;
 * - position retenue par navigateur sous `sa-lab-move:<id>` (bornée de nouveau au montage) ;
 * - ce n'est PAS un geste mathématique : déplacer un panneau ne change aucun état du lab, il n'est
 *   jamais une réponse. Le geste mathématique reste `useDragInteraction` / `useStretchInteraction`.
 */
export default function MovablePanel({ id = null, bounds = null, title, children, className = '' }) {
  const { t } = useTranslation('lesson');
  const key = id ? `sa-lab-move:${id}` : null;
  const ref = useRef(null);
  const drag = useRef(null);
  const [offset, setOffset] = useState(() => readStored(key, { x: 0, y: 0 }) ?? { x: 0, y: 0 });

  /** Le rectangle d'origine (sans décalage) et celui du conteneur. */
  const rects = useCallback((current) => {
    const el = ref.current;
    const box = (bounds?.current ?? el?.parentElement)?.getBoundingClientRect();
    if (!el || !box) return null;
    const r = el.getBoundingClientRect();
    return { panel: { left: r.left - current.x, right: r.right - current.x, top: r.top - current.y, bottom: r.bottom - current.y }, box };
  }, [bounds]);

  const place = useCallback((next) => {
    setOffset((cur) => {
      const g = rects(cur);
      const v = g ? clampOffset(next, g.panel, g.box) : next;
      writeStored(key, v);
      return v;
    });
  }, [key, rects]);

  // Au montage et au redimensionnement : un panneau mémorisé hors du nouveau cadre revient dedans.
  useEffect(() => {
    const fit = () => setOffset((cur) => { const g = rects(cur); return g ? clampOffset(cur, g.panel, g.box) : cur; });
    fit();
    globalThis.addEventListener?.('resize', fit);
    return () => globalThis.removeEventListener?.('resize', fit);
  }, [rects]);

  const onPointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    place({ x: drag.current.ox + e.clientX - drag.current.sx, y: drag.current.oy + e.clientY - drag.current.sy });
  };
  const onPointerUp = () => { drag.current = null; };
  const onKeyDown = (e) => {
    const s = keyStep(e.key, e.shiftKey);
    if (!s) return;
    e.preventDefault();
    place({ x: offset.x + s.x, y: offset.y + s.y });
  };

  return (
    <div ref={ref} className={`z-10 rounded-xl border border-slate-300 bg-white/95 shadow-md ${className}`.trim()}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} data-movable-panel={id ?? ''}>
      <div className="flex items-center gap-1 border-b border-slate-200 px-1">
        <button type="button" aria-label={t('manipulation.layout.move', { title: typeof title === 'string' ? title : '' })}
          title={t('manipulation.layout.moveHint')} data-movable-handle
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKeyDown}
          className="inline-flex min-h-[44px] min-w-[44px] cursor-grab touch-none items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
          <GripVertical size={18} aria-hidden="true" />
        </button>
        {title && <span className="truncate text-xs font-bold text-slate-600">{title}</span>}
        {(offset.x !== 0 || offset.y !== 0) && (
          <button type="button" onClick={() => place({ x: 0, y: 0 })} aria-label={t('manipulation.layout.backToPlace')} title={t('manipulation.layout.backToPlace')}
            data-movable-reset className="ms-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}
