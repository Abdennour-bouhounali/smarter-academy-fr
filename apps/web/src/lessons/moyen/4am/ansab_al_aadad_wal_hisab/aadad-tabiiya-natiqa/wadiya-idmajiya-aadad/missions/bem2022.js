/**
 * MISSION 1 of « أدمج تعلّماتي » (unit 1) — the situation of BEM 2022, first part: the identical lots.
 * DATA only, played by `lessons/common/gameworld/missions/MissionRunner.jsx` (`INTEGRATION_LESSON_PLAN.md` §8, §9) — the
 * same flow the owner validated on the first player, written as steps: the two stocks underlined, the two questions,
 * FREE TRIES (the depot deals whatever number of lots he types; a condition carried by words is added to his data when
 * the depot has shown what happens without it), « أربط », the two divisions laid in the depot, the PGCD, why none is
 * greater, the content of a lot, the sentence. The scene is « lots » (`divisorIsles/Depot.js`).
 */
import { advice, deal, euclid, fill, line } from '../../../../../../common/gameworld/missions/lots';
import { CRATES, counted, leftOf, ltr } from '../../../../../../common/gameworld/missions/words';

const A = 1188;
const B = 528;
const ROWS = euclid(A, B);
const G = ROWS[ROWS.length - 1].b;
const REST = ROWS[0].r;
const STOCK = { a: A, b: B };
const KINDS = {
  a: { name: 'البطاطا', crates: 'صندوق بطاطا', color: '#e2b04a' },
  b: { name: 'الجزر', crates: 'صندوق جزر', color: '#f28b3c' },
};
const LOT = ['تشكيلة واحدة', 'تشكيلتان', 'تشكيلات', 'تشكيلة'];
const HOME = ['دار واحدة', 'داران', 'دور', 'دارًا'];
const tex = (l) => `${l.a} = ${l.b} \\times ${l.q} + ${l.r}`;

/** One division of Euclid's algorithm, posed by the student, then LAID in the depot: one stock along the other. */
const division = (row, k) => ({
  kind: 'work',
  id: `e${k}`,
  stage: 5,
  pay: 5,
  world: 'تحقّق في المستودع',
  ask:
    k === 0
      ? `القسمة الأولى: ${row.a} على ${row.b}.`
      : `الباقي ${ROWS[k - 1].r} ليس 0: القسمة التالية، ${row.a} على ${row.b}.`,
  sheet: `ضع القسمة الإقليدية للعدد ${row.a} على ${row.b}، واكتب: ${ltr(`${row.a} = ${row.b} × … + …`)}`,
  shape: [
    { tex: `${row.a} = ${row.b} \\times` },
    { box: 'q', label: 'حاصل القسمة', w: 2 },
    { tex: '+' },
    { box: 'r', label: 'الباقي', w: 3 },
  ],
  check: (v) => {
    if (v.q === row.q && v.r === row.r)
      return {
        ok: true,
        scene: {
          pairing: { big: row.a, small: row.b, q: row.q, r: row.r },
          colors:
            k % 2 === 0 ? { big: KINDS.a.color, small: KINDS.b.color } : { big: KINDS.b.color, small: KINDS.a.color },
        },
        line: { tex: tex(row) },
        fact: row.r
          ? `الباقي ${row.r} ليس 0: نواصل. القسمة التالية: ${row.b} على ${row.r}.`
          : 'الباقي 0: نتوقّف. انظر إلى الباقي الذي قبله.',
      };
    if (row.b * v.q + v.r !== row.a)
      return {
        ok: false,
        fact: `${ltr(`${row.b} × ${v.q} + ${v.r} = ${row.b * v.q + v.r}`)}، وليس ${row.a}. راجع قسمتك على ورقتك.`,
      };
    return { ok: false, fact: `الباقي ${v.r} ليس أصغر من ${row.b}: يمكن وضع ${row.b} مرّة أخرى.` };
  },
});

export const BEM_2022 = {
  id: 'bem-2022-lots',
  title: 'المهمّة 1',
  session: 'شهادة التعليم المتوسط — دورة 2022',
  intro: 'وضعية إدماجية، كما تأتي في الامتحان. ستحلّها كما في الامتحان: بورقة وقلم. المستودع يريك ما تكتبه.',
  minutes: 25,
  scene: 'lots',
  stock: STOCK,
  kinds: KINDS,

  /** The paper as printed. `mark`: what he underlines (a condition marked `late` in `data` is added after the depot showed it); `goal`: a question. */
  paper: [
    { t: 'خصّص فلاح قطعة أرض لإنتاج البطاطا و الجزر، فكان المحصول: ' },
    { t: `${A}`, mark: 'a' },
    { t: ' صندوق من البطاطا و ' },
    { t: `${B}`, mark: 'b' },
    { t: ' صندوقًا من الجزر. قصد مساعدة دور العجزة و مراكز الأيتام و ذوي الاحتياجات الخاصة، يريد هذا الفلاح أن ' },
    { t: 'يُجمّع الصناديق', mark: 'all' },
    { t: ' في ' },
    { t: 'تشكيلات متماثلة من حيث النوع و العدد', mark: 'same' },
    { t: ' (أي كل تشكيلة تحتوي على نفس عدد الصناديق من البطاطا و نفس عدد الصناديق من الجزر).', br: true },
    { t: '(ا) ما هو ' },
    { t: 'أكبر عدد من التشكيلات', goal: 'most' },
    { t: ' التي يمكن تكوينها؟', br: true },
    { t: '(ب) ما هو ' },
    { t: 'عدد صناديق البطاطا و عدد صناديق الجزر في كل تشكيلة', goal: 'content' },
    { t: '.' },
  ],
  data: [
    { id: 'a', text: `${A} صندوق بطاطا`, say: `${A}: عدد صناديق ${KINDS.a.name}.` },
    { id: 'b', text: `${B} صندوق جزر`, say: `${B}: عدد صناديق ${KINDS.b.name}.` },
    { id: 'all', text: 'كلّ الصناديق تُجمَّع', late: true },
    { id: 'same', text: 'تشكيلات متماثلة', late: true },
  ],
  goals: [
    { id: 'most', label: '(ا)', text: 'أكبر عدد من التشكيلات' },
    { id: 'content', label: '(ب)', text: 'عدد صناديق كلّ نوع في كلّ تشكيلة' },
  ],
  /** The quay counts a stock only once he said what its number counts. */
  quay: (data) => [data.includes('a') ? A : null, data.includes('b') ? B : null],

  steps: [
    { kind: 'data', id: 'data', stage: 1 },
    { kind: 'goal', id: 'goal', stage: 2 },
    {
      kind: 'tries',
      id: 'tries',
      stage: 3,
      label: 'عدد التشكيلات:',
      world: 'وزّع',
      go: 'أبحث عن الأكبر',
      max: A,
      ask: (ctx) => {
        const t = ctx.vals.tries;
        if (t?.miss) return `العدد ${t.miss} ترك صناديق على الرصيف. جرّب عددًا يقسم ${A} و ${B} معًا.`;
        return t?.worked.length
          ? 'هل تستفيد دور أكثر؟ جرّب عددًا آخر، أو ابحث عن الأكبر.'
          : 'كم تشكيلة تكوّن؟ جرّب عددًا: المستودع سيوزّع الصناديق.';
      },
      /** The depot deals `n` lots, whatever `n` is; a try that leaves crates gets a guidance that grows with the failures. */
      try: (n, ctx) => {
        const d = deal(n, STOCK);
        const scene = { lots: Array(n).fill(d.per), left: d.left, stock: STOCK };
        if (d.outcome !== 'left')
          return {
            ok: true,
            scene,
            sceneOpts: { cheer: d.outcome === 'most' },
            lines: d.lines.map((l) => ({ tex: tex(l), tone: 'ok' })),
            owe: 'same',
            fact: `${counted(n, LOT)} متماثلة، ولا صندوق باقٍ على الرصيف: في كلّ واحدة ${d.per.a} من ${KINDS.a.name} و ${d.per.b} من ${KINDS.b.name}.`,
          };
        const failed = (ctx.vals.tries?.fails ?? []).filter((x) => x !== n).length + 1;
        const tip = advice(n, STOCK, failed);
        const why =
          tip.which === 'both'
            ? `${n} لا يقسم ${A} ولا ${B}`
            : `${n} يقسم ${tip.which === 'a' ? B : A}، لكنّه لا يقسم ${tip.which === 'a' ? A : B}`;
        const near = tip.near && [tip.near.below, tip.near.above].filter(Boolean);
        const look = tip.small
          ? `ابدأ بعدد صغير: هل ${tip.small} يقسم ${A} و ${B}؟ جرّبه.`
          : near?.length
            ? `يوجد عدد يصلح قريب من ${n}: جرّب ${near.join(' أو ')}.`
            : `ابحث عن عدد يقسم ${A} و ${B} معًا.`;
        return {
          ok: false,
          scene,
          lines: d.lines.map((l) => ({ tex: tex(l), tone: 'left' })),
          owe: 'all',
          fact: `${counted(n, LOT)}: بقي على الرصيف ${leftOf(d.left, KINDS)}. السبب: ${why}. ${look}`,
        };
      },
      ready: (ctx) =>
        Boolean(ctx.vals.tries?.worked.some((n) => n > 1)) && ctx.data.includes('all') && ctx.data.includes('same'),
    },
    {
      kind: 'connect',
      id: 'tie-most',
      stage: 4,
      goal: 'most',
      ask: 'أربط: ما الذي يحتاجه السؤال (ا) من ورقتك؟',
      sheet: 'على ورقتك، ارسم سهمًا من كلّ معطى يحتاجه السؤال (ا).',
      must: ['a', 'b', 'all', 'same'],
      without: {
        a: 'بلا عدد صناديق البطاطا، لا يعرف المستودع كم صندوقًا يوزّع.',
        b: 'بلا عدد صناديق الجزر، التشكيلات تُكوَّن من البطاطا وحدها.',
        all: 'بلا « كلّ الصناديق »، يمكن ترك صناديق على الرصيف: أيّ عدد من التشكيلات يصلح إذن.',
        same: 'بلا « متماثلة »، يمكن أن تختلف التشكيلات: أيّ عدد من التشكيلات يصلح إذن.',
      },
    },
    ...ROWS.map(division),
    {
      kind: 'work',
      id: 'pgcd',
      stage: 5,
      ask: 'الباقي 0: توقّفت القسمات. ما هو القاسم المشترك الأكبر؟',
      sheet: `اكتب نتيجة القسمات: ${ltr(`PGCD(${A} ; ${B}) = …`)}`,
      shape: [{ tex: `\\mathrm{PGCD}(${A} ; ${B}) =` }, { box: 'g', label: 'القاسم المشترك الأكبر', w: 3 }],
      check: (v) => {
        if (v.g === G)
          return {
            ok: true,
            lines: [{ tex: `\\mathrm{PGCD}(${A} ; ${B}) = ${G}` }, { text: `جواب (ا): ${counted(G, LOT)}.` }],
            fact: `آخر باقٍ غير معدوم في قسماتك هو ${G}.`,
          };
        if (v.g === 0) return { ok: false, fact: '0 هو الباقي الأخير. أيّ باقٍ جاء قبله؟' };
        if (A % v.g || B % v.g)
          return {
            ok: false,
            fact: `${ltr(tex(line(A % v.g ? A : B, v.g)).replace(/\\times/g, '×'))}: العدد ${v.g} لا يقسم العددين معًا.`,
          };
        return { ok: false, fact: `${v.g} يقسم العددين، نعم. انظر إلى آخر باقٍ غير معدوم في قسماتك.` };
      },
    },
    {
      kind: 'work',
      id: 'rest',
      stage: 6,
      pay: 5,
      world: 'جرّب',
      rtl: true,
      ask: `في القسمة الأولى بقي ${REST} صندوقًا وحدها. جرّب عليها عددًا من أعدادك التي نجحت.`,
      sheet: `اختر عددًا من التشكيلات نجح معك، واقسم عليه ${REST}.`,
      shape: [{ t: 'عدد من أعدادي التي نجحت:' }, { box: 'n', label: 'عدد نجح معي', w: 3 }],
      check: (v, ctx) => {
        const mine = (ctx.vals.tries?.worked ?? []).filter((n) => n > 1);
        if (!mine.includes(v.n)) return { ok: false, fact: `اختر من أعدادك التي نجحت: ${mine.join(' أو ')}.` };
        const l = line(REST, v.n);
        return {
          ok: true,
          scene: { lots: Array(v.n).fill({ a: l.q, b: 0 }), left: { a: l.r, b: 0 } },
          line: { tex: tex(l), tone: 'ok' },
          fact: `${counted(v.n, LOT)} تقسم الصناديق الـ ${REST} التي بقيت وحدها: ${ltr(`${REST} = ${v.n} × ${l.q}`)}.`,
        };
      },
    },
    {
      kind: 'work',
      id: 'attack',
      stage: 6,
      world: 'وزّع',
      rtl: true,
      ask: `هل يوجد عدد تشكيلات أكبر من ${G}؟ اكتب واحدًا.`,
      sheet: `اكتب لماذا لا يصلح عدد أكبر من ${G}.`,
      shape: [{ t: `عدد أكبر من ${G}:` }, { box: 'n', label: 'عدد أكبر', w: 4 }],
      check: (v) => {
        if (!(v.n > G) || v.n > A) return { ok: false, fact: `اكتب عددًا أكبر من ${G}، ولا يتجاوز ${A}.` };
        const d = deal(v.n, STOCK);
        return {
          ok: true,
          scene: { lots: Array(v.n).fill(d.per), left: d.left, stock: STOCK },
          line: { tex: `${REST} = ${v.n} \\times 0 + ${REST}`, tone: 'left' },
          fact: `${counted(v.n, LOT)}: بقي ${leftOf(d.left, KINDS)}. والعدد ${v.n} لا يقسم الـ ${REST}: أكبر عدد ينجح هو ${REST}.`,
        };
      },
    },
    {
      kind: 'connect',
      id: 'tie-content',
      stage: 7,
      goal: 'content',
      ask: 'أربط: وما الذي يحتاجه السؤال (ب)؟',
      sheet: 'على ورقتك، ارسم سهمًا من كلّ ما يحتاجه السؤال (ب) — وجواب السؤال (ا) منها؟',
      ans: () => `جواب (ا): ${counted(G, LOT)}`,
      must: ['ans', 'a', 'b'],
      without: {
        ans: 'بلا عدد التشكيلات، على كم نقسم الصناديق؟',
        a: 'بلا عدد صناديق البطاطا، لا نعرف ما يأخذه كلّ تشكيلة منها.',
        b: 'بلا عدد صناديق الجزر، لا نعرف ما يأخذه كلّ تشكيلة منه.',
      },
    },
    {
      kind: 'work',
      id: 'content',
      stage: 8,
      world: 'املأ التشكيلات',
      rtl: true,
      ask: `ما في كلّ تشكيلة من ${counted(G, LOT)}؟`,
      sheet: `احسب: ${ltr(`${A} ÷ ${G}`)} ثمّ ${ltr(`${B} ÷ ${G}`)}.`,
      shape: [
        { box: 'pa', label: `صناديق ${KINDS.a.name}`, w: 3 },
        { t: `صندوقًا من ${KINDS.a.name} و` },
        { box: 'pb', label: `صناديق ${KINDS.b.name}`, w: 3 },
        { t: `صندوقًا من ${KINDS.b.name}` },
      ],
      check: (v) => {
        const per = { a: v.pa, b: v.pb };
        if (!per.a || !per.b) return { ok: false, fact: 'في كلّ تشكيلة صناديق من النوعين.' };
        const f = fill(G, per, STOCK);
        if (f.outcome === 'short')
          return {
            ok: false,
            scene: { lots: Array(f.full).fill(per), left: { a: 0, b: 0 }, empty: f.empty, stock: STOCK },
            fact: `امتلأت ${counted(f.full, LOT)} ثمّ انتهى المحصول: ${ltr(`${A} = ${per.a} × ${Math.floor(A / per.a)} + ${A % per.a}`)}.`,
          };
        const scene = { lots: Array(G).fill(per), left: f.left, stock: STOCK };
        if (f.outcome === 'left')
          return {
            ok: false,
            scene,
            fact: `${ltr(`${G} × ${per.a} = ${G * per.a}`)} و ${ltr(`${G} × ${per.b} = ${G * per.b}`)}: بقي على الرصيف ${leftOf(f.left, KINDS)}.`,
          };
        return {
          ok: true,
          scene,
          sceneOpts: { ship: true, cheer: true },
          lines: [{ tex: `${A} \\div ${G} = ${per.a}` }, { tex: `${B} \\div ${G} = ${per.b}` }],
          fact: `${counted(G, HOME)} تستلم كلّ واحدة ${counted(per.a, CRATES)} من ${KINDS.a.name} و${counted(per.b, CRATES)} من ${KINDS.b.name}.`,
        };
      },
    },
    {
      kind: 'work',
      id: 'answer',
      stage: 9,
      pay: 20,
      rtl: true,
      ask: 'حرّر جوابك: جملة لكلّ سؤال.',
      sheet: 'اكتب جملة جواب لكلّ سؤال، بعددها ووحدتها. ثمّ اكتب لماذا هذا العدد.',
      shape: [
        { t: 'العدد' },
        { box: 'sn', label: 'العدد', w: 3 },
        { t: 'يقسم' },
        { box: 'sa', label: 'العدد الأوّل', w: 4 },
        { t: 'و' },
        { box: 'sb', label: 'العدد الثاني', w: 3 },
        { t: 'وهو الأكبر: إذن هو … للعددين.' },
      ],
      /** The name of what he found, among keys he forged in the unit; a wrong name is answered by what it lacks. */
      choices: [
        { id: 'pgcd', text: 'القاسم المشترك الأكبر' },
        { id: 'rest', text: 'باقي القسمة' },
        { id: 'common', text: 'قاسم مشترك' },
      ],
      check: (v, ctx, name) => {
        if (v.sn !== G || [v.sa, v.sb].sort((x, y) => y - x).join() !== `${A},${B}`)
          return { ok: false, fact: 'أكمل الأعداد أوّلًا: أيّ عدد وجدتَ، ولأيّ عددين؟' };
        if (name === 'rest')
          return {
            ok: false,
            fact: `باقي قسمة ${A} على ${B} هو ${REST} أيضًا — لكنّ الباقي لا يقول إنّه يقسم العددين.`,
          };
        if (name === 'common') return { ok: false, fact: `نعم، ${G} قاسم مشترك — و 4 أيضًا. ما الذي يميّز ${G}؟` };
        return { ok: true, line: { text: `${G} هو القاسم المشترك الأكبر للعددين ${A} و ${B}.` } };
      },
    },
  ],

  model: [
    { t: `(ا) عدد التشكيلات يقسم ${A} و ${B}، وهو أكبر ما يمكن: هو قاسمهما المشترك الأكبر.` },
    { tex: ROWS.map(tex).join(' \\qquad ') },
    { tex: `\\mathrm{PGCD}(${A} ; ${B}) = ${G}` },
    { t: `أكبر عدد من التشكيلات هو ${counted(G, LOT)}.` },
    { tex: `${A} \\div ${G} = ${A / G} \\qquad ${B} \\div ${G} = ${B / G}` },
    {
      t: `(ب) في كلّ تشكيلة ${counted(A / G, CRATES)} من ${KINDS.a.name} و${counted(B / G, CRATES)} من ${KINDS.b.name}.`,
    },
  ],
  /** What a marker looks for on a copy — the platform's list, not an official scale. He ticks it against HIS sheet. */
  marker: [
    'كتبتُ المعطيات بأعدادها ووحداتها',
    'كتبتُ المطلوب قبل أن أحسب',
    'كتبتُ لماذا أبحث عن القاسم المشترك الأكبر',
    'وضعتُ القسمتين وكتبتُ الباقي في كلّ مرّة',
    'كتبتُ جملة جواب لكلّ سؤال، بوحدتها',
  ],
};
