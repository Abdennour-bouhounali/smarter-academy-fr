import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Calendar, CreditCard, AlertTriangle, ArrowRight, RefreshCw, ExternalLink } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import {
  fetchSubscription,
  openBillingPortal,
  cancelSubscription,
  resumeSubscription,
} from '../services/billingService';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/**
 * « Où en est mon abonnement ? » — la page de gestion, phase 7.
 *
 * ── Cette page ne DÉCIDE de rien ─────────────────────────────────────────
 * Elle n'évalue aucune date, ne compare rien à l'horloge du poste, ne déduit
 * aucun droit. Le serveur répond `accessActive`, `canCancel`, `canResume` :
 * elle peint ces réponses. Une horloge de poste mal réglée ne doit pas
 * pouvoir afficher « actif » à qui ne l'est plus, ni l'inverse.
 *
 * ── Résilier ne retire rien tout de suite ────────────────────────────────
 * C'est le message le plus important de l'écran, et il est dit explicitement :
 * l'élève a payé jusqu'à une date, il la garde. Une interface qui laisserait
 * croire à une coupure immédiate ferait hésiter à résilier — ou pire, ferait
 * croire à une perte d'accès qui n'a pas lieu.
 */

/** Une date en français, sans heure : l'élève a besoin du jour. */
function formatDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatPrice(amountCents, currency) {
  if (typeof amountCents !== 'number') return null;
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${currency || 'EUR'}`;
  }
}

export default function Abonnement() {
  useDocumentMeta('Mon abonnement', 'Gérez votre abonnement Smarter Academy.');

  const { token } = useContext(AuthContext);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const alive = useRef(true);

  // `alive` est REMIS À VRAI au montage, pas seulement mis à faux au
  // démontage. En mode strict, React monte, démonte puis remonte : un drapeau
  // qui ne ferait que descendre resterait faux pour toujours après le premier
  // démontage, et la page se figeait sur son squelette — constaté au
  // navigateur, invisible aux tests de source.
  useEffect(() => {
    alive.current = true;

    return () => { alive.current = false; };
  }, []);

  const load = useCallback(async () => {
    // Pas encore de jeton : on ne reste PAS sur le squelette. Sans cette
    // sortie, la page s'immobilisait sur son état de chargement — trouvé au
    // navigateur, invisible aux tests de source.
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const state = await fetchSubscription(token);
      if (!alive.current) return;
      setBilling(state);
      setError(null);
    } catch (e) {
      if (alive.current) setError(e.message);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  /**
   * Une mutation : on remplace l'état par CELUI QUE LE SERVEUR REND.
   * Rien n'est deviné localement — si le serveur voit les choses autrement,
   * c'est lui qui a raison.
   */
  const mutate = useCallback(async (action, fn) => {
    setBusy(action);
    setError(null);
    try {
      const next = await fn(token);
      if (!alive.current) return;
      setBilling(next);
      setConfirmingCancel(false);
    } catch (e) {
      if (alive.current) setError(e.message);
    } finally {
      if (alive.current) setBusy(null);
    }
  }, [token]);

  const handlePortal = useCallback(async () => {
    setBusy('portal');
    setError(null);
    try {
      const url = await openBillingPortal(token);
      // Le portail est HÉBERGÉ par le fournisseur : on quitte le site.
      window.location.assign(url);
    } catch (e) {
      if (alive.current) {
        setError(e.message);
        setBusy(null);
      }
    }
  }, [token]);

  if (loading) {
    return (
      <div className="sa-page py-8 sm:py-10">
        <div className="animate-pulse space-y-4" data-testid="abonnement-chargement">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="h-40 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  const subscription = billing?.subscription ?? null;
  const accessActive = billing?.accessActive === true;
  const cancelScheduled = subscription?.cancelAtPeriodEnd === true;
  const endDate = formatDate(subscription?.endsAt || subscription?.currentPeriodEnd);
  const price = formatPrice(subscription?.amountCents, subscription?.currency);

  return (
    <div className="sa-page py-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Mon abonnement</h1>

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* ── L'état, dit par le serveur ────────────────────────────── */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <StatusHeadline
            accessActive={accessActive}
            adminOverride={billing?.adminOverrideActive === true}
            subscription={subscription}
            cancelScheduled={cancelScheduled}
            endDate={endDate}
          />

          {subscription && (
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Detail icon={Crown} label="Offre" value={subscription.planName || subscription.plan} />
              {price && (
                <Detail
                  icon={CreditCard}
                  label="Tarif"
                  value={subscription.interval === 'year' ? `${price} par an` : price}
                />
              )}
              {formatDate(subscription.startedAt) && (
                <Detail icon={Calendar} label="Depuis le" value={formatDate(subscription.startedAt)} />
              )}
              {endDate && (
                <Detail
                  icon={Calendar}
                  label={cancelScheduled ? "Accès jusqu'au" : 'Prochain renouvellement'}
                  value={endDate}
                />
              )}
            </dl>
          )}
        </section>

        {/* ── Les gestes, tels que le SERVEUR les autorise ──────────── */}
        <section className="mt-5 flex flex-wrap gap-3">
          {billing?.canManage && (
            <button
              type="button"
              onClick={handlePortal}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {busy === 'portal' ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ExternalLink className="h-4 w-4" aria-hidden="true" />}
              Gérer mon moyen de paiement
            </button>
          )}

          {billing?.canResume && (
            <button
              type="button"
              onClick={() => mutate('resume', resumeSubscription)}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {busy === 'resume' && <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Continuer mon abonnement
            </button>
          )}

          {billing?.canCancel && !confirmingCancel && (
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Résilier mon abonnement
            </button>
          )}

          {!subscription && !billing?.adminOverrideActive && (
            <Link
              to="/tarifs"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Découvrir les offres
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </section>

        {/* ── La confirmation : jamais sur un seul clic ─────────────── */}
        {confirmingCancel && (
          <section
            role="alertdialog"
            aria-labelledby="confirm-title"
            className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5"
          >
            <h2 id="confirm-title" className="text-base font-semibold text-amber-900">
              Résilier votre abonnement ?
            </h2>
            {/* Le point le plus important de l'écran : rien n'est perdu tout
                de suite. Les jours payés restent dus. */}
            <p className="mt-2 text-sm text-amber-900">
              {endDate
                ? `Votre accès reste ouvert jusqu'au ${endDate}. Aucun prélèvement ne sera fait après cette date.`
                : "Votre accès reste ouvert jusqu'à la fin de la période déjà payée."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => mutate('cancel', cancelSubscription)}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-60"
              >
                {busy === 'cancel' && <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Confirmer la résiliation
              </button>
              <button
                type="button"
                onClick={() => setConfirmingCancel(false)}
                disabled={busy !== null}
                className="rounded-xl border border-amber-300 px-4 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
              >
                Garder mon abonnement
              </button>
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}

/**
 * La phrase d'état.
 *
 * Quatre formulations distinctes, parce que quatre situations distinctes :
 * « actif », « actif mais se termine le … », « terminé », « gratuit ». Les
 * confondre laisserait l'élève dans le doute au moment précis où il cherche
 * une certitude.
 */
function StatusHeadline({ accessActive, adminOverride, subscription, cancelScheduled, endDate }) {
  if (adminOverride && !subscription) {
    return (
      <Headline tone="indigo" title="Accès administrateur actif">
        Un accès vous a été accordé par l'équipe. Aucun abonnement n'est nécessaire.
      </Headline>
    );
  }

  if (!subscription) {
    return (
      <Headline tone="slate" title="Vous utilisez actuellement l'accès gratuit">
        Les leçons gratuites restent ouvertes sans abonnement.
      </Headline>
    );
  }

  if (accessActive && cancelScheduled) {
    return (
      <Headline tone="amber" title="Votre abonnement prendra fin">
        {endDate
          ? `Votre accès reste actif jusqu'au ${endDate}. Vous pouvez revenir sur cette décision à tout moment.`
          : "Votre accès reste actif jusqu'à la fin de la période payée."}
      </Headline>
    );
  }

  if (accessActive) {
    return (
      <Headline tone="emerald" title="Votre abonnement est actif">
        {endDate ? `Prochain renouvellement le ${endDate}.` : 'Vous avez accès à tout le programme.'}
      </Headline>
    );
  }

  return (
    <Headline tone="slate" title="Votre abonnement est terminé">
      Les leçons gratuites restent ouvertes. Vous pouvez vous réabonner quand vous le souhaitez.
    </Headline>
  );
}

const TONES = {
  emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  amber: 'bg-amber-50 text-amber-900 border-amber-200',
  indigo: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  slate: 'bg-slate-50 text-slate-800 border-slate-200',
};

function Headline({ tone, title, children }) {
  return (
    <div className={`rounded-xl border p-4 ${TONES[tone] || TONES.slate}`}>
      <p className="text-base font-semibold" data-testid="abonnement-etat">{title}</p>
      <p className="mt-1 text-sm opacity-90">{children}</p>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
        <dd className="text-sm font-semibold text-slate-900 break-words">{value}</dd>
      </div>
    </div>
  );
}
