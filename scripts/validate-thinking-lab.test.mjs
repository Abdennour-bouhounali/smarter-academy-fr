// Le validateur du « مختبر التفكير » attrape-t-il vraiment ce qu'il prétend attraper ?
// Chaque cas part du défi #318 (valide) et casse UNE règle.
import { describe, it, expect } from 'vitest';
import { readChallenges } from './build-thinking-lab-index.mjs';
import { validateThinkingLab, forbiddenIn, leaksAnswer, bandOf } from './validate-thinking-lab.mjs';

const base = readChallenges().find((e) => e.file === '0318-four-arcs-area.json');
const clone = () => JSON.parse(JSON.stringify(base.data));
const run = (data, file = base.file) => validateThinkingLab([{ file, data }]).errors;

describe('validate-thinking-lab', () => {
  it('le défi #318 passe', () => {
    expect(run(clone())).toEqual([]);
  });

  it('refuse un champ inconnu (schéma)', () => {
    const c = clone();
    c.answr = 1;
    expect(run(c).join('\n')).toMatch(/champ inconnu « answr »/);
  });

  it('refuse une réponse illisible', () => {
    const c = clone();
    c.answer.value = 'x^2*(1+';
    expect(run(c).join('\n')).toMatch(/answer/);
  });

  it('refuse une erreur déclarée qui est en fait juste', () => {
    const c = clone();
    c.mistakes[0] = { value: '1+pi/3-sqrt(3)', scaleWith: 'x^2', reply: 'ليس بعد' };
    expect(run(c).join('\n')).toMatch(/ACCEPTÉE/);
  });

  it('refuse une clé qui divulgue la réponse (valeur équivalente, autre écriture)', () => {
    const c = clone();
    c.keys[2].text = 'الجواب هو x²(1 + π/3 − √3) طبعًا';
    expect(run(c).join('\n')).toMatch(/keys\[2\].*divulgue/);
  });

  it('refuse une tranche qui ne suit pas le numéro, et un faux sommet', () => {
    const c = clone();
    c.band = 'middle';
    c.summit = true;
    const errors = run(c).join('\n');
    expect(errors).toMatch(/tranche « secondary »/);
    expect(errors).toMatch(/summit/);
  });

  it('refuse une longue relecture sans « اشرح لنفسك »', () => {
    const c = clone();
    c.replay.forEach((s) => delete s.ask);
    expect(run(c).join('\n')).toMatch(/ask/);
  });

  it('refuse une phase inconnue', () => {
    const c = clone();
    c.keys[0].phase = 'X';
    expect(run(c).join('\n')).toMatch(/phase/);
  });

  it('refuse un nom de fichier qui ne suit pas NNNN-id.json', () => {
    expect(run(clone(), '318-four-arcs.json').join('\n')).toMatch(/0318-four-arcs-area\.json/);
  });

  it('refuse des numéros en double', () => {
    const errors = validateThinkingLab([{ file: base.file, data: clone() }, { file: base.file, data: clone() }]).errors.join('\n');
    expect(errors).toMatch(/déjà pris/);
  });

  it('refuse un mot interdit', () => {
    const c = clone();
    c.statement = 'لعبة بالنرد: ما احتمال أن يظهر 6 مرّتين؟';
    expect(run(c).join('\n')).toMatch(/mot interdit/);
  });

  it('vérifie chaque tuple de params', () => {
    const c = clone();
    c.params = { vars: { a: [2, 3] } };
    c.statement = 'مربّع طول ضلعه {a}x، احسب المساحة المشتركة بين الأقواس الأربعة.';
    c.mistakes = c.mistakes.slice(0, 2);
    expect(run(c)).toEqual([]);
    c.keys[0].text = 'هل تعرف قانونًا لمساحة {b}؟';
    expect(run(c).join('\n')).toMatch(/non rempli/);
  });
});

describe('aides', () => {
  it('mots interdits : mots entiers, l\'article seul comme préfixe', () => {
    expect(forbiddenIn('شجرة كبيرة')).toBeNull();
    expect(forbiddenIn('برهان المبرهنة')).toBeNull();
    expect(forbiddenIn('عيد الميلاد المشترك')).toBeNull();
    expect(forbiddenIn('رمي النرد')).toBe('نرد');
    expect(forbiddenIn('قرض بفائدة')).toBe('قرض بفائدة');
    expect(forbiddenIn('🐷')).toBe('🐷');
  });

  it('fuite par valeur pour un nombre', () => {
    expect(leaksAnswer('اضرب 3/5 في 2/4', { check: 'rational', value: '3/10' })).toBeNull();
    expect(leaksAnswer('النتيجة 0,3', { check: 'rational', value: '3/10' })).toBe('0,3');
  });

  it('tranches cachées', () => {
    expect([bandOf(1), bandOf(120), bandOf(121), bandOf(318), bandOf(500)]).toEqual(['primary', 'primary', 'middle', 'secondary', 'university']);
  });
});
