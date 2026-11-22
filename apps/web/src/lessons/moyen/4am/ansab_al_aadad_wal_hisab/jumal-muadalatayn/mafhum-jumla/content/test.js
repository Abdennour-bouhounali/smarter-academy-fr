/**
 * Le TEST FINAL (module 7 « إختبار أولي ») — E1 à E4 écrits par la PLATEFORME (prompt §12.12 : l'indépendance du manuel atteint le test ; dessin §7) :
 * les ids, les compétences et les LP des QCM du manuel (content/textbook.js › QCM, source) sont gardés ; chaque option est VÉRIFIÉE par
 * content/mission.test.js (une seule bonne réponse par question : `check`). E5 et E6 sont de la plateforme depuis toujours.
 */
import { src } from '../../_unit/unitMeta.js';

const REWRITE = { part: 'بأعداد المنصّة' };
const QCM_SRC = (n) => ({ ...src('qcm', 62, 'أؤكّد تعلّماتي', n), ...REWRITE });

export const TEST_ITEMS = {
  E1: {
    source: QCM_SRC(1),
    text: 'المعادلة $5y + 2 = x$ هي معادلة من الدرجة الأولى ...',
    options: ['ذات المجهول $x$ .', 'ذات المجهولين $x$ و $y$ .', 'ذات المجهول $y$ .'],
    correct: 1,
    explain: 'في المعادلة $5y + 2 = x$ مجهولان، $x$ و $y$ ، كلاهما من الدرجة الأولى: تُكتب $x - 5y = 2$ ، من الشكل $ax + by = c$ مع $a = 1$ و $b = -5$ و $c = 2$.',
  },
  E2: {
    source: QCM_SRC(2),
    text: 'الثنائية $(1 ; 1)$ حلّ للمعادلة ...',
    options: ['$2x - y = 1$ فقط', '$2x - y = 1$ و $x + 3y = 4$', '$x + 3y = 4$ و $3x - y = 1$', 'المعادلات الثلاث'],
    correct: 1,
    // la vérité, recalculée : (1 ; 1) dans chaque équation ; chaque option = l'ensemble des équations qu'elle déclare vérifiées
    check: { pair: [1, 1], eqs: ['2x-y=1', 'x+3y=4', '3x-y=1'], options: [[0], [0, 1], [1, 2], [0, 1, 2]] },
    explain: 'من أجل $x = 1$ و $y = 1$ : $2 \\times 1 - 1 = 1$ و $1 + 3 \\times 1 = 4$ ، أمّا $3 \\times 1 - 1 = 2 \\neq 1$ .',
  },
  E3: {
    source: QCM_SRC(3),
    text: 'الثنائية $\\left(\\dfrac{1}{2} ; \\dfrac{3}{2}\\right)$ حلّ للمعادلة ...',
    options: ['$x + y = 2$', '$2x - y = 0$', '$4x - 2y = 1$'],
    correct: 0,
    check: { pair: ['1/2', '3/2'], eqs: ['x+y=2', '2x-y=0', '4x-2y=1'] },
    explain: '$\\dfrac{1}{2} + \\dfrac{3}{2} = 2$ ؛ أمّا $2 \\times \\dfrac{1}{2} - \\dfrac{3}{2} = -\\dfrac{1}{2} \\neq 0$ و $4 \\times \\dfrac{1}{2} - 2 \\times \\dfrac{3}{2} = -1 \\neq 1$ .',
  },
  E4: {
    source: QCM_SRC(4),
    text: 'الجملة $\\begin{cases} 3u + v = 7 \\\\ u - 2v = 0 \\end{cases}$ ...',
    options: ['هي جملة معادلتين ذات مجهول واحد.', 'ليست جملة معادلتين من الدرجة الأولى.', 'هي جملة معادلتين من الدرجة الأولى ذات المجهولين $u$ و $v$ .'],
    correct: 2,
    explain: 'المجهولان هنا $u$ و $v$ (اسماهما لا يهمّان)، وكل معادلة من الشكل $\\alpha u + \\beta v = \\gamma$ : جملة معادلتين من الدرجة الأولى بمجهولين.',
  },
};
