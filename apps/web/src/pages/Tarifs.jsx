import { motion } from 'framer-motion';
import { Tag, CreditCard, ShieldCheck, HelpCircle } from 'lucide-react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PricingCard from '../components/pricing/PricingCard';
import { AuthContext } from '../context/AuthContext';
import { useContentAvailability } from '../context/ContentAvailabilityContext';
import { fetchPlans, startCheckout } from '../services/billingService';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const reassurances = [
  { icon: CreditCard, text: 'Aucune carte bancaire pour le compte gratuit' },
  { icon: ShieldCheck, text: 'Résiliable à tout moment, sans engagement' },
  { icon: Tag, text: 'Un seul tarif, aucune option cachée' },
];

/** 3500 centimes → « 35€ ». Le serveur fait autorité sur le prix. */
function formatPrice(cents, currency = 'EUR') {
  if (typeof cents !== 'number') return null;
  const amount = cents / 100;
  const symbol = currency === 'EUR' ? '€' : ` ${currency}`;
  return Number.isInteger(amount) ? `${amount}${symbol}` : `${amount.toFixed(2)}${symbol}`;
}

export default function Tarifs() {
  const { user, token } = useContext(AuthContext);
  const { access } = useContentAvailability();
  const navigate = useNavigate();
  const hasAccount = Boolean(user);
  const isPremium = access?.premiumAccess === true;

  // Les offres viennent du SERVEUR : le bundle peut être en retard sur un
  // changement de tarif, et deux définitions du prix finiraient par diverger.
  const [catalog, setCatalog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    fetchPlans(token)
      .then((result) => { if (!cancelled) setCatalog(result); })
      // Échec silencieux : la carte retombe sur le prix du bundle plutôt que
      // de laisser la page vide. Le serveur refusera de toute façon un achat
      // qu'il ne reconnaît pas.
      .catch(() => {});

    return () => { cancelled = true; };
  }, [token]);

  const annual = catalog?.plans?.find((p) => p.key === 'annual') ?? null;

  const handleSubscribe = useCallback(async () => {
    // Sans compte, il n'y a rien à facturer : on envoie vers l'inscription.
    if (!token) {
      navigate('/register');
      return;
    }

    // La garde du double clic. La clé d'idempotence côté serveur est la
    // seconde barrière ; celle-ci évite d'y arriver.
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const { checkoutUrl } = await startCheckout(token, 'annual');
      // Redirection vers la page HÉBERGÉE par le prestataire : aucun numéro
      // de carte n'atteint jamais ce domaine.
      window.location.assign(checkoutUrl);
    } catch (e) {
      // Le message du serveur est fait pour être lu par l'élève
      // (« Vous êtes déjà abonné »). On le montre tel quel.
      setError(e?.message || "Le paiement n'a pas pu être ouvert.");
      setBusy(false);
    }
  }, [busy, navigate, token]);

  useDocumentMeta(
    'Tarifs',
    "Tarifs Smarter Academy : un compte gratuit sans carte bancaire, et un abonnement Premium à 35€/an avec un mois offert."
  );

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="py-16 sm:py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-5">
              <Tag size={14} />
              Tarifs
            </div>
            <h1 className="font-space font-bold text-4xl sm:text-5xl text-slate-900 mb-5 text-balance">
              Simple, transparent, sans surprise
            </h1>
            <p className="font-inter text-slate-600 text-lg leading-relaxed">
              Un plan gratuit pour découvrir sérieusement la plateforme. Un plan Premium pour débloquer tout le programme.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* `owned` vient du SERVEUR : la page affiche une décision déjà
              prise, elle n'en prend aucune. Un visiteur anonyme n'a pas
              d'état d'accès, et voit donc les deux offres normalement. */}
          <PricingCard plan="free" owned={hasAccount && !isPremium} />
          <PricingCard
            plan="premium"
            owned={isPremium}
            // Le bouton d'achat n'apparaît que pour un élève qui peut acheter.
            // Un abonné voit son état ; un visiteur garde le lien d'origine.
            onSubscribe={isPremium ? undefined : handleSubscribe}
            busy={busy}
            unavailable={annual !== null && annual.purchasable === false}
            priceLabel={annual ? formatPrice(annual.amountCents, annual.currency) : undefined}
            error={error}
          />
        </div>
      </section>

      {/* Reassurance strip */}
      <section className="px-4 py-10">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {reassurances.map((r) => (
            <div key={r.text} className="flex items-center gap-2.5 text-slate-500">
              <r.icon size={16} className="text-blue-400 flex-shrink-0" />
              <span className="font-inter text-sm">{r.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Note on premium availability */}
      <section className="px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass-card p-6 sm:p-7 flex items-start gap-4"
        >
          <HelpCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="font-inter text-slate-600 text-sm leading-relaxed">
            L'abonnement Premium est en préparation. En attendant, le compte gratuit donne déjà accès à
            2 leçons complètes par niveau — la meilleure façon de juger si Smarter Academy te convient. Des questions ?{' '}
            <Link to="/faq" className="text-blue-600 font-semibold hover:underline">Consulte la FAQ</Link>{' '}
            ou <Link to="/contact" className="text-blue-600 font-semibold hover:underline">contacte-nous</Link>.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
