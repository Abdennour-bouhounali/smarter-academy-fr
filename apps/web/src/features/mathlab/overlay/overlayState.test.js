import { describe, it, expect } from 'vitest';
import {
  PICKER, CLOSED, escapeAction, fullscreenAction, nextTool, describeOverlay,
} from './overlayState.js';

describe('Échap : un niveau à la fois', () => {
  it('quitte d’abord le plein écran applicatif, sans fermer', () => {
    expect(escapeAction({ appFullscreen: true, browserFullscreen: false })).toBe('exitAppFullscreen');
  });

  it('quitte d’abord le plein écran du navigateur, sans fermer', () => {
    expect(escapeAction({ appFullscreen: false, browserFullscreen: true })).toBe('exitBrowserFullscreen');
  });

  it('ne ferme que depuis l’état fenêtré', () => {
    expect(escapeAction({ appFullscreen: false, browserFullscreen: false })).toBe('close');
  });

  it('ne ferme JAMAIS directement depuis le plein écran — le travail serait perdu d’un coup', () => {
    expect(escapeAction({ appFullscreen: true, browserFullscreen: true })).not.toBe('close');
    expect(escapeAction({ appFullscreen: false, browserFullscreen: true })).not.toBe('close');
  });
});

describe('plein écran : le repli est la règle, pas l’exception (§3)', () => {
  it('demande le vrai plein écran quand le navigateur en a un', () => {
    expect(fullscreenAction({ wide: false, supported: true })).toBe('requestBrowser');
  });

  it('prend l’écran applicativement quand le navigateur n’a pas d’API (Safari iOS)', () => {
    expect(fullscreenAction({ wide: false, supported: false })).toBe('useAppFallback');
  });

  it('ressort de l’un comme de l’autre par le même geste', () => {
    expect(fullscreenAction({ wide: true, supported: true })).toBe('exit');
    expect(fullscreenAction({ wide: true, supported: false })).toBe('exit');
  });
});

describe('ce que le calque montre', () => {
  it('s’ouvre sur le SÉLECTEUR, jamais sur un instrument choisi d’office', () => {
    expect(nextTool(CLOSED, { type: 'open' })).toBe(PICKER);
  });

  it('peut s’ouvrir directement sur un instrument nommé', () => {
    expect(nextTool(CLOSED, { type: 'open', tool: 'vectors' })).toBe('vectors');
  });

  it('choisir remplace le sélecteur par l’instrument', () => {
    expect(nextTool(PICKER, { type: 'pick', tool: 'whiteboard' })).toBe('whiteboard');
  });

  it('on revient au sélecteur sans fermer', () => {
    expect(nextTool('whiteboard', { type: 'backToPicker' })).toBe(PICKER);
  });

  it('fermer rend la main à la leçon', () => {
    expect(nextTool('whiteboard', { type: 'close' })).toBe(CLOSED);
  });

  it('décrit l’état sans jamais confondre le sélecteur avec un instrument', () => {
    expect(describeOverlay(CLOSED)).toEqual({ isOpen: false, isPicking: false, toolId: null });
    expect(describeOverlay(PICKER)).toEqual({ isOpen: true, isPicking: true, toolId: null });
    expect(describeOverlay('vectors')).toEqual({ isOpen: true, isPicking: false, toolId: 'vectors' });
  });
});
