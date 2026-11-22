import { describe, it, expect } from 'vitest';
import {
  MATH_LAB_BASE_PATH, mathLabBasePath, mathLabToolPath, newMathLabDocument, fromApiDocument, isPersisted, parseDocumentId, cleanTitle,
} from './mathLabDocument.js';

const tool = { id: 'whiteboard', slug: 'tableau', schemaVersion: 3, createInitialData: (seed) => ({ seed: seed ?? null }) };

describe('document du مختبر', () => {
  it('construit les adresses depuis le registre, jamais à la main', () => {
    expect(MATH_LAB_BASE_PATH).toBe('/espace/atelier');
    expect(mathLabToolPath(tool)).toBe('/espace/atelier/tableau');
    expect(mathLabToolPath(tool, 42)).toBe('/espace/atelier/tableau/42');
    // L'enseignant a le même مختبر dans son espace.
    expect(mathLabToolPath(tool, null, '/enseignant/atelier')).toBe('/enseignant/atelier/tableau');
    expect(mathLabToolPath(tool, 7, '/enseignant/atelier')).toBe('/enseignant/atelier/tableau/7');
  });

  /**
   * RÉGRESSION (signalée en usage) : un ENSEIGNANT était éjecté vers
   * `/enseignant` quelques secondes après avoir touché un instrument.
   *
   * `useMathLabDocument` réécrit l'adresse à la naissance du document, et
   * l'écrivait vers `/espace/atelier/...` en dur. `/espace` n'accepte que le
   * rôle `student`, d'où ProtectedRoute → /login → HomeRedirect →
   * `/enseignant` : l'instrument se fermait tout seul, travail en cours
   * compris. Le défaut était dans la COQUILLE partagée, donc il touchait les
   * huit instruments.
   *
   * On ne peut pas monter le crochet ici (pas de DOM dans cette suite), mais
   * on peut vérifier ce qui compte : que l'appel passe bien une racine.
   */
  it('la coquille réécrit l’adresse dans l’espace DU LECTEUR, jamais en dur', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const source = readFileSync(fileURLToPath(new URL('./useMathLabDocument.js', import.meta.url)), 'utf8');

    // La racine est lue depuis l'espace de travail…
    expect(source).toMatch(/mathLabBasePath\(useWorkspaceBase\(\)\)/);
    // …et l'adresse réécrite l'utilise : `mathLabToolPath(tool, id)` à deux
    // arguments retomberait sur `/espace/atelier`.
    expect(source).toMatch(/navigate\(mathLabToolPath\(tool, saved\.id, labRoot[,)]/);
    // …et garde le مخبر (`?lab=`) : un document né dans مخبر المتوسط n'est
    // pas renvoyé sans lui (labScope.js).
    expect(source).toMatch(/navigate\(mathLabToolPath\(tool, saved\.id, labRoot, doc\.scope\)/);
  });

  it('la racine suit l’espace de travail, `/espace` par défaut', () => {
    expect(mathLabBasePath('/enseignant')).toBe('/enseignant/atelier');
    expect(mathLabBasePath('/espace')).toBe(MATH_LAB_BASE_PATH);
    expect(mathLabBasePath(null)).toBe(MATH_LAB_BASE_PATH);
  });

  it('un document neuf n’a pas d’identifiant et tient l’état initial de son instrument', () => {
    const doc = newMathLabDocument(tool, { title: 'سبّورة', seed: { elements: [1] } });
    expect(doc.id).toBeNull();
    expect(isPersisted(doc)).toBe(false);
    expect(doc.tool).toBe('whiteboard');
    expect(doc.schemaVersion).toBe(3);
    expect(doc.data).toEqual({ seed: { elements: [1] } });
  });

  it('relit un document de l’API', () => {
    const doc = fromApiDocument({ id: 7, tool: 'whiteboard', title: 'x', schemaVersion: 1, data: { elements: [] }, updatedAt: '2026-09-21T10:00:00+00:00' });
    expect(isPersisted(doc)).toBe(true);
    expect(doc.updatedAt).toBe('2026-09-21T10:00:00+00:00');
    expect(fromApiDocument({ id: 8, tool: 'whiteboard' }).data).toBeNull();
  });

  it('ne lit dans l’URL qu’un entier positif', () => {
    expect(parseDocumentId('12')).toBe(12);
    expect(parseDocumentId(undefined)).toBeNull();
    expect(parseDocumentId('abc')).toBeNull();
    expect(parseDocumentId('0')).toBeNull();
    expect(parseDocumentId('1.5')).toBeNull();
  });

  it('nettoie et borne le titre, avec le titre par défaut en repli', () => {
    expect(cleanTitle('  رسم   المثلث ', 'سبّورة')).toBe('رسم المثلث');
    expect(cleanTitle('   ', 'سبّورة')).toBe('سبّورة');
    expect(cleanTitle('a'.repeat(200), 'x')).toHaveLength(160);
  });
});
