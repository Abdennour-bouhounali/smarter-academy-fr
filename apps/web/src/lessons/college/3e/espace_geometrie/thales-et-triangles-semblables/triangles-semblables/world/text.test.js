// The sentences of triangles-semblables the kit shows: a name for every practice level, French, naming no rule.
import { describe, it, expect } from 'vitest';
import { plain, typographyErrors } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { PRACTICE_NODES } from './practice';
import { TEXT } from './text';

/** The words that NAME a rule of the lesson (a level's name says a place or a question, never one of them). */
const RULE_WORDS = /semblable|homologue|proportionnel|côté|angle|quotient|coefficient|rapporteur|triangle|forme/i;

describe('triangles-semblables — the sentences the kit shows', () => {
  it('a name for every level of every node, plain, French, and none says a key’s name or its rule', () => {
    expect(Object.keys(TEXT.levels)).toEqual(PRACTICE_NODES.map((n) => n.id));
    for (const node of PRACTICE_NODES) expect(TEXT.levels[node.id]).toHaveLength(node.levels.length);
    for (const name of Object.values(TEXT.levels).flat()) {
      plain(name);
      expect(name.startsWith('Sortie : '), name).toBe(true);
      expect(name).not.toMatch(RULE_WORDS);
      expect(typographyErrors(name), name).toEqual([]);
    }
    for (const s of Object.values(TEXT.summary)) plain(s);
    expect(JSON.stringify(TEXT)).not.toMatch(/faux|erreur/i);
  });
});
