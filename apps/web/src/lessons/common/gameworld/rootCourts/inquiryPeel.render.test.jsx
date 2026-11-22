import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { Peel, PeelView, EMPTY_INPUT } from './InquiryPeel';
import { initPeel, peelReducer, PEEL_LAYOUT } from './peel';
import { tileWord } from './strings';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** « dalle » agreed with its number, the number in $…$ (a fraction over its bar): « $75$ dalles », « $1$ dalle ». */
const tl = (text, tex) => `$${tex}$ ${tileWord(text)}`;
const cap = (t) => t[0].toUpperCase() + t.slice(1);
/** The courts of a plaque, in words: « une salle », « $2$ salles égales », « $\\dfrac{2}{3}$ de salle ». */
const courtsWords = ({ whole, num, courtsTex }) => {
  if (!whole) return `$${courtsTex}$ de salle`;
  if (num === '1') return 'une salle';
  return `$${num}$ salles égales`;
};
const pileWords = ({ pileSign, pileAbs, pileAbsTex }) =>
  pileSign > 0
    ? ` avec ${tl(pileAbs, pileAbsTex)} en plus`
    : pileSign < 0
      ? ` à laquelle il manque ${tl(pileAbs, pileAbsTex)}`
      : '';
const OP = {
  share: ({ nTex }) => `Tu as partagé la plaque entre les salles par $${nTex}$`,
  grow: ({ nTex }) => `Tu as multiplié les salles par $${nTex}$`,
  add: ({ n, nTex }) => `Tu as ajouté ${tl(n, nTex)}`,
  take: ({ n, nTex }) => `Tu as retiré ${tl(n, nTex)}`,
  restart: () => 'Tu as remis la plaque comme au début',
};
const END = {
  two: 'deux toises font monter la plateforme',
  one: 'une seule toise fait monter la plateforme',
  none: 'aucune salle ne peut être construite',
};
/** A sentence after his answer: as it is when he saw right, after the fact of a miss when he did not. */
const MISS = 'Ta prédiction ne s’est pas vérifiée cette fois';
const after = (right, t) => (right ? cap(t) : `${MISS} : ${t}`);

/**
 * A COMPLETE example of the spec of `peel`, in French — every key the screen reads (GAME_WORLD.md « spec shape of `peel`
 * of « Le palais des dalles » »). Facts only: no sentence names the rule (« isole », « équation », « résous »), writes x,
 * or says « wrong ». A number inside a sentence goes through MathText as `$…$`; a fraction is `\\dfrac` (a real bar).
 * The four rounds are the lesson's design (ROOTS_WORLD_PLAN.md §13): 3x² = 75, x² − 6 = 0, x² + 4 = 0, (2/3)x² = 1350.
 */
const PEEL_SPEC = {
  kind: 'peel',
  rounds: [
    { courts: '3', plaque: '75', tex: '3x^2 = 75' },
    { courts: '1', pile: '-6', plaque: '0', tex: 'x^2 - 6 = 0' },
    { courts: '1', pile: '4', plaque: '0', tex: 'x^2 + 4 = 0' },
    { courts: '2/3', plaque: '1350', tex: '\\dfrac{2}{3}x^2 = 1350' },
  ],
  text: {
    lead: () => 'La plaque du fabricant de toises a été écrite pour plus d’une salle.',
    goal: () =>
      'Épluche la plaque, une opération après l’autre, jusqu’à ce qu’il reste une salle seule, puis dis quelle toise la fait monter.',
    plaque: (a) =>
      a.alone
        ? `Une salle seule : son aire est de ${tl(a.plaque, a.plaqueTex)}.`
        : `${cap(courtsWords(a))}${pileWords(a)} : ensemble, ${tl(a.plaque, a.plaqueTex)}.`,
    askPeel: () =>
      'Choisis une opération et écris son nombre : le monde la fait sur les salles et sur la plaque à la fois.',
    share: 'Partage par',
    shareAfter: '',
    grow: 'Multiplie par',
    growAfter: '',
    add: 'Ajoute',
    addAfter: 'dalles',
    take: 'Retire',
    takeAfter: 'dalles',
    doIt: 'Fais',
    restart: 'Remets la plaque',
    peeled: (a) =>
      `${OP[a.op](a)} : ${a.alone ? 'il reste une salle seule, d’aire' : 'la plaque dit maintenant'} ${tl(a.after.plaque, a.after.plaqueTex)}.`,
    refused: (a) =>
      a.reason === 'split'
        ? `Sur la plaque, $${a.pieces}$ morceaux égaux : ils ne se partagent pas en $${a.nTex}$ groupes égaux.`
        : a.reason === 'room'
          ? `Le banc ne tient pas plus de $${PEEL_LAYOUT.maxCourts}$ salles.`
          : 'Les nombres sont trop longs pour la plaque.',
    unread: 'Écris d’abord un nombre dans la case.',
    askRods: (a) => `Une salle de ${tl(a.lone, a.loneTex)} : combien de toises la font monter, et lesquelles ?`,
    countTwo: 'Deux toises',
    countOne: 'Une toise',
    countNone: 'Aucune toise',
    rightRod: 'À droite',
    leftRod: 'À gauche',
    oneRod: 'La toise',
    formNumber: 'Nombre',
    formWall: 'Côté',
    wallBox: 'côté de la salle de',
    tiles: 'dalles',
    build: 'Construis',
    wallLabel: ({ area, areaTex }) => `côté de la salle de ${tl(area, areaTex)}`,
    noRod: 'Aucune salle',
    fact: (a) => after(a.right, `sur la salle de ${tl(a.lone, a.loneTex)}, ${END[a.end]}.`),
    colPlaque: 'Plaque',
    colPeels: 'Tes opérations',
    colLone: 'Salle seule',
    colRods: 'Toises',
    next: 'Plaque suivante',
    done: 'J’ai fini',
    unknown: '?',
  },
};

const act = new Proxy({}, { get: () => () => {} });
const html = (state, input = EMPTY_INPUT, spec = PEEL_SPEC) =>
  renderToString(<PeelView spec={spec} state={state} act={act} input={input} />);
const play = (actions, spec = PEEL_SPEC, from = initPeel(spec)) =>
  actions.reduce((s, a) => peelReducer(spec, s, a), from);
const peel = (op, n) => [{ type: 'peel', op, n }, { type: 'ran' }];
const answer = (said) => [{ type: 'answer', said }, { type: 'built' }];
/** What the student SEES: the text, without the tags (nor KaTeX's hidden TeX source). */
const seen = (out) =>
  out
    .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, ' ');
/** Never on this screen: the rule's words, a root sign, a verdict of « wrong ». */
const TOLD = /isole|équation|résou|solution|racine|√|sqrt|faux|fausse|erreur|[\u0600-\u06FF]/i;
/** A fraction is never written « p/q » as text. */
const SLASH = /\d\s*\/\s*\d/;
/** The letter of the lesson's writing (the letter x alone, not inside « deux »): only on the round's tex, once solved. */
const LETTER = /\bx\b/;
const withInput = (o) => ({ ...EMPTY_INPUT, ...o });

/** Every state of a full play of the four rounds: a share refused, a wrong peel, a restart, wrong rods. */
function allStates(spec = PEEL_SPEC) {
  const steps = [
    { type: 'peel', op: 'share', n: '4' },
    ...peel('share', '3'),
    ...answer({ n: 2, right: { q: '5' }, left: { q: '5' } }),
    { type: 'next' },
    ...peel('take', '6'),
    { type: 'restart' },
    ...peel('add', '6'),
    ...answer({ n: 1, right: { root: '6' } }),
    { type: 'next' },
    ...peel('take', '4'),
    ...answer({ n: 2, right: { q: '2' }, left: { q: '2' } }),
    { type: 'next' },
    ...peel('grow', '3'),
    ...peel('share', '2'),
    ...answer({ n: 2, right: { q: '45' }, left: { q: '45' } }),
  ];
  const out = [initPeel(spec)];
  for (const a of steps) out.push(peelReducer(spec, out.at(-1), a));
  return out;
}

describe('the investigation screen `peel`', () => {
  it('the stateful component mounts and opens on the plaque of three courts, the four peels, an empty table', () => {
    const out = renderToString(<Peel spec={PEEL_SPEC} play={() => {}} onDone={() => {}} />);
    expect(out).toContain('data-iq="peel"');
    expect(out).toContain('data-iq-stage="peel"');
    expect(out).toContain('data-iq-round="0"');
    expect(out).toContain('data-iq-courts="3"');
    expect(out).toContain('data-iq-pile="0"');
    expect(out).toContain('data-iq-value="75"');
    expect(out).toContain('data-iq-plate="75"');
    expect((out.match(/data-iq-court-piece="1"/g) ?? []).length).toBe(3);
    for (const op of ['share', 'grow', 'add', 'take']) {
      expect(out).toContain(`data-iq-op="${op}"`);
      expect(out).toContain(`data-iq-in="op-${op}"`);
      expect(out).toContain(`data-iq-op-go="${op}"`);
    }
    expect(out).not.toContain('data-iq-restart');
    expect(out).toContain('data-iq-table="0"');
    expect(out).toContain('data-iq-row="0"'); // the round under way, its lone court « ? »
    expect(out).toContain('data-iq-cell-lone=""');
    expect(out).not.toContain('data-iq-next');
    expect(out).not.toMatch(/undefined|NaN|\[object/);
    expect(seen(out)).toContain('salles égales');
    expect(seen(out)).not.toMatch(TOLD);
    expect(seen(out)).not.toMatch(LETTER);
    expect(out).not.toContain('data-iq-tex');
  });

  it('a share that cannot split the courts is answered by the fact: nothing changes, nothing « wrong »', () => {
    const s = play([{ type: 'peel', op: 'share', n: '4' }]);
    const out = html(s);
    expect(out).toContain('data-iq-stage="peel"');
    expect(out).toContain('data-iq-courts="3"');
    expect(out).toContain('rq-pl__fact is-refused');
    expect(seen(out)).toContain('ne se partagent pas');
    expect(seen(out)).not.toMatch(TOLD);
    // the table keeps no tag for a peel not done
    expect(out).not.toContain('data-iq-tag=');
  });

  it('a peel being done: the scene shows the plaque BEFORE with its animation, the cards are busy', () => {
    const s = play([{ type: 'peel', op: 'share', n: '3' }]);
    const out = html(s);
    expect(out).toContain('data-iq-stage="run"');
    expect(out).toContain('is-run-share');
    expect(out).toContain('rq-pl__ops is-busy');
    expect(out).toContain('data-iq-courts="3"');
  });

  it('one court alone: its plate, the question, the three taps; then the two rods’ boxes, the left one’s sign printed', () => {
    const s = play(peel('share', '3'));
    let out = html(s);
    expect(out).toContain('data-iq-stage="alone"');
    expect(out).toContain('data-iq-plate="25"');
    expect((out.match(/data-iq-court-piece="1"/g) ?? []).length).toBe(1);
    for (const v of [2, 1, 0]) expect(out).toContain(`data-iq-count="${v}"`);
    expect(out).not.toContain('data-iq-rods=');
    expect(out).not.toContain('data-iq-op=');
    expect(seen(out)).toContain('il reste une salle seule');
    expect(seen(out)).toContain('combien de toises la font monter');
    expect(out).toContain('data-iq-tag="share:3"');
    expect(out).toContain('data-iq-cell-lone="25"');
    out = html(s, withInput({ n: 2 }));
    expect(out).toContain('data-iq-rods="2"');
    expect(out).toContain('data-iq-rodblock="right"');
    expect(out).toContain('data-iq-rodblock="left"');
    expect(out).toContain('data-iq-in="right"');
    expect(out).toContain('data-iq-in="left"');
    expect(out).toContain('data-iq-sign');
    expect(out).toContain('data-iq-form="right:wall"');
    expect(out).toContain('data-iq-form="left:number"');
    expect(out).toContain('data-iq-build');
    out = html(s, withInput({ n: 1 }));
    expect(out).toContain('data-iq-rodblock="right"');
    expect(out).not.toContain('data-iq-rodblock="left"');
    out = html(s, withInput({ n: 2, right: { form: 'wall', text: '' }, left: { form: 'number', text: '' } }));
    expect(out).toContain('data-iq-rodlabel="right"');
    expect(out).toContain('data-iq-in="right-wall"');
    out = html(s, withInput({ n: 0 }));
    expect(out).not.toContain('data-iq-rodblock=');
    expect(out).toContain('data-iq-build');
  });

  it('the world builds the rods: twin courts round one post, both names, the tex only now', () => {
    const s0 = play([...peel('share', '3'), { type: 'answer', said: { n: 2, right: { q: '5' }, left: { q: '5' } } }]);
    let out = html(s0);
    expect(out).toContain('data-iq-stage="build"');
    expect(out).toContain('data-iq-scene="end"');
    expect(out).toContain('is-building');
    expect(out).toContain('data-iq-end=""');
    expect(out).not.toContain('data-iq-tex');
    const s = play([{ type: 'built' }], PEEL_SPEC, s0);
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-iq-end="two"');
    expect(out).toContain('data-iq-world-rod="right"');
    expect(out).toContain('data-iq-world-rod="left"');
    expect(out).toContain('data-iq-name="right"');
    expect(out).toContain('data-iq-tex');
    expect(seen(out)).toMatch(LETTER); // the lesson's writing, once solved
    expect(out).toContain('data-iq-row-end="two"');
    expect(out).toContain('data-iq-cell-rods="two"');
    expect(out).toContain('data-iq-rodchip="left"');
    expect(out).toContain('data-iq-next');
    expect(seen(out)).not.toContain(MISS);
    expect(seen(out)).not.toMatch(TOLD);
  });

  it('a wall: the court of 6 — the rods are named by the lesson’s words, his ONE rod is answered by the fact', () => {
    const states = allStates();
    const s = states.find((x) => x.stage === 'seen' && x.ri === 1);
    const out = html(s);
    expect(out).toContain('data-iq-end="two"');
    expect(seen(out).replace(/\s+/g, ' ')).toContain('côté de la salle de'); // MathText binds « de » to its number
    expect(seen(out)).toContain(MISS);
    expect(out).toContain('data-iq-tag="take:6"');
    expect(out).toContain('data-iq-tag="restart"');
    expect(out).toContain('data-iq-tag="add:6"');
  });

  it('no court: −4 tiles — the plate keeps its number, « no court », his two rods answered by the fact', () => {
    const s = allStates().find((x) => x.stage === 'seen' && x.ri === 2);
    const out = html(s);
    expect(out).toContain('data-iq-end="none"');
    expect(out).toContain('data-iq-world-rod="none"');
    expect(out).toContain('data-iq-num="-4"');
    expect(out).toContain('data-iq-cell-rods="none"');
    expect(seen(out)).toContain('Aucune salle');
    expect(seen(out)).toContain('−'); // a true minus, never a hyphen
    expect(seen(out)).toContain(MISS);
  });

  it('two thirds of a court: a court cut in strips, the fraction over its bar, then 2 courts, 2025, rods 45', () => {
    const states = allStates();
    const open = states.find((x) => x.stage === 'peel' && x.ri === 3 && x.peels.length === 0);
    let out = html(open);
    expect(out).toContain('data-iq-court-piece="2/3"');
    expect(out).toContain('data-iq-frac="2/3"');
    expect(seen(out)).not.toMatch(SLASH);
    const grown = states.find((x) => x.stage === 'peel' && x.ri === 3 && x.peels.length === 1);
    out = html(grown);
    expect(out).toContain('data-iq-courts="2"');
    expect(out).toContain('data-iq-value="4050"');
    const last = states.at(-1);
    out = html(last);
    expect(out).toContain('data-iq-table="4"');
    expect(out).toContain('data-iq-row="3"');
    expect(seen(out)).toContain('J’ai fini');
  });

  it('a pile that is a fraction after a share: the add box is two boxes over a bar', () => {
    const spec = { ...PEEL_SPEC, rounds: [{ courts: '3', pile: '-5', plaque: '70' }] };
    const s = play(peel('share', '3'), spec);
    expect(s.now).toEqual({ courts: '1', pile: '-5/3', plaque: '70/3' });
    const out = html(s, EMPTY_INPUT, spec);
    expect(out).toContain('data-iq-in="op-add-num"');
    expect(out).toContain('data-iq-in="op-add-den"');
    expect(out).toContain('data-iq-in="op-share"'); // a share is always a whole number
    expect(out).toContain('data-iq-frac="5/3"');
    expect(out).toContain('data-iq-frac="70/3"');
    expect(out).toContain('data-iq-restart');
    expect(seen(out)).not.toMatch(SLASH);
  });

  it('a lone area that is a fraction square: the rod’s number box is a fraction', () => {
    const spec = { ...PEEL_SPEC, rounds: [{ courts: '4', plaque: '25/9' }] };
    const s = play(peel('share', '4'), spec);
    const out = html(s, withInput({ n: 2 }), spec);
    expect(out).toContain('data-iq-in="right-num"');
    expect(out).toContain('data-iq-in="left-den"');
  });

  it('every state: no fraction as « p/q » text, nothing undefined, never the rule, x only on a solved round', () => {
    const states = allStates();
    expect(new Set(states.map((s) => s.stage))).toEqual(new Set(['peel', 'run', 'alone', 'build', 'seen']));
    for (const s of states)
      for (const input of [EMPTY_INPUT, withInput({ n: 2 })]) {
        const out = html(s, input);
        const text = seen(out);
        expect(text).not.toMatch(SLASH);
        expect(text).not.toMatch(TOLD);
        expect(out).not.toMatch(/undefined|NaN|\[object/);
        if (s.stage !== 'seen') expect(text).not.toMatch(LETTER);
      }
  });
});

/** The kind writes no word of its own: every text is the lesson's (here Latin tags — not one word of its own may appear). */
describe('the kind `peel` writes no word of its own', () => {
  const tag =
    (name) =>
    (f = {}) =>
      `${name}[${Object.keys(f).sort().join(',')}]`;
  const TAGS = {
    ...PEEL_SPEC,
    rounds: PEEL_SPEC.rounds.map(({ tex, ...r }) => (tex ? { ...r, tex: '\\mathrm{TEX}' } : r)),
    text: Object.fromEntries(
      Object.entries(PEEL_SPEC.text).map(([k, v]) => [k, typeof v === 'function' ? tag(k) : `#${k}#`]),
    ),
  };
  const ARABIC = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const inputs = [EMPTY_INPUT, withInput({ n: 2 }), withInput({ n: 2, right: { form: 'wall', text: '' } })];

  it('every stage, every row', () => {
    for (const s of allStates(TAGS))
      for (const input of inputs) {
        const out = renderToString(<PeelView spec={TAGS} state={s} act={act} input={input} />);
        expect(out).not.toMatch(ARABIC);
        expect(out).not.toMatch(/√|\\sqrt|undefined|NaN|\[object/);
        // no letter x and no equality sign written by the kind (the tex here is « TEX »)
        const bare = seen(out).replace(/\w+\[[^\]]*\]|#\w+#/g, '');
        expect(bare, bare.match(/.{0,30}[x=].{0,30}/)?.[0]).not.toMatch(/x|=/);
      }
  });

  it('nor in its source: outside comments, no Arabic letter, no root sign in peel.js and InquiryPeel.jsx', () => {
    for (const f of ['peel.js', 'InquiryPeel.jsx']) {
      const code = readFileSync(new URL(`./${f}`, import.meta.url), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
      expect(code, f).not.toMatch(ARABIC);
      expect(code, f).not.toMatch(/√/);
    }
  });

  it('the text functions receive what the docs say', () => {
    const all = allStates(TAGS)
      .flatMap((st) =>
        inputs.map((input) => seen(renderToString(<PeelView spec={TAGS} state={st} act={act} input={input} />))),
      )
      .join(' ');
    const P = 'alone,courts,courtsTex,den,num,pile,pileAbs,pileAbsTex,pileSign,pileTex,plaque,plaqueTex,whole';
    const A =
      'alone,courts,courtsTex,den,given,i,n,num,pile,pileAbs,pileAbsTex,pileSign,pileTex,plaque,plaqueTex,whole';
    expect(all).toContain(`lead[${A}]`);
    expect(all).toContain(`goal[${A}]`);
    expect(all).toContain(`askPeel[${A}]`);
    expect(all).toContain(`plaque[${P}]`);
    expect(all).toContain(
      'peeled[after,alone,before,courts,courtsTex,den,given,i,n,nTex,num,op,pile,pileAbs,pileAbsTex,pileSign,pileTex,plaque,plaqueTex,whole]',
    );
    expect(all).toContain(
      'refused[alone,before,courts,courtsTex,den,given,i,n,nTex,num,op,pieces,pile,pileAbs,pileAbsTex,pileSign,pileTex,plaque,plaqueTex,reason,whole]',
    );
    expect(all).toContain(`askRods[${A.replace('i,n,', 'i,lone,loneTex,n,')}]`);
    expect(all).toContain('wallLabel[area,areaTex]');
    expect(all).toContain(
      'fact[alone,countRight,courts,courtsTex,den,done,end,fewest,given,i,lone,loneTex,n,num,peels,pile,pileAbs,pileAbsTex,pileSign,pileTex,plaque,plaqueTex,right,rods,said,whole,world]',
    );
  });
});

/**
 * THE LAYOUT at 1366 × 768 (peel.js › PEEL_LAYOUT): what a browser would measure, computed from the budget — the
 * longest content the kind accepts (four rounds, six courts and a pile, numbers of eight characters, the longest labels
 * a lesson may give). The walk and the eyes check it again on the real screen.
 */
describe('the peel screen at 1366 × 768: one screen, nothing past its place, every text ≥ 18 px', () => {
  const L = PEEL_LAYOUT;
  const REM = 16;
  const px = (rem) => rem * REM;
  const onScreen = (designPx) => designPx * L.zoom;
  const panelRem = L.panel.w / REM;
  const mainRem = panelRem - L.table.w - L.gap - 2.2; // the panel's padding (1.1rem a side)
  /** A digit ≈ 0.55 em, a letter ≈ 0.55 em at most (measured in Cairo on the walk's screenshots for `calc` — NOT yet
   *  re-measured in the French font). */
  const CH = 0.55;
  /** The longest label a lesson may give an operation card (before and after its box together), and the button's. */
  const OP_LABEL = 20;
  const DO_IT = 4;

  it('the columns fit: the main column and the table; the table’s four cells', () => {
    expect(mainRem + L.gap + L.table.w).toBeLessThanOrEqual(panelRem);
    const t = L.table;
    expect(t.plaque + t.peels + t.lone + t.rods).toBeLessThanOrEqual(t.w + 0.01);
  });

  it('the scene holds six courts and a pile on one row; one court is big', () => {
    const many = L.maxCourts * L.scene.small + 4.2 + L.maxCourts * 0.5;
    expect(many).toBeLessThanOrEqual(mainRem);
    expect(L.scene.court * 3 + 4.2 + 3 * 0.5).toBeLessThanOrEqual(mainRem); // three courts and a pile, big
    // the plate, the courts, the sentence (two lines) fit the scene's height
    expect(L.scene.plate + 0.3 + L.scene.court + 0.35 + 2 * L.scene.say * 1.5).toBeLessThanOrEqual(L.scene.h + 0.4);
  });

  it('two operation cards side by side hold their longest content on one line', () => {
    const f = px(L.ops.font);
    const card = OP_LABEL * CH * f + px(4) /* a box of 2 … 4 characters */ + DO_IT * CH * f + px(1.6) + 3 * px(0.45);
    expect(card).toBeLessThanOrEqual(px(L.ops.w));
    expect(2 * L.ops.w + 0.6).toBeLessThanOrEqual(mainRem);
  });

  it('the heights fit: the head, the scene, the question, the peels (two rows and the restart) or the rods, the fact', () => {
    const fact = L.fact.lines * L.fact.font * 1.5;
    const ask = 1.12 * 1.5; // the question, one line
    const peels = L.head + L.rowGap + L.scene.h + L.rowGap + ask + 0.4 + 2 * L.ops.card + 0.4 + 2.4 + L.rowGap + fact;
    expect(px(peels)).toBeLessThanOrEqual(L.panel.h);
    const rods =
      L.head + L.rowGap + L.scene.h + L.rowGap + ask + 0.4 + L.rods.taps + 0.4 + L.rods.block + L.rowGap + fact;
    expect(px(rods)).toBeLessThanOrEqual(L.panel.h);
    // a rod's block: its label and its two form buttons on one line, then its box (a fraction: two boxes over a bar)
    expect(2.2 + 0.25 + 2 * 1.9 + 0.3).toBeLessThanOrEqual(L.rods.block);
    // a block is half the column: its first line (the label ≤ 10 characters, the two form words ≤ 12 together, their
    // buttons) and its box in the wall's form (the printed sign, « wallBox » ≤ 19 characters — « côté de la salle de »,
    // a box, « tiles » ≤ 6)
    const f = px(1.08);
    const f2 = px(1.12);
    expect(10 * CH * f + 12 * CH * f + 2 * px(1.8) + px(0.8)).toBeLessThanOrEqual(px(L.rods.w));
    expect(px(1.2) + 19 * CH * f2 + px(3.6) + 6 * CH * f2 + px(2.4)).toBeLessThanOrEqual(px(L.rods.w));
    expect(2 * L.rods.w + 0.8).toBeLessThanOrEqual(mainRem + 0.01);
    // the table: four rounds of two lines of stacked fractions, and its header
    expect(px(L.head + L.rowGap + L.table.header + L.maxRounds * L.table.row)).toBeLessThanOrEqual(L.panel.h);
    expect(2 * (2 * L.table.font * 1.1 + 0.3)).toBeLessThanOrEqual(L.table.row);
  });

  it('what he reads is ≥ 18 px on screen', () => {
    for (const rem of [L.ops.font, L.table.font, L.scene.say, L.fact.font, 1.08 /* labels */])
      expect(onScreen(px(rem))).toBeGreaterThanOrEqual(18);
  });

  it('the screen sets the sizes the CSS reads, and the CSS reads them; never the red of an error', () => {
    const out = html(initPeel(PEEL_SPEC));
    expect(out).toContain(`--rq-pl-table-w:${L.table.w}rem`);
    expect(out).toContain(`--rq-pl-scene-h:${L.scene.h}rem`);
    const css = readFileSync(new URL('./peel.css', import.meta.url), 'utf8');
    expect(css).toMatch(/grid-template-columns: minmax\(0, 1fr\) var\(--rq-pl-table-w/);
    expect(css).toMatch(/height: var\(--rq-pl-scene-h/);
    expect(css).toMatch(/\.rq-pl__courtbox \{[^}]*width: 7\.2rem/);
    expect(css).toMatch(/is-many \.rq-pl__courtbox \{[^}]*width: 5rem/);
    expect(css).toMatch(/\.rq-pl__op \{[^}]*min-height: 3\.3rem[^}]*font-size: 1\.12rem/);
    expect(css).toMatch(/th:nth-child\(1\) \{\s*width: 8\.2rem/);
    expect(css).toMatch(/th:nth-child\(2\) \{\s*width: 7\.6rem/);
    expect(css).toMatch(/th:nth-child\(3\) \{\s*width: 4\.4rem/);
    expect(css).toMatch(/th:nth-child\(4\) \{\s*width: 4\.8rem/);
    expect(css).not.toMatch(/#(ef4444|dc2626|f87171|ff0000|e11d48|b91c1c)/i);
    // every selector is prefixed by the frame and names this kind's classes only (or the shared ones it reuses)
    for (const sel of css.replace(/\/\*[\s\S]*?\*\//g, '').match(/^[^@\s{}][^{]*\{/gm) ?? [])
      if (!/^(from|to|\d+%)/.test(sel.trim())) expect(sel, sel).toMatch(/^\.rq-iq-frame /);
  });
});

describe('the peel screen reads LEFT to right', () => {
  const num = (tag, name) => Number(tag.match(new RegExp(` ${name}="([\\d.-]+)"`))?.[1]);
  it('the columns: the main column on the LEFT, then the table; no rtl left', () => {
    expect(PEEL_LAYOUT.columns).toEqual(['main', 'table']);
    const out = html(initPeel(PEEL_SPEC));
    expect(out.indexOf('class="rq-pl__main"')).toBeGreaterThan(-1);
    expect(out.indexOf('class="rq-pl__main"')).toBeLessThan(out.indexOf('class="rq-table rq-pl__table"'));
    expect(out).not.toMatch(/dir="rtl"|direction="rtl"/);
    const css = readFileSync(new URL('./peel.css', import.meta.url), 'utf8');
    expect(css).not.toMatch(/direction: rtl|row-reverse|Cairo|Tajawal/);
  });
  it('the rods stand as they are pulled: the left one on the LEFT, the right one on the RIGHT — drawing, names, boxes', () => {
    const s = play(peel('share', '3'));
    // his two boxes: the block of the rod pulled to the left comes first (a flex row: the first one is on the left)
    const boxes = html(s, withInput({ n: 2 }));
    expect(boxes.indexOf('data-iq-rodblock="left"')).toBeLessThan(boxes.indexOf('data-iq-rodblock="right"'));
    const built = html(play([...answer({ n: 2, right: { q: '5' }, left: { q: '5' } })], PEEL_SPEC, s));
    const slab = (side) =>
      built.match(new RegExp(`<rect class="rq-pl__slab"[^>]*data-iq-world-rod="${side}"[^>]*>`))[0];
    expect(num(slab('left'), 'x')).toBeLessThan(num(slab('right'), 'x'));
    expect(built.indexOf('data-iq-name="left"')).toBeLessThan(built.indexOf('data-iq-name="right"'));
  });
});
