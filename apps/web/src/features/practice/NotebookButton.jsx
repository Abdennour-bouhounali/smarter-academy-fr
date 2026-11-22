import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { getLessonById } from '@smarter-academy/core';
import { useNotebook } from './notebook/NotebookProvider';
import './notebook/notebook.css';

/**
 * « Noter dans mon carnet » — le déclencheur du cahier dans un exercice.
 *
 * Disponible À TOUT MOMENT, et pas seulement après une réponse fausse : une
 * remarque vient souvent PENDANT la recherche (« ici je dois penser à… »),
 * et l'élève qui a juste peut avoir autant à noter que celui qui s'est
 * trompé. Le type d'erreur reste donc facultatif, et le libellé ne présume
 * pas d'une faute.
 *
 * Le cahier lui-même est LE cahier de l'application (NotebookProvider) : la
 * même fenêtre qu'en leçon, ouverte ici sur le CONTEXTE RÉEL de la question
 * — leçon, point d'apprentissage, exercice, question, et, s'il y a eu une
 * réponse fausse, la réponse donnée et le verdict. Rien n'est inventé : sans
 * réponse, pas de bloc « خطئي ».
 *
 * Le déclencheur est LE MÊME qu'en leçon (LessonNotebookAnchor) : la
 * pastille flottante « 📓 كرّاسي », même classe, même place, même bascule
 * ouvrir/fermer (aria-pressed). L'élève reconnaît son cahier partout.
 *
 * Après un enregistrement, la pastille ROUVRE cette note pour la compléter
 * — c'est la MÊME note, pas une seconde. Le composant est remonté (`key`) à
 * chaque question et au verdict : une nouvelle question, ou la même après
 * validation, commence une nouvelle note.
 *
 * @param {object} context  { lessonCode, exercise, question, answer, evaluation, feedbackMessage }
 * @param {(data) => Promise<{note}>} onSave     crée la note (POST, avec les codes de la séance)
 * @param {(id, patch) => Promise<{note}>} onUpdate  la modifie (PATCH)
 */
export default function NotebookButton({ context, onSave, onUpdate, defaultType = null }) {
  const { t } = useTranslation('student');
  const { openNotebook, closeNotebook, isOpen } = useNotebook();
  const [savedNote, setSavedNote] = useState(null);

  // Le contexte d'exercice, complété des TITRES que le repère du cahier
  // affiche (« 📚 leçon › 📍 point ») : la leçon depuis le catalogue, le
  // point d'apprentissage principal de la question. Les codes, eux, partent
  // au serveur par `onSave` (PracticeSession les ajoute déjà).
  const fullContext = useMemo(() => {
    const lesson = getLessonById(context?.lessonCode);
    const lpCode = context?.question?.learningPoints?.find((lp) => lp.role === 'primary')?.code ?? null;

    return {
      ...context,
      lessonTitle: lesson?.title ?? context?.lessonCode ?? null,
      learningPointCode: lpCode,
      learningPointTitle: lesson?.learningPoints?.find((lp) => lp.id === lpCode)?.title ?? null,
      exerciseId: context?.exercise?.id ?? null,
      questionId: context?.question?.id ?? null,
    };
  }, [context]);

  const open = useCallback(() => (savedNote
    ? openNotebook({ note: savedNote, onUpdate, onSaved: setSavedNote })
    : openNotebook({
      context: fullContext,
      // Une note prise après une réponse fausse EST une erreur pour le cahier
      // (« أخطائي ») ; sans verdict ou avec une bonne réponse, une note.
      onCreate: (data) => onSave({
        ...data,
        mistakeType: data.mistakeType ?? defaultType,
        noteType: context?.evaluation && !context.evaluation.isCorrect ? 'erreur' : 'note',
      }),
      onUpdate,
      onSaved: setSavedNote,
    })), [openNotebook, savedNote, fullContext, onSave, onUpdate, defaultType, context]);

  const label = isOpen ? t('notebook.window.closeMyNotebook') : t('notebook.window.openMyNotebook');

  // Porté dans <body> : une pastille `position: fixed` sous un ancêtre
  // animé (transition de page, cadre de présentation) se collerait à lui et
  // non à l'écran.
  return createPortal(
    <button
      type="button"
      className="sa-nb-lesson-trigger"
      onClick={() => (isOpen ? closeNotebook() : open())}
      aria-label={label}
      title={label}
      aria-pressed={isOpen}
      aria-haspopup="dialog"
      data-nb-trigger="practice"
    >
      <span className="text-lg" aria-hidden="true">📓</span>
      <span>{t('notebook.window.myNotebookShort')}</span>
    </button>,
    document.body,
  );
}
