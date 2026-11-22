import { createContext, useContext } from 'react';
import { MODES } from './numberState.js';

/**
 * مختبر الأعداد والحساب dans les deux مخابر (labScope.js, MATH_LAB.md §2.1).
 *
 * Les seize modes dans les DEUX مخابر (décision du propriétaire, 2026-09-30) :
 * le مخبر الثانوي ÉTEND celui du collège, il ne lui retire rien — nombres,
 * fractions, puissances, divisibilité et PGCD/PPCM sont initialisés au
 * collège et réutilisés au lycée. Aucune capacité n'est donc déclarée ;
 * la mécanique ci-dessous (un contexte pour les ponts entre modes) reste
 * prête pour le jour où un mode propre au lycée (intervalles, valeur
 * absolue) arrivera : il se déclarera `secondaire` seulement.
 */
export const NUMBER_LAB_SCOPES = Object.freeze(['moyen', 'secondaire']);

export const NUMBER_LAB_CAPABILITIES = Object.freeze({ moyen: null, secondaire: null });

/** Les modes que ce مخبر montre (`null` = les seize). */
export function numberLabModes(capabilities) {
  return capabilities?.modes ? MODES.filter((mode) => capabilities.modes.includes(mode)) : MODES;
}

/** Un mode enregistré hors de portée rouvre sur le premier mode du مخبر ; le reste est gardé. */
export function clampToModes(data, modes) {
  return modes.includes(data.mode) ? data : { ...data, mode: modes[0] };
}

/**
 * Les modes ouverts, pour les PONTS entre modes (« أرسِل إلى », « انتقل إلى
 * القسمة… ») : un pont vers un mode que le مخبر ne montre pas n'est pas
 * dessiné. Un contexte, parce que ces ponts sont semés dans une dizaine de
 * composants de mode.
 */
export const NumberLabModesContext = createContext(MODES);

export function useModeAvailable(mode) {
  return useContext(NumberLabModesContext).includes(mode);
}
