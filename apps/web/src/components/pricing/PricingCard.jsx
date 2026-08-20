import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Crown } from 'lucide-react';

const PLANS = {
  free: {
    icon: Sparkles,
    badge: null,
    name: 'Gratuit',
    price: '0€',
    period: '',
    tagline: 'Pour découvrir et apprendre, sans limite de temps',
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
    features: [
      'Tout ce qui est inclus dans le compte gratuit',
      "L'intégralité du programme — 6e à Terminale",
      'Toutes les leçons, tous les chapitres',
      'Accès prioritaire aux nouveautés',
    ],
    ctaLabel: 'Être informé·e du lancement',
    ctaTo: '/contact',
    accent: true,
  },
};

export default function PricingCard({ plan, compact = false }) {
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
      {data.badge && (
        <span className="absolute -top-3 right-6 text-[11px] font-bold font-mono-jetbrains tracking-wider text-white px-3 py-1.5 rounded-full shadow-lg" style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
          {data.badge}
        </span>
      )}

      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${data.accent ? 'bg-white/10 text-amber-300' : 'text-white'}`} style={!data.accent ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {}}>
        <Icon size={20} />
      </div>

      <h3 className={`font-space font-bold text-xl mb-1 ${data.accent ? 'text-white' : 'text-slate-900'}`}>{data.name}</h3>
      <p className={`font-inter text-sm mb-5 ${data.accent ? 'text-slate-300' : 'text-slate-500'}`}>{data.tagline}</p>

      <div className="flex items-baseline gap-1.5 mb-6">
        <span className={`font-space font-black text-4xl ${data.accent ? 'text-white' : 'text-slate-900'}`}>{data.price}</span>
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
    </motion.div>
  );
}
