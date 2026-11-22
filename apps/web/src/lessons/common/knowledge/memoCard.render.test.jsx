import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { renderToString } from 'react-dom/server';
import '../../../i18n';
import MemoCard from './MemoCard';
import { LESSON_KNOWLEDGE } from '../../moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/maqlub-qismat-kasrayn/knowledge';

const items = Object.entries(LESSON_KNOWLEDGE.modules).flatMap(([m, list]) => list.map((it) => ({ ...it, module: Number(m) })));
const count = (out, s) => out.split(s).length - 1;

describe('MemoCard — « 🔑 للتذكّر » en fiche de mémoire (prototype maqlub-qismat-kasrayn)', () => {
  it('chaque formule de `memo` (rule, example, chip) compile en KaTeX, sans erreur', () => {
    for (const it of items) {
      for (const f of ['rule', 'example', 'chip']) {
        expect(it.memo?.[f], `${it.id}.${f}`).toBeTruthy();
        expect(() => katex.renderToString(it.memo[f], { throwOnError: true, strict: 'error' }), `${it.id}.${f}`).not.toThrow();
      }
      for (const f of ['hook', 'trap', 'exam']) expect(it.memo?.[f], `${it.id}.${f}`).toBeTruthy();
    }
  });

  it('module 2 : ses apports en tuiles, les acquis en puces — chaque item UNE fois, « جديد » sur les seuls apports', () => {
    const upTo2 = items.filter((i) => i.module <= 2);
    const out = renderToString(<MemoCard items={upTo2} moduleNumber={2} openMap={() => {}} />);
    for (const it of upTo2) expect(count(out, `data-knowledge-item="${it.id}"`), it.id).toBe(1);
    expect(count(out, 'data-memo-tile=')).toBe(2);
    expect(count(out, 'data-memo-chip=')).toBe(3);
    expect(count(out, '>جديد<')).toBe(2);
    expect(out).toContain('data-knowledge-snapshot="2"');
    expect(out).toContain('قاعدتان جديدتان');
    expect(out).not.toMatch(/map\.memo\.|\{\{/);
  });

  it('un module sans apport (exercices) montre tout en tuiles ; sans `memo`, la tuile montre le résumé', () => {
    const out = renderToString(<MemoCard items={items.filter((i) => i.module <= 3)} moduleNumber={4} openMap={() => {}} />);
    expect(count(out, 'data-memo-tile=')).toBe(6);
    expect(count(out, '>جديد<')).toBe(0);
    const bare = renderToString(<MemoCard items={[{ id: 'x', type: 'regles', title: 'قاعدة', summary: 'ملخّص القاعدة', module: 1 }]} moduleNumber={1} openMap={() => {}} />);
    expect(bare).toContain('ملخّص القاعدة');
    expect(bare).not.toContain('data-memo-rule');
  });
});
