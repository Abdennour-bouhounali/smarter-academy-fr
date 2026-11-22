import { useEffect } from 'react';

/**
 * Verrouille le défilement de la page (html ET body) pendant qu'une
 * présentation est active, et RESTAURE exactement les valeurs inline
 * précédentes en sortant (brief §6). Le `overflow-x: hidden` de la feuille
 * de style globale n'est pas touché : on ne lit et n'écrit que le style
 * inline, dont la valeur d'avant est presque toujours la chaîne vide.
 *
 * Le nettoyage tourne aussi au démontage : un changement de route en pleine
 * présentation ne laisse jamais la page figée.
 */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return undefined;
    const html = document.documentElement;
    const body = document.body;
    const previous = { html: html.style.overflow, body: body.style.overflow };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    // Un MARQUEUR pour la page : une séance est en cours. Il sert à retirer
    // le chrome flottant de la page (« كرّاسي », « بطاقتي »), qui n'a pas sa
    // place sur un projecteur et recouvrirait la sortie. La classe vit sur
    // <body>, hors de la racine de présentation, donc le CSS de la page peut
    // la lire — ce qu'un état React interne ne permettrait pas.
    body.classList.add('sa-classroom-session');
    return () => {
      html.style.overflow = previous.html;
      body.style.overflow = previous.body;
      body.classList.remove('sa-classroom-session');
    };
  }, [active]);
}
