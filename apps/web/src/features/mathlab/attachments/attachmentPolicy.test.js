import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  MAX_FILE_BYTES, MAX_FILES_PER_DOCUMENT, MAX_FILES_PER_USER, ATTACHMENT_KINDS, ATTACHMENT_ACCEPT,
  classifyFile, remainingSlots, planSelection, errorKeyFrom, formatBytes, isDocumentFull, isUserFull,
} from './attachmentPolicy.js';

const here = dirname(fileURLToPath(import.meta.url));
const f = (name, size = 10) => ({ name, size });
const q = (docUsed, userUsed) => ({ document: { used: docUsed, max: MAX_FILES_PER_DOCUMENT }, user: { used: userUsed, max: MAX_FILES_PER_USER } });

describe('politique des fichiers', () => {
  it('dit les mêmes nombres que le serveur (MathLabFilePolicy.php)', () => {
    const php = readFileSync(resolve(here, '../../../../../api/app/Domain/MathLab/MathLabFilePolicy.php'), 'utf8');
    const constant = (name) => Number(php.match(new RegExp(`const ${name} = ([0-9_]+);`))[1].replace(/_/g, ''));
    expect(constant('MAX_FILE_BYTES')).toBe(MAX_FILE_BYTES);
    expect(constant('MAX_FILES_PER_DOCUMENT')).toBe(MAX_FILES_PER_DOCUMENT);
    expect(constant('MAX_FILES_PER_USER')).toBe(MAX_FILES_PER_USER);
    const extensions = php.match(/EXTENSIONS = \[([^\]]+)\]/)[1].match(/'([a-z]+)'/g).map((s) => s.replace(/'/g, '')).sort();
    expect(extensions).toEqual(Object.keys(ATTACHMENT_KINDS).sort());
  });

  it('1 Mo vaut 1 000 000 octets, 3 par سبّورة, 50 par élève', () => {
    expect(MAX_FILE_BYTES).toBe(1_000_000);
    expect(MAX_FILES_PER_DOCUMENT).toBe(3);
    expect(MAX_FILES_PER_USER).toBe(50);
    expect(ATTACHMENT_ACCEPT).toContain('.pdf');
  });

  it('classe un fichier par son extension', () => {
    expect(classifyFile(f('a.PNG')).kind).toBe('image');
    expect(classifyFile(f('a.jpeg')).kind).toBe('image');
    expect(classifyFile(f('a.svg')).kind).toBe('svg');
    expect(classifyFile(f('a.pdf')).group).toBe('attachment');
    expect(classifyFile(f('a.excalidraw')).group).toBe('import');
    expect(classifyFile(f('a.docx')).group).toBe('unsupported');
    expect(classifyFile(null).group).toBe('unsupported');
  });

  it('la taille : 999 Ko passe, 1 Mo passe, au-delà non', () => {
    expect(planSelection([f('a.png', 999_000)], q(0, 0)).error).toBeNull();
    expect(planSelection([f('a.png', 1_000_000)], q(0, 0)).error).toBeNull();
    expect(planSelection([f('a.png', 1_000_001)], q(0, 0)).error).toEqual({ code: 'tooLarge', name: 'a.png' });
    expect(planSelection([f('a.png', 0)], q(0, 0)).error.code).toBe('empty');
  });

  it('le quota de la سبّورة : 0, 1, 2 passent, 3 refuse', () => {
    for (const used of [0, 1, 2]) expect(planSelection([f('a.png')], q(used, 10)).error).toBeNull();
    expect(planSelection([f('a.png')], q(3, 10)).error.code).toBe('boardLimit');
  });

  it('le quota de l’élève : 49 passe, 50 refuse', () => {
    expect(planSelection([f('a.png')], q(0, 49)).error).toBeNull();
    expect(planSelection([f('a.png')], q(0, 50)).error.code).toBe('userLimit');
  });

  it('les deux limites ensemble', () => {
    expect(planSelection([f('a.png')], q(2, 49)).error).toBeNull();
    expect(planSelection([f('a.png')], q(2, 50)).error.code).toBe('userLimit');
    expect(planSelection([f('a.png')], q(3, 20)).error.code).toBe('boardLimit');
    expect(remainingSlots(q(1, 48))).toBe(2);
    expect(remainingSlots(q(2, 49))).toBe(1);
    expect(remainingSlots(null)).toBe(Infinity);
    expect(isDocumentFull(q(3, 0))).toBe(true);
    expect(isUserFull(q(0, 50))).toBe(true);
  });

  it('une sélection multiple se juge en entier, avant tout envoi', () => {
    expect(planSelection([f('a.png'), f('b.png')], q(1, 48)).attachments).toHaveLength(2);
    expect(planSelection([f('a.png'), f('b.png')], q(2, 49)).error).toEqual({ code: 'selectionTooMany', count: 1 });
    expect(planSelection([f('a.png'), f('b.docx')], q(0, 0)).error.code).toBe('unsupported');
    const plan = planSelection([f('a.png'), f('formes.excalidrawlib')], q(0, 0));
    expect(plan.attachments).toHaveLength(1);
    expect(plan.imports).toEqual([{ file: f('formes.excalidrawlib'), kind: 'library' }]);
    // Les imports (formes, dessin) ne prennent pas de place : une سبّورة pleine les accepte.
    expect(planSelection([f('formes.excalidrawlib')], q(3, 50)).error).toBeNull();
  });

  it('traduit les codes du serveur, sans lire ses phrases', () => {
    expect(errorKeyFrom({ code: 'math_lab_board_file_limit' })).toBe('boardLimit');
    expect(errorKeyFrom({ code: 'math_lab_user_file_limit' })).toBe('userLimit');
    expect(errorKeyFrom({ code: 'math_lab_file_too_large' })).toBe('tooLarge');
    expect(errorKeyFrom({ code: 'math_lab_file_unsupported' })).toBe('unsupported');
    expect(errorKeyFrom({ type: 'NETWORK_ERROR' })).toBe('network');
    expect(errorKeyFrom({ status: 404 })).toBe('notFound');
    expect(errorKeyFrom({ message: 'Fichier trop volumineux' })).toBe('uploadFailed');
  });

  it('écrit une taille lisible, en base 1000', () => {
    expect(formatBytes(512)).toEqual({ value: '512', unit: 'b' });
    expect(formatBytes(245_678)).toEqual({ value: '246', unit: 'kb' });
    expect(formatBytes(1_000_000)).toEqual({ value: '1', unit: 'mb' });
    expect(formatBytes(1_450_000)).toEqual({ value: '1.5', unit: 'mb' });
  });
});
