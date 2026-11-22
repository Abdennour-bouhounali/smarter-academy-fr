import { describe, it, expect } from 'vitest';
import { parseLines, serializeLines } from './linesModel';

describe('rédaction en lignes — texte RTL / formule LTR', () => {
  it('relit une rédaction enregistrée : formules `$…$`, texte arabe', () => {
    expect(parseLines('لدينا:\n$1215 = 945 \\times 1 + 270$')).toEqual([
      { kind: 'text', value: 'لدينا:' },
      { kind: 'math', value: '1215 = 945 \\times 1 + 270' },
    ]);
  });

  it('commence par une ligne vide du genre demandé', () => {
    expect(parseLines('', 'math')).toEqual([{ kind: 'math', value: '' }]);
    expect(parseLines(null, 'text')).toEqual([{ kind: 'text', value: '' }]);
  });

  it('enregistre une chaîne simple, sans lignes vides, lisible par RichText', () => {
    const lines = [{ kind: 'math', value: ' 945 = 270 \\times 3 + 135 ' }, { kind: 'text', value: '' }, { kind: 'text', value: 'إذن PGCD هو 135' }, { kind: 'math', value: '' }];
    expect(serializeLines(lines)).toBe('$945 = 270 \\times 3 + 135$\nإذن PGCD هو 135');
    expect(parseLines(serializeLines(lines))).toEqual([{ kind: 'math', value: '945 = 270 \\times 3 + 135' }, { kind: 'text', value: 'إذن PGCD هو 135' }]);
  });
});
