import { describe, it, expect } from 'vitest';
import {
  WHITEBOARD_IMPORT_ACCEPT, WHITEBOARD_IMPORT_MAX_BYTES, IMPORT_ERROR_CODES, WhiteboardImportError,
  classifyImportFile, checkImportFile, parseLibraryText,
} from './whiteboardImport.js';

const file = (name, size = 10, type = '') => ({ name, size, type });
const codeOf = (fn) => { try { fn(); } catch (e) { return e instanceof WhiteboardImportError ? e.code : `not-import-error:${e}`; } return 'no-error'; };

describe('import sur la سبّورة', () => {
  it('propose la bibliothèque au sélecteur, et borne la taille comme le serveur', () => {
    expect(WHITEBOARD_IMPORT_ACCEPT).toContain('.excalidrawlib');
    expect(WHITEBOARD_IMPORT_MAX_BYTES).toBe(2_000_000);
  });

  it('reconnaît le genre d’un fichier par son nom puis son type', () => {
    expect(classifyImportFile(file('formes.excalidrawlib'))).toBe('library');
    expect(classifyImportFile(file('FORMES.EXCALIDRAWLIB'))).toBe('library');
    expect(classifyImportFile(file('dessin.excalidraw'))).toBe('scene');
    expect(classifyImportFile(file('photo.png'))).toBe('image');
    expect(classifyImportFile(file('photo', 10, 'image/jpeg'))).toBe('image');
    expect(classifyImportFile(file('data.json'))).toBe('unknown');
    expect(classifyImportFile(null)).toBe('unknown');
  });

  it('refuse avant lecture ce qui ne peut pas être une bibliothèque, avec un code précis', () => {
    expect(codeOf(() => checkImportFile(null))).toBe('empty');
    expect(codeOf(() => checkImportFile(file('a.excalidrawlib', 0)))).toBe('empty');
    expect(codeOf(() => checkImportFile(file('a.excalidrawlib', WHITEBOARD_IMPORT_MAX_BYTES + 1)))).toBe('tooLarge');
    expect(codeOf(() => checkImportFile(file('photo.png')))).toBe('image');
    expect(codeOf(() => checkImportFile(file('dessin.excalidraw')))).toBe('scene');
    expect(checkImportFile(file('a.excalidrawlib'))).toBe('library');
    expect(checkImportFile(file('a.json'))).toBe('unknown');
  });

  it('lit une bibliothèque v2 ou v1, et rien d’autre', () => {
    const v2 = JSON.stringify({ type: 'excalidrawlib', version: 2, libraryItems: [{ id: 'a', elements: [] }] });
    const v1 = JSON.stringify({ type: 'excalidrawlib', version: 1, library: [[{ id: 'e' }]] });
    expect(parseLibraryText(v2)).toHaveLength(1);
    expect(parseLibraryText(v1)).toHaveLength(1);
    expect(codeOf(() => parseLibraryText('not json'))).toBe('invalidJson');
    expect(codeOf(() => parseLibraryText(JSON.stringify({ type: 'excalidraw', version: 2, elements: [] })))).toBe('notLibrary');
    expect(codeOf(() => parseLibraryText(JSON.stringify({ type: 'excalidrawlib', version: 3, libraryItems: [] })))).toBe('notLibrary');
    expect(codeOf(() => parseLibraryText(JSON.stringify({ type: 'excalidrawlib', version: 2, libraryItems: 'x' })))).toBe('notLibrary');
    expect(codeOf(() => parseLibraryText(JSON.stringify({ type: 'excalidrawlib', version: 2, libraryItems: [] })))).toBe('noItems');
    expect(codeOf(() => parseLibraryText('null'))).toBe('notLibrary');
  });

  it('garde la cause technique et ne connaît que des codes annoncés', () => {
    try { parseLibraryText('{'); } catch (e) { expect(e.cause).toBeInstanceOf(SyntaxError); expect(IMPORT_ERROR_CODES).toContain(e.code); }
  });
});
