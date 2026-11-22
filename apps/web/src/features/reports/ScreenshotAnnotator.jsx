import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eraser, Trash2 } from 'lucide-react';
import { drawMarks, isMeaningfulRect, normalizeRect, MARK_COLOR } from './screenshot';

/**
 * Encadrer la zone fautive sur la capture — au doigt comme à la souris.
 *
 * L'image source est un <canvas> (capture de page ou image choisie). Le
 * relecteur glisse pour tracer un cadre rouge ; plusieurs cadres sont
 * possibles. Les cadres sont tenus en coordonnées de L'IMAGE (pas de
 * l'écran) : l'affichage peut être réduit, l'export les brûle à la bonne
 * place (screenshot.js › exportAnnotated).
 *
 * @param {HTMLCanvasElement} source
 * @param {Array<{x,y,width,height}>} rects
 * @param {(rects) => void} onChange
 * @param {() => void} onRemove
 */
export default function ScreenshotAnnotator({ source, rects, onChange, onRemove }) {
  const { t } = useTranslation('common');
  const canvasRef = useRef(null);
  const start = useRef(null);
  const [draft, setDraft] = useState(null);

  // Redessine l'image et les cadres (y compris celui en cours de tracé).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source) return;
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);
    drawMarks(ctx, draft ? [...rects, draft] : rects);
  }, [source, rects, draft]);

  // Position du pointeur dans les coordonnées de l'image.
  const toImage = useCallback((event) => {
    const canvas = canvasRef.current;
    const box = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) / box.width) * canvas.width,
      y: ((event.clientY - box.top) / box.height) * canvas.height,
    };
  }, []);

  const onPointerDown = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    start.current = toImage(event);
    setDraft(null);
  };

  const onPointerMove = (event) => {
    if (!start.current) return;
    setDraft(normalizeRect(start.current, toImage(event)));
  };

  const onPointerUp = (event) => {
    if (!start.current) return;
    const rect = normalizeRect(start.current, toImage(event));
    start.current = null;
    setDraft(null);
    if (isMeaningfulRect(rect)) onChange([...rects, rect]);
  };

  return (
    <div className="space-y-2" data-screenshot-annotator>
      <p className="font-inter text-xs text-slate-500">
        <span className="me-1 inline-block h-2.5 w-2.5 rounded-sm border-2 align-middle" style={{ borderColor: MARK_COLOR }} aria-hidden="true" />
        {t('report.screenshot.markHint')}
      </p>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={t('report.screenshot.canvasLabel', { count: rects.length })}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { start.current = null; setDraft(null); }}
        className="block h-auto w-full cursor-crosshair touch-none rounded-lg border border-slate-200"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([])}
          disabled={rects.length === 0}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 px-3 font-inter text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <Eraser size={14} aria-hidden="true" /> {t('report.screenshot.clear')}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-rose-200 px-3 font-inter text-xs font-semibold text-rose-700 hover:bg-rose-50"
        >
          <Trash2 size={14} aria-hidden="true" /> {t('report.screenshot.remove')}
        </button>
      </div>
    </div>
  );
}
