import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS, M2_ROUNDS } from './folds';

/**
 * La mission de muadalat-x-murabba (rollout 2026-11-10, conseil du 2026-11-10) : les points d'étape — ET ce que les manches du labo affichent
 * (leurs cartes et leurs consignes) — ne touchent à aucun nombre de la مسألة : les cartes 64, 0,09, 11, −36, leurs solutions 8, 0,3, √11, 6, la
 * lecture fausse 3,3, les points 10 / 15 / 5, les 42 élèves et les 8 minutes ; ni à ses pièges (« ± », une solution √ exacte à écrire). Et aucun
 * texte destiné à l'élève ne renvoie au manuel.
 */
const { mission } = LESSON_CONFIG;
const text = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const DECIMALS = ['0{,}09', '0,09', '0{,}3', '0,3', '3{,}3', '3,3', '\\sqrt{11}', '√11'];
const INTEGERS = ['64', '8', '11', '36', '6', '10', '15', '5', '42'];
/** un entier ISOLÉ (pas un chiffre d'un autre nombre, pas une décimale « 6{,}25 », pas un exposant « ^2 ») */
const isolated = (s, n) => new RegExp(`(^|[^0-9,{}^.])${n}([^0-9,{}.]|$)`).test(s);
const noClimax = (s, where, allow = []) => {
  DECIMALS.forEach((x) => {
    // « 0{,}3 » ne doit pas être le début d'un autre décimal (0,36 est aussi interdit ; 0,04 ne l'est pas)
    const hit = s.split(x).length > 1 && new RegExp(`${x.replace(/[{}\\,.√]/g, (c) => `\\${c}`)}(?![0-9])`).test(s);
    expect(hit, `${where} ${x}`).toBe(false);
  });
  INTEGERS.filter((n) => !allow.includes(n)).forEach((n) => expect(isolated(s, n), `${where} ${n}`).toBe(false));
};

describe('the mission of muadalat-x-murabba', () => {
  it('one checkpoint after each module before the climax', () => {
    expect(mission.climaxModule).toBe(4);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3]);
  });
  it('the checkpoints never use the climax numbers nor its traps (no ±, no exact-√ fix)', () => {
    mission.checkpoints.forEach((cp) => {
      const s = text(cp);
      noClimax(s, cp.id);
      expect(s.includes('\\pm') || s.includes('±'), `${cp.id} ±`).toBe(false);
      expect(s.includes('\\sqrt'), `${cp.id} √`).toBe(false);
    });
  });
  it('what the lab rounds SHOW (cards and leads) never uses the climax numbers either', () => {
    // module 2 keeps x² = 5, its worked example (its step 2 asks how to write the solutions of x² = 5) : in the مسألة, 5 is only a points
    // penalty — never a card nor a solution
    const rounds = [...M1_ROUNDS.map((r) => [r, []]), ...M2_ROUNDS.map((r) => [r, ['5']])];
    rounds.forEach(([r, allow]) => {
      const all = [r, r.easier].filter(Boolean);
      all.forEach((x) => noClimax(`${r.title ?? ''} ${x.props.lead} ${x.props.targets.join(' ')}`, r.id, allow));
    });
  });
  it('each checkpoint has its right answer among three options', () => {
    mission.checkpoints.forEach((cp) => { expect(cp.options).toHaveLength(3); expect(cp.options[cp.correct]).toBeTruthy(); });
  });
  it('no student-visible line of the config sends to the textbook', () => {
    const visible = [mission.title, mission.opening.text, ...mission.tools.map((t) => t.label), ...mission.checkpoints.map(text),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''} ${r.autonomy ?? ''}`)];
    visible.forEach((s) => expect(s.includes('الكتاب'), s).toBe(false));
  });
});
