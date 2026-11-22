import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, ImagePlus, Loader2 } from 'lucide-react';
import AnswerImageGallery from './AnswerImageGallery';
import { MAX_IMAGES_PER_STEP, imageErrorKey, prepareAnswerImage } from './answerImages';

/**
 * « أرفق صورة ورقتك » — jusqu'à 3 photos de la copie manuscrite, À CÔTÉ de la
 * saisie (le propriétaire : saisie, photo, ou les deux). Sur téléphone
 * « صوّر » ouvre l'appareil photo (`capture="environment"`) ; « اختر صورة »
 * prend un fichier (ordinateur, galerie). Chaque photo part tout de suite
 * (réduite à 1600 px) et se retire tant que l'étape n'est pas répondue ;
 * ensuite elle est verrouillée avec la réponse.
 *
 * `onAdd(blob)` / `onRemove(id)` parlent au serveur (le lecteur) ; ce
 * composant ne garde que l'état d'envoi et le message d'erreur.
 */
export default function AnswerImagePicker({ images, loader, onAdd, onRemove, disabled = false }) {
  const { t } = useTranslation('student');
  const camera = useRef(null);
  const file = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const full = images.length >= MAX_IMAGES_PER_STEP;

  const pick = async (event) => {
    const chosen = Array.from(event.target.files ?? []).slice(0, MAX_IMAGES_PER_STEP - images.length);
    event.target.value = '';
    if (!chosen.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const f of chosen) {
        await onAdd(await prepareAnswerImage(f));
      }
    } catch (e) {
      setError(imageErrorKey(e?.code));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setError(null);
    try {
      await onRemove(id);
    } catch (e) {
      setError(imageErrorKey(e?.code));
    }
  };

  const button = 'inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-sans text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="w-full basis-full space-y-2" data-answer-image-picker>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-600">{t('practice.exam.images.label')}</span>
        <button type="button" className={button} onClick={() => camera.current?.click()} disabled={disabled || busy || full} data-image-camera>
          <Camera className="h-4 w-4" aria-hidden="true" /> {t('practice.exam.images.camera')}
        </button>
        <button type="button" className={button} onClick={() => file.current?.click()} disabled={disabled || busy || full} data-image-file>
          <ImagePlus className="h-4 w-4" aria-hidden="true" /> {t('practice.exam.images.file')}
        </button>
        {busy && <Loader2 className="h-4 w-4 animate-spin text-slate-500" aria-label={t('practice.exam.images.uploading')} />}
        <span className="text-xs text-slate-500" data-image-count>
          <bdi dir="ltr">{images.length}{'\u00A0/\u00A0'}{MAX_IMAGES_PER_STEP}</bdi>
        </span>
        <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} data-image-input="camera" />
        <input ref={file} type="file" accept="image/*" multiple className="hidden" onChange={pick} data-image-input="file" />
      </div>
      <AnswerImageGallery images={images} loader={loader} onRemove={disabled ? null : remove} size="sm" />
      {error && <p className="text-sm font-semibold text-rose-700" role="alert" data-image-error={error}>{t(`practice.exam.images.errors.${error}`)}</p>}
    </div>
  );
}
