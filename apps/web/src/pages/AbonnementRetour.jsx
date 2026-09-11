import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { fetchClosedContent } from '../services/contentAvailabilityService';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/**
 * Le retour depuis la page de paiement.
 *
 * ── CE QUE CETTE PAGE NE FAIT PAS ────────────────────────────────────────
 * Elle n'accorde aucun accès. Revenir ici avec `?statut=succes` ne prouve
 * RIEN : cette URL est dans la barre d'adresse, donc n'importe qui peut
 * l'ouvrir. Elle ne fait que DEMANDER au serveur où en est l'accès, et
 * afficher sa réponse.
 *
 * C'est pourquoi il n'y a pas de « Paiement réussi ! » : au moment où l'élève
 * arrive ici, le webhook de confirmation n'est peut-être pas encore parvenu au
 * serveur. Annoncer un succès puis afficher un contenu verrouillé serait pire
 * que d'annoncer une attente.
 *
 * ── L'attente, bornée ────────────────────────────────────────────────────
 * Le webhook arrive normalement en quelques secondes. On interroge donc le
 * serveur quelques fois, à intervalle croissant, puis on s'arrête et on laisse
 * la main à l'élève. Interroger sans fin ferait porter à chaque onglet ouvert
 * un trafic permanent pour une information qui, passé une minute, relève d'un
 * incident et non de la latence.
 */

/** Les instants (en ms) où l'on redemande l'état. Croissants, puis on cesse. */
const RETRY_DELAYS = [1500, 3000, 5000, 8000, 12000];

export default function AbonnementRetour() {
  useDocumentMeta('Abonnement', 'Activation de votre abonnement Smarter Academy.');

  const [params] = useSearchParams();
  const { token } = useContext(AuthContext);
  const cancelled = params.get('statut') === 'annule';

  const [access, setAccess] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [checking, setChecking] = useState(!cancelled);
  const [failed, setFailed] = useState(false);
  const timer = useRef(null);
  const alive = useRef(true);

  /** Demande au SERVEUR où en est l'accès. La seule autorité. */
  const refresh = useCallback(async () => {
    if (!token) return null;
    try {
      const result = await fetchClosedContent(token);
      if (!alive.current) return null;
      setAccess(result.access ?? null);
      setFailed(false);
      return result.access ?? null;
    } catch {
      if (alive.current) setFailed(true);
      return null;
    }
  }, [token]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (cancelled || !token) {
      setChecking(false);
      return undefined;
    }

    let stopped = false;

    (async () => {
      const result = await refresh();
      if (stopped || !alive.current) return;

      // L'accès est ouvert : plus rien à attendre.
      if (result?.premiumAccess) {
        setChecking(false);
        return;
      }

      // Sinon on repasse, un nombre BORNÉ de fois.
      if (attempt < RETRY_DELAYS.length) {
        timer.current = setTimeout(() => {
          if (alive.current) setAttempt((n) => n + 1);
        }, RETRY_DELAYS[attempt]);
      } else {
        setChecking(false);
      }
    })();

    return () => { stopped = true; };
  }, [attempt, cancelled, refresh, token]);

  const active = access?.premiumAccess === true;

  const handleManualRetry = async () => {
    setChecking(true);
    const result = await refresh();
    if (!result?.premiumAccess) setChecking(false);
  };

  // ── Paiement abandonné ────────────────────────────────────────────────
  if (cancelled) {
    return (
      <Shell
        icon={<XCircle size={28} />}
        tone="slate"
        title="Paiement annulé"
        body="Aucun montant n'a été débité. Tu peux reprendre quand tu veux."
      >
        <Link to="/tarifs" className={CTA_PRIMARY}>Revoir les tarifs</Link>
        <Link to="/espace" className={CTA_SECONDARY}>Retour à mon espace</Link>
      </Shell>
    );
  }

  // ── L'accès est ouvert — confirmé par le SERVEUR ──────────────────────
  if (active) {
    return (
      <Shell
        icon={<CheckCircle2 size={28} />}
        tone="emerald"
        title="Ton abonnement est actif"
        body="Tout le programme t'est désormais accessible, de la 6e à la Terminale."
      >
        <Link to="/espace/cours" className={CTA_PRIMARY}>
          Voir mes cours <ArrowRight size={16} />
        </Link>
        <Link to="/espace/profil" className={CTA_SECONDARY}>Mon profil</Link>
      </Shell>
    );
  }

  // ── En attente de confirmation ────────────────────────────────────────
  // Le libellé ne dit JAMAIS « paiement réussi » : le serveur n'a pas encore
  // confirmé, et il est seul à pouvoir le faire.
  return (
    <Shell
      icon={<Clock size={28} />}
      tone="amber"
      title="Activation en cours"
      body={
        failed
          ? "Nous n'arrivons pas à joindre le serveur pour le moment. Ton paiement, lui, n'est pas perdu."
          : "Ton paiement est en cours de confirmation. L'activation prend généralement quelques secondes."
      }
    >
      <button
        type="button"
        onClick={handleManualRetry}
        disabled={checking}
        className={`${CTA_PRIMARY} disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
        {checking ? 'Vérification…' : 'Vérifier à nouveau'}
      </button>
      <Link to="/espace" className={CTA_SECONDARY}>Retour à mon espace</Link>
      <p className="font-inter text-xs text-slate-400 mt-2 max-w-sm text-center">
        Si l'activation n'apparaît pas d'ici quelques minutes, contacte-nous : ton
        paiement est enregistré chez notre prestataire.
      </p>
    </Shell>
  );
}

const CTA_PRIMARY =
  'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-space font-bold text-sm text-white transition-all hover:-translate-y-0.5 bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-500/25';

const CTA_SECONDARY =
  'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-space font-bold text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors';

const TONES = {
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  slate: 'bg-slate-100 text-slate-500',
};

function Shell({ icon, tone, title, body, children }) {
  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-5 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-7 sm:p-9 flex flex-col items-center text-center gap-4"
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${TONES[tone]}`}>
            {icon}
          </div>
          <h1 className="font-space font-bold text-2xl text-slate-900">{title}</h1>
          <p className="font-inter text-slate-500 text-sm leading-relaxed max-w-sm">{body}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
