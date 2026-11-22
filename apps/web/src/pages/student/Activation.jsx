import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { KeyRound, CheckCircle2, AlertCircle, Crown, Info } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useContentAvailability } from '../../context/ContentAvailabilityContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { redeemActivationCode } from '../../services/activationService';
import { LOCALE } from '../../locale';

/**
 * « J'ai acheté une carte » — la saisie d'un code d'activation
 * (ALGERIA_PLATFORM_MASTER_SPEC.md §17).
 *
 * Cette page n'ACCORDE rien. Elle transmet un code et affiche ce que le
 * serveur a décidé : `access` vient de la réponse, jamais d'un calcul local.
 * Modifier cet état dans le navigateur ne donne accès à aucune leçon — c'est
 * ContentAccess, côté API, qui refuse.
 *
 * ── Le code se saisit en caractères latins, dans une page arabe ─────────
 * L'interface est en arabe et lue de droite à gauche ; le code, lui, est une
 * suite de lettres latines et de chiffres imprimée sur une carte. Le champ
 * porte donc `dir="ltr"` : sans cela, les tirets et le curseur sauteraient
 * d'un bout à l'autre pendant la frappe. C'est la même règle que pour les
 * mathématiques (MathText) — l'arabe pour la langue, le latin pour ce qui
 * n'est pas de la langue.
 */

/** Une date d'échéance, en arabe algérien et sans heure. */
function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Met en forme la saisie pendant la frappe : XXXX-XXXX-XXXX.
 *
 * Purement visuel — le serveur normalise de toute façon, et accepte aussi
 * bien les minuscules, les espaces que l'absence de tirets. Le formatage
 * existe pour que ce que l'élève voit à l'écran ressemble à ce qu'il a sous
 * les yeux sur sa carte.
 */
function formatCodeInput(raw) {
  const symbols = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  return symbols.match(/.{1,4}/g)?.join('-') ?? '';
}

export default function Activation() {
  const { t } = useTranslation('access');
  useDocumentMeta('تفعيل الوصول', 'أدخل رمز التفعيل لفتح كامل الدروس.');

  const { token } = useContext(AuthContext);
  const { access, refresh } = useContentAvailability();

  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isPremium = access?.premiumAccess === true;

  /**
   * Le message de refus, choisi d'après le MOTIF rendu par le serveur.
   *
   * Les quatre motifs appellent quatre conduites différentes : retaper,
   * contacter le vendeur, ou ne rien faire. Un message unique les laisserait
   * tous à la même impasse. Le défaut couvre ce qui n'est pas un refus métier
   * (panne réseau, erreur serveur).
   */
  const messageFor = (err) => {
    if (err?.type === 'RATE_LIMITED') return t('errorRateLimited');

    switch (err?.reason) {
      case 'invalid': return t('errorInvalid');
      case 'already_activated': return t('errorAlreadyActivated');
      case 'expired': return t('errorExpired');
      case 'revoked': return t('errorRevoked');
      default: return t('errorGeneric');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (pending) return;

    setError(null);
    setSuccess(null);

    if (!code.trim()) {
      setError(t('errorRequired'));
      return;
    }

    setPending(true);
    try {
      const result = await redeemActivationCode(token, code);
      setSuccess({ until: result?.activatedUntil ?? null });
      setCode('');
      // Le reste de l'application doit apprendre le nouvel état : sans cette
      // relecture, chaque carte de leçon garderait son cadenas jusqu'au
      // prochain rechargement, et l'élève croirait que son code n'a rien fait.
      await refresh().catch(() => {});
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="sa-page py-8 sm:py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('activationTitle')}</h1>
          <p className="text-slate-600">{t('activationSubtitle')}</p>
        </header>

        {/* L'état d'accès courant — une lecture, pas une promesse. */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 sm:p-6"
          aria-label={t('statusTitle')}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isPremium ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">
                {isPremium ? t('statusPremium') : t('statusFree')}
              </p>
              <p className="text-sm text-slate-600 mt-0.5">
                {isPremium ? t('statusPremiumBody') : t('statusFreeBody')}
              </p>
              {isPremium && (
                <p className="text-sm text-slate-500 mt-1">
                  {access?.expiresAt
                    ? t('statusUntil', { date: formatDate(access.expiresAt) })
                    : t('statusUnlimited')}
                  {access?.activationCodeActive ? ` · ${t('statusViaActivationCode')}` : ''}
                  {!access?.activationCodeActive && access?.adminOverrideActive
                    ? ` · ${t('statusViaAdmin')}`
                    : ''}
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* Le succès — annoncé, daté, et suivi d'une porte de sortie. */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
            className="glass-card p-5 sm:p-6 border-emerald-200 bg-emerald-50/60"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-emerald-900">{t('successTitle')}</p>
                <p className="text-sm text-emerald-800 mt-0.5">{t('successBody')}</p>
                <p className="text-sm text-emerald-700 mt-1">
                  {success.until
                    ? t('successUntil', { date: formatDate(success.until) })
                    : t('successUnlimited')}
                </p>
                <Link
                  to="/espace/cours"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-emerald-800 hover:text-emerald-900"
                >
                  {t('goToCourses')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* La saisie. */}
        <section className="glass-card p-5 sm:p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="activation-code" className="block font-semibold text-slate-900">
                {t('codeLabel')}
              </label>

              <div className="relative">
                {/* PHYSIQUEMENT à gauche, et non `start-3` : le champ est
                    `dir="ltr"`, donc son début est à gauche même dans une page
                    arabe. Une icône logique se serait posée à droite, c'est-à-
                    dire à la FIN du champ qu'elle annonce. Même raison que le
                    bouton « afficher le mot de passe » de la page de connexion. */}
                <span className="absolute left-0 inset-y-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <KeyRound className="w-5 h-5" />
                </span>
                <input
                  id="activation-code"
                  name="code"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  // Le champ est LTR dans une page RTL : le code est une suite
                  // latine, et le laisser suivre la direction de la page ferait
                  // sauter le curseur et les tirets pendant la frappe.
                  dir="ltr"
                  value={code}
                  onChange={(e) => setCode(formatCodeInput(e.target.value))}
                  placeholder={t('codePlaceholder')}
                  aria-describedby="activation-code-hint"
                  aria-invalid={error ? 'true' : undefined}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white
                             font-mono tracking-[0.2em] text-lg text-center text-slate-900
                             focus:outline-none focus:ring-2 focus:ring-nav-accent focus:border-transparent"
                />
              </div>

              <p id="activation-code-hint" className="text-sm text-slate-500">
                {t('codeHint')}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-nav-accent text-white font-semibold
                         hover:bg-[#3350c4] disabled:opacity-60 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-nav-accent focus:ring-offset-2"
            >
              {pending ? t('submitLoading') : t('submit')}
            </button>

            {isPremium && !success && (
              <p className="text-sm text-slate-500">{t('anotherCode')}</p>
            )}
          </form>
        </section>

        {/* Pour qui n'a pas de carte : comment s'en procurer une. Aucun
            paiement en ligne — le modèle est l'espèce (master spec §18). */}
        <section className="glass-card p-5 sm:p-6 bg-slate-50/60">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">{t('howToBuyTitle')}</p>
              <p className="text-sm text-slate-600 mt-1">{t('howToBuyBody')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
