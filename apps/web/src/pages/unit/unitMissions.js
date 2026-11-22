/**
 * LA PAGE DE VALEUR D'UNE UNITÉ, regard élève (propriétaire, 2026-11-09 : maquette docs/experiments/unit-home-mockup-2026-11-09.html
 * validée, puis la fenêtre centrée décidée par le conseil). Une unité passe à cette vue quand ses leçons sont converties au prototype de
 * mission ET que son contenu ci-dessous est écrit ; la règle du propriétaire : « chaque fois qu'on complète les leçons d'une unité, on met
 * sa page à jour ». L'enseignant garde la page d'avant (UnitPage), intacte.
 *
 * Tout ce qui est ici est ÉCRIT PAR LA PLATEFORME (indépendance du manuel, CLAUDE.md) : le défi de l'unité est reformulé (le texte du
 * manuel reste dans le catalogue, jamais montré à l'élève par cette vue), l'aparté historique aussi. Contrat :
 *   icons   — { lessonId: emoji } : la station de chaque leçon (le même objet que sa scène de mission) ;
 *   short   — { lessonId: libellé court } : le nom de la station sur le chemin (2 lignes au plus) ;
 *   challenge — { lead, full, question, numbers: [n…], solvedAfter: lessonId } : `lead` tient en 3 lignes sur la carte, `full` dans la
 *              fenêtre ; chaque nombre de `numbers` est mis en valeur ; `solvedAfter` : la leçon après laquelle l'élève a de quoi le résoudre ;
 *   keys    — [{ icon, label, after: lessonId }] : les « مفاتيح الحلّ », une par grande كفاءة de l'unité, gagnée quand `after` est terminée ;
 *   history — { title, text } : l'aparté historique, en une ou deux phrases.
 * unitMissions.test.js vérifie que chaque leçon a son icône et son libellé, que chaque `after` est une leçon de l'unité, que les nombres
 * sont dans le texte, et qu'aucune ligne ne renvoie au manuel.
 */
import { ABU_KAMIL } from '../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/jumal-muadalatayn/_unit/abuKamil.js';

export const UNIT_MISSIONS = Object.freeze({
  'aadad-tabiiya-natiqa': {
    icons: {
      'qasim-adad-tabii': '📚',
      'qawasim-adad-tabii': '🧱',
      'khawass-qawasim': '🏗️',
      'qasim-mushtarak-akbar': '💐',
      'tayin-pgcd': '🎒',
      'bahth-pgcd': '🧵',
      'awwaliyan-fima-baynahuma': '🤝',
      'ikhtizal-kasr': '🥖',
      'wadiya-idmajiya-aadad': '🧩',
    },
    short: {
      'qasim-adad-tabii': 'قاسم عدد طبيعي',
      'qawasim-adad-tabii': 'قواسم عدد',
      'khawass-qawasim': 'خواص القواسم',
      'qasim-mushtarak-akbar': 'القاسم المشترك الأكبر',
      'tayin-pgcd': 'تعيين PGCD',
      'bahth-pgcd': 'خوارزمية إقليدس',
      'awwaliyan-fima-baynahuma': 'أوليان فيما بينهما',
      'ikhtizal-kasr': 'اختزال كسر',
      'wadiya-idmajiya-aadad': 'أدمج تعلّماتي',
    },
    challenge: {
      lead: 'اشترت البلدية 936 مئزرًا ورديًّا و 845 مئزرًا أزرق. على كم مدرسة على الأكثر نوزّعها بالتساوي، فتأخذ كل مدرسة العدد نفسه من كل لون؟',
      full: 'نظّمت البلدية حملة تضامن لتجهيز تلاميذ المدارس الابتدائية بالمآزر، فاشترت 936 مئزرًا ورديًّا للبنات و 845 مئزرًا أزرق للبنين. تريد أن توزّعها بالتساوي على أكبر عدد ممكن من المدارس، بحيث تأخذ كل مدرسة العدد نفسه من المآزر الوردية والعدد نفسه من المآزر الزرقاء.',
      question: 'كم مدرسة على الأكثر؟ وكم مئزرًا من كل لون تأخذ كل مدرسة؟',
      numbers: [936, 845],
      solvedAfter: 'bahth-pgcd',
    },
    keys: [
      { icon: '🔑', label: 'قاسم عدد', after: 'qasim-adad-tabii' },
      { icon: '🔢', label: 'قواسم عدد', after: 'qawasim-adad-tabii' },
      { icon: '🤝', label: 'PGCD', after: 'bahth-pgcd' },
      { icon: '1️⃣', label: 'أوليان فيما بينهما', after: 'awwaliyan-fima-baynahuma' },
      { icon: '✂️', label: 'كسر غير قابل للاختزال', after: 'ikhtizal-kasr' },
    ],
    history: {
      title: 'إقليدس (325 – 265 ق.م)',
      text: 'عالم رياضيات إغريقي عاش في الإسكندرية. الطريقة التي ستتعلّمها لحساب القاسم المشترك الأكبر تحمل اسمه: «خوارزمية إقليدس»، وما زالت تُستعمل اليوم في الحواسيب.',
    },
  },
  // Unité 2 (2026-11-10) : ses cinq leçons sont converties (5a5c05d7 … 972933a1) ; la synthèse ne l'est pas encore (comme l'unité 1).
  // Icônes = l'objet de la scène de chaque leçon (حوض الأزهار، النول، شريط الطيّ، بلاط الساحة، الساحة بالبلاط الكبير). Le défi est la
  // situation du module 7 de la synthèse (la زربية), réécrite ; son prix (une donnée parasite) n'est pas repris ici. On le résout après
  // « المعادلات x² = a » (ℓ² = 12) ; sa réponse n'est jamais écrite sur cette page.
  'hisab-judhur': {
    icons: {
      'jidhr-tarbii': '🌷',
      'natiqa-ghayr-natiqa': '🧶',
      'muadalat-x-murabba': '📐',
      'amaliyat-judhur': '🧱',
      'tawzif-khawass-judhur': '🏫',
      'wadiya-idmajiya-judhur': '🧩',
    },
    short: {
      'jidhr-tarbii': 'الجذر التربيعي',
      'natiqa-ghayr-natiqa': 'ناطق أم غير ناطق',
      'muadalat-x-murabba': 'المعادلة x² = a',
      'amaliyat-judhur': 'العمليات على الجذور',
      'tawzif-khawass-judhur': 'أبسط صيغة لجذر',
      'wadiya-idmajiya-judhur': 'أدمج تعلّماتي',
    },
    challenge: {
      lead: 'زربية مستطيلة من وادي سوف مساحتها 24 مترًا مربّعًا، وطولها ضعف عرضها. ما طولها وما عرضها؟',
      full: 'تريد أمّ أن تفرش غرفة الضيوف بزربية تقليدية من وادي سوف. قال لها الحِرفي: «الزربية مستطيلة، مساحتها 24 مترًا مربّعًا، وطولها ضعف عرضها». لم يذكر طولها ولا عرضها، وهي تريد أن تعرف هل تناسب الغرفة.',
      question: 'ما عرض الزربية وما طولها؟ اكتبهما بالمتر مدوّرَين إلى السنتيمتر.',
      numbers: [24],
      solvedAfter: 'muadalat-x-murabba',
    },
    keys: [
      { icon: '🌱', label: 'الجذر التربيعي', after: 'jidhr-tarbii' },
      { icon: '🔍', label: 'ناطق أم غير ناطق', after: 'natiqa-ghayr-natiqa' },
      { icon: '⚖️', label: 'حلول x² = a', after: 'muadalat-x-murabba' },
      { icon: '✖️', label: 'جذر جداء وجذر حاصل قسمة', after: 'amaliyat-judhur' },
      { icon: '✨', label: 'أبسط صيغة لجذر', after: 'tawzif-khawass-judhur' },
    ],
    history: {
      title: 'القلصادي (1412 – 1486)',
      text: 'عالم رياضيات أندلسي درس في تلمسان وعاش في المغرب العربي. كان يكتب حرف «جـ»، أوّلَ حرف من كلمة «جذر»، فوق العدد ليدلّ على جذره، قبل أن ينتشر الرمز √ الذي ستستعمله.',
    },
  },
  // Unité 3 (2026-11-11) : ses trois leçons sont converties (e0045aad, b92e26f6, bc156126) ; la synthèse attend la décision du propriétaire
  // sur la recette provisoire. Icônes = l'objet de la scène de chaque leçon (le terrain du quartier, les gradins, les rouleaux de gazon) et 🧩 la
  // synthèse. Le défi est le تحدّ de l'unité (un triangle de côtés x + 1, x + 2, x + 3), RÉÉCRIT avec les nombres de la plateforme : x + 2, x + 4,
  // x + 6 — les termes en x s'annulent encore (r = p + q), x² = 16 ; « x + 3 » est un nombre de la مسألة de la leçon 2, il n'est pas repris. Sans
  // `numbers` : la mise en valeur découpe le texte par une RegExp non échappée (« + » y serait un quantificateur) — les côtés sont des formules
  // `$…$` lues par MathLabel. La réponse (x = 4, les côtés 6, 8, 10) n'est jamais écrite ici.
  'hisab-harfi': {
    icons: {
      'nashr-tabsit': '⚽',
      'mutatabiqat-shahira': '🏟️',
      'tahlil-ibara': '🌱',
      'wadiya-idmajiya-harfi': '🧩',
    },
    short: {
      'nashr-tabsit': 'نشر وتبسيط',
      'mutatabiqat-shahira': 'المتطابقات الشهيرة',
      'tahlil-ibara': 'تحليل عبارة',
      'wadiya-idmajiya-harfi': 'أدمج تعلّماتي',
    },
    challenge: {
      lead: 'ركن عشبيّ مثلّث الشكل في زاوية الملعب، أطوال أضلاعه بالمتر $x + 2$ و $x + 4$ و $x + 6$ . ما قيمة $x$ التي تجعل زاويته قائمة؟',
      full: 'يريد عمّال البلدية أن يزرعوا العشب في ركن مثلّث الشكل عند زاوية ملعب الحيّ. قاسوا أضلاعه بالمتر فوجدوها $x + 2$ و $x + 4$ و $x + 6$ ، والضلع الأطول يقابل زاوية الملعب. لكي يلتصق الركن بخطَّي الملعب تمامًا، يجب أن تكون زاويته قائمة.',
      question: 'ما قيمة العدد $x$ التي تجعل المثلث قائمًا؟ وما أطوال أضلاعه عندئذ؟',
      numbers: [],
      solvedAfter: 'mutatabiqat-shahira',
    },
    keys: [
      { icon: '🧩', label: 'نشر جداء قوسين', after: 'nashr-tabsit' },
      { icon: '🧹', label: 'تبسيط عبارة', after: 'nashr-tabsit' },
      { icon: '⬛', label: 'مربّع مجموع ومربّع فرق', after: 'mutatabiqat-shahira' },
      { icon: '✂️', label: 'جداء مجموع في فرق', after: 'mutatabiqat-shahira' },
      { icon: '🔗', label: 'التحليل إلى جداء عوامل', after: 'tahlil-ibara' },
    ],
    history: {
      title: 'الكرجي (نحو 953 – 1029)',
      text: 'عالم رياضيات عاش في بغداد وألّف «الفخري في الجبر والمقابلة». عرف كيف ينشر مربّع مجموع ومكعّبه وما فوقهما بقاعدة تعطي أعداد كل نشر، دون أن يرسم أيّ شكل.',
    },
  },
  // Unité 4 (2026-11-11) : ses quatre leçons sont converties (eccbbeb7, 15c7b67c, c18239c0, 754fb0c1) ; la synthèse attend la réponse du
  // propriétaire sur la recette provisoire. Icônes = l'objet de la scène de chaque leçon (la balance du vestiaire, le tableau de l'entraîneur, le
  // téléphone et son crédit, la toise de la famille) et 🧩 la synthèse. Le défi est le تحدّ de l'unité (deux formules d'abonnement à la piscine :
  // 75 par séance, ou 560 + 5 par séance — c'est aussi le 🏆 de la synthèse, jamais repris), RÉÉCRIT : un club d'équitation, 90 دج la séance ou
  // 700 دج + 20 دج la séance. Aucun nombre d'une مسألة de leçon ni de la synthèse (signatures `muadalat-mutarajihat/_unit/signatures/*.js`,
  // la piscine 50x / 200 + 10x / 75x / 560 + 5x) ; la réponse (égalité à 10 séances, mieux à partir de 11) n'est jamais écrite ici.
  // Cinq clés pour quatre leçons : « المتراجحات » en donne deux (résoudre, représenter sur une droite graduée).
  'muadalat-mutarajihat': {
    icons: {
      'muadala-ula': '⚖️',
      'jidaa-maadum': '📋',
      'mutarajiha-ula': '📱',
      'tarrid-mushkila': '📏',
      'wadiya-idmajiya-muadalat': '🧩',
    },
    short: {
      'muadala-ula': 'معادلة من الدرجة الأولى',
      'jidaa-maadum': 'معادلات جداء معدوم',
      'mutarajiha-ula': 'المتراجحات',
      'tarrid-mushkila': 'ترييض مشكلة',
      'wadiya-idmajiya-muadalat': 'أدمج تعلّماتي',
    },
    challenge: {
      lead: 'نادي الفروسية يقترح صيغتين: 90 دج للحصة الواحدة، أو اشتراك سنوي بـ 700 دج ثم 20 دج للحصة. ابتداءً من كم حصة تصبح الصيغة الثانية أقلّ كلفة؟',
      full: 'يريد وليد أن يتعلّم ركوب الخيل في نادي الفروسية بمدينته. يقترح النادي على التلاميذ صيغتين: في الأولى يدفع 90 دج عن كل حصة، وفي الثانية يدفع اشتراكًا سنويًّا قدره 700 دج ثم 20 دج فقط عن كل حصة. لم يقرّر وليد بعدُ كم حصة سيحضر هذا العام.',
      question: 'ابتداءً من أيّ عدد من الحصص تصبح الصيغة الثانية أقلّ كلفة من الأولى؟ اكتب المتراجحة التي تجيب عن السؤال، ثم حلّها.',
      numbers: [700, 90, 20],
      solvedAfter: 'mutarajiha-ula',
    },
    keys: [
      { icon: '⚖️', label: 'حل معادلة من الدرجة الأولى', after: 'muadala-ula' },
      { icon: '0️⃣', label: 'معادلة جداء معدوم', after: 'jidaa-maadum' },
      { icon: '↔️', label: 'حل متراجحة', after: 'mutarajiha-ula' },
      { icon: '📍', label: 'تمثيل الحلول على مستقيم مدرّج', after: 'mutarajiha-ula' },
      { icon: '🧭', label: 'ترييض مشكلة', after: 'tarrid-mushkila' },
    ],
    history: {
      title: 'الخوارزمي (نحو 780 – 850)',
      text: 'عالم رياضيات وفلك عاش في بغداد وألّف «المختصر في حساب الجبر والمقابلة». «الجبر» أن تنقل حدًّا مطروحًا إلى الطرف الآخر فيصير مضافًا، و«المقابلة» أن تحذف من الطرفين ما تساوى فيهما — كما تفعل بكفّتي الميزان.',
    },
  },
  // Unité 5 (2026-11-12) : ses trois leçons sont converties (merges 34091dd3, 2002c3c8, f9c88b25 sur integrate-unit5) ; la synthèse suit
  // (décision du propriétaire du 2026-11-12). Icônes = l'objet de la scène de chaque leçon (le guichet de l'état civil, les étiquettes de prix
  // du kiosque, le guichet du musée) et 🧩 la synthèse. Le défi est le تحدّ de l'unité (les pièces de la classe), RÉÉCRIT avec les nombres RÉSERVÉS
  // par le conseil (verdict X2) : 23 caisses de dattes de 5 kg et de 2 kg, 82 kg en tout — présenté par ملاك, le seul prénom réservé à cette page.
  // La réponse (12 ; 11), 3x = 36, n'est jamais écrite ici. L'aparté est la ligne vérifiée de `_unit/abuKamil.js` (un seul propriétaire, X9).
  // Cinq clés pour trois leçons : les leçons 1 et 2 en donnent deux chacune.
  'jumal-muadalatayn': {
    icons: {
      'mafhum-jumla': '🏛️',
      'hall-jabri': '🏷️',
      'mushkilat-jumla': '🎟️',
      'wadiya-idmajiya-jumal': '🧩',
    },
    short: {
      'mafhum-jumla': 'مفهوم جملة معادلتين',
      'hall-jabri': 'الحل الجبري',
      'mushkilat-jumla': 'حل مشكلات',
      'wadiya-idmajiya-jumal': 'أدمج تعلّماتي',
    },
    challenge: {
      lead: 'عبّأت تعاونية فلاحية 23 صندوقًا من التمر، بعضها يزن 5 كغ والباقي 2 كغ ، فكان وزنها كلّها 82 كغ . كم صندوقًا من كل نوع؟',
      full: 'تساعد ملاك أباها في تعاونية فلاحية بعد جني التمر. عبّأوا 23 صندوقًا: صناديق كبيرة يزن كلّ منها 5 كغ وصناديق صغيرة يزن كلّ منها 2 كغ ، ووزنوا الحمولة كلّها فكانت 82 كغ . نسيت ملاك أن تعدّ الصناديق الكبيرة.',
      question: 'كم صندوقًا كبيرًا وكم صندوقًا صغيرًا عبّأت التعاونية؟ سمِّ المجهولين، واكتب الجملة، ثم حلّها وتحقّق.',
      numbers: [23, 82],
      solvedAfter: 'hall-jabri',
    },
    keys: [
      { icon: '🧷', label: 'جملة معادلتين وحلّها', after: 'mafhum-jumla' },
      { icon: '🔎', label: 'اختبار ثنائية', after: 'mafhum-jumla' },
      { icon: '🔁', label: 'طريقة التعويض', after: 'hall-jabri' },
      { icon: '➕', label: 'طريقة الجمع', after: 'hall-jabri' },
      { icon: '🧭', label: 'ترجمة مشكلة بجملة', after: 'mushkilat-jumla' },
    ],
    history: {
      title: `أبو كامل (${ABU_KAMIL.dates})`,
      text: ABU_KAMIL.line,
    },
  },
  // Unité 9 (2026-11-10) : ses trois leçons ET sa synthèse sont converties (50e5f844, 76a4545b, 9f7fb170, puis la synthèse — le pilote du recette
  // « synthèse »). Icônes = l'objet de la scène de chaque leçon (le ciné-club, le mur repeint, la banderole du derby) et 🧩 la synthèse. Le défi est
  // le تحدّ du module 7 de la synthèse (la minaret du quartier), RÉÉCRIT : seulement les deux ombres (11,6 et 1,6) et la perche d'un mètre — ni la
  // distance de 10 m (un nombre de la مسألة de la leçon 3 « إنشاءات »), ni la réponse. Une leçon donne deux clés (une unité de trois leçons) : les
  // cinq clés sont les cinq outils de la mission de la synthèse (`mission.tools`).
  'khassiyat-talis': {
    icons: {
      'talis-hisab-atwal': '🎬',
      'aksiya-talis': '🖌️',
      'inshaat-talis': '🚩',
      'wadiya-idmajiya-talis': '🧩',
    },
    short: {
      'talis-hisab-atwal': 'خاصية طالس',
      'aksiya-talis': 'الخاصية العكسية',
      'inshaat-talis': 'إنشاءات هندسية',
      'wadiya-idmajiya-talis': 'أدمج تعلّماتي',
    },
    challenge: {
      lead: 'في ساعة مشمسة، ظلّ مئذنة الحيّ طوله 11,6 m ، وظلّ عصا طولها متر واحد 1,6 m في اللحظة نفسها. ما ارتفاع المئذنة؟',
      full: 'أراد فريد أن يعرف ارتفاع مئذنة حيّه دون أن يصعدها. في ساعة مشمسة غرس صديقه عصا شاقولية طولها متر واحد، وقاسا معًا على الأرض: ظلّ المئذنة طوله 11,6 m ، وظلّ العصا في اللحظة نفسها 1,6 m .',
      question: 'كيف يحسبان ارتفاع المئذنة من هذين الظلّين؟ وما هذا الارتفاع؟',
      numbers: ['11,6', '1,6'],
      solvedAfter: 'talis-hisab-atwal',
    },
    keys: [
      { icon: '📏', label: 'حساب طول بخاصية طالس', after: 'talis-hisab-atwal' },
      { icon: '🔍', label: 'معامل التناسبية', after: 'talis-hisab-atwal' },
      { icon: '🪜', label: 'إثبات التوازي', after: 'aksiya-talis' },
      { icon: '⚖️', label: 'إثبات عدم التوازي', after: 'aksiya-talis' },
      { icon: '✂️', label: 'تقسيم قطعة', after: 'inshaat-talis' },
    ],
    history: {
      title: 'البيروني (973 – 1048)',
      text: 'عالم من خوارزم كتب رسالة كاملة في الظلال وأطوالها في ساعات النهار، واستعمل الهندسة ليقيس ما لا تصل إليه اليد، حتى نصف قطر الأرض من قمّة جبل.',
    },
  },
});

export const unitMissionOf = (unitId) => UNIT_MISSIONS[unitId] ?? null;

/**
 * L'état de l'unité pour CET élève, à partir de la progression de chaque leçon (pure, testée) :
 *   lessons : [{ id, done, available }] dans l'ordre (leçons puis synthèse) → { done, current, keysEarned, finished }
 *   `current` : la première leçon ouverte non terminée (sinon null : l'unité est finie).
 */
export function unitState(lessons, mission) {
  const doneIds = new Set(lessons.filter((l) => l.done).map((l) => l.id));
  const current = lessons.find((l) => l.available && !l.done) ?? null;
  const keysEarned = (mission?.keys ?? []).filter((k) => doneIds.has(k.after)).length;
  return { done: doneIds.size, current: current?.id ?? null, keysEarned, finished: lessons.length > 0 && lessons.every((l) => l.done) };
}

/** Les prérequis d'une leçon DANS l'unité que l'élève n'a pas encore terminés (seuls ceux-là se montrent d'emblée — conseil). */
export function unmetPrerequisites(lesson, doneIds, unitLessonIds) {
  return (lesson.prerequisiteLessonCodes ?? []).filter((code) => unitLessonIds.has(code) && !doneIds.has(code));
}
