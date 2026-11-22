import { describe, it, expect } from 'vitest';
import {
  POINTER_SIZES, DEFAULT_POINTER_SIZE, POINTER_COLORS, DEFAULT_POINTER_COLOR,
  pointerDiameter, spotlightRadius, normalizePointerSize, pointerShortcut, isEditableTarget,
} from './classroomPointer';

const key = (over = {}) => ({ code: 'KeyP', key: 'p', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, repeat: false, defaultPrevented: false, target: null, ...over });
// Un élément minimal : `closest` répond pour les sélecteurs de saisie.
const el = (matches = false, extra = {}) => ({ closest: () => (matches ? {} : null), ...extra });

describe('pointer sizes', () => {
  it('la grande taille est le défaut — l’outil existe pour les grandes salles', () => {
    expect(DEFAULT_POINTER_SIZE).toBe('l');
    expect(POINTER_SIZES).toEqual(['s', 'm', 'l']);
    expect(normalizePointerSize('bogus')).toBe('l');
    expect(normalizePointerSize('s')).toBe('s');
  });

  it('suit le petit côté de l’écran, borné pour rester lisible et raisonnable', () => {
    expect(pointerDiameter('l', 1366, 768)).toBe(77);   // portable
    expect(pointerDiameter('l', 1920, 1080)).toBe(108); // 1080p
    expect(pointerDiameter('l', 2560, 1440)).toBe(144); // 1440p
    expect(pointerDiameter('l', 3840, 2160)).toBe(216); // 4K
    expect(pointerDiameter('l', 390, 844)).toBe(72);    // téléphone : plancher
    expect(pointerDiameter('l', 8000, 8000)).toBe(240); // plafond
  });

  it('S < M < L à tout viewport', () => {
    for (const [w, h] of [[390, 844], [1366, 768], [1920, 1080], [3840, 2160]]) {
      expect(pointerDiameter('s', w, h)).toBeLessThan(pointerDiameter('m', w, h));
      expect(pointerDiameter('m', w, h)).toBeLessThan(pointerDiameter('l', w, h));
    }
  });

  it('l’éclairage entoure le pointeur avec de la marge', () => {
    expect(spotlightRadius(100)).toBeGreaterThan(100);
  });

  it('le rouge est la couleur par défaut, et la table est extensible', () => {
    expect(DEFAULT_POINTER_COLOR).toBe('red');
    expect(POINTER_COLORS.red.core).toMatch(/^#/);
  });
});

describe('pointerShortcut', () => {
  it('P bascule le pointeur, Maj+P l’éclairage', () => {
    expect(pointerShortcut(key())).toBe('pointer');
    expect(pointerShortcut(key({ shiftKey: true }))).toBe('spotlight');
  });

  it('lit la POSITION de la touche : clavier arabe (ح) ou AZERTY, même touche', () => {
    expect(pointerShortcut(key({ key: 'ح' }))).toBe('pointer');
    expect(pointerShortcut(key({ code: 'KeyO', key: 'p' }))).toBeNull();
  });

  it('jamais avec Ctrl/Cmd/Alt, en répétition, ou déjà traité', () => {
    expect(pointerShortcut(key({ ctrlKey: true }))).toBeNull();
    expect(pointerShortcut(key({ metaKey: true }))).toBeNull();
    expect(pointerShortcut(key({ altKey: true }))).toBeNull();
    expect(pointerShortcut(key({ repeat: true }))).toBeNull();
    expect(pointerShortcut(key({ defaultPrevented: true }))).toBeNull();
  });

  it('jamais pendant une saisie ni dans un instrument du مختبر', () => {
    expect(pointerShortcut(key({ target: el(true) }))).toBeNull();
    expect(pointerShortcut(key({ target: el(false, { isContentEditable: true }) }))).toBeNull();
    expect(pointerShortcut(key({ target: el(false) }))).toBe('pointer');
    expect(isEditableTarget(null)).toBe(false);
  });
});
