import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FitRefitContext } from './missionPlayerContext';

/** En dessous, le texte devient illisible : on accepte alors un défilement interne (dernier recours, rare). */
export const MIN_FIT = 0.6;
/** Au-dessus, un texte court deviendrait démesuré : on agrandit jusque-là, pas plus (owner, 2026-11-04 : « plus grand »). */
const MAX_GROW = 1.9;
/** Un contenu agrandi vise cette part de la hauteur : il remplit l'écran sans toucher ses bords. */
const GROW_TARGET = 0.92;
/** Agrandir d'un pas plus petit ne vaut pas la ré-agencement (et ferait osciller) : on garde la taille actuelle. */
const GROW_STEP = 0.1;

/**
 * UNE TAILLE POUR TOUTE LA LEÇON (propriétaire, 2026-11-04 : « la cohérence de taille des éléments semblables n'est pas
 * négociable » — la question 1 du test était plus petite que la 2, parce que chaque écran s'agrandissait selon SON contenu).
 * La taille ne dépend que de l'ÉCRAN : une colonne de lecture de READ_WIDTH, un écran de référence de READ_HEIGHT ; entre 1 et
 * UNIFORM_MAX, par pas de 0,05. Le découpage en pages se fait à cette taille ; seul un bloc trop haut pour un écran rétrécit.
 */
const READ_WIDTH = 1100;
const READ_HEIGHT = 560;
export const UNIFORM_MAX = 1.6;
export function uniformZoom(width, height) {
  if (!(width > 0) || !(height > 0)) return 1;
  const z = Math.min(width / READ_WIDTH, height / READ_HEIGHT);
  return Math.max(1, Math.min(UNIFORM_MAX, Math.floor(z * 20) / 20));
}

/** Le temps qu'un écran met à se poser (polices, KaTeX, découpage) ; ensuite, ce qui est à l'écran ne bouge plus. */
const SETTLE_MS = 700;

/**
 * UN ÉCRAN POSÉ NE BOUGE PLUS (propriétaire, 2026-11-04 : « le nouveau contenu change la position, la taille de la police
 * du contenu déjà là »). Le contenu commence à `pad` du haut, à l'échelle `zoom` ; il vient de changer de hauteur naturelle :
 *  1. il tient encore sous son haut actuel → rien ne bouge (le nouveau prend la place libre en dessous) ;
 *  2. sinon, il tient à cette taille → on le REMONTE juste assez (la taille du texte ne change pas) ;
 *  3. sinon seulement → on RÉDUIT pour tenir (dernier recours), collé en haut.
 * Jamais d'agrandissement : un écran ne grandit qu'à son arrivée. Pur — testé seul.
 */
/** Le contenu n'occupe plus que moins de 70 % de la hauteur à sa taille actuelle : il a beaucoup rétréci. Pur — testé seul. */
const SHRINK_REFIT = 0.7;
export function shrunkALot({ natural, zoom, height }) {
  return natural > 0 && height > 0 && natural * zoom < height * SHRINK_REFIT;
}

export function keepInPlace({ natural, zoom, pad, height, minFit = MIN_FIT }) {
  const h = natural * zoom;
  if (pad + h <= height + 1) return { zoom, pad };
  if (h <= height + 1) return { zoom, pad: Math.max(0, Math.floor(height - h)) };
  // la plus grande taille qui tient (≤ la taille actuelle) : le moins de rétrécissement possible
  return { zoom: Math.min(zoom, fitFactor(natural, height, minFit, zoom)), pad: 0 };
}

/**
 * Le facteur qui fait tenir `natural` dans `available` : jamais sous `minFit` ; au-dessus de 1 seulement si `maxFit` le
 * permet (agrandir un contenu court pour qu'il occupe l'écran). Arrondi au centième inférieur. Pur — testé seul.
 */
export function fitFactor(natural, available, minFit = MIN_FIT, maxFit = 1) {
  if (!(natural > 0) || !(available > 0)) return 1;
  if (natural <= available && maxFit <= 1) return 1;
  const f = Math.floor((available / natural) * 100) / 100;
  return Math.min(maxFit, Math.max(minFit, f));
}

/**
 * Fait TENIR son contenu dans la hauteur offerte, sans défilement — et, avec `grow`, AGRANDIT un contenu court (une question,
 * une carte) jusqu'à occuper l'écran (≤ MAX_GROW). Le texte se ré-agence à la nouvelle taille (`zoom` réduit la largeur de
 * mise en page d'autant), la mesure se refait jusqu'à stabilité (hystérésis 2 %).
 * la page courante d'une unité a déjà été découpée
 * (ClassroomPaged) ; ce qui dépasse encore (un labo haut, une carte mémo d'un seul bloc) est RÉDUIT par `zoom` — une
 * propriété de mise en page, comme ClassroomFrame : le texte se ré-agence, les gestes du labo restent justes. Sous
 * MIN_FIT, plutôt qu'un texte illisible, la zone défile (et `data-fit-overflow` le signale aux tests).
 */
export default function FitToArea({ height, grow = false, maxGrow = MAX_GROW, onZoom, screenKey, fixedZoom, children }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const history = useRef([]);
  const [overflow, setOverflow] = useState(false);
  // `pad` : null = centré (l'écran se pose) ; un nombre = écran POSÉ, son contenu tenu à cette distance du haut.
  const [pad, setPad] = useState(null);
  const padRef = useRef(null);
  const settled = useRef(false);
  const settleTimer = useRef(null);
  const measureRef = useRef(null);
  // un ré-ajustement DEMANDÉ (useFitRefit) : l'écran redevient libre (ajusté, centré) puis se re-pose
  const refit = useCallback(() => {
    settled.current = false; padRef.current = null; setPad(null); history.current = [];
    clearTimeout(settleTimer.current);
    requestAnimationFrame(() => measureRef.current?.());
    settleTimer.current = setTimeout(() => {
      const o = outer.current; const i = inner.current;
      if (!o || !i) return;
      const p = Math.max(0, Math.round(i.getBoundingClientRect().top - o.getBoundingClientRect().top));
      padRef.current = p; setPad(p); settled.current = true;
    }, SETTLE_MS);
  }, []);
  useEffect(() => () => clearTimeout(settleTimer.current), []);
  // le glissement n'anime QUE les remontées d'un écran déjà posé — jamais le moment où il se pose (sinon chaque écran
  // apparaissait deux fois : son entrée, puis un saut vers le haut et une redescente ; propriétaire, 2026-11-04)
  const [glide, setGlide] = useState(false);

  // Un NOUVEL écran (page, unité, module) ou une autre hauteur : il se pose de nouveau (ajusté, centré), puis se fige là où il est.
  useLayoutEffect(() => {
    settled.current = false; padRef.current = null; setPad(null); setGlide(false); history.current = [];
    let raf = 0;
    const t = setTimeout(() => {
      const o = outer.current; const i = inner.current;
      if (!o || !i) return;
      const p = Math.max(0, Math.round(i.getBoundingClientRect().top - o.getBoundingClientRect().top));
      padRef.current = p; setPad(p); settled.current = true;
      // posé SANS animation ; le glissement ne s'active qu'après que cette position est peinte
      raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => setGlide(true)); });
    }, SETTLE_MS);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [screenKey, height]);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el || !(height > 0) || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => {
      // la hauteur NATURELLE : la mesure courante ramenée à zoom 1
      const natural = el.getBoundingClientRect().height / zoomRef.current;
      // Un écran posé qui a beaucoup RÉTRÉCI (la mission en grand redevient compacte, un bloc s'en va) se ré-ajuste UNE fois :
      // garder sa petite taille laisserait de grandes bandes vides (propriétaire, 2026-11-07). Les petits changements, eux, ne
      // bougent toujours rien (keepInPlace).
      if (settled.current && shrunkALot({ natural, zoom: zoomRef.current, height: outer.current?.clientHeight || height })) {
        settled.current = false; padRef.current = null; setPad(null); history.current = [];
        settleTimer.current = setTimeout(() => {
          const o = outer.current; const i = inner.current;
          if (!o || !i) return;
          const p = Math.max(0, Math.round(i.getBoundingClientRect().top - o.getBoundingClientRect().top));
          padRef.current = p; setPad(p); settled.current = true;
        }, SETTLE_MS);
      }
      if (settled.current) {
        // Écran posé : ce qui est déjà là ne change ni de place ni de taille, sauf s'il le faut pour tenir (keepInPlace).
        // la hauteur RÉELLEMENT offerte : la boîte de cette zone (la zone du lecteur a ses propres marges, `height` les inclut)
        const room = outer.current?.clientHeight || height;
        const r = keepInPlace({ natural, zoom: zoomRef.current, pad: padRef.current ?? 0, height: room });
        if (r.zoom !== zoomRef.current) { zoomRef.current = r.zoom; setZoom(r.zoom); onZoom?.(r.zoom); }
        if (r.pad !== padRef.current) { padRef.current = r.pad; setPad(r.pad); }
        setOverflow(natural * r.zoom > room + 2);
        return;
      }
      // agrandir vise GROW_TARGET de la hauteur ; réduire vise toute la hauteur
      if (fixedZoom > 0) {
        // Taille UNIFORME : la même pour chaque écran ; plus petite seulement si un bloc ne peut pas tenir (dernier recours).
        const room = outer.current?.clientHeight || height;
        const next = natural * fixedZoom <= room ? fixedZoom : Math.min(fixedZoom, fitFactor(natural, room, MIN_FIT, fixedZoom));
        if (next !== zoomRef.current) { zoomRef.current = next; setZoom(next); onZoom?.(next); }
        setOverflow(natural * next > room + 2);
        return;
      }
      const target = GROW_TARGET;
      let next = grow && natural < height * target ? fitFactor(natural, height * target, MIN_FIT, maxGrow) : fitFactor(natural, height);
      const cur = zoomRef.current;
      // AMORTI (le texte se ré-agence quand le zoom change, et la hauteur avec lui) :
      //  - réduire dès qu'il le faut ; agrandir seulement pour un vrai gain (≥ GROW_STEP) ;
      //  - une valeur déjà prise il y a peu (aller-retour 1,17 ↔ 1,09) : on se pose sur la plus petite et on y reste.
      if (next > cur && next - cur < GROW_STEP) next = cur;
      if (next !== cur && history.current.includes(next)) next = Math.min(next, cur);
      if (Math.abs(next - cur) >= 0.02) {
        history.current = [...history.current.slice(-3), cur];
        zoomRef.current = next; setZoom(next); onZoom?.(next);
      }
      setOverflow(natural * next > height + 2);
    };
    measureRef.current = measure;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // `screenKey` : un nouvel écran se MESURE tout de suite (rien ne change de taille quand on passe d'une page à l'autre)
  }, [height, grow, maxGrow, screenKey, fixedZoom]);

  return (
    // centré dans la hauteur : un contenu court ne colle pas au haut de l'écran
    // centré tant qu'il se pose ; posé, tenu à `pad` du haut — ce qui s'ajoute descend, rien ne remonte ni ne rétrécit
    <div ref={outer} className={`flex h-full flex-col ${overflow ? 'overflow-y-auto' : `${pad == null ? 'justify-center' : `justify-start ${glide ? 'transition-[padding] duration-300 ease-out motion-reduce:transition-none' : ''}`} overflow-hidden`}`}
      style={pad != null && !overflow ? { paddingTop: pad } : undefined}
      data-fit-zoom={zoom} data-fit-overflow={overflow ? 'true' : undefined} data-fit-settled={pad != null ? 'true' : undefined}>
      <div ref={inner} style={zoom !== 1 ? { zoom } : undefined}>
        <FitRefitContext.Provider value={refit}>{children}</FitRefitContext.Provider>
      </div>
    </div>
  );
}
