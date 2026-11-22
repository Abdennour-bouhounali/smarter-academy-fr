import i18n from '../../../i18n';

/**
 * LE vocabulaire de la maîtrise — `student:mastery.*`, et rien d'autre.
 *
 * Quatre états (unassessed / gap / reinforce / mastered), trois raisons
 * (`statusReason`, Mastery V2) et trois fraîcheurs (`freshness`) : tout écran
 * qui nomme la maîtrise d'un point d'apprentissage lit ces clés. Les anciens
 * doublons (`progression.chips.*`, `unit.mastery.*`) ont été retirés : un
 * même état ne doit jamais avoir deux noms selon la page.
 *
 * Fonctions PURES (hors React) pour être lues par un tooltip, un `aria-label`
 * ou un test aussi bien que par un composant. `t` est injectable ; par défaut
 * c'est l'instance i18n de l'application, lue à l'APPEL (jamais au
 * chargement du module — l'ordre d'import ne fige aucun libellé).
 */

export const MASTERY_STATE_KEYS = ['unassessed', 'gap', 'reinforce', 'mastered'];
const STATUS_REASONS = ['threshold', 'insufficient_evidence', 'needs_assessment'];
const FRESHNESS_LEVELS = ['fresh', 'aging', 'stale'];

/**
 * Le nombre d'items distincts que le moteur exige par défaut (plan §14,
 * `min_distinct_items`). Le serveur le borne par la taille réelle de la
 * banque (`evidence.needed` de l'explication) ; le profil ne le renvoie pas,
 * cette valeur n'est donc qu'un REPLI d'affichage quand la ligne n'en porte
 * pas.
 */
export const DEFAULT_DISTINCT_ITEMS_NEEDED = 3;

const defaultT = (key, options) => i18n.t(key, { ns: 'student', ...options });

/** Le libellé d'un état — `mastery.<state>`, `unassessed` pour tout inconnu. */
export function stateLabel(state, t = defaultT) {
  const key = MASTERY_STATE_KEYS.includes(state) ? state : 'unassessed';
  return t(`mastery.${key}`);
}

/**
 * La phrase qui explique un état `reinforce` : vide pour `threshold` (rien à
 * dire : la confiance seule décide) et pour une ligne sans raison.
 *
 * @param {{statusReason?: string|null, distinctItemsSuccess?: number, needed?: number, evidence?: {distinctItemsSuccess?: number, needed?: number}}|null|undefined} row
 * @param {(key: string, options?: object) => string} [t]
 * @returns {string}
 */
export function reasonLabel(row, t = defaultT) {
  const reason = row?.statusReason;
  if (!reason || reason === 'threshold' || !STATUS_REASONS.includes(reason)) return '';

  if (reason === 'insufficient_evidence') {
    const done = row.distinctItemsSuccess ?? row.evidence?.distinctItemsSuccess ?? 0;
    const needed = row.needed ?? row.evidence?.needed ?? DEFAULT_DISTINCT_ITEMS_NEEDED;
    return t('mastery.reason.insufficient_evidence', { done, needed });
  }

  return t('mastery.reason.needs_assessment');
}

/**
 * Le marqueur de fraîcheur d'une ligne : « récent », « il y a un moment »,
 * « à rafraîchir » — vide quand le serveur n'en donne pas (point jamais évalué).
 *
 * @param {{freshness?: string|null}|null|undefined} row
 * @param {(key: string, options?: object) => string} [t]
 * @returns {string}
 */
export function freshnessLabel(row, t = defaultT) {
  const freshness = row?.freshness;
  if (!freshness || !FRESHNESS_LEVELS.includes(freshness)) return '';
  return t(`mastery.freshness.${freshness}`);
}

/**
 * Le texte d'un tooltip : l'état, puis la raison quand elle existe, puis la
 * fraîcheur d'un point acquis quand elle n'est plus « fresh ».
 */
export function masteryTooltip(state, row, t = defaultT) {
  const parts = [stateLabel(state, t)];
  const reason = state === 'reinforce' ? reasonLabel(row, t) : '';
  if (reason) parts.push(reason);
  if (state === 'mastered' && row?.freshness && row.freshness !== 'fresh') {
    const fresh = freshnessLabel(row, t);
    if (fresh) parts.push(fresh);
  }
  return parts.join(' — ');
}
