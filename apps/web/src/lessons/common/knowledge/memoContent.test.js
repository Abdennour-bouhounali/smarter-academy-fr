import { describe, it, expect } from 'vitest';
import katex from 'katex';

/**
 * Le CONTENU de la fiche de mémoire, dans TOUTES les leçons (déploiement du prototype, docs/reports/LAB_PROTOTYPE_ROLLOUT.md) : chaque
 * connaissance qui porte un `memo` le porte entier et juste. Une leçon pas encore mise à jour (aucun `memo`) passe : la couverture est
 * suivie par `scripts/lab-rollout-status.mjs`, pas par ce test.
 *   rule, example, chip : KaTeX strict (la formule compile) · hook, trap, exam : du texte, `$…$` compilable
 *   quiz : 2 questions, 3 options distinctes, `correct` ∈ {0, 1, 2}, chaque `$…$` compile
 */
const LESSONS = import.meta.glob('../../moyen/**/knowledge.jsx', { eager: true });
const tex = (s) => () => katex.renderToString(s, { throwOnError: true, strict: 'error' });
const inline = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);

describe('memo — le contenu de la fiche de mémoire dans toutes les leçons', () => {
  const entries = Object.entries(LESSONS).flatMap(([file, mod]) => Object.values(mod.LESSON_KNOWLEDGE?.modules ?? {}).flat()
    .filter((item) => item.memo).map((item) => [file.replace(/^.*moyen\//, '').replace('/knowledge.jsx', ''), item]));

  it('au moins la leçon prototype porte des fiches', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)('%s › %#', (lesson, item) => {
    const { memo } = item;
    const where = `${lesson} › ${item.id}`;
    for (const f of ['rule', 'example', 'chip']) {
      expect(typeof memo[f], `${where}.${f}`).toBe('string');
      expect(tex(memo[f]), `${where}.${f}`).not.toThrow();
    }
    for (const f of ['hook', 'trap', 'exam']) {
      expect(String(memo[f] ?? '').trim().length, `${where}.${f}`).toBeGreaterThan(0);
      for (const m of inline(memo[f])) expect(tex(m), `${where}.${f}: ${m}`).not.toThrow();
    }
    expect(memo.quiz, `${where}.quiz`).toHaveLength(2);
    for (const q of memo.quiz) {
      expect(q.options, `${where}.quiz`).toHaveLength(3);
      expect(new Set(q.options).size, `${where}.quiz options distinctes`).toBe(3);
      expect([0, 1, 2], `${where}.quiz.correct`).toContain(q.correct);
      for (const text of [q.q, ...q.options]) for (const m of inline(text)) expect(tex(m), `${where}.quiz: ${m}`).not.toThrow();
    }
  });
});
