import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS } from './tilings';
import { PEER_SHEET } from './peerSheet';

/**
 * La mission de amaliyat-judhur (rollout 2026-11-10, conseil du 2026-11-10) : les points d'étape ne touchent à aucun nombre de la مسألة —
 * 180, √180, 6√5, 5 et 12 comme aires, √12 et 2√3, 36 et 6 dalles, 16 et 192, 8√3, 108, 45, 3√5, 9 et 18, √90, 150 دج, 1 cm, 3 متربّصين — ni à
 * sa MÉTHODE (aucune reconstruction « aire = dalles × aire d'une dalle, donc côté = k√b ») ; les manches, leur consigne et la ورقة زميل non plus.
 * Et aucun texte destiné à l'élève ne renvoie au manuel.
 */
const { mission } = LESSON_CONFIG;
const text = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const FORBIDDEN = ['180', '12', '36', '16', '192', '108', '45', '18', '90', '150'];
const isolated = (s, n) => new RegExp(`(^|[^0-9,{}^.])${n}([^0-9,{}.]|$)`).test(s);
const RADICALS = [/6\s*\\sqrt\{5\}/, /2\s*\\sqrt\{3\}/, /8\s*\\sqrt\{3\}/, /3\s*\\sqrt\{5\}/, /\\sqrt\{(180|12|90)\}/];

describe('the mission of amaliyat-judhur', () => {
  it('one checkpoint after each of modules 1–3, the climax in module 5', () => {
    expect(mission.climaxModule).toBe(5);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3]);
    expect(mission.scene).toBe('courtyard-slabs');
  });
  it('the checkpoints never use the climax numbers, radicals nor its tiles method', () => {
    mission.checkpoints.forEach((cp) => {
      const s = text(cp);
      FORBIDDEN.forEach((n) => expect(isolated(s, n), `${cp.id} ${n}`).toBe(false));
      RADICALS.forEach((re) => expect(re.test(s), `${cp.id} ${re}`).toBe(false));
      expect(s.includes('بلاط'), `${cp.id} tiles`).toBe(false);
    });
  });
  it('the checkpoints are the council\'s: √7 × √28, √2 + √2 = √4 ?, √147 ÷ √3', () => {
    expect(7 * 28).toBe(14 ** 2);
    expect(147 / 3).toBe(7 ** 2);
    const [a, b, c] = mission.checkpoints;
    expect(a.options[a.correct]).toBe('$14$');
    expect(b.options[b.correct]).toBe('لا');
    expect(c.options[c.correct]).toBe('$7$');
    mission.checkpoints.forEach((cp) => expect(cp.options[cp.correct]).toBeTruthy());
  });
  it('what the rounds and the peer sheet show never uses the climax numbers', () => {
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const s = `${r.title ?? ''} ${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`;
      FORBIDDEN.forEach((n) => expect(isolated(s, n), `${r.id} ${n}`).toBe(false));
    }));
    const peer = JSON.stringify(PEER_SHEET);
    FORBIDDEN.forEach((n) => expect(isolated(peer, n), `peer ${n}`).toBe(false));
  });
  it('no student-visible line of the config sends to the textbook', () => {
    const visible = [LESSON_CONFIG.description, mission.title, mission.opening.text, ...mission.tools.map((t) => t.label), ...mission.checkpoints.map(text),
      ...LESSON_CONFIG.modules.map((m) => `${m.title} ${m.desc}`), ...LESSON_CONFIG.resources.map((r) => `${r.title} ${r.objective ?? ''} ${r.autonomy ?? ''}`)];
    visible.forEach((s) => expect(s.includes('الكتاب'), s).toBe(false));
  });
});
