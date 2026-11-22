import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { ChaseView, CHASE_COURT } from './InquiryChase';
import { initChase, chaseReducer, CHASE_LAYOUT } from './chase';
import { tiles } from './strings';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** A small tile (« un carreau ») agreed with its number: « 1 carreau », « 49 carreaux » — the noun alone. */
const small = (n) => (Number(n) < 2 ? 'carreau' : 'carreaux');
const KIND = { band: 'il reste une bande', jam: 'elle coince', ride: 'elle monte' };
/** A sentence after his prediction: as it is when he saw right, after the fact of a miss when he did not. */
const MISS = 'Ta prédiction ne s’est pas vérifiée cette fois';
const after = (right, t) => (right ? t[0].toUpperCase() + t.slice(1) : `${MISS} : ${t}`);

/**
 * A COMPLETE example of the spec of `chase`, in French — every key the screen reads (GAME_WORLD.md « spec shape of
 * `chase` »). Facts only: no sentence names the rule, says « exact », « never », « impossible », « root », or shows the
 * sign. A number inside a sentence goes through MathText as `$…$`; a fraction is `\\dfrac` (a real bar).
 */
const CHASE_SPEC = {
  kind: 'chase',
  a: '2',
  fracs: ['3/2', '7/5', '17/12', '41/29', '99/70'],
  text: {
    lead: ({ a }) =>
      `La salle de ${tiles(a)} : des toises dont la longueur est une fraction, chacune plus proche que la précédente.`,
    goal: ({ n }) => `Essaie les $${n}$ toises une par une : avant chaque plateforme, dis ce qu’elle va faire.`,
    ask: ({ rodTex }) => `La toise de $${rodTex}$ : que va faire sa plateforme ?`,
    sayBand: 'Il reste une bande',
    sayJam: 'Elle coince',
    sayRide: 'Elle monte',
    rodName: 'Toise',
    platformName: 'Plateforme',
    courtName: 'Salle',
    smallTile: ({ q, perTile }) => `Un carreau de côté $\\dfrac{1}{${q}}$ : il en faut $${perTile}$ pour une dalle.`,
    unit: (n) => small(n),
    unknown: '?',
    fact: ({ kind, platform, court, gap, right }) =>
      after(
        right,
        `la plateforme fait $${platform}$ carreaux et la salle $${court}$ — ${
          kind === 'ride' ? KIND.ride : `${KIND[kind]}, écart $${gap}$`
        }.`,
      ),
    colRod: 'Toise',
    colPlatform: 'Plateforme',
    colCourt: 'Salle',
    colFact: 'Ce qui se passe (carreaux)',
    band: 'Moins',
    jam: 'Plus',
    rides: 'Monte',
    next: 'Toise suivante',
    countAsk: ({ n }) => `Sur ces $${n}$ toises, combien de fois la plateforme est-elle montée ?`,
    countNone: 'Aucune fois',
    countOne: 'Une fois',
    countAll: 'À chaque fois',
    countFact: ({ rides, right }) =>
      after(right, `regarde le tableau : la plateforme est montée ${rides ? `$${rides}$ fois` : 'aucune fois'}.`),
    done: 'J’ai fini',
  },
};

const act = { say() {}, next() {}, count() {} };
const html = (state, spec = CHASE_SPEC) => renderToString(<ChaseView spec={spec} state={state} act={act} />);
const play = (actions, spec = CHASE_SPEC, from = initChase(spec)) =>
  actions.reduce((s, a) => chaseReducer(spec, s, a), from);
/** Lower one fraction with a prediction. */
const lower = (v) => [{ type: 'say', v }, { type: 'built' }];
/** What the student SEES: the text, without the tags (nor KaTeX's hidden TeX source). */
const seen = (out) =>
  out
    .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, ' ');
/** Never on this screen: the rule's words, its sign, a verdict of « wrong ». */
const TOLD = /racine|√|sqrt|exact|impossible|jamais|irrationnel|rationnel|faux|fausse|erreur|[\u0600-\u06FF]/i;
/** A fraction is never written « p/q » as text. */
const SLASH = /\d\s*\/\s*\d/;

/** Every state of a full play: wrong and right predictions, the closing question, his tap. */
function allStates(spec = CHASE_SPEC, says = ['band', 'ride', 'jam', 'band', 'ride'], tap = '1') {
  const out = [initChase(spec)];
  let s = out[0];
  for (let k = 0; k < 60 && !s.done; k += 1) {
    const type = { say: 'say', build: 'built', seen: 'next', count: 'count', counted: 'next' }[s.stage];
    const t = chaseReducer(
      spec,
      s,
      type === 'say' ? { type, v: says[s.i] } : type === 'count' ? { type, v: tap } : { type },
    );
    if (!t.done) out.push(t);
    s = t;
  }
  return out;
}

describe('the investigation screen `chase`', () => {
  it('is mounted by Inquiry and opens on the court, the rod over its bar, the three predictions, an empty table', () => {
    const out = renderToString(<Inquiry spec={CHASE_SPEC} onDone={() => {}} />);
    expect(out).toContain('data-iq="chase"');
    expect(out).toContain('data-iq-stage="say"');
    expect(out).toContain('data-iq-area="2"');
    expect(out).toContain('data-iq-p="3"');
    expect(out).toContain('data-iq-q="2"');
    expect(out).toContain('data-iq-court="2"');
    expect(out).toContain('data-iq-court-stage="say"');
    expect(out).toContain('data-iq-frac="3/2"');
    for (const k of ['band', 'jam', 'ride']) expect(out).toContain(`data-iq-say="${k}"`);
    expect(out).toContain('data-iq-table="0"');
    // the facts wait for his prediction: the card's numbers are « ? », no relation, no row, no fact
    expect(out).toContain('data-iq-platform=""');
    expect(out).toContain('data-iq-relation=""');
    expect(out).not.toContain('data-iq-row=');
    expect(out).not.toContain('data-iq-next');
    expect(out).not.toMatch(/undefined|NaN|\[object/);
    expect(seen(out)).not.toMatch(TOLD);
    expect(seen(out)).not.toMatch(SLASH);
  });

  it('3/2 jams — 9 against 8 small tiles, seen without a lens; his « band » is answered by the fact', () => {
    let s = play([{ type: 'say', v: 'band' }]);
    let out = html(s);
    expect(out).toContain('data-iq-court-stage="build"');
    expect(out).toContain('is-lowering');
    expect(out).not.toContain('data-iq-say=');
    s = play([{ type: 'built' }], CHASE_SPEC, s);
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-iq-court-kind="jam"');
    expect(out).toContain('data-iq-over="1"');
    expect(out).not.toContain('data-iq-lens=');
    expect(out).toContain('data-iq-platform="9"');
    expect(out).toContain('data-iq-courtline="8"');
    expect(out).toContain('data-iq-relation="jam"');
    expect(out).toContain('data-iq-row="0" data-iq-row-kind="jam"');
    expect(out).toContain('data-iq-cell-platform="9"');
    expect(out).toContain('data-iq-cell-court="8"');
    expect(out).toContain('data-iq-cell="jam"');
    expect(out).toContain('data-iq-next');
    expect(seen(out)).toContain(MISS);
    expect(seen(out)).not.toMatch(TOLD);
    expect(seen(out)).not.toMatch(SLASH);
  });

  it('7/5 leaves a band of ONE small tile — 49 against 50 — and the lens opens on the far corner (×10)', () => {
    const s = play([...lower('jam'), { type: 'next' }, ...lower('band')]);
    const out = html(s);
    expect(out).toContain('data-iq-court-kind="band"');
    expect(out).toContain('data-iq-band="1"');
    expect(out).toContain('data-iq-lens="1"');
    expect(out).toContain('data-iq-lensk="1"');
    expect(out).toContain('data-iq-platform="49"');
    expect(out).toContain('data-iq-courtline="50"');
    expect(out).toContain('data-iq-relation="band"');
    expect(out).toContain('data-iq-table="2"');
    expect(out).toContain('data-iq-frac="7/5"');
    expect(out).toContain('data-iq-smalltile="5"');
    expect(seen(out)).not.toContain(MISS); // he said « band »: no miss
    expect(seen(out)).not.toMatch(SLASH);
  });

  it('99/70: 9801 against 9800 — still one small tile, the lens at a power of ten the eye needs, five rows', () => {
    const s = play([
      ...lower('jam'),
      { type: 'next' },
      ...lower('band'),
      { type: 'next' },
      ...lower('jam'),
      { type: 'next' },
      ...lower('band'),
      { type: 'next' },
      ...lower('ride'),
    ]);
    const out = html(s);
    expect(out).toContain('data-iq-platform="9801"');
    expect(out).toContain('data-iq-courtline="9800"');
    expect(out).toContain('data-iq-court-kind="jam"');
    const k = Number(out.match(/data-iq-lens="(\d+)"/)[1]);
    expect(k).toBeGreaterThanOrEqual(2);
    expect(out).toContain('data-iq-table="5"');
    for (const f of ['3/2', '7/5', '17/12', '41/29', '99/70']) expect(out).toContain(`data-iq-frac="${f}"`);
    expect(seen(out)).toContain(MISS);
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('the closing question: three taps (0 / 1 / all); then the count, and « J’ai fini »', () => {
    const states = allStates();
    const count = states.find((s) => s.stage === 'count');
    let out = html(count);
    for (const v of ['0', '1', 'all']) expect(out).toContain(`data-iq-count="${v}"`);
    expect(out).not.toContain('data-iq-next');
    expect(out).not.toContain('data-iq-say=');
    expect(seen(out)).toContain('combien de fois');
    expect(out).toContain('data-iq-table="5"');
    const counted = states.find((s) => s.stage === 'counted');
    out = html(counted);
    expect(out).not.toContain('data-iq-count=');
    expect(out).toContain('data-iq-next');
    expect(seen(out)).toContain('J’ai fini');
    expect(seen(out)).toContain('aucune fois');
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('every state: no fraction as « p/q » text, nothing undefined, never the rule', () => {
    const states = allStates();
    expect(new Set(states.map((s) => s.stage))).toEqual(new Set(['say', 'build', 'seen', 'count', 'counted']));
    for (const s of states) {
      const out = html(s);
      expect(seen(out)).not.toMatch(SLASH);
      expect(seen(out)).not.toMatch(TOLD);
      expect(out).not.toMatch(/undefined|NaN|\[object/);
      // the fraction on the card is drawn over its bar at every stage
      expect(out).toMatch(/class="rq-fr rq-fr--big"/);
    }
  });

  it('on a square court the right fraction rides: the slab seated, « = », no lens', () => {
    const spec = { ...CHASE_SPEC, a: '4', fracs: ['3/2', '4/2', '5/2'] };
    const s = play([...lower('band'), { type: 'next' }, ...lower('ride')], spec);
    const out = html(s, spec);
    expect(out).toContain('data-iq-court-kind="ride"');
    expect(out).toContain('data-iq-relation="ride"');
    expect(out).toContain('data-iq-cell="ride"');
    expect(out).not.toContain('data-iq-lens=');
  });
});

/** The kind writes no word of its own: every text is the lesson's (here Latin tags — not one word of its own may appear). */
describe('the kind `chase` writes no word of its own', () => {
  const tag =
    (name) =>
    (f = {}) =>
      `${name}[${Object.keys(f).sort().join(',')}]`;
  const TAGS = {
    ...CHASE_SPEC,
    text: Object.fromEntries(
      Object.entries(CHASE_SPEC.text).map(([k, v]) => [k, typeof v === 'function' ? tag(k) : k]),
    ),
  };
  const ARABIC = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

  it('every stage, every row', () => {
    for (const s of allStates(TAGS)) {
      const out = renderToString(<ChaseView spec={TAGS} state={s} act={act} />);
      expect(out).not.toMatch(ARABIC);
      expect(out).not.toMatch(/√|\\sqrt|exact|approx|never|undefined|NaN|\[object/i);
    }
  });

  it('nor in its source: outside comments, no Arabic letter in chase.js and InquiryChase.jsx', () => {
    for (const f of ['chase.js', 'InquiryChase.jsx']) {
      const code = readFileSync(new URL(`./${f}`, import.meta.url), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
      expect(code, f).not.toMatch(ARABIC);
      expect(code, f).not.toMatch(/√/);
    }
  });

  it('the text functions receive what the docs say', () => {
    const s = allStates(TAGS);
    const all = s.map((st) => seen(renderToString(<ChaseView spec={TAGS} state={st} act={act} />))).join(' ');
    expect(all).toContain('lead[a,i,n,p,perTile,q,rodTex]');
    expect(all).toContain('ask[a,i,n,p,perTile,q,rodTex]');
    expect(all).toContain('smallTile[a,i,n,p,perTile,q,rodTex]');
    expect(all).toContain('fact[a,court,covers,diff,frac,gap,i,kind,n,p,perTile,platform,predicted,q,right,rodTex,s]');
    expect(all).toContain('countAsk[a,i,n,p,perTile,q,rodTex]');
    expect(all).toContain('countFact[a,i,n,p,perTile,q,rides,right,rodTex,said,tapped]');
    expect(all).toContain('unit[0,1,2,3]'); // called with the whole number alone (« 9801 »: four characters)
  });
});

/**
 * THE LAYOUT at 1366 × 768 (chase.js › CHASE_LAYOUT): what a browser would measure, computed from the budget — the
 * longest content the kind accepts (six fractions, numbers of eight digits, the widest formula the card allows, the
 * longest labels). The walk and the eyes check it again on the real screen.
 */
describe('the chase screen at 1366 × 768: one screen, nothing past its place, every text ≥ 18 px', () => {
  const L = CHASE_LAYOUT;
  const REM = 16;
  const px = (rem) => rem * REM;
  const onScreen = (designPx) => designPx * L.zoom;
  const panelRem = L.panel.w / REM;
  const mainW = px(panelRem - L.table.w - L.gap);
  const courtH = px(L.court.h);
  const courtW = (courtH * L.court.view.w) / L.court.view.h;
  const cardW = mainW - courtW - px(L.gap);
  /** A digit ≈ 0.55 em, a letter ≈ 0.55 em at most (measured in Cairo on the walk's screenshots for `calc` — NOT yet
   *  re-measured in the French font). */
  const CH = 0.55;
  /** KaTeX draws its formulas 1.21 times the text's size. */
  const KATEX = 1.21;

  it('the columns fit: the main column (the court and the card) and the table', () => {
    expect(mainW + px(L.gap) + px(L.table.w)).toBeLessThanOrEqual(L.panel.w + 0.01);
    expect(L.table.rod + 2 * L.table.num + L.table.fact).toBeCloseTo(L.table.w, 5);
    expect(courtW).toBeGreaterThanOrEqual(px(17)); // the court stays the subject
  });

  it('the card’s widest line fits: its label, the widest formula the kind accepts, the unit word', () => {
    const f = px(L.card.font);
    const line = L.card.name * CH * f + L.card.em * KATEX * f + L.card.unit * CH * f + 2 * px(0.6);
    expect(line).toBeLessThanOrEqual(cardW);
    // the rod's line: its label and a fraction of four digits (q ≤ 9999: a × q × q has eight digits at most)
    expect(L.card.name * CH * f + px(0.6) + 4 * CH * px(L.card.rod)).toBeLessThanOrEqual(cardW);
  });

  it('the table’s cells hold their longest content on one line', () => {
    const f = px(L.table.font);
    const pad = px(0.5) * 2;
    expect(4 * CH * f + 0.4 * f + pad).toBeLessThanOrEqual(px(L.table.rod)); // a fraction of four digits
    expect(L.maxDigits * CH * f + pad).toBeLessThanOrEqual(px(L.table.num));
    // the chip: its word, a space, the gap (eight digits), its padding and border, the cell's padding
    expect(L.table.word * CH * f + 0.3 * f + L.maxDigits * CH * f + px(1) + 3 + pad).toBeLessThanOrEqual(
      px(L.table.fact),
    );
  });

  it('the heights fit: the head, the court or the card, the question, its buttons, a fact of three lines; the table of six rows', () => {
    const c = L.card;
    // a stacked fraction (two lines × 1.1, its padding and bar), the key (two lines), two lines, the relation, four gaps
    const card = c.rod * 1.1 * 2 + 0.3 + 2 * c.font * 1.4 + 2 * c.line * c.font + 1.8 * c.rel + 4 * 0.4;
    const stage = Math.max(L.court.h, card);
    const talk = 2 * L.talk.ask * 1.5 + 0.5 + L.talk.buttons + 0.5 + 3 * L.talk.fact * 1.5;
    expect(px(L.head + L.rowGap + stage + 0.55 + talk)).toBeLessThanOrEqual(L.panel.h);
    // a row: a fraction at the table's font (two lines × 1.1, its padding and 2 px bar) and the cell's padding
    const row = 2 * L.table.font * 1.1 + 0.16 * L.table.font + 2 / REM + 0.24;
    expect(row).toBeLessThanOrEqual(L.table.row);
    expect(px(L.head + L.rowGap + L.table.header + L.maxFracs * L.table.row)).toBeLessThanOrEqual(L.panel.h);
  });

  it('what he reads is ≥ 18 px on screen: the card, the key, the table, the lens’s factor, the fractions', () => {
    expect(onScreen(px(L.card.font))).toBeGreaterThanOrEqual(18);
    expect(onScreen(px(L.table.font))).toBeGreaterThanOrEqual(18);
    expect(onScreen(px(L.card.rod))).toBeGreaterThanOrEqual(18);
    const unit = courtH / L.court.view.h;
    expect(onScreen(L.court.font * unit)).toBeGreaterThanOrEqual(18);
    expect(onScreen(L.court.font * 0.8 * unit)).toBeGreaterThanOrEqual(18); // the exponent
  });

  it('the screen sets the sizes the CSS reads, and the CSS reads them', () => {
    const out = html(initChase(CHASE_SPEC));
    expect(out).toContain(`--rq-ch-court-h:${L.court.h}rem`);
    expect(out).toContain(`--rq-ch-table-w:${L.table.w}rem`);
    const css = readFileSync(new URL('./inquiry.css', import.meta.url), 'utf8');
    const chase = css.slice(css.indexOf('/* ───────────────────────── chase'));
    expect(chase).toMatch(/height: var\(--rq-ch-court-h/);
    expect(chase).toMatch(/grid-template-columns: minmax\(0, 1fr\) var\(--rq-ch-table-w/);
    expect(chase).toMatch(/\.rq-ch__card \{[^}]*font-size: 1\.08rem/);
    expect(chase).toMatch(/\.rq-fr \{[^}]*font-size: 1\.08rem/);
    expect(chase).toMatch(/\.rq-fr--big \{[^}]*font-size: 1\.7rem/);
    expect(chase).toMatch(/th:nth-child\(1\) \{\s*width: 4\.4rem/);
    expect(chase).toMatch(/width: 6\.2rem/);
    expect(chase).toMatch(/th:nth-child\(4\) \{\s*width: 10\.4rem/);
    // never the red of an error
    expect(chase).not.toMatch(/#(ef4444|dc2626|f87171|ff0000|e11d48)/i);
  });
});

describe('the chase screen reads LEFT to right', () => {
  const num = (tag, name) => Number(tag.match(new RegExp(` ${name}="([\\d.-]+)"`))?.[1]);
  it('the columns: the main column on the LEFT, then the table — the court, then its card', () => {
    expect(CHASE_LAYOUT.columns).toEqual(['main', 'table']);
    const out = renderToString(<Inquiry spec={CHASE_SPEC} onDone={() => {}} />);
    expect(out.indexOf('class="rq-ch__main"')).toBeGreaterThan(-1);
    expect(out.indexOf('class="rq-ch__main"')).toBeLessThan(out.indexOf('class="rq-table rq-ch__table"'));
    expect(out.indexOf('data-iq-court-box')).toBeLessThan(out.indexOf('data-iq-card'));
    expect(out).not.toMatch(/dir="rtl"|direction="rtl"/);
    const css = readFileSync(new URL('./inquiry.css', import.meta.url), 'utf8');
    expect(css).not.toMatch(/direction: rtl|row-reverse|Cairo|Tajawal/);
  });
  it('the court grows from its post at the bottom LEFT; the lens looks at the top RIGHT corner, right of the court', () => {
    const { post, room, lens } = CHASE_COURT;
    expect(lens.cx - lens.r).toBeGreaterThan(post.x + room);
    const s = play([...lower('jam'), { type: 'next' }, ...lower('band')]);
    const out = html(s);
    const wall = out.match(/<rect class="rq-ch__wall"[^>]*>/)[0];
    const slab = out.match(/<rect class="rq-ch__slab[^"]*"[^>]*>/)[0];
    const rod = out.match(/<rect class="rq-ch__rod"[^>]*>/)[0];
    for (const r of [wall, slab, rod]) expect(num(r, 'x')).toBe(post.x);
    const xs = [...out.matchAll(/<rect class="rq-ch__tile[^"]*"[^>]*>/g)].map(([t]) => num(t, 'x'));
    expect(Math.min(...xs)).toBe(post.x);
    const spot = out.match(/<circle class="rq-ch__spot" cx="([\d.]+)"/);
    expect(Number(spot[1])).toBeGreaterThan(post.x + 100);
  });
});
