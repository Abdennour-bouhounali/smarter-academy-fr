import { createContext, useContext, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { useClassroomMode } from '../classroom/ClassroomContext';
import { InMissionPlayerContext } from '../mission/missionPlayerContext';

/**
 * LE REGARD « FOCUS » DE L'ÉLÈVE (pilote 2026-11-03) — LESSON_DEVELOPMENT_GUIDE
 * « عرض التلميذ المركّز ». Une génération qui lit peu : l'écran montre ce dont l'élève a besoin MAINTENANT, le reste
 * est à un geste (« المزيد »). Activé par leçon (`LESSON_CONFIG.studentView: 'focus'`), jamais pour l'enseignant
 * (lecteur libre) ni en mode classe : leur vue ne change pas.
 */
export function isStudentFocus(studentView, viewer, classroom) {
  // Le mode mission (mission/missionModel.js) est bâti SUR le regard focus : il l'implique.
  return (studentView === 'focus' || studentView === 'mission') && !viewer?.freeNavigation && !classroom?.isClassroomMode;
}

/** La décision pour un composant qui tient la config (ContentModule, LessonIndex…). */
export function useStudentFocusFor(studentView) {
  const viewer = useLearningViewer();
  const classroom = useClassroomMode();
  return isStudentFocus(studentView, viewer, classroom);
}

const StudentFocusContext = createContext(false);

/** Posé par ModuleLayout et LessonIndex : labos, briques, questions et mémo le lisent sans prop. */
export function StudentFocusProvider({ studentView, children }) {
  const focus = useStudentFocusFor(studentView);
  return <StudentFocusContext.Provider value={focus}>{children}</StudentFocusContext.Provider>;
}

export function useStudentFocus() {
  return useContext(StudentFocusContext);
}

/**
 * LA divulgation du contenu de leçon. En focus : un lien « المزيد ▾ » ; le contenu reste MONTÉ sous `hidden`
 * (l'état React et les attributs data-* survivent). Hors focus : le contenu en ligne, rien d'autre — chaque appel
 * est donc neutre pour les leçons qui n'ont pas basculé. `force` : pour un composant qui décide lui-même.
 */
export function MoreToggle({ label, children, className = '', force }) {
  const ctxFocus = useStudentFocus();
  const focus = force ?? ctxFocus;
  const { t } = useTranslation('lesson');
  const [open, setOpen] = useState(false);
  const id = useId();
  // Dans le lecteur de mission, chaque bloc a déjà SON écran : plus besoin de « المزيد », le contenu se montre
  // directement (propriétaire, 2026-11-04 : « no need for the read more feature »).
  const inPlayer = useContext(InMissionPlayerContext);
  if (!focus || inPlayer) return <>{children}</>;
  return (
    <div className={className} data-more-toggle={open ? 'open' : 'closed'}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
      >
        {open ? t('focus.less') : (label ?? t('focus.more'))}
        <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      <div id={id} hidden={!open}>{children}</div>
    </div>
  );
}
