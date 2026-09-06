import { useEffect, useState } from 'react';

/**
 * Géométrie du « viewport de la leçon » — la zone de contenu réellement
 * disponible, hors chrome applicatif.
 *
 * Pourquoi mesurer <main> plutôt que reconstruire header + sidebar : la coque
 * change avec l'authentification (CourseLayout → StudentLayout | MainLayout) et
 * avec le breakpoint. Les décalages sont TOUS déjà encodés dans le padding de
 * <main>, qui est la contrainte de mise en page que la leçon elle-même subit :
 *
 *   visiteur bureau   #app-header 64px          → padding-top 0,  main y=64
 *   élève   bureau    aside 256/80px (lg:pl-*)  → padding-left 256, #app-header absent (lg:hidden)
 *   élève   mobile    header 56 + barre basse 64 (pt-14 pb-20)
 *
 * On lit donc la BOÎTE DE PADDING de <main> (content box + insets), ce qui
 * donne le même rectangle que celui où la leçon s'affiche, sans constante
 * codée en dur. `top` reste dérivé de #app-header quand il existe, pour
 * préserver l'ancrage documenté (ResizeObserver, cf. KNOWLEDGE_MAP.md).
 *
 * @returns {{top:number, left:number, right:number, bottom:number, width:number, height:number, headerHeight:number, viewportWidth:number}}
 *          coordonnées en pixels, relatives au viewport (position: fixed).
 */
export function useLessonViewport(active = true) {
  const [box, setBox] = useState(() => ({
    top: 0, left: 0, right: 0, bottom: 0,
    width: 0, height: 0, headerHeight: 0, viewportWidth: 0,
  }));

  useEffect(() => {
    if (!active || typeof window === 'undefined') return undefined;

    const measure = () => {
      const header = document.getElementById('app-header');
      // Un header `lg:hidden` reste dans le DOM mais mesure 0 : getBoundingClientRect
      // le dit, donc aucune branche de breakpoint n'est nécessaire ici.
      const headerHeight = header ? header.getBoundingClientRect().height : 0;

      const main = document.querySelector('main');
      if (!main) {
        setBox({
          top: headerHeight, left: 0, right: 0, bottom: 0,
          width: window.innerWidth,
          height: Math.max(0, window.innerHeight - headerHeight),
          headerHeight, viewportWidth: window.innerWidth,
        });
        return;
      }

      const r = main.getBoundingClientRect();
      const cs = getComputedStyle(main);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      const padT = parseFloat(cs.paddingTop) || 0;
      const padB = parseFloat(cs.paddingBottom) || 0;

      // <main> est plus haut que l'écran (page qui défile) : on borne au viewport,
      // la carte est une surface fixe, pas un bloc du flux.
      const left = Math.max(0, r.left + padL);
      const right = Math.max(0, window.innerWidth - (r.right - padR));
      const top = Math.max(headerHeight, padT);
      const bottom = Math.max(0, padB);

      setBox({
        top, left, right, bottom,
        width: Math.max(0, window.innerWidth - left - right),
        height: Math.max(0, window.innerHeight - top - bottom),
        headerHeight, viewportWidth: window.innerWidth,
      });
    };

    measure();

    // ResizeObserver sur le header ET sur <main> : la sidebar élève anime sa
    // largeur (w-64 ↔ w-20), le header visiteur change de hauteur au scroll.
    const ro = new ResizeObserver(measure);
    const header = document.getElementById('app-header');
    const main = document.querySelector('main');
    if (header) ro.observe(header);
    if (main) ro.observe(main);
    window.addEventListener('resize', measure);
    // La transition de la sidebar dure 300ms : on re-mesure à la fin.
    const onTransition = (e) => { if (e.propertyName === 'padding-left') measure(); };
    main?.addEventListener('transitionend', onTransition);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      main?.removeEventListener('transitionend', onTransition);
    };
  }, [active]);

  return box;
}
