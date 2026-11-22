import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageOff, PenLine, X } from 'lucide-react';
import Modal from '../../../../components/admin/ui/Modal';

/**
 * Les PHOTOS DE COPIE d'une étape — vignettes chargées AVEC le jeton (une
 * balise <img> ne porte pas d'en-tête Authorization : `loader(id, annotated)`
 * rend un Blob, affiché par URL d'objet, libérée au démontage). Un appui
 * agrandit ; une copie annotée par l'enseignant s'ouvre sur l'annotation,
 * l'original à un appui.
 *
 * `onRemove` (avant la réponse seulement) ajoute la croix « Supprimer ».
 * `onAnnotate` (enseignant) ajoute « Corriger sur la photo ».
 */
export default function AnswerImageGallery({ images = [], loader, onRemove = null, onAnnotate = null, size = 'md' }) {
  const { t } = useTranslation('student');
  const [open, setOpen] = useState(null);
  if (!images.length || !loader) return null;
  const box = size === 'sm' ? 'h-16 w-16' : 'h-24 w-24';

  return (
    <div className="flex flex-wrap gap-2" data-answer-images>
      {images.map((image, i) => (
        <div key={image.id} className="relative">
          <button
            type="button"
            onClick={() => setOpen(image)}
            className={`${box} overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-300 hover:ring-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent`}
            aria-label={t('practice.exam.images.open', { n: i + 1 })}
            data-answer-image={image.id}
          >
            <BlobImage loader={loader} id={image.id} annotated={image.annotated} className="h-full w-full object-cover" alt="" />
            {image.annotated && (
              <span className="absolute bottom-1 start-1 rounded bg-rose-600 px-1 text-[10px] font-bold text-white" data-image-annotated>
                {t('practice.exam.images.annotatedBadge')}
              </span>
            )}
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(image.id)}
              className="absolute -end-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow ring-1 ring-slate-300 hover:bg-rose-50 hover:text-rose-700"
              aria-label={t('practice.exam.images.remove', { n: i + 1 })}
              data-remove-image={image.id}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ))}
      <Modal open={open !== null} onClose={() => setOpen(null)} title={t('practice.exam.images.viewerTitle')} closeLabel={t('practice.exam.panelClose')} size="xl">
        {open && <ImageViewer image={open} loader={loader} onAnnotate={onAnnotate ? () => { const target = open; setOpen(null); onAnnotate(target); } : null} />}
      </Modal>
    </div>
  );
}

function ImageViewer({ image, loader, onAnnotate }) {
  const { t } = useTranslation('student');
  const [annotated, setAnnotated] = useState(Boolean(image.annotated));
  return (
    <div className="space-y-3" data-image-viewer>
      <div className="flex flex-wrap items-center gap-2">
        {image.annotated && (
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5" role="group">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setAnnotated(v)}
                aria-pressed={annotated === v}
                className={`rounded-md px-3 py-1.5 text-sm font-bold ${annotated === v ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`}
              >
                {v ? t('practice.exam.images.showAnnotated') : t('practice.exam.images.showOriginal')}
              </button>
            ))}
          </div>
        )}
        {onAnnotate && (
          <button type="button" onClick={onAnnotate} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-rose-700" data-annotate-image>
            <PenLine className="h-4 w-4" aria-hidden="true" /> {t('practice.exam.images.annotate')}
          </button>
        )}
      </div>
      <BlobImage key={`${image.id}:${annotated}`} loader={loader} id={image.id} annotated={annotated} className="mx-auto max-h-[70vh] w-auto rounded-lg ring-1 ring-slate-200" alt={t('practice.exam.images.alt')} />
    </div>
  );
}

/** Une image privée : chargée par le `loader` authentifié, affichée par URL d'objet. */
function BlobImage({ loader, id, annotated = false, className = '', alt = '' }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;
    setFailed(false);
    loader(id, annotated)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [loader, id, annotated]);

  if (failed) return <span className={`flex items-center justify-center text-slate-400 ${className}`}><ImageOff className="h-6 w-6" aria-hidden="true" /></span>;
  if (!url) return <span className={`block animate-pulse bg-slate-200 ${className}`} />;
  return <img src={url} alt={alt} className={className} draggable={false} />;
}
