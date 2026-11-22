import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eraser, Loader2, Save, Undo2 } from 'lucide-react';
import Modal from '../../../components/admin/ui/Modal';

const RED = '#dc2626';
const WIDTHS = [3, 6, 10];

/**
 * « صحّح على الصورة » — le stylo rouge de l'enseignant sur la photo de copie
 * (décision du propriétaire, 2026-10-06). La photo est dessinée sur un canevas
 * à sa taille réelle, les traits par-dessus ; « احفظ » compose une NOUVELLE
 * image (JPEG) envoyée à part : l'original de l'élève ne change jamais.
 * Part de la version déjà annotée s'il y en a une.
 *
 * `loader(id, annotated)` → Blob ; `onSave(blob)` envoie (le parent appelle
 * l'API) ; doigt, stylet ou souris (Pointer Events, `touch-action: none`).
 */
export default function AnnotationEditor({ image, loader, onSave, onClose }) {
  const { t } = useTranslation('teacher');
  const canvasRef = useRef(null);
  const photoRef = useRef(null);
  const strokesRef = useRef([]);
  const drawingRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(0);
  const [width, setWidth] = useState(WIDTHS[1]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    if (!canvas || !photo) return;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = RED;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of [...strokesRef.current, drawingRef.current].filter(Boolean)) {
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      stroke.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      if (stroke.points.length === 1) ctx.lineTo(stroke.points[0][0] + 0.1, stroke.points[0][1]);
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let url = null;
    loader(image.id, Boolean(image.annotated))
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        const photo = new Image();
        photo.onload = () => {
          if (cancelled) return;
          photoRef.current = photo;
          const canvas = canvasRef.current;
          canvas.width = photo.naturalWidth;
          canvas.height = photo.naturalHeight;
          setReady(true);
          redraw();
        };
        photo.src = url;
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [image, loader, redraw]);

  // Coordonnées du pointeur → pixels de la photo (le canevas est réduit à l'écran).
  const point = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // Le trait suit l'échelle d'affichage : un trait de 6 px reste de 6 px à l'écran.
    return [((e.clientX - rect.left) * canvas.width) / rect.width, ((e.clientY - rect.top) * canvas.height) / rect.height];
  };
  const scale = () => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    return rect?.width ? canvas.width / rect.width : 1;
  };

  const down = (e) => {
    if (!ready || saving) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = { width: width * scale(), points: [point(e)] };
    redraw();
  };
  const move = (e) => {
    if (!drawingRef.current) return;
    drawingRef.current.points.push(point(e));
    redraw();
  };
  const up = () => {
    if (!drawingRef.current) return;
    strokesRef.current = [...strokesRef.current, drawingRef.current];
    drawingRef.current = null;
    setCount(strokesRef.current.length);
    redraw();
  };

  const undo = () => { strokesRef.current = strokesRef.current.slice(0, -1); setCount(strokesRef.current.length); redraw(); };
  const clear = () => { strokesRef.current = []; setCount(0); redraw(); };

  const save = async () => {
    setSaving(true);
    setError(false);
    try {
      const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve, 'image/jpeg', 0.88));
      if (!blob) throw new Error('canvas');
      await onSave(blob);
      onClose();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const tool = 'inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50';

  return (
    <Modal open onClose={onClose} title={t('reviews.annotate.title')} closeLabel={t('common.close')} size="xl">
      <div className="space-y-3" data-annotation-editor>
        <p className="text-sm text-slate-600">{t('reviews.annotate.help')}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{t('reviews.annotate.width')}</span>
          {WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWidth(w)}
              aria-pressed={width === w}
              aria-label={`${t('reviews.annotate.width')} ${w}`}
              className={`flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${width === w ? 'bg-rose-50 ring-rose-400' : 'bg-white ring-slate-300'}`}
            >
              <span className="rounded-full bg-red-600" style={{ width: w + 2, height: w + 2 }} />
            </button>
          ))}
          <button type="button" className={tool} onClick={undo} disabled={count === 0 || saving} data-annotation-undo>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> {t('reviews.annotate.undo')}
          </button>
          <button type="button" className={tool} onClick={clear} disabled={count === 0 || saving}>
            <Eraser className="h-4 w-4" aria-hidden="true" /> {t('reviews.annotate.clear')}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!ready || count === 0 || saving}
            className="ms-auto inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
            data-annotation-save
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {saving ? t('reviews.annotate.saving') : t('reviews.annotate.save')}
          </button>
        </div>
        <div className="flex justify-center rounded-lg bg-slate-100 p-2">
          {!ready && !error && <div className="h-64 w-full animate-pulse rounded bg-slate-200" />}
          <canvas
            ref={canvasRef}
            className={`max-h-[65vh] max-w-full cursor-crosshair rounded bg-white shadow ${ready ? '' : 'hidden'}`}
            style={{ touchAction: 'none' }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            data-annotation-canvas
          />
        </div>
        {error && <p className="text-sm font-semibold text-rose-700" role="alert">{t('reviews.annotate.error')}</p>}
      </div>
    </Modal>
  );
}
