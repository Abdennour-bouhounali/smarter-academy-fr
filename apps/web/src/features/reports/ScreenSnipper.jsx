import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crop, Hand, Monitor, X } from 'lucide-react';
import { IGNORE_ATTRIBUTE, isMeaningfulRect, normalizeRect } from './screenshot';

/**
 * L'OUTIL DE CAPTURE, comme celui d'un système d'exploitation.
 *
 * La fenêtre de signalement se retire ; une couche transparente couvre la
 * page. Le relecteur DÉFILE librement (molette, ou mode « تمرير » au doigt),
 * puis GLISSE pour tracer la région voulue — ou prend tout l'écran visible.
 * La couche et sa barre portent `data-report-ignore` : elles n'apparaissent
 * jamais dans l'image.
 *
 * @param {(rect: {x,y,width,height}) => void} onSelect  rectangle en coordonnées de la fenêtre
 * @param {() => void} onFullScreen
 * @param {() => void} onCancel
 * @param {boolean} busy  la capture est en cours
 */
export default function ScreenSnipper({ onSelect, onFullScreen, onCancel, busy = false }) {
  const { t } = useTranslation('common');
  // Au doigt, glisser fait défiler : on part en mode « تمرير », on bascule
  // en « تحديد » pour tracer. À la souris, la molette défile déjà.
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  const [mode, setMode] = useState(coarse ? 'scroll' : 'select');
  const [rect, setRect] = useState(null);
  const start = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') { event.stopPropagation(); onCancel(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onCancel]);

  const point = (event) => ({ x: event.clientX, y: event.clientY });

  const down = (event) => {
    if (mode !== 'select' || busy) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    start.current = point(event);
    setRect(null);
  };
  const move = (event) => {
    if (!start.current) return;
    setRect(normalizeRect(start.current, point(event)));
  };
  const up = (event) => {
    if (!start.current) return;
    const selected = normalizeRect(start.current, point(event));
    start.current = null;
    if (isMeaningfulRect(selected, 12)) {
      setRect(selected);
      onSelect(selected);
    } else {
      setRect(null);
    }
  };

  const ignore = { [IGNORE_ATTRIBUTE]: '' };
  const toolButton = 'inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-sm font-bold';

  return (
    <div {...ignore} className="pointer-events-none fixed inset-0 z-[110]" data-screen-snipper>
      {/* La couche de sélection. Sans fond plein : la page reste lisible ; la
          région tracée est mise en valeur par l'ombre qui assombrit le reste. */}
      <div
        {...ignore}
        role="presentation"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => { start.current = null; setRect(null); }}
        className={`absolute inset-0 ${mode === 'select' ? 'pointer-events-auto cursor-crosshair touch-none bg-slate-900/10' : 'pointer-events-none'}`}
      >
        {rect && (
          <div
            className="pointer-events-none absolute rounded-sm border-2 border-rose-600"
            style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height, boxShadow: '0 0 0 9999px rgba(15,23,42,0.35)' }}
          />
        )}
      </div>

      {/* La barre d'outils, en haut au centre. */}
      <div
        {...ignore}
        className="pointer-events-auto absolute inset-x-0 top-3 mx-auto flex w-fit max-w-[calc(100%-2rem)] flex-wrap items-center justify-center gap-2 rounded-2xl bg-slate-900/90 px-3 py-2 text-white shadow-xl"
        role="toolbar"
        aria-label={t('report.snip.toolbar')}
      >
        <span className="px-1 text-xs sm:text-sm" aria-live="polite">
          {busy ? t('report.screenshot.capturing') : mode === 'select' ? t('report.snip.hintSelect') : t('report.snip.hintScroll')}
        </span>
        <div className="flex rounded-lg bg-white/10 p-0.5" role="group">
          <button type="button" onClick={() => setMode('scroll')} aria-pressed={mode === 'scroll'} className={`${toolButton} ${mode === 'scroll' ? 'bg-white text-slate-900' : 'text-white'}`} data-snip-mode="scroll">
            <Hand size={16} aria-hidden="true" /> {t('report.snip.scroll')}
          </button>
          <button type="button" onClick={() => setMode('select')} aria-pressed={mode === 'select'} className={`${toolButton} ${mode === 'select' ? 'bg-white text-slate-900' : 'text-white'}`} data-snip-mode="select">
            <Crop size={16} aria-hidden="true" /> {t('report.snip.select')}
          </button>
        </div>
        <button type="button" onClick={onFullScreen} disabled={busy} className={`${toolButton} bg-white/10 hover:bg-white/20`} data-snip-full>
          <Monitor size={16} aria-hidden="true" /> {t('report.snip.fullScreen')}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className={`${toolButton} bg-rose-600 hover:bg-rose-700`} data-snip-cancel>
          <X size={16} aria-hidden="true" /> {t('report.snip.cancel')}
        </button>
      </div>
    </div>
  );
}
