import { describe, it, expect } from 'vitest';
import { canonSystem, solutionOf, pairKey, SYNTH, UNIT_PAGE } from './forbiddenShared.js';

/**
 * Unité 5 « جمل معادلتين » — LA RÈGLE DES COLLISIONS (conseil du 2026-11-11, verdict X3–X4 ; commit 0). Contrat : `signatures/README.md`.
 *   K1 — aucune jumla deux fois dans l'unité (forme canonique, tous les niveaux) ; une entrée `callback: true` est ignorée ;
 *   K2 — les couples HEADLINE (required · star · checkpoint · peer) sont tous distincts, comme couples ORDONNÉS ;
 *   K3 — aucune solution de niveau 2 (easier · free · prep) n'est un couple HEADLINE d'une leçon ;
 *   AVANCE — ce qu'une leçon montre avant sa مسألة n'est ni une jumla, ni un couple, ni un total de la مسألة d'une leçon AU MÊME RANG ou APRÈS elle,
 *            ni de la synthèse (`SYNTH`), ni du défi réservé de la page d'unité (`UNIT_PAGE` : 23 / 82 / (12 ; 11)).
 * Tant qu'une leçon n'a pas écrit ses `SYSTEMS` (ou son `UNIT`), la règle lit SA ligne du registre de référence ci-dessous (verdict §4, nombres
 * vérifiés par le script du président) : le test est vert au commit 0 et dit à chaque constructeur, dès le premier jour, si ses nombres heurtent
 * ceux des deux autres leçons.
 */
const ORDER = ['mafhum-jumla', 'hall-jabri', 'mushkilat-jumla'];
const HEADLINE = new Set(['required', 'star', 'checkpoint', 'peer']);
const TIER2 = new Set(['easier', 'free', 'prep']);
const TIERS = new Set([...HEADLINE, ...TIER2, 'module']);

/* ── Le registre de référence (verdict §4 ; hors exercices du module 3, test final, pages et ce qui suit la مسألة) ── */
const REF_SYSTEMS = {
  'mafhum-jumla': [
    ['r1', 'required', 'x+y=7|3x+y=17'], ['r2', 'required', 'x+y=9|50x+20y=300'], ['r3', 'required', 'x+y=13|3x+y=29'],
    ['star', 'star', 'x-y=4|x+2y=1'],
    ['r1e', 'easier', 'x+y=5|3x+y=11'], ['r2e', 'easier', 'x+y=5|50x+20y=160'], ['r3e', 'easier', 'x+y=6|3x+y=16'],
    ['f1', 'free', 'x+y=14|3x+y=36'], ['f2', 'free', 'x+y=11|50x+20y=400'], ['f3', 'free', 'x+y=11|3x+y=25'], ['f4', 'free', 'x-y=1|2x+y=5'],
    ['cp-halat', 'checkpoint', 'x-2y=1|3x-6y=3'], ['cp-dhihni', 'checkpoint', 'x=2|x+y=7'],
    ['peer', 'peer', '2x-3y=8|x+y=-1'],
    ['m2-example', 'module', 'x+2y=4|3x-y=5'], ['m2-infinite', 'module', '2x+y=3|6x+3y=9'], ['m2-none', 'module', 'x-y=1|3x-3y=5'],
  ],
  'hall-jabri': [
    ['r1', 'required', 'x+y=8|x-y=2'], ['r2', 'required', '2x+y=11|3x-y=4'], ['r3', 'required', '2x+3y=14|x-y=2'],
    ['star', 'star', '4x+3y=5|3x-2y=8'],
    ['r1e', 'easier', 'x+y=4|x-y=2'], ['r2e', 'easier', 'x+y=5|2x-y=7'], ['r3e', 'easier', 'x+2y=4|x-y=1'],
    ['f1', 'free', 'x+y=11|x-y=3'], ['f2', 'free', 'x+3y=10|x+y=4'], ['f3', 'free', '2x+y=9|x-y=6'], ['f4', 'free', '5x+2y=16|3x+4y=18'],
    ['f5', 'free', '2x+3y=3|4x-3y=3'],
    ['cp-thunaiya', 'checkpoint', 'x+y=7|x-y=1'], ['cp-jam', 'checkpoint', 'x+2y=9|3x-4y=17'], ['cp-ikhtiyar', 'checkpoint', '5x+2y=11|3x-2y=13'],
    ['peer', 'peer', '2x+y=14|3x-2y=7'],
    ['activity', 'module', 'x+2y=15|3x-y=3'], ['activity-c2', 'module', 'x+2y=7|3x+4y=11'], ['method-one', 'module', '4x+y=5|x-2y=8'],
    ['method-two', 'module', '3x+2y=11|-3x+5y=10'], ['dawri-a', 'module', '2x+y=13|x/2-y=-3'], ['dawri-b', 'module', '4x-2y=6|x+2y=-1'],
  ],
  'mushkilat-jumla': [
    ['r1', 'required', 'x+y=12|70x+20y=440'], ['r2', 'required', '2x+y=230|x+2y=190'], ['p1', 'required', 'x+y=15|1100x+700y=17700'],
    ['star', 'star', 'x+y=26|130x+90y=2820'],
    ['r1e', 'easier', 'x+y=6|70x+20y=170'], ['r2e', 'easier', '2x+y=110|x+2y=85'], ['p1e', 'easier', 'x+y=6|1000x+600y=6400'],
    ['free-balls', 'free', 'x+y=16|900x+700y=13000'], ['free-grocer', 'free', '3x+2y=560|x+4y=470'], ['free-fraction', 'free', 'x+y=10|1100x+700y=9900'],
    ['peer', 'peer', '200x+300y=8500|x-y=5'],
    ['prep-3', 'prep', 'x+y=6|x-y=4'], ['prep-5', 'prep', 'x+y=10|2x+y=16'], ['prep-7', 'prep', 'x+2y=12|x-y=3'], ['prep-9', 'prep', '2x+y=17|x-y=4'],
    ['m2-coins', 'module', 'x+y=29|20x+5y=385'], ['m2-abu-kamil', 'module', 'x+y=30|7x-3y=0'],
  ],
};
const REF_UNIT = {
  'mafhum-jumla': { systems: ['x+y=42|x-6=3(y-4)'], pairs: ['(30 ; 12)', '(12 ; 30)', '(4 ; 6)', '(6 ; 4)'], never: [42] },
  'hall-jabri': { systems: ['3x+y=115|4x-3y=45'], pairs: ['(30 ; 25)', '(25 ; 30)', '(35 ; 10)', '(20 ; 55)'], never: [115, 390, 345] },
  'mushkilat-jumla': { systems: ['x+y=180|250x+100y=33000', 'x+y=210|250x+100y=40000'], pairs: ['(100 ; 80)', '(80 ; 100)', '(380/3 ; 250/3)'], never: [180, 210, 33000, 40000] },
};

/* ── La règle, pure : registre { leçon: { systems: [{ id, tier, system, callback? }], unit: { systems, pairs, never }, shown: [] } } → violations ── */
const numbersIn = (sys) => {
  // écrite (« a | b » ou deux chaînes) : les nombres tels qu'ils s'écrivent ; construite (LS.system) : ses coefficients
  if (typeof sys === 'string' || (Array.isArray(sys) && sys.every((e) => typeof e === 'string'))) {
    return new Set(([].concat(sys).join(' ').match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => Number(n.replace(',', '.'))));
  }
  return new Set(sys.flatMap((e) => [e.a, e.b, e.c]).flatMap((f) => (f.d === 1 ? [Math.abs(f.n)] : [Math.abs(f.n), f.d])));
};
const standalone = (n) => new RegExp(`(^|[^0-9.,{])${n}(?![0-9])`);
const pairText = (key) => { const m = /^\((-?[\d/]+) ; (-?[\d/]+)\)$/.exec(key); return m ? new RegExp(`\\(\\s*\\$?\\s*${m[1].replace('-', '[-−]\\s*')}\\s*;\\s*${m[2].replace('-', '[-−]\\s*')}\\s*\\$?\\s*\\)`) : null; };

function collisions(reg) {
  const out = [];
  const lessons = Object.keys(reg);
  const rows = lessons.flatMap((l) => (reg[l].systems ?? []).map((r) => ({ ...r, lesson: l })));
  rows.forEach((r) => { if (!TIERS.has(r.tier)) out.push(`tier: ${r.lesson} ${r.id} has the unknown tier « ${r.tier} »`); });
  const live = rows.filter((r) => !r.callback && TIERS.has(r.tier)).map((r) => ({ ...r, canon: canonSystem(r.system), sol: solutionOf(r.system) }));
  // K1
  const seen = new Map();
  [...live, { lesson: 'unit-page', id: 'challenge', canon: canonSystem(UNIT_PAGE.systems[0]) }].forEach((r) => {
    if (seen.has(r.canon)) out.push(`K1: ${r.lesson} ${r.id} is the system of ${seen.get(r.canon)}`);
    else seen.set(r.canon, `${r.lesson} ${r.id}`);
  });
  // K2
  const head = new Map();
  live.filter((r) => HEADLINE.has(r.tier) && r.sol.kind === 'unique').forEach((r) => {
    if (head.has(r.sol.key)) out.push(`K2: ${r.lesson} ${r.id} ${r.sol.key} = ${head.get(r.sol.key)}`);
    else head.set(r.sol.key, `${r.lesson} ${r.id}`);
  });
  // K3
  live.filter((r) => TIER2.has(r.tier) && head.has(r.sol.key)).forEach((r) => out.push(`K3: ${r.lesson} ${r.id} ${r.sol.key} = headline ${head.get(r.sol.key)}`));
  // l'avance : la leçon contre elle-même, les leçons APRÈS elle, la synthèse et la page d'unité
  const order = ORDER.filter((l) => lessons.includes(l)).concat(lessons.filter((l) => !ORDER.includes(l)));
  order.forEach((l, i) => {
    const bans = [...order.slice(i).map((o) => [o, reg[o].unit]), ['synthesis', SYNTH], ['unit page', UNIT_PAGE]].filter(([, u]) => u);
    bans.forEach(([who, u]) => {
      const sysBan = new Set((u.systems ?? []).map(canonSystem));
      const pairBan = new Set((u.pairs ?? []).map(pairKey));
      const numBan = new Set((u.never ?? []).map(Number));
      live.filter((r) => r.lesson === l).forEach((r) => {
        if (sysBan.has(r.canon)) out.push(`ban: ${l} ${r.id} is a climax system of ${who}`);
        if (pairBan.has(r.sol.key)) out.push(`ban: ${l} ${r.id} ${r.sol.key} is a climax pair of ${who}`);
        numbersIn(r.system).forEach((n) => { if (numBan.has(n)) out.push(`ban: ${l} ${r.id} shows ${n} (${who})`); });
      });
      (reg[l].shown ?? []).forEach((s, k) => {
        numBan.forEach((n) => { if (standalone(n).test(String(s))) out.push(`ban: ${l} shown[${k}] shows ${n} (${who})`); });
        pairBan.forEach((p) => { const re = pairText(p); if (re && re.test(String(s))) out.push(`ban: ${l} shown[${k}] shows ${p} (${who})`); });
      });
    });
  });
  return out;
}

/* ── Le registre réel : chaque leçon sa signature, sinon sa ligne de référence ── */
const sigFiles = import.meta.glob('./signatures/*.js', { eager: true });
const sigOf = (l) => sigFiles[`./signatures/${l}.js`] ?? {};
const refRows = (l) => REF_SYSTEMS[l].map(([id, tier, system]) => ({ id, tier, system }));
const filled = (u) => u && ((u.systems?.length ?? 0) + (u.pairs?.length ?? 0) + (u.never?.length ?? 0)) > 0;
const REAL = Object.fromEntries(ORDER.map((l) => {
  const m = sigOf(l);
  return [l, { systems: m.SYSTEMS?.length ? m.SYSTEMS : refRows(l), unit: filled(m.UNIT) ? m.UNIT : REF_UNIT[l], shown: m.SHOWN ?? [], real: !!m.SYSTEMS?.length }];
}));
const REFERENCE = Object.fromEntries(ORDER.map((l) => [l, { systems: refRows(l), unit: REF_UNIT[l] }]));

describe('unit 5 — the collision rule (K1–K3 and the forward ban)', () => {
  it('the reference registry (verdict §4) obeys the rule', () => {
    expect(collisions(REFERENCE)).toEqual([]);
  });

  it('the unit obeys the rule (each lesson: its signature SYSTEMS, else its reference rows)', () => {
    expect(collisions(REAL)).toEqual([]);
  });

  it('passes on empty or missing lists', () => {
    expect(collisions({})).toEqual([]);
    expect(collisions({ 'mafhum-jumla': { systems: [], unit: { systems: [], pairs: [], never: [] } }, 'hall-jabri': {} })).toEqual([]);
  });

  it('every reference solution is the one the verdict states (spot checks)', () => {
    expect(solutionOf('x-y=4|x+2y=1').key).toBe('(3 ; -1)');
    expect(solutionOf('x+y=15|1100x+700y=17700').key).toBe('(18 ; -3)');
    expect(solutionOf('2x+3y=3|4x-3y=3').key).toBe('(1 ; 1/3)');
    expect(solutionOf('x-2y=1|3x-6y=3').key).toBe('infinite');
    expect(solutionOf(UNIT_PAGE.systems[0]).key).toBe('(12 ; 11)');
    SYNTH.systems.forEach((s, i) => expect(solutionOf(s).key).toBe(['(30 ; 50)', '(25 ; 50)', '(35 ; 20)', '(40 ; 30)', '(40 ; 20)', '(30 ; 15)'][i]));
  });
});

describe('unit 5 — negative controls: each rule fires', () => {
  const withRow = (lesson, row, base = REFERENCE) => ({ ...base, [lesson]: { ...base[lesson], systems: [...base[lesson].systems, row] } });
  const fires = (reg, prefix) => expect(collisions(reg).some((m) => m.startsWith(prefix)), collisions(reg).join('\n')).toBe(true);

  it('K1: the same system twice, even scaled and reordered (L3\'s old prep 3 = L2\'s easier r1)', () => {
    fires(withRow('mushkilat-jumla', { id: 'old-prep-3', tier: 'prep', system: 'x+y=4|x-y=2' }), 'K1');
    fires(withRow('mushkilat-jumla', { id: 'scaled', tier: 'module', system: ['2x - 2y = 4', '3x + 3y = 12'] }), 'K1');
  });
  it('K1 skips a callback on a round\'s own system', () => {
    expect(collisions(withRow('mafhum-jumla', { id: 'batch', tier: 'module', system: 'x+y=9|50x+20y=300', callback: true }))).toEqual([]);
  });
  it('K1: the unit page\'s reserved system is taken', () => {
    fires(withRow('hall-jabri', { id: 'r', tier: 'free', system: '2x+2y=46|5x+2y=82' }), 'K1');
  });
  it('K2: two headline pairs equal (L1\'s old ⭐ (2 ; −1) = L2\'s ⭐)', () => {
    fires(withRow('mafhum-jumla', { id: 'old-star', tier: 'star', system: 'x-y=3|x+2y=0' }), 'K2');
  });
  it('K2 reads ORDERED pairs: a swapped pair is another pair (L1 r1 (5 ; 2) and cp-dhihni (2 ; 5) live together)', () => {
    const keys = REFERENCE['mafhum-jumla'].systems.map((r) => solutionOf(r.system).key);
    expect(keys).toContain('(5 ; 2)');
    expect(keys).toContain('(2 ; 5)');
    expect(collisions(REFERENCE).filter((m) => m.startsWith('K2'))).toEqual([]);
  });
  it('K3: a tier-2 solution equal to a headline pair (L1\'s old free 1 (5 ; 3) = L2 r1)', () => {
    fires(withRow('mafhum-jumla', { id: 'old-f1', tier: 'free', system: 'x+y=8|3x+y=18' }), 'K3');
  });
  it('the forward ban: a later climax system, pair or total before it; the synthesis; the unit page', () => {
    fires(withRow('mafhum-jumla', { id: 'l2-climax', tier: 'free', system: '3x+y=115|4x-3y=45' }), 'ban');
    fires(withRow('mafhum-jumla', { id: 'l3-pair', tier: 'module', system: 'x+y=180|x-y=20' }), 'ban');
    fires(withRow('hall-jabri', { id: 'synth', tier: 'free', system: 'x+y=75|24x+30y=2100' }), 'ban');
    fires(withRow('hall-jabri', { id: 'page-pair', tier: 'free', system: 'x-y=1|x+y=23' }), 'ban');
    fires({ ...REFERENCE, 'mafhum-jumla': { ...REFERENCE['mafhum-jumla'], shown: ['دفع 390 دج'] } }, 'ban');
    fires({ ...REFERENCE, 'hall-jabri': { ...REFERENCE['hall-jabri'], shown: ['الحلّ $(100 ; 80)$'] } }, 'ban');
  });
  it('the forward ban leaves an EARLIER lesson\'s climax free afterwards (L3 may show L1\'s x + y = 42 numbers)', () => {
    expect(collisions(withRow('mushkilat-jumla', { id: 'after-l1', tier: 'module', system: 'x+y=42|x-y=2' }))).toEqual([]);
    expect(collisions({ ...REFERENCE, 'hall-jabri': { ...REFERENCE['hall-jabri'], shown: ['$x + y = 42$'] } })).toEqual([]);
  });
  it('an unknown tier is refused', () => {
    fires(withRow('hall-jabri', { id: 'ex-1', tier: 'exercise', system: 'x+y=100|x-y=2' }), 'tier');
  });
});

describe('unit 5 — signature files', () => {
  it('each lesson has a signature file exporting TEXT, UNIT and SYSTEMS', () => {
    ORDER.forEach((l) => {
      const m = sigOf(l);
      expect(Array.isArray(m.TEXT), l).toBe(true);
      expect(m.UNIT && Array.isArray(m.UNIT.systems) && Array.isArray(m.UNIT.pairs) && Array.isArray(m.UNIT.never), l).toBe(true);
      expect(Array.isArray(m.SYSTEMS), l).toBe(true);
    });
  });
});
