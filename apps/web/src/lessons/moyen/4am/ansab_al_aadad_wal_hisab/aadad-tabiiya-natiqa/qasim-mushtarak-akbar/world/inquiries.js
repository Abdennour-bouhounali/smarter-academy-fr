/**
 * THE INVESTIGATIONS of lesson « القاسم المشترك الأكبر لعددين طبيعيين » — their numbers and their words (the screens and
 * their logic are the world's: `divisorIsles/InquiryDeal.jsx`, `InquiryGcd.jsx` — nest —; the contract: GAME_WORLD.md
 * « استكشف », « spec shapes »). Each key is FOUND by an experiment of its own nature:
 *
 *   🤝, 👑  (islands A–D) NO screen here: the islands are the experiment (owner, 2026-11-19). The planks of island A
 *           build two bridges, 198 then 234, island B has none — he picks, sees the second gap refuse 11, walks back and
 *           picks again (story.js, the convoy « twins »). On island C every plank fills 266 and 322, and a purse of a
 *           coin per plank lets only the longest build both (the convoy « crown »). The forges read the world's log.
 *   DEAL    (💐, island G) the florist's 40 roses and 56 lilies dealt into vases: numbers of vases that leave roses
 *           only (7), lilies only (5, 10), both (3, 6, 12), and the ones that share everything (2, 4, 8).
 *   NEST    (🧩, island H, after the stone's baskets) 228 and 276, whose longest common plank 12 is GIVEN: for each probe
 *           he says, looking at 12 only, whether it fills both gaps — planks of 12, a plank of one gap only (19, 23),
 *           a plank longer than 12, a length under 12 that is not a plank of it (8).
 * None writes the rule (`writes` is not set): the tiles of the forge come after each one (forges.js says why for NEST).
 * No sentence here states a rule: each one says what the vases or the chips have just done; `inquiries.test.js` forbids
 * the words of each key's rule in them — and in the islands' sentences of keys 1 and 2. Arabic counts are agreed.
 */
import { DATES, FIGS, LILIES, ROSES, counted, listAr } from './math';
import { NUMBERS } from './story';

const { bouquets: F, baskets: K } = NUMBERS;

const fill = (yes) => (yes ? 'يملأ' : 'لا يملأ');
/** What he had said, against what the world did. */
const after = (right) => (right == null ? '' : right ? ' كما توقّعت!' : ' لم يكن هذا توقّعك.');
/** « و » before a count: a word takes it glued (« ومزهريتان »), a number apart (« و 23 لوحًا »), as everywhere in the lesson. */
const and = (x) => (/^\d/.test(x) ? `و ${x}` : `و${x}`);
/** Vases: « مزهرية واحدة », « مزهريتان », « 5 مزهريات », « 12 مزهرية ». */
export const VASES = ['مزهرية واحدة', 'مزهريتان', 'مزهريات', 'مزهرية'];
/** Vases after « في »: « في مزهريتين », never « في مزهريتان ». */
export const inVases = (k) => (k === 2 ? 'مزهريتين' : counted(k, VASES));

// ───────────────────────── DEAL — 💐 the florist's vases ─────────────────────────
/** What is left on the table after a deal, as the subject of « بقي »: the roses and/or the lilies. */
const leftOver = (restA, restB) =>
  [restA ? counted(restA, ROSES) : null, restB ? counted(restB, LILIES) : null].filter(Boolean).join(' و ');
/** One deal, in words: what each vase holds and what is left. */
const dealSays = (f) =>
  `${counted(f.k, VASES)}: في كلّ واحدة ${counted(f.qA, ROSES)} و ${counted(f.qB, LILIES)}، ${
    f.restA || f.restB ? `وبقي على الطاولة ${leftOver(f.restA, f.restB)}` : 'ولم تبقَ أيّ زهرة'
  }.`;

export const DEAL_INQUIRY = {
  kind: 'deal',
  a: { n: F.roses, item: 'rose' },
  b: { n: F.lilies, item: 'lily' },
  lot: 'vase',
  // 7 leaves roses only, 5 and 10 lilies only, 3, 6 and 12 both; 2, 4 and 8 share everything — 8 is in the chips
  choices: [2, 3, 4, 5, 6, 7, 8, 10, 12],
  minTries: 4,
  text: {
    lead: (a, b) =>
      `عند بائعة الجزيرة ${counted(a.n, ROSES)} و ${counted(b.n, LILIES)}. تريد أن تضعها كلّها في مزهريات متماثلة: في كلّ مزهرية العدد نفسه من الورود، والعدد نفسه من الزنابق.`,
    goal: () => 'الهدف: أكثر عدد من المزهريات، وما تحمله المزهرية الواحدة — دون أن تبقى زهرة.',
    choose: ({ tried: n }) => (n === 0 ? 'كم مزهرية؟ اختر عددًا.' : 'اختر عددًا آخر من المزهريات.'),
    ask: ({ k }) => `${counted(k, VASES)}: هل توزَّع كلّ الورود وكلّ الزنابق، دون أن تبقى زهرة؟`,
    dealt: (f) => `${dealSays(f)}${after(f.guess == null ? null : f.guess === f.ok)}`,
    again: (f) => `جرّبتَ هذا العدد من قبل. ${dealSays(f)}`,
    cols: { lots: 'المزهريات', a: 'ورود في كلّ مزهرية', b: 'زنابق في كلّ مزهرية', left: 'على الطاولة' },
    toAnswer: 'أعرف الجواب',
    back: 'أجرّب أعدادًا أخرى',
    check: 'تحقّق',
    answerLead: () => 'أكثر عدد من المزهريات، وما تحمله المزهرية الواحدة:',
    lotsUnit: 'مزهريات',
    unitA: 'ورود',
    unitB: 'زنابق',
    miss: (f) => {
      const { said, row } = f;
      if (f.kind === 'open') return 'بين الأعداد التي لم تجرّبها بعدُ عدد آخر يستحقّ التجربة.';
      if (f.kind === 'bigger')
        return `${counted(said.k, VASES)} توزّع كلّ الزهور، ${and(counted(row.k, VASES))} في جدولك توزّعها أيضًا.`;
      if (!row.ok) return `${counted(row.k, VASES)}: بقي على الطاولة ${leftOver(row.restA, row.restB)}.`;
      return `${dealSays(row)} وكتبتَ ${said.x} و ${said.y}.`;
    },
    ok: ({ said }) =>
      `${counted(said.k, VASES)}، في كلّ واحدة ${counted(said.x, ROSES)} و ${counted(said.y, LILIES)}، ولم تبقَ أيّ زهرة.`,
    bound: ({ max }) => `اكتب الأعداد الثلاثة؛ عدد المزهريات من 1 إلى ${max}.`,
    yes: 'نعم',
    no: 'لا',
    done: 'أكتب قاعدتي',
  },
};

// ───────────────────────── NEST — 🧩 the longest plank, given ─────────────────────────
export const NEST_INQUIRY = {
  kind: 'nest',
  rounds: [
    {
      a: K.dates,
      b: K.figs,
      // planks of 12 (6, 4, 12, 1), a plank of one gap only and longer than 12 (19: 228 only; 23: 276 only), longer
      // than 12 and of neither (24), under 12 and not a plank of 12 (8)
      probes: [6, 19, 8, 4, 24, 23, 12, 1],
    },
  ],
  text: {
    lead: (a, b) =>
      `${counted(a, DATES)} و ${counted(b, FIGS)}: الهوّتان ${a} و ${b}، وأطول لوح يملؤهما معروف. لكلّ لوح جديد: انظر إلى أطول لوح وحده، وقل هل يملأ اللوح الهوّتين.`,
    goal: () => `الهدف: أن تعرف هل يملأ لوحٌ الهوّتين، وأنت تنظر إلى الهوّة ${K.plank} وحدها.`,
    given: ({ a, b, g }) => `$\\mathrm{PGCD}(${a} ; ${b}) = ${g}$`,
    divisorsLabel: (g) => `ألواح الهوّة ${g}`,
    ask: ({ a, b, g, p }) => `اللوح ${p}: انظر إلى ${g} فقط. هل يملأ الهوّتين ${a} و ${b}؟`,
    yes: 'نعم، يملؤهما',
    no: 'لا',
    seen: (f, guess) =>
      `اللوح ${f.p} ${fill(f.holdsA)} ${f.a}، و${fill(f.holdsB)} ${f.b}، و${fill(f.inG)} ${f.g}.${after(guess === f.both)}`,
    foundLine: (f) => `اللوح ${f.p}: ${fill(f.holdsA)} ${f.a}، ${fill(f.holdsB)} ${f.b}، ${fill(f.inG)} ${f.g}`,
    compare: (f) =>
      `ألواح الهوّتين ${f.a} و ${f.b}: ${listAr(f.common)}. ألواح الهوّة ${f.g}: ${listAr(f.divisorsOfG)}.`,
    commonLabel: (a, b) => `الألواح التي تملأ ${a} و ${b}`,
    next: 'هوّتان أخريان',
    done: 'أكتب قاعدتي',
  },
};
