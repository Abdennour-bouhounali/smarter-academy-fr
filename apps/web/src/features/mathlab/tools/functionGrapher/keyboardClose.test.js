import { describe, it, expect } from 'vitest';
import { placeCloseButton, closeKeyboard } from './keyboardClose';

const button = () => ({ hidden: false, style: {} });

describe('keyboardClose — le bouton « إغلاق » suit le clavier virtuel', () => {
  it('caché quand le clavier est fermé ou sans géométrie', () => {
    const b = button();
    placeCloseButton(b, { visible: false }, 800);
    expect(b.hidden).toBe(true);
    placeCloseButton(b, { visible: true, boundingRect: { top: 800, height: 0, right: 360 } }, 800);
    expect(b.hidden).toBe(true);
  });
  it('posé sur le bord HAUT du clavier ouvert, jamais sur ses touches', () => {
    globalThis.window = globalThis.window ?? { innerWidth: 360 };
    const b = button();
    placeCloseButton(b, { visible: true, boundingRect: { top: 520, height: 280, right: window.innerWidth } }, 800);
    expect(b.hidden).toBe(false);
    expect(b.style.bottom).toBe('280px');
  });
  it('ferme comme « [hide-keyboard] » : commande sur le champ actif, puis le quitter, puis ranger le clavier', () => {
    const calls = [];
    const field = { tagName: 'MATH-FIELD', executeCommand: (c) => calls.push(c), blur: () => calls.push('blur') };
    closeKeyboard({ hide: () => calls.push('hide') }, { activeElement: field });
    expect(calls).toEqual(['hideVirtualKeyboard', 'blur', 'hide']);
  });
});
