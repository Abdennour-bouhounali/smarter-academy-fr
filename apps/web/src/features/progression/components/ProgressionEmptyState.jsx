import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';

/**
 * L'élève n'a encore rien commencé : pas de chiffres à zéro qui feraient
 * peur, une invitation — et l'arbre du programme reste visible dessous,
 * pour qu'il sache où il commence.
 */
export default function ProgressionEmptyState() {
  const { t } = useTranslation('student');
  return (
    <div className="glass-card p-8 sm:p-10 text-center mb-10" data-progression-empty>
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-nav-accent-soft text-nav-accent mb-4" aria-hidden="true">
        <BookOpen size={26} />
      </span>
      <h2 className="font-space font-bold text-slate-900 text-xl">{t('progression.emptyTitle')}</h2>
      <p className="font-inter text-slate-500 text-sm mt-2 max-w-md mx-auto">{t('progression.emptyBody')}</p>
      <Link to="/espace/cours" className="btn-primary text-sm inline-flex mt-6">
        {t('progression.emptyCta')} <ArrowForward size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}
