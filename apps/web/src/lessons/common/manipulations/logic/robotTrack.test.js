import { describe, it, expect } from 'vitest';
import * as L from './robotTrack';

const B = L.PRESETS.beginner;
const A = L.PRESETS.advanced;
const T = (n) => B.tasks[n];

/** Suit l'onboarding jusqu'au bout : le coach dit QUEL contrôle ; l'oracle (le but) dit seulement quoi poser. */
function followCoach(s0, max = 200) {
  let s = s0;
  const seen = [];
  for (let i = 0; i < max; i += 1) {
    const c = L.coachOf(s);
    if (!c) {
      if (L.discoveryReady(s)) return { s, seen };
      s = solveOne(s);
      continue;
    }
    seen.push(c.id);
    if (c.id === 'next') { s = L.nextTask(s); continue; }
    s = solveOne(s);
  }
  throw new Error(`coach sans fin : ${seen.join(' ')}`);
}

/** Un oracle de test : joue la mission courante jusqu'à sa réussite. */
function solveOne(s) {
  const t = L.taskOf(s);
  if (L.taskDone(s)) return L.canNext(s) ? L.nextTask(s) : s;
  if (t.kind === 'predict') {
    const stop = L.finalOf(t.cards);
    const v = Number(stop.n) / Number(stop.d);
    s = L.chooseSide(s, v < 0 ? 'left' : 'right');
    s = L.setDist(s, Math.abs(v));
    return L.runPredict(s);
  }
  if (t.kind === 'repeat') {
    if (!s.predicted) {
      s = L.chooseSide(s, 'left'); s = L.setDist(s, 3); return L.runPredict(s);
    }
    s = L.setN(s, 3); // −3
    return L.setN(s, 4); // 3
  }
  if (t.kind === 'sqNeg') { s = L.setA(s, -3); s = L.setA(s, 3); return L.claimImpossible(s); }
  if (t.kind === 'sqVal') { s = L.setA(s, 1.5); return L.setA(s, -1.5); }
  if (t.id === 'm1') return L.place(s, 'm1-t0', 1);
  if (t.id === 'm2') return L.place(s, 'm2-t0', 2);
  if (t.id === 'm3') return L.flip(s, 'm3-p0');
  if (t.id === 'm4') { s = L.flip(s, 'm4-p0'); return L.flip(s, 'm4-p1'); }
  // a2 : poser 4 puis −0,5 en tête
  for (const [id, slot] of [['a2-t1', 0], ['a2-t2', 1], ['a2-t0', 2], ['a2-t3', 3]]) s = L.place(s, id, slot);
  return s;
}

describe('robot-track — le modèle', () => {
  it('run : le produit des cartes, avec le saut au-dessus du poteau pour chaque carte négative', () => {
    const st = L.run(['2', '-3', '4']);
    expect(st.map((x) => L.text(x.value))).toEqual(['2', '−6', '−24']);
    expect(st.map((x) => x.jumped)).toEqual([false, true, false]);
    expect(L.jumpsOf(['2', '-3', '4'])).toEqual([{ from: 2, to: -6, n: 1 }]);
    expect(L.text(L.finalOf(['-2', '3', '-1', '-4', '0,5']))).toBe('−12');
    expect(L.negativesOf(['-2', '3', '-1'])).toBe(2);
    expect(L.lineText(['2', '-3', '4'])).toBe('1 × 2 × (−3) × 4 = −24');
  });

  it('un facteur 0 arrête le robot sur le poteau pour toujours', () => {
    expect(L.run(['3', '0', '-5']).map((x) => L.text(x.value))).toEqual(['3', '0', '0']);
  });

  it('chaque mission du preset est atteignable ; « le carré négatif » ne l\'est pas', () => {
    for (const tk of [...B.tasks, ...A.tasks]) expect(L.canReach(tk.kind ? tk : { ...tk, kind: 'goal' }), tk.id).toBe(true);
    expect(L.canReach({ kind: 'sqNeg' })).toBe(false);
    expect(L.canReach({ kind: 'goal', id: 'x', flag: '-5', placed: ['5'], tray: ['2'], need: 2, lock: true })).toBe(false);
  });

  it('m1 : −1 mène à −5 ; m2 : seule −1 ramène à 5 (2 → −10 et −5 → 25 sont refusées avec leur arrêt)', () => {
    let s = L.init(B);
    s = L.place(s, 'm1-t0', 1);
    expect(s.last).toMatchObject({ ok: true, stop: '−5', negatives: 1 });
    expect(L.taskDone(s)).toBe(true);
    s = L.nextTask(s);
    for (const [id, stop, reason] of [['m2-t1', '−10', 'distance'], ['m2-t2', '25', 'distance']]) {
      const w = L.place(s, id, 2);
      expect(w.last).toMatchObject({ ok: false, stop, reason });
      expect(L.taskDone(w)).toBe(false);
      s = L.place(w, id, 'tray');
    }
    s = L.place(s, 'm2-t0', 2);
    expect(s.last).toMatchObject({ ok: true, stop: '5' });
  });

  it('m3 : −24 par UN ou TROIS signes négatifs, jamais deux ; m4 : +24 exige deux négatives au moins (ANY-NEG et MORE-NEG réfutés)', () => {
    const find = (task, count, ok) => {
      const out = [];
      for (let m = 0; m < 8; m += 1) {
        const vals = task.placed.map((v, i) => (m & (1 << i) ? `-${v}` : v));
        if (L.negativesOf(vals) === count && L.judge(task, vals).ok === ok) out.push(vals);
      }
      return out.length;
    };
    const t3 = { ...T(2), kind: 'goal' };
    expect(find(t3, 1, true)).toBe(3);
    expect(find(t3, 3, true)).toBe(1);
    expect(find(t3, 0, true) + find(t3, 2, true)).toBe(0);
    const t4 = { ...T(3), kind: 'goal' };
    expect(find(t4, 2, true)).toBe(3);
    expect(L.judge(t4, ['2', '3', '4']).reason).toBe('constraint'); // 24 sans aucune négative : refusé
    expect(L.judge(t4, ['-2', '-3', '4']).ok).toBe(true);
  });

  it('flip change la valeur et l\'essai ; un programme trop long ou une carte verrouillée est refusé', () => {
    let s = L.init(B);
    expect(L.flip(s, 'm1-p0')).toBe(s); // m1 : pas de signes à la main
    expect(L.place(s, 'm1-p0', 3)).toBe(s); // la carte posée est verrouillée
    s = L.nextTask(L.place(s, 'm1-t0', 1));
    const m3 = L.init({ world: 'track', tasks: [T(2)] });
    const f = L.flip(m3, 'm3-p1');
    expect(L.valuesOf(f.board)).toEqual(['2', '−3', '4']);
    expect(f.last).toMatchObject({ ok: true, stop: '−24', negatives: 1 });
  });

  it('a2 : l\'ordre ne change pas l\'arrêt final (20) ; −2 après deux cartes exige 4 et −0,5 en tête', () => {
    const task = { ...A.tasks[1], kind: 'goal' };
    const orders = [];
    const perms = (arr) => (arr.length < 2 ? [arr] : arr.flatMap((v, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [v, ...p])));
    for (const p of perms(task.tray)) orders.push(p);
    for (const p of orders) expect(L.text(L.finalOf(p))).toBe('20');
    const okOrders = orders.filter((p) => L.judge(task, p).ok);
    expect(okOrders.length).toBe(4);
    expect(okOrders.every((p) => new Set(p.slice(0, 2)).size === 2 && p.slice(0, 2).includes('4') && p.slice(0, 2).includes('-0,5'))).toBe(true);
    expect(Math.max(...orders.flatMap((p) => L.run(p).map((x) => Math.abs(Number(x.value.n) / Number(x.value.d)))))).toBeLessThanOrEqual(L.scaleFor(task).max);
  });

  it('predict a1 : rien n\'est montré avant « شغّل » ; une prédiction juste (gauche, 12) réussit ; une fausse est notée', () => {
    const s = L.init({ world: 'track', tasks: [A.tasks[0]] });
    expect(L.stopsOf(s)).toEqual([]);
    expect(L.canRun(s)).toBe(false);
    let w = L.setDist(L.chooseSide(s, 'right'), 12);
    expect(L.canRun(w)).toBe(true);
    w = L.runPredict(w);
    expect(w.last).toMatchObject({ ok: false, sideOk: false, distOk: true, stop: '−12' });
    expect(L.stopsOf(w).length).toBe(5);
    w = L.runPredict(L.setDist(L.chooseSide(L.retryPredict(w), 'left'), 12));
    expect(w.last.ok).toBe(true);
    expect(L.taskDone(w)).toBe(true);
  });

  it('repeat a3 : n = 15 → gauche (−3) ; puis n impair → −3 et n pair → 3', () => {
    let s = L.init({ world: 'track', tasks: [A.tasks[2]] });
    expect(L.programmeValues(s).length).toBe(16);
    s = L.runPredict(L.setDist(L.chooseSide(s, 'left'), 3));
    expect(s.predicted).toBe(true);
    s = L.setN(s, 3);
    expect(s.last).toMatchObject({ ok: true, stop: '−3' });
    expect(L.taskDone(s)).toBe(false);
    s = L.setN(s, 4);
    expect(s.last).toMatchObject({ ok: true, stop: '3' });
    expect(L.taskDone(s)).toBe(true);
    expect(L.lineTex(['3'], { n: 15, unit: '-1' })).toContain('\\ldots');
  });

  it('le monde square : a² jamais négatif ; « لا يمكن » refusé avant un essai de chaque signe ; 2,25 exige 1,5 ET −1,5', () => {
    let s = L.init({ world: 'square' });
    for (let a = -6; a <= 6; a += 0.5) { const w = L.setA(s, a); expect(Number(L.finalValue(w).n) >= 0n || true).toBe(true); expect(L.finalValue(w).n >= 0n).toBe(true); }
    expect(L.canClaim(s)).toBe(false);
    expect(L.claimImpossible(s).last).toMatchObject({ ok: false, early: true });
    s = L.setA(s, 3);
    expect(L.canClaim(s)).toBe(false);
    s = L.setA(s, -3);
    expect(L.canClaim(s)).toBe(true);
    s = L.claimImpossible(s);
    expect(L.taskDone(s)).toBe(true);
    s = L.nextTask(s);
    s = L.setA(s, 1.5);
    expect(L.taskDone(s)).toBe(false);
    s = L.setA(s, -1.5);
    expect(L.taskDone(s)).toBe(true);
    expect(L.text(L.finalValue(s))).toBe('2,25');
  });

  it('« جرّب أعدادك » : un facteur de −10 à 10 (une décimale), au plus six cartes, 0 immobilise le robot sur le poteau', () => {
    expect(L.parseFactor('-2,5')).toBe('−2,5');
    expect(L.parseFactor('11')).toBeNull();
    expect(L.parseFactor('1,25')).toBeNull();
    expect(L.parseFactor('')).toBeNull();
    let s = L.init(B);
    for (const v of ['3', '0', '-4']) s = L.addFree(s, v);
    const ids = s.free.tray.map((c) => c.id);
    ids.forEach((id, i) => { s = L.place(s, id, i); });
    expect(L.stopsOf(s).map((x) => L.text(x.value))).toEqual(['3', '0', '0']);
    expect(s.last.free).toBe(true);
    for (let i = 0; i < 8; i += 1) s = L.addFree(s, '1');
    expect(s.free.tray.length + s.free.slots.filter(Boolean).length).toBe(6);
    expect(L.toGuided(s).free).toBeNull();
  });

  it('le coach mène au bout de chaque monde sans jamais donner la réponse', () => {
    for (const numbers of [B, A, { world: 'square' }]) {
      const { s, seen } = followCoach(L.init(numbers));
      expect(L.discoveryReady(s)).toBe(true);
      expect(seen.length).toBeGreaterThan(0);
    }
  });

  it('le registre d\'une mission : un arrêt validé avec son nombre de cartes négatives', () => {
    const s = followCoach(L.init(B)).s;
    const rows = L.recordRows(s);
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(rows.find((r) => r.taskId === 'm3')).toMatchObject({ stop: '−24' });
    expect(rows.find((r) => r.taskId === 'm4')).toMatchObject({ stop: '24', negatives: 2 });
  });
});
