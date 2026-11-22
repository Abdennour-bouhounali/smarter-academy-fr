import { useTranslation } from 'react-i18next';
import { Signpost } from 'lucide-react';
import { usePageTour } from './PageTourProvider';

/**
 * « جولة في الصفحة » — rejoue la visite guidée de la page ouverte. Une visite
 * close ne revient jamais d'elle-même ; ce bouton est la seule façon de la
 * revoir. Absent sur une page sans visite. Libellé dans `nav` (eager).
 */
export default function TourReplayButton({ className = '', iconSize = 15 }) {
  const { t } = useTranslation('nav');
  const { tour, start, active } = usePageTour();
  if (!tour) return null;
  return (
    <button
      type="button"
      onClick={start}
      disabled={active}
      aria-label={t('tourReplay')}
      title={t('tourReplay')}
      className={className}
      data-tour-replay
    >
      <Signpost size={iconSize} aria-hidden="true" />
    </button>
  );
}
