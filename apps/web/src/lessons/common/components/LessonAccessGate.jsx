import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useContentAvailability } from '../../../context/ContentAvailabilityContext';
import { useLessonChromeLayout } from '../hooks/useLessonChrome';
import PremiumLessonLocked from './PremiumLessonLocked';

/**
 * La porte de PALIER d'une leçon, posée par la fabrique de routes
 * (`buildLessonRoutes`) autour de CHAQUE page de la leçon — son sommaire et
 * chacun de ses modules. Une URL de module tapée directement passe donc par
 * elle comme la navigation normale, et une leçon générée demain en hérite
 * sans une ligne de code : il suffit qu'elle déclare ses routes par la
 * fabrique, comme toutes les leçons de l'unité.
 *
 * Elle ne décide rien : `isLessonLocked` vient du serveur
 * (`GET /content/availability`, et `/content/availability/public` pour un
 * visiteur), qui la calcule depuis `lessons.tier` — la seule source de
 * vérité, décidée par l'administrateur. Le serveur reste la frontière de
 * sécurité : chaque écriture (progression, preuve, séance de pratique, test
 * final) repasse par ContentAccess.
 *
 * Politique d'ouverture, comme tout le contexte : tant que la réponse n'est
 * pas arrivée, rien n'est verrouillé.
 */
export default function LessonAccessGate({ lessonId, title, children }) {
  const { isLessonLocked } = useContentAvailability();
  const chrome = useLessonChromeLayout();
  const { t } = useTranslation('lesson');

  if (!lessonId || !isLessonLocked(lessonId)) return children;

  return (
    <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
      <PremiumLessonLocked
        title={title}
        crumbs={(
          <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-8">
            <Link to="/courses" className="hover:text-blue-600">{t('index.home')}</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{title}</span>
          </nav>
        )}
      />
    </div>
  );
}
