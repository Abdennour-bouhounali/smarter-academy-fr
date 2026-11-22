import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import MathLabel from '../components/MathLabel';
import { readReturnTo, clearReturnTo, isAwayFrom } from './returnToLesson';

const session = () => (typeof window !== 'undefined' ? window.sessionStorage : null);

/**
 * Pendant la RÉVISION d'un prérequis (ouvert depuis « راجع قبل أن تنطلق »), chaque page de la leçon révisée montre ce
 * bouton : UN clic ramène à la leçon de départ (propriétaire, 2026-11-07). Monté une fois pour toutes les leçons
 * (LessonPageFrame) ; il ne s'affiche que si un retour est retenu et qu'on est AILLEURS que dans la leçon de départ.
 * Revenir à la leçon de départ, par lui ou autrement, efface le retour.
 */
export default function ReturnToLessonButton() {
  const { t } = useTranslation('lesson');
  const { pathname } = useLocation();
  const [target, setTarget] = useState(() => readReturnTo(session()));

  useEffect(() => {
    const v = readReturnTo(session());
    if (v && !isAwayFrom(v, pathname)) { clearReturnTo(session()); setTarget(null); } else setTarget(v);
  }, [pathname]);

  if (!target || !isAwayFrom(target, pathname) || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-x-0 bottom-6 z-[1250] flex justify-center px-4" data-return-to-lesson>
      <div className="flex items-center gap-1 rounded-2xl bg-indigo-700 p-1.5 shadow-2xl ring-4 ring-indigo-200">
        <Link to={target.path} onClick={() => clearReturnTo(session())} data-return-to-lesson-go
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl px-5 text-base font-black text-white hover:bg-indigo-600">
          <span aria-hidden="true">↩</span> {t('mission.returnTo')} <span className="font-extrabold text-amber-200"><MathLabel>{target.title}</MathLabel></span>
        </Link>
        <button type="button" onClick={() => { clearReturnTo(session()); setTarget(null); }} aria-label={t('mission.returnDismiss')}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-lg text-indigo-200 hover:bg-indigo-600 hover:text-white" data-return-to-lesson-dismiss>
          ×
        </button>
      </div>
    </div>,
    document.body,
  );
}
