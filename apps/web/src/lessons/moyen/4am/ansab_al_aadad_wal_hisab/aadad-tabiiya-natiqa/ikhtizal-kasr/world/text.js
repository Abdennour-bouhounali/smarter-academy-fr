/** The sentences of lesson `ikhtizal-kasr` that the kit's screens show: the names of its practice levels. */
export const TEXT = {
  /**
   * One name per level of the practice ladder, by node — each says what ITS waves ask (`practice.js › PRACTICE_NODES`).
   * The hub lists them before the node's key is forged: a name says the question or a place of the story, never the
   * rule nor the key's name (`practice.test.js` lists the words they must not hold).
   */
  levels: {
    'ikhtizal-marahil': ['سباق: لافتة الجسر'],
    'ghayr-qabil': ['سباق: عمود المصباح'],
    'ikhtizal-pgcd': ['سباق: لوح واحد', 'سباق: كسور أكبر'],
    'natija-mukhtazala': ['سباق: الضربتان', 'سباق: جمع وطرح'],
    exam: ['سباق: مراجعة شاملة', 'سباق: إيقاع الامتحان'],
  },
  /** The real-world worlds of the lesson's cases: none. */
  worlds: {},
  /** The summary node of the practice hub. */
  summary: {
    icon: '🏆',
    title: 'تحدّي الامتحان',
    text: 'أسئلة من المفاتيح الأربعة معًا، بإيقاع أسرع: مراجعة ما قبل الامتحان.',
  },
  busy: '',
};
