import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowForward } from '../common/DirectionalIcons';


/**
 * The entire free/premium concept, in one glance — not a 3-column plan
 * comparison (that's Tarifs's job). Just enough for DESIRE: here's what's
 * free, here's what unlocks more.
 */
export default function FreePremiumTeaser() {
  const { t } = useTranslation('marketing');

  return (
    <section className="px-4 py-14">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-6" aria-hidden="true">
          <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="w-3 h-3 rounded-full border-2 border-slate-200" />
          ))}
        </div>
        <p className="font-space font-bold text-xl sm:text-2xl text-slate-900 leading-snug text-balance mb-2">
          {t('freePremium.title')}
        </p>
        <p className="font-inter text-slate-500 text-base mb-6">
          {t('freePremium.body')}
        </p>
        {/* Mène à l'INSCRIPTION, et non à un tarif : il n'y a pas de page de
            prix dans le produit algérien, et la saisie d'un code exige un
            compte. Un visiteur anonyme doit donc d'abord en créer un. */}
        <Link to="/register" className="inline-flex items-center gap-1.5 font-inter text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          {t('freePremium.cta')}
          <ArrowForward size={15} />
        </Link>
      </m.div>
    </section>
  );
}
