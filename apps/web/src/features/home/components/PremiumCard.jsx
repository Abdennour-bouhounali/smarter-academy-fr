import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';

/**
 * MÊME COMPTE, DEUX LECTURES. « 3 دروس مدفوعة » est une bonne nouvelle pour
 * l'abonné (du contenu qui l'attend) et une invitation pour qui ne l'est
 * pas. La décision (`isPremium` / `canSeeUpgrade`) vient du serveur via
 * usePremiumStatus, et rien n'est peint tant qu'elle n'est pas arrivée.
 *
 * Aucun prix : le produit algérien se paie en espèces auprès d'un vendeur,
 * hors de l'application (master spec §17/§18). L'invitation mène à la
 * SAISIE D'UN CODE. Le premium reste SECONDAIRE : cette carte vient après
 * tout ce qui parle d'apprendre.
 */
export default function PremiumCard({ premiumCount, isPremium, canSeeUpgrade }) {
  const { t } = useTranslation('student');
  if (!premiumCount || (!isPremium && !canSeeUpgrade)) return null;

  const open = isPremium;
  return (
    <section
      aria-labelledby="home-premium-title"
      data-home-premium={open ? 'open' : 'locked'}
      className={`rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 ${
        open
          ? 'border-violet-200 bg-white'
          : 'border-amber-200 bg-gradient-to-br from-amber-50/60 to-white'
      }`}
    >
      <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 ${open ? 'bg-violet-100 text-violet-600' : 'bg-amber-100 text-amber-600'}`} aria-hidden="true">
        <Crown size={19} />
      </span>
      <div className="flex-1 min-w-0">
        <h2 id="home-premium-title" className="font-space font-bold text-slate-900 text-base">
          {open ? t('home.premiumOpenTitle') : t('home.premiumLockedTitle')}
        </h2>
        <p className="font-inter text-slate-600 text-sm mt-0.5">
          {open ? t('home.premiumOpen', { count: premiumCount }) : t('home.premiumLocked', { count: premiumCount })}
        </p>
      </div>
      <Link
        to={open ? '/espace/cours' : '/espace/activation'}
        className={`group inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl border bg-white text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 flex-shrink-0 ${
          open
            ? 'border-violet-200 text-violet-700 hover:border-violet-400 focus-visible:ring-violet-500'
            : 'border-amber-200 text-amber-800 hover:border-amber-400 focus-visible:ring-amber-500'
        }`}
      >
        {open ? t('home.premiumOpenCta') : t('home.premiumLockedCta')}
        <ArrowForward size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-1 group-hover:rtl:-translate-x-1" />
      </Link>
    </section>
  );
}
