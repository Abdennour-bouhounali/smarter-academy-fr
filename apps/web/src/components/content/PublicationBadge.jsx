import { useTranslation } from 'react-i18next';
import { EyeOff } from 'lucide-react';
import { STATUS_TONES } from '../admin/ui/StatusBadge';

/**
 * L'ÉTAT DE PUBLICATION d'une leçon ou d'un module, montré au seul
 * RELECTEUR (administrateur, enseignant ambassadeur « سفير »).
 *
 * Rien n'est rendu pour un contenu publié — ni pour tout autre compte : le
 * contexte de disponibilité ne connaît l'état que pour le relecteur
 * (ContentAvailabilityContext › lessonStatus / moduleStatus), et répond
 * 'published' à tous les autres. Les couleurs sont celles de l'administration
 * (StatusBadge) : un seul vocabulaire visuel pour un seul état. Le texte porte
 * l'information, la couleur ne fait que la répéter.
 */
export default function PublicationBadge({ status, className = '' }) {
  const { t } = useTranslation('common');
  if (!status || status === 'published') return null;
  const tone = STATUS_TONES[status] ?? STATUS_TONES.draft;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-inter text-[11px] font-bold ${tone} ${className}`}
      data-publication-status={status}
      title={t('publication.hint')}
    >
      <EyeOff size={11} aria-hidden="true" />
      {t(`publication.${status}`, { defaultValue: status })}
    </span>
  );
}
