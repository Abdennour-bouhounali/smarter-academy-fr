import { createContext, useContext, useEffect, useRef } from 'react';

/**
 * Le LECTEUR de mission (MissionPlayer) parle à ce qu'il contient par ces deux contextes, dans leur propre fichier
 * (comme kitContext.js : un fichier sans composant garde l'identité de ses contextes au rechargement à chaud).
 *
 *   InMissionPlayer  : vrai sous le lecteur. Un labo n'y ouvre pas son propre plein écran (le lecteur EST la fenêtre).
 *   MissionUnitNav   : ContentModule déclare ses unités (où en est-on, peut-on avancer) ; le lecteur les montre dans sa
 *                      barre du bas, et ne passe au module suivant qu'à la dernière unité.
 */
export const InMissionPlayerContext = createContext(false);
export const MissionUnitNavContext = createContext(null);
/** La zone de contenu du lecteur, en px CSS ({ width, height }) : un labo y règle sa scène (TeamBuilder : le terrain). */
export const MissionAreaContext = createContext(null);
/** « Avancer » dans le module (page ou unité suivante), ou null au dernier écran : une réponse peut y mener seule (أستعدّ). */
export const MissionAdvanceContext = createContext(null);
/**
 * « Ré-ajuste cet écran » (FitToArea) : un changement de MISE EN PAGE voulu (la mission du labo passe de grand à compact) — l'écran
 * se re-pose une fois à sa juste taille. Hors lecteur : null (sans effet).
 */
export const FitRefitContext = createContext(null);
/**
 * LA PORTE DU LABO (conseil + propriétaire, 2026-11-07) : une étape qui attend une manche ouvre le labo SUR cette manche
 * (`jump(roundId, returnIndex)`), et la carte de victoire ramène à l'étape (`back()`). `request` : { roundId, returnIndex, nonce }
 * — jamais sauvegardé, effacé si l'élève quitte le labo autrement. Fourni par ContentModule au lecteur ; null ailleurs.
 */
export const LabJumpContext = createContext(null);
export function useLabJump() {
  return useContext(LabJumpContext);
}
export function useFitRefit() {
  return useContext(FitRefitContext);
}

/**
 * AVANCE SEULE quand `count` (le nombre de réponses données) MONTE : l'élève répond, l'écran suivant vient (propriétaire,
 * 2026-11-07, « أستعدّ »). Changer une réponse déjà donnée ne fait pas avancer ; au dernier écran, rien. Le délai laisse voir
 * le choix fait. Sans effet hors lecteur.
 */
export function useAutoAdvance(count, delayMs = 600) {
  // `advance` change à chaque rendu du lecteur : on lit la DERNIÈRE au moment d'avancer, sans relancer (ni annuler) le délai
  const advance = useRef(null);
  advance.current = useContext(MissionAdvanceContext);
  const seen = useRef(count);
  useEffect(() => {
    if (count <= seen.current) { seen.current = count; return undefined; }
    seen.current = count;
    const timer = setTimeout(() => advance.current?.(), delayMs);
    return () => clearTimeout(timer);
  }, [count, delayMs]);
}

export function useInMissionPlayer() {
  return useContext(InMissionPlayerContext);
}

export function useMissionArea() {
  return useContext(MissionAreaContext);
}

/**
 * Déclare la navigation par unités d'un module au lecteur (sans effet hors lecteur).
 * nav : { index, count, page, pageCount, kind ('brief' | 'intro' = le labo | 'step' | 'footer'), onPrevious?, onNext?, canNext }
 */
export function useDeclareUnitNav(nav) {
  const set = useContext(MissionUnitNavContext);
  useEffect(() => {
    if (!set) return undefined;
    set(nav);
    return () => set(null);
  }, [set, nav]);
}
