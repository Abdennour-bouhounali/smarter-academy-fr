import { describe, it, expect } from 'vitest';
import * as linear from '@smarter-academy/core/arithmetic/linear.js';
import * as S from './storyModeller';

/**
 * story-modeller — la logique RÉELLE que StoryModeller.jsx importe, sur les histoires du manuel
 * (نشاط 3 : le musée, 140 visiteurs et 30300 DA ; le تحدّ : 37 pièces et 610 DA), celle du niveau
 * débutant (le derby : 20 supporters, 4800 DA) et celle que la synthèse passe (la fête : deux
 * informations d'ARGENT, 150x + 150y = 11250 et 24x + 30y = 2100).
 */
const F = (p) => linear.fracText(p);

const MUSEUM = {
  system: 'x+y=140|300x+150y=30300',
  unknowns: [{ id: 'x', noun: 'عدد البالغين' }, { id: 'y', noun: 'عدد الصغار' }],
  facts: [{ quote: 'استقبل المتحف 140 زائرا', kind: 'count' }, { quote: 'بلغت مداخيله 30300 DA', kind: 'money' }],
  chips: [{ value: '140', label: 'زائرا' }, { value: '300', label: 'DA' }, { value: '150', label: 'DA' }, { value: '30300', label: 'DA' }],
};
const STADIUM = {
  system: 'x+y=20|300x+150y=4800',
  unknowns: MUSEUM.unknowns,
  facts: [{ quote: '20', kind: 'count' }, { quote: '4800', kind: 'money' }],
  chips: [{ value: '20', label: '' }, { value: '300', label: '' }, { value: '150', label: '' }, { value: '4800', label: '' }],
};
const PARTY = {
  system: '150x+150y=11250|24x+30y=2100',
  unknowns: [{ id: 'x', noun: 'سعر علبة عصير' }, { id: 'y', noun: 'سعر قطعة حلوى' }],
  facts: [{ quote: '…11250 DA', kind: 'money' }, { quote: '…2100 DA', kind: 'money' }],
  chips: [{ value: '150', label: 'علبة عصير' }, { value: '150', label: 'قطعة حلوى' }, { value: '11250', label: 'DA' }, { value: '24', label: 'علبة' }, { value: '30', label: 'قطعة' }, { value: '2100', label: 'DA' }],
};
const COINS = {
  system: 'x+y=37|20x+10y=610',
  unknowns: [{ id: 'x', noun: 'عدد قطع 20DA' }, { id: 'y', noun: 'عدد قطع 10DA' }],
  facts: [{ quote: '37 قطعة', kind: 'count' }, { quote: '610DA', kind: 'money' }],
  chips: [{ value: '37' }, { value: '20' }, { value: '10' }, { value: '610' }],
};

/** Remplir une ligne avec des clés de jetons. */
const put = (lab, row, a, b, c) => [['a', a], ['b', b], ['c', c]].reduce((l, [s, k]) => S.fill(l, k, S.slotId(row, s)), lab);
const modelLab = (story, named = true) => S.init(S.parseModel(story), { named });

describe('story-modeller — lire l’histoire', () => {
  it('le musée : la jumla du manuel, ses jetons et le jeton « 1 », la solution (62 ; 78)', () => {
    const m = S.parseModel(MUSEUM);
    expect(m.ids).toEqual(['x', 'y']);
    expect(m.chips.map((c) => [c.key, F(c.value)])).toEqual([['c0', '140'], ['c1', '300'], ['c2', '150'], ['c3', '30300'], ['one', '1']]);
    expect([F(m.sol.x), F(m.sol.y)]).toEqual(['62', '78']);
    expect(m.hasCount).toBe(true);
  });

  it('refuse une histoire dont un nombre du modèle n’est porté par aucun jeton, ou sans solution unique', () => {
    expect(() => S.parseModel({ ...MUSEUM, chips: MUSEUM.chips.slice(0, 3) })).toThrow(/30300/);
    expect(() => S.parseModel({ ...MUSEUM, system: 'x+y=140|300x+300y=30300' })).toThrow();
    expect(() => S.parseModel({ ...MUSEUM, facts: [MUSEUM.facts[0]] })).toThrow();
  });

  it('les autres histoires : le derby (12 ; 8), la fête (25 ; 50), les pièces du تحدّ (24 ; 13)', () => {
    const sol = (st) => { const m = S.parseModel(st); return [F(m.sol.x), F(m.sol.y)]; };
    expect(sol(STADIUM)).toEqual(['12', '8']);
    expect(sol(PARTY)).toEqual(['25', '50']);
    expect(sol(COINS)).toEqual(['24', '13']);
    expect(S.parseModel(PARTY).hasCount).toBe(false);
  });
});

describe('1) اختيار المجاهيل — porter les lettres sur les noms', () => {
  const m = S.parseModel(MUSEUM);

  it('une donnée connue refuse la lettre ; un nom déjà nommé aussi ; déplacer une lettre la retire de l’ancien nom', () => {
    let lab = S.init(m, { named: false });
    expect(lab.stage).toBe('name');
    expect(S.canName(lab, 'x', 'known:c0')).toBe('known');
    expect(S.canName(lab, 'x', 'noun:x')).toBe(true);
    lab = S.name(lab, 'x', 'x');
    expect(S.canName(lab, 'y', 'noun:x')).toBe('taken');
    expect(S.canName(lab, 'x', 'noun:x')).toBe('');
    lab = S.name(lab, 'x', 'y');
    expect(lab.naming).toEqual({ x: null, y: 'x' });
    expect(S.namingDone(lab)).toBe(false);
    expect(S.openModel(lab).stage).toBe('name');
    lab = S.name(lab, 'y', 'x');
    expect(S.namingDone(lab)).toBe(true);
    expect(S.openModel(lab).stage).toBe('model');
  });

  it('nommer À L’ENVERS est permis : la jumla attendue se relit dans les lettres de l’élève', () => {
    let lab = S.name(S.name(S.init(m, { named: false }), 'y', 'x'), 'x', 'y'); // y = البالغون, x = الصغار
    lab = S.openModel(lab);
    lab = put(lab, 1, 'one', 'one', 'c0');
    lab = put(lab, 2, 'c2', 'c1', 'c3'); // 150x + 300y = 30300 (x = الصغار)
    lab = S.checkModel(lab, m);
    expect(lab.verdict.ok).toBe(true);
    const plan = S.solvePlan(S.studentSystem(lab, m), m.ids, 'sub');
    expect([F(plan.values.x), F(plan.values.y)]).toEqual(['78', '62']);
  });

  it('au niveau débutant les lettres sont déjà posées (on ouvre sur la traduction)', () => {
    const lab = S.init(m, { named: true });
    expect(lab.stage).toBe('model');
    expect(lab.naming).toEqual({ x: 'x', y: 'y' });
    expect(S.canName(lab, 'x', 'noun:y')).toBe('');
  });
});

describe('2) ترجمة المشكلة — « تحقّق » rejoue chaque information', () => {
  const m = S.parseModel(MUSEUM);
  const check = (a1, b1, c1, a2, b2, c2) => S.checkModel(put(put(modelLab(MUSEUM), 1, a1, b1, c1), 2, a2, b2, c2), m).verdict;

  it('la jumla du manuel est acceptée : x + y = 140 ; 300x + 150y = 30300', () => {
    const v = check('one', 'one', 'c0', 'c1', 'c2', 'c3');
    expect(v.ok).toBe(true);
    expect(S.systemText([S.studentEq(put(put(modelLab(MUSEUM), 1, 'one', 'one', 'c0'), 2, 'c1', 'c2', 'c3'), m, 1), S.studentEq(put(put(modelLab(MUSEUM), 1, 'one', 'one', 'c0'), 2, 'c1', 'c2', 'c3'), m, 2)], m.ids)).toBe('x+y=140|300x+150y=30300');
  });

  it('un PRIX compté comme une personne (300x + 150y = 140) : moneyInCount — MISC-JUMLA-TARJAMA', () => {
    const v = check('c1', 'c2', 'c0', 'c1', 'c2', 'c3');
    expect(v.ok).toBe(false);
    expect(v.rows[0]).toMatchObject({ ok: false, reason: 'moneyInCount', slot: 'a', chip: 'c1', otherRow: 2 });
    expect(v.rows[1].ok).toBe(true);
  });

  it('les deux prix échangés (150x + 300y) : swapped ; le total pris pour un prix : totalAsCoef ; un prix pour le total : coefAsTotal', () => {
    expect(check('one', 'one', 'c0', 'c2', 'c1', 'c3').rows[1]).toMatchObject({ reason: 'swapped' });
    expect(check('one', 'one', 'c0', 'c3', 'c2', 'c1').rows[1]).toMatchObject({ reason: 'totalAsCoef', slot: 'a', chip: 'c3' });
    expect(check('one', 'one', 'c0', 'c1', 'c2', 'c2').rows[1]).toMatchObject({ reason: 'coefAsTotal', slot: 'c', chip: 'c2' });
  });

  it('le jeton « 1 » dans l’information d’argent (x + y = 30300) : oneInMoney ; 140 dans l’argent : countInMoney', () => {
    expect(check('one', 'one', 'c0', 'one', 'one', 'c3').rows[1]).toMatchObject({ reason: 'oneInMoney', chip: 'one' });
    expect(check('one', 'one', 'c0', 'c1', 'c2', 'c0').rows[1]).toMatchObject({ reason: 'countInMoney', slot: 'c', chip: 'c0' });
  });

  it('une case vide : incomplete — jamais un « 1 » deviné', () => {
    let lab = modelLab(MUSEUM);
    lab = S.fill(S.fill(lab, 'c0', 'slot:1:c'), 'one', 'slot:1:a');
    lab = S.checkModel(lab, m);
    expect(lab.verdict.rows[0]).toEqual({ ok: false, reason: 'incomplete' });
    expect(lab.verdict.rows[1]).toEqual({ ok: false, reason: 'incomplete' });
    expect(lab.refusals).toBe(1);
  });

  it('une équation équivalente est acceptée ; remplir une case efface le verdict', () => {
    // deux informations d'argent : la fête — 24 posé dans la première information = l'autre information
    const p = S.parseModel(PARTY);
    let lab = S.init(p, { named: true });
    lab = put(lab, 1, 'c3', 'c1', 'c2');
    lab = put(lab, 2, 'c3', 'c4', 'c5');
    lab = S.checkModel(lab, p);
    expect(lab.verdict.rows[0]).toMatchObject({ ok: false, reason: 'otherFact', chip: 'c3', otherRow: 2 });
    expect(lab.verdict.rows[1].ok).toBe(true);
    lab = S.fill(lab, 'c0', 'slot:1:a');
    expect(lab.verdict).toBeNull();
    lab = S.checkModel(lab, p);
    expect(lab.verdict.ok).toBe(true); // 150 (علبة عصير) et 150 (قطعة حلوى) portent la même valeur
    expect(S.checkModel(put(lab, 1, 'c1', 'c0', 'c2'), p).verdict.ok).toBe(true);
    // le jeton « 1 » n'a pas sa place dans une histoire d'argent
    expect(S.checkModel(put(lab, 1, 'one', 'one', 'c2'), p).verdict.rows[0]).toMatchObject({ reason: 'oneInMoney' });
  });

  it('openSolve n’ouvre la résolution qu’après un modèle vérifié', () => {
    const lab = put(put(modelLab(MUSEUM), 1, 'one', 'one', 'c0'), 2, 'c1', 'c2', 'c3');
    expect(S.openSolve(lab).stage).toBe('model');
    expect(S.openSolve(S.checkModel(lab, m)).stage).toBe('solve');
  });
});

describe('3) حل الجملة — les lignes viennent de linearSystem', () => {
  const m = S.parseModel(MUSEUM);
  const sys = m.target;

  it('التعويض sur le musée : y = 140 − x, 300x + 150(140 − x) = 30300, 150x = 9300, x = 62, y = 140 − 62 = 78', () => {
    const plan = S.solvePlan(sys, m.ids, 'sub');
    expect(plan.lines.map((l) => l.tex)).toEqual([
      'y = 140 - x',
      '300x + 150(140 - x) = 30300',
      '150x = 9300',
      'x = 62',
      'y = 140 - 62 = 78',
      '(62 ; 78)',
    ]);
    expect(plan.lines.map((l) => l.key)).toEqual(['isolate', 'substitute', 'reduce', 'solveOne', 'backIso', 'pair']);
    expect(plan.halfAt).toBe(3);
  });

  it('الجمع sur le musée : (1) × 150, (2) × (−1), −150x = −9300, x = 62, puis y', () => {
    const plan = S.solvePlan(sys, m.ids, 'add');
    expect(plan.lines.map((l) => l.tex)).toEqual([
      '150x + 150y = 21000',
      '-300x - 150y = -30300',
      '-150x = -9300',
      'x = 62',
      '62 + y = 140 \\;\\Rightarrow\\; y = 78',
      '(62 ; 78)',
    ]);
    expect(plan.lines[1].vars).toEqual({ n: 2, k: -1 });
  });

  it('la fête (aucun coefficient 1) : on isole y = 75 − x, ou on multiplie (2) par −5', () => {
    const p = S.parseModel(PARTY);
    const sub = S.solvePlan(p.target, p.ids, 'sub');
    expect(sub.lines[0].tex).toBe('y = 75 - x');
    expect(sub.lines[1].tex).toBe('24x + 30(75 - x) = 2100');
    expect(sub.lines.at(-1).tex).toBe('(25 ; 50)');
    const add = S.solvePlan(p.target, p.ids, 'add');
    expect(add.lines.map((l) => l.tex).slice(0, 2)).toEqual(['-120x - 150y = -10500', '30x = 750']);
    expect(add.lines.at(-1).tex).toBe('(25 ; 50)');
  });

  it('le تحدّ : 37 pièces, 610 DA → (24 ; 13) par les deux méthodes', () => {
    const c = S.parseModel(COINS);
    for (const method of ['sub', 'add']) expect(S.solvePlan(c.target, c.ids, method).lines.at(-1).tex).toBe('(24 ; 13)');
  });

  it('une fraction reste une fraction (2x − 3y = 1 ; 3x + 5y = 21 → (68/19 ; 39/19))', () => {
    const plan = S.solvePlan([{ a: linear.frac(2), b: linear.frac(-3), c: linear.frac(1) }, { a: linear.frac(3), b: linear.frac(5), c: linear.frac(21) }], ['x', 'y'], 'add');
    expect(plan.lines.at(-1).tex).toBe('\\left(\\dfrac{68}{19} ; \\dfrac{39}{19}\\right)');
  });

  it('s’arrêter à la première inconnue est refusé : la suite reste fermée jusqu’à « أجد y أيضًا »', () => {
    const plan = S.solvePlan(sys, m.ids, 'sub');
    let lab = S.init(m, { startWith: 'solve' });
    expect(lab.stage).toBe('solve');
    expect(S.canReveal(lab, plan)).toBe(false); // pas de méthode
    lab = S.chooseMethod(lab, 'sub');
    while (S.canReveal(lab, plan)) lab = S.reveal(lab, plan);
    expect(lab.revealed).toBe(plan.halfAt + 1);
    lab = S.claimHalf(lab, 'done');
    expect(lab.half).toBe('refused');
    expect(S.canReveal(lab, plan)).toBe(false);
    lab = S.claimHalf(lab, 'more');
    while (S.canReveal(lab, plan)) lab = S.reveal(lab, plan);
    expect(S.solved(lab, plan)).toBe(true);
    expect(S.openVerify(lab, plan).stage).toBe('verify');
  });
});

describe('4) تحقق — rejouer l’histoire avec la ثنائية', () => {
  const m = S.parseModel(MUSEUM);
  const values = { x: linear.frac(62), y: linear.frac(78) };
  const atVerify = () => ({ ...S.init(m, { startWith: 'solve' }), stage: 'verify' });

  it('62 au tourniquet des adultes, 78 à celui des enfants : 140 visiteurs et 30300 DA', () => {
    let lab = S.gate(S.gate(atVerify(), 'x', 'gate:x'), 'y', 'gate:y');
    lab = S.replay(lab, m, values);
    expect(lab.replay.ok).toBe(true);
    expect(lab.replay.facts.map((f) => [f.ok, F(f.lhs)])).toEqual([[true, '140'], [true, '30300']]);
    expect(S.openAnswer(lab).stage).toBe('answer');
  });

  it('les valeurs ÉCHANGÉES : 140 visiteurs encore, mais 32700 DA — seule l’information d’argent distingue', () => {
    let lab = S.gate(S.gate(atVerify(), 'y', 'gate:x'), 'x', 'gate:y');
    lab = S.replay(lab, m, values);
    expect(lab.replay.ok).toBe(false);
    expect(lab.replay.facts.map((f) => [f.ok, F(f.lhs)])).toEqual([[true, '140'], [false, '32700']]);
    expect(S.openAnswer(lab).stage).toBe('verify');
    expect(lab.replays).toHaveLength(1);
  });

  it('un nombre de personnes non entier est signalé (histoire mal posée : 10 visiteurs, 2000 DA)', () => {
    const bad = S.parseModel({ ...MUSEUM, system: 'x+y=10|300x+150y=2000', chips: [{ value: 10 }, { value: 300 }, { value: 150 }, { value: 2000 }] });
    const r = S.replayStory(bad, { x: 'x', y: 'y' }, { x: bad.sol.x, y: bad.sol.y });
    expect(r.facts.every((f) => f.ok)).toBe(true);
    expect(r.natural).toEqual({ ok: false, bad: ['x', 'y'] });
    expect(r.ok).toBe(false);
    // des PRIX (la fête) n'ont pas à être entiers
    const p = S.parseModel(PARTY);
    expect(S.replayStory(p, { x: 'x', y: 'y' }, { x: p.sol.x, y: p.sol.y }).natural.ok).toBe(true);
  });

  it('une lettre portée ailleurs quitte sa première porte', () => {
    let lab = S.gate(atVerify(), 'x', 'gate:x');
    lab = S.gate(lab, 'x', 'gate:y');
    expect(lab.gates).toEqual({ x: null, y: 'x' });
    expect(S.canGate(lab, 'x', 'gate:y')).toBe('');
  });
});

describe('5) الإجابة, la découverte, les retours', () => {
  const m = S.parseModel(MUSEUM);
  it('la découverte s’ouvre sur la bonne phrase ; un mauvais choix reste un essai', () => {
    let lab = { ...S.init(m, { startWith: 'solve' }), stage: 'answer' };
    lab = S.chooseAnswer(lab, 1, 0);
    expect(S.discoveryReady(lab)).toBe(false);
    lab = S.chooseAnswer(lab, 0, 0);
    expect(S.discoveryReady(lab)).toBe(true);
    expect(lab.answerTries).toEqual([1, 0]);
  });

  it('revenir à la traduction garde les cases et efface la suite ; on ne revient pas nommer au niveau débutant', () => {
    let lab = put(put(modelLab(MUSEUM), 1, 'one', 'one', 'c0'), 2, 'c1', 'c2', 'c3');
    lab = S.openSolve(S.checkModel(lab, m));
    lab = S.chooseMethod(lab, 'add');
    const back = S.backTo(lab, 'model');
    expect(back.stage).toBe('model');
    expect(back.slots[2]).toEqual({ a: 'c1', b: 'c2', c: 'c3' });
    expect(back.verdict).toBeNull();
    expect(back.method).toBeNull();
    expect(S.backTo(lab, 'name')).toBe(lab);
  });

  it('les nombres s’écrivent comme le manuel', () => {
    expect(S.numberText('30300')).toBe('30300');
    expect(S.numberText(linear.frac(14, 5))).toBe('2,8');
    expect(S.numberText(140)).toBe('140');
  });
});
