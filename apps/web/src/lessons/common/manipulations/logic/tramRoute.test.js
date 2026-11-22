import { describe, it, expect } from 'vitest';
import * as L from './tramRoute';
import { relText } from '@smarter-academy/core/arithmetic/relativeOps.js';

const stampAll = (s, order) => order.reduce((acc, i) => L.stampOp(acc, i), s);
const play = (s, order) => L.go(stampAll(s, order));
const BEGIN = () => L.init({ tasks: L.PRESETS.beginner.tasks });
const ADV = () => L.init({ tasks: L.PRESETS.advanced.tasks });

describe('tram-route — les tâches', () => {
  it('chaque tâche des préréglages : vérité conforme au plan, compteur en chiffres, aucun négatif', () => {
    const truths = { t1: '21', t2: '31', t3: '100', t4: '27', a1: '18', a2: '4,7', a3: '33', m1: '32' };
    for (const raw of [...L.PRESETS.beginner.tasks, ...L.PRESETS.advanced.tasks, ...L.PRESETS.alone.tasks]) {
      const t = L.buildTask(raw);
      expect(t.truthText, raw.id).toBe(truths[raw.id]);
      expect(t.trail.at(-1)).toEqual(t.truth);
    }
  });
  it('le compteur arrêt après arrêt (t1 : 26 · 17 · 21 ; t4 : 15 · 27)', () => {
    expect(L.buildTask(L.PRESETS.beginner.tasks[0]).trail.map((v) => relText(v))).toEqual(['26', '17', '21']);
    expect(L.buildTask(L.PRESETS.beginner.tasks[3]).trail.map((v) => relText(v))).toEqual(['15', '27']);
    expect(L.termsOf('32 − 4 × 5 + 6').map((t) => [t.sign, t.text, relText(t.value)])).toEqual([['+', '32', '32'], ['−', '4 × 5', '20'], ['+', '6', '6']]);
  });
  it('une tâche négative est refusée', () => { expect(() => L.buildTask({ id: 'x', chain: '4 − 9 + 20' })).toThrow(); });
});

describe('tram-route — les plans (chaque tâche, chaque mauvais plan, l\'absurdité qu\'il dessine)', () => {
  it('t1 : [0,1] juste ; [1,0] donne 13 et « نزل 13 ؟ لم ينزل إلا 9 »', () => {
    const ok = play(BEGIN(), [0, 1]);
    expect(ok.replay.ok).toBe(true); expect(ok.replay.conventional).toBe(true); expect(ok.done[0]).toBe(true);
    expect(ok.trials.map((e) => e.tk)).toEqual(['plan', 'solved']);
    const bad = play(BEGIN(), [1, 0]);
    expect(bad.replay.ok).toBe(false); expect(bad.replay.planText).toBe('13');
    expect(bad.replay.absurd).toMatchObject({ kind: 'overflow', value: '13', t: '9' });
    expect(bad.replay.station).toBe(1);   // le quai du marché, où le 9 descend
    expect(bad.done[0]).toBeUndefined();
    expect(bad.trials.at(-1)).toMatchObject({ tk: 'refused', reason: 'mismatch', order: [1, 0], value: '13', truth: '21', absurd: 'overflow' });
  });
  it('t2 : 40 − (12 − 6) + 9 = 43 et 40 − 12 − (6 + 9) = 13 sont refusés', () => {
    expect(play(BEGIN() && L.nextTask({ ...play(BEGIN(), [0, 1]) }), [1, 0, 2]).replay.planText).toBe('43');
    const s2 = L.nextTask(play(BEGIN(), [0, 1]));
    const wrong = play(s2, [0, 2, 1]);
    expect(wrong.replay.planText).toBe('13'); expect(wrong.replay.absurd.kind).toBe('overflow'); expect(wrong.replay.absurd.t).toBe('6');
    const ok = play(s2, [0, 1, 2]);
    expect(ok.replay.ok).toBe(true);
    // d'autres plans de t2 donnent aussi 31 (équivalents par la même valeur)
    expect(play(s2, [0, 1, 2]).replay.ok && play(s2, [1, 0, 2]).replay.ok).toBe(false);
  });
  it('t3 : × avant ÷ donne 6,25 DA pour 4 tickets', () => {
    let s = BEGIN(); for (let i = 0; i < 2; i += 1) { s = play(s, L.taskOf(s).order); s = L.nextTask(s); }
    expect(L.taskOf(s).id).toBe('t3');
    const bad = play(s, [1, 0]);
    expect(bad.replay.planText).toBe('6,25');
    expect(bad.replay.absurd).toMatchObject({ kind: 'price', tickets: '4', price: '6,25' });
    expect(play(s, [0, 1]).replay.ok).toBe(true);
  });
  it('t4 : + avant × donne 72 et dessine des fratries fantômes', () => {
    let s = BEGIN(); for (let i = 0; i < 3; i += 1) { s = play(s, L.taskOf(s).order); s = L.nextTask(s); }
    expect(L.taskOf(s).id).toBe('t4');
    const bad = play(s, [0, 1]);
    expect(bad.replay.planText).toBe('72');
    expect(bad.replay.absurd).toMatchObject({ kind: 'groups', value: '18', a: '15', m: '4' });
    expect(play(s, [1, 0]).replay.ok).toBe(true);
  });
  it('de droite à gauche : le tram « remonte » le temps', () => {
    const bad = play(BEGIN(), [1, 0]);
    expect(L.absurdOf(L.taskOf(BEGIN()), '26 − 9 + 4', [1, 0]).kind).toBe('overflow');
    expect(L.absurdOf(L.buildTask({ id: 'z', chain: '40 − 12 − 6 + 9' }), '40 − 12 − 6 + 9', [2, 1, 0]).kind).toBe('backwards');
    expect(bad.replay.ok).toBe(false);
  });
  it('un plan équivalent par commutativité est ACCEPTÉ mais non conventionnel (chaîne de + seulement)', () => {
    const s = L.setFree(BEGIN(), '26 + 4 + 9');
    const r = play(s, [1, 0]);
    expect(r.replay.ok).toBe(true); expect(r.replay.conventional).toBe(false);
    expect(r.trials.at(-1).tk).toBe('custom');
    expect(r.done).toEqual({});   // libre : rien ne compte
  });
  it('la prédiction est un diagnostic : enregistrée au départ, jamais bloquante', () => {
    let s = ADV(); s = built(s);
    expect(L.canGo(stampAll(s, [0, 1, 2]))).toBe(true);
    const ok = L.go(L.setPred(stampAll(s, [1, 0, 2]), '18'));
    expect(ok.trials.find((e) => e.tk === 'predict')).toMatchObject({ predicted: '18', truth: '18', ok: true });
    const none = L.go(stampAll(s, [1, 0, 2]));
    expect(none.trials.some((e) => e.tk === 'predict')).toBe(false);
    function built(st) { return writeAll(st); }
  });
});

function writeAll(s) {
  // l'élève écrit la chaîne de l'histoire jeton par jeton
  const bank = L.bankOf(L.taskOf(s));
  const tokens = ['n0', 'o1', 'n2', 'o3', 'n4', 'o5', 'n6'].slice(0, L.taskOf(s).nOps * 2 + 1);
  let st = s;
  for (const id of tokens) st = L.placeToken(st, bank.find((b) => b.id === id));
  return L.checkBuild(st);
}

describe('tram-route — écrire la chaîne (متقدم)', () => {
  it('a1 : la chaîne juste est acceptée ; STORYSIGN et STORYORDER sont refusés par la valeur', () => {
    const s = ADV();
    expect(L.canStamp(s)).toBe(false);   // rien à tamponner avant d'avoir écrit
    const ok = writeAll(s);
    expect(ok.builtText).toBe('32 − 4 × 5 + 6');
    expect(ok.trials.at(-1)).toEqual({ tk: 'build', id: 'a1', chain: '32 − 4 × 5 + 6', ok: true });
    const bank = L.bankOf(L.taskOf(s));
    const place = (ids) => ids.reduce((st, id) => L.placeToken(st, bank.find((b) => b.id === id)), s);
    // 32 + 4 × 5 + 6 (le signe de l'histoire est oublié) : pas la même valeur, mais on n'a que 3 opérateurs : −, ×, + ; permute
    const swapped = L.checkBuild(place(['n0', 'o3', 'n2', 'o1', 'n4', 'o5', 'n6']));
    expect(swapped.builtText).toBeNull(); expect(swapped.trials.at(-1).ok).toBe(false);   // 32 + 4 − 5 × 6 : l'ordre n'est pas celui de l'histoire
    // les cases ne reçoivent que le bon genre
    expect(L.placeToken(s, bank.find((b) => b.id === 'o1')).slots[0]).toBeNull();
    expect(L.placeToken(s, bank.find((b) => b.id === 'o1')).slots[1]).toBe('o1');
  });
  it('reprendre un jeton libère sa case', () => {
    const s = ADV(); const bank = L.bankOf(L.taskOf(s));
    const a = L.placeToken(s, bank.find((b) => b.id === 'n0'));
    expect(L.takeToken(a, 0).slots[0]).toBeNull();
  });
  it('3 tâches, chacune dans les deux niveaux, ont une réserve de jetons mélangée mais complète', () => {
    for (const raw of L.PRESETS.advanced.tasks) {
      const t = L.buildTask(raw);
      const bank = L.bankOf(t);
      expect(bank.map((b) => b.text).sort()).toEqual(t.chain.split(' ').sort());
    }
  });
});

describe('tram-route — tickets', () => {
  it('poser, reprendre (les suivants se décalent), effacer', () => {
    let s = BEGIN();
    s = L.stampOp(s, 1); s = L.stampOp(s, 0);
    expect(L.ticketOf(s, 1)).toBe(1); expect(L.ticketOf(s, 0)).toBe(2);
    s = L.toggleOp(s, 1);
    expect(L.ticketOf(s, 0)).toBe(1); expect(L.ticketOf(s, 1)).toBe(0);
    expect(L.clearStamps(s).stamps).toEqual([]);
    expect(L.canGo(s)).toBe(false);
  });
  it('« انطلق » exige tous les tickets ; après une rejouée refusée on ne peut plus tamponner avant « مسح »', () => {
    let s = play(BEGIN(), [1, 0]);
    expect(L.stampOp(s, 0).stamps).toEqual([1, 0]);
    s = L.clearStamps(s);
    expect(L.canStamp(s)).toBe(true);
  });
  it('une tâche faite est figée ; « المهمة التالية » repart de zéro ; restartTask la rend à faire', () => {
    let s = play(BEGIN(), [0, 1]);
    expect(L.canStamp(s)).toBe(false); expect(L.canNext(s)).toBe(true);
    s = L.nextTask(s); expect(s.stamps).toEqual([]); expect(L.taskOf(s).id).toBe('t2');
    s = L.restartTask(play(s, [0, 1, 2]));
    expect(s.done[1]).toBe(false); expect(L.canStamp(s)).toBe(true);
  });
});

describe('tram-route — « جرّب أعدادك »', () => {
  it('construit la chaîne de l\'histoire libre', () => {
    expect(L.validateFree('26', [{ type: 'off', n: '9' }, { type: 'on', n: '4' }])).toEqual({ ok: true, chain: '26 − 9 + 4' });
    expect(L.validateFree('15', [{ type: 'groupsOn', k: '3', m: '4' }])).toEqual({ ok: true, chain: '15 + 3 × 4' });
    expect(L.validateFree('٢٠', [{ type: 'groupsOff', k: '2', m: '5' }, { type: 'on', n: '3' }])).toEqual({ ok: true, chain: '20 − 2 × 5 + 3' });
  });
  it('refuse un compteur sous 0, un nombre hors 1 … 40, aucun arrêt, plus de quatre', () => {
    expect(L.validateFree('10', [{ type: 'off', n: '12' }])).toMatchObject({ ok: false, why: 'below' });
    expect(L.validateFree('10', [{ type: 'groupsOff', k: '3', m: '4' }])).toMatchObject({ ok: false, why: 'below' });
    expect(L.validateFree('10', [{ type: 'on', n: '41' }])).toMatchObject({ ok: false, why: 'range' });
    expect(L.validateFree('0', [{ type: 'on', n: '4' }])).toMatchObject({ ok: false, why: 'range' });
    expect(L.validateFree('10', [])).toMatchObject({ ok: false, why: 'empty' });
    expect(L.validateFree('10', Array(5).fill({ type: 'on', n: '1' }))).toMatchObject({ ok: false, why: 'range' });
  });
  it('setFree / toGuided', () => {
    const f = L.setFree(BEGIN(), '15 + 3 × 4');
    expect(L.isFree(f)).toBe(true); expect(L.taskOf(f).truthText).toBe('27');
    expect(L.toGuided(f).free).toBeNull();
  });
});

describe('tram-route — coach', () => {
  it('stamp → stampMore → go → retry ; jamais un ordre ni un nombre', () => {
    let s = BEGIN();
    expect(L.coachOf(s).id).toBe('stamp');
    s = L.stampOp(s, 0); expect(L.coachOf(s)).toMatchObject({ id: 'stampMore', target: '[data-tr-op="1"]' });
    s = L.stampOp(s, 1); expect(L.coachOf(s).id).toBe('go');
    s = L.go(L.clearStamps(L.go(L.stampOp(L.stampOp(L.clearStamps(s), 1), 0)))); // refusé puis effacé
    expect(L.coachOf(s).id).toBe('stamp');
    const refused = play(BEGIN(), [1, 0]); expect(L.coachOf(refused).id).toBe('retry');
  });
  it('avancé : écrire d\'abord, puis prédire', () => {
    expect(L.coachOf(ADV()).id).toBe('build');
    expect(L.coachOf(writeAll(ADV())).id).toBe('predict');
  });
  it('en libre : null ; tout fait : free', () => {
    expect(L.coachOf(L.setFree(BEGIN(), '15 + 3 × 4'))).toBeNull();
  });
});
