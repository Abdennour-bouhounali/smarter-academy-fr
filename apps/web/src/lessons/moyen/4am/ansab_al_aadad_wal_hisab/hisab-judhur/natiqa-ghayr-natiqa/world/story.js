/**
 * THE STORY of lesson `natiqa-ghayr-natiqa` in the world « قصر الساحات » (`gameworld/rootCourts/Game.js` plays it; its
 * design: the last section of `docs/reports/ROOTS_WORLD_PLAN.md`, with ONE change decided after it: the world in space shows DECIMAL areas and
 * marks only — a fraction is drawn with a real bar on the flat screens, the forges, the trainer and the final mission).
 * No rule is told: each key is forged by the student in its own forge, and its name is on its tablet only.
 *
 *   سطح الأعشار    two courts smaller than he has ever seen; the rod's dial has marks of a tenth. Both ride.
 *   سطح الفرز      five courts. Before each try he says whether a mark of the dial will ride it; three ride, and two are
 *                  CLOSED by the world (a band and a jam on two neighbouring marks: no mark rides them).
 *   قاعة المرايا   forge 🧩 (what makes a side written by a number), then a court ridden with his rule.
 *   سطح الجدار     the court of two tiles: no mark of a hundredth rides it; the mirror beside it — forge ♾️ (the chase
 *                  in fractions, another agent's experiment). Then the rod is clamped on the wall: it rides.
 *   سطح العلامات   the dial gets MIDDLE marks: two courts closed between a band and a jam, one of them on a middle mark —
 *                  forge 🎯 (which neighbour is nearer), then a court to the top.
 *   السطح الأعلى   the pavilion: the lesson's FINAL MISSION (`mission`), then the end.
 *
 * ONE NUMBER A LINE (the ledger `defects.md`): the bank checks of every lesson read a line of this file that holds two numbers
 * as a pair — so no comment of this file writes a number, and every court, mark and number of the mission stands alone
 * on its line. No coordinate: the world places the terraces in ONE line (`Game.layout`).
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { fractionBox, line } from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { counted, ltr } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { compare, outcome, read, square, tex, write } from '../../../../../../common/gameworld/rootCourts/logic';
import { tiles } from '../../../../../../common/gameworld/rootCourts/strings';
/**
 * The three keys, in the order the story gives them — the ids of `journey.js › KEYS` and of `forges.js` (forges.test.js
 * checks the three agree). Written HERE, not imported from the forges: the forges read this story (its courts, the marks
 * a court was closed between), and a story that imported them back would be evaluated before the forges' ids exist.
 */
export const K1 = 'murabba-natiq';
export const K2 = 'la-kasr-yarkab';
export const K3 = 'al-mudawwar';
import { above, calculator, cut, decimalsOf, middle, rounded, typedDecimal, typedFrac } from './math';

/** The marks of the rod's dial this story opens. */
export const TENTH = '0,1';
export const HUNDREDTH = '0,01';
export const HALF_TENTH = '0,05';
export const HALF_HUNDREDTH = '0,005';

/** The ONE place that holds the courts of the story (checked against the bank and the first lesson in story.test.js). */
export const COURTS = {
  // سطح الأعشار — both ride
  big: '2,56',
  small: '0,64',
  // سطح الفرز — three ride, two are closed
  sortA: '1,96',
  sortB: '1,6',
  sortC: '5,76',
  sortD: '8,1',
  sortOut: '4,41',
  // قاعة المرايا — ridden with his rule
  hall: '10,24',
  // سطح الجدار — no mark rides it; its wall does
  two: '2',
  // سطح العلامات — a middle mark of a tenth, then of a hundredth; then the way to the top
  marksA: '19',
  marksB: '66',
  marksOut: '11,56',
};
/** The courts of « سطح الفرز », in the order they stand. */
export const SORTING = ['sortA', 'sortB', 'sortC', 'sortD', 'sortOut'];
/** The court of two tiles: what the calculator beside the mirror shows for its side. */
export const CALCULATOR = calculator(COURTS.two);

/**
 * THE FINAL MISSION — it needs the three keys: a court whose side is a decimal (🧩), a court whose area is a fraction
 * that reduces to the square of a fraction while the calculator shows an endless row of digits for its side (🧩 against
 * the error ♾️ fights: « many digits, so no fraction »), and a court whose side no number writes, cut by the mason at
 * its value by default and at its ROUNDED value (♾️, 🎯: the two differ). None is a court of the story or of the bank.
 */
export const MISSION = {
  exact: '12,96',
  fracN: 50,
  fracD: 72,
  none: '31',
};
const MISSION_FRAC = `${MISSION.fracN}/${MISSION.fracD}`;
/** The second court's area AS THE BUILDER WRITES IT — not reduced (it is the point of the line: reduce, then read). */
const MISSION_TEX = `\\dfrac{${MISSION.fracN}}{${MISSION.fracD}}`;

const has = (game, key) => game.state.keys.includes(key);
const doneId = (game, id) => Boolean(game.ridden[id] || game.sealed[id]);
const terraceOf = (game, id) => game.ter.find((t) => t.id === id);
/** The rows the world logged on a court (never the mirror's). */
const rowsOn = (game, area) => game.log.filter((row) => row.a === area && !row.mirror && row.s?.q != null);
/** The two neighbouring marks he found around the end of a wall: the longest rod that left a band, the shortest that jammed. */
export function framing(log, area) {
  const rows = log.filter((row) => row.a === area && !row.mirror && row.s?.q != null);
  const bands = rows.filter((r) => r.kind === 'band').map((r) => r.s.q);
  const jams = rows.filter((r) => r.kind === 'jam').map((r) => r.s.q);
  if (!bands.length || !jams.length) return null;
  const lo = bands.reduce((x, y) => (compare(x, y) >= 0 ? x : y));
  const hi = jams.reduce((x, y) => (compare(x, y) <= 0 ? x : y));
  return {
    lo: write(lo),
    hi: write(hi),
    gap: write({ n: read(hi).n * read(lo).d - read(lo).n * read(hi).d, d: read(hi).d * read(lo).d }),
  };
}
/** What he did on a court, as lines for the card « من الساحة السابقة »: the newest two platforms. */
const lastOn = (game, area) =>
  rowsOn(game, area)
    .slice(-2)
    .map((row) => {
      const out = outcome(row.s, row.a);
      if (out.kind === 'ride') return game.T.recall.rode(row.a, row.s.q);
      return out.kind === 'band'
        ? game.T.recall.band(row.a, row.s.q, out.diff)
        : game.T.recall.jam(row.a, row.s.q, out.diff);
    });
const COURTS_WORD = ['ساحة واحدة', 'ساحتان', 'ساحات', 'ساحة'];

/**
 * The terraces stand in ONE line, in the order he meets them, on the axis that goes INTO the screen (the owner's rule).
 * A court without `to` rides and stays; the ONE court of a terrace with `to` is its way out (GAME_WORLD.md, the third world).
 */
export const STORY = {
  end: 'aala',
  terraces: [
    {
      id: 'ashar',
      name: 'سطح الأعشار',
      courts: [
        { id: 'big', a: COURTS.big, steps: [TENTH] },
        { id: 'small', a: COURTS.small, steps: [TENTH], to: 'farz' },
      ],
    },
    {
      id: 'farz',
      name: 'سطح الفرز',
      courts: SORTING.map((id) => ({
        id,
        a: COURTS[id],
        steps: [TENTH],
        ask: 'rides',
        seal: true,
        ...(id === 'sortOut' ? { to: 'maraya' } : {}),
      })),
    },
    {
      id: 'maraya',
      name: 'قاعة المرايا',
      courts: [{ id: 'hall', a: COURTS.hall, steps: [TENTH], ask: 'rides', seal: true, to: 'jidar' }],
      feature: { id: 'mirror1', kind: 'mirror', forge: K1, prompt: 'ادخل المرآة' },
    },
    {
      id: 'jidar',
      name: 'سطح الجدار',
      courts: [{ id: 'two', a: COURTS.two, steps: [TENTH, HUNDREDTH], to: 'alamat' }],
      // the mirror stands beside the court it speaks about (GAME_WORLD.md « a place stands where it is used »)
      feature: { id: 'mirror2', kind: 'mirror', forge: K2, prompt: 'ادخل المرآة', beside: 'two' },
    },
    {
      id: 'alamat',
      name: 'سطح العلامات',
      courts: [
        { id: 'marksA', a: COURTS.marksA, steps: [TENTH, HALF_TENTH], seal: true },
        { id: 'marksB', a: COURTS.marksB, steps: [TENTH, HUNDREDTH, HALF_HUNDREDTH], seal: true },
        { id: 'marksOut', a: COURTS.marksOut, steps: [TENTH], to: 'aala' },
      ],
      // the dial-maker's bench of the design: the world has no such piece — the mirror is the forge's door (report)
      feature: { id: 'mirror3', kind: 'mirror', forge: K3, prompt: 'ادخل المرآة' },
    },
    { id: 'aala', name: 'السطح الأعلى', courts: [], decor: 'pavilion' },
  ],

  text: {
    subtitle: 'ساحات أصغر من بلاطة، وساحات لا تركبها أيّ علامة. افرزها، وجد العلامة الأقرب، واصعد إلى أعلى القصر.',
    say: {
      hello: `للمقياس هنا علامات من ${TENTH}: يكفي أن تمشي قليلًا. ابدأ بالساحة ${COURTS.big}.`,
      small: `ساحة مساحتها أقلّ من بلاطة واحدة: هل ضلعها أقصر من مساحتها أم أطول؟`,
      farz: 'قبل كلّ ساحة: قل ما تتوقّع، ثمّ جرّب.',
      mirror: 'هذه مرآة القاعة: فيها تكتب قاعدتك أنت، وتختبرها على ساحات سطح الفرز.',
      jidar: `ساحة صغيرة جدًّا: بلاطتان فقط. وللمقياس علامات من ${HUNDREDTH}.`,
      near: `ولا علامة من ${HUNDREDTH} تركبها: منصّة تترك شريطًا، والتي تليها تعلق. المرآة بجانبها تقترح كسورًا.`,
      alamat: `للمقياس هنا علامات جديدة: في منتصف كلّ مسافة بين علامتين.`,
      key1: `قاعدتك معك الآن. استعملها على الساحة ${COURTS.hall}.`,
      key2: 'الجدار نفسه هو الضلع، وإن لم يكتبه أيّ كسر. خذه بالمقياس، من الركن إلى الركن.',
      key3: `بقيت ساحة واحدة قبل أعلى القصر: ${COURTS.marksOut}.`,
    },
  },

  mission: {
    prompt: 'ابدأ مهمّة القصر',
    title: 'مهمّة القصر — بطاقة البنّاء',
    lead: [
      `يبني البنّاء ثلاث ساحات مربّعة مساحاتها: $${tex(MISSION.exact)}$ و $${MISSION_TEX}$ و $${MISSION.none}$ بلاطة. عرضت حاسبته لأضلاعها: $${tex(calculator(MISSION.exact))}$ و $${tex(calculator(MISSION_FRAC))}$ و $${tex(calculator(MISSION.none))}$.`,
      'اكتب الضلع بالضبط حين يكتبه عدد عشريّ أو كسر. والضلع الذي لا يكتبه أيّ عدد يقصّه البنّاء مرّتين: بالنقصان، ثمّ عند العلامة الأقرب.',
    ],
    lines: () => [
      line([slot('a1', 'الوحدات', 2), ',', slot('a2', 'الجزء العشري', 2), ':', 'ضلع الساحة الأولى']),
      line(['ضلع الساحة الثانية، كسرًا:', fractionBox('n', 'd', { w: 2 })], 'rtl'),
      line([
        slot('b1', 'الوحدات', 2),
        ',',
        slot('b2', 'الجزء العشري', 2),
        ':',
        `ضلع الثالثة بالنقصان إلى ${HUNDREDTH}`,
      ]),
      line([
        slot('c1', 'الوحدات', 2),
        ',',
        slot('c2', 'الجزء العشري', 2),
        ':',
        `ضلع الثالثة مدوَّرًا إلى ${HUNDREDTH}`,
      ]),
    ],
    /** 'ok', or a FACT of the world about the first line that does not hold yet (never « wrong »). */
    check(v) {
      const times = (x, p) => ltr(`${x} × ${x} = ${p}`);
      // the first line: the side of the first court, a decimal
      const A = typedDecimal(v.a1, v.a2);
      if (!A) return 'السطر الأوّل: اكتب الوحدات والجزء العشري.';
      const first = outcome({ q: write(A) }, MISSION.exact);
      if (first.kind === 'band')
        return `السطر الأوّل: ${times(write(A), first.covers)} — يبقى شريط من ${tiles(first.diff)} في الساحة الأولى.`;
      if (first.kind === 'jam')
        return `السطر الأوّل: ${times(write(A), first.covers)} — المنصّة تزيد على الساحة الأولى بـ ${tiles(first.diff)}.`;
      // the second line: the side of the second court, a fraction
      const F = typedFrac(v.n, v.d);
      if (F == null) return 'السطر الثاني: اكتب البسط والمقام (المقام ليس صفرًا).';
      const second = outcome({ q: F }, MISSION_FRAC);
      if (second.kind !== 'ride') {
        const prod = `$${tex(F)} \\times ${tex(F)} = ${tex(second.covers)}$`;
        return second.kind === 'band'
          ? `السطر الثاني: ${prod}، أصغر من $${MISSION_TEX}$ — يبقى شريط. الأرقام الكثيرة على الحاسبة لا تكفي للحكم.`
          : `السطر الثاني: ${prod}، أكبر من $${MISSION_TEX}$ — المنصّة تعلق.`;
      }
      // the third line: the third side by default to a hundredth
      const none = MISSION.none;
      const B = typedDecimal(v.b1, v.b2);
      if (!B) return 'السطر الثالث: اكتب الوحدات والجزء العشري.';
      if (decimalsOf(B) > 2) return `السطر الثالث: قيمة إلى ${HUNDREDTH} تُكتب بمنزلتين بعد الفاصلة على الأكثر.`;
      if (compare(square(B), none) > 0)
        return `السطر الثالث: ${times(write(B), write(square(B)))} — أكبر من ${none}: منصّته تعلق، والقيمة بالنقصان لا تتجاوز الضلع.`;
      const lo = cut(none, 2);
      if (compare(B, lo) < 0) {
        const hundred = 10n ** 2n;
        const next = write({ n: read(B).n * hundred + read(B).d, d: read(B).d * hundred });
        return `السطر الثالث: ${times(next, write(square(next)))} — ما زالت أصغر من ${none}: توجد علامة أقرب إلى نهاية الجدار.`;
      }
      // the fourth line: the rounded value to a hundredth — the middle mark decides
      const C = typedDecimal(v.c1, v.c2);
      if (!C) return 'السطر الرابع: اكتب الوحدات والجزء العشري.';
      const [hi, mid, right] = [above(none, 2), middle(none, 2), rounded(none, 2)];
      if (compare(C, lo) !== 0 && compare(C, hi) !== 0)
        return 'السطر الرابع: العلامة الأقرب واحدة من العلامتين المتجاورتين اللتين ينتهي الجدار بينهما.';
      if (compare(C, right) !== 0) {
        const m = write(square(mid));
        return compare(m, none) < 0
          ? `السطر الرابع: العلامة الوسطى ${mid}: ${times(mid, m)}، أصغر من ${none} — تترك شريطًا، فالجدار ينتهي بعد الوسطى.`
          : `السطر الرابع: العلامة الوسطى ${mid}: ${times(mid, m)}، أكبر من ${none} — تعلق، فالجدار ينتهي قبل الوسطى.`;
      }
      return 'ok';
    },
  },

  /** A court opens when the story reaches it (its lamp is lit only then). */
  courtOpen(game, c) {
    if (c.id === 'small') return Boolean(game.ridden.big);
    if (c.id === 'hall') return has(game, K1);
    // between the band and jam on neighbouring hundredths and the key: the court of two waits, the mirror calls
    if (c.id === 'two') return !(game.flags.near && !has(game, K2));
    if (c.id === 'marksB') return doneId(game, 'marksA');
    if (c.id === 'marksOut') return has(game, K3);
    return true;
  },
  /** The rod may be clamped on the wall of the court of two once he has forged that no fraction writes its side. */
  canClamp(game, c) {
    return c.id === 'two' && has(game, K2);
  },
  /** Once no mark of a hundredth rides the court of two, the rod goes back to its post: the mirror calls him. */
  release(game, c) {
    return c.id === 'two' && Boolean(game.flags.near) && !has(game, K2);
  },
  featureOpen(game, f) {
    if (f.id === 'mirror2') return Boolean(game.flags.near);
    if (f.id === 'mirror3') return doneId(game, 'marksA') && doneId(game, 'marksB');
    return true;
  },

  /** The WHOLE instruction of the moment: it stays on screen until it is done. */
  objective(game) {
    const at = game.ter[game.state.at].id;
    if (game.hold) {
      const id = game.hold.court.id;
      if (id === 'two' && has(game, K2))
        return `امشِ بالمقياس حتّى الركن الآخر للساحة ${COURTS.two}، وثبّته هناك: من الركن إلى الركن.`;
      if (id === 'marksA' || id === 'marksB')
        return 'جد علامتين متجاورتين من أدقّ علامات المقياس: منصّة الأولى تترك شريطًا، ومنصّة التي تليها تعلق.';
      if (id === 'two')
        return `امشِ وأنزل المنصّة: جد علامتين متجاورتين من ${HUNDREDTH}، منصّة الأولى تترك شريطًا ومنصّة التالية تعلق.`;
      // the sorting courts and the hall's: a court that may ride, or be closed — the world's « walk until it covers the
      // whole court » would promise what two of them never give
      if (game.hold.court.seal)
        return 'امشِ وأنزل المنصّة: إمّا أن تركب الساحة، وإمّا أن تجد علامتين متجاورتين، منصّة الأولى تترك شريطًا ومنصّة التالية تعلق.';
      return null;
    }
    if (at === 'ashar') {
      if (!game.ridden.big)
        return `للمقياس هنا علامات من ${TENTH}. أمسك المقياس عند ركن الساحة ${COURTS.big}، امشِ حتّى تغطّي المنصّة الساحة كلّها، ثمّ أنزلها.`;
      if (!game.ridden.small)
        return `والآن الساحة ${COURTS.small}: مساحتها أقلّ من بلاطة واحدة. جد المقياس الذي تركب منصّته هذه الساحة.`;
    }
    if (at === 'farz') {
      const left = SORTING.filter((id) => !doneId(game, id)).length;
      if (left)
        return `قبل أن تجرّب كلّ ساحة، قل: هل تركبها علامة من علامات المقياس؟ ثمّ جرّب حتّى تركبها منصّة، أو تجد علامتين متجاورتين: الأولى تترك شريطًا والتالية تعلق. لم تُفرز بعد: ${counted(left, COURTS_WORD)}.`;
    }
    if (at === 'maraya') {
      if (!has(game, K1))
        return 'ادخل المرآة: اكتب فيها متى تركب علامةٌ ساحةً، والمرآة تختبر ما تكتب على ساحات سطح الفرز.';
      if (!doneId(game, 'hall'))
        return `استعمل قاعدتك على الساحة ${COURTS.hall}: قل قبل أن تجرّب هل تركبها علامة، ثمّ اركبها إلى السطح التالي.`;
    }
    if (at === 'jidar') {
      if (!game.flags.near && !has(game, K2))
        return `الساحة ${tiles(COURTS.two)}. للمقياس علامات من ${TENTH} ثمّ من ${HUNDREDTH}: جد علامتين متجاورتين من ${HUNDREDTH}، الأولى تترك شريطًا والتالية تعلق.`;
      if (!has(game, K2)) return 'ادخل المرآة بجانب الساحة، تحت عمود الضوء: فيها كسور تقترب من ضلعها.';
      if (!game.ridden.two)
        return `أمسك المقياس، امشِ حتّى الركن الآخر للساحة ${COURTS.two}، وثبّته هناك: الجدار نفسه هو الضلع.`;
    }
    if (at === 'alamat') {
      if (!doneId(game, 'marksA'))
        return `للمقياس علامات من ${TENTH}، وبينها علامات من ${HALF_TENTH}. على الساحة ${COURTS.marksA}: جد علامتين متجاورتين، الأولى تترك شريطًا والتالية تعلق.`;
      if (!doneId(game, 'marksB'))
        return `والساحة ${COURTS.marksB}: علامات من ${HUNDREDTH}، وبينها علامات من ${HALF_HUNDREDTH}. جد مرّة أخرى علامتين متجاورتين، الأولى تترك شريطًا والتالية تعلق.`;
      if (!has(game, K3)) return `ادخل المرآة تحت عمود الضوء: أيّ علامة من علامات ${TENTH} أقرب إلى نهاية الجدار؟`;
      if (!game.ridden.marksOut) return `اركب الساحة ${COURTS.marksOut} لتصل إلى أعلى القصر.`;
    }
    if (at === 'aala' && !game.flags.mission) return 'ادخل الجناح تحت عمود الضوء: مهمّة القصر الأخيرة تنتظرك.';
    return null;
  },

  /** The card on the right: the facts of the place before this terrace. */
  recall(game, id) {
    if (id === 'farz') return [...lastOn(game, COURTS.big).slice(-1), ...lastOn(game, COURTS.small).slice(-1)];
    if (id === 'maraya') {
      // the five courts he sorted: the evidence the mirror tests his rule on
      const farz = terraceOf(game, 'farz');
      return (farz?.courts ?? [])
        .filter((c) => doneId(game, c.id))
        .map((c) =>
          game.ridden[c.id] ? game.T.recall.rode(c.a, game.ridden[c.id].q) : `ساحة ${c.a}: ${game.T.hud.sealed}`,
        );
    }
    if (id === 'jidar') return lastOn(game, COURTS.hall);
    if (id === 'alamat') return lastOn(game, COURTS.two);
    if (id === 'aala')
      return [COURTS.marksA, COURTS.marksB]
        .map((a) => [a, framing(game.log, a)])
        .filter(([, f]) => f)
        .map(([a, f]) => `ساحة ${a}: الجدار بين ${f.lo} و ${f.hi}`);
    return [];
  },

  onArrive(game, id, first) {
    if (!first) return;
    if (id === 'farz') game.say(game.T.say.farz, 6);
    if (id === 'maraya') game.say(game.T.say.mirror, 7);
    if (id === 'jidar') game.say(game.T.say.jidar, 7);
    if (id === 'alamat') game.say(game.T.say.alamat, 7);
  },

  /**
   * On the court of two: once a band and a jam are seen on two NEIGHBOURING marks of a hundredth, no mark of the dial
   * rides it — the world says so, takes the rod back (`release`) and lights the mirror beside it. On the first terrace:
   * the small court is announced when the big one rides.
   */
  onVerdict(game, c, row) {
    if (c.id === 'big' && row.kind === 'ride') game.say(game.T.say.small, 7);
    if (c.id !== 'two' || game.flags.near || has(game, K2) || row.s?.q == null) return;
    const f = framing(game.log, COURTS.two);
    if (f && compare(f.gap, HUNDREDTH) <= 0) {
      game.flags.near = true;
      game.audio.play('success');
      game.say(game.T.say.near, 10);
    }
  },

  /** A court of « سطح العلامات » is closed: the world names the two marks the wall ends between. */
  onSeal(game, c) {
    if (c.id !== 'marksA' && c.id !== 'marksB') return;
    const f = framing(game.log, c.a);
    if (f) game.say(`ينتهي الجدار بين العلامتين ${f.lo} و ${f.hi}، ولا علامة تركب الساحة ${c.a}.`, 8);
  },

  afterKey: {
    [K1]: (game) => game.say(game.T.say.key1, 7),
    [K2]: (game) => game.say(game.T.say.key2, 8),
    [K3]: (game) => game.say(game.T.say.key3, 6),
  },

  /** A forge he left unfinished (the page was closed in front of it) opens again: a key cannot be skipped. */
  pendingForge(game) {
    return [K1, K2, K3].find((key) => game.flags[`forge:${key}`] && !has(game, key)) ?? null;
  },
};
