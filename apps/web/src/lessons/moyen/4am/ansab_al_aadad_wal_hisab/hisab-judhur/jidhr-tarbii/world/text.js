/** The sentences of lesson `jidhr-tarbii` that the kit's screens show: the names of its practice levels. */
import { K1, K2, K3 } from './math';

export const TEXT = {
  /**
   * One name per level of the practice ladder, by node — each says what ITS waves ask (`practice.js › PRACTICE_NODES`;
   * `practice.test.js` reads the two together). A name says a question or a place of the world, never a key's name nor
   * its rule (the hub shows a level's name once its key is held; the test lists the words it must not hold).
   */
  levels: {
    [K1]: ['سباق: ضلع الساحة', 'سباق: ساحات أكبر'],
    [K2]: ['سباق: بين عددين', 'سباق: الحاسبة والساحات'],
    [K3]: ['سباق: ابنِ وخذ', 'سباق: كسور وإشارات'],
    exam: ['سباق: مراجعة شاملة', 'سباق: إيقاع الامتحان'],
  },
  /** The real-world worlds of the lesson's cases: none. */
  worlds: {},
  /** The summary node of the practice hub. */
  summary: {
    icon: '🏆',
    title: 'تحدّي الامتحان',
    text: 'أسئلة من المفاتيح الثلاثة معًا، بإيقاع أسرع: مراجعة ما قبل الامتحان.',
  },
  busy: '',
};
