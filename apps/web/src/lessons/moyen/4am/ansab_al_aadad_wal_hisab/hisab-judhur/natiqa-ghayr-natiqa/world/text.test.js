import { describe, it, expect } from 'vitest';
import { plain } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { PRACTICE_NODES } from './practice';
import { TABLETS } from './tablets';
import { TEXT } from './text';

describe('the sentences of « الأعداد الناطقة والأعداد غير الناطقة » the kit shows', () => {
  it('a name for every level of every node, plain, and none says a key’s name or its rule', () => {
    expect(Object.keys(TEXT.levels)).toEqual(PRACTICE_NODES.map((n) => n.id));
    for (const node of PRACTICE_NODES) expect(TEXT.levels[node.id]).toHaveLength(node.levels.length);
    for (const name of Object.values(TEXT.levels).flat()) {
      plain(name);
      expect(name.startsWith('سباق: '), name).toBe(true);
      for (const t of Object.values(TABLETS)) expect(name).not.toContain(t.title);
      expect(name).not.toMatch(/ناطق|مدو/);
    }
    for (const s of Object.values(TEXT.summary)) plain(s);
    expect(JSON.stringify(TEXT)).not.toMatch(/خطأ|خاطئ|غلط/);
  });
});
