import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';
import { EXERCISES, EX, FINAL, NAME_ROWS, WRITE_ROWS, DESCRIBE_ROWS, ABC_ROWS, TREE, MATCH_ROWS, tex } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, KNOWLEDGE, GUIDE, LAB } from './textbook';

/**
 * Les clés du درس « وصف سلسلة حسابات » recalculées avec un code INDÉPENDANT de `chainOps.js` : un évaluateur de descente récursive en BigInt (rationnels exacts, priorités, parenthèses ; une
 * différence NÉGATIVE fait échouer le test : toute chaîne de la leçon vaut un nombre ≥ 0), un analyseur de RACINE (l'opération faite en dernier) écrit à part, et une table de PHRASES écrite
 * à la main que `chainOps.describe` doit retrouver. Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX et reproduisant son erreur nommée (MISC-WASF-*) ; chaque option d'une
 * épreuve du إختبار أولي est présente LITTÉRALEMENT dans Module08Itqan.jsx.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const Q = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (p, q) => Q(p.n * q.d + q.n * p.d, p.d * q.d);
const sub = (p, q) => { const r = Q(p.n * q.d - q.n * p.d, p.d * q.d); if (r.n < 0n) throw new Error('différence négative'); return r; };
const mul = (p, q) => Q(p.n * q.n, p.d * q.d);
const div = (p, q) => { if (q.n === 0n) throw new Error('÷ 0'); return Q(p.n * q.d, p.d * q.n); };
const same = (p, q) => p.n === q.n && p.d === q.d;
const num = (s) => { const [i, f = ''] = String(s).replace(',', '.').trim().split('.'); return Q(BigInt(i + f), 10n ** BigInt(f.length)); };
const OPS = { '+': add, '−': sub, '×': mul, '÷': div };
const lex = (text) => text.replace(/\$/g, '').replace(/\s+/g, '').match(/\d+(?:,\d+)?|[()[\]+−×÷]/g);
const ev = (text) => {
  const t = lex(text); let i = 0;
  const factor = () => { const x = t[i++]; if (x === '(' || x === '[') { const v = expr(); i += 1; return v; } return num(x); };
  const term = () => { let v = factor(); while (t[i] === '×' || t[i] === '÷') { const o = t[i++]; v = OPS[o](v, factor()); } return v; };
  const expr = () => { let v = term(); while (t[i] === '+' || t[i] === '−') { const o = t[i++]; v = OPS[o](v, term()); } return v; };
  const v = expr();
  if (i !== t.length) throw new Error(`reste : ${text}`);
  return v;
};
/** LaTeX → texte brut évaluable. */
const plain = (s) => String(s).replace(/\$/g, '').replace(/\{,\}/g, ',').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/ - /g, ' − ').replace(/-/g, '−');
const rows = (id) => EX[id].question.rows;

/* ── l'analyseur de RACINE indépendant : l'opérateur de plus basse priorité au niveau 0, le dernier (associativité à gauche) ── */
const stripOuter = (t) => { let s = t.trim(); while (s[0] === '(' && s.at(-1) === ')') { let d = 0; let whole = true; for (let k = 0; k < s.length - 1; k += 1) { if (s[k] === '(') d += 1; else if (s[k] === ')') d -= 1; if (d === 0) { whole = false; break; } } if (!whole) break; s = s.slice(1, -1).trim(); } return s; };
const splitRoot = (text) => {
  const t = lex(text); let d = 0; let best = -1;
  t.forEach((x, k) => { if (x === '(' || x === '[') d += 1; else if (x === ')' || x === ']') d -= 1; else if (d === 0 && '+−×÷'.includes(x) && x.length === 1 && !/\d/.test(x)) { if (best < 0) best = k; else { const pr = (o) => (o === '+' || o === '−' ? 1 : 2); if (pr(x) <= pr(t[best])) best = k; } } });
  if (best < 0) return null;
  return { l: stripOuter(t.slice(0, best).join(' ')), o: t[best], r: stripOuter(t.slice(best + 1).join(' ')) };
};
const NAME = { '+': 'مجموع', '−': 'فرق', '×': 'جداء', '÷': 'حاصل قسمة' };
const rootName = (text) => NAME[splitRoot(text).o];
/** L'opération faite en PREMIER : la plus à gauche des plus prioritaires du groupe le plus profond (ou de la chaîne sans groupe). */
const firstDone = (text) => {
  const t = lex(text); let d = 0; let deepest = 0; let at = 0;
  t.forEach((x, k) => { if (x === '(') { d += 1; if (d > deepest) { deepest = d; at = k; } } else if (x === ')') d -= 1; });
  const group = deepest ? (() => { let e = at; let dd = 0; for (let k = at; k < t.length; k += 1) { if (t[k] === '(') dd += 1; if (t[k] === ')') { dd -= 1; if (dd === 0) { e = k; break; } } } return t.slice(at + 1, e); })() : t;
  const ops = group.filter((x) => '+−×÷'.includes(x) && !/\d/.test(x));
  return ops.find((o) => o === '×' || o === '÷') ?? ops[0];
};
const firstWritten = (text) => lex(text).find((x) => '+−×÷'.includes(x) && !/\d/.test(x));
const lastWritten = (text) => lex(text).filter((x) => '+−×÷'.includes(x) && !/\d/.test(x)).at(-1);
const stripBrackets = (text) => text.replace(/[()]/g, '');

/** La table des PHRASES écrite à la main (aucun appel à chainOps pour l'attendu). */
const HAND = {
  '9 + 4 × 7': 'مجموع العدد 9 وجداء العددين 4 و 7',
  '(30 − 6) ÷ 4': 'حاصل قسمة فرق العددين 30 و 6 على 4',
  '12 × (15 − 9)': 'جداء العدد 12 وفرق العددين 15 و 9',
  '40 − (26 − 11)': 'فرق العدد 40 وفرق العددين 26 و 11',
  '8 × (3 + 6)': 'جداء العدد 8 ومجموع العددين 3 و 6',
  '50 − (12 + 8)': 'فرق العدد 50 ومجموع العددين 12 و 8',
  '6 + 4 × 9': 'مجموع العدد 6 وجداء العددين 4 و 9',
  '63 − 28 ÷ 7': 'فرق العدد 63 وحاصل قسمة 28 على 7',
  '4 × (1,5 + 2,5)': 'جداء العدد 4 ومجموع العددين 1,5 و 2,5',
  '7 × 2 + 3 × 5': 'مجموع جداء العددين 7 و 2 وجداء العددين 3 و 5',
  '24 ÷ 4 × 3': 'جداء حاصل قسمة 24 على 4 والعدد 3',
  '(15 − 6) × 4 + 2': 'مجموع جداء فرق العددين 15 و 6 والعدد 4 ، والعدد 2',
  '(20 − 8) ÷ (1 + 2)': 'حاصل قسمة فرق العددين 20 و 8 على مجموع العددين 1 و 2',
  '(9 + 2) × 7': 'جداء مجموع العددين 9 و 2 والعدد 7',
  '9 + 2 × 7': 'مجموع العدد 9 وجداء العددين 2 و 7',
  '6 × (9 − 2) + 5': 'مجموع جداء العدد 6 وفرق العددين 9 و 2 ، والعدد 5',
  '(5 + 4) × 3': 'جداء مجموع العددين 5 و 4 والعدد 3',
  '(4 + 6) × 2 ÷ 4': 'حاصل قسمة جداء مجموع العددين 4 و 6 والعدد 2 على 4',
  '50 − 6 × 7': 'فرق العدد 50 وجداء العددين 6 و 7',
  '(27 + 9) ÷ 6': 'حاصل قسمة مجموع العددين 27 و 9 على 6',
  '3 × (2 + 1)': 'جداء العدد 3 ومجموع العددين 2 و 1',
  '45 − (10 + 5)': 'فرق العدد 45 ومجموع العددين 10 و 5',
  '(20 + 8) ÷ 7': 'حاصل قسمة مجموع العددين 20 و 8 على 7',
  '4 × (9 + 6)': 'جداء العدد 4 ومجموع العددين 9 و 6',
  '5 × (11 − 4)': 'جداء العدد 5 وفرق العددين 11 و 4',
};
/** Une option « اسمها X وقيمتها V » / « قيمتها V وهي X » → { name, value }. */
const nameValue = (text) => { const m = text.match(/(?:اسمها (\S+(?: قسمة)?) وقيمتها (\S+)|قيمتها (\S+) وهي (\S+(?: قسمة)?))$/); return m[1] ? { name: m[1], value: num(m[2]) } : { name: m[4], value: num(m[3]) }; };
/** Une option « $… = v$ » → { chain, value }. */
const eqOf = (text) => { const [c, v] = plain(text).split('='); return { chain: c.trim(), value: num(v.trim()) }; };

describe('le درس « وصف سلسلة حسابات » — clés recalculées', () => {
  it('l\'évaluateur de contrôle et l\'analyseur de racine donnent les valeurs et les noms du labo', () => {
    expect(ev('7 + 4 × 5')).toEqual(Q(27n)); expect(ev('(7 + 4) × 5')).toEqual(Q(55n)); expect(ev('40 − 12 ÷ 4')).toEqual(Q(37n)); expect(ev('(18 + 6) ÷ 3')).toEqual(Q(8n));
    expect(ev('6 × (9 − 2) + 5')).toEqual(Q(47n)); expect(ev('20 + 5 − 3')).toEqual(Q(22n)); expect(ev('20 + (5 − 3)')).toEqual(Q(22n)); expect(ev('(20 − 8) ÷ (1 + 2)')).toEqual(Q(4n));
    expect(ev('11 × 5')).toEqual(Q(55n)); expect(ev('63 − 28 ÷ 7')).toEqual(Q(59n)); expect(ev('50 − 6 × 7')).toEqual(Q(8n)); expect(ev('(15 + 9) ÷ 4')).toEqual(Q(6n)); expect(ev('(3 + 5) × (10 − 4)')).toEqual(Q(48n));
    expect(rootName('7 + 4 × 5')).toBe('مجموع'); expect(rootName('(7 + 4) × 5')).toBe('جداء'); expect(rootName('40 − 12 ÷ 4')).toBe('فرق'); expect(rootName('(18 + 6) ÷ 3')).toBe('حاصل قسمة');
    expect(rootName('6 × (9 − 2) + 5')).toBe('مجموع'); expect(rootName('20 + 5 − 3')).toBe('فرق'); expect(rootName('24 ÷ 4 × 3')).toBe('جداء');
  });

  it('chainOps.describe retrouve la table de phrases écrite à la main', () => {
    for (const [chain, sentence] of Object.entries(HAND)) expect(C.describe(chain), chain).toBe(sentence);
  });

  it('chainOps.chainName retrouve le nom donné par l\'analyseur indépendant', () => {
    for (const chain of Object.keys(HAND)) { expect(C.chainName(chain), chain).toBe(rootName(chain)); expect(() => ev(chain), chain).not.toThrow(); }
  });

  it('act-5 : la bonne option a le bon nom (racine) ET la bonne valeur ; le mauvais nom est celui de la PREMIÈRE opération faite, la mauvaise valeur celle de la chaîne mal lue', () => {
    NAME_ROWS.forEach((r, i) => {
      const row = rows('act-5')[i];
      const truth = ev(r.chain);
      row.options.forEach((o, k) => {
        const nv = nameValue(o);
        if (k === row.correct) { expect(nv.name, `${r.chain} ${o}`).toBe(rootName(r.chain)); expect(same(nv.value, truth)).toBe(true); return; }
        const nameWrong = nv.name !== rootName(r.chain);
        const valueWrong = !same(nv.value, truth);
        expect(nameWrong !== valueWrong, `${r.chain} ${o} : exactement une des deux moitiés est fausse`).toBe(true);
        if (nameWrong) expect(nv.name, `${r.chain} (MISC-WASF-FIRSTOP)`).toBe(NAME[firstDone(r.chain)]);
        else expect(same(nv.value, ev(r.bad)), `${r.chain} (lue sans parenthèses)`).toBe(true);
      });
      expect(same(ev(r.bad), truth), `${r.chain} mauvaise lecture`).toBe(false);
    });
  });

  it('ex-18 : la phrase de chaque ligne est celle de la bonne chaîne (table à la main) ; une seule option a la structure ET la valeur de la phrase', () => {
    WRITE_ROWS.forEach((r, i) => {
      const row = rows('ex-18')[i];
      expect(row.label, r.chain).toBe(HAND[r.chain]);
      row.options.forEach((o, k) => {
        const { chain, value } = eqOf(o);
        expect(same(ev(chain), value), `${o} : la valeur écrite est la vraie`).toBe(true);
        if (k === row.correct) expect(C.describe(chain)).toBe(row.label);
        else { expect(C.describe(chain), o).not.toBe(row.label); expect(C.sameStructure(chain, r.chain), o).toBe(false); }
      });
    });
  });

  it('ex-19 : chaque phrase juste vient de la table à la main ; chaque autre phrase décrit une AUTRE structure', () => {
    DESCRIBE_ROWS.forEach((r, i) => {
      const row = rows('ex-19')[i];
      expect(row.options[row.correct], r.chain).toBe(HAND[r.chain]);
      r.alts.forEach((a) => {
        expect(C.sameStructure(a, r.chain), a).toBe(false);
        expect(row.options).toContain(C.describe(a));
        expect(C.describe(a)).not.toBe(HAND[r.chain]);
      });
      expect(new Set(row.options).size).toBe(3);
    });
    // aucune phrase affichée n'a plus de trois niveaux, et celles de profondeur 3 sont de l'arbre de ex-9
    const depth = (s) => (s.match(/(?:^| )(?:مجموع|فرق|جداء|حاصل قسمة)(?= )/g) ?? []).length;
    rows('ex-19').forEach((row) => row.options.forEach((o) => expect(depth(o), o).toBeLessThanOrEqual(3)));
  });

  it('ex-20 : a = 24, b = 6, c = 2 — 27 مجموع · 15 حاصل قسمة · 3 حاصل قسمة ; le mauvais nom est celui de la première opération faite ; la mauvaise valeur celle de la lecture fautive', () => {
    const expected = [['27', 'مجموع'], ['15', 'حاصل قسمة'], ['3', 'حاصل قسمة']];
    ABC_ROWS.forEach((r, i) => {
      const row = rows('ex-20')[i];
      const [v, n] = expected[i];
      expect(ev(r.chain)).toEqual(num(v)); expect(rootName(r.chain)).toBe(n);
      row.options.forEach((o, k) => {
        const nv = nameValue(o);
        if (k === row.correct) { expect(same(nv.value, num(v))).toBe(true); expect(nv.name).toBe(n); return; }
        if (nv.name !== n) { expect(same(nv.value, num(v))).toBe(true); expect(nv.name).toBe(NAME[firstDone(r.chain)]); } else { expect(same(nv.value, ev(r.read))).toBe(true); expect(same(nv.value, num(v))).toBe(false); }
      });
    });
    expect(EX['ex-20'].statement).toContain('a = 24'); expect(EX['ex-20'].statement).toContain('b = 6'); expect(EX['ex-20'].statement).toContain('c = 2');
  });

  it('ex-9 : (15 − 6) × 4 + 2 = 38, mauvaise lecture 54 et 36, racine +, phrases fausses = autres structures', () => {
    const [val, name, sentence] = rows('ex-9');
    expect(ev(TREE.chain)).toEqual(Q(38n)); expect(ev(TREE.bad)).toEqual(Q(54n)); expect(ev('(15 − 6) × 4')).toEqual(Q(36n));
    expect(val.options[val.correct]).toBe('$38$'); expect(val.options).toEqual(expect.arrayContaining(['$54$', '$36$']));
    expect(name.options[name.correct]).toBe(rootName(TREE.chain)); expect(rootName(TREE.chain)).toBe('مجموع');
    expect(sentence.options[sentence.correct]).toBe(HAND[TREE.chain]);
    [TREE.bad, TREE.badSentence].forEach((c) => { expect(C.sameStructure(c, TREE.chain)).toBe(false); expect(sentence.options).toContain(C.describe(c)); ev(c); });
  });

  it('self-5 : chaque chaîne est liée à SON nom (racine indépendante) ; 20 · 10 · 200 · 12', () => {
    MATCH_ROWS.forEach((c, i) => { const r = rows('self-5')[i]; expect(r.options[r.correct], c).toBe(rootName(c)); expect(new Set(r.options).size).toBe(4); });
    expect(MATCH_ROWS.map((c) => ev(c))).toEqual([Q(20n), Q(10n), Q(200n), Q(12n)]);
    expect(MATCH_ROWS.map(rootName)).toEqual(['مجموع', 'حاصل قسمة', 'جداء', 'فرق']);
  });

  it('chaque ligne d\'un exercice a UNE bonne option et des distracteurs distincts', () => {
    for (const ex of EXERCISES) for (const r of ex.question.rows) {
      expect(new Set(r.options).size).toBe(r.options.length);
      expect(r.options.length).toBeGreaterThanOrEqual(2);
      expect(r.correct).toBeLessThan(r.options.length);
    }
    expect(EXERCISES.map((e) => e.id)).toEqual(['act-5', 'ex-18', 'ex-19', 'ex-20', 'ex-9', 'self-5']);
  });

  it('toute chaîne montrée vaut un nombre ≥ 0 (une différence négative fait échouer l\'évaluateur)', () => {
    const chains = [
      ...NAME_ROWS.flatMap((r) => [r.chain, r.bad]), ...WRITE_ROWS.flatMap((r) => [r.chain, ...r.wrongs]), ...DESCRIBE_ROWS.flatMap((r) => [r.chain, ...r.alts]),
      ...ABC_ROWS.flatMap((r) => [r.chain, r.read]), TREE.chain, TREE.bad, TREE.badSentence, ...MATCH_ROWS, ...FINAL.flatMap((f) => f.chains ?? (f.chain ? [f.chain] : [])), ...Object.keys(HAND),
    ];
    expect(chains.length).toBeGreaterThan(60);
    chains.forEach((c) => expect(() => ev(c), c).not.toThrow());
  });

  it('إختبار أولي : chaque clé recalculée, chaque distracteur faux et nommé (MISC-WASF-*), chaque option littérale dans le module', () => {
    const source = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    expect(FINAL).toHaveLength(5);
    const byId = Object.fromEntries(FINAL.map((f) => [f.id, f]));
    FINAL.forEach((f) => {
      expect(f.options).toHaveLength(4); expect(new Set(f.options).size).toBe(4); expect(f.correct).toBe(0);
      Object.values(f.miscs).forEach((m) => expect(m).toMatch(/^MISC-WASF-(FIRSTOP|FIRSTWRITTEN|PIECES|ORDERDIFF|NOBRACKET)$/));
      f.options.forEach((o) => expect(source, `${f.id} ${o}`).toContain(o.replace(/\\/g, '\\\\')));
    });
    // E1, E2 : le nom (racine indépendante) ; FIRSTOP = la première opération faite ; FIRSTWRITTEN = le premier opérateur écrit
    expect(byId.E1.options[0]).toBe(rootName('12 + 6 × 3')); expect(byId.E1.options[1]).toBe(NAME[firstDone('12 + 6 × 3')]); expect(rootName('12 + 6 × 3')).not.toBe(byId.E1.options[1]);
    expect(byId.E2.options[0]).toBe(rootName('(12 + 6) × 3')); expect(byId.E2.options[1]).toBe(NAME[firstWritten('(12 + 6) × 3')]); expect(rootName('(12 + 6) × 3')).not.toBe(byId.E2.options[1]);
    expect(byId.E1.miscs[1]).toBe('MISC-WASF-FIRSTOP'); expect(byId.E2.miscs[1]).toBe('MISC-WASF-FIRSTWRITTEN');
    // E3 : la phrase juste vient de la table ; FIRSTWRITTEN = nommée par le dernier opérateur écrit (+) ; PIECES = autres blocs ; NOBRACKET = la chaîne sans parenthèses
    const e3 = byId.E3;
    expect(e3.options[0]).toBe(HAND['45 − (10 + 5)']);
    e3.options.forEach((o, k) => expect(o, `E3 option ${k}`).toBe(C.describe(e3.chains[k])));
    expect(C.chainName(e3.chains[1])).toBe(NAME[lastWritten(e3.chain)]); expect(e3.miscs[1]).toBe('MISC-WASF-FIRSTWRITTEN');
    expect(C.sameStructure(e3.chains[2], e3.chain)).toBe(false); expect(e3.miscs[2]).toBe('MISC-WASF-PIECES');
    expect(e3.chains[3]).toBe(stripBrackets(e3.chain)); expect(e3.miscs[3]).toBe('MISC-WASF-NOBRACKET');
    e3.chains.slice(1).forEach((c) => expect(C.sameStructure(c, e3.chain), c).toBe(false));
    // E4 : la chaîne juste décrit la phrase ; NOBRACKET = sans parenthèses ; ORDERDIFF = les blocs de la racine échangés ; PIECES = autres blocs
    const e4 = byId.E4; const t4 = splitRoot(e4.chains[0]);
    expect(C.describe(e4.chains[0])).toBe(e4.sentence); expect(e4.sentence).toBe(HAND['(20 + 8) ÷ 7']); expect(ev(e4.chains[0])).toEqual(Q(4n));
    expect(e4.chains[1]).toBe(stripBrackets(e4.chains[0])); expect(e4.miscs[1]).toBe('MISC-WASF-NOBRACKET');
    expect(same(ev(e4.chains[2]), div(ev(t4.r), ev(t4.l)))).toBe(true); expect(splitRoot(e4.chains[2]).o).toBe(t4.o); expect(e4.miscs[2]).toBe('MISC-WASF-ORDERDIFF');
    expect(C.sameStructure(e4.chains[3], e4.chains[0])).toBe(false); expect(lex(e4.chains[3]).filter((x) => /\d/.test(x)).sort()).toEqual(lex(e4.chains[0]).filter((x) => /\d/.test(x)).sort()); expect(e4.miscs[3]).toBe('MISC-WASF-PIECES');
    e4.chains.forEach((c, k) => expect(same(ev(c), Q(4n)), `E4 option ${k}`).toBe(k === 0));
    e4.options.forEach((o, k) => expect(plain(o).replace(/\s+/g, ''), `E4 texte ${k}`).toBe(e4.chains[k].replace(/\s+/g, '')));
    // E5 : 35 ; 51 (sans parenthèses) ; 75 (le fait de soustraire lu comme addition) ; 7 (on s'arrête à la première opération faite)
    const e5 = byId.E5;
    expect(C.describe(e5.chains[0])).toBe(e5.sentence); expect(e5.sentence).toBe(HAND['5 × (11 − 4)']);
    expect(e5.chains.map((c) => ev(c))).toEqual([Q(35n), Q(51n), Q(75n), Q(7n)]);
    expect(e5.options.map((o) => ev(plain(o)))).toEqual([Q(35n), Q(51n), Q(75n), Q(7n)]);
    expect(e5.chains[1]).toBe(stripBrackets(e5.chains[0])); expect(e5.miscs[1]).toBe('MISC-WASF-NOBRACKET');
    expect(e5.chains[2]).toBe(e5.chains[0].replace('−', '+')); expect(e5.miscs[2]).toBe('MISC-WASF-PIECES');
    expect(e5.chains[3]).toBe('11 − 4'); expect(NAME[firstDone(e5.chains[0])]).toBe('فرق'); expect(e5.miscs[3]).toBe('MISC-WASF-FIRSTOP');
  });

  it('معارف et طريقة : les phrases, les valeurs et les enchaînements sont justes', () => {
    expect(KNOWLEDGE.sentence.text).toContain(HAND['6 × (9 − 2) + 5']); expect(KNOWLEDGE.examples.text).toContain(HAND['9 + 2 × 7']); expect(KNOWLEDGE.examples.text).toContain(HAND['(9 + 2) × 7']);
    expect(KNOWLEDGE.examples.text).toContain('= 23'); expect(KNOWLEDGE.examples.text).toContain('= 77');
    expect(ev('9 + 2 × 7')).toEqual(Q(23n)); expect(ev('(9 + 2) × 7')).toEqual(Q(77n)); expect(rootName('9 + 2 × 7')).toBe('مجموع'); expect(rootName('(9 + 2) × 7')).toBe('جداء');
    expect(KNOWLEDGE.last.text).toContain('= 27'); expect(ev('4 × 5')).toEqual(Q(20n)); expect(div(ev('12'), ev('4'))).toEqual(Q(3n)); expect(KNOWLEDGE.order.text).toContain('= 3');
    expect(METHOD.describe.solution[2]).toContain(HAND['12 × (15 − 9)']); expect(METHOD.describe.solution[2]).toContain('72'); expect(ev('12 × (15 − 9)')).toEqual(Q(72n));
    expect(ev('12 + 45 ÷ 9')).toEqual(Q(17n)); expect(METHOD.write.solution[2]).toContain('17'); expect(ev('(12 + 45) ÷ 9')).not.toEqual(Q(17n));
    expect(ev('(27 + 9) ÷ 6')).toEqual(Q(6n)); expect(ev('27 + 9 ÷ 6')).toEqual(num('28,5')); expect(METHOD.bracket.solution[2]).toContain('6');
    expect(ev('4 × (9 + 6)')).toEqual(Q(60n)); expect(ev('4 × 9 + 6')).toEqual(Q(42n)); expect(GUIDE.nobracket.wrong).toContain('42'); expect(GUIDE.nobracket.right).toContain('60');
    expect(ev('11 × 5')).toEqual(Q(55n)); expect(GUIDE.firstop.wrong).toContain('55'); expect(GUIDE.firstop.right).toContain('27');
    expect(LAB.alone.tasks).toEqual([{ id: 'm1', kind: 'cut', text: '(20 − 8) ÷ (1 + 2)', depth: 'full' }]);
    expect(rootName('(20 − 8) ÷ (1 + 2)')).toBe('حاصل قسمة'); expect(stripOuter(splitRoot('(20 − 8) ÷ (1 + 2)').l)).toBe('20 − 8');
    // M3 (étape 4) : « فرق العدد 30 وجداء العددين 2 و 7 » = 30 − 2 × 7 = 16 ; l'autre écriture est fausse
    expect(ev('30 − 2 × 7')).toEqual(Q(16n)); expect(C.describe('30 − 2 × 7')).toBe('فرق العدد 30 وجداء العددين 2 و 7');
    expect(C.describe('4 × 9 + 6')).not.toBe(HAND['4 × (9 + 6)']);
    // M3 (étapes 2 et 3) : les distracteurs de ces questions décrivent AUTRE chose
    expect(C.describe('(12 + 45) ÷ 9')).not.toBe('مجموع العدد 12 وحاصل قسمة 45 على 9'); expect(C.describe('12 ÷ 45 + 9')).not.toBe('مجموع العدد 12 وحاصل قسمة 45 على 9');
    expect(C.describe('27 + 9 ÷ 6')).not.toBe(HAND['(27 + 9) ÷ 6']); expect(C.describe('6 ÷ (27 + 9)')).not.toBe(HAND['(27 + 9) ÷ 6']);
  });

  it('« أستعدّ » : les affirmations sont vraies ou fausses comme annoncé', () => {
    const items = [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS];
    expect(items).toHaveLength(6);
    expect(items.map((i) => i.answer)).toEqual([false, true, true, true, true, false]);
    expect(add(num('4,7'), num('9,3'))).toEqual(Q(14n)); expect(mul(Q(6n), num('2,5'))).toEqual(Q(15n));
    expect(sub(Q(45n), Q(18n))).toEqual(Q(27n)); expect(div(Q(36n), Q(4n))).toEqual(Q(9n));
    expect(ev('5 + 4 × 3')).toEqual(Q(17n)); expect(ev('(5 + 4) × 3')).toEqual(Q(27n));
    expect(rootName('4,7 + 9,3')).toBe('مجموع'); expect(PREP_ITEMS[0].text).toContain('جداء'); expect(PREP_ITEMS[0].why).toContain('مجموع');
    expect(PREP_ITEMS.map((i) => i.n)).toEqual([1, 2]);
  });

  it('la notation : le signe × est toujours écrit (jamais 3(4 + 5)) dans les exercices montrés', () => {
    const islands = JSON.stringify(EXERCISES).replace(/\\\\/g, '\\').match(/\$[^$]*\$/g) ?? [];
    expect(islands.length).toBeGreaterThan(30);
    islands.forEach((m) => expect(/\d\s*\(|\)\s*\(/.test(m), m).toBe(false));
    expect(tex('4 × (1,5 + 2,5)')).toBe('4 \\times (1{,}5 + 2{,}5)');
  });
});
