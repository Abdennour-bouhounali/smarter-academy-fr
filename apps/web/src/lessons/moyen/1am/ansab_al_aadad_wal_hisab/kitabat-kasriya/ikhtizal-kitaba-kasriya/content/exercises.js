/**
 * Les exercices du MANUEL rattachés au درس « الكتابات الكسرية لحاصل قسمة واختزال كسر » (couverture : extraction.json →
 * destinations : ex-15 … ex-27, دوري الآن ②③ p. 56, أقوّم 4–5 p. 59). Chaque exercice garde son énoncé et déclare
 * l'interaction qui le rend ; toutes les clés sont recalculées en fractions EXACTES (produit en croix, PGCD) dans
 * ./content.test.js — jamais par une règle de chiffres.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '1am_ikhtizal-kitaba-kasriya_P1',
  P2: '1am_ikhtizal-kitaba-kasriya_P2',
  P3: '1am_ikhtizal-kitaba-kasriya_P3',
};

const EQ = (f) => [`يساوي $${f}$`, `لا يساوي $${f}$`];
const T = (s) => `$${s}$`;
/** Place la bonne réponse à une position différente d'une ligne à l'autre (rotation déterministe ; le kit ne mélange pas). */
const vary = (rows) => rows.map((r, i) => {
  const n = r.options.length; const k = i % n;
  return { ...r, options: [...r.options.slice(n - k), ...r.options.slice(0, n - k)], correct: (r.correct + k) % n };
});

export const EXERCISES = [
  {
    id: 'ex-15', source: src('ex-15', 58, 'أتمرّن', 15), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'انقل وأتمم : 1) $\\frac{18}{32}=\\frac{\\ldots}{16}$ 2) $\\frac{28}{20}=\\frac{7}{\\ldots}$ 3) $\\frac{3}{8}=\\frac{24}{\\ldots}$ 4) $\\frac{3}{7}=\\frac{\\ldots}{35}$',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('\\frac{18}{32}=\\frac{\\ldots}{16}'), options: ['9', '2', '34'], correct: 0, correction: '$32\\div 2=16$ إذن $18\\div 2=9$.' },
        { label: T('\\frac{28}{20}=\\frac{7}{\\ldots}'), options: ['5', '12', '80'], correct: 0, correction: '$28\\div 4=7$ إذن $20\\div 4=5$.' },
        { label: T('\\frac{3}{8}=\\frac{24}{\\ldots}'), options: ['64', '29', '32'], correct: 0, correction: '$3\\times 8=24$ إذن $8\\times 8=64$.' },
        { label: T('\\frac{3}{7}=\\frac{\\ldots}{35}'), options: ['15', '31', '5'], correct: 0, correction: '$7\\times 5=35$ إذن $3\\times 5=15$.' },
      ]),
      explain: 'نبحث بأيّ عدد ضُرب (أو قُسم) الحدّ المعلوم، ونطبّق نفس العدد على الحدّ الآخر.',
    },
    commonError: 'إضافة نفس العدد: $\\frac{3}{7}=\\frac{31}{35}$ لأنّ $7+28=35$ — نضرب ولا نضيف.',
  },
  {
    id: 'ex-16', source: src('ex-16', 58, 'أتمرّن', 16), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'من بين الأعداد الآتية، اذكر التي تكون مساوية للكسر $\\frac{4}{5}$ : $\\frac{12}{20}$ ، 0,8 ، 1,25 ، 4,5 ، $\\frac{8}{10}$',
    interaction: 'batch',
    question: {
      rows: [
        { label: T('\\frac{12}{20}'), options: EQ('\\frac{4}{5}'), correct: 1, correction: '$\\frac{12}{20}=\\frac{3}{5}$.' },
        { label: '0,8', options: EQ('\\frac{4}{5}'), correct: 0, correction: '$\\frac{4}{5}=\\frac{8}{10}=0{,}8$.' },
        { label: '1,25', options: EQ('\\frac{4}{5}'), correct: 1, correction: '$1{,}25=\\frac{125}{100}=\\frac{5}{4}$ : البسط والمقام مقلوبان.' },
        { label: '4,5', options: EQ('\\frac{4}{5}'), correct: 1, correction: '4,5 أكبر من 1، و $\\frac{4}{5}$ أصغر من 1.' },
        { label: T('\\frac{8}{10}'), options: EQ('\\frac{4}{5}'), correct: 0, correction: '$\\frac{4\\times 2}{5\\times 2}=\\frac{8}{10}$.' },
      ],
      explain: '$\\frac{4}{5}=\\frac{8}{10}=0{,}8$ : قراءة الكسر «4 فاصلة 5» خطأ.',
    },
    commonError: 'قراءة $\\frac{4}{5}$ على أنّه 4,5.',
  },
  {
    id: 'ex-17', source: src('ex-17', 58, 'أتمرّن', 17), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'من بين حواصل القسمة الآتية، اذكر التي تكون مساوية للكسر $\\frac{8}{12}$ : $24\\div 36$ ، $24\\div 16$ ، $3\\div 2$ ، $2\\div 3$',
    interaction: 'batch',
    question: {
      rows: [
        { label: T('24\\div 36'), options: EQ('\\frac{8}{12}'), correct: 0, correction: '$\\frac{24}{36}=\\frac{24\\div 3}{36\\div 3}=\\frac{8}{12}$.' },
        { label: T('24\\div 16'), options: EQ('\\frac{8}{12}'), correct: 1, correction: '$\\frac{24}{16}=\\frac{3}{2}$ أكبر من 1.' },
        { label: T('3\\div 2'), options: EQ('\\frac{8}{12}'), correct: 1, correction: '$\\frac{3}{2}$ : البسط والمقام مقلوبان.' },
        { label: T('2\\div 3'), options: EQ('\\frac{8}{12}'), correct: 0, correction: '$\\frac{8}{12}=\\frac{8\\div 4}{12\\div 4}=\\frac{2}{3}$.' },
      ],
      explain: '$a\\div b=\\frac{a}{b}$ ، ثم نختزل: $\\frac{8}{12}=\\frac{2}{3}=\\frac{24}{36}$.',
    },
    commonError: 'الخلط بين $2\\div 3$ و $3\\div 2$.',
  },
  {
    id: 'ex-18', source: src('ex-18', 58, 'أتمرّن', 18), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'كسر واحد من بين الكسور الآتية لا يساوي الكسور الأخرى، ابحث عنه وبرّر إجابتك. 1) $\\frac{6}{10}$ 2) $\\frac{9}{15}$ 3) $\\frac{24}{40}$ 4) $\\frac{12}{20}$ 5) $\\frac{27}{35}$',
    interaction: 'choice',
    question: {
      prompt: 'الكسر المختلف هو:',
      options: [T('\\frac{24}{40}'), T('\\frac{9}{15}'), T('\\frac{27}{35}'), T('\\frac{6}{10}')],
      correct: 2, cols: 2,
      explain: 'كلها تُختزل إلى $\\frac{3}{5}$ ، إلّا $\\frac{27}{35}$ : 35 لا يقبل القسمة على 3 ولا على 9، و 27 لا يقبل القسمة على 5 ولا على 7.',
    },
    commonError: 'الحكم على الكسور ببسطها وحده.',
  },
  {
    id: 'ex-19', source: src('ex-19', 58, 'أتمرّن', 19), learningPointId: LP.P2, difficulty: 'moyen',
    statement: '1) اكتب كسرا يساوي 0,6 ومقامه 10. 2) استنتج كسرا يساوي 0,6 ومقامه 5. 3) استنتج كسرا يساوي 0,6 ومقامه 15. 4) استنتج كسرا يساوي 0,6 وبسطه 18.',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: '1) مقامه 10', options: [T('\\frac{6}{10}'), T('\\frac{0{,}6}{10}'), T('\\frac{60}{10}')], correct: 0, correction: '0,6 ستة أعشار.' },
        { label: '2) مقامه 5', options: [T('\\frac{3}{5}'), T('\\frac{1}{5}'), T('\\frac{6}{5}')], correct: 0, correction: '$\\frac{6\\div 2}{10\\div 2}=\\frac{3}{5}$.' },
        { label: '3) مقامه 15', options: [T('\\frac{9}{15}'), T('\\frac{11}{15}'), T('\\frac{6}{15}')], correct: 0, correction: '$\\frac{3\\times 3}{5\\times 3}=\\frac{9}{15}$.' },
        { label: '4) بسطه 18', options: [T('\\frac{18}{30}'), T('\\frac{18}{22}'), T('\\frac{18}{10}')], correct: 0, correction: '$\\frac{3\\times 6}{5\\times 6}=\\frac{18}{30}$.' },
      ]),
      explain: 'من $\\frac{6}{10}$ نختزل إلى $\\frac{3}{5}$ ، ثم نضرب البسط والمقام في نفس العدد.',
    },
    commonError: 'إضافة 5 إلى البسط والمقام للانتقال من المقام 10 إلى 15.',
  },
  {
    id: 'ex-20', source: src('ex-20', 58, 'أتمرّن', 20), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'اكتب كل عدد عشري على شكل كسر أبسط ما يمكن : 3,6 ، 0,20 ، 1,5 ، 4,6 ، 0,8',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: '3,6', options: [T('\\frac{18}{5}'), T('\\frac{3}{6}'), T('\\frac{36}{100}')], correct: 0, correction: '$3{,}6=\\frac{36}{10}=\\frac{18}{5}$.' },
        { label: '0,20', options: [T('\\frac{1}{5}'), T('\\frac{1}{20}'), T('\\frac{2}{100}')], correct: 0, correction: '$0{,}20=\\frac{20}{100}=\\frac{1}{5}$.' },
        { label: '1,5', options: [T('\\frac{3}{2}'), T('\\frac{1}{5}'), T('\\frac{15}{100}')], correct: 0, correction: '$1{,}5=\\frac{15}{10}=\\frac{3}{2}$.' },
        { label: '4,6', options: [T('\\frac{23}{5}'), T('\\frac{4}{6}'), T('\\frac{46}{100}')], correct: 0, correction: '$4{,}6=\\frac{46}{10}=\\frac{23}{5}$.' },
        { label: '0,8', options: [T('\\frac{4}{5}'), T('\\frac{1}{8}'), T('\\frac{8}{100}')], correct: 0, correction: '$0{,}8=\\frac{8}{10}=\\frac{4}{5}$.' },
      ]),
      explain: 'نكتب الكسر العشري (رقم بعد الفاصلة: مقامه 10؛ رقمان: 100)، ثم نختزل.',
    },
    commonError: 'قراءة 3,6 على أنّه $\\frac{3}{6}$.',
  },
  {
    id: 'ex-21', source: src('ex-21', 58, 'أتمرّن', 21), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'اختزل إلى أبسط شكل ممكن الكتابات الكسرية الآتية : 1) $\\frac{35}{25}$ 2) $\\frac{63}{36}$ 3) $\\frac{36}{28}$ 4) $\\frac{24}{36}$ 5) $\\frac{75}{45}$',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('\\frac{35}{25}'), options: [T('\\frac{7}{5}'), T('\\frac{5}{7}'), T('\\frac{7}{25}')], correct: 0, correction: '$\\frac{35\\div 5}{25\\div 5}=\\frac{7}{5}$.' },
        { label: T('\\frac{63}{36}'), options: [T('\\frac{7}{4}'), T('\\frac{4}{7}'), T('\\frac{9}{6}')], correct: 0, correction: '$6+3=9$ و $3+6=9$ : $\\frac{63\\div 9}{36\\div 9}=\\frac{7}{4}$.' },
        { label: T('\\frac{36}{28}'), options: [T('\\frac{9}{7}'), T('\\frac{7}{9}'), T('\\frac{6}{4}')], correct: 0, correction: '$\\frac{36\\div 4}{28\\div 4}=\\frac{9}{7}$.' },
        { label: T('\\frac{24}{36}'), options: [T('\\frac{2}{3}'), T('\\frac{3}{2}'), T('\\frac{4}{9}')], correct: 0, correction: '$\\frac{24\\div 12}{36\\div 12}=\\frac{2}{3}$ (مثلا ÷3 ثم ÷4).' },
        { label: T('\\frac{75}{45}'), options: [T('\\frac{5}{3}'), T('\\frac{3}{5}'), T('\\frac{15}{5}')], correct: 0, correction: '$\\frac{75\\div 15}{45\\div 15}=\\frac{5}{3}$ (÷5 ثم ÷3).' },
      ]),
      explain: 'نكرّر الاختزال حتى لا يبقى قاسم مشترك غير 1.',
    },
    commonError: 'التوقّف عند $\\frac{12}{18}$ أو $\\frac{8}{12}$ : يمكن الاختزال من جديد.',
  },
  {
    id: 'ex-22', source: src('ex-22', 58, 'أتمرّن', 22), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'اختزل إلى أبسط شكل ممكن: 1) $\\frac{25}{25}$ 2) $\\frac{13}{39}$ 3) $\\frac{16}{18}$ 4) $\\frac{64}{24}$ 5) $\\frac{24}{14}$',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('\\frac{25}{25}'), options: ['1', T('\\frac{5}{5}'), '0'], correct: 0, correction: '$\\frac{25}{25}=1$ ، و $\\frac{5}{5}$ يساوي 1 لكنه ليس أبسط شكل.' },
        { label: T('\\frac{13}{39}'), options: [T('\\frac{1}{3}'), '3', T('\\frac{1}{26}')], correct: 0, correction: '$39=13\\times 3$ : $\\frac{13\\div 13}{39\\div 13}=\\frac{1}{3}$.' },
        { label: T('\\frac{16}{18}'), options: [T('\\frac{8}{9}'), T('\\frac{9}{8}'), T('\\frac{4}{6}')], correct: 0, correction: '$\\frac{16\\div 2}{18\\div 2}=\\frac{8}{9}$.' },
        { label: T('\\frac{64}{24}'), options: [T('\\frac{8}{3}'), T('\\frac{3}{8}'), T('\\frac{16}{3}')], correct: 0, correction: '$\\frac{64\\div 8}{24\\div 8}=\\frac{8}{3}$.' },
        { label: T('\\frac{24}{14}'), options: [T('\\frac{12}{7}'), T('\\frac{7}{12}'), T('\\frac{6}{7}')], correct: 0, correction: '$\\frac{24\\div 2}{14\\div 2}=\\frac{12}{7}$.' },
      ]),
      explain: 'كسر بسطه يساوي مقامه يساوي 1 ؛ وحين يكون المقام مضاعفًا للبسط نقسم على البسط.',
    },
    commonError: 'ترك $\\frac{25}{25}$ أو كتابة 0 بدل 1.',
  },
  {
    id: 'ex-23', source: src('ex-23', 58, 'أتمرّن', 23), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'اختزل إلى أبسط شكل ممكن: 1) $\\frac{2{,}5}{0{,}5}$ 2) $\\frac{6{,}4}{0{,}4}$ 3) $\\frac{6{,}5}{2{,}5}$ 4) $\\frac{3{,}2}{0{,}1}$ 5) $\\frac{5{,}6}{1{,}2}$',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('\\frac{2{,}5}{0{,}5}'), options: ['5', '0,5', T('\\frac{1}{5}')], correct: 0, correction: '$\\frac{2{,}5\\times 10}{0{,}5\\times 10}=\\frac{25}{5}=5$.' },
        { label: T('\\frac{6{,}4}{0{,}4}'), options: ['16', '1,6', '64'], correct: 0, correction: '$\\frac{64}{4}=16$.' },
        { label: T('\\frac{6{,}5}{2{,}5}'), options: [T('\\frac{13}{5}'), T('\\frac{5}{13}'), '26'], correct: 0, correction: '$\\frac{65}{25}=\\frac{65\\div 5}{25\\div 5}=\\frac{13}{5}$.' },
        { label: T('\\frac{3{,}2}{0{,}1}'), options: ['32', '0,32', '3,2'], correct: 0, correction: '$\\frac{32}{1}=32$.' },
        { label: T('\\frac{5{,}6}{1{,}2}'), options: [T('\\frac{14}{3}'), T('\\frac{3}{14}'), T('\\frac{7}{2}')], correct: 0, correction: '$\\frac{56}{12}=\\frac{56\\div 4}{12\\div 4}=\\frac{14}{3}$.' },
      ]),
      explain: 'نضرب البسط والمقام في 10 لنحصل على أعداد طبيعية، ثم نختزل.',
    },
    commonError: 'ضرب البسط وحده في 10.',
  },
  {
    id: 'ex-24', source: src('ex-24', 58, 'أتمرّن', 24), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'إليك الأعداد الطبيعية الآتية : 81 ، 111 ، 142 ، 153 ، 300 ، 675 ، 1211 ، 65808 – اذكر من بينها التي: 1) تقبل القسمة على 2. 2) تقبل القسمة على 3. 3) تقبل القسمة على 4. 4) تقبل القسمة على 5. 5) تقبل القسمة على 9. 6) تقبل القسمة على 10.',
    interaction: 'batch',
    question: {
      prompt: 'القسمة على 3 وعلى 9 (الأكثر استعمالًا في الاختزال):',
      rows: [
        { label: '81', options: ['على 3 وعلى 9', 'على 3 فقط', 'لا على 3 ولا على 9'], correct: 0, correction: '$8+1=9$.' },
        { label: '111', options: ['على 3 وعلى 9', 'على 3 فقط', 'لا على 3 ولا على 9'], correct: 1, correction: '$1+1+1=3$.' },
        { label: '142', options: ['على 3 وعلى 9', 'على 3 فقط', 'لا على 3 ولا على 9'], correct: 2, correction: '$1+4+2=7$.' },
        { label: '153', options: ['على 3 وعلى 9', 'على 3 فقط', 'لا على 3 ولا على 9'], correct: 0, correction: '$1+5+3=9$.' },
        { label: '1211', options: ['على 3 وعلى 9', 'على 3 فقط', 'لا على 3 ولا على 9'], correct: 2, correction: '$1+2+1+1=5$.' },
        { label: '65808', options: ['على 3 وعلى 9', 'على 3 فقط', 'لا على 3 ولا على 9'], correct: 0, correction: '$6+5+8+0+8=27$.' },
      ],
      explain: 'وعلى 2: 142 ، 300 ، 65808 ؛ على 4: 300 ، 65808 ؛ على 5: 300 ، 675 ؛ على 10: 300.',
    },
    commonError: 'الحكم على القسمة على 3 برقم الآحاد (111 و 1211 ينتهيان بـ 1).',
  },
  {
    id: 'ex-25', source: src('ex-25', 58, 'أتمرّن', 25), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'باستعمال قواعد قابلية القسمة، اختزل الكسور الآتية: $\\frac{198}{495}$ ، $\\frac{135}{105}$ ، $\\frac{84}{63}$',
    interaction: 'batch',
    question: {
      prompt: 'أبسط شكل ممكن:',
      rows: vary([
        { label: T('\\frac{198}{495}'), options: [T('\\frac{2}{5}'), T('\\frac{22}{55}'), T('\\frac{5}{2}')], correct: 0, correction: '$1+9+8=18$ و $4+9+5=18$ : ÷9 تعطي $\\frac{22}{55}$ ، ثم ÷11 (جداول الضرب): $\\frac{2}{5}$.' },
        { label: T('\\frac{135}{105}'), options: [T('\\frac{9}{7}'), T('\\frac{27}{21}'), T('\\frac{7}{9}')], correct: 0, correction: 'رقم الآحاد 5: ÷5 تعطي $\\frac{27}{21}$ ، ثم ÷3: $\\frac{9}{7}$.' },
        { label: T('\\frac{84}{63}'), options: [T('\\frac{4}{3}'), T('\\frac{28}{21}'), T('\\frac{3}{4}')], correct: 0, correction: '$8+4=12$ و $6+3=9$ : ÷3 تعطي $\\frac{28}{21}$ ، ثم ÷7: $\\frac{4}{3}$.' },
      ]),
      explain: 'كسر مساوٍ لكن غير مختزل نهائيًا ($\\frac{22}{55}$) ليس أبسط شكل ممكن: نتابع الاختزال.',
    },
    commonError: 'التوقّف بعد الاختزال الأوّل.',
  },
  {
    id: 'ex-26', source: src('ex-26', 58, 'أتمرّن', 26), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'تحقق أنّ : $\\frac{414}{391}=\\frac{18}{17}$',
    interaction: 'choice',
    question: {
      prompt: 'بأيّ عدد نقسم البسط والمقام لنمرّ من $\\frac{414}{391}$ إلى $\\frac{18}{17}$؟',
      options: ['9', '17', '23', '3'], correct: 2, cols: 2,
      explain: '$18\\times 23=414$ و $17\\times 23=391$ : $\\frac{414\\div 23}{391\\div 23}=\\frac{18}{17}$. لا تكشف قواعد قابلية القسمة القاسم 23.',
    },
    commonError: 'الحكم بأنّ $\\frac{414}{391}$ لا يُختزل لأنّ 391 لا يقبل القسمة على 2 ، 3 ، 5 ، 9.',
  },
  {
    id: 'ex-27', source: src('ex-27', 58, 'أتمرّن', 27), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'سأل الأستاذ التلاميذ «هل العدد 91 يقبل قاسما محصورا بين 2 و 10؟». – سامي: لا. حسب قواعد قابلية القسمة، 91 ليس له قاسم. – فاطمة: نعم. وجدت قاسما. من منهما على صواب؟',
    interaction: 'choice',
    question: {
      options: ['سامي: 91 لا يقبل القسمة على 2 ، 3 ، 4 ، 5 ، 9', 'فاطمة: $91=7\\times 13$', 'لا أحد منهما: 91 يقبل القسمة على 3'],
      correct: 1, cols: 1,
      explain: 'قواعد قابلية القسمة لا تخصّ 7: $91=7\\times 13$ ، فـ 7 قاسم محصور بين 2 و 10.',
    },
    commonError: '«لا تنطبق أيّ قاعدة إذن لا يوجد قاسم».',
  },
  {
    id: 'now-56', source: src('now-56', 56, 'دوري الآن'), learningPointId: LP.P3, difficulty: 'facile',
    statement: '② أُنقل وأتمم : $\\frac{24}{56}=\\frac{3\\times 8}{7\\times\\ldots}=\\frac{3}{\\ldots}$ ؛ $\\frac{25}{45}=\\frac{5\\times 5}{\\ldots\\times 5}=\\frac{5}{\\ldots}$ ③ اختزل كلا من الكسور الآتية: $\\frac{32}{56}$ ، $\\frac{44}{33}$ ، $\\frac{14}{21}$ ، $\\frac{8}{10}$ ، $\\frac{21}{14}$',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('\\frac{24}{56}=\\frac{3}{\\ldots}'), options: ['7', '8', '32'], correct: 0, correction: '$\\frac{3\\times 8}{7\\times 8}=\\frac{3}{7}$.' },
        { label: T('\\frac{25}{45}=\\frac{5}{\\ldots}'), options: ['9', '5', '40'], correct: 0, correction: '$\\frac{5\\times 5}{9\\times 5}=\\frac{5}{9}$.' },
        { label: T('\\frac{32}{56}'), options: [T('\\frac{4}{7}'), T('\\frac{7}{4}'), T('\\frac{8}{14}')], correct: 0, correction: '$\\frac{32\\div 8}{56\\div 8}=\\frac{4}{7}$.' },
        { label: T('\\frac{44}{33}'), options: [T('\\frac{4}{3}'), T('\\frac{3}{4}'), T('\\frac{4}{33}')], correct: 0, correction: '$\\frac{44\\div 11}{33\\div 11}=\\frac{4}{3}$.' },
        { label: T('\\frac{14}{21}'), options: [T('\\frac{2}{3}'), T('\\frac{3}{2}'), T('\\frac{7}{3}')], correct: 0, correction: '$\\frac{14\\div 7}{21\\div 7}=\\frac{2}{3}$.' },
        { label: T('\\frac{8}{10}'), options: [T('\\frac{4}{5}'), T('\\frac{5}{4}'), T('\\frac{2}{5}')], correct: 0, correction: '$\\frac{8\\div 2}{10\\div 2}=\\frac{4}{5}$.' },
        { label: T('\\frac{21}{14}'), options: [T('\\frac{3}{2}'), T('\\frac{2}{3}'), T('\\frac{7}{2}')], correct: 0, correction: '$\\frac{21\\div 7}{14\\div 7}=\\frac{3}{2}$.' },
      ]),
      explain: 'نقسم البسط والمقام على نفس القاسم المشترك.',
    },
    commonError: 'قلب الكسر عند الاختزال ($\\frac{21}{14}=\\frac{2}{3}$).',
  },
];

/** « أقوّم تعلّماتي » 4 et 5 (p. 59) — repris dans le إختبار أولي (module 9). */
export const SELF = {
  4: { source: src('self-4', 59, 'أقوّم تعلّماتي', 4), fraction: [12, 16] },
  5: { source: src('self-5', 59, 'أقوّم تعلّماتي', 5), fraction: [44, 24] },
};

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
