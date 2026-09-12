import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Crown, Loader2, AlertCircle } from 'lucide-react';

const PLANS = {
  free: {
    icon: Sparkles,
    badge: null,
    name: 'Gratuit',
    price: '0€',
    period: '',
    tagline: 'Pour découvrir et apprendre, sans limite de temps',
    ownedTagline: 'Pour découvrir et apprendre, sans limite de temps',
    features: [
      'Compte gratuit — aucune carte bancaire',
      '2 leçons complètes par niveau',
      'Leçons interactives et exercices',
      'Feedback immédiat',
      'Suivi de progression',
    ],
    ctaLabel: 'Commencer gratuitement',
    ctaTo: '/register',
    accent: false,
  },
  premium: {
    icon: Crown,
    badge: '1 mois offert',
    name: 'Premium',
    price: '35€',
    period: '/ an',
    tagline: "Débloque le programme complet, tous niveaux confondus",
    // Ce que l'offre EST, une fois qu'on l'a — au présent, pas au futur.
    ownedTagline: 'Le programme complet, tous niveaux confondus',
    features: [
      'Tout ce qui est inclus dans le compte gratuit',
      "L'intégralité du programme — 6e à Terminale",
      'Toutes les leçons, tous les chapitres',
      'Accès prioritaire aux nouveautés',
    ],
    // Le lien par défaut, quand la page appelante ne monte pas la logique
    // d'achat (l'accueil, par exemple). Il menait vers « être informé du
    // lancement » — l'abonnement EST lancé ; il mène désormais vers la page
    // qui sait quoi proposer à chaque public.
    ctaLabel: "Voir l'abonnement",
    ctaTo: '/tarifs',
    accent: true,
  },
};

/**
 * @param {object} props
 * @param {'free'|'premium'} props.plan
 * @param {boolean} [props.owned]  l'élève possède DÉJÀ ce plan. Le bouton
 *        d'appel devient alors un état : proposer de souscrire ce qu'on a
 *        déjà payé est le genre de détail qui fait douter d'avoir payé.
 * @param {string} [props.ownedLabel]  comment NOMMER ce que l'élève possède
 *        (« Abonnement actif », « Accès premium actif »…). L'appelant le sait,
 *        la carte ne le devine pas : un accès offert par l'administration
 *        n'est pas un abonnement, et le dire ferait attendre un
 *        renouvellement qui n'arrivera jamais.
 * @param {() => void} [props.onSubscribe]  déclenche l'ouverture du paiement.
 *        Absent, la carte garde son lien d'origine — c'est ce qui permet à la
 *        page d'accueil de l'afficher sans monter toute la logique d'achat.
 * @param {boolean} [props.busy]  un paiement est en cours d'ouverture.
 * @param {boolean} [props.unavailable]  offre non configurée côté serveur.
 * @param {string} [props.priceLabel]  le prix servi par le SERVEUR, qui fait
 *        autorité sur celui du bundle (lequel peut être en retard).
 * @param {string} [props.error]  le refus du serveur, à montrer tel quel.
 */
export default function PricingCard({
  plan,
  compact = false,
  owned = false,
  ownedLabel,
  onSubscribe,
  busy = false,
  unavailable = false,
  priceLabel,
  error,
}) {
  const data = PLANS[plan];
  if (!data) return null;
  const Icon = data.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={`relative flex flex-col p-7 sm:p-8 rounded-[20px] ${
        data.accent
          ? 'bg-slate-900 text-white shadow-2xl'
          : 'glass-card text-slate-900'
      }`}
    >
      {/* « 1 mois offert » est une accroche de lancement : la montrer à qui a
          déjà souscrit annonce un cadeau qui ne le concerne plus. */}
      {data.badge && !owned && (
        <span className="absolute -top-3 right-6 text-[11px] font-bold font-mono-jetbrains tracking-wider text-white px-3 py-1.5 rounded-full shadow-lg" style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
          {data.badge}
        </span>
      )}

      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${data.accent ? 'bg-white/10 text-amber-300' : 'text-white'}`} style={!data.accent ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {}}>
        <Icon size={20} />
      </div>

      <h3 className={`font-space font-bold text-xl mb-1 ${data.accent ? 'text-white' : 'text-slate-900'}`}>{data.name}</h3>
      <p className={`font-inter text-sm mb-5 ${data.accent ? 'text-slate-300' : 'text-slate-500'}`}>
        {owned && data.ownedTagline ? data.ownedTagline : data.tagline}
      </p>

      <div className="flex items-baseline gap-1.5 mb-6">
        <span className={`font-space font-black text-4xl ${data.accent ? 'text-white' : 'text-slate-900'}`}>{priceLabel || data.price}</span>
        {data.period && <span className={`font-inter text-sm font-medium ${data.accent ? 'text-slate-400' : 'text-slate-400'}`}>{data.period}</span>}
      </div>

      {!compact && (
        <ul className="space-y-3 mb-8 flex-1">
          {data.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className={`flex-shrink-0 mt-0.5 ${data.accent ? 'text-emerald-400' : 'text-emerald-500'}`} />
              <span className={`font-inter text-sm leading-relaxed ${data.accent ? 'text-slate-200' : 'text-slate-600'}`}>{f}</span>
            </li>
          ))}
        </ul>
      )}

      {owned ? (
        // Un état, pas un bouton : il n'y a rien à faire ici, et un lien
        // cliquable inviterait à agir sans rien à obtenir.
        <div
          className={`mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-space font-bold text-sm ${
            data.accent ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <CheckCircle2 size={16} />
          {ownedLabel || 'Ton offre actuelle'}
        </div>
      ) : unavailable ? (
        // Offre proposée mais non configurée côté serveur : un état, pas un
        // bouton qui échouerait au clic.
        <div
          className={`mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-space font-bold text-sm ${
            data.accent ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-slate-400'
          }`}
        >
          <AlertCircle size={16} />
          Indisponible
        </div>
      ) : onSubscribe ? (
        // Le bouton d'achat. `disabled` pendant l'ouverture : c'est ce qui
        // empêche qu'un double clic ouvre deux sessions de paiement (la clé
        // d'idempotence côté serveur est la seconde barrière, pas la seule).
        <button
          type="button"
          onClick={onSubscribe}
          disabled={busy}
          aria-busy={busy}
          className={`mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-space font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
            data.accent
              ? 'bg-white text-slate-900 hover:bg-slate-100'
              : 'text-white'
          }`}
          style={!data.accent ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' } : {}}
        >
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Redirection…
            </>
          ) : (
            "S'abonner"
          )}
        </button>
      ) : (
        <Link
          to={data.ctaTo}
          className={`mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-space font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 ${
            data.accent
              ? 'bg-white text-slate-900 hover:bg-slate-100'
              : 'text-white'
          }`}
          style={!data.accent ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' } : {}}
        >
          {data.ctaLabel}
        </Link>
      )}

      {/* Le refus du serveur, montré tel quel : « Vous êtes déjà abonné »
          est actionnable, « une erreur est survenue » ne l'est pas. */}
      {error && (
        <p
          role="alert"
          className={`mt-3 font-inter text-xs leading-relaxed ${data.accent ? 'text-amber-200' : 'text-red-600'}`}
        >
          {error}
        </p>
      )}
    </motion.div>
  );
}
