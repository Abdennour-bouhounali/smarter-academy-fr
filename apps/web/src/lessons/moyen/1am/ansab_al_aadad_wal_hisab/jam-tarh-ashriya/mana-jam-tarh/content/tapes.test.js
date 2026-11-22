import { describe, it, expect } from 'vitest';
import { validateArcTape, tapeLengths } from '../../../../../../common/components/arcTape';
import { TAPES, ACTIVITY, METHOD, NOW_29 } from './textbook';
import { EX, SELF } from './exercises';

const d = (s) => Number(String(s).replace(',', '.'));
const near = (a, b) => Math.abs(a - b) < 1e-9;

describe('« معنى الجمع والطرح » — les mathématiques du contenu', () => {
  it.each(Object.entries(TAPES))('la bande %s est une figure juste (elle se ferme)', (_, t) => {
    expect(validateArcTape(t)).toEqual([]);
    expect(tapeLengths(t).closed).toBe(true);
  });

  it('نشاط 1 : chaque bulle donne la valeur du texte, et les six valeurs sont distinctes', () => {
    for (const t of ACTIVITY.texts) {
      const [a, op, b] = t.card.split(' ');
      const v = op === '+' ? d(a) + d(b) : d(a) - d(b);
      expect(near(v, d(t.value)), `texte ${t.n}`).toBe(true);
    }
    expect(new Set(ACTIVITY.texts.map((t) => t.value)).size).toBe(6);
  });

  it('طريقة p. 29 : إيناس a raison, هدى a inversé', () => {
    expect(METHOD.answers.ines).toEqual({ younes: 124 + 3, mohamed: 124 - 5 });
    expect(METHOD.answers.hoda).toEqual({ younes: 124 - 5, mohamed: 124 + 5 });
    expect(near(tapeLengths(TAPES.method1).parts[0], 135 - 14.2)).toBe(true);
    expect(tapeLengths(TAPES.method2).whole).toBe(31);
  });

  it('دوري الآن : 195 − 128 et 392 − 195 − 124', () => {
    expect(NOW_29.answers).toEqual({ setifBba: 195 - 128, bbaBouira: 392 - 195 - 124 });
    expect(tapeLengths(TAPES.routeBouira).parts[1]).toBe(NOW_29.answers.bbaBouira);
    expect(tapeLengths(TAPES.routeSetif).parts[1]).toBe(NOW_29.answers.setifBba);
  });

  it('les exercices et les items du test : chaque réponse recalculée', () => {
    expect(near(EX['ex-17'].question.expected, 10.5 + 7.8 - 2.7)).toBe(true);
    expect(near(EX['deep-8'].question.expected, 260 - 253.3 - 3.52)).toBe(true);
    const a = EX['ex-16'].answers;
    expect([a.a, a.b, a.c, a.d].map(d)).toEqual([7.03 - 2.7, 7.91 - 5.35, 45.3 + 245, 43.2 + 4.76].map((v) => Math.round(v * 100) / 100));
    expect(near(d(SELF[6].value), 17.8 - 12.4)).toBe(true);
    expect(near(d(SELF[7].value), 43.7 - 38.45)).toBe(true);
    expect(near(d(SELF[8].value), 1.68 - 0.02)).toBe(true);
  });
});
