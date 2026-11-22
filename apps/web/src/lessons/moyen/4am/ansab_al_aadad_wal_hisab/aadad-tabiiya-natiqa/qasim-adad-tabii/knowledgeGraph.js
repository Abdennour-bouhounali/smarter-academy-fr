/**
 * La carte PROGRESSIVE du درس 1 — la LEÇON DE RÉFÉRENCE (le prototype
 * approuvé le 2026-09-29, sur lequel les huit autres leçons ont été migrées) ;
 * docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon —
 * le manuel (content/textbook.js : معارف 1 p. 10, نشاط 1 p. 8, أستعدّ p. 7),
 * les exercices et leurs `method`/`commonError` (content/exercises.js), les
 * questions des محاور et leurs corrections. Chaque nœud est gardé par l'item
 * de knowledge.jsx qui l'établit (`requires`) : la carte progressive ne
 * montre jamais plus que la carte cumulative.
 * `notebook: true` : le nœud EST cet item (« أضف إلى كرّاسي » l'envoie) ;
 * les autres en dépendent seulement.
 *
 * DEUX FAMILLES de nœuds (nodeKinds.js) :
 *   core   ce qu'il faut SAVOIR — مفهوم, تعريف, مثال, مصطلحات, للحفظ ;
 *   guide  ce qui ACCOMPAGNE — تذكّر, تحقّق, خطأ شائع, انتبه, خلاصة —
 *          accroché à la connaissance qu'il éclaire, jamais à la racine.
 * Pas de « نصيحة » : le seul candidat de la leçon (exercice 2 : « قابلية
 * القسمة على 6 = على 2 وعلى 3 ») relève des خواص القواسم, que teachingScope
 * exclut (الدرس 3).
 *
 * (Schéma en ordre de lecture LTR ; sous RTL le couloir `start` — بالباقي —
 * est à DROITE.)
 *
 *                       [قاسم عدد طبيعي]                       مفهوم
 *                   معناه ┌─────┴─────┐ معناه
 *                  [بالباقي] ─ ─ ─ ─ ▶ [بالجداء]                تعريفان
 *                 تذكّر │   نفس الفكرة   │ مثال
 *          📌 [القسمة الإقليدية]        [120 و 6]
 *            باقٍ معدوم │         ┆    │ خطأ شائع
 *                 [143 و 11]     ┆  ⛔ [قاسم واحد فقط؟]
 *        نتحقق منه بـ │    ┄┄┄┄┄┄┆
 *            🔍 [نحسب الباقي]    ┆  (couloir central)
 *                          نقول أيضًا
 *                   [أربع جمل، معنى واحد]                      مصطلحات
 *            خطأ شائع ┌─────┴─────┐ حالتان خاصّتان
 *          ⛔ [عكس الاتجاه]   [1 والعدد نفسه قاسمان دائمًا]       للحفظ
 *                  │                │ انتبه إلى
 *                  │           ⚠️ [القاسم ليس 0]
 *                  └────┬─────┘
 *                     نستخلص
 *                  🎯 [الخلاصة]
 */
import { KNOWLEDGE, PREP_ITEMS } from './content/textbook';
import { TEAMS_ACTIVITY, euclid } from './content/teams';
import { EX } from './content/exercises';

const [defBaqi, defJidaa] = KNOWLEDGE.definitions;
const [remSiyagh, remWahid, remNafsuh] = KNOWLEDGE.remarks;
const div143 = defBaqi.example.division;

// نشاط 1 : 42 joueurs, 6 puis 5 équipes (le terrain, content/teams.js) — les égalités se CALCULENT à partir des nombres,
// elles ne sont pas recopiées à la main.
const { total } = TEAMS_ACTIVITY;
const [cNo, cYes] = TEAMS_ACTIVITY.candidates;
const dYes = euclid(total, cYes);
const dNo = euclid(total, cNo);
const eq = (a, b, { q, r }) => `$${a} = ${b} \\times ${q} + ${r}$`;

const ex1 = EX['ex-1'];
const ex5 = EX['ex-5'];

export const KNOWLEDGE_GRAPH = {
  root: 'qasim',
  // L'ORDRE DE DÉCLARATION compte pour la mise en page : à rangée égale dans
  // un même couloir, le nœud déclaré plus tard descend (graphLayout nodeRows).
  nodes: [
    {
      id: 'qasim', kind: 'concept', lane: 'center', requires: 'qasim-baqi',
      title: 'قاسم عدد طبيعي', subtitle: '$b$ قاسم للعدد $a$',
      // Le cadre commun aux deux définitions du manuel, puis la phrase du
      // brief du module 2 (Module02Maarif) qui annonce les deux lectures.
      context: { text: '$a$ و $b$ عددان طبيعيان حيث $b \\neq 0$.', note: 'لهذه الفكرة تعريفان.' },
      reveals: ['baqi'],
    },
    {
      id: 'baqi', kind: 'definition', lane: 'start', requires: 'qasim-baqi', notebook: true,
      title: 'بالباقي', subtitle: 'الباقي معدوم',
      context: { text: defBaqi.text },
      reveals: ['tadhakkar', 'jidaa'],
    },
    {
      id: 'jidaa', kind: 'definition', lane: 'end', requires: 'qasim-jidaa', notebook: true,
      title: 'بالجداء', subtitle: '$a = b \\times q$',
      context: { text: defJidaa.text },
      reveals: ['ex120'],
    },
    {
      // 📌 تذكّر — la division euclidienne, prérequis diagnostiqué par
      // « أستعدّ » (priorKnowledge 'qisma-iqlidiya') : la méthode de
      // l'exercice 1 et deux corrections d'« أستعدّ » (137 ÷ 5, 72 ÷ 24).
      id: 'tadhakkar', kind: 'prerequisite', lane: 'start', requires: 'qasim-baqi',
      title: 'القسمة الإقليدية', subtitle: '$a = b \\times q + r$',
      context: { text: ex1.method, list: [PREP_ITEMS[1].why, PREP_ITEMS[2].why] },
      reveals: ['ex143'],
    },
    {
      id: 'ex120', kind: 'example', lane: 'end', requires: 'qasim-jidaa',
      title: '120 و 6', subtitle: '$120 = 6 \\times 20$',
      context: { text: defJidaa.example.text },
      reveals: ['khata-amil', 'siyagh'],
    },
    {
      id: 'ex143', kind: 'example', lane: 'start', requires: 'qasim-baqi',
      title: `${div143.dividend} و ${div143.divisor}`,
      subtitle: `$${div143.dividend} = ${div143.divisor} \\times ${div143.quotient} + ${div143.remainder}$`,
      context: { text: defBaqi.example.text, formula: `$${div143.dividend} = ${div143.divisor} \\times ${div143.quotient} + ${div143.remainder}$` },
      reveals: ['tahaqqaq'],
    },
    {
      // ⛔ خطأ شائع — Module 2, question 2 : le distracteur « 6 قاسم للعدد
      // 120 فقط » et l'explication « المساواة تُقرأ في الاتجاهين ».
      id: 'khata-amil', kind: 'common_mistake', lane: 'end', requires: 'qasim-jidaa',
      title: 'قاسم واحد فقط؟', subtitle: '$120 = 6 \\times 20$',
      context: {
        parts: [
          { role: 'wrong', text: 'من $120 = 6 \\times 20$ نستنتج أن 6 وحده قاسم للعدد 120.' },
          { role: 'why', text: 'المساواة تُقرأ في الاتجاهين: $120 = 6 \\times 20 = 20 \\times 6$، فكل عامل قاسم للعدد 120.' },
          { role: 'right', text: '6 و 20 قاسمان للعدد 120.' },
        ],
      },
      reveals: [],
    },
    {
      // 🔍 تحقّق — نشاط 1 (Module 1 : « 42 = 5 × 8 + 2 يبقى لاعبان ؛
      // 42 = 6 × 7 + 0 فلا يبقى أحد ») et Module 2, question 1 (« التعريف
      // كله في الباقي », contre « حاصل القسمة فردي » / « 11 عدد أولي »).
      id: 'tahaqqaq', kind: 'check', lane: 'start', requires: 'qasim-baqi',
      title: 'نحسب الباقي', subtitle: eq(total, cYes, dYes),
      context: {
        text: 'هل $b$ قاسم للعدد $a$؟ نُجري القسمة الإقليدية لـ $a$ على $b$ وننظر إلى الباقي.',
        list: [
          `${eq(total, cYes, dYes)}: الباقي 0، إذن ${cYes} قاسم للعدد ${total}.`,
          `${eq(total, cNo, dNo)}: الباقي ${dNo.r} ليس معدومًا، إذن ${cNo} ليس قاسمًا للعدد ${total}.`,
        ],
        note: 'التعريف كله في الباقي: لا يكفي أن يكون حاصل القسمة فرديًّا أو أن يكون العدد أوليًّا.',
      },
      reveals: [],
    },
    {
      id: 'siyagh', kind: 'term', lane: 'center', requires: 'siyagh-mutakafia', notebook: true,
      title: 'أربع جمل، معنى واحد', subtitle: 'قاسم لـ · يقسم · يقبل القسمة على · مضاعف لـ',
      context: { text: remSiyagh.text, list: remSiyagh.example },
      reveals: ['khata-ittijah', 'wahid'],
    },
    {
      // ⛔ خطأ شائع — l'exercice 5 (commonError + explication + correction de
      // « 8 يقسم 4 »), et la correction du Module 2 : « العكس: 120 مضاعف للعدد 6 ».
      id: 'khata-ittijah', kind: 'common_mistake', lane: 'start', requires: 'siyagh-mutakafia',
      title: 'عكس الاتجاه', subtitle: '«4 يقسم 8» لا «8 يقسم 4»',
      context: {
        parts: [
          { role: 'wrong', text: ex5.commonError },
          { role: 'why', text: ex5.question.explain },
          { role: 'right', text: ex5.question.rows[0].why },
          { role: 'example', text: '6 قاسم للعدد 120، والعكس: 120 مضاعف للعدد 6.' },
        ],
      },
      reveals: [],
    },
    {
      id: 'wahid', kind: 'retain', lane: 'end', requires: 'wahid-wa-nafsuh', notebook: true,
      title: '1 والعدد نفسه قاسمان دائمًا', subtitle: '$a = 1 \\times a$ · $a = a \\times 1$',
      context: { text: remWahid.text, note: remNafsuh.text },
      reveals: ['intabih'],
    },
    {
      // ⚠️ انتبه — la condition « $b \neq 0$ » des deux définitions, et le
      // « غير معدوم » de la remarque qu'elle explique.
      id: 'intabih', kind: 'warning', lane: 'end', requires: 'wahid-wa-nafsuh',
      title: 'القاسم ليس 0', subtitle: '$b \\neq 0$',
      context: {
        text: 'التعريفان يشترطان $b \\neq 0$: لا قسمة على 0.',
        note: `ولهذا تقول الملاحظة «غير معدوم»: ${remNafsuh.text}`,
      },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les deux définitions et la remarque des quatre phrases,
      // réunies : ce qu'il faut garder si l'on ne garde qu'une chose.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'wahid-wa-nafsuh',
      title: 'قاسم ⇔ باقٍ معدوم', subtitle: '$a = b \\times q$',
      context: {
        text: '$b$ قاسم للعدد $a$ (حيث $b \\neq 0$) معناه: باقي القسمة الإقليدية لـ $a$ على $b$ هو 0، أي يوجد عدد طبيعي $q$ حيث $a = b \\times q$.',
        note: 'ونقولها بأربع جمل لها نفس المعنى: $b$ قاسم لـ $a$، $b$ يقسم $a$، $a$ يقبل القسمة على $b$، $a$ مضاعف لـ $b$.',
      },
      reveals: [],
    },
  ],
  edges: [
    // « معناه » : le mot même des deux définitions du manuel.
    { from: 'qasim', to: 'baqi', label: 'معناه' },
    { from: 'qasim', to: 'jidaa', label: 'معناه' },
    // Module 2 : « نفس الفكرة بكتابة أخرى: باقٍ معدوم يعني أن a هو جداء b ».
    { from: 'baqi', to: 'jidaa', label: 'نفس الفكرة', lateral: true },
    // « باقي القسمة الإقليدية » : la définition s'appuie sur la division
    // euclidienne ; l'exemple du manuel en est le cas « باقٍ معدوم ».
    { from: 'baqi', to: 'tadhakkar', label: 'تذكّر' },
    { from: 'tadhakkar', to: 'ex143', label: 'باقٍ معدوم' },
    { from: 'ex143', to: 'tahaqqaq', label: 'نتحقق منه بـ' },
    { from: 'jidaa', to: 'ex120', label: 'مثال' },
    { from: 'ex120', to: 'khata-amil', label: 'خطأ شائع' },
    // Les deux exemples du manuel se disent déjà en plusieurs phrases
    // (« 11 قاسم للعدد 143. 143 يقبل القسمة على 11 ») : ils mènent aux
    // quatre formulations équivalentes. Une étiquette pour la jonction.
    { from: 'ex143', to: 'siyagh', label: 'نقول أيضًا' },
    { from: 'ex120', to: 'siyagh', label: 'نقول أيضًا' },
    { from: 'siyagh', to: 'khata-ittijah', label: 'خطأ شائع' },
    { from: 'siyagh', to: 'wahid', label: 'حالتان خاصّتان' },
    { from: 'wahid', to: 'intabih', label: 'انتبه إلى' },
    { from: 'khata-ittijah', to: 'khulasa', label: 'نستخلص' },
    { from: 'intabih', to: 'khulasa', label: 'نستخلص' },
  ],
};
