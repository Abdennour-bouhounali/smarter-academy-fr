/**
 * Lecture PURE du résumé d'offre rendu par le serveur — ce que les jauges
 * affichent, sans jamais recalculer une limite : la décision est prise
 * côté API (PlanEntitlementResolver), l'interface la lit.
 */

/**
 * Une jauge « courant / maximum ».
 * @param {{current?: number, maximum?: number|null}|null|undefined} meter
 * @returns {{current: number, maximum: number|null, unlimited: boolean, ratio: number, overLimit: boolean, atLimit: boolean, text: string}}
 */
export function describeMeter(meter) {
  const current = Number(meter?.current ?? 0);
  const maximum = meter?.maximum === null || meter?.maximum === undefined ? null : Number(meter.maximum);
  const unlimited = maximum === null;
  const ratio = unlimited || maximum === 0 ? (current > 0 && maximum === 0 ? 1 : 0) : Math.min(1, current / maximum);
  return {
    current,
    maximum,
    unlimited,
    ratio,
    overLimit: !unlimited && current > maximum,
    atLimit: !unlimited && current >= maximum,
    // Toujours en chiffres LTR : « 3 / 5 » — le composant pose dir="ltr".
    text: unlimited ? `${current}\u00A0/\u00A0∞` : `${current}\u00A0/\u00A0${maximum}`,
  };
}

/** Les fonctionnalités actives, en liste de clés, pour l'affichage. */
export function activeFeatures(features = {}) {
  return Object.entries(features).filter(([, on]) => on === true).map(([key]) => key);
}
