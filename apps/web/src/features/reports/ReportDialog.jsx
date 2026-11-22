import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Check, TriangleAlert, Camera, ImagePlus, Send } from 'lucide-react';
import { REPORT_CATEGORIES } from '../../services/reportService';
import ScreenshotAnnotator from './ScreenshotAnnotator';
import { captureRegion, capturePage, loadImageFile, exportAnnotated, IGNORE_ATTRIBUTE } from './screenshot';
import ScreenSnipper from './ScreenSnipper';

/**
 * Le formulaire de signalement.
 *
 * Boîte de dialogue et non panneau en ligne : le signalement peut partir du
 * sommaire d'une leçon comme du bas d'un module, et une fenêtre centrée se
 * comporte pareil dans les deux cas — un panneau, lui, dépend de la place
 * qu'il reste autour de lui.
 *
 * Accessibilité tenue ici plutôt que laissée à l'appelant : role="dialog" +
 * aria-modal, focus déplacé dedans à l'ouverture et rendu au déclencheur à la
 * fermeture, Échap ferme, Tab reste piégé, et les catégories sont de VRAIS
 * boutons radio (radiogroup) — pas des <div> cliquables, qui ne se
 * parcourent pas aux flèches.
 *
 * CAPTURE D'ÉCRAN (facultative, 2026-10-05) : « Capturer la page » photographie
 * la partie visible de la page SANS cette fenêtre (attribut
 * data-report-ignore), « Envoyer une image » prend une image du relecteur ; dans les
 * deux cas il encadre la zone fautive (ScreenshotAnnotator) et les cadres
 * sont brûlés dans l'image à l'envoi.
 *
 * HIÉRARCHIE (2026-10-08, demande propriétaire) : le MESSAGE (obligatoire) et
 * la CAPTURE sont le cœur de la fenêtre, élargie à max-w-3xl ; le type de
 * problème descend en pastilles facultatives — sans choix, « other » part au
 * serveur. Une image se colle (Ctrl+V) ou se dépose aussi sur la zone.
 */
const NOTE_MIN_LENGTH = 3;

export default function ReportDialog({ open, onClose, onSubmit, busy, error, submitted }) {
  const { t } = useTranslation('common');
  const [category, setCategory] = useState(null);
  const [note, setNote] = useState('');
  const [shot, setShot] = useState(null);
  const [marks, setMarks] = useState([]);
  const [capturing, setCapturing] = useState(false);
  // L'outil de capture est ouvert : la fenêtre se RETIRE (ni fond, ni piège à
  // focus, ni défilement bloqué) le temps que le relecteur choisisse sa région.
  const [snipping, setSnipping] = useState(false);
  const active = open && !snipping;
  const [shotError, setShotError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const panelRef = useRef(null);
  const noteRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    previouslyFocused.current = document.activeElement;
    // Le focus va sur le message, seul champ obligatoire : l'élève écrit tout
    // de suite. Au retour de l'outil de capture, le message déjà écrit garde
    // sa place — le curseur revient à la fin.
    const timer = setTimeout(() => (noteRef.current ?? panelRef.current)?.focus(), 0);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab') return;

      // Piège à focus : sans lui, Tab sort de la fenêtre et l'élève tabule
      // dans la leçon derrière, invisible.
      const focusables = panelRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [active, onClose]);

  // Repart d'une page blanche à chaque ouverture : un choix laissé d'une fois
  // sur l'autre serait pris pour le signalement en cours.
  useEffect(() => {
    if (open) {
      setCategory(null);
      setNote('');
      setShot(null);
      setMarks([]);
      setShotError(null);
      setSnipping(false);
    }
  }, [open]);

  if (!open) return null;

  const adoptCanvas = (canvas) => {
    setShot(canvas);
    setMarks([]);
    setShotError(null);
  };

  // « Capturer une zone » : la fenêtre se retire, l'outil de capture prend la
  // main ; la région choisie revient dans la fenêtre, qui réapparaît.
  const capture = () => {
    setShotError(null);
    setSnipping(true);
  };

  const finishCapture = async (take) => {
    setCapturing(true);
    try {
      adoptCanvas(await take());
    } catch {
      setShotError(t('report.screenshot.captureFailed'));
    } finally {
      setCapturing(false);
      setSnipping(false);
    }
  };

  const adoptFile = async (file) => {
    if (!file) return;
    try {
      adoptCanvas(await loadImageFile(file));
    } catch {
      setShotError(t('report.screenshot.unsupported'));
    }
  };

  const pickFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    adoptFile(file);
  };

  // Ctrl+V d'une capture faite avec l'outil du système : l'image arrive
  // directement, sans passer par un fichier.
  const pasteImage = (event) => {
    const file = [...(event.clipboardData?.files ?? [])].find((f) => f.type.startsWith('image/'));
    if (!file) return;
    event.preventDefault();
    adoptFile(file);
  };

  const dropImage = (event) => {
    event.preventDefault();
    setDragging(false);
    adoptFile(event.dataTransfer?.files?.[0]);
  };

  const noteReady = note.trim().length >= NOTE_MIN_LENGTH;

  const submit = async (event) => {
    event.preventDefault();
    if (!noteReady || busy) return;
    const screenshot = shot ? await exportAnnotated(shot, marks) : null;
    onSubmit({ category: category ?? 'other', note: note.trim(), screenshot });
  };

  // Rendu dans <body> (portail) : le bouton vit dans la rangée de repères
  // du module, qui forme son propre contexte d'empilement — sans portail, la
  // barre de navigation du site passait PAR-DESSUS la fenêtre et l'outil.
  const portal = (node) => (typeof document === 'undefined' ? node : createPortal(node, document.body));

  if (snipping) {
    return portal(
      <ScreenSnipper
        busy={capturing}
        onSelect={(rect) => finishCapture(() => captureRegion(rect))}
        onFullScreen={() => finishCapture(() => capturePage())}
        onCancel={() => setSnipping(false)}
      />,
    );
  }

  return portal(
    <div
      {...{ [IGNORE_ATTRIBUTE]: '' }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        // onMouseDown et non onClick : un glissement commencé DANS la fenêtre
        // et relâché sur le fond la fermerait.
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        tabIndex={-1}
        onPaste={pasteImage}
        className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white shadow-xl outline-none sm:rounded-2xl"
      >
        {submitted ? (
          <div className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check size={22} aria-hidden="true" />
            </div>
            <h2 id="report-dialog-title" className="font-space text-lg font-bold text-slate-900">
              {t('report.successTitle')}
            </h2>
            <p className="mt-1 font-inter text-sm text-slate-500">
              {t('report.successBody')}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-lg bg-nav-accent px-5 py-2.5 font-inter text-sm font-semibold text-white"
            >
              {t('continue')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 id="report-dialog-title" className="font-space text-xl font-bold text-slate-900">
                  {t('report.title')}
                </h2>
                <p className="mt-0.5 font-inter text-sm text-slate-500">
                  {t('report.subtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('close')}
                className="-me-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6">
              <div>
                <label htmlFor="report-note" className="flex items-baseline gap-1.5 font-inter text-base font-bold text-slate-900">
                  {t('report.noteLabel')}
                  <span className="text-rose-600" aria-hidden="true">*</span>
                </label>
                <textarea
                  ref={noteRef}
                  id="report-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  required
                  aria-required="true"
                  minLength={NOTE_MIN_LENGTH}
                  maxLength={2000}
                  placeholder={t('report.notePlaceholder')}
                  className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-slate-50/60 p-3 font-inter text-[15px] leading-relaxed text-slate-900 focus:border-nav-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-nav-accent/30"
                />
              </div>

              <section aria-labelledby="report-screenshot-title" className="space-y-2">
                <h3 id="report-screenshot-title" className="flex items-baseline gap-1.5 font-inter text-base font-bold text-slate-900">
                  {t('report.screenshot.title')}
                  <span className="text-sm font-normal text-slate-400">{t('report.optional')}</span>
                </h3>
                {shot ? (
                  <ScreenshotAnnotator
                    source={shot}
                    rects={marks}
                    onChange={setMarks}
                    onRemove={() => { setShot(null); setMarks([]); }}
                  />
                ) : (
                  <div
                    onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={dropImage}
                    className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                      dragging ? 'border-blue-400 bg-nav-accent-soft' : 'border-slate-300 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={capture}
                        disabled={capturing}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-nav-accent px-4 font-inter text-sm font-semibold text-white shadow-sm hover:bg-[#3350c4] disabled:opacity-50"
                      >
                        <Camera size={18} aria-hidden="true" />
                        {capturing ? t('report.screenshot.capturing') : t('report.screenshot.capture')}
                      </button>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-inter text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <ImagePlus size={18} aria-hidden="true" /> {t('report.screenshot.upload')}
                      </button>
                    </div>
                    <p className="font-inter text-xs text-slate-500">{t('report.screenshot.dropHint')}</p>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={pickFile} />
                  </div>
                )}
                {shotError && <p role="alert" className="font-inter text-xs text-rose-700">{shotError}</p>}
              </section>

              <fieldset>
                <legend className="mb-2 flex items-baseline gap-1.5 font-inter text-sm font-semibold text-slate-700">
                  {t('report.legend')}
                  <span className="font-normal text-slate-400">{t('report.optional')}</span>
                </legend>

                <div role="radiogroup" aria-label={t('report.legend')} className="flex flex-wrap gap-2">
                  {REPORT_CATEGORIES.map((option) => {
                    const selected = category === option.id;

                    return (
                      <label
                        key={option.id}
                        title={t(`report.categories.${option.id}.hint`, option.hint)}
                        className={`inline-flex min-h-[36px] cursor-pointer items-center rounded-full border px-3 font-inter text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-nav-accent ${
                          selected
                            ? 'border-nav-accent bg-nav-accent font-semibold text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="report-category"
                          value={option.id}
                          checked={selected}
                          onChange={() => setCategory(option.id)}
                          // Un second clic sur la pastille choisie la retire : le choix reste facultatif.
                          onClick={() => { if (selected) setCategory(null); }}
                          className="sr-only"
                        />
                        {t(`report.categories.${option.id}.label`, option.label)}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 p-2.5 font-inter text-xs text-rose-800">
                  <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              )}
            </div>

            <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3 sm:px-6">
              {!noteReady && (
                <p className="me-auto font-inter text-xs text-slate-500">{t('report.noteRequiredHint')}</p>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2.5 font-inter text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={!noteReady || busy}
                className="inline-flex items-center gap-2 rounded-lg bg-nav-accent px-6 py-2.5 font-inter text-sm font-semibold text-white disabled:opacity-40"
              >
                <Send size={16} aria-hidden="true" />
                {busy ? t('report.sending') : t('report.send')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
  );
}
