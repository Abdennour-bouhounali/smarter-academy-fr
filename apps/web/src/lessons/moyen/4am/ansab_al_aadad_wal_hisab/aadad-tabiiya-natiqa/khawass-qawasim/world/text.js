/** The sentences of lesson `khawass-qawasim` that the kit's screens show: the names of its practice levels. */
export const TEXT = {
  /**
   * One name per level of the practice ladder, by node — each says what ITS waves ask (`practice.js › PRACTICE_NODES`;
   * `practice.test.js` reads the two together). The last key: « m = d × ؟ », first with a divisor of one digit and a
   * factor up to 12, then with a divisor of two digits (11 … 19): it is the DIVISOR that grows.
   */
  levels: {
    'jam-wal-farq': ['سباق: المجموع', 'سباق: الفرق'],
    madaaf: ['سباق: المضاعفات', 'سباق: يقبل القسمة'],
    'baqi-qisma': ['سباق: باقٍ يعرفه القاسم', 'سباق: كلّ البواقي'],
    burhan: ['سباق: أوجد العامل', 'سباق: قاسم برقمين'],
    exam: ['سباق: مراجعة شاملة', 'سباق: إيقاع الامتحان'],
  },
  /** The real-world worlds of the lesson's cases: none yet. */
  worlds: {},
  /** The summary node of the practice hub. */
  summary: {
    icon: '🏆',
    title: 'تحدّي الامتحان',
    text: 'أسئلة من المفاتيح الأربعة معًا، بإيقاع أسرع: مراجعة ما قبل الامتحان.',
  },
  busy: '',
};
