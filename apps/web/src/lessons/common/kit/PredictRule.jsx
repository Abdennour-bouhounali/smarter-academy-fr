import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { scopedStorage as storage } from '../../../utils/storage';
import { useLessonKnowledge } from '../knowledge';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import MathTextArea, { writtenLength } from '../components/MathTextArea';
import MathText from '../components/MathText';
import { PREDICT_MIN_CHARS, readPredictions, savePrediction, shouldPredict, ruleNoteOf } from './predictRule';
import { AuthContext } from '../../../context/AuthContext';
import { createNote } from '../../../services/practiceService';
import { getLoadedLessonConfig } from '../../registry';

/**
 * PILOTE (2026-11-07, conseil + propriétaire) : la règle que l'élève écrit avec ses mots devient une carte de « كرّاسي »
 * (« قاعدتي: … », ses mots puis la règle officielle pour comparer). Une note ordinaire : l'enseignant du قسم peut la lire
 * (décision du 2026-09-24) — l'élève en est prévenu sous la zone d'écriture. Seulement : leçon pilote (studentView 'mission'),
 * compte ÉLÈVE réel. Jamais une preuve de maîtrise.
 */
function useRuleToNotebook(lessonId) {
  const viewer = useLearningViewer();
  const auth = useContext(AuthContext);
  const on = viewer?.role === 'student' && Boolean(auth?.token) && getLoadedLessonConfig(lessonId)?.studentView === 'mission';
  return { on, token: auth?.token };
}

/**
 * « أتوقّع القاعدة » — avant qu'une règle soit montrée, l'élève l'écrit avec
 * ses mots ; dès qu'il a écrit un minimum, la règle complète apparaît, avec
 * sa prédiction au-dessus pour comparer. Rien n'est validé ni envoyé.
 *
 * Trois pièces :
 *   usePredictGate  la décision (predictRule.shouldPredict) + la mémoire de l'élève ;
 *   PredictPanel    la zone d'écriture (MathTextArea) et le bouton « أظهر القاعدة » ;
 *   PredictionEcho  « توقّعك » : ce que l'élève avait écrit, posé au-dessus de la règle.
 *
 * KnowledgeBrick les utilise pour TOUTE connaissance nouvelle (comportement par
 * défaut de toutes les leçons) ; `<PredictRule>` enveloppe une règle qui n'est
 * pas une brique (un TextbookBox « تعريف / خاصية » qui pose une règle neuve).
 *
 * Tant que la prédiction est attendue, l'élément porte `sa-predict-pending` :
 * la feuille de style masque ce qui le SUIT dans le même conteneur (la question
 * d'application), pour qu'on ne réponde pas avant d'avoir vu la règle.
 */
export function usePredictGate({ id, itemType, itemPredict, brickPredict, variant, ready = true, itemTitle, itemRule }) {
  // « connue » = ÉTABLIE par l'élève, jamais simplement visible sur une carte ouverte d'emblée (pilote 2026-11-08) :
  // sinon « أتوقّع القاعدة » serait sautée pour toutes les règles de la leçon
  const { lessonId, items: mapItems, learnedItems, freeNavigation: mapFree } = useLessonKnowledge();
  const items = learnedItems ?? mapItems;
  const viewer = useLearningViewer();
  const freeNavigation = Boolean(viewer?.freeNavigation || mapFree);
  const [predictions, setPredictions] = useState(() => readPredictions(storage, lessonId));
  const saved = id ? predictions[id]?.text : undefined;
  const known = Boolean(id && items?.some((i) => i.id === id));

  // Décision VIVANTE : dès qu'une règle est connue (module validé, ou établie
  // ailleurs dans la page — une PredictRule qui enveloppe le TextbookBox de la
  // même règle) ou prédite, plus rien n'est demandé. La brique ne débloque la
  // carte qu'APRÈS sa révélation, donc `known` ne la libère jamais trop tôt.
  const gated = ready && shouldPredict({ variant, itemType, itemPredict, brickPredict, freeNavigation, known, predicted: Boolean(saved) });

  const notebook = useRuleToNotebook(lessonId);
  const reveal = useCallback((text) => {
    if (!id) return;
    setPredictions(savePrediction(storage, lessonId, id, text));
    if (notebook.on) {
      // le titre et la règle viennent de l'appelant (la brique les a ; la liste des connaissances n'a que les règles déjà établies)
      // — ne bloque jamais la règle : une note qui échoue (hors ligne) laisse la leçon continuer
      createNote(notebook.token, ruleNoteOf({ lessonId, itemTitle, itemRule, text })).catch(() => {});
    }
  }, [id, lessonId, notebook.on, notebook.token, itemTitle, itemRule]);

  return { gated, saved, reveal };
}

export function PredictPanel({ prompt, onReveal, symbolsFrom, className = '', ...rest }) {
  const { t } = useTranslation('lesson');
  const { lessonId } = useLessonKnowledge();
  const notebook = useRuleToNotebook(lessonId);
  const [text, setText] = useState('');
  const ready = writtenLength(text) >= PREDICT_MIN_CHARS;
  return (
    <section className={`sa-predict-pending space-y-3 rounded-2xl border-2 border-sky-300 bg-sky-50/70 p-4 ${className}`} data-predict-panel {...rest}>
      <p className="flex items-center gap-2 text-xs font-extrabold text-sky-900">
        <span aria-hidden="true">🔍</span>{t('predict.tag')}
      </p>
      <p className="text-sm font-semibold leading-relaxed text-slate-800"><MathText>{prompt || t('predict.prompt')}</MathText></p>
      <MathTextArea value={text} onChange={setText} rows={3} symbolsFrom={symbolsFrom} ariaLabel={t('predict.label')} placeholder={t('predict.placeholder')} />
      <div className="space-y-1">
        <button type="button" disabled={!ready} onClick={() => onReveal(text)}
          className="rounded-xl border-2 border-sky-700 bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300">
          {t('predict.reveal')}
        </button>
        <p className="text-xs text-slate-500">{ready ? t('predict.noGrade') : t('predict.needText')}</p>
        {notebook.on && <p className="text-xs font-bold text-indigo-700" data-predict-notebook>📓 {t('predict.toNotebook')}</p>}
      </div>
    </section>
  );
}

// Une règle enveloppée (PredictRule) suivie de SA brique : la feuille de style
// masque la seconde « توقّعك » (index.css, `data-predict-revealed ~ …`).
export function PredictionEcho({ id, text }) {
  const { t } = useTranslation('lesson');
  if (!text) return null;
  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2" data-predict-own={id ?? ''}>
      <p className="text-[11px] font-bold text-sky-800">{t('predict.yours')}</p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800" dir="rtl">{text}</p>
      <p className="mt-1 text-[11px] text-sky-700">{t('predict.compare')}</p>
    </div>
  );
}

/**
 * Enveloppe une règle qui n'est pas une KnowledgeBrick.
 * @param {string}  [id]      item de knowledge.jsx que cette règle pose (mémoire + carte)
 * @param {string}  [type]    sa sorte, si l'item n'existe pas (défaut 'regles')
 * @param {string}  [prompt]  la question qui fait conclure la règle
 */
export default function PredictRule({ id, type, prompt, predict, children }) {
  const { getItem, unlockItem } = useLessonKnowledge();
  const item = id ? getItem(id) : null;
  const { gated, saved, reveal } = usePredictGate({
    id, itemType: item?.type ?? type ?? 'regles', itemPredict: item?.predict, brickPredict: predict, variant: 'new', ready: !id || Boolean(item) || Boolean(type),
    itemTitle: item?.title, itemRule: item?.summary,
  });
  useEffect(() => { if (id && item && !gated) unlockItem(id); }, [id, item, gated, unlockItem]);
  // La palette : les symboles de CETTE règle (la boîte enveloppée, l'item).
  if (gated) return <PredictPanel prompt={prompt ?? item?.predictPrompt} onReveal={reveal} symbolsFrom={[children, item?.title, item?.summary, item?.body]} data-predict-for={id} />;
  return (
    <div className="space-y-2" data-predict-revealed={id}>
      <PredictionEcho id={id} text={saved} />
      {children}
    </div>
  );
}
