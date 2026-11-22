import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { ChevronBack, ChevronForward } from '../../components/common/DirectionalIcons';
import { nextPlayableIndex, placeCard, playableSteps } from './tourModel';

/**
 * La CARTE et le PROJECTEUR d'une « Visite de la page » — lot paresseux, chargé
 * par PageTourProvider quand une visite s'ouvre, avec le namespace `tour`
 * (à la demande : ce composant est sous une frontière <Suspense>).
 *
 * NE BLOQUE RIEN : le voile et le projecteur ont `pointer-events: none` ; la
 * page reste cliquable, défilable, navigable. Seule la carte reçoit les clics.
 * Changer de page ferme la visite sans la clore (PageTourProvider).
 *
 * Les cibles sont des SÉLECTEURS CSS (`[data-home-hero]`, `[data-tour="…"]`) :
 * le premier élément VISIBLE l'emporte, donc une même étape vise la barre
 * latérale sur grand écran et la barre du bas sur téléphone. Les pages
 * chargent leurs données après coup : on attend les cibles (≤ WAIT_MAX_MS)
 * avant de choisir les étapes jouables.
 */
const POLL_MS = 150;
const WAIT_MAX_MS = 6000;
// Une fois une cible trouvée, on laisse aux autres ce délai pour paraître.
const SETTLE_MS = 1200;
const SPOT_PAD = 6;

function findVisible(selector) {
  let nodes;
  try {
    nodes = document.querySelectorAll(selector);
  } catch {
    return null;
  }
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const style = window.getComputedStyle(node);
    if (style.visibility === 'hidden' || style.display === 'none') continue;
    return node;
  }
  return null;
}

const hasTarget = (selector) => findVisible(selector) !== null;

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isTyping(element) {
  if (!element) return false;
  const tag = element.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable;
}

function sameRect(a, b) {
  if (!a || !b) return a === b;
  return Math.abs(a.top - b.top) < 0.5 && Math.abs(a.left - b.left) < 0.5
    && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5;
}

export default function TourOverlay({ tour, onFinish, onSkip, onAbandon }) {
  const { t } = useTranslation('tour');
  const [steps, setSteps] = useState(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [cardSize, setCardSize] = useState({ width: 352, height: 200 });
  const cardRef = useRef(null);
  // Les rappels du fournisseur changent à chaque rendu : lus par référence,
  // ils ne relancent ni l'attente ni le suivi de la cible.
  const callbacks = useRef({ onFinish, onSkip, onAbandon });
  callbacks.current = { onFinish, onSkip, onAbandon };

  // 1. Attendre que la page ait posé ses cibles, puis garder les étapes jouables.
  useEffect(() => {
    let cancelled = false;
    const started = Date.now();
    let firstSeen = null;
    const targeted = tour.steps.filter((s) => s.target);
    const tick = () => {
      if (cancelled) return;
      const found = targeted.filter((s) => hasTarget(s.target)).length;
      if (found > 0 && firstSeen === null) firstSeen = Date.now();
      const settled = found === targeted.length
        || (firstSeen !== null && Date.now() - firstSeen >= SETTLE_MS)
        || Date.now() - started >= WAIT_MAX_MS;
      if (!settled) {
        window.setTimeout(tick, POLL_MS);
        return;
      }
      const playable = playableSteps(tour.steps, hasTarget);
      if (playable.length === 0) callbacks.current.onAbandon();
      else setSteps(playable);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [tour]);

  const step = steps?.[index] ?? null;

  // 2. Amener la cible à l'écran à chaque étape, puis suivre sa position.
  useEffect(() => {
    if (!step) return undefined;
    if (!step.target) {
      setRect(null);
      return undefined;
    }
    const element = findVisible(step.target);
    if (!element) {
      // Disparue entre-temps (la page a changé d'état) : on saute.
      const next = nextPlayableIndex(steps, index, 1, hasTarget);
      if (next >= 0) setIndex(next);
      else callbacks.current.onFinish();
      return undefined;
    }
    const box = element.getBoundingClientRect();
    if (box.top < 0 || box.bottom > window.innerHeight) {
      element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
    let frame = 0;
    let last = null;
    const follow = () => {
      const live = findVisible(step.target) ?? element;
      const r = live.getBoundingClientRect();
      const next = { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right };
      if (!sameRect(next, last)) {
        last = next;
        setRect(next);
      }
      frame = window.requestAnimationFrame(follow);
    };
    follow();
    return () => window.cancelAnimationFrame(frame);
  }, [step, steps, index]);

  // 3. La taille réelle de la carte, pour la poser sans déborder.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;
    const measure = () => {
      const { width, height } = card.getBoundingClientRect();
      setCardSize((s) => (Math.abs(s.width - width) < 0.5 && Math.abs(s.height - height) < 0.5 ? s : { width, height }));
    };
    measure();
    if (typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [step]);

  // Le focus suit l'étape (lecteur d'écran, clavier) sans faire défiler la page.
  useEffect(() => {
    if (step) cardRef.current?.focus({ preventScroll: true });
  }, [step]);

  const go = useCallback(
    (dir) => {
      if (!steps) return;
      const next = nextPlayableIndex(steps, index, dir, hasTarget);
      if (next >= 0) setIndex(next);
      else if (dir > 0) callbacks.current.onFinish();
    },
    [steps, index],
  );

  const skip = useCallback(() => callbacks.current.onSkip(index), [index]);

  // Échap = « Passer » ; flèches = étape suivante / précédente, dans le sens
  // de lecture de la plateforme (locale.js : → est « Suivant » de gauche à
  // droite). Jamais pendant une saisie.
  useEffect(() => {
    if (!step) return undefined;
    const onKey = (event) => {
      if (isTyping(event.target) && event.target !== cardRef.current) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        skip();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const forward = event.key === 'ArrowRight'; // left to right: → goes forward
        event.preventDefault();
        go(forward ? 1 : -1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, skip, go]);

  if (!steps || !step) return null;

  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const spot = rect && {
    top: rect.top - SPOT_PAD,
    left: rect.left - SPOT_PAD,
    width: rect.width + SPOT_PAD * 2,
    height: rect.height + SPOT_PAD * 2,
    bottom: rect.bottom + SPOT_PAD,
  };
  const place = placeCard({ target: step.target ? spot : null, card: cardSize, viewport });
  const isFirst = index === 0;
  const isLast = nextPlayableIndex(steps, index, 1, hasTarget) < 0;
  const motion = prefersReducedMotion() ? '' : 'transition-all duration-200 ease-out';
  const base = `${tour.key}.${step.id}`;
  const titleId = `sa-tour-title-${step.id}`;
  const bodyId = `sa-tour-body-${step.id}`;

  return createPortal(
    <div data-page-tour={tour.key} data-tour-step={step.id}>
      {/* Le voile : il assombrit sans rien intercepter. */}
      {spot ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none fixed z-[95] rounded-2xl ring-2 ring-nav-accent ${motion}`}
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)',
          }}
          data-tour-spotlight
        />
      ) : (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95] bg-slate-900/45" />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        className={`fixed z-[96] w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl bg-white p-4 text-start shadow-2xl ring-1 ring-slate-200 outline-none ${motion}`}
        style={{ top: place.top, left: place.left }}
        data-tour-card
      >
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="font-inter text-[11px] font-semibold text-nav-accent">
            {t('ui.label')} · {t('ui.progress', { current: index + 1, total: steps.length })}
          </p>
          <button
            type="button"
            onClick={skip}
            aria-label={t('ui.close')}
            title={t('ui.close')}
            className="-me-1 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
        <h2 id={titleId} className="font-space text-base font-bold text-slate-900">{t(`${base}.title`)}</h2>
        <p id={bodyId} aria-live="polite" className="mt-1 font-inter text-sm leading-relaxed text-slate-600">{t(`${base}.body`)}</p>

        <div className="mt-3 flex items-center gap-1" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.id} className={`h-1.5 rounded-full ${i === index ? 'w-5 bg-blue-500' : 'w-1.5 bg-slate-200'}`} />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={skip}
            className="rounded-lg px-2 py-1.5 font-inter text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            data-tour-skip
          >
            {t('ui.skip')}
          </button>
          <div className="flex items-center gap-1.5">
            {!isFirst && (
              <button
                type="button"
                onClick={() => go(-1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-inter text-xs font-semibold text-slate-700 hover:bg-slate-50"
                data-tour-prev
              >
                <ChevronBack size={14} aria-hidden="true" />
                {t('ui.previous')}
              </button>
            )}
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-inter text-xs font-semibold text-white shadow-sm"
              style={{ background: '#3B5BDB' }}
              data-tour-next={isLast ? 'finish' : 'next'}
            >
              {isLast ? t('ui.finish') : t('ui.next')}
              {!isLast && <ChevronForward size={14} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
