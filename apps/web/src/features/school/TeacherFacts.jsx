import { useTranslation } from 'react-i18next';

/**
 * Les FAITS d'un enseignant (décision D4, SCHOOL_ADMIN_SPACE.md) — le même
 * composant pour le directeur (« الأساتذة ») et pour l'enseignant (« مؤسستي ») :
 * ce que l'un lit, l'autre le lit aussi, au mot près. Jamais une note.
 */
export default function TeacherFacts({ facts }) {
  const { t } = useTranslation('idara');
  if (!facts) return null;
  const days = facts.windowDays;
  const items = [
    ['classes', facts.classes],
    ['students', facts.students],
    ['interventionsOpened', facts.interventionsOpened],
    ['interventionsClosed', facts.interventionsClosed],
  ];

  return (
    <dl className="grid grid-cols-2 gap-2 lg:grid-cols-5" data-teacher-facts>
      {items.map(([key, value]) => (
        <div key={key} className="rounded-xl bg-slate-50 p-3">
          <dt className="font-inter text-xs text-slate-500">{t(`facts.${key}`, { days })}</dt>
          <dd className="mt-1 font-space text-lg font-bold text-slate-900" dir="ltr">{value}</dd>
        </div>
      ))}
      <div className="rounded-xl bg-slate-50 p-3">
        <dt className="font-inter text-xs text-slate-500">{t('facts.lastSignIn')}</dt>
        <dd className="mt-1 font-inter text-sm font-semibold text-slate-900">
          {facts.lastSignInAt
            ? new Date(facts.lastSignInAt).toLocaleDateString('ar-DZ', { dateStyle: 'medium', numberingSystem: 'latn' })
            : t('common.never')}
        </dd>
      </div>
    </dl>
  );
}
