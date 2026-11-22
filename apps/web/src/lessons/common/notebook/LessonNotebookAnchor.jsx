import { lessonPackFlags } from '../../registry';
import { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getLessonById } from '@smarter-academy/core';
import { AuthContext } from '../../../context/AuthContext';
import { useNotebook } from '../../../features/practice/notebook/NotebookProvider';
import { buildLessonLocation } from '../../../features/practice/notebook/noteContext';
import '../../../features/practice/notebook/notebook.css';

/**
 * L'ancre du cahier dans une page de leçon.
 *
 * Deux rôles, et c'est tout :
 *  1. PUBLIER la position courante — la leçon, le module s'il y en a un, le
 *     point d'apprentissage si le module n'en enseigne qu'un — auprès du
 *     cahier (NotebookProvider). Elle est retirée au démontage : hors d'une
 *     leçon, le cahier ne sait pas où l'élève est, et ne l'invente pas.
 *  2. Rendre le DÉCLENCHEUR flottant « 📓 Mon cahier », posé au-dessus de
 *     « 🧠 Ma carte » : reconnaissable partout dans la leçon, du sommaire au
 *     dernier module, sans qu'aucun module n'ait à le poser lui-même.
 *
 * Montée UNE fois par page de leçon, par la fabrique de routes de l'unité
 * (_unit/lessonRoutes.jsx) — le même endroit qui monte la carte des
 * connaissances. Les 1082 modules n'en savent rien.
 *
 * Sans compte, pas de cahier : les notes appartiennent à un élève. Le
 * visiteur voit la leçon sans le déclencheur, comme pour le signalement.
 */
export default function LessonNotebookAnchor({ config, module = null }) {
  const { t } = useTranslation('student');
  const { token } = useContext(AuthContext);
  const { setLocation, openNotebook, isOpen, closeNotebook } = useNotebook();

  const location = useMemo(() => buildLessonLocation(config, module, getLessonById(config?.id)), [config, module]);

  useEffect(() => {
    setLocation(location);

    return () => setLocation(null);
  }, [location, setLocation]);

  // A v2 lesson has no page to take notes on: the student is in its world (a full-window screen), the teacher on his
  // card — the floating « Mon cahier » is not shown there (owner, 2026-11-20).
  if (!token || !location || lessonPackFlags(config?.id).world) return null;

  const label = isOpen ? t('notebook.window.closeMyNotebook') : t('notebook.window.openMyNotebook');

  return (
    <button
      type="button"
      className="sa-nb-lesson-trigger"
      // La position est capturée MAINTENANT, au clic : c'est elle que la
      // note portera, quoi que l'élève fasse ensuite.
      onClick={() => (isOpen ? closeNotebook() : openNotebook({ context: location }))}
      aria-label={label}
      title={label}
      aria-pressed={isOpen}
      aria-haspopup="dialog"
      data-nb-trigger="lesson"
    >
      <span className="text-lg" aria-hidden="true">
        📓
      </span>
      <span>{t('notebook.window.myNotebookShort')}</span>
    </button>
  );
}
