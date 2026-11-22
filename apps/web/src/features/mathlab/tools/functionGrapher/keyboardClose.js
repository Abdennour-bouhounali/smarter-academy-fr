import i18n from 'i18next';

/**
 * Le bouton « إغلاق » du CLAVIER VIRTUEL de MathLive (propriétaire, 2026-10-08 : « ajoute un bouton fermer »).
 * Les dispositions par défaut de MathLive 0.110 n'ont pas toutes la touche « [hide-keyboard] », et la barre
 * d'outils du clavier est redessinée à chaque état : on n'y injecte rien. Un bouton FIXE, posé sur le bord
 * supérieur du clavier (au-dessus de ses touches, jamais dessus), suit sa géométrie (`geometrychange`) et sa
 * visibilité (`virtual-keyboard-toggle`), et ferme par l'API (`mathVirtualKeyboard.hide()`).
 *
 * Installé UNE fois par `ensureMathLive()` : chaque champ MathLive (feuille d'examen, outils du مخبر) l'a.
 * Le libellé vient de l'instance PARTAGÉE `i18next` (celle que `src/i18n` initialise), sans importer ce module :
 * son initialisation ferait suspendre les composants des tests qui chargent MathLive.
 */
let installed = false;

export function placeCloseButton(button, keyboard, viewportHeight) {
  const rect = keyboard?.visible ? keyboard.boundingRect : null;
  if (!rect || !(rect.height > 0)) { button.hidden = true; return; }
  button.hidden = false;
  // Collé au bord haut du clavier, à droite (début de ligne en arabe).
  button.style.bottom = `${Math.max(0, viewportHeight - rect.top)}px`;
  button.style.right = `${Math.max(8, window.innerWidth - rect.right + 8)}px`;
}

/**
 * Fermer comme la touche intégrée « [hide-keyboard] » : en mode « auto », un champ encore actif ROUVRE aussitôt le
 * clavier (examKeyboard.js) — on exécute donc `hideVirtualKeyboard` sur le champ actif, on le quitte, puis on range.
 */
export function closeKeyboard(keyboard, doc = document) {
  const active = doc.activeElement;
  if (active && active.tagName === 'MATH-FIELD') {
    try { active.executeCommand?.('hideVirtualKeyboard'); } catch { /* commande absente : on range quand même */ }
    active.blur?.();
  }
  keyboard?.hide?.();
}

export function installKeyboardCloseButton() {
  if (installed || typeof window === 'undefined' || typeof document === 'undefined') return;
  const keyboard = window.mathVirtualKeyboard;
  if (!keyboard?.addEventListener) return;
  installed = true;

  const button = document.createElement('button');
  button.type = 'button';
  button.hidden = true;
  button.dataset.mathKeyboardClose = '';
  button.setAttribute('dir', 'rtl');
  button.className = 'sa-math-keyboard-close';
  const label = () => {
    button.textContent = `✕ ${i18n.t('common:mathKeyboard.close')}`;
    button.setAttribute('aria-label', i18n.t('common:mathKeyboard.closeLabel'));
  };
  label();
  i18n.on?.('languageChanged', label);
  // `pointerdown` empêché : le champ garde le focus jusqu'au clic (comme les touches du clavier).
  button.addEventListener('pointerdown', (e) => e.preventDefault());
  button.addEventListener('click', () => closeKeyboard(keyboard));
  document.body.appendChild(button);

  const update = () => placeCloseButton(button, keyboard, window.innerHeight);
  keyboard.addEventListener('geometrychange', update);
  keyboard.addEventListener('virtual-keyboard-toggle', update);
  window.addEventListener('resize', update);
}
