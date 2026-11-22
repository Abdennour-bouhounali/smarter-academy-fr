import { useEffect, useRef } from 'react';
import { POINTER_COLORS, DEFAULT_POINTER_COLOR, pointerDiameter, spotlightRadius } from './classroomPointer';

/**
 * Le POINTEUR DE CLASSE rendu — un calque au-dessus de la présentation.
 *
 *   • Il est DANS la racine de la séance : en plein écran natif, seul ce
 *     sous-arbre est visible, un calque posé dans <body> disparaîtrait.
 *   • `pointer-events: none` sur tout le calque : il ne reçoit jamais un
 *     clic, un survol ni un glisser. Le vrai curseur reste dessous et agit.
 *   • Aucun état React par mouvement : un écouteur `pointermove` note la
 *     dernière position, un seul `requestAnimationFrame` l'écrit en
 *     `transform` (et en variables CSS pour l'éclairage). La leçon ne se
 *     redessine pas quand la souris bouge.
 *   • Il disparaît quand la souris quitte la fenêtre et réapparaît à son
 *     retour ; au doigt, il suit le contact.
 *   • Sa taille suit le viewport (redimensionnement, rotation, passage
 *     projecteur 4K ↔ portable) — pointerDiameter().
 *
 * `spotlight` ajoute l'éclairage : l'écran s'assombrit sauf un disque autour
 * du pointeur.
 */
export default function ClassroomPointer({ size, spotlight = false, color = DEFAULT_POINTER_COLOR }) {
  const dotRef = useRef(null);
  const shadeRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const dot = dotRef.current;
    const shade = shadeRef.current;
    let x = -1000;
    let y = -1000;
    let visible = false;
    let frame = 0;

    const applySize = () => {
      const d = pointerDiameter(size, window.innerWidth, window.innerHeight);
      dot?.style.setProperty('--sa-pointer-d', `${d}px`);
      shade?.style.setProperty('--sa-spot-r', `${spotlightRadius(d)}px`);
    };
    const paint = () => {
      frame = 0;
      if (dot) {
        dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        dot.style.opacity = visible ? '1' : '0';
      }
      if (shade) {
        shade.style.setProperty('--sa-spot-x', `${x}px`);
        shade.style.setProperty('--sa-spot-y', `${y}px`);
        shade.style.opacity = visible ? '1' : '0';
      }
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(paint); };
    const onMove = (e) => { x = e.clientX; y = e.clientY; visible = true; schedule(); };
    // Sortie de la FENÊTRE (relatedTarget nul), pas d'un élément à l'autre.
    const onOut = (e) => { if (!e.relatedTarget) { visible = false; schedule(); } };

    applySize();
    paint();
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerdown', onMove, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });
    window.addEventListener('resize', applySize);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onMove);
      document.removeEventListener('pointerout', onOut);
      window.removeEventListener('resize', applySize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [size, spotlight]);

  const palette = POINTER_COLORS[color] ?? POINTER_COLORS[DEFAULT_POINTER_COLOR];
  return (
    <div className="sa-classroom-pointer-layer" aria-hidden="true" data-classroom-pointer-layer>
      {spotlight && <div ref={shadeRef} className="sa-classroom-spotlight" data-classroom-spotlight />}
      <div
        ref={dotRef}
        className="sa-classroom-pointer"
        data-classroom-pointer={size}
        style={{
          '--sa-pointer-core': palette.core,
          '--sa-pointer-ring': palette.ring,
          '--sa-pointer-halo': palette.halo,
          '--sa-pointer-glow': palette.glow,
        }}
      >
        <span className="sa-classroom-pointer__core" />
      </div>
    </div>
  );
}
