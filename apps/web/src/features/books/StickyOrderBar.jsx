import { useEffect, useState } from 'react';
import { S, formatDa } from './strings';

/**
 * La barre de commande COLLÉE en bas de l'écran (téléphone et tablette, < lg).
 *
 * Sur un téléphone, la fiche est longue (chiffres, points forts, étapes, galerie,
 * FAQ) et le formulaire est en bas : sans elle, l'élève convaincu au milieu de la
 * page doit chercher où commander. Elle apparaît dès que le bouton du premier
 * écran sort de la vue, et s'efface quand le formulaire lui-même est à l'écran
 * (deux boutons « commander » côte à côte ne servent à rien).
 */
export default function StickyOrderBar({ book }) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [orderVisible, setOrderVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const hero = document.getElementById('book-hero-cta');
    const order = document.getElementById('order');
    // Le bouton du haut compte comme « visible » seulement ENTIÈREMENT à l'écran (un
    // bouton coupé en bas ne se voit pas) ; le formulaire, dès qu'il en entre un bout.
    const heroObserver = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 1 });
    const orderObserver = new IntersectionObserver(([entry]) => setOrderVisible(entry.isIntersecting));
    if (hero) heroObserver.observe(hero);
    if (order) orderObserver.observe(order);
    return () => { heroObserver.disconnect(); orderObserver.disconnect(); };
  }, []);

  const shown = !heroVisible && !orderVisible;

  return (
    <div
      aria-hidden={!shown}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur transition-transform duration-300 lg:hidden ${shown ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p dir="ltr" className="text-end font-space text-xl font-bold leading-none text-blue-700">{formatDa(book.price)}</p>
          <p className="mt-1 truncate font-inter text-xs text-slate-500">{S.detail.stickyHint}</p>
        </div>
        <a href="#order" tabIndex={shown ? 0 : -1} className="flex-none rounded-xl bg-blue-600 px-6 py-3 font-space text-base font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700">
          {S.detail.orderCta}
        </a>
      </div>
    </div>
  );
}
