/** The sentences of lesson `qasim-adad-tabii` that the kit's screens show: the names of its levels and of its real-world worlds. */
export const TEXT = {
  /** One name per level of the practice ladder, by node. */
  levels: {
    'qasim-baqi': ['سباق: أعداد صغيرة', 'سباق: الباقي والأعداد الكبيرة', 'تعاونية الواحة: أيّ صندوق؟'],
    'qasim-jidaa': ['سباق: العامل الناقص', 'سباق: اقرأ الجداء', 'تعاونية الواحة: سعة الصندوق'],
    'siyagh-mutakafia': ['سباق: مضاعف ويقبل القسمة', 'سباق: الجمل الأربع وفخاخها', 'تعاونية الواحة: أيّ طلبيّة؟'],
    'wahid-wa-nafsuh': ['سباق: 1 والعدد نفسه', 'سباق: أعداد عنيدة', 'تعاونية الواحة: الطلبيّة العنيدة'],
    exam: [
      'سباق: مراجعة شاملة',
      'تعاونية الواحة: يوم كامل',
      'قعدة الأصدقاء: القسمة بالعدل',
      'ورشة التبليط: العمل المتقن',
    ],
  },
  /** The three worlds of the real cases: its name, how an order is called there, what a right order earns, what it says while it works. */
  worlds: {
    depot: {
      name: 'تعاونية الواحة',
      order: (i, n) => `الطلبيّة ${i} من ${n}`,
      earned: 'أرباح اليوم',
      unit: 'دج',
      done: 'الشاحنة ترحل!',
    },
    share: {
      name: 'قعدة الأصدقاء',
      order: (i, n) => `القسمة ${i} من ${n}`,
      earned: 'نقاط العدل',
      unit: 'نقطة',
      done: 'قسمة عادلة: بالهناء!',
    },
    tiling: {
      name: 'ورشة التبليط',
      order: (i, n) => `الورشة ${i} من ${n}`,
      earned: 'نقاط الإتقان',
      unit: 'نقطة',
      done: 'عمل متقن!',
    },
  },
  /** The summary node of the practice hub. */
  summary: {
    icon: '🏆',
    title: 'تحدّي الامتحان',
    text: 'أسئلة من المفاتيح الأربعة معًا، بإيقاع أسرع: مراجعة ما قبل الامتحان.',
  },
  /** While a world shows what was decided. */
  busy: 'المستودع يوضّب…',
};
