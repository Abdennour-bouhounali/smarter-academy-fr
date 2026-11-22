import { Suspense, lazy, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { UserCircle, Mail, GraduationCap, Sparkles, LogOut, Crown, ChevronDown } from 'lucide-react';
import SettingsButton from '../../features/settings/SettingsButton';
import { getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { useContentAvailability } from '../../context/ContentAvailabilityContext';
import { usePayments } from '../../context/PaymentsContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { getFullName, getInitials } from '../../utils/userDisplay';
import NameEditor from '../../components/account/NameEditor';
import { LOCALE } from '../../locale.js';

// « وليّ الأمر » — le « رابط الوليّ », sans compte parent (PARENT_SPACE.md §2) :
// chaînes du namespace à la demande `family` et QR (qrcode-generator) — carte
// paresseuse, sous son propre <Suspense>.
const ParentLinkCard = lazy(() => import('../../features/family/ParentLinkCard'));

/**
 * Une date d'échéance, sans heure : l'élève a besoin du jour, pas de la
 * minute. Le format suit LOCALE (ar-DZ) — une date d'accès affichée en
 * français dans une interface arabe était le dernier reste du produit
 * d'origine sur cette page.
 */
function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Profil() {
  const { t } = useTranslation('student');
  useDocumentMeta(t('profile.metaTitle'), t('profile.metaDescription'));
  const { user, updateGrade, logout } = useContext(AuthContext);
  // L'état d'accès vient du SERVEUR (GET /content/availability), jamais d'un
  // état local : cette carte AFFICHE une décision déjà prise, elle ne la prend
  // pas. Tant que la réponse n'est pas arrivée, `access` est nul et la carte
  // retombe sur « compte gratuit » — la même politique d'ouverture que le
  // reste du contexte, et le pire qu'elle produise est une invitation à
  // s'abonner montrée une seconde de trop à un abonné.
  const { access } = useContentAvailability();
  const { paymentsOpen } = usePayments();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const allGrades = getAllGrades();
  const currentGrade = allGrades.find((g) => g.id === user?.grade);

  const handleGradeChange = async (e) => {
    const newGrade = e.target.value;
    if (!newGrade || newGrade === user?.grade) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateGrade(newGrade);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error updating grade:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Ce que dit la carte de plan, dérivé de l'état d'accès du serveur.
  //
  // Les trois états ne se confondent pas : un accès offert par
  // l'administration n'est PAS un abonnement, et l'annoncer comme tel ferait
  // attendre à l'élève un renouvellement qui n'arrivera jamais. Rien n'est
  // dit de l'interne au-delà de ça — ni référence, ni motif, ni qui l'a
  // accordé.
  const plan = (() => {
    // Payments closed: the platform is free, and full access for the reason `payments_closed` is NOT a subscription —
    // one sentence, no plan, no code to enter (FRANCE_REBUILD_PLAN.md §4ter).
    if (!paymentsOpen) {
      return { premium: false, free: true, title: t('profile.planFreeForNow'), detail: null, iconClass: 'bg-emerald-50 text-emerald-600' };
    }
    if (access?.subscriptionActive) {
      return {
        premium: true,
        title: t('profile.planSubscriptionActive'),
        detail: access.expiresAt
          ? t('profile.planFullAccessUntil', { date: formatDate(access.expiresAt) })
          : t('profile.planFullAccess'),
        iconClass: 'bg-amber-100 text-amber-600',
      };
    }

    if (access?.premiumAccess) {
      return {
        premium: true,
        title: t('profile.planGranted'),
        detail: access.expiresAt
          ? t('profile.planFullAccessUntil', { date: formatDate(access.expiresAt) })
          : t('profile.planFullAccess'),
        iconClass: 'bg-indigo-100 text-nav-accent',
      };
    }

    return {
      premium: false,
      title: t('profile.planFree'),
      detail: t('profile.planFreeDetail'),
      iconClass: 'bg-slate-100 text-slate-500',
    };
  })();

  const initials = getInitials(user);

  return (
    <div className="sa-page py-8 sm:py-10">
      <div className="mb-8">
        <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5">
          <UserCircle size={13} /> {t('profile.eyebrow')}
        </p>
        <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">{t('profile.title')}</h1>
      </div>

      {/* Identity card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-7 mb-5" data-tour="profile.identity">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-space font-bold text-xl flex-shrink-0" style={{ background: '#3B5BDB' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-space font-bold text-slate-900 text-lg truncate" dir="auto">{getFullName(user)}</p>
            <p className="font-inter text-slate-500 text-sm flex items-center gap-1.5 truncate">
              <Mail size={13} className="flex-shrink-0" /> {user?.email}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <NameEditor />
        </div>

        <label htmlFor="profile-grade" className="block font-inter text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <GraduationCap size={15} className="text-blue-500" /> {t('profile.myGrade')}
        </label>
        <div className="relative">
          <select
            id="profile-grade"
            value={user?.grade || ''}
            onChange={handleGradeChange}
            disabled={saving}
            className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white font-inter text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-nav-accent/40 focus:border-blue-400 disabled:opacity-60 transition-all"
          >
            {!currentGrade && <option value="" disabled>{t('profile.selectGrade')}</option>}
            {allGrades.map((g) => (
              <option key={g.id} value={g.id}>{g.levelTitle} — {g.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        {saved && (
          <p className="mt-2 text-xs font-inter text-emerald-600 flex items-center gap-1">
            <Sparkles size={12} /> {t('profile.gradeUpdated')}
          </p>
        )}
        <p className="mt-2 font-inter text-slate-400 text-xs leading-relaxed">
          {t('profile.gradeChangeHint')}
        </p>
      </motion.div>

      {/* Plan card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6 sm:p-7 mb-5 flex items-center justify-between gap-4 flex-wrap" data-tour="profile.plan">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${plan.iconClass}`}>
            {plan.premium ? <Crown size={17} /> : <Sparkles size={17} />}
          </div>
          <div>
            <p className="font-space font-bold text-slate-800 text-sm">{plan.title}</p>
            {plan.detail && <p className="font-inter text-slate-500 text-xs mt-0.5">{plan.detail}</p>}
          </div>
        </div>
        {/* Les deux publics mènent au MÊME endroit — la saisie d'un code :
            il n'existe ni abonnement à gérer ni tarif à consulter dans le
            produit algérien (master spec §17/§18). Un élève déjà servi peut
            y empiler une seconde carte ; un élève sans accès y entre la
            sienne. Seul le libellé change. */}
        {!plan.free && <Link
          to="/espace/activation"
          className={plan.premium
            ? 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-space font-bold text-xs text-slate-700 border border-slate-300 transition-all hover:bg-slate-50'
            : 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-space font-bold text-xs text-white transition-all hover:-translate-y-0.5'}
          style={plan.premium ? undefined : { background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
        >
          {!plan.premium && <Crown size={14} />}
          تفعيل الوصول
        </Link>}
      </motion.div>

      <Suspense fallback={null}>
        <ParentLinkCard />
      </Suspense>

      {/* « الإعدادات » — les réglages de l'élève (niveaux de l'espace d'exercices…). */}
      <SettingsButton
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        testId="profile"
      />

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-inter text-sm font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors"
      >
        <LogOut size={15} />
        {t('profile.logout')}
      </motion.button>
    </div>
  );
}
