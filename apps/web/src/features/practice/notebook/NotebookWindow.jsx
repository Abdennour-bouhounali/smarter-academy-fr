import {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  NotebookPen, X, Maximize2, Minimize2, Eraser, Check, Circle, LoaderCircle, CloudOff, GripHorizontal,
} from 'lucide-react';
import { getLessonById } from '@smarter-academy/core';
import { AuthContext } from '../../../context/AuthContext';
import NotebookEditor from './NotebookEditor';
import NotebookToolbar from './NotebookToolbar';
import NotebookContent from './NotebookContent';
import {
  buildDefaultContent, isEmptyContent, isRichContent, normalizeForCompare, plainTextToHtml,
  sanitizeHtml, MAX_CONTENT_LENGTH,
} from './noteContent';
import { draftKeyFor, readDraft, useNoteDraft } from './useNoteDraft';
import { contextLabels, contextOfNote } from './noteContext';
import { useNotebookDrag } from './useNotebookDrag';
import FeatureLockedPanel from '../../../components/access/FeatureLockedPanel';
import QuotaMeter from '../../../components/access/QuotaMeter';
import { useFeatureAccess, refreshFeatureAccess, reportRefusal } from '../../../hooks/useFeatureAccess';
import { NOTEBOOK_FEATURE, featureState, refusalFromError } from '../../access/featureAccess';
import './notebook.css';

// Des CLÉS, résolues au rendu — i18next n'est pas prêt à l'évaluation du module.
export const MISTAKE_TYPES = [
  { id: 'calcul', labelKey: 'notebook.mistakeCalcul' },
  { id: 'methode', labelKey: 'notebook.mistakeMethode' },
  { id: 'lecture', labelKey: 'notebook.mistakeLecture' },
  { id: 'signe', labelKey: 'notebook.mistakeSigne' },
  { id: 'etourderie', labelKey: 'notebook.mistakeEtourderie' },
];

// Le seuil « téléphone » de notebook.css, lu depuis le JSX pour la seule
// décision de mise en page que la CSS ne peut pas prendre seule : le type
// d'erreur en pastilles (grand, téléphone) ou en liste déroulante (petit).
const PHONE_QUERY = '(max-width: 639px)';
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);

    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/**
 * Le cahier ouvert : une fenêtre flottante, posée sur l'exercice.
 *
 * Deux façons d'arriver ici :
 *  - `context` (exercice, question, réponse, verdict) → une NOUVELLE note,
 *    pré-remplie du contexte réel ; le premier « حفظ » crée, les suivants
 *    modifient la même note — jamais de doublon.
 *  - `note` (une note enregistrée) → on la rouvre telle quelle : contenu,
 *    type d'erreur, état « traitée » ; rien n'est régénéré par-dessus.
 *
 * Ce qui ne se perd JAMAIS : le texte de l'élève. Chaque frappe alimente un
 * brouillon local (useNoteDraft) ; fermer, redimensionner, perdre le réseau
 * ne l'effacent pas, seul un enregistrement réussi le retire.
 *
 * Elle s'OUVRE toujours en grand (« large »), CENTRÉE dans l'écran — en
 * leçon comme en exercice : la page qu'on déplie pour rédiger. L'élève peut
 * la réduire en « petit » pendant la session ; ce choix n'est pas gardé
 * d'une ouverture à l'autre.
 *
 * La fenêtre se DÉPLACE par son en-tête (useNotebookDrag) : la position est
 * un décalage indépendant de tout le reste — taille, contenu, brouillon,
 * état d'enregistrement n'en savent rien. Elle n'est pas conservée : c'est
 * un confort d'écran, pas une donnée d'apprentissage.
 *
 * Le cahier est un COMPAGNON, pas une modale : la leçon derrière reste
 * lisible, cliquable et navigable pendant qu'il est ouvert — l'élève passe
 * au module suivant, fait défiler l'énoncé, répond à une question, le cahier
 * toujours posé dans son coin. Donc : pas de voile, pas de gel du
 * défilement, pas de piège à Tab. role="dialog" non modal ; le focus entre
 * dans l'éditeur à l'ouverture et revient au déclencheur à la fermeture ;
 * Échap ferme quand le focus est DANS le cahier (jamais depuis la leçon).
 *
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {object} [context]  le contexte capturé à l'ouverture (noteContext.js) — pour un
 *   exercice, augmenté de { exercise, question, answer, evaluation, feedbackMessage }
 * @param {object} [note]     une note existante (sérialisée par l'API) : SON contexte fait foi
 * @param {string} [starterHtml] contenu de départ explicite (« أضف إلى كرّاسي ») ; sinon le
 *   contexte d'exercice engendre le sien, et une page de leçon ouvre une page blanche
 * @param {(data: {content, mistakeType}) => Promise<{note}>} [onCreate]
 * @param {(id, patch) => Promise<{note}>} onUpdate
 * @param {(note) => void} [onSaved]
 */
export default function NotebookWindow({
  open, onClose, context = null, note = null, starterHtml = null, onCreate, onUpdate, onSaved,
}) {
  const { t } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  const { user, token } = useContext(AuthContext);
  const reduceMotion = useReducedMotion();
  // « الوصول والحدود » : de quoi DESSINER le compteur et le cadenas. Le
  // serveur reste l'autorité — une note refusée revient en 403 avec son quota.
  const { summary: accessSummary } = useFeatureAccess();
  const notebookAccess = featureState(accessSummary, NOTEBOOK_FEATURE);
  const [refusal, setRefusal] = useState(null);
  const w = (key, opts) => t(`notebook.window.${key}`, opts);

  const editorRef = useRef(null);
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  // Lus par l'effet d'ouverture sans figurer dans ses dépendances : l'effet
  // ne doit tourner qu'une fois par ouverture, sinon son nettoyage rendrait
  // le focus à la page pendant que le cahier est encore ouvert.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const confirmClearRef = useRef(false);

  const [size, setSize] = useState('large');
  const isPhone = useMediaQuery(PHONE_QUERY);
  // Petit ET pas téléphone : la place manque en hauteur, le pied se resserre.
  const compact = size === 'small' && !isPhone;
  const { offset, dragging, reclamp, handleProps } = useNotebookDrag(panelRef, { enabled: open });
  const [noteId, setNoteId] = useState(note?.id ?? null);
  const [mistakeType, setMistakeType] = useState(note?.mistakeType ?? null);
  const [status, setStatus] = useState('idle'); // idle | dirty | saving | saved | error
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  confirmClearRef.current = confirmClear;
  const [draftRestored, setDraftRestored] = useState(false);
  // Le HTML courant vit dans une ref : le lire à chaque frappe ne doit pas
  // re-rendre la fenêtre (et surtout pas l'éditeur).
  const htmlRef = useRef('');
  const [previewHtml, setPreviewHtml] = useState('');

  const isExisting = note != null;

  // Le repère « 📚 leçon › 📍 endroit ». Pour une note existante, c'est SON
  // contexte (celui de la création) — jamais la position courante de l'élève.
  const labels = useMemo(() => {
    const ctx = isExisting ? contextOfNote(note, getLessonById(note.lessonCode)) : context;
    return contextLabels(ctx);
  }, [isExisting, note, context]);

  // Le contenu de départ, calculé UNE fois par ouverture.
  const defaultHtml = useMemo(() => {
    if (!open) return '';
    if (isExisting) {
      return isRichContent(note.content) ? note.content : plainTextToHtml(note.content ?? '');
    }
    // Un contenu de départ explicite (une connaissance ajoutée depuis la
    // carte) : désinfecté comme tout ce qui entre, puis une ligne à l'élève.
    if (starterHtml) return `${sanitizeHtml(starterHtml)}<p><br></p>`;
    // Une page de leçon sans exercice : page blanche. L'élève est l'auteur.
    if (!context?.exercise || !context?.question) return '<p><br></p>';
    const outcome = context.evaluation?.outcome;

    return buildDefaultContent({
      exercise: context.exercise,
      question: context.question,
      answer: context.answer,
      evaluation: context.evaluation,
      feedbackMessage: outcome === 'syntax_error' ? '' : (context.feedbackMessage ?? ''),
      verdict: outcome ? t(`practice.verdict.${outcome}`, { defaultValue: '' }) : '',
      labels: {
        exercise: w('exerciseLabel'),
        question: w('questionLabel'),
        mistake: w('mistakeLabel'),
        myAnswer: w('myAnswerLabel'),
        verdict: w('verdictLabel'),
        noAnswer: w('noAnswer'),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isExisting, note?.id, starterHtml]);

  const draftKey = useMemo(() => (open ? draftKeyFor({
    userId: user?.id,
    noteId: note?.id ?? null,
    lessonCode: context?.lessonCode,
    moduleNumber: context?.moduleNumber,
    learningPointCode: context?.learningPointCode,
    exerciseId: context?.exerciseId ?? context?.exercise?.id,
    questionId: context?.questionId ?? context?.question?.id,
  }) : null), [open, user?.id, note?.id, context]);
  const draft = useNoteDraft(draftKey);

  // À l'ouverture : brouillon s'il y en a un, sinon le contenu de départ.
  // Calculé de façon SYNCHRONE (useMemo), pas dans un effet : l'éditeur doit
  // recevoir le bon contenu dès son premier rendu, sans passer par une image
  // où il montrerait celui de l'ouverture précédente.
  const opening = useMemo(() => {
    if (!open) return { html: '', restored: false, mistakeType: note?.mistakeType ?? null };
    const saved = draftKey ? readDraft(draftKey) : null;
    const restored = !!saved && !isEmptyContent(saved.html)
      && normalizeForCompare(saved.html) !== normalizeForCompare(defaultHtml);

    return {
      html: restored ? saved.html : defaultHtml,
      restored,
      mistakeType: restored && saved.mistakeType !== undefined ? saved.mistakeType : (note?.mistakeType ?? null),
      // Un brouillon laissé APRÈS un premier enregistrement porte l'id de sa
      // note : le restaurer, c'est continuer cette note — pas en créer une.
      noteId: restored && saved.noteId != null ? saved.noteId : (note?.id ?? null),
    };
  }, [open, defaultHtml, draftKey, note?.mistakeType, note?.id]);
  const initialHtml = opening.html;
  if (open && !htmlRef.current) htmlRef.current = opening.html;

  useEffect(() => {
    if (!open) {
      htmlRef.current = '';
      return;
    }
    htmlRef.current = opening.html;
    setDraftRestored(opening.restored);
    setMistakeType(opening.mistakeType);
    setNoteId(opening.noteId);
    setStatus(opening.restored ? 'dirty' : 'idle');
    setError(null);
    setPreview(false);
    setConfirmClear(false);
  }, [open, opening, note?.id]);

  // Focus à l'ouverture, Échap depuis l'intérieur, focus rendu à la fermeture.
  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement;
    const timer = setTimeout(() => editorRef.current?.focus(), 30);

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      // Un Échap tapé dans la leçon (fermer une palette, un menu…) ne doit
      // pas refermer le cahier par-dessus l'épaule de l'élève.
      if (!panelRef.current?.contains(document.activeElement)) return;
      event.stopPropagation();
      if (confirmClearRef.current) { setConfirmClear(false); return; }
      onCloseRef.current?.();
    };

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown, true);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  const changeSize = (next) => setSize(next);

  // Après l'animation d'ouverture et après un changement de taille (260ms de
  // transition CSS), la fenêtre a ses dimensions finales : on la ramène dans
  // l'écran si le décalage gardé d'une ouverture précédente l'en sortirait.
  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(reclamp, 320);

    return () => clearTimeout(timer);
  }, [open, size, reclamp]);

  // `noteId` dans une ref : markDirty le lit sans re-créer le rappel à
  // chaque enregistrement.
  const noteIdRef = useRef(noteId);
  noteIdRef.current = noteId;

  const markDirty = useCallback((html, type = mistakeType) => {
    setStatus((s) => (s === 'saving' ? s : 'dirty'));
    setError(null);
    draft.save({ html, mistakeType: type, noteId: noteIdRef.current });
  }, [draft, mistakeType]);

  const onEditorChange = useCallback((html) => {
    // L'éditeur émet aussi au blur : un contenu INCHANGÉ n'est pas une
    // modification — il ne salit ni l'état « محفوظ » ni le brouillon.
    if (html === htmlRef.current) return;
    htmlRef.current = html;
    markDirty(html);
  }, [markDirty]);

  const setType = (next) => {
    setMistakeType(next);
    markDirty(htmlRef.current, next);
  };
  const pickMistakeType = (id) => setType(mistakeType === id ? null : id);

  const [toolState, setToolState] = useState({});

  const requestClear = () => {
    // Confirmation seulement si l'élève a ÉCRIT quelque chose : effacer une
    // page encore au contenu de départ ne mérite pas une question.
    const current = htmlRef.current;
    const untouched = normalizeForCompare(current) === normalizeForCompare(defaultHtml) || isEmptyContent(current);
    if (untouched) doClear();
    else setConfirmClear(true);
  };

  const doClear = () => {
    setConfirmClear(false);
    setPreview(false);
    editorRef.current?.setHtml('<p><br></p>');
    htmlRef.current = '<p><br></p>';
    markDirty(htmlRef.current);
    editorRef.current?.focus();
  };

  const discardDraft = () => {
    editorRef.current?.setHtml(defaultHtml);
    htmlRef.current = defaultHtml;
    setMistakeType(note?.mistakeType ?? null);
    draft.clear();
    setDraftRestored(false);
    setStatus('idle');
  };

  const togglePreview = () => {
    if (!preview) setPreviewHtml(htmlRef.current);
    setPreview((p) => !p);
  };

  const save = async () => {
    if (status === 'saving') return;
    const clean = sanitizeHtml(htmlRef.current);
    if (isEmptyContent(clean)) {
      setStatus('error');
      setError(w('emptyCannotSave'));
      return;
    }
    if (clean.length > MAX_CONTENT_LENGTH) {
      setStatus('error');
      setError(w('tooLong'));
      return;
    }
    setStatus('saving');
    setError(null);
    setRefusal(null);
    try {
      const payload = { content: clean, mistakeType };
      const creating = noteId == null;
      const result = creating
        ? await onCreate(payload)
        : await onUpdate(noteId, payload);
      const saved = result?.note ?? result;
      if (saved?.id != null) setNoteId(saved.id);
      // Une note de plus : le compteur « X متبقّية » change.
      if (creating) refreshFeatureAccess(token);
      draft.clear();
      setDraftRestored(false);
      setStatus('saved');
      onSaved?.(saved);
    } catch (e) {
      // Le texte reste à l'écran ET dans le brouillon local : rien n'est perdu.
      draft.flush();
      setStatus('error');
      const refused = refusalFromError(e);
      if (refused) {
        reportRefusal(refused);
        setRefusal(refused);
      } else {
        setError(w('statusError'));
      }
    }
  };

  const close = () => {
    draft.flush();
    onClose?.();
  };

  if (typeof document === 'undefined') return null;

  const STATUS = {
    dirty: { Icon: Circle, label: w('statusDirty') },
    saving: { Icon: LoaderCircle, label: w('statusSaving') },
    saved: { Icon: Check, label: w('statusSaved') },
    error: { Icon: CloudOff, label: w('statusDirty') },
  };
  const statusSpec = STATUS[status];

  // Deux couches d'animation, volontairement : la section extérieure porte
  // la position (notre translation) et ne fait que s'estomper ; le cadre
  // intérieur porte l'entrée (échelle + glissement). Sur une seule couche,
  // framer et le déplacement se disputeraient la même propriété `transform`.
  const outerMotion = {
    initial: reduceMotion ? false : { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reduceMotion ? 0 : 0.16 },
  };
  const frameMotion = reduceMotion
    ? { initial: false, animate: { scale: 1, y: 0 } }
    : {
      initial: { scale: 0.94, y: 18 },
      animate: { scale: 1, y: 0 },
      exit: { scale: 0.96, y: 12 },
      transition: { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 },
    };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.section
            key="nb-window"
            ref={panelRef}
            className="sa-nb-window"
            data-size={size}
            data-dragging={dragging || undefined}
            role="dialog"
            aria-label={w('dialogLabel')}
            style={{ x: offset.x, y: offset.y }}
            {...outerMotion}
          >
          <motion.div className="sa-nb-frame" {...frameMotion}>
            <div className="sa-nb-binding" aria-hidden="true" />

            {/* L'en-tête est la POIGNÉE : on saisit le titre ou le vide, les
                boutons restent des boutons (useNotebookDrag les ignore). */}
            <header className="sa-nb-header" title={w('dragHint')} {...handleProps}>
              <h2 className="sa-nb-title">
                <NotebookPen size={20} aria-hidden="true" />
                <span>{w('title')}</span>
              </h2>
              <GripHorizontal size={16} className="sa-nb-grip" aria-hidden="true" />
              <div className="sa-nb-header-actions">
                <button
                  type="button"
                  className="sa-nb-icon-btn sa-nb-size-toggle"
                  onClick={() => changeSize(size === 'small' ? 'large' : 'small')}
                  title={size === 'small' ? w('enlarge') : w('shrink')}
                  aria-label={size === 'small' ? w('enlarge') : w('shrink')}
                  aria-pressed={size === 'large'}
                >
                  {size === 'small' ? <Maximize2 size={18} aria-hidden="true" /> : <Minimize2 size={18} aria-hidden="true" />}
                  <span className="sr-only">{size === 'small' ? w('sizeSmall') : w('sizeLarge')}</span>
                </button>
                <button
                  type="button"
                  className="sa-nb-icon-btn sa-nb-icon-btn--danger"
                  onClick={requestClear}
                  title={w('clear')}
                  aria-label={w('clear')}
                  disabled={preview}
                >
                  <Eraser size={18} aria-hidden="true" />
                  <span className="hidden sm:inline text-xs font-bold ms-1">{w('clear')}</span>
                </button>
                <button
                  type="button"
                  className="sa-nb-icon-btn"
                  onClick={close}
                  title={w('close')}
                  aria-label={w('close')}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
            </header>

            {(labels.lesson || labels.place) && (
              <div
                className="sa-nb-context"
                role="note"
                aria-label={w('contextAria', { lesson: labels.lesson ?? '', place: labels.place ? ` › ${labels.place}` : '' })}
              >
                {labels.lesson && (
                  <span title={`${w('contextLesson')} : ${labels.lesson}`}>
                    <span aria-hidden="true">📚</span>
                    <span>{labels.lesson}</span>
                  </span>
                )}
                {labels.place && (
                  <span className="sa-nb-context-place" title={`${w('contextPlace')} : ${labels.place}`}>
                    <span aria-hidden="true">📍</span>
                    <span>{labels.place}</span>
                  </span>
                )}
              </div>
            )}

            {draftRestored && (
              <div className="sa-nb-notice" role="status">
                <span>{w('draftRestored')}</span>
                <button type="button" onClick={discardDraft}>{w('discardDraft')}</button>
              </div>
            )}
            {isExisting && note.isCompleted && (
              <div className="sa-nb-notice sa-nb-notice--info" role="status">
                <span className="inline-flex items-center gap-1.5"><Check size={16} aria-hidden="true" /> {t('notebook.handled')}</span>
              </div>
            )}

            <div className="sa-nb-paper">
              <div className="sa-nb-sheet">
                <div style={{ display: preview ? 'none' : 'block' }}>
                  <NotebookEditor
                    ref={editorRef}
                    initialHtml={initialHtml}
                    onChange={onEditorChange}
                    onStateChange={setToolState}
                    placeholder={t('notebook.notePlaceholder')}
                    ariaLabel={t('notebook.yourNote')}
                    ariaDescribedBy="sa-nb-math-hint"
                  />
                </div>
                {preview && (
                  isEmptyContent(previewHtml)
                    ? <p className="text-slate-500 text-sm">{w('previewEmpty')}</p>
                    : <NotebookContent content={previewHtml} />
                )}
                <p id="sa-nb-math-hint" className="sr-only">{w('mathHint')}</p>
              </div>

              {confirmClear && (
                <div className="sa-nb-confirm" role="alertdialog" aria-labelledby="sa-nb-confirm-title" aria-describedby="sa-nb-confirm-body">
                  <div className="sa-nb-confirm-card">
                    <p id="sa-nb-confirm-title" className="font-extrabold text-slate-900">{w('clearConfirmTitle')}</p>
                    <p id="sa-nb-confirm-body" className="text-sm text-slate-600 mt-1">{w('clearConfirmBody')}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <button type="button" className="sa-nb-btn sa-nb-btn--danger" onClick={doClear} autoFocus>
                        <Eraser size={16} aria-hidden="true" /> {w('clearConfirmYes')}
                      </button>
                      <button type="button" className="sa-nb-btn sa-nb-btn--ghost" onClick={() => setConfirmClear(false)}>
                        {tc('cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NotebookToolbar
              exec={(cmd, value) => editorRef.current?.exec(cmd, value)}
              state={toolState}
              preview={preview}
              onTogglePreview={togglePreview}
            />

            <footer className="sa-nb-footer">
              {!compact && (
                <div className="sa-nb-chips" role="group" aria-label={w('mistakeTypeLegend')}>
                  {MISTAKE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className="sa-nb-chip"
                      aria-pressed={mistakeType === type.id}
                      onClick={() => pickMistakeType(type.id)}
                    >
                      {t(type.labelKey)}
                    </button>
                  ))}
                </div>
              )}
              {error && (
                <p role="alert" className="text-sm font-semibold text-rose-700">{error}</p>
              )}
              {refusal ? (
                <FeatureLockedPanel compact reason={refusal.reason} quota={refusal.quota} resource="notebook" />
              ) : notebookAccess.known && !notebookAccess.allowed ? (
                <FeatureLockedPanel compact reason={notebookAccess.reason} />
              ) : (noteId == null && notebookAccess.quota && !notebookAccess.quota.unlimited && (
                <QuotaMeter quota={notebookAccess.quota} className="self-start" />
              ))}
              <div className="sa-nb-footer-row">
                {compact && (
                  <select
                    className="sa-nb-select"
                    aria-label={w('mistakeTypeLegend')}
                    value={mistakeType ?? ''}
                    onChange={(e) => setType(e.target.value || null)}
                  >
                    <option value="">{w('mistakeTypeNone')}</option>
                    {MISTAKE_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>{t(type.labelKey)}</option>
                    ))}
                  </select>
                )}
                <span className="sa-nb-status" data-state={status} role="status" aria-live="polite">
                  {statusSpec ? (
                    <>
                      <statusSpec.Icon size={14} aria-hidden="true" fill={status === 'dirty' ? 'currentColor' : 'none'} />
                      {statusSpec.label}
                    </>
                  ) : (
                    <span className="opacity-0" aria-hidden="true">·</span>
                  )}
                </span>
                <button
                  type="button"
                  className="sa-nb-btn sa-nb-btn--primary"
                  onClick={save}
                  disabled={status === 'saving' || status === 'saved' || preview}
                >
                  {status === 'saved' ? <Check size={18} aria-hidden="true" /> : null}
                  {status === 'saved' ? w('statusSaved') : tc('save')}
                </button>
              </div>
            </footer>
          </motion.div>
          </motion.section>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
