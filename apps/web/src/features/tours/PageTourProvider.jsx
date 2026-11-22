import { Suspense, createContext, lazy, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentsContext';
import { isFeatureOn } from '../../config/features';
import { scopedStorage } from '../../utils/storage';
import { fetchPageTours, closePageTour } from '../../services/tourService';
import { PAGE_TOURS } from './tourRegistry';
import { availableTour, findPageTour, shouldAutoStart, TOUR_STATUS } from './tourModel';

/**
 * « Visite de la page » (2026-10-07) — la visite guidée de la PREMIÈRE visite
 * d'une page, par rôle (élève, enseignant). Monté par StudentLayout et
 * TeacherLayout autour de la coquille : la barre latérale y lit
 * `usePageTour()` pour son bouton « Visite de la page ».
 *
 * Ce fichier est dans le lot d'entrée (StudentLayout est eager) : il ne
 * contient que le registre (des clés), la logique pure et deux appels
 * d'API. La carte, le projecteur et les textes (namespace `tour`, à la
 * demande) arrivent avec TourOverlay, paresseux, seulement quand une visite
 * s'ouvre. Voir docs/architecture/PAGE_TOURS.md.
 *
 * Fermer une visite (« Terminer » ou « Passer ») la CLÔT : le serveur l'écrit et
 * elle ne revient jamais d'elle-même. Quitter la page en pleine visite ne
 * la clôt pas : elle reprendra à la prochaine visite. Une clôture que le
 * réseau a perdue reste dans le navigateur (`tours.pending`) et repart au
 * prochain chargement — la visite ne se rouvre pas entre-temps.
 */
const TourOverlay = lazy(() => import('./TourOverlay'));

const PENDING_KEY = 'tours.pending';

const PageTourContext = createContext({ tour: null, start: () => {} });

export function usePageTour() {
  return useContext(PageTourContext);
}

function readPending() {
  try {
    const parsed = JSON.parse(scopedStorage.getItem(PENDING_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePending(pending) {
  if (Object.keys(pending).length === 0) scopedStorage.removeItem(PENDING_KEY);
  else scopedStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export default function PageTourProvider({ children }) {
  const { user, token } = useContext(AuthContext);
  const { pathname } = useLocation();
  const role = user?.role;
  // null = réponse du serveur pas encore arrivée : aucune visite ne s'ouvre.
  const [closed, setClosed] = useState(null);
  const [eligible, setEligible] = useState(true);
  // La visite EN COURS : { key, mode: 'auto' | 'replay' }.
  const [active, setActive] = useState(null);

  const { paymentsOpen } = usePayments();
  // Une visite (ou une étape) d'une fonction éteinte ou d'une surface commerciale
  // fermée n'existe pas : ni ouverture, ni bouton de relecture (availableTour).
  const tour = useMemo(
    () => availableTour(findPageTour(PAGE_TOURS, role, pathname), { isFeatureOn, paymentsOpen }),
    [role, pathname, paymentsOpen],
  );

  useEffect(() => {
    if (!token || (role !== 'student' && role !== 'teacher')) return undefined;
    let cancelled = false;
    const pending = readPending();
    fetchPageTours(token)
      .then((data) => {
        if (cancelled) return;
        setEligible(data.eligible !== false);
        setClosed({ ...(data.tours ?? {}), ...pending });
        // Les clôtures perdues repartent ; chacune quitte la file à son succès.
        Object.entries(pending).forEach(([key, value]) => {
          closePageTour(token, key, value.status, value.step)
            .then(() => {
              const rest = readPending();
              delete rest[key];
              writePending(rest);
            })
            .catch(() => {});
        });
      })
      // Serveur injoignable : on ne sait pas ce qui a été vu — on n'ouvre rien.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token, role]);

  // Ouverture automatique, page par page. Changer de page ferme la visite
  // en cours sans la clore.
  useEffect(() => {
    if (shouldAutoStart({ tour, closed, eligible })) setActive({ key: tour.key, mode: 'auto' });
    else setActive((current) => (current && current.key === tour?.key ? current : null));
  }, [tour, closed, eligible]);

  const start = useCallback(() => {
    if (tour) setActive({ key: tour.key, mode: 'replay' });
  }, [tour]);

  const finish = useCallback(
    (status, step) => {
      const key = active?.key;
      setActive(null);
      if (!key) return;
      setClosed((current) => ({ ...(current ?? {}), [key]: { status, step } }));
      const pending = { ...readPending(), [key]: { status, step } };
      writePending(pending);
      if (!token) return;
      closePageTour(token, key, status, step)
        .then(() => {
          const rest = readPending();
          delete rest[key];
          writePending(rest);
        })
        .catch(() => {});
    },
    [active, token],
  );

  // Une visite que la page ne peut pas jouer (aucune cible à l'écran) se
  // retire sans être close : elle retentera à la prochaine visite.
  const abandon = useCallback(() => setActive(null), []);

  const value = useMemo(() => ({ tour, start, active: Boolean(active) }), [tour, start, active]);
  const activeTour = active && tour && active.key === tour.key ? tour : null;

  return (
    <PageTourContext.Provider value={value}>
      {children}
      {activeTour && (
        <Suspense fallback={null}>
          <TourOverlay
            key={`${activeTour.key}:${active.mode}`}
            tour={activeTour}
            onFinish={() => finish(TOUR_STATUS.completed, activeTour.steps.length)}
            onSkip={(step) => finish(TOUR_STATUS.skipped, step)}
            onAbandon={abandon}
          />
        </Suspense>
      )}
    </PageTourContext.Provider>
  );
}
