import { describe, it, expect } from 'vitest';
import katex from 'katex';
import * as Q from './memoQuiz';
import { LESSON_KNOWLEDGE } from '../../moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/maqlub-qismat-kasrayn/knowledge';

const items = Object.entries(LESSON_KNOWLEDGE.modules).flatMap(([m, list]) => list.map((it) => ({ ...it, module: Number(m) })));
const noShuffle = () => 0.999;   // Fisher–Yates avec j = i : l'ordre d'origine

describe('memoQuiz — le défi chronométré de la fiche de mémoire', () => {
  it('les apports du module d’abord (une question par règle, puis une seconde), 5 au plus, numéros de tuile', () => {
    const qs = Q.buildQuiz(items.filter((i) => i.module <= 2), 2, { rng: noShuffle });
    expect(qs).toHaveLength(5);
    expect(qs.slice(0, 2).map((q) => q.itemId)).toEqual(['maqlub-tarif', 'sifr-item']);
    expect(qs[0].n).toBe(1);
    expect(qs.find((q) => q.itemId === 'maqlub').n).toBeNull();   // un acquis : pas de tuile
    const counts = [0, 1, 2].map((p) => qs.filter((q) => q.correct === p).length);
    expect(Math.max(...counts)).toBeLessThanOrEqual(2);
  });

  it('la bonne réponse change de place : chaque place au plus ⌈n/3⌉ fois, jamais deux fois de suite (1 000 tirages)', () => {
    for (let run = 0; run < 1000; run += 1) {
      for (const n of [3, 4, 5]) {
        const slots = Q.answerSlots(n);
        expect(slots).toHaveLength(n);
        for (const p of [0, 1, 2]) expect(slots.filter((x) => x === p).length).toBeLessThanOrEqual(Math.ceil(n / 3));
        for (let i = 1; i < n; i += 1) expect(slots[i]).not.toBe(slots[i - 1]);
      }
    }
  });

  it('le mélange garde UNE bonne réponse, au bon indice', () => {
    let seed = 7;
    const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (const q of Q.buildQuiz(items, 1, { rng, size: 20 })) {
      const raw = items.find((i) => i.id === q.itemId).memo.quiz[Number(q.id.split('#')[1])];
      expect(q.options[q.correct]).toBe(raw.options[raw.correct]);
      expect(new Set(q.options).size).toBe(3);
    }
  });

  it('un tour : réponse jugée une seule fois, temps écoulé = faux, suivante, bilan', () => {
    let s = Q.start(Q.buildQuiz(items, 1, { size: 3, rng: noShuffle }));
    expect(Q.next(s)).toBe(s);                       // rien avant la réponse
    const right = s.questions[0].correct;
    s = Q.answer(s, right, 2000);
    expect(Q.answer(s, (right + 1) % 3, 10)).toBe(s); // déjà jugée
    s = Q.next(s);
    s = Q.next(Q.answer(s, (s.questions[1].correct + 1) % 3, 3000)); // faux
    s = Q.timeout(s);
    expect(s.results.map((r) => r.ok)).toEqual([true, false, false]);
    s = Q.next(s);
    expect(s.done).toBe(true);
    expect(Q.summary(s)).toEqual({ score: 1, total: 3, seconds: 17, stars: 1, review: [2, 3] });
  });

  it('le contenu de la leçon : 2 questions par règle, 3 choix, une réponse, KaTeX valide', () => {
    for (const it of items) {
      expect(it.memo.quiz, it.id).toHaveLength(2);
      for (const q of it.memo.quiz) {
        expect(q.options, it.id).toHaveLength(3);
        expect(q.correct >= 0 && q.correct < 3, it.id).toBe(true);
        for (const text of [q.q, ...q.options]) {
          for (const m of text.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), `${it.id}: ${m[1]}`).not.toThrow();
        }
      }
    }
  });
});
