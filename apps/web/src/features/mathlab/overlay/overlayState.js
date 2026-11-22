/**
 * LA LOGIQUE PURE DU CALQUE — les décisions, sans React ni DOM.
 *
 * Le calque lui-même (MathLabOverlay.jsx) est du rendu et des effets : ce
 * qu'il DÉCIDE vit ici, où c'est vérifiable sans navigateur. C'est la
 * convention des tests de ce dépôt — la logique est pure, les composants
 * sont vérifiés en e2e (apps/web/e2e/).
 */

/** Le sélecteur d'instrument, en tant qu'« outil » ouvert. */
export const PICKER = '#picker';

/** Fermé. */
export const CLOSED = null;

/**
 * Ce qu'Échap doit faire, selon l'état du plein écran.
 *
 * Une touche, un niveau : on quitte d'abord le plein écran, on ferme
 * ensuite. Sans cela, un élève en plein écran qui appuie sur Échap pour
 * « récupérer la barre » perdrait tout son travail d'un coup.
 *
 * @param {{appFullscreen: boolean, browserFullscreen: boolean}} state
 * @returns {'exitAppFullscreen'|'exitBrowserFullscreen'|'close'}
 */
export function escapeAction({ appFullscreen, browserFullscreen }) {
  if (appFullscreen) return 'exitAppFullscreen';
  if (browserFullscreen) return 'exitBrowserFullscreen';

  return 'close';
}

/**
 * Ce que le bouton « ملء الشاشة » doit tenter.
 *
 * Le repli est le cœur de §3 : quand le navigateur n'a pas d'API plein
 * écran (Safari iOS) ou qu'il REFUSE la demande (politique d'iframe, pas de
 * geste utilisateur), on ne laisse pas l'élève sans rien — le calque prend
 * l'écran applicativement. Il a demandé de la place ; il en obtient.
 *
 * @param {{wide: boolean, supported: boolean}} state
 * @returns {'exit'|'requestBrowser'|'useAppFallback'}
 */
export function fullscreenAction({ wide, supported }) {
  if (wide) return 'exit';

  return supported ? 'requestBrowser' : 'useAppFallback';
}

/**
 * L'état du calque après un geste. `tool` est `null` (fermé), `PICKER` (on
 * choisit) ou l'identifiant d'un instrument.
 *
 * @param {string|null} tool
 * @param {{type: 'open'|'pick'|'backToPicker'|'close', tool?: string}} action
 */
export function nextTool(tool, action) {
  switch (action.type) {
    case 'open': return action.tool ?? PICKER;
    case 'pick': return action.tool ?? tool;
    case 'backToPicker': return PICKER;
    case 'close': return CLOSED;
    default: return tool;
  }
}

/** Le calque est-il ouvert, et sur quoi ? */
export function describeOverlay(tool) {
  return {
    isOpen: tool !== CLOSED,
    isPicking: tool === PICKER,
    toolId: tool === PICKER || tool === CLOSED ? null : tool,
  };
}
