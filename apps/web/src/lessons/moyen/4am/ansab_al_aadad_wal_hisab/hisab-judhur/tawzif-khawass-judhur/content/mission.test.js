import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { M1_ROUNDS } from './tilings';
import { PEER_SHEET } from './peerSheet';

/**
 * La mission de tawzif-khawass-judhur (rollout 2026-11-10, conseil du 2026-11-10, option C) : les points d'étape ne touchent à aucun nombre de
 * la مسألة — طاولة الفسيفساء : 200, √200, 10√2, 100, 50, 2√50, 5√8, 100√2, 120, 12 000, 12, 10, 25 pièces — ni à sa MÉTHODE (aucun « nombre de
 * pièces = k × k, puis le prix »), ni à la مسألة de la leçon 4 (180, 6√5) ; les manches et la ورقة زميل non plus. Et aucun texte destiné à
 * l'élève ne renvoie au manuel.
 */
const { mission } = LESSON_CONFIG;
const text = (cp) => [cp.prompt, ...cp.options, cp.explain].join(' ');
const FORBIDDEN = ['200', '100', '50', '120', '12000', '12', '10', '25', '180'];
const isolated = (s, n) => new RegExp(`(^|[^0-9,{}^.])${n}([^0-9,{}.]|$)`).test(s);
const RADICALS = [/10\s*\\sqrt\{2\}/, /2\s*\\sqrt\{50\}/, /5\s*\\sqrt\{8\}/, /100\s*\\sqrt\{2\}/, /6\s*\\sqrt\{5\}/, /\\sqrt\{(200|50|180)\}/];

describe('the mission of tawzif-khawass-judhur', () => {
  it('one checkpoint after each of modules 1–3, the climax in module 6, the courtyard re-paved', () => {
    expect(mission.climaxModule).toBe(6);
    expect(mission.checkpoints.map((c) => c.afterModule)).toEqual([1, 2, 3]);
    expect(mission.scene).toBe('courtyard-big');
    expect(LESSON_CONFIG.knowledgeMapOpen).toBe(true);
  });
  it('the checkpoints never use the climax numbers, radicals nor its pieces-and-price method', () => {
    mission.checkpoints.forEach((cp) => {
      const s = text(cp);
      FORBIDDEN.forEach((n) => expect(isolated(s, n), `${cp.id} ${n}`).toBe(false));
      RADICALS.forEach((re) => expect(re.test(s), `${cp.id} ${re}`).toBe(false));
      ['قطع', 'قطعة', 'بلاط', 'دج'].forEach((w) => expect(s.includes(w), `${cp.id} ${w}`).toBe(false));
    });
  });
  it('the checkpoints are the council\'s: √45, 2√3 + 5√3, 6 ÷ √3 — recomputed', () => {
    expect(45).toBe(3 ** 2 * 5);
    expect(2 + 5).toBe(7);
    expect(6 / 3).toBe(2);                     // 6√3 / 3 = 2√3
    const [a, b, c] = mission.checkpoints;
    expect(a.options[a.correct]).toBe('$3\\sqrt{5}$');
    expect(b.options[b.correct]).toBe('$7\\sqrt{3}$');
    expect(c.options[c.correct]).toBe('$2\\sqrt{3}$');
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
