import { describe, it, expect } from 'vitest';
import { resolveVisual, CONCEPT_VISUAL_SIZES } from './ConceptVisual';

/**
 * Ce que ces tests verrouillent : un visuel n'est JAMAIS coupé, et une taille
 * sémantique inconnue retombe sur 'md' au lieu de disparaître.
 */
describe('resolveVisual — la présentation d’un visuel de connaissance', () => {
  it('sans taille déclarée, la leçon garde le comportement par défaut', () => {
    expect(resolveVisual(undefined, 'brick').size).toBe('md');
    expect(resolveVisual(undefined, 'brick').maxWidth).toBe(CONCEPT_VISUAL_SIZES.md);
  });

  it('les tailles sémantiques croissent, et « full » prend toute la largeur', () => {
    const { sm, md, lg, full } = CONCEPT_VISUAL_SIZES;
    expect(sm).toBeLessThan(md);
    expect(md).toBeLessThan(lg);
    expect(full).toBe('100%');
  });

  it('une taille inconnue ne casse pas la carte : elle vaut « md »', () => {
    expect(resolveVisual('enorme', 'brick').size).toBe('md');
    expect(resolveVisual('enorme', 'brick').maxWidth).toBe(CONCEPT_VISUAL_SIZES.md);
  });

  it('AUCUN contexte ne coupe le visuel — il défile plutôt que de se perdre', () => {
    for (const ctx of ['brick', 'drawer', 'print', 'inconnu']) {
      expect(resolveVisual('lg', ctx).box).not.toContain('overflow-hidden');
    }
    expect(resolveVisual('lg', 'brick').box).toContain('overflow-x-auto');
  });

  it('le tiroir et l’impression n’ajoutent pas un cadre de plus', () => {
    expect(resolveVisual('md', 'drawer').box).not.toContain('border');
    expect(resolveVisual('md', 'print').box).not.toContain('border');
    expect(resolveVisual('md', 'brick').box).toContain('border');
  });
});
