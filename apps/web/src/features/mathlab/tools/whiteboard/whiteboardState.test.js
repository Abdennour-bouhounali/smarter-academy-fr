import { describe, it, expect } from 'vitest';
import {
  WHITEBOARD_SCHEMA_VERSION, WHITEBOARD_BACKGROUND, createWhiteboardData, toWhiteboardData,
  toExcalidrawInitialData, isWhiteboardEmpty, whiteboardChangeSignature,
} from './whiteboardState.js';

describe('état de la سبّورة', () => {
  it('a une version de format entière', () => {
    expect(Number.isInteger(WHITEBOARD_SCHEMA_VERSION)).toBe(true);
  });

  it('naît vide, sur fond blanc, sans grille', () => {
    const data = createWhiteboardData();
    expect(data.elements).toEqual([]);
    expect(data.appState.viewBackgroundColor).toBe(WHITEBOARD_BACKGROUND);
    expect(data.seeded).toBe(false);
    expect(isWhiteboardEmpty(data)).toBe(true);
  });

  it('accepte une amorce de leçon et la marque à convertir', () => {
    const data = createWhiteboardData({ elements: [{ type: 'rectangle', x: 0, y: 0 }] });
    expect(data.elements).toHaveLength(1);
    expect(data.seeded).toBe(true);
    expect(createWhiteboardData({ elements: 'oops' }).seeded).toBe(false);
  });

  it('ne garde du JSON d’Excalidraw que le document de l’élève', () => {
    const data = toWhiteboardData({
      type: 'excalidraw', version: 2, source: 'https://excalidraw.com',
      elements: [{ id: 'a' }], appState: { viewBackgroundColor: '#fffbe6', gridSize: 20 }, files: { f: { id: 'f' } },
    });
    expect(Object.keys(data).sort()).toEqual(['appState', 'elements', 'files']);
    expect(data.appState.viewBackgroundColor).toBe('#fffbe6');
    expect(data.appState.gridSize).toBe(20);
    // Les octets ne voyagent pas dans le document : ils sont des fichiers du serveur.
    expect(data.files).toEqual({});
  });

  it('garde le bureau de géométrie quand il existe, assaini, et ne l’invente pas sinon', () => {
    expect(createWhiteboardData()).not.toHaveProperty('geometry');
    const data = toWhiteboardData({
      elements: [], appState: {},
      geometry: { instruments: { ruler: { visible: true, x: 10, y: 20, angle: 0, lengthCm: 20 }, compass: { radius: 'grand' } }, settings: { measures: true } },
    });
    expect(data.geometry.instruments.ruler).toMatchObject({ visible: true, x: 10, y: 20, lengthCm: 20 });
    expect(data.geometry.instruments.compass.radius).toBeGreaterThan(0);
    expect(data.geometry.settings.measures).toBe(true);
    expect(toWhiteboardData({ elements: [], geometry: 'x' })).not.toHaveProperty('geometry');
  });

  it('répare un état abîmé plutôt que de planter', () => {
    const data = toWhiteboardData({ elements: 'x', appState: null, files: [] });
    expect(data).toEqual({ elements: [], appState: { viewBackgroundColor: WHITEBOARD_BACKGROUND }, files: {} });
    expect(toWhiteboardData(null).elements).toEqual([]);
  });

  it('prépare l’ouverture : la vue va sur le dessin s’il y en a un', () => {
    expect(toExcalidrawInitialData(createWhiteboardData()).scrollToContent).toBe(false);
    const opened = toExcalidrawInitialData({ elements: [{ id: 'a' }], appState: {}, files: {} });
    expect(opened.scrollToContent).toBe(true);
    expect(opened.appState.collaborators).toBeInstanceOf(Map);
  });

  it('un dessin dont tout est supprimé est vide', () => {
    expect(isWhiteboardEmpty({ elements: [{ id: 'a', isDeleted: true }] })).toBe(true);
    expect(isWhiteboardEmpty({ elements: [{ id: 'a' }] })).toBe(false);
  });

  it('la signature bouge avec le contenu et les réglages, pas avec la vue', () => {
    const base = whiteboardChangeSignature(10, { viewBackgroundColor: '#fff', scrollX: 0, zoom: { value: 1 } });
    expect(whiteboardChangeSignature(10, { viewBackgroundColor: '#fff', scrollX: 500, zoom: { value: 2 } })).toBe(base);
    expect(whiteboardChangeSignature(11, { viewBackgroundColor: '#fff' })).not.toBe(base);
    expect(whiteboardChangeSignature(10, { viewBackgroundColor: '#000' })).not.toBe(base);
    expect(whiteboardChangeSignature(10, { viewBackgroundColor: '#fff', gridModeEnabled: true })).not.toBe(base);
    // Ce qu'Excalidraw complète lui-même à l'ouverture n'est pas un changement.
    expect(whiteboardChangeSignature(10, { viewBackgroundColor: '#fff', gridSize: 20 })).toBe(base);
  });
});
