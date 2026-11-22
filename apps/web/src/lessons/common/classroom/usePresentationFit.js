import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { availableArea, nextFitFactor, effectiveScale } from './classroomFit';

/**
 * Le moteur d'AJUSTEMENT AU VIEWPORT (brief §10), côté DOM.
 *
 * Il connaît la boîte de la présentation (`rootRef`), les barres qui lui
 * prennent de la hauteur (`reservedRefs` : barre d'outils, navigation), la
 * zone offerte au contenu (`contentRef`) et la taille que le contenu réclame
 * (`stageRef`, dont scrollWidth/scrollHeight sont la mesure de vérité).
 *
 * À chaque changement de taille — fenêtre, barre, contenu (un rayon de plus,
 * un résultat qui apparaît) — il calcule :
 *
 *   area       la zone disponible, publiée au contenu (--sa-classroom-w/-h)
 *   fitFactor  ≤ 1, réduit quand ça déborde, regrandit quand la place revient
 *   scale      userScale × fitFactor → --sa-classroom-scale
 *
 * Les mesures sont regroupées par `requestAnimationFrame` (une par image au
 * plus, jamais en continu) et la boucle « ajuster → le contenu change de
 * taille → remesurer » converge par construction (classroomFit.js) ; un
 * garde-fou coupe tout de même la boucle après quelques tours rapprochés.
 *
 * Hors présentation, le hook ne mesure rien et ne pose aucun observateur.
 */
const MAX_ADJUSTMENTS_PER_BURST = 8;
const BURST_WINDOW_MS = 400;

/**
 * Un contenu peut avoir SA PROPRE mise en page dépendante de la zone (la
 * grille des rayons de la bibliothèque, par exemple) : entre le moment où
 * la zone change et celui où il s'y est adapté, la scène déborde un instant.
 * Décider sur cet instant réduirait l'échelle pour rien — et un contenu qui
 * remplit exactement sa zone ne peut plus signaler de marge pour regrandir.
 * La DÉCISION d'échelle attend donc que la mise en page soit stable.
 */
const SETTLE_MS = 120;

export function usePresentationFit({ active, rootRef, contentRef, stageRef, reservedRefs = [], userScale = 1 }) {
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [fitFactor, setFitFactor] = useState(1);
  const fitRef = useRef(1);
  const burst = useRef({ count: 0, timer: null });

  // Sortie de présentation : on repart de 1 la prochaine fois.
  useEffect(() => {
    if (active) return;
    fitRef.current = 1;
    setFitFactor(1);
    setArea({ width: 0, height: 0 });
  }, [active]);

  // useLayoutEffect : la première image de la présentation doit déjà porter
  // une zone mesurée, sinon le contenu se dessine une fois « à vide ».
  useLayoutEffect(() => {
    if (!active || typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return undefined;
    const root = rootRef.current;
    const content = contentRef.current;
    const stage = stageRef.current;
    if (!root || !content || !stage) return undefined;

    let raf = 0;
    let settle = null;

    // La zone offerte, publiée tout de suite (le contenu en dépend).
    const measureArea = () => {
      raf = 0;
      const cs = getComputedStyle(root);
      const paddingX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const paddingY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      const reserved = reservedRefs.reduce((h, r) => h + (r?.current ? r.current.getBoundingClientRect().height : 0), 0);
      const next = availableArea({ width: root.clientWidth, height: root.clientHeight, toolbarHeight: reserved, paddingX, paddingY });
      setArea((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
    };

    // L'échelle, décidée sur une mise en page STABLE (SETTLE_MS sans changement).
    const decide = () => {
      settle = null;
      const needed = { width: stage.scrollWidth, height: stage.scrollHeight };
      const available = { width: content.clientWidth, height: content.clientHeight };
      const factor = nextFitFactor({ current: fitRef.current, needed, available });
      if (factor === fitRef.current) return;
      if (burst.current.count >= MAX_ADJUSTMENTS_PER_BURST) return;
      burst.current.count += 1;
      clearTimeout(burst.current.timer);
      burst.current.timer = setTimeout(() => { burst.current.count = 0; }, BURST_WINDOW_MS);
      fitRef.current = factor;
      setFitFactor(factor);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measureArea);
      if (settle) clearTimeout(settle);
      settle = setTimeout(decide, SETTLE_MS);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    ro.observe(content);
    ro.observe(stage);
    for (const r of reservedRefs) if (r?.current) ro.observe(r.current);
    const onResize = () => { burst.current.count = 0; schedule(); };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    schedule();

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (raf) cancelAnimationFrame(raf);
      if (settle) clearTimeout(settle);
      clearTimeout(burst.current.timer);
      burst.current.count = 0;
    };
    // `reservedRefs` est un tableau de refs stables : on ne le déstructure pas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, rootRef, contentRef, stageRef]);

  // Un changement d'échelle demandé par l'enseignant repart d'un facteur
  // neuf : la mesure suivante dira s'il faut réduire.
  useEffect(() => {
    if (!active) return;
    fitRef.current = 1;
    setFitFactor(1);
  }, [userScale, active]);

  // Le contenu vient de changer de nature (autre unité, autre page) : un
  // facteur réduit pour l'unité précédente n'a plus de raison d'être — un
  // contenu qui remplit sa zone ne pourrait jamais le signaler tout seul.
  const refit = useCallback(() => {
    burst.current.count = 0;
    fitRef.current = 1;
    setFitFactor(1);
  }, []);

  return { area, fitFactor, scale: effectiveScale(userScale, fitFactor), refit };
}
