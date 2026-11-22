import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Facebook, X, Youtube } from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { loadBook, peekBook, removeStaticBookShell } from './bookCache';
import BookHero from './BookHero';
import StickyOrderBar from './StickyOrderBar';
import OrderForm from './OrderForm';
import ContactForm from './ContactForm';
import { S, formatDa } from './strings';
import { trackPixel } from './metaPixel';

/** La forme de la présentation pendant le chargement (même hauteur, aucun saut). */
function BookDetailSkeleton() {
  return (
    <div aria-busy="true" className="min-h-screen pt-16">
      <section className="bg-gradient-to-b from-blue-50/60 to-transparent px-4 pb-10 pt-4 md:pb-16 md:pt-10">
        <div className="mx-auto grid max-w-6xl items-center gap-6 md:grid-cols-2 md:gap-12">
          <div className="space-y-5">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200/70" />
            <div className="h-12 w-4/5 animate-pulse rounded-lg bg-slate-200/70" />
            <div className="h-6 w-3/5 animate-pulse rounded bg-slate-200/70" />
            <div className="h-24 animate-pulse rounded-lg bg-slate-200/50" />
            <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-slate-200/70" />
          </div>
          <div className="order-first flex h-[190px] items-center justify-center sm:h-[320px] md:order-none md:h-[420px] lg:h-[540px]">
            <div className="h-full w-3/5 animate-pulse rounded-xl bg-slate-200/60" />
          </div>
        </div>
      </section>
    </div>
  );
}

// Les réseaux connus de `content.socials` : icône et couleur de marque.
const SOCIALS = {
  youtube: { Icon: Youtube, className: 'bg-red-600 hover:bg-red-700' },
  facebook: { Icon: Facebook, className: 'bg-blue-600 hover:bg-blue-700' },
};

const H2 = ({ children }) => <h2 className="mb-6 text-center font-space text-2xl font-bold text-slate-900 sm:mb-8 sm:text-3xl">{children}</h2>;

/**
 * `/books/:slug` — UNE page : présentation, commande, contact. Tout le contenu
 * (statistiques, étapes, points forts, FAQ, galerie) vient de la fiche du
 * livre : un nouveau livre n'exige aucun code.
 */
export default function BookDetailPage() {
  const { slug } = useParams();
  // undefined = chargement, null = introuvable. Une fiche déjà reçue (préchargée
  // au survol de sa carte, ou déjà vue) s'affiche tout de suite (bookCache.js).
  const [book, setBook] = useState(() => peekBook(slug)?.book);
  const [openFaq, setOpenFaq] = useState(0);
  const [zoom, setZoom] = useState(null);
  const [contactOpen, setContactOpen] = useState(() => typeof window !== 'undefined' && window.location.hash === '#contact');

  // Page agrandie : Échap la ferme.
  useEffect(() => {
    if (!zoom) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setZoom(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  useEffect(() => {
    let alive = true;
    setBook(peekBook(slug)?.book);
    // « Introuvable » seulement sur un 404 : une panne réseau, un 429 ou un 500
    // ne remplace JAMAIS une fiche déjà affichée (instantané du build, cache).
    loadBook(slug)
      .then((d) => alive && setBook(d.book))
      .catch((e) => alive && setBook((shown) => (e?.status === 404 || !shown ? null : shown)));
    return () => { alive = false; };
  }, [slug]);

  // Meta Pixel : une arrivée sur LA FICHE (les publicités y mènent) — jamais ailleurs (metaPixel.js).
  const viewedSlug = book?.slug;
  const viewedPrice = book?.price;
  const viewedTitle = book?.title;
  useEffect(() => {
    if (!viewedSlug) return;
    trackPixel('PageView');
    trackPixel('ViewContent', { content_name: viewedTitle, content_ids: [viewedSlug], content_type: 'product', value: viewedPrice, currency: 'DZD' });
  }, [viewedSlug, viewedPrice, viewedTitle]);

  useDocumentMeta(book?.title ?? S.list.metaTitle, book?.summary ?? undefined);

  // La vraie fiche est à l'écran (ou le livre n'existe pas) : le premier écran
  // HTML posé par le build au-dessus de #root n'a plus de raison d'être.
  useEffect(() => { if (book !== undefined) removeStaticBookShell(); }, [book]);

  if (book === undefined) return <BookDetailSkeleton />;
  if (book === null) {
    return (
      <div className="px-4 pb-24 pt-32 text-center">
        <p className="font-inter text-lg text-slate-600">{S.detail.notFound}</p>
        <Link to="/books" className="mt-4 inline-block font-semibold text-blue-700 hover:underline">{S.detail.back}</Link>
      </div>
    );
  }

  const c = book.content ?? {};

  return (
    // pb-24 sous lg : la barre de commande collée ne cache jamais la fin de la page.
    // Ordre de la page (publicités Facebook, 2026-11-13) = l'ordre des questions du
    // visiteur : c'est quoi / pour moi ? (premier écran) → c'est réel ? (pages
    // intérieures) → qu'y a-t-il dedans ? → est-ce pour MOI ? → pourquoi ça marche →
    // la méthode → commander → objections (FAQ) → une question ? (contact replié).
    <div className="pb-24 pt-16 lg:pb-0">
      <BookHero book={book} LinkComponent={Link} />

      {/* Galerie — la PREUVE juste après le premier écran : de vraies pages, lisibles. */}
      {book.gallery?.length > 1 && (
        <section className="mx-auto max-w-6xl py-8 sm:px-4 sm:py-14">
          <H2>{S.detail.galleryTitle}</H2>
          <p className="-mt-4 mb-5 px-4 text-center font-inter text-sm text-slate-500 sm:-mt-6 sm:mb-8">{S.detail.galleryHint}</p>
          {/* Téléphone : un carrousel qu'on fait glisser du pouce (une page à la fois),
              au lieu de quatre rangées de grandes images à faire défiler. */}
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {book.gallery.map((src) => (
              <button key={src} type="button" onClick={() => setZoom(src)} aria-label={S.detail.galleryZoom} className="w-[72%] flex-none snap-center sm:w-full">
                <img src={src} alt="" loading="lazy" decoding="async" className="aspect-[3/4] w-full rounded-2xl border border-slate-200 bg-white object-cover shadow-sm" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Chiffres — ce qu'il y a DANS le livre. */}
      {c.stats?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
          <H2>{S.detail.statsTitle}</H2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {c.stats.map((st) => (
              <div key={st.title} className="rounded-2xl border border-slate-200 bg-white p-4 text-center sm:p-5">
                <p dir="ltr" className="font-space text-3xl font-bold text-blue-700 sm:text-4xl">{st.number}</p>
                <p className="mt-1 font-space text-base font-bold text-slate-900">{st.title}</p>
                <p className="mt-1 font-inter text-sm text-slate-500">{st.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pour qui — le visiteur (ou le parent) doit SE reconnaître ; dire aussi pour qui
          ce n'est PAS rend le reste crédible et évite les refus à la livraison. */}
      {(c.forWho?.yes?.length > 0 || c.forWho?.no?.length > 0) && (
        <section className="mx-auto max-w-5xl px-4 py-8 sm:py-14">
          <H2>{S.detail.forWhoTitle}</H2>
          <div className="grid gap-4 md:grid-cols-2">
            {c.forWho?.yes?.length > 0 && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-7">
                <h3 className="font-space text-lg font-bold text-emerald-800">{S.detail.forWhoYes}</h3>
                <ul className="mt-3 space-y-3">
                  {c.forWho.yes.map((line) => (
                    <li key={line} className="flex gap-2.5 font-inter leading-relaxed text-slate-700">
                      <Check size={20} className="mt-0.5 flex-none text-emerald-600" aria-hidden="true" />{line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {c.forWho?.no?.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
                <h3 className="font-space text-lg font-bold text-slate-700">{S.detail.forWhoNo}</h3>
                <ul className="mt-3 space-y-3">
                  {c.forWho.no.map((line) => (
                    <li key={line} className="flex gap-2.5 font-inter leading-relaxed text-slate-600">
                      <X size={20} className="mt-0.5 flex-none text-slate-400" aria-hidden="true" />{line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* L'auteur — qui parle ? Photo ronde + références (content.authorBio, fournies par lui). */}
      {c.authorBio?.lines?.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-8 sm:py-14">
          <H2>{S.detail.authorTitle}</H2>
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white p-5 text-center sm:flex-row sm:items-center sm:gap-8 sm:p-8 sm:text-start">
            {c.authorBio.photo && (
              <img src={c.authorBio.photo} alt={c.authorBio.name ?? ''} width="144" height="144" loading="lazy" decoding="async" className="h-32 w-32 flex-none rounded-full border-4 border-white object-cover shadow-lg ring-1 ring-slate-200 sm:h-36 sm:w-36" />
            )}
            <div>
              {c.authorBio.name && <p className="font-space text-xl font-bold text-slate-900">{c.authorBio.name}</p>}
              <ul className="mt-3 space-y-2.5 text-start">
                {c.authorBio.lines.map((line) => (
                  <li key={line} className="flex gap-2.5 font-inter leading-relaxed text-slate-700">
                    <Check size={18} className="mt-1 flex-none text-blue-600" aria-hidden="true" />{line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Points forts */}
      {c.highlights?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:py-14">
          <H2>{S.detail.highlightsTitle}</H2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {c.highlights.map((h) => (
              <div key={h.title} className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
                <h3 className="font-space text-xl font-bold text-slate-900">{h.title}</h3>
                <p className="mt-3 font-inter leading-loose text-slate-600">{h.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Étapes SMART — finissent sur un bouton : le visiteur convaincu ici commande ici. */}
      {c.steps?.length > 0 && (
        <section className="bg-slate-900 px-4 py-12 text-white sm:py-16">
          <div className="mx-auto max-w-5xl">
            {/* Couleur EXPLICITE : index.css colore h1–h6, l'héritage du blanc ne suffit pas sur fond sombre. */}
            <h2 className="mb-8 text-center font-space text-2xl font-bold text-white sm:mb-10 sm:text-3xl">{S.detail.stepsTitle}</h2>
            {/* Téléphone : la lettre À CÔTÉ du texte (cinq cartes compactes, pas cinq écrans). */}
            <ol className="grid gap-3 sm:gap-4 md:grid-cols-5">
              {c.steps.map((st) => (
                <li key={st.letter} className="flex gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-5 md:block">
                  <span dir="ltr" className="flex-none font-space text-3xl font-bold text-blue-400 sm:text-4xl">{st.letter}</span>
                  <div>
                    <h3 className="font-space text-base font-bold text-white md:mt-2">{st.title}</h3>
                    <p className="mt-1 font-inter text-sm leading-relaxed text-slate-300 md:mt-2">{st.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 text-center">
              <a href="#order" className="inline-flex w-full flex-col items-center rounded-2xl bg-blue-500 px-8 py-3 text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-600 sm:w-auto">
                <span className="font-space text-lg font-bold leading-tight">{S.detail.orderCta}</span>
                <span dir="rtl" className="font-inter text-xs font-semibold text-blue-100">{formatDa(book.price)} · {S.order.submitCod}</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Commande */}
      <section id="order" className="scroll-mt-20 bg-slate-50 px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <H2>{S.detail.orderTitle}</H2>
          <ol className="mb-6 grid gap-3 sm:mb-8 md:grid-cols-3">
            {S.detail.steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-blue-600 font-space text-sm font-bold text-white">{i + 1}</span>
                <span className="font-inter text-sm leading-relaxed text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
          <OrderForm book={book} />
        </div>
      </section>

      {/* FAQ — les objections qui restent après le formulaire. */}
      {c.faq?.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
          <H2>{S.detail.faqTitle}</H2>
          <div className="space-y-3">
            {c.faq.map((item, i) => (
              <div key={item.question} className="rounded-2xl border border-slate-200 bg-white">
                <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-4 text-start font-space text-base font-bold text-slate-900 sm:p-5 sm:text-lg">
                  {item.question}
                  <ChevronDown size={18} className={`flex-none transition ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-5 font-inter leading-loose text-slate-600">{item.answer}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chaînes */}
      {c.socials?.some((x) => SOCIALS[x.network]) && (
        <section className="mx-auto max-w-3xl px-4 py-8 text-center sm:py-14">
          <H2>{S.detail.socialsTitle}</H2>
          <p className="-mt-4 mb-6 font-inter text-slate-600">{S.detail.socialsSubtitle}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {c.socials.filter((x) => SOCIALS[x.network]).map(({ network, url }) => {
              const { Icon, className } = SOCIALS[network];
              return (
                <a key={network} href={url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-space text-base font-bold text-white transition ${className}`}>
                  <Icon size={20} aria-hidden="true" />
                  {S.detail.socials[network]}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Contact — REPLIÉ : un second formulaire de six champs faisait concurrence à la
          commande. Ouvert d'office si l'on arrive par « #contact ». */}
      <section id="contact" className="scroll-mt-20 bg-slate-50 px-4 py-10 sm:py-14">
        <details className="mx-auto max-w-3xl" open={contactOpen} onToggle={(e) => setContactOpen(e.currentTarget.open)}>
          <summary className="flex min-h-14 cursor-pointer list-none flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center hover:bg-slate-50">
            <span className="font-space text-lg font-bold text-slate-900">{S.detail.contactTitle}</span>
            <span className="mt-1 font-inter text-sm text-slate-600">{S.detail.contactSubtitle}</span>
          </summary>
          <div className="mt-6">
            <ContactForm bookSlug={book.slug} />
          </div>
        </details>
      </section>

      <StickyOrderBar book={book} />

      {zoom && createPortal(
        <div role="dialog" aria-modal="true" aria-label={S.detail.galleryTitle} className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 p-3" onClick={() => setZoom(null)}>
          <img src={zoom} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
          <button type="button" onClick={() => setZoom(null)} aria-label={S.detail.close} className="absolute end-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
            <X size={24} />
          </button>
        </div>,
        document.body,
      )}
    </div>
  );
}
