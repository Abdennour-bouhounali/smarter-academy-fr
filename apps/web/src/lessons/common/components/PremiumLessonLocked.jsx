import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';

/**
 * Le panneau « ce درس يتطلّب وصولاً كاملاً » — UN seul rendu, posé à la fois
 * par le sommaire de la leçon (LessonIndex) et par chaque module
 * (ModuleLayout), pour qu'une URL de module tapée directement ne contourne
 * pas le verrou affiché sur le sommaire.
 *
 * Il ne DÉCIDE rien : l'appelant le rend quand `isLessonLocked(code)` —
 * c'est-à-dire quand le SERVEUR a répondu que la leçon est premium
 * (lessons.tier, décidé par l'administrateur) et que ce compte n'y a pas
 * droit. Le serveur refuse de toute façon chaque écriture sur cette leçon
 * (ContentAccess) ; ce panneau évite seulement de laisser l'élève travailler
 * pour rien.
 *
 * @param {{ title: string, crumbs?: React.ReactNode }} props
 */
export default function PremiumLessonLocked({ title, crumbs = null }) {
  const { t } = useTranslation('access');

  return (
    <main className="sa-page py-8 flex-1" data-premium-locked>
      {crumbs}
      <div className="sa-premium-card-locked mx-auto max-w-lg rounded-2xl border p-8 text-center shadow-xs">
        <Lock size={28} className="mx-auto mb-4 text-violet-600" aria-hidden="true" />
        <h1 className="font-space text-xl font-bold text-slate-800 mb-2">{title}</h1>
        <p className="font-inter text-sm leading-relaxed text-slate-600 mb-6">
          {t('lockedHint')}
        </p>
        <Link
          to="/espace/activation"
          className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-5 py-2.5 font-inter text-sm font-bold text-white transition-colors hover:bg-violet-700"
        >
          {t('lockedCta')}
        </Link>
      </div>
    </main>
  );
}
