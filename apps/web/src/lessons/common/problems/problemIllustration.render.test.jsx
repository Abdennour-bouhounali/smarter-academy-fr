import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import ProblemIllustration from './ProblemIllustration';
import { validateIllustration, ILLUSTRATION_KINDS } from './problemIllustration';

// Six situations of the six FIGURE kinds, written for this test (2026-11-20: the lesson whose problems were the fixtures
// is a v2 lesson, its old pages are deleted). The drawing shows the statement's numbers and never the answer.
const PROBLEMS = [
  { id: 'wadiya-1', statement: 'في مكتبة 1512 كرّاسًا و 840 كتابًا تُوزَّع في رزم متماثلة.', illustration: { kind: 'books', notebooks: 1512, books: 840, ariaLabel: 'كراريس وكتب' } },
  { id: 'wadiya-2', statement: 'عند بائع 154 زهرة بيضاء و 126 زهرة حمراء يصنع منها باقات متماثلة.', illustration: { kind: 'bouquets', white: 154, red: 126, ariaLabel: 'أزهار بيضاء وحمراء' } },
  { id: 'wadiya-3', statement: 'حقل مستطيل طوله 468 م وعرضه 156 م يُحاط بأعمدة.', illustration: { kind: 'field', length: 468, width: 156, unit: 'م', ariaLabel: 'حقل مستطيل' } },
  { id: 'wadiya-4', statement: 'أرض مثلّثة أضلاعها 168 م و 126 م و 84 م تُغرس أشجارًا.', illustration: { kind: 'orchard', sides: [168, 126, 84], unit: 'م', ariaLabel: 'أرض مثلّثة' } },
  { id: 'wadiya-5', statement: 'صفيحة زجاجية طولها 240 سم وعرضها 150 سم تُقطَّع مربّعات.', illustration: { kind: 'glass', length: 240, width: 150, unit: 'سم', ariaLabel: 'صفيحة زجاجية' } },
  { id: 'wadiya-6', statement: 'قاعة طولها 720 سم وعرضها 480 سم تُبلَّط ببلاطات مربّعة.', illustration: { kind: 'hall', length: 720, width: 480, unit: 'سم', ariaLabel: 'قاعة تُبلَّط' } },
];

describe('ProblemIllustration — le dessin de la situation', () => {
  it('each of the six figure kinds has a valid illustration', () => {
    expect(PROBLEMS.map((p) => p.illustration.kind)).toEqual(['books', 'bouquets', 'field', 'orchard', 'glass', 'hall']);
    for (const p of PROBLEMS) expect(validateIllustration(p.illustration), p.id).toEqual([]);
    expect(new Set(PROBLEMS.map((p) => p.illustration.kind)).size).toBe(6);
  });

  it('les cotes dessinées sont celles de l\'énoncé — le dessin ne donne pas la réponse', () => {
    for (const p of PROBLEMS) {
      const html = renderToString(<ProblemIllustration illustration={p.illustration} />);
      expect(html).toContain(`data-problem-illustration="${p.illustration.kind}"`);
      expect(html).toContain('direction:ltr');
      expect(html).toContain(p.illustration.ariaLabel);
      const il = p.illustration;
      const nums = [il.notebooks, il.books, il.white, il.red, il.length, il.width, ...(il.sides ?? [])].filter((n) => n != null);
      for (const n of nums) {
        expect(p.statement, `${p.id} ${n}`).toContain(String(n));
        expect(html, `${p.id} ${n}`).toContain(`>${n}`);
      }
    }
  });

  it('la plaque et la salle montrent un découpage générique marqué « ؟ » : le vrai nombre de carreaux est la réponse', () => {
    for (const id of ['wadiya-5', 'wadiya-6']) {
      const html = renderToString(<ProblemIllustration illustration={PROBLEMS.find((p) => p.id === id).illustration} />);
      expect(html).toContain('؟');
    }
  });

  it('le validateur refuse un genre inconnu ou un ariaLabel non arabe', () => {
    expect(ILLUSTRATION_KINDS).toHaveLength(14);
    expect(validateIllustration({ kind: 'x', ariaLabel: 'x' }).length).toBeGreaterThan(0);
    expect(validateIllustration({ kind: 'field', length: 1, width: 1, unit: 'م', ariaLabel: 'field' })).toContain('ariaLabel arabe obligatoire');
  });
});
