/**
 * La carte PROGRESSIVE du درس « معنى الجمع والطرح » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le manuel (content/textbook.js : نشاط 1
 * p. 25, معارف 1 p. 26, طريقة p. 29, أستعدّ p. 24) et les phrases de correction partagées avec les modules (`GUIDE`).
 * Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` — le choix de l'opération — est à DROITE.)
 *
 *                         [معنى الجمع والطرح]                       مفهوم
 *               نختار بـ ┌──────────┴──────────┐ نسمّي بـ
 *            [نجمع أم نطرح؟] (M1)          [المجموع وحدّاه] (M2)
 *              مثال │                    وفي الطرح │
 *            [ثمن الكرّاس]                [الفرق وحدّاه]
 *            والعكس │                         مثال │
 *        ⛔ [كلمة «زادت»…]              [فرق 49,5 و 18,46]
 *                                  نمثّل بـ ┌────┘
 *                         [نمثّل قبل أن نحسب] (M3)
 *                               نتحقّق بـ └──┐
 *                                  🔍 [هل النتيجة معقولة؟]
 *                                  نستخلص ┌──┘
 *                                🎯 [الخلاصة]
 */
import { ACT, KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

const { difference } = KNOWLEDGE;

export const KNOWLEDGE_GRAPH = {
  root: 'amaliya',
  nodes: [
    {
      id: 'amaliya', kind: 'concept', lane: 'center', requires: 'ikhtiyar-amaliya',
      title: 'معنى الجمع والطرح', subtitle: 'أيّ حساب أقوم به؟',
      context: { text: 'من أجل كلّ نصّ من النصوص الآتية، حدّد الحساب الواجب إجراؤه.', note: 'نختار العملية، ثم نسمّي نتيجتها وحدودها.' },
      reveals: ['qaida', 'majmu'],
    },
    {
      id: 'qaida', kind: 'relationship', lane: 'start', requires: 'ikhtiyar-amaliya', notebook: true,
      title: 'نجمع أم نطرح؟', subtitle: 'الكلّ أم الجزء؟',
      reveals: ['ex-kurras'],
    },
    {
      id: 'ex-kurras', kind: 'example', lane: 'start', requires: 'ikhtiyar-amaliya',
      title: 'ثمن الكرّاس', subtitle: '$24{,}5 + 11{,}5 = 36$',
      context: { text: ACT[1].text, note: GUIDE.lacking.why },
      reveals: ['khata-kalima'],
    },
    {
      // ⛔ خطأ شائع — نشاط 1, texte ③ : le distracteur 17,5 + 1,5 de la question 1 du module 1 et sa correction (`GUIDE`).
      id: 'khata-kalima', kind: 'common_mistake', lane: 'start', requires: 'ikhtiyar-amaliya',
      title: 'كلمة «زادت» تعني الجمع؟', subtitle: '$17{,}5 - 1{,}5 = 16$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.keyword.wrong },
          { role: 'why', text: GUIDE.keyword.why },
          { role: 'right', text: GUIDE.keyword.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'majmu', kind: 'term', lane: 'end', requires: 'majmu-hadda', notebook: true,
      title: 'المجموع وحدّاه', subtitle: 'مجموع · حدّا المجموع',
      reveals: ['farq'],
    },
    {
      id: 'farq', kind: 'term', lane: 'end', requires: 'farq-hadda', notebook: true,
      title: 'الفرق وحدّاه', subtitle: 'فرق · حدّا الفرق',
      reveals: ['ex-farq'],
    },
    {
      id: 'ex-farq', kind: 'example', lane: 'end', requires: 'farq-hadda',
      title: 'فرق 49,5 و 18,46', subtitle: '$49{,}5 - 18{,}46 = 31{,}04$',
      context: { text: difference.example.text, formula: difference.example.equality },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tamthil-aqwas', notebook: true,
      title: 'نمثّل قبل أن نحسب', subtitle: 'مخطط بأقواس',
      reveals: ['tahaqquq'],
    },
    {
      // 🔍 تحقّق — طريقة p. 29 : إيناس juge la réponse de هدى « غير معقولة » avant tout calcul.
      id: 'tahaqquq', kind: 'check', lane: 'end', requires: 'tamthil-aqwas',
      title: 'هل النتيجة معقولة؟', subtitle: 'الكلّ هو الأكبر',
      context: { text: METHOD.dialogue[0].text, note: METHOD.dialogue[4].text },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tamthil-aqwas',
      title: 'الخلاصة', subtitle: 'الكلّ ⟵ جمع · الجزء ⟵ طرح',
      context: { text: METHOD.box, note: 'نمثّل المعطيات بقطع مستقيمات: الكلّ تحت الخط والأجزاء فوقه. المجهول هو الكلّ ⟵ نجمع؛ المجهول جزء ⟵ نطرح.' },
      reveals: [],
    },
  ],
  edges: [
    { from: 'amaliya', to: 'qaida', label: 'نختار بـ' },
    { from: 'amaliya', to: 'majmu', label: 'نسمّي بـ' },
    { from: 'qaida', to: 'ex-kurras', label: 'مثال' },
    { from: 'ex-kurras', to: 'khata-kalima', label: 'والعكس' },
    { from: 'majmu', to: 'farq', label: 'وفي الطرح' },
    { from: 'farq', to: 'ex-farq', label: 'مثال' },
    { from: 'ex-farq', to: 'tariqa', label: 'نمثّل بـ' },
    { from: 'tariqa', to: 'tahaqquq', label: 'نتحقّق بـ' },
    { from: 'tahaqquq', to: 'khulasa', label: 'نستخلص' },
  ],
};
