/**
 * MISSION 2 of « أدمج تعلّماتي » (unit 1) — the situation of BEM 2020: trees around a plot, then a budget.
 * DATA only, played by `lessons/common/gameworld/missions/MissionRunner.jsx` (`INTEGRATION_LESSON_PLAN.md` §6, §9):
 * the exam text as printed (« DA » shown « دج »), what the student underlines in it, the ONE question and the steps it
 * hides, each operation with the guidance of its wrong answers, the model copy. The scene « ring » plants what he
 * decided. The official solution (annals, 2020): 34 trees, 34x + 1,25 × 34x + 1400 ≤ 32000, x ≤ 400.
 * Here the budget is worked by arithmetic (the inequality is taught later in the year).
 */
const L = 60;
const W = 42;
const P = 2 * (L + W);
const D = 6;
const N = P / D;
const BUDGET = 32000;
const MOVE = 1400;
const LEFT = BUDGET - MOVE;
const EACH = LEFT / N;
const PCT = 225;
const PRICE = (EACH * 100) / PCT;

const ltr = (s) => `⁦${s.replace(/ /g, ' ')}⁩`;

/** One division of Euclid's algorithm, posed by the student: a = b × [q] + [r]. */
const division = (id, a, b, nth) => {
  const q = Math.floor(a / b);
  const r = a % b;
  return {
    kind: 'work',
    id,
    stage: 4,
    pay: 5,
    ask:
      nth === 0
        ? `المسافة تقسم ${L} و ${W}، وهي أكبر ما يمكن. القسمة الأولى: ${a} على ${b}.`
        : `الباقي ليس 0: القسمة التالية، ${a} على ${b}.`,
    sheet: `ضع القسمة الإقليدية للعدد ${a} على ${b}، واكتب: ${ltr(`${a} = ${b} × … + …`)}`,
    shape: [
      { tex: `${a} = ${b} \\times` },
      { box: 'q', label: 'حاصل القسمة', w: 2 },
      { tex: '+' },
      { box: 'r', label: 'الباقي', w: 2 },
    ],
    check: (v) => {
      if (v.q === q && v.r === r)
        return {
          ok: true,
          line: { tex: `${a} = ${b} \\times ${q} + ${r}` },
          fact: r ? `الباقي ${r} ليس 0: نواصل.` : 'الباقي 0: نتوقّف. انظر إلى الباقي الذي قبله.',
        };
      if (b * v.q + v.r !== a)
        return {
          ok: false,
          fact: `${ltr(`${b} × ${v.q} + ${v.r} = ${b * v.q + v.r}`)}، وليس ${a}. راجع قسمتك على ورقتك.`,
        };
      return { ok: false, fact: `الباقي ${v.r} ليس أصغر من ${b}: ما زال ${b} يدخل فيه مرّة أخرى.` };
    },
  };
};

export const BEM_2020 = {
  id: 'bem-2020-trees',
  title: 'المهمّة 2',
  session: 'شهادة التعليم المتوسط — دورة 2020',
  intro: 'وضعية إدماجية بسؤال واحد يخفي عدّة خطوات. هذه المرّة أنت تبني الحلّ على ورقتك، والقطعة تُريك ما كتبتَه.',
  minutes: 30,
  scene: { kind: 'ring', L, W },

  paper: [
    { t: 'يريد عمّي محمود إحاطة قطعة أرض مستطيلة الشكل بُعداها ' },
    { t: ltr(`${L} m`), mark: 'len' },
    { t: ' و ' },
    { t: ltr(`${W} m`), mark: 'wid' },
    { t: ' بأشجار من نفس النوع بحيث تكون ' },
    { t: 'المسافة متساوية', mark: 'equal' },
    { t: ' و ' },
    { t: 'أكبر ما يمكن', mark: 'most' },
    { t: ' بين كل شجرتين متتاليتين، على أن ' },
    { t: 'يغرس في كل ركن شجرة', mark: 'corner' },
    { t: '.', br: true },
    { t: 'المشتلة التي قصدها عمي محمود تعرض شجيرات مختلفة، أثمانها ' },
    { t: 'من 200 دج إلى 1000 دج', mark: 'range' },
    { t: ' حسب نوعيتها (كلما كانت الشجيرة أفضل كان ثمنها أكبر).', br: true },
    { t: '• تكلفة غرس كل شجيرة تمثل ' },
    { t: '125%', mark: 'plant' },
    { t: ' من ثمنها المعروض.', br: true },
    { t: '• مصاريف النقل ' },
    { t: '1400 دج', mark: 'move' },
    { t: ' مهما كان عدد الشجيرات.', br: true },
    { t: '• مع عمي محمود ' },
    { t: '32000 دج', mark: 'budget' },
    { t: '.', br: true },
    { t: 'أعط القيمة التي لا يمكن أن يتجاوزها ثمن الشجيرة', goal: 'price' },
    { t: ' حتى يتسنى لعمي محمود إحاطة هذه القطعة حسب الشروط المذكورة.' },
  ],
  /** What he underlines, in the order of the text: the line written in « المعطيات », and what is said when he taps it. */
  data: [
    { id: 'len', text: `الطول ${L} م`, say: `${L} م: طول القطعة.` },
    { id: 'wid', text: `العرض ${W} م`, say: `${W} م: عرض القطعة.` },
    { id: 'equal', text: 'المسافات متساوية', say: 'شرط بلا عدد: المسافة نفسها بين كلّ شجرتين.' },
    { id: 'most', text: 'المسافة أكبر ما يمكن', say: 'شرط بلا عدد: أكبر مسافة ممكنة.' },
    { id: 'corner', text: 'في كلّ ركن شجرة', say: 'شرط بلا عدد: الأركان الأربعة لها أشجارها.' },
    { id: 'range', text: 'ثمن الشجيرة بين 200 دج و 1000 دج', say: 'ثمن الشجيرة يتغيّر: من 200 دج إلى 1000 دج.' },
    { id: 'plant', text: 'الغرس: 125% من ثمن الشجيرة', say: '125%: تكلفة غرس شجيرة، مقارنة بثمنها.' },
    { id: 'move', text: 'النقل: 1400 دج', say: '1400 دج: النقل، مرّة واحدة مهما كان العدد.' },
    { id: 'budget', text: 'المبلغ: 32000 دج', say: '32000 دج: كلّ ما مع عمّي محمود.' },
  ],
  goals: [{ id: 'price', text: 'أكبر ثمن ممكن للشجيرة' }],
  /** The steps the question hides, as offered (not in order); `needs` answers a step taken too early. */
  plan: [
    {
      id: 'cost',
      text: 'ما يُصرف على شجيرة واحدة',
      needs: 'لتعرف ما يُصرف على شجيرة واحدة، تحتاج عدد الأشجار أوّلًا.',
    },
    { id: 'count', text: 'عدد الأشجار', needs: 'لتعدّ الأشجار، تحتاج المسافة بين شجرتين أوّلًا.' },
    { id: 'price', text: 'أكبر ثمن للشجيرة', needs: 'الثمن هو آخر ما تجده: يلزمك قبله ما يُصرف على شجيرة واحدة.' },
    { id: 'gap', text: 'المسافة بين شجرتين', needs: '' },
  ],

  steps: [
    { kind: 'data', id: 'data', stage: 1 },
    { kind: 'goal', id: 'goal', stage: 2 },
    { kind: 'plan', id: 'plan', stage: 3, order: ['gap', 'count', 'cost', 'price'] },
    division('e0', 60, 42, 0),
    division('e1', 42, 18, 1),
    division('e2', 18, 6, 2),
    {
      kind: 'work',
      id: 'gap',
      stage: 5,
      world: 'اغرس',
      ask: 'الباقي 0: توقّفت القسمات. ما المسافة بين شجرتين؟ القطعة ستُغرس بها.',
      sheet: `اكتب نتيجة القسمات: ${ltr(`PGCD(${L} ; ${W}) = …`)} ثمّ المسافة.`,
      rtl: true,
      shape: [{ t: 'المسافة بين شجرتين:' }, { box: 'd', label: 'المسافة بالمتر', w: 2 }, { t: 'م' }],
      check: (v) => {
        const d = v.d;
        if (!d || d > P) return { ok: false, fact: 'اكتب مسافة بالمتر، أصغر من محيط القطعة.' };
        const scene = { ring: { d } };
        if (d === D)
          return {
            ok: true,
            scene,
            line: { tex: `\\mathrm{PGCD}(${L} ; ${W}) = ${D}` },
            fact: `${D} م بين كلّ شجرتين: المسافات متساوية، ولكلّ ركن شجرته.`,
          };
        if (L % d === 0 && W % d === 0)
          return {
            ok: false,
            scene,
            fact: `${d} م: المسافات متساوية ولكلّ ركن شجرته. لكنّ النصّ يطلب « أكبر ما يمكن »، وقسماتك تعطي قاسمًا مشتركًا أكبر من ${d}: آخر باقٍ غير معدوم.`,
          };
        const bad = L % d ? L : W;
        return {
          ok: false,
          scene,
          fact: (built) =>
            `${d} م: ${built?.corners ? `${built.corners === 1 ? 'ركن بقي' : 'أركان بقيت'} بلا شجرة` : 'المسافة الأخيرة أقصر من غيرها'}. السبب: ${d} لا يقسم ${bad}. المسافة تقسم ${L} و ${W} معًا: انظر إلى قسماتك.`,
        };
      },
    },
    {
      kind: 'work',
      id: 'around',
      stage: 6,
      pay: 5,
      ask: 'الأشجار تحيط بالقطعة كلّها. ما طول ما تحيط به؟',
      sheet: `احسب محيط القطعة، واكتب: ${ltr(`(${L} + ${W}) × 2 = …`)}`,
      shape: [{ tex: `(${L} + ${W}) \\times 2 =` }, { box: 'p', label: 'المحيط بالمتر', w: 4 }],
      check: (v) => {
        if (v.p === P)
          return { ok: true, line: { tex: `(${L} + ${W}) \\times 2 = ${P}` }, fact: `محيط القطعة ${P} م.` };
        if (v.p === L + W)
          return { ok: false, fact: `${L + W} م هو طول وعرض فقط: نصف الطريق. الأشجار تحيط بالأضلاع الأربعة.` };
        if (v.p === L * W)
          return {
            ok: false,
            fact: `${L * W} هو ${ltr(`${L} × ${W}`)}: مساحة القطعة. الأشجار تُغرس على حافتها، لا داخلها.`,
          };
        return { ok: false, fact: `احسب من جديد: ${ltr(`${L} + ${W}`)} أوّلًا، ثمّ اضرب في 2.` };
      },
    },
    {
      kind: 'work',
      id: 'count',
      stage: 6,
      world: 'عُدّ في القطعة',
      ask: `شجرة كلّ ${D} م على ${P} م. كم شجرة يغرس عمّي محمود؟`,
      sheet: `احسب عدد الأشجار، واكتب: ${ltr(`${P} ÷ ${D} = …`)}`,
      shape: [{ tex: `${P} \\div ${D} =` }, { box: 'n', label: 'عدد الأشجار', w: 3 }],
      check: (v) => {
        if (v.n === N)
          return {
            ok: true,
            scene: { ring: { d: D, count: true } },
            line: { tex: `${P} \\div ${D} = ${N}` },
            fact: `القطعة عدّت معك: ${N} شجرة.`,
          };
        if (v.n === N + 1)
          return { ok: false, fact: `الطريق حول القطعة مغلق: بعد ${P} م تعود إلى الشجرة الأولى. لا شجرة زائدة.` };
        if (v.n === N + 4 || v.n === N - 4)
          return { ok: false, fact: 'شجرة الركن واحدة للضلعين معًا: لا تُحسب مرّتين، ولا تُنسى.' };
        if (v.n === (L + W) / D)
          return { ok: false, fact: `${(L + W) / D} شجرة تكفي لطول وعرض فقط. المحيط كلّه ${P} م.` };
        return { ok: false, fact: `راجع قسمتك: ${ltr(`${D} × ${v.n} = ${D * v.n}`)}، وليس ${P}.` };
      },
    },
    {
      kind: 'work',
      id: 'left',
      stage: 7,
      pay: 5,
      ask: 'النقل يُدفع مرّة واحدة. كم يبقى للأشجار وغرسها؟',
      sheet: `اكتب ما يبقى بعد النقل: ${ltr(`${BUDGET} − ${MOVE} = …`)}`,
      shape: [{ tex: `${BUDGET} - ${MOVE} =` }, { box: 'm', label: 'ما يبقى بالدينار', w: 5 }],
      check: (v) => {
        if (v.m === LEFT)
          return { ok: true, line: { tex: `${BUDGET} - ${MOVE} = ${LEFT}` }, fact: `${LEFT} دج للأشجار وغرسها.` };
        if (v.m === BUDGET + MOVE)
          return { ok: false, fact: `النقل يُدفع من المبلغ: ما يبقى للأشجار أقلّ من ${BUDGET} دج.` };
        return { ok: false, fact: `راجع طرحك: ${ltr(`${v.m} + ${MOVE} = ${v.m + MOVE}`)}، وليس ${BUDGET}.` };
      },
    },
    {
      kind: 'work',
      id: 'each',
      stage: 7,
      ask: `${LEFT} دج لـ ${N} شجرة. كم يُصرف على الشجيرة الواحدة، بثمنها وغرسها؟`,
      sheet: `اكتب: ${ltr(`${LEFT} ÷ ${N} = …`)}`,
      shape: [{ tex: `${LEFT} \\div ${N} =` }, { box: 'c', label: 'ما يُصرف على شجيرة', w: 4 }],
      check: (v) => {
        if (v.c === EACH)
          return {
            ok: true,
            line: { tex: `${LEFT} \\div ${N} = ${EACH}` },
            fact: `${EACH} دج على الأكثر لكلّ شجيرة: ثمنها وغرسها معًا.`,
          };
        return { ok: false, fact: `راجع قسمتك: ${ltr(`${N} × ${v.c} = ${N * v.c}`)}، وليس ${LEFT}.` };
      },
    },
    {
      kind: 'work',
      id: 'pct',
      stage: 8,
      pay: 5,
      ask: 'الشجيرة تكلّف ثمنها، ثمّ غرسها. كم بالمئة من ثمنها يدفع في المجموع؟',
      sheet: `الثمن هو 100% من نفسه، والغرس 125% منه. اكتب: ${ltr('100% + 125% = …')}`,
      shape: [{ tex: '100\\% + 125\\% =' }, { box: 'k', label: 'النسبة المئوية', w: 3 }, { tex: '\\%' }],
      check: (v) => {
        if (v.k === PCT)
          return {
            ok: true,
            line: { tex: `100\\% + 125\\% = ${PCT}\\%` },
            fact: `شجيرة مغروسة تكلّف ${PCT}% من ثمنها المعروض.`,
          };
        if (v.k === 125) return { ok: false, fact: '125% هي تكلفة الغرس وحدها. والشجيرة نفسها، ألا يدفع ثمنها؟' };
        if (v.k === 25)
          return {
            ok: false,
            fact: 'الغرس ليس تخفيضًا ولا زيادة على الثمن: هو مبلغ آخر يساوي 125% من الثمن، يُضاف إلى الثمن كلّه.',
          };
        return { ok: false, fact: `الثمن 100% والغرس 125%: اجمعهما.` };
      },
    },
    {
      kind: 'work',
      id: 'price',
      stage: 8,
      ask: `${EACH} دج هي ${PCT}% من ثمن الشجيرة. ما ثمنها؟`,
      sheet: `اكتب: ${ltr(`${EACH} × 100 ÷ ${PCT} = …`)}`,
      shape: [{ tex: `${EACH} \\times 100 \\div ${PCT} =` }, { box: 'x', label: 'ثمن الشجيرة', w: 4 }],
      check: (v) => {
        if (v.x === PRICE)
          return {
            ok: true,
            line: { tex: `${EACH} \\times 100 \\div ${PCT} = ${PRICE}` },
            fact: `${PRICE} دج: بهذا الثمن يُصرف المبلغ كلّه.`,
          };
        if (v.x === (EACH * 100) / 125)
          return {
            ok: false,
            fact: `${v.x} دج ثمنًا، و125% منه غرسًا: ${ltr(`${v.x} + ${v.x * 1.25} = ${v.x * 2.25}`)} دج للشجيرة، أكثر من ${EACH}.`,
          };
        if (v.x > PRICE)
          return {
            ok: false,
            fact: `بثمن ${v.x} دج، الشجيرة المغروسة تكلّف ${ltr(`${v.x} × ${PCT} ÷ 100 = ${(v.x * PCT) / 100}`)} دج: أكثر من ${EACH}.`,
          };
        return {
          ok: false,
          fact: `بثمن ${v.x} دج، الشجيرة المغروسة تكلّف ${(v.x * PCT) / 100} دج فقط: يبقى مال. الثمن الأكبر أعلى.`,
        };
      },
    },
    {
      kind: 'work',
      id: 'answer',
      stage: 9,
      ask: 'حرّر جوابك: جملة بعددها ووحدتها.',
      sheet: 'اكتب جملة الجواب: الثمن الذي لا يتجاوزه، بوحدته.',
      rtl: true,
      shape: [{ t: 'لا يمكن أن يتجاوز ثمن الشجيرة' }, { box: 'x', label: 'الثمن', w: 4 }, { t: 'دج.' }],
      check: (v) =>
        v.x === PRICE
          ? {
              ok: true,
              line: { text: `ثمن الشجيرة لا يتجاوز ${PRICE} دج.` },
              fact: `${PRICE} دج بين 200 دج و 1000 دج: المشتلة تبيع شجيرات بهذا الثمن.`,
            }
          : { ok: false, fact: 'انقل إلى جملتك الثمن الذي وجدتَه في آخر سطر من حلّك.' },
    },
    {
      // A CLASSMATE'S COPY of the same mission (plan §3): one line is wrong — the corner trees added to a count that
      // already holds them. The line after it is a right computation on a wrong number.
      kind: 'review',
      id: 'copy',
      stage: 10,
      title: 'ورقة زميلك',
      ask: 'هذه ورقة زميلك في المهمّة نفسها. في أيّ سطر أخطأ؟',
      lines: [
        { id: 'c1', tex: `\\mathrm{PGCD}(${L} ; ${W}) = ${D}`, holds: `قسماته صحيحة: آخر باقٍ غير معدوم هو ${D}.` },
        { id: 'c2', tex: `(${L} + ${W}) \\times 2 = ${P}`, holds: `المحيط: طولان وعرضان، ${P} م.` },
        { id: 'c3', tex: `${P} \\div ${D} + 4 = ${N + 4}` },
        { id: 'c4', tex: `${BUDGET} - ${MOVE} = ${LEFT}`, holds: 'النقل يُطرح من المبلغ مرّة واحدة: هذا السطر صحيح.' },
        {
          id: 'c5',
          tex: `${LEFT} \\div ${N + 4} \\approx ${Math.round(LEFT / (N + 4))}`,
          holds: 'القسمة نفسها صحيحة، لكنّها تستعمل عددًا جاء من سطر قبلها. ابحث قبل هذا السطر.',
        },
      ],
      wrong: 'c3',
      scene: { ring: { d: D, count: true } },
      why: `أضاف زميلك أشجار الأركان الأربعة، وهي محسوبة من قبل في ${ltr(`${P} ÷ ${D}`)}: القطعة تحمل ${N} شجرة، لا ${N + 4}.`,
      fix: `صحّح السطر على ورقة زميلك: ${ltr(`${P} ÷ ${D} = ${N}`)}، ثمّ ما يأتي بعده.`,
      line: { text: `ورقة زميلي: ${N} شجرة، لا ${N + 4}.` },
    },
  ],

  model: [
    { t: `المسافة تقسم ${L} و ${W} وهي أكبر ما يمكن: هي قاسمهما المشترك الأكبر.` },
    { tex: `60 = 42 \\times 1 + 18 \\qquad 42 = 18 \\times 2 + 6 \\qquad 18 = 6 \\times 3 + 0` },
    { tex: `\\mathrm{PGCD}(${L} ; ${W}) = ${D}` },
    { tex: `(${L} + ${W}) \\times 2 = ${P} \\qquad ${P} \\div ${D} = ${N}` },
    { t: `يغرس ${N} شجرة، بينها ${D} م.` },
    { tex: `${BUDGET} - ${MOVE} = ${LEFT} \\qquad ${LEFT} \\div ${N} = ${EACH}` },
    { tex: `100\\% + 125\\% = ${PCT}\\% \\qquad ${EACH} \\times 100 \\div ${PCT} = ${PRICE}` },
    { t: `ثمن الشجيرة لا يمكن أن يتجاوز ${PRICE} دج.` },
  ],
  marker: [
    'كتبتُ المعطيات، والشروط الثلاثة التي بلا عدد',
    'كتبتُ لماذا أبحث عن القاسم المشترك الأكبر',
    'وضعتُ القسمات الثلاث وكتبتُ الباقي في كلّ مرّة',
    'حسبتُ المحيط قبل عدد الأشجار',
    'كتبتُ جملة الجواب بوحدتها: دج',
  ],
};
