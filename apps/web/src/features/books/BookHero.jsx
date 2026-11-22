import { ShieldCheck, PhoneCall, Truck } from 'lucide-react';
import { S, formatDa } from './strings';

const TRUST_ICONS = [ShieldCheck, PhoneCall, Truck];

/**
 * LE PREMIER ÉCRAN de la fiche d'un livre — celui qui décide de l'achat.
 *
 * Rendu deux fois, À L'IDENTIQUE : par React (BookDetailPage) et, au build, en
 * HTML statique (vite-plugin-share-pages.js › renderToStaticMarkup) pour que la
 * page d'achat s'affiche avant même le JavaScript. Il doit donc rester PUR :
 * aucun hook, aucun contexte, aucun routeur (le lien « كل الكتب » est un
 * composant passé en prop — `Link` dans l'application, `<a>` au build).
 *
 * Pensé d'abord pour le TÉLÉPHONE (le lien arrive par WhatsApp et par les
 * publicités Facebook — 2026-11-13) : le visiteur décide en quelques secondes, donc
 * le premier écran répond, dans l'ordre, à ses questions : « c'est quoi ? » (le
 * livre, en GRAND), « c'est pour moi ? » (`content.hook` : SON problème, avant le
 * nom du produit), « combien et comment ? » (prix + UN seul bouton qui dit « الدفع
 * عند الاستلام ») et « puis-je faire confiance ? » (trois garanties vérifiées).
 * `hookSub`, le résumé et l'auteur passent après (`order-last`) sur téléphone.
 */
export default function BookHero({ book, LinkComponent = 'a' }) {
  const c = book.content ?? {};
  const image = c.heroImage || book.coverImage;
  const backProps = LinkComponent === 'a' ? { href: '/books' } : { to: '/books' };
  return (
    <section className="bg-gradient-to-b from-blue-50/60 to-transparent px-4 pb-8 pt-2 md:pb-16 md:pt-10">
      <div className="mx-auto grid max-w-6xl items-center gap-3 md:grid-cols-2 md:gap-12">
        {/* Colonne en `flex-col` : sur téléphone, le résumé et l'auteur passent APRÈS
            le prix, le bouton et les garanties (`order-last`) — l'achat d'abord, au-dessus
            du pli ; dès `md`, l'ordre classique revient. */}
        <div className="flex flex-col items-start">
          <LinkComponent {...backProps} className="hidden font-inter text-sm font-semibold text-blue-700 hover:underline sm:inline">{S.detail.back}</LinkComponent>
          {c.badge && <p className="inline-block rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 sm:mt-4 sm:px-4 sm:py-1.5">{c.badge}</p>}
          {/* Le problème du visiteur d'abord, le nom du produit ensuite (h1 : le titre reste le titre de la page). */}
          {c.hook && <p className="mt-2 font-space text-[1.4rem] font-bold leading-snug text-slate-900 sm:mt-3 sm:text-4xl sm:leading-tight lg:text-[2.6rem]">{c.hook}</p>}
          {/* Avec une accroche, le titre est caché sur téléphone (la couverture le montre déjà ;
              il reste le h1 pour les moteurs et les lecteurs d'écran) — owner : « trop de texte ». */}
          <h1 className={c.hook
            ? 'sr-only sm:not-sr-only sm:mt-3 sm:font-space sm:text-xl sm:font-bold sm:leading-snug sm:text-blue-700'
            : 'mt-2 font-space text-2xl font-bold leading-snug text-slate-900 sm:mt-3 sm:text-4xl sm:leading-tight lg:text-5xl'}
          >
            {book.title}
          </h1>
          {c.hookSub && <p className="order-last mt-4 font-inter text-base leading-relaxed text-slate-700 md:order-none sm:mt-3 sm:text-lg">{c.hookSub}</p>}
          {/* Avec `hookSub`, UNE phrase dit ce qu'est le livre : sous-titre et résumé — qui la
              répètent — ne s'affichent plus (owner : « trop de texte » ; sur ordinateur ils
              poussaient le bouton sous le pli). Sans accroche, l'ancien ordre reste. */}
          {book.subtitle && !c.hookSub && <p className="order-last mt-4 font-inter text-lg text-slate-600 sm:order-none sm:mt-3 sm:text-xl">{book.subtitle}</p>}
          {book.summary && !c.hookSub && <p className="order-last mt-5 font-inter text-base leading-loose text-slate-600 md:order-none sm:text-lg">{book.summary}</p>}
          {book.author && <p className={`order-last mt-3 font-inter text-sm text-slate-500 md:order-none sm:mt-4 ${c.hookSub ? 'hidden md:block' : ''}`}>{book.author}</p>}

          <div className="mt-3 flex items-baseline gap-2 sm:mt-8">
            <span dir="ltr" className="font-space text-3xl font-bold text-blue-700 sm:text-4xl">{formatDa(book.price)}</span>
            <span className="font-inter text-sm text-slate-500">{S.detail.perCopy}</span>
          </div>
          {/* UN seul bouton : un deuxième (« اطرح سؤالًا ») partageait l'attention au moment
              qui compte ; le contact reste en bas de page. Le bouton dit comment on paie. */}
          <a id="book-hero-cta" href="#order" className="mt-3 flex w-full flex-col items-center rounded-2xl bg-blue-600 px-8 py-3 text-center text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 sm:w-auto">
            <span className="font-space text-lg font-bold leading-tight">{S.detail.orderCta}</span>
            <span className="font-inter text-xs font-semibold text-blue-100">{S.order.submitCod}</span>
          </a>
          {/* Téléphone : les garanties en UNE ligne de mots courts ; phrases complètes dès sm. */}
          <ul className="mt-3 flex w-full justify-between gap-2 sm:mt-4 sm:w-auto sm:flex-wrap sm:justify-start sm:gap-x-4 sm:gap-y-2">
            {S.detail.trust.map((label, i) => {
              const Icon = TRUST_ICONS[i] ?? ShieldCheck;
              return (
                <li key={label} className="inline-flex items-center gap-1 font-inter text-xs font-medium text-slate-600 sm:gap-1.5 sm:text-sm">
                  <Icon size={15} className="flex-none text-emerald-600" aria-hidden="true" />
                  <span className="sm:hidden">{S.detail.trustShort[i]}</span>
                  <span className="hidden sm:inline">{label}</span>
                </li>
              );
            })}
          </ul>
        </div>
        {/* Hauteur RÉSERVÉE avant l'arrivée de l'image (aucun saut de mise en page) ;
            compacte et EN PREMIER sur téléphone, à côté du texte dès `md`. */}
        <div className="order-first flex h-[190px] items-center justify-center sm:h-[320px] md:order-none md:h-[420px] lg:h-[540px]">
          {image && (
            <img
              src={image}
              alt={book.title}
              fetchpriority="high"
              decoding="async"
              className={`max-h-full max-w-full w-auto object-contain ${c.heroImage ? 'drop-shadow-2xl' : 'rounded-md shadow-2xl'}`}
            />
          )}
        </div>
      </div>
    </section>
  );
}
