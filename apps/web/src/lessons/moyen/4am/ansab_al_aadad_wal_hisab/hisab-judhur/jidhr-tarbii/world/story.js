/**
 * THE STORY of lesson `jidhr-tarbii` in the world « قصر الساحات » (`gameworld/rootCourts/Game.js` plays it; its design:
 * `docs/reports/ROOTS_WORLD_PLAN.md` §5). No rule is told: each key is forged by the student in its own forge.
 *
 *   السطح الأوّل     a court of 30 tiles: 5 leaves a band, 6 jams — no rod of whole tiles rides it. Beside it, a court of 16.
 *   سطح النخيل       a court of 36.
 *   سطح الريح        a court of 100.
 *   قاعة المرايا     the mirror: forge 1 (what makes a platform ride). Then a court of 49 flies him BACK to the first terrace.
 *   السطح الأوّل     the court of 30 again: the rod's dial has finer marks, and a calculator stands there — forge 2. Then
 *                    the rod is clamped on the wall, corner to corner: it rides.
 *   سطح الورشتين     the two stations: forge 3. Then a court of 196.
 *   السطح الأعلى     the pavilion: the lesson's FINAL MISSION (`mission`), then the end.
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { line } from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { ltr } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { outcome } from '../../../../../../common/gameworld/rootCourts/logic';
import { tiles } from '../../../../../../common/gameworld/rootCourts/strings';

const KEY1 = 'dil-as-saha';
const KEY2 = 'qima-madbuta';
const KEY3 = 'dhahab-wa-iyab';
/** The ONE place that holds the lesson's numbers: the courts, and the calculator's ten digits for the side of the first one. */
export const COURTS = {
  first: '30', // no whole rod rides it: 5 leaves a band, 6 jams
  small: '16', // beside it on the first terrace
  palm: '36', // سطح النخيل
  wind: '100', // سطح الريح, after the course of gates
  back: '49', // the hall of mirrors: it flies him back
  last: '196', // سطح الورشتين
};
/** The crates of the building yard, in order: each makes a whole square. */
export const YARD = ['9', '25'];
/** The longest rod of two decimals that still leaves a band on the first court: the nearest its marks can do. */
export const NEAREST = String(Math.floor(Math.sqrt(Number(COURTS.first)) * 100) / 100).replace('.', ',');
/**
 * THE FINAL MISSION — it needs the three keys: a court whose side is a whole number he must FIND (🔑: 43, by squares he
 * tries), a garden whose side has no whole value (✍️: between 43 and 44), and the square of that side, which asks no
 * calculation at all (🔁: it is the area). Its numbers are no court's of the story and no headline of the bank.
 */
export const MISSION = { feast: 1849, garden: 1900 };
export const CALCULATOR = '5,477225575';

const has = (game, key) => game.state.keys.includes(key);
const yardDone = (game) => (game.flags['yard:awwal'] ?? 0) >= YARD.length;
/** What he did on a court, as lines for the card « من الساحة السابقة »: the newest two platforms. */
const lastOn = (game, area) =>
  game.log
    .filter((row) => row.a === area && !row.mirror)
    .slice(-2)
    .map((row) => {
      const s = row.s.root ? game.T.hud.wall : row.s.q;
      const out = outcome(row.s, row.a);
      if (out.kind === 'ride') return game.T.recall.rode(row.a, s);
      return out.kind === 'band' ? game.T.recall.band(row.a, s, out.diff) : game.T.recall.jam(row.a, s, out.diff);
    });

/**
 * The terraces stand in ONE line, in the order he meets them, on the axis that goes INTO the screen: the next one is
 * ahead of him, as the islands of the first world are (owner, 2026-11-21). The WORLD places them (`Game.layout`): the
 * story writes no coordinate — a coordinate here would be read as one of the lesson's numbers by the bank checks.
 */
export const STORY = {
  end: 'aala',
  terraces: [
    {
      id: 'awwal',
      name: 'السطح الأوّل',
      courts: [
        { id: 'c30', a: COURTS.first, to: 'warshatan' },
        { id: 'c16', a: COURTS.small, to: 'nakhil', hide: true }, // nobody wrote its area: the count will
      ],
      // the opening: two crates of tiles he lays as squares — from the number of tiles to the side (the root's own gesture)
      yard: { crates: YARD },
      feature: {
        id: 'calc',
        kind: 'calculator',
        beside: 'c30', // it stands by the court it is asked about
        forge: KEY2,
        prompt: 'انظر ما تعرضه الحاسبة',
        screen: CALCULATOR,
      },
    },
    { id: 'nakhil', name: 'سطح النخيل', courts: [{ id: 'c36', a: COURTS.palm, to: 'rih', hide: true }] },
    {
      id: 'rih',
      name: 'سطح الريح',
      courts: [{ id: 'c100', a: COURTS.wind, to: 'maraya', hide: true }],
      feature: { id: 'run', kind: 'run', prompt: 'ادخل سباق المربّعات' },
    },
    {
      id: 'maraya',
      name: 'قاعة المرايا',
      courts: [{ id: 'c49', a: COURTS.back, to: 'awwal' }],
      feature: { id: 'mirror', kind: 'mirror', forge: KEY1, prompt: 'ادخل المرآة' },
    },
    {
      id: 'warshatan',
      name: 'سطح الورشتين',
      courts: [{ id: 'c196', a: COURTS.last, to: 'aala' }],
      feature: {
        id: 'stations',
        kind: 'stations',
        forge: KEY3,
        prompt: 'شغّل الورشتين',
        names: ['ابنِ ساحة', 'خذ الضلع'],
      },
    },
    { id: 'aala', name: 'السطح الأعلى', courts: [], decor: 'pavilion' },
  ],

  text: {
    subtitle:
      'في كلّ سطح ساحة مربّعة مساحتها مكتوبة على بابها. اسحب المقياس، ابنِ المنصّة، واركب المصعد إلى أعلى القصر.',
    say: {
      hello: 'في هذا الصندوق بلاطات. أمسك المقياس عند الركن وامشِ: البلاطات تُفرش مربّعًا.',
      yardNext: 'صندوق آخر، فيه بلاطات أكثر.',
      yardDone: 'كلّ صندوق صار ساحة مربّعة. والآن الساحة الكبيرة: مساحتها مكتوبة، وضلعها مجهول.',
      near: `أحسنت! ${NEAREST} هو أطول مقياس بعلامات المقياس يترك شريطًا: لا علامة أقرب من هذه. لنسأل الحاسبة — هناك، تحت عمود الضوء.`,
      stuck: 'بمقياس أقصر بقي شريط، وبمقياس أطول علقت المنصّة. لنجرّب الساحة الصغيرة بجانبها.',
      mirror: 'هذه مرآة القاعة: فيها تكتب قاعدتك أنت.',
      key1: 'قاعدتك معك الآن. استعملها على هذه الساحة لنعود إلى السطح الأوّل.',
      back: 'عدنا إلى الساحة 30. للمقياس الآن علامات أدقّ.',
      key2: 'الجدار نفسه هو الطول الذي نبحث عنه. خذه بالمقياس، من الركن إلى الركن.',
      key3: 'بقيت ساحة واحدة قبل أعلى القصر.',
    },
  },

  mission: {
    prompt: 'ابدأ مهمّة القصر',
    title: 'مهمّة القصر — ساحة الاحتفال',
    lead: [
      `لساحة الاحتفال المربّعة ${tiles(String(MISSION.feast))}، كلّها مفروشة. بجانبها حديقة مربّعة مساحتها ${tiles(String(MISSION.garden))}.`,
      'أتمم بطاقة البنّاء: هو لا يملك حاسبة.',
    ],
    lines: () => [
      line(['ضلع ساحة الاحتفال، بالبلاطات:', slot('side', 'ضلع ساحة الاحتفال', 2)], 'rtl'),
      line(['ضلع الحديقة أكبر من العدد الطبيعي:', slot('low', 'الحدّ الأصغر', 2)], 'rtl'),
      line(['وأصغر من العدد الطبيعي الموالي:', slot('high', 'الحدّ الأكبر', 2)], 'rtl'),
      line(['مربّع ضلع الحديقة، بالبلاطات:', slot('sq', 'مربّع ضلع الحديقة', 4)], 'rtl'),
    ],
    /** 'ok', or a FACT of the world about the first line that does not hold yet. */
    check(v) {
      const n = (x) => Number(String(x ?? '').trim());
      const [side, low, high, sq] = [n(v.side), n(v.low), n(v.high), n(v.sq)];
      const times = (x) => ltr(`${x} × ${x} = ${x * x}`);
      const feast = outcome({ q: String(side) }, String(MISSION.feast));
      if (feast.kind === 'band')
        return `السطر الأوّل: ${times(side)} — يبقى شريط من ${tiles(feast.diff)} في ساحة الاحتفال.`;
      if (feast.kind === 'jam')
        return `السطر الأوّل: ${times(side)} — المنصّة تزيد على ساحة الاحتفال بـ ${tiles(feast.diff)}.`;
      if (low * low >= MISSION.garden) return `السطر الثاني: ${times(low)} — ليس أصغر من ${MISSION.garden}.`;
      if (high * high <= MISSION.garden) return `السطر الثالث: ${times(high)} — ليس أكبر من ${MISSION.garden}.`;
      if (high !== low + 1) return `بين ${low} و ${high} أعداد طبيعية أخرى: قرّب الحدّين حتّى يتواليا.`;
      if (sq !== MISSION.garden) return 'السطر الرابع: ضلع الحديقة هو الطول الذي مربّعه مساحتها.';
      return 'ok';
    },
  },

  /** A court opens when the story reaches it. */
  courtOpen(game, c) {
    // the first court has shown what it had to show: it waits (its lamp goes out) until he comes back with his first key
    if (c.id === 'c30') {
      // closed while he is sent elsewhere: to the small court (stuck), then to the calculator (the nearest mark found)
      if (has(game, KEY1) && !has(game, KEY2) && game.flags.near) return false;
      return yardDone(game) && (!game.flags.stuck || has(game, KEY1));
    }
    if (c.id === 'c16') return Boolean(game.flags.stuck || game.flags['c30:band'] || game.flags['c30:jam']); // one platform on 30 is enough to leave it
    if (c.id === 'c100') return Boolean(game.flags.run); // the course of gates comes first
    if (c.id === 'c49') return has(game, KEY1);
    if (c.id === 'c196') return has(game, KEY3);
    return true;
  },
  /** The dial of the first court gets finer marks once he comes back with his first key. */
  stepsOf(game, c) {
    return c.id === 'c30' && has(game, KEY1) ? ['1', '0,1', '0,01'] : c.steps;
  },
  /** The rod may be clamped on the wall of the first court once he has seen that no number rides it. */
  canClamp(game, c) {
    return c.id === 'c30' && has(game, KEY2);
  },
  /** Once a band AND a jam are seen on the first court, the rod goes back to its post: he is sent to the small court. */
  release(game, c) {
    if (c.id !== 'c30') return false;
    if (has(game, KEY1) && !has(game, KEY2)) return Boolean(game.flags.near); // the nearest mark is found: to the calculator
    return Boolean(game.flags.stuck) && !has(game, KEY1);
  },
  featureOpen(game, f) {
    // he is back from the hall of mirrors AND has found the nearest mark of the rod: the calculator calls him
    if (f.id === 'calc') return has(game, KEY1) && Boolean(game.ridden.c49) && Boolean(game.flags.near);
    if (f.id === 'run') return !game.flags.run;
    if (f.id === 'stations') return has(game, KEY2);
    return true;
  },

  /** The WHOLE instruction of the moment: it stays on screen until it is done. */
  objective(game) {
    const at = game.ter[game.state.at].id;
    const first = COURTS.first;
    if (game.hold) {
      // the rod in his hand: the world's own instruction (walk, then lower) — except when the wall itself is to be taken
      if (game.hold.court.id === 'c30' && has(game, KEY2))
        return `امشِ بالمقياس حتّى الركن الآخر للساحة ${first}، وثبّته هناك: من الركن إلى الركن.`;
      return null;
    }
    if (at === 'awwal') {
      if (!yardDone(game)) {
        const crate = YARD[game.flags['yard:awwal'] ?? 0];
        return `في الصندوق ${tiles(crate)}. خذ المقياس عند ركن الورشة، وافرشها ساحة مربّعة: لا بلاطة تبقى، ولا خانة تنقص.`;
      }
      if (!has(game, KEY1)) {
        if (!game.flags.stuck && (game.flags['c30:band'] || game.flags['c30:jam']))
          return `جرّب مقياسًا آخر على الساحة ${first}، أو اذهب إلى الساحة الصغيرة بجانبها: لا أحد كتب مساحتها بعد.`;
        if (!game.flags.stuck)
          return `الساحة الكبيرة مساحتها ${tiles(first)}. أمسك المقياس عند ركنها، امشِ حتّى تغطّي المنصّة الساحة كلّها، ثمّ أنزلها.`;
        return `لا مقياس من مقاييسك ركب الساحة ${first}. اذهب إلى الساحة الصغيرة بجانبها (مصباحها مضيء): لا أحد كتب مساحتها بعد.`;
      }
      if (!has(game, KEY2))
        return game.flags.near
          ? 'اذهب إلى الحاسبة تحت عمود الضوء، وانظر ما تعرضه.'
          : `الساحة ${first} ما زالت تنتظر. للمقياس الآن علامات أدقّ (0,1 ثمّ 0,01): ابحث عن أطول مقياس ما زال يترك شريطًا.`;
      if (!game.ridden.c30)
        return `أمسك المقياس، امشِ حتّى الركن الآخر للساحة ${first}، وثبّته هناك: من الركن إلى الركن.`;
    }
    if (at === 'rih' && !game.flags.run) return 'قبل الساحة الكبيرة: ادخل بوّابة الضوء، واعبر سباق المربّعات.';
    if (at === 'maraya') {
      if (!has(game, KEY1)) return 'ادخل مرآة القاعة: فيها تكتب قاعدتك، والمرآة تختبرها.';
      if (!game.ridden.c49)
        return `استعمل قاعدتك: اركب الساحة التي مساحتها ${tiles(COURTS.back)} لتعود إلى السطح الأوّل.`;
    }
    if (at === 'aala' && !game.flags.mission) return 'ادخل الجناح تحت عمود الضوء: مهمّة القصر الأخيرة تنتظرك.';
    if (at === 'warshatan') {
      if (!has(game, KEY3)) return 'في هذا السطح ورشتان. اذهب إليهما وشغّلهما.';
      if (!game.ridden.c196) return `اركب الساحة التي مساحتها ${tiles(COURTS.last)} لتصل إلى أعلى القصر.`;
    }
    return null;
  },

  /** The card on the right: what he did on the court before this terrace. */
  recall(game, id) {
    const before = {
      nakhil: COURTS.small,
      rih: COURTS.palm,
      maraya: COURTS.wind,
      warshatan: COURTS.first,
      aala: COURTS.last,
    };
    if (id === 'awwal' && has(game, KEY1)) return lastOn(game, COURTS.back);
    return before[id] ? lastOn(game, before[id]) : [];
  },

  onArrive(game, id, first) {
    if (id === 'maraya' && first) game.say(game.T.say.mirror, 6);
    if (id === 'awwal' && has(game, KEY1) && !game.flags.back) {
      game.flags.back = true;
      game.say(game.T.say.back, 7);
      game.refreshObjective();
    }
  },

  /** A crate became a square: the next crate, or — after the last — the court whose side nobody wrote. */
  onYard(game, y) {
    game.say(y.finished ? game.T.say.yardDone : game.T.say.yardNext, 7);
  },

  /** On the first court, a band AND a jam with whole rods: nothing whole rides it — the small court opens. */
  onVerdict(game, c, row) {
    // back on the first court with the fine marks: the longest rod of two decimals that still leaves a band is the
    // nearest the rod can do — the world says so, takes the rod back (`release`) and lights the calculator
    if (c.id === 'c30' && has(game, KEY1) && !has(game, KEY2) && !game.flags.near && row.s.q === NEAREST) {
      game.flags.near = true;
      game.audio.play('success');
      game.say(game.T.say.near, 10);
      return;
    }
    if (c.id !== 'c30' || game.flags.stuck) return;
    game.flags[`c30:${row.kind}`] = true;
    if (game.flags['c30:band'] && game.flags['c30:jam']) {
      game.flags.stuck = true;
      game.say(game.T.say.stuck, 8);
    }
  },

  afterKey: {
    [KEY1]: (game) => game.say(game.T.say.key1, 7),
    [KEY2]: (game) => game.say(game.T.say.key2, 8),
    [KEY3]: (game) => game.say(game.T.say.key3, 6),
  },

  /** A forge he left unfinished (the page was closed in front of it) opens again: a key cannot be skipped. */
  pendingForge(game) {
    return [KEY1, KEY2, KEY3].find((key) => game.flags[`forge:${key}`] && !has(game, key)) ?? null;
  },
};
