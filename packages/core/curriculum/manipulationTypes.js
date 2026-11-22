// Le REGISTRE des types de manipulation — la partie sans React.
//
// Une manipulation est une donnée de leçon (`LESSON_CONFIG.resources[]`,
// kind: 'manipulation') qui nomme son TYPE. Le composant qui le rend vit dans
// apps/web/src/lessons/common/manipulations/ ; ici ne vivent que les types,
// pour que l'outillage (scripts/validate-lessons.mjs) et l'API puissent
// vérifier un `type` sans charger React. Le registre est FERMÉ : un contenu
// nomme un type, il ne fournit jamais de code.
//
// Chaque type dit quelle idée mathématique il rend VISIBLE (§24 du brief :
// « What mathematical idea does this help the student SEE? ») et quels
// contrôles il offre en mode classe. `changeNumbers` est `false` ou un objet
// de contraintes : un enseignant ne peut jamais saisir des valeurs qui
// cassent la séquence pédagogique (voir docs/architecture/LESSON_CONTRACT.md).
//
// `autoComplete` est la DÉCISION PÉDAGOGIQUE « compléter automatiquement »
// (MANIPULATION_CONTRACT §6bis) : `false`, ou `{ unlock }`. Il n'est déclaré
// que là où le geste se RÉPÈTE à l'identique une fois compris (porter le
// 15e joueur, couper le 6e ruban) — jamais là où chaque geste est une
// expérience ou une réponse (choisir un diviseur, un nombre de colonnes).
//   unlock: 'config'        dès qu'une configuration valide est posée
//   unlock: 'first-gesture' seulement après un premier exemple fait À LA MAIN
// Le composant fournit la mécanique (`controller.autoComplete`) ; sans cette
// déclaration, le bouton n'est jamais rendu.
export const AUTO_COMPLETE_UNLOCKS = Object.freeze(['config', 'first-gesture']);

export const MANIPULATION_TYPES = Object.freeze({
  'divisor-explorer': {
    shows: 'b قاسم لـ a ⇔ باقي القسمة الإقليدية معدوم ⇔ a = b × q',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: { a: [2, 9999], b: [1, 999] }, autoComplete: { unlock: 'config' } },
  },
  'divisor-explorer-books': {
    // Le RAYON QU'ON ÉTIRE (Module 1 — المكتبة, quotition) : l'élève tire le
    // serre-livres, tous les rayons prennent la longueur b, les a livres se
    // rangent en q rayons pleins et r restent au sol. Chaque position est un
    // essai : MANUEL (§6bis), rien à compléter.
    shows: 'b عدد الكتب في كل رفّ: b قاسم لـ a ⇔ لا يبقى أي كتاب على الأرض ⇔ a = b × q + 0',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'team-builder': {
    // Le partage équitable DEBOUT : n joueurs, k équipes égales, et celui qui
    // reste dehors EST le reste. Même mathématique que l'activité 1 (les 420
    // livres) ; contexte de la plateforme, déclaré dans la leçon
    // (`experience: platform_context`) — voir manipulationLevels.js.
    shows: 'قسمة عدد على عدد من المجموعات المتساوية: a = b × q + r، والباقي هو من بقي خارج الفرق',
    controls: { reset: true, nextStep: true, toggleExplanation: true, hideConclusion: true, changeNumbers: { total: [2, 60], groups: [2, 12] }, autoComplete: { unlock: 'first-gesture' } },
  },
  'factor-pairs': {
    // La clé est `n`, celle du champ du type (FactorPairs `numberFields`).
    // Elle était `a` : le laboratoire libre ne trouvait pas ses bornes et
    // acceptait 0 ou 100 000 (audit 2026-09-29).
    shows: 'قواسم عدد تأتي أزواجًا d × (a ÷ d) ولا حاجة للاختبار بعد √a',
    controls: { reset: true, nextStep: true, toggleExplanation: true, changeNumbers: { n: [2, 999] }, autoComplete: { unlock: 'config' } },
  },
  'divisor-properties': {
    // Le chantier : deux murs en briques de longueur n (thème `construction`) ;
    // accoler, enlever, mesurer — toujours des briques entières.
    shows: 'n يقسم a و b ⇒ n يقسم a + b و a − b وباقي قسمة a على b',
    controls: { reset: true, nextStep: true, toggleExplanation: true, changeNumbers: { n: [2, 99], a: [2, 999], b: [1, 999], requireCommonDivisor: true } },
  },
  'common-divisors': {
    // Deux temps : des objets DESSINÉS répartis en groupes identiques (le
    // thème choisit fleurs, ballons et maillots, ou fournitures), puis les
    // listes de diviseurs et la case PGCD.
    shows: 'قواسم → قواسم مشتركة → القاسم المشترك الأكبر (تقاطع مجموعتين وأكبر عنصر فيه)',
    controls: { reset: true, nextStep: true, toggleExplanation: true, changeNumbers: { a: [2, 300], b: [2, 300] }, autoComplete: { unlock: 'config' } },
  },
  'pgcd-differences': {
    // L'atelier de couture (thème `workshop`) : le petit ruban coupé dans le
    // grand, encore et encore.
    shows: 'PGCD(a ; b) = PGCD(b ; a − b) والقاسم المشترك الأكبر هو آخر فرق غير معدوم',
    controls: { reset: true, nextStep: true, prevStep: true, toggleExplanation: true, hideConclusion: true, changeNumbers: { a: [2, 9999], b: [1, 9999], maxSteps: 30 }, autoComplete: { unlock: 'first-gesture' } },
  },
  'euclidean-algorithm': {
    // Le même atelier : le petit ruban REPORTÉ le long du grand ; le bout qui
    // dépasse est le reste.
    shows: 'PGCD(a ; b) = PGCD(b ; r) والقاسم المشترك الأكبر هو آخر باقٍ غير معدوم',
    controls: { reset: true, nextStep: true, prevStep: true, toggleExplanation: true, hideConclusion: true, changeNumbers: { a: [2, 99999], b: [1, 99999], maxSteps: 12 }, autoComplete: { unlock: 'first-gesture' } },
  },
  'coprime-explorer': {
    // Au niveau débutant, des trousses identiques (thème `school`) : rien ne
    // marche sauf 1 ; puis les listes.
    shows: 'عددان أوليان فيما بينهما ⇔ قاسمهما المشترك الوحيد هو 1',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: { a: [2, 300], b: [2, 300] }, autoComplete: { unlock: 'config' } },
  },
  'fraction-reduction': {
    // La recette (thème `kitchen`) : diviser les deux termes par k, c'est
    // répartir deux ingrédients en k parts identiques et lire UNE part.
    shows: 'اختزال كسر = القسمة على قاسم مشترك؛ القسمة على PGCD تعطي الشكل غير القابل للاختزال في خطوة واحدة',
    // Bornes du مختبر حر : jusqu'à 600 (595/560 du manuel y tient). À 9999,
    // 9240/7560 dessinait 16 800 objets et un dépôt prenait 4 s (audit 2026-09-29).
    controls: { reset: true, nextStep: true, toggleExplanation: true, changeNumbers: { n: [1, 600], d: [2, 600] } },
  },

  // ── Unité 2 « الحساب على الجذور » (2026-09-30) ──────────────────────────
  'square-root-side': {
    // L'élève ÉTIRE le côté d'un carré sur une règle graduée : le carré se
    // dessine, son aire se lit exactement, et se compare à l'aire visée.
    // Mode `refine` (leçon 1) : on resserre l'encadrement (1 → 0,1 → 0,01 →
    // 0,001) — pour 36 le côté tombe juste, pour 5 JAMAIS : √5 existe (c'est
    // BC) mais aucun décimal n'en est l'écriture. Mode `graduation` (leçon 2) :
    // l'élève choisit la graduation 1/g — le côté tombe sur une graduation
    // exactement quand l'aire est le carré d'un rationnel. Chaque position
    // est un essai : MANUEL (§6bis).
    shows: '√a هو العدد الموجب الذي مربّعه a: ضلع المربّع الذي مساحته a — ناطق إذا وقع على تدريجة، وغير ناطق إذا لم يقع على أي تدريجة',
    controls: { autoComplete: { unlock: 'config' }, reset: true, nextStep: false, toggleExplanation: true, changeNumbers: { num: [1, 400], den: [1, 100] } },
  },
  'square-fold': {
    // L'élève DÉPLACE x sur la droite graduée ; une flèche porte x vers x²
    // sur la droite des carrés, dont la moitié négative est hachurée : aucun
    // carré n'y arrive (résistance). x et −x arrivent au même point.
    // Épingler un x comme solution est une RÉPONSE : MANUEL (§6bis).
    shows: 'المعادلة x² = a: حلّان متعاكسان √a و −√a إذا كان a > 0، حل واحد 0 إذا كان a = 0، ولا حل إذا كان a < 0',
    controls: { autoComplete: { unlock: 'config' }, reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'square-tiling': {
    // L'élève ÉTIRE k, le nombre de dalles par côté d'un carré d'aire n :
    // n = k² × b et le côté vaut k√b. Une dalle d'aire non entière est
    // refusée (k² ne divise pas n). Le plus grand k donne b le plus petit.
    // Chaque k est un essai : MANUEL (§6bis).
    shows: '√(k² × b) = √(k²) × √b = k√b: مربّع مساحته n مبلّط بـ k × k بلاطة مساحة كل منها b — وأكبر k يعطي أصغر b',
    controls: { autoComplete: { unlock: 'config' }, reset: true, nextStep: false, toggleExplanation: true, changeNumbers: { n: [2, 999] } },
  },

  // ── Unité 3 « الحساب الحرفي » (2026-10-01) ──────────────────────────────
  'pitch-expansion': {
    // Un terrain de football dont les côtés sont les deux facteurs : l'élève
    // ÉTIRE x, PORTE chaque zone (un produit partiel) dans la somme, RÉUNIT
    // les termes semblables et vérifie l'égalité pour plusieurs x. Chaque
    // zone portée et chaque fusion est une décision : MANUEL (§6bis).
    shows: 'النشر: مساحة الملعب (الجداء) تساوي مجموع مساحات مناطقه — k(a + b) = ka + kb و (a + b)(c + d) = ac + ad + bc + bd والمتطابقات الشهيرة — من أجل كل قيمة لـ x',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'turf-factoring': {
    // Le geste inverse : des plaques de gazon (x², x, 1) à assembler en UN
    // terrain rectangulaire, dont les côtés sont les facteurs. rows : l'élève
    // étire le nombre de rangées identiques (ka + kb = k(a + b)) ; square :
    // il porte les bandes à droite ou en bas du carré x², le coin décide
    // (a² + 2ab + b² = (a + b)²). Chaque essai est une réponse : MANUEL.
    shows: 'التحليل: كتابة مجموع على شكل جداء هي تكوين مستطيل واحد من قطعه — ka + kb = k(a + b) و a² + 2ab + b² = (a + b)²',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },

  // ── Unité 4 « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد » (2026-10-01) ──
  // Calcul exact commun : packages/core/arithmetic/linear.js.
  'equation-balance': {
    // Une BALANCE à deux plateaux : des sacs fermés de x ballons, des ballons seuls,
    // des baudruches (le négatif, qui tire vers le haut). Ôter ou ajouter d'un SEUL
    // côté fait pencher le fléau (la règle résiste) ; le même geste sur l'autre
    // plateau le rétablit. Partager chaque plateau en k groupes égaux isole un sac.
    // Chaque geste est une décision : MANUEL (§6bis).
    shows: 'المعادلة ميزان متوازن: ما نفعله بأحد الطرفين نفعله بالآخر — حتى الشكل ax = b ثم x = b/a',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'vanishing-pitch': {
    // Le terrain dont les côtés sont les deux FACTEURS (côtés signés) : l'élève étire
    // x, le terrain se déforme, et s'ÉCRASE en une ligne (aire nulle) exactement quand
    // un côté devient nul. Il épingle chaque x où le terrain disparaît ; un x où l'aire
    // ne l'est pas est refusé avec l'aire lue. Chaque épingle est une réponse : MANUEL.
    shows: 'خاصية الجداء المعدوم: مساحة الملعب A × B تنعدم إذا وفقط إذا انعدم أحد ضلعيه — A = 0 أو B = 0',
    controls: { autoComplete: { unlock: 'config' }, reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'solution-ray': {
    // Un mobile sur une droite graduée : chaque position validée laisse une trace —
    // rouge si l'inégalité est vraie (convention du manuel), grise sinon. L'élève pose
    // ensuite le CROCHET de la borne, et (متقدم) transforme l'inéquation : une étape
    // licite garde exactement ses traces, une division par un négatif sans inverser le
    // sens les contredit. Chaque essai est une réponse : MANUEL.
    shows: 'حلول المتراجحة نصف مستقيم: نحافظ على الاتجاه بإضافة عدد أو الضرب في موجب، ونغيّره بالضرب أو القسمة على سالب',
    controls: { autoComplete: { unlock: 'config' }, reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'growth-race': {
    // Deux grandeurs du premier degré qui « grandissent » avec x (âges, coûts) : l'élève
    // CONSTRUIT d'abord chaque expression en portant les jetons x là où l'histoire les
    // met (chaque enfant vieillit), puis étire x : les deux colonnes se rejoignent à
    // la solution de l'équation et se dépassent au-delà (l'inéquation). Chaque jeton
    // et chaque x validé est une décision : MANUEL.
    shows: 'ترييض مشكلة: نسمّي المجهول، نترجم النص إلى عبارتين، فتكون المعادلة لحظة تساويهما والمتراجحة لحظة تفوّق إحداهما',
    controls: { autoComplete: { unlock: 'config' }, reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },

  // ── Unité 5 « جمل معادلتين من الدرجة الأولى بمجهولين » (2026-10-01) ──
  // Calcul exact commun : packages/core/arithmetic/linearSystem.js (sur les fractions de linear.js).
  'pair-scoreboard': {
    // Le TABLEAU DES DEUX CONDITIONS : l'élève fixe lui-même les DEUX nombres x et y (des
    // victoires et des nuls d'une saison, des hommes et des femmes d'un service…) ; deux jauges
    // lisent chacune son équation sur SA ثنائية. Une ثنائية qui allume une seule jauge est
    // refusée comme حل de la jumla : il faut les deux « في آن واحد ». Chaque essai est une
    // réponse : MANUEL (§6bis).
    shows: 'حل جملة معادلتين ثنائية (x ; y) تحقق المعادلتين في آن واحد: ثنائية تحقق معادلة واحدة ليست حلا للجملة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'elimination-cards': {
    // Deux CARTES-ÉQUATIONS en tuiles x, y et unités : l'élève fait disparaître une inconnue —
    // en portant l'expression isolée (y = 7 − 2x) sur chaque tuile y de l'autre carte
    // (التعويض), ou en multipliant une carte (× k, étirement) puis en posant une carte sur
    // l'autre : les tuiles opposées s'annulent par paires (الجمع). Une carte posée sans que
    // rien ne s'annule est refusée en le montrant. Chaque geste est une décision : MANUEL.
    shows: 'حل جملة جبريا: نتخلص من أحد المجهولين بالتعويض أو بالجمع بعد الضرب في معامل مناسب، فنحصل على معادلة بمجهول واحد',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'story-modeller': {
    // L'HISTOIRE QU'ON TRADUIT : l'élève nomme les deux inconnues sur les mots de l'histoire,
    // puis porte les données de l'énoncé dans les cases de deux équations ; « تحقّق » rejoue
    // l'histoire avec SA jumla et refuse un modèle qui la contredit, dans les mots de
    // l'histoire (un prix compté comme un nombre de personnes). Puis la jumla résolue est
    // rejouée (التحقق) et la réponse écrite. Chaque case remplie est une réponse : MANUEL.
    shows: 'ترييض مشكلة بجملة معادلتين: نختار المجهولين، نترجم كل معلومة من النص إلى معادلة، نحل الجملة ثم نتحقق من النتيجة في الوضعية',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },

  // ── Unité 6 « الدالة الخطية والتناسبية » (2026-10-02) ──
  // Calcul exact commun : packages/core/arithmetic/proportional.js (sur les fractions de linear.js).
  'ratio-ride': {
    // LE COMPTEUR QU'ON FAIT TOURNER : l'élève fixe la durée d'un trajet (trottinette louée sur la
    // promenade) et ENREGISTRE ses propres colonnes (x ; y) ; la ligne des quotients y ÷ x se lit sous
    // son tableau. « جدول تناسبية » est refusé tant que deux quotients diffèrent (le forfait de
    // déverrouillage le casse) ; le رابع متناسب se calcule par × a. Chaque colonne est une décision : MANUEL.
    shows: 'جدول تناسبية: حاصل قسمة y على x ثابت يساوي معامل التناسبية a ، أي y = a × x — وجدول فيه مبلغ ثابت ليس جدول تناسبية',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'linear-machine': {
    // LA MACHINE À RÈGLE CACHÉE : l'élève y fait entrer ses propres nombres (cartes), lit les sorties,
    // puis règle le cadran a de SA machine-témoin ; une affirmation « f(x) = ax » est refusée avec un
    // témoin (f(0) ≠ 0, ou f(2x) ≠ 2f(x)). Un seul couple (m ; f(m)), m ≠ 0, suffit à fixer a ;
    // le nombre 0 ne fixe rien. Chaque carte est un choix : MANUEL.
    shows: 'الدالة الخطية x ⟼ ax : صورة x هي ax ، ويكفي عدد غير معدوم m وصورته n لتعيين a = n ÷ m ؛ x² و 2x − 1 ليستا دالتين خطيتين',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'origin-line': {
    // LA DROITE ÉPINGLÉE À O : l'origine ne bouge pas (on essaie, elle résiste) ; l'élève tire la
    // poignée A(1 ; a) — la droite pivote, monte si a > 0, descend si a < 0 ; une sonde verticale
    // (ou horizontale) lit une image (ou un antécédent). Un point posé hors de la droite est refusé
    // avec son écart. Mondes : téléphérique, ressort (nuage de points du tableau), budget (plafond).
    shows: 'التمثيل البياني للدالة الخطية x ⟼ ax مستقيم يشمل المبدأ O ومعامل توجيهه a : يكفي تعيين نقطة ثانية، ونقرأ عليه صورة عدد والعدد الذي علمت صورته',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'percent-tag': {
    // L'ÉTIQUETTE QU'ON ÉTIRE : le prix est une barre ; l'élève choisit زيادة / تخفيض et tire t % —
    // la barre est multipliée par 1 ± t/100 (jamais « + t »). En متقدم, deux changements successifs :
    // le pari « −30 % puis +15 % = −15 % » est refusé par la barre elle-même (on multiplie les
    // multiplicateurs). Chaque réglage est une réponse : MANUEL.
    shows: 'النسب المئوية تناسبية: زيادة x بـ t% تعني ضربه في 1 + t/100 وتخفيضه يعني ضربه في 1 − t/100 ، والتغيرات المتتابعة تُضرب ولا تُجمع',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  // ── Unité 7 « الدالة التآلفية » (2026-10-02) — calcul exact : packages/core/arithmetic/affine.js.
  'affine-meter': {
    // LE COMPTEUR À PARTIE FIXE : un bloc b posé d'avance (la paie de base, la prise en charge) et x blocs
    // de a. L'élève règle x (image) ou cherche x pour un total m (antécédent : ax + b = m) ; en متقدم il
    // tient aussi les boutons a et b — b = 0 rend la fonction خطية, a = 0 la rend ثابتة.
    shows: 'الدالة التآلفية جزء ثابت b وجزء متغير ax : صورة x هي ax + b ، والعدد الذي صورته m حلّ المعادلة ax + b = m ؛ b = 0 دالة خطية و a = 0 دالة ثابتة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'affine-line': {
    // LA DROITE QUI NE PASSE PLUS PAR O : la droite de x ⟼ ax (fantôme) et sa copie montée de b. L'élève
    // tire le point (0 ; b) sur l'axe des ordonnées (translation) et la marche « 1 à droite, a en haut »
    // (pente) ; il lit a et b sur une droite donnée, ou une image / un antécédent avec une sonde.
    shows: 'التمثيل البياني للدالة التآلفية x ⟼ ax + b مستقيم يقطع محور التراتيب في (0 ; b) ويوازي مستقيم الدالة الخطية x ⟼ ax : b الترتيب عند المبدأ و a معامل التوجيه',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'slope-stairs': {
    // L'ESCALIER DES ACCROISSEMENTS : deux marqueurs x1, x2 sur la droite ; la marche Δx, Δf se dessine ;
    // l'élève déplace les marqueurs où il veut — le quotient Δf ÷ Δx ne bouge pas (INVARIANT = a), puis il
    // descend jusqu'à x = 0 pour lire b. Deux nombres et leurs images suffisent à retrouver f.
    shows: 'تناسب التغيّرات: مهما كان العددان x1 و x2 فإنّ (f(x1) − f(x2)) ÷ (x1 − x2) يساوي a ، ومن عددين وصورتيهما نعيّن a ثم b',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'line-crossing': {
    // DEUX DROITES, UN POINT : chaque équation de la جملة est écrite y = ax + b et tracée ; l'élève promène
    // un point — chaque équation s'allume quand il est sur sa droite ; les deux ensemble : la ثنائية
    // solution. En متقدم il règle la seconde droite jusqu'aux cas parallèles / confondues.
    shows: 'حل جملة معادلتين بيانيا: كل معادلة مستقيم y = ax + b ، والثنائية حلّ الجملة إحداثيتا نقطة تقاطعهما ؛ متوازيان: لا حل ، منطبقان: عدد لا نهائي من الحلول',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'plan-compare': {
    // DEUX TARIFS FACE À FACE : chaque formule est une fonction affine (partie fixe + partie variable) ;
    // l'élève fait varier x (séances, heures, jours) — les deux coûts et leurs droites bougent ensemble —
    // trouve x où ils sont égaux et décide quelle formule choisir de chaque côté. Réutilisé par la synthèse.
    shows: 'المفاضلة بين صيغتين: كل تسعيرة دالة تآلفية (جزء ثابت وجزء متغير) ، يتقاطع المستقيمان حيث تتساوى التكلفتان ، وتتغير الصيغة الأفضل قبل نقطة التقاطع وبعدها',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  // ── Unité 8 « الإحصاء » (2026-10-02) — docs/sources/4am/unit8/extraction.json ─────────────────────────
  'cumul-gate': {
    // LA BARRE DE TAILLE : la série rangée (des élèves, des notes) ; l'élève fait glisser un seuil t — ceux
    // qui ont « t على الأكثر » s'allument d'un côté (التكرار المجمع الصاعد), ceux qui ont « t على الأقل » de
    // l'autre (النازل) ; la valeur t elle-même est comptée des DEUX côtés. Les colonnes du tableau se
    // remplissent par ses propres seuils, puis en fractions de N (التواتر المجمع).
    shows: 'التكرار المجمع الصاعد لقيمة t عدد القيم الأصغر من أو تساوي t ، والنازل عدد القيم الأكبر من أو تساوي t ؛ مقسومين على التكرار الكلي يصبحان تواترين مجمعين',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'stat-balance': {
    // LA BALANCE DES VALEURS : chaque valeur est un jeton posé à sa place sur une poutre graduée ; l'élève
    // déplace l'appui jusqu'à l'équilibre (le المتوسط), le rideau jusqu'à couper la série en deux effectifs
    // égaux (le الوسيط), la pince entre les extrêmes (المدى) ; il tire une valeur extrême et voit la moyenne
    // partir, la médiane rester. Réutilisé par la synthèse (valeurs cachées retrouvées par la main).
    shows: 'المتوسط نقطة توازن القيم (مجموع القيم مقسوم على عددها) ، الوسيط يقسم السلسلة المرتبة إلى قسمين لهما نفس التكرار ، والمدى الفرق بين أكبر قيمة وأصغر قيمة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'sheet-lab': {
    // LA MAQUETTE DU MAJDOUL : une feuille dessinée — l'élève saisit les valeurs, sélectionne une plage à la
    // main (A1:G1), compose le دستور (MAX − MIN, MEDIANE, MOYENNE, MODE) ; une plage fausse donne un nombre
    // qui contredit son calcul, une cellule modifiée recalcule tout ; puis il choisit le graphique qui
    // convient aux données (أعمدة / دائري / مدرّج).
    shows: 'المجدول يحسب مؤشرات سلسلة محجوزة في خلايا بدساتير: المدى ⁦=MAX()-MIN()⁩ ، الوسيط ⁦=MEDIANE()⁩ ، المتوسط ⁦=MOYENNE()⁩ ، المنوال ⁦=MODE()⁩ ، ويرسم التمثيل البياني المناسب',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // Unité 9 « خاصية طالس » (2026-10-02) — la géométrie : une longueur, une position, un rapport se TIENNENT à la main.
  'thales-beam': {
    // LE FAISCEAU : deux rayons issus de A (l'objectif d'un projecteur, le trou d'une chambre noire) ; l'élève fait
    // glisser l'écran (B′C′) le long des rayons — parallèle à (BC) — et les trois rapports AB′/AB, AC′/AC, B′C′/BC
    // restent ÉGAUX (k) ; incliner l'écran les sépare. Passer l'écran de l'autre côté de A retourne l'image (وضعية الفراشة).
    // Réutilisé par la synthèse (theme « ombre » : la minaret et le bâton).
    shows: 'إذا قطع مستقيمان متوازيان مستقيمين متقاطعين في A فإن أطوال المثلثين متناسبة: AB′/AB = AC′/AC = B′C′/BC = k ، والمثلث الصغير تصغير للكبير بمعامل k',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'parallel-level': {
    // LE NIVEAU À BULLE : deux points posés par l'élève sur deux droites sécantes graduées (les montants d'une échelle
    // double, puis les droites de نشاط 2) ; la barre (B′C′) n'est « de niveau » — parallèle à (BC) — que si
    // AB′/AB = AC′/AC ET si les points sont dans le même ordre ; des rapports égaux de part et d'autre de A la refusent.
    shows: 'إذا كان AB′/AB = AC′/AC وكانت النقط A، B، B′ و A، C، C′ مرتبة بنفس الترتيب فإن (B′C′) يوازي (BC) ؛ نسبتان مختلفتان تثبتان عدم التوازي',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'segment-divider': {
    // L'ÉVENTAIL DES PARALLÈLES : l'élève trace une demi-droite depuis A, y reporte au compas n ouvertures égales,
    // relie la dernière marque à B puis fait glisser l'équerre le long de la règle : les parallèles découpent [AB] en
    // parts égales (ou dans le rapport p/q). Une ouverture changée en route ou une « parallèle » inclinée donne des
    // parts inégales que la règle mesure.
    shows: 'لتقسيم [AB] إلى n قطع متقايسة (أو بنسبة p/q) نعيّن على نصف مستقيم مبدؤه A قطعا متقايسة بالمدور ونرسم موازيات للمستقيم الواصل بين آخر علامة و B',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'shadow-stick': {
    // LE BÂTON ET L'OMBRE (تحدّ) : la minaret et son ombre ; l'élève fait glisser un bâton de 1 m sur le sol jusqu'à ce
    // que l'extrémité de SON ombre tombe sur celle de la minaret — alors un seul rayon de soleil passe par les deux
    // sommets, les deux verticales sont parallèles et h / 1 = (ombre de la minaret) / (ombre du bâton).
    shows: 'العصا والمئذنة شاقوليتان فهما متوازيتان ؛ إذا انطبقت نهاية ظل العصا على نهاية ظل المئذنة فإن المثلثين في وضعية طالس: h ÷ (طول العصا) = (ظل المئذنة) ÷ (ظل العصا)',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'shadow-world': {
    // SAHAT AL-HAYY (2026-10-13) : un MONDE — l'élève tient le soleil (le vrai soleil d'Alger le 13 octobre, 12:30 → 16:00),
    // mesure les ombres au ruban, parie sur l'ombre d'un objet que la commune va installer (le pari révèle son modèle :
    // additif, copie, inversé…), ÉCRIT sa propre loi (ombre = hauteur + n ou × n) que le monde teste sur tous les objets,
    // la voit se décoller quand le soleil bouge, la répare ; le compagnon مقران ne fait que questionner. Puis la hauteur
    // de la minaret, inaccessible (le ruban refuse de grimper), et la méthode du manuel (les ombres qui finissent ensemble).
    shows: 'في لحظة معيّنة أشعّة الشمس متوازية: الظلّ ÷ الطول هو العدد نفسه لكل الأشياء الشاقولية (وضعية طالس)، ويتغيّر هذا العدد مع الساعة ؛ ومنه طول المئذنة من ظلّها',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'shadow-meet': {
    // LES DEUX OMBRES QUI SE RENCONTRENT (2026-11-10, le labo À UN COULOIR du lecteur de mission — `shadow-world` reste celui de la page) :
    // un objet trop haut pour être mesuré, le soleil à une heure fixée par la manche, un bâton de 1 m que l'élève fait glisser au centimètre
    // jusqu'à ce que les deux ombres finissent au même point O — alors un seul rayon passe par les deux sommets et OB/OA = BE/AM. À l'ombre
    // de l'objet le bâton n'a pas d'ombre, au soleil la sienne dépasse : la scène juge, pas un texte. Puis la hauteur est demandée (trois
    // pastilles, ou le modèle de réponse « H = [ ] m ») ; l'heure avance et le rapport ne change pas ; un poteau à planter : où finira son ombre ?
    shows: 'العصا والشيء شاقوليان فهما متوازيان، وأشعّة الشمس متوازية: حين ينتهي الظلّان في النقطة نفسها O يكون OB/OA = BE/AM ، ومنه ارتفاع ما لا نصل إليه',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'cone-cylinder': {
    // LA COUPE AXIALE : un cône (hauteur H, rayon R) et le cylindre posé sur sa base ; l'élève tire le coin du
    // rectangle le long de la génératrice — le coin ne quitte pas le cône (sinon le cylindre le perce) — et lit r, h,
    // h = H − (H/R)·r (Thalès au sommet O) et le volume πr²h ; il cherche le cylindre où h = r.
    shows: 'في المقطع المحوري للمخروط: r/R = (H − h)/H حسب خاصية طالس ، فيُعيَّن بعد الأسطوانة المحاطة بحل معادلة ثم حجمها πr²h',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'group-tanks': {
    // LES RÉSERVOIRS DE GROUPES : chaque groupe est un réservoir de largeur n (son effectif) rempli au niveau
    // de sa moyenne ; l'élève PARIE le niveau du groupe réuni puis ouvre la vanne — le niveau commun est la
    // moyenne pondérée (Σ n·m ÷ N), jamais la moyenne des moyennes. En متقدم, deux classes face à face.
    shows: 'متوسط مجموعتين مجتمعتين هو المتوسط المتوازن: مجموع (التكرار × المتوسط) مقسوم على التكرار الكلي ، وليس متوسط المتوسطين',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  // Unité 10 « حساب المثلثات في المثلث القائم » (2026-10-04) — l'angle aigu se TIENT, les rapports se LISENT.
  'ramp-ratios': {
    // LA RAMPE DU SKATEPARK : un triangle rectangle (la planche = l'hypoténuse, la hauteur, le sol) ; l'élève tourne
    // l'angle et allonge la rampe. Il désigne lui-même, pour l'angle CHOISI, le côté opposé, adjacent et l'hypoténuse
    // (désigner l'hypoténuse comme opposé est refusé), puis compose cos / sin / tan ; agrandir la rampe à angle fixe ne
    // change aucun rapport (نشاط 2), tourner l'angle les change ; la hauteur ne dépasse jamais la planche (0 < sin, cos < 1).
    shows: 'في مثلث قائم: جيب التمام = المجاور ÷ الوتر ، الجيب = المقابل ÷ الوتر ، الظل = المقابل ÷ المجاور ؛ هذه النسب لا تتعلق إلا بقيس الزاوية ، والجيب وجيب التمام محصوران بين 0 و 1',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'trig-calculator': {
    // LA CALCULATRICE DU DRONE : la nacelle d'une caméra de drone s'incline d'un angle ; l'élève tape lui-même les
    // touches (sin / cos / tan, puis 2nd + sin⁻¹ …) sur une calculatrice dessinée réglée en DEG — un réglage RAD ou
    // l'oubli de 2nd donne un nombre absurde que la nacelle CONTREDIT — et arrondit l'écran à la précision demandée.
    shows: 'الحاسبة المبرمجة بالدرجة تعطي قيمة مقربة لنسبة زاوية معلومة (sin ، cos ، tan) ، واللمسات العكسية (2nd ثم sin⁻¹ ، cos⁻¹ ، tan⁻¹) تعطي قيس الزاوية من نسبتها ، ثم ندوّر حسب الدقة المطلوبة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'angle-compass': {
    // LA FICELLE DU CERF-VOLANT : construire, sans rapporteur, l'angle dont on connaît un rapport — l'élève pose
    // l'équerre (angle droit), reporte une longueur sur un côté, ouvre le compas (le fil = l'hypoténuse) et coupe
    // l'autre côté ; le troisième côté se lit par Pythagore, et cos² + sin² = 1 se voit sur les carrés des côtés.
    shows: 'لإنشاء زاوية علمت إحدى نسبها نرسم مثلثا قائما أطوال أضلاعه تحقق النسبة ؛ وفي كل مثلث قائم: مربع جيب التمام + مربع الجيب = 1 ، والظل = الجيب ÷ جيب التمام',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'clinometer': {
    // LE CLINOMÈTRE DU TÉLÉPHONE : l'élève vise le sommet d'un objet inaccessible (projecteur du stade, échelle des
    // graffeurs, مقام الشهيد) avec un téléphone, recule ou avance (la distance est tenue), lit l'angle d'élévation,
    // CHOISIT le rapport qui lie le connu et l'inconnu (un mauvais choix est refusé et dit pourquoi) et calcule ;
    // la hauteur trouvée reste la même à toute distance (l'invariant). Réutilisé par la synthèse (mode « align »).
    shows: 'نترجم الوضعية إلى مثلث قائم ، ونختار النسبة التي تربط الطول المعلوم بالطول المجهول (أو بالزاوية) ثم نحسب ونقرّب النتيجة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  // Unités 11 « الأشعة والانسحاب » et 12 « الأشعة في معلم » (2026-10-04) — la flèche se TIENT, ses مركبتان se LISENT.
  'translation-glide': {
    // LE SPECTACLE DE DRONES : une formation de drones au-dessus de la baie d'Alger glisse d'un bloc ; l'élève fixe la flèche AA′ d'un drone puis place
    // l'image de chaque autre drone — une image dont la flèche diffère par le منحى, le اتجاه ou le طول est refusée et le lab dit lequel ; ABB′A′ se révèle متوازي أضلاع.
    shows: 'الانسحاب ينقل كل نقاط الشكل بنفس الحركة: شعاع واحد له منحى واتجاه وطول ، وكل نقطة وصورتها تعطيان شعاعا مساويا له ، فيتكوّن متوازي أضلاع',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'parallelogram-pin': {
    // LA BANDEROLE DU TIFO : quatre supporters tiennent une banderole ; l'élève déplace le quatrième coin D (ou le point I sur [AB]) ; la banderole
    // ne se tend en متوازي أضلاع que si AB = DC — les milieux des deux diagonales se confondent alors ; AI = IB n'arrive qu'au milieu.
    shows: 'تساوي شعاعين يترجم متوازي الأضلاع: AB = DC يعني أن ABCD متوازي أضلاع (قطراه متناصفان) ، و I منتصف [AB] يعني AI = IB',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'vector-sum': {
    // DEUX MOUVEMENTS, UN SEUL : l'élève enchaîne deux flèches bout à bout (علاقة شال, la trottinette qui fait deux trajets) ou les pose sur la même
    // origine (قاعدة متوازي الأضلاع, le nageur et le courant de l'oued) ; la somme se lit, un enchaînement mal raccordé est refusé ; AB + BA = 0.
    shows: 'مجموع شعاعين هو شعاع الانسحاب الناتج عن انسحابين متتابعين: AB + BC = AC (علاقة شال) ، و AB + AD = AC إذا كان ABCD متوازي أضلاع ، و AB + BA = 0',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'vector-chain': {
    // LES CORRESPONDANCES DU MÉTRO : l'élève assemble une somme de plusieurs vecteurs nommés (des tronçons du métro d'Alger) et la réduit en
    // raccordant les tronçons (Chasles), en remplaçant un vecteur par un égal (متوازي أضلاع) ou en annulant deux opposés ; la figure suit chaque étape.
    shows: 'نبسّط عبارة شعاعية بعلاقة شال وبتعويض شعاع بشعاع يساويه وبحذف شعاعين متعاكسين ، ثم نستنتج منها استقامية نقط أو طبيعة رباعي',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'bridge-path': {
    // LE PLUS COURT PASSAGE (وضعية « ممر الراجلين » ; passerelle du Rhummel à مبتدئ) : le passage [MN], perpendiculaire aux deux bords, se
    // déplace le long de la route (la position est tenue) ; la longueur A → M → N → B se lit ; B′, image de B par le انسحاب de vecteur NM,
    // est posée par l'élève (jugée par `vectors.relation`) : MB′BN متوازي أضلاع, NB = MB′, et le trajet le plus court a M sur [AB′].
    shows: 'لإيجاد أقصر مسلك يعبر ممرا عرضه ثابت ننقل نقطة الوصول B بالانسحاب الذي شعاعه NM ، فيصبح المسلك من A إلى B′ مرورا بالنقطة M خطا مستقيما',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'component-steps': {
    // L'APPLI DE LIVRAISON : le livreur va de A à B sur le quadrillage d'un quartier en pas horizontaux puis verticaux ; les pas comptés (avec leur
    // signe) SONT les deux composantes ; depuis l'origine O, les composantes de OM sont les coordonnées de M ; dessiner un vecteur de composantes données.
    shows: 'مركبتا شعاع في معلم متعامد ومتجانس هما الإزاحة الأفقية والإزاحة العمودية (بإشارتيهما) من مبدئه إلى نهايته ، ومركبتا OM هما إحداثيتا M',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'component-calc': {
    // LE PORTAIL DU JEU : deux portails A et B d'une carte de jeu mobile ; l'élève calcule x_B − x_A et y_B − y_A (le signe compte) et le portail
    // ne s'ouvre que sur les bonnes composantes ; puis il place D pour que AB = DC (deux coordonnées inconnues).
    shows: 'مركبتا AB هما (xB − xA ; yB − yA) ، ويتساوى شعاعان إذا تساوت مركباتهما ، ومنه نحسب إحداثيتي نقطة مجهولة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'midpoint-distance': {
    // LE RENDEZ-VOUS GPS : deux amis partagent leur position ; l'élève place le point de rencontre à mi-chemin (moyenne des abscisses et des
    // ordonnées) puis mesure la distance en dessinant l'escalier Δx, Δy (le triangle rectangle) — Pythagore donne AB.
    shows: 'منتصف [AB] إحداثيتاه متوسطا إحداثيتي الطرفين ، والمسافة AB هي وتر مثلث قائم ضلعاه |xB − xA| و |yB − yA|',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'shape-prover': {
    // LE TERRAIN DE FOOT : des plots posés sur le terrain quadrillé forment un triangle ou un quadrilatère ; l'élève déplace les plots et choisit
    // les preuves (carrés des distances, composantes égales, milieux des diagonales) qui établissent la nature — une conclusion sans preuve suffisante est refusée.
    shows: 'نثبت طبيعة مثلث بحساب المسافات (وعكس فيثاغورس) وطبيعة رباعي بتساوي مركبات شعاعين وتناصف القطرين وتقايسها أو تقايس ضلعين متتاليين ، وانتماء نقطة لدائرة بمقارنة بعدها عن المركز بنصف القطر',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'route-compare': {
    // DEUX PARCOURS (wadiya-idmajiya-maalam, وضعية « عدّاءان » p. 148 ; rallye au Sahara à مبتدئ) : l'élève parie, puis construit
    // chaque parcours morceau par morceau — la balise suivante d'une ligne brisée (composantes et √(Δx² + Δy²) sous la main),
    // le CENTRE d'un demi-cercle (l'arc ne se referme sur le parcours qu'au milieu du diamètre) — ; deux montres additionnent
    // exactement (3π ; √13 + √5 + √17) puis en valeur approchée, et le pari est confronté au calcul. Manuel : chaque pose est un essai.
    shows: 'نقارن مسارين في معلم: نبني كل مسار قطعة بقطعة — طول قطعة مستقيمة هو المسافة بين طرفيها، ونصف الدائرة مركزه منتصف قطرها وطوله πr — ثم نجمع الأطوال ونقارن',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // Unité 13 « الدوران - الزوايا - المضلّعات المنتظمة » (2026-10-04) — calcul exact : packages/core/arithmetic/rotation.js.
  'rotation-dial': {
    // LA GRANDE ROUE : l'élève fait tourner une nacelle M autour du moyeu O ; l'image M′ n'est acceptée que si OM′ = OM, \widehat{MOM′} = α ET le
    // sens est le bon (`rotation.imageCheck` dit lequel manque) ; puis les images d'un segment, d'une droite, d'un cercle.
    shows: 'صورة النقطة M بالدوران الذي مركزه O وزاويته α هي النقطة M′ بحيث OM′ = OM و الزاوية MOM′ = α في الاتجاه المعطى ، ومنها صور القطعة والمستقيم والدائرة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'shape-turn': {
    // LE ZELLIGE : l'élève fait tourner un motif (triangle, quadrilatère) autour d'un centre ; les jauges montrent ce qui RESTE (longueurs, angles,
    // alignement, aire) et ce qui change (position, direction) ; une « fausse rotation » qui déforme est refusée.
    shows: 'الدوران يحافظ على الأطوال وأقياس الزوايا واستقامية النقط والمساحات ، ونوظّف ذلك لإثبات تقايس قطع أو زوايا وتعامد أو توازي مستقيمات',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'inscribed-angle': {
    // L'ANGLE DE TIR : les poteaux A et B sur un cercle ; l'élève déplace le tireur M sur le cercle — l'angle \widehat{AMB} ne change pas tant
    // que M reste sur le même arc, et vaut la moitié de l'angle au centre \widehat{AOB} ; hors du cercle, il change.
    shows: 'الزاوية المحيطية قيسها نصف قيس الزاوية المركزية التي تحصر معها نفس القوس ، وكل الزوايا المحيطية التي تحصر نفس القوس متقايسة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'polygon-forge': {
    // LA FORGE DE POLYGONES : l'élève choisit l'angle du دوران (ou n) et fait tourner un sommet autour du centre, image après image ; la figure ne
    // se REFERME en polygone régulier que si l'angle vaut 360°/n ; l'étoile du drapeau en est le cas à 72°.
    shows: 'رؤوس مضلع منتظم ذي n ضلعا على دائرة مركزها مركزه ، وكل رأس صورة الذي قبله بالدوران الذي زاويته 360°/n ، ومنه زاوية المضلع وطول ضلعه',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false, autoComplete: { unlock: 'config' } },
  },
  'lamp-ring': {
    // LES LAMPADAIRES DU ROND-POINT (أدمج تعلّماتي) : n lampadaires régulièrement espacés autour d'un massif circulaire ; l'élève règle n et le
    // rayon, l'angle au centre et l'écart entre deux lampadaires se calculent (triangle rectangle, sin) ; un espacement inégal est refusé.
    shows: 'نوزّع n نقطة بانتظام على دائرة: الزاوية المركزية 360°/n ، والمسافة بين نقطتين متتاليتين 2r·sin(180°/n) بالمثلث القائم',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // Unité 14 « الهندسة في الفضاء » (2026-10-05) — calcul exact : packages/core/arithmetic/space.js ; scène 3D commune :
  // lessons/common/manipulations/space/stage3d/ (three.js, repli SpaceFigure).
  'sphere-probe': {
    // LA SONDE : l'élève déplace un point M dans l'espace autour du centre O ; la كرة (surface creuse) ne l'accepte que si
    // OM = R, la جلّة (boule pleine) dès que OM ≤ R (comparaison exacte de OM² et R²) ; puis un plan par O découpe un grand cercle.
    shows: 'الكرة التي مركزها O ونصف قطرها R هي مجموعة النقط M من الفضاء حيث OM = R ، والجلة هي مجموعة النقط M حيث OM ≤ R ، والدائرة الكبرى مركزها O ونصف قطرها R',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'orange-peel': {
    // ARCHIMÈDE ET L'ORANGE : l'élève règle R ; la peau de la sphère couvre exactement QUATRE disques de rayon R (4πR²) et l'eau
    // de la boule remplit les DEUX TIERS du cylindre de hauteur 2R qui l'enveloppe (4/3·πR³).
    shows: 'مساحة الكرة 4πR² تساوي المساحة الجانبية للأسطوانة التي تحيط بها ، وحجم الجلة 4/3·πR³ يساوي ثلثي حجم هذه الأسطوانة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'section-slicer': {
    // LA TRANCHEUSE : l'élève monte un plan (ou le fait glisser parallèlement à une face, à une arête, à l'axe) à travers un
    // solide ; la section se dessine et se mesure en direct — cercle de rayon √(R² − h²), rectangle, réduction de la base.
    shows: 'مقطع كرة بمستو دائرة نصف قطرها √(R² − h²) ، ومقطع بلاطة قائمة أو أسطوانة دوران مستطيل أو دائرة ، ومقطع هرم أو مخروط بمستو موازٍ للقاعدة تصغير لها',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'scale-blocks': {
    // LES BLOCS : l'élève règle le rapport k d'un pavé construit en cubes unités ; on COMPTE les arêtes (× k), les carrés d'une
    // face (× k²), les cubes (× k³) — le piège « le volume est multiplié par k » est refusé par le décompte.
    shows: 'في تكبير أو تصغير نسبته k تضرب الأطوال في k والمساحات في k² والحجوم في k³',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'bucket-fill': {
    // LE SEAU (أدمج تعلّماتي, le تحدّ) : un tronc de cône rempli jusqu'à un niveau ; l'élève prolonge les génératrices jusqu'au
    // sommet du cône (Thalès), lit le rapport k du petit cône et calcule le volume d'eau V = V_grand·(1 − k³).
    shows: 'حجم مخروط مبتور = حجم المخروط الكبير − حجم المخروط الصغير ، والمخروط الصغير تصغير للكبير نسبته k فحجمه k³ مرة حجم الكبير',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 2 « الجمع والطرح » (2026-10-14, cycle moyen phase 3) — le SENS des deux opérations.
  'story-bars': {
    // LE MODÈLE EN BARRES D'UNE HISTOIRE (« مخطط بأقواس », manuel p. 26 et 29) : l'élève tient l'INCONNUE — il tire la
    // taille d'un élève devant la toise jusqu'à ce que la phrase de l'histoire soit vraie, puis choisit le calcul qui
    // donne cette taille (مبتدئ) ; ou il pose chaque carte de calcul du manuel sur son texte (نشاط 1, متقدم). La bande
    // ne se FERME que si les parties font le tout : l'inconnue est le tout ⇒ on additionne, une partie ⇒ on soustrait —
    // quels que soient les mots « يزيد / ينقص » de l'histoire.
    shows: 'المجهول هو الكلّ (المجموع) ⇐ نجمع الجزأين ؛ المجهول جزء (حدّ) ⇐ نطرح الجزء الآخر من الكلّ — الكلمة « يزيد » أو « ينقص » وحدها لا تقرّر العملية',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 3 « الضرب والقسمة » (2026-10-14) — la division euclidienne.
  'division-jumps': {
    // LE RUBAN DES BOUQUETS / LES SAUTS SUR LA DROITE : b est DONNÉ (la taille d'un bouquet, d'un saut) ; l'élève tire le
    // ruban (ou la suite de sauts) : q groupes. Un groupe de trop demande des fleurs qui n'existent pas (b(q+1) > a), un
    // groupe de moins laisse de quoi en faire un autre (r ≥ b) : le quotient est le plus grand q tel que bq ≤ a, et r < b.
    shows: 'القسمة الإقليدية: الحاصل هو أكبر عدد من المجموعات الكاملة، ونتوقف عندما يصبح الباقي أصغر من المقسوم عليه ؛ a = b × q + r مع r < b',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 3 — les critères de divisibilité.
  'digit-cards': {
    // LA TABLE ET LES CARTES DE CHIFFRES : (مبتدئ, نشاط 4) l'élève colorie dans la table 0–48 à 7 colonnes les multiples de 2,
    // 5 puis 3 — chaque case jugée par son reste — et voit apparaître les chiffres des unités / les sommes des chiffres ;
    // (متقدم, تمرين 26) il FORME des nombres avec les cartes 4, 5, 9, 3 : permuter les chiffres ne change jamais la
    // divisibilité par 3 ou 9, déplacer le chiffre des unités la change pour 2 et 5, seuls les deux derniers chiffres
    // décident pour 4 — et aucun arrangement ne se divise par 4.
    shows: 'يقبل العدد القسمة على 2 أو 5 حسب رقم آحاده، وعلى 3 أو 9 حسب مجموع أرقامه، وعلى 4 حسب العدد المشكّل من رقميه الأخيرين ؛ ويقبل a القسمة على b إذا كان باقي القسمة الإقليدية معدومًا',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية » (2026-10-14) — l'écriture des entiers et la valeur de position.
  'rank-exchange': {
    // L'ÉCHANGE DIX POUR UN : la main déplace des QUANTITÉS entre les rangs — elle lie 10 objets d'un rang en 1 objet du
    // rang suivant et le porte dans sa colonne, ou ouvre 1 objet en 10 du rang précédent. Le nombre ne s'écrit que
    // quand aucune colonne n'en tient 10 : le chiffre est ce qui RESTE dans un rang après l'emballage, et « عدد العشرات »
    // compte aussi les dizaines enfermées dans les centaines et les milliers (2017 : رقم 1، عدد 201). مبتدئ : l'atelier
    // d'emballage des crayons (crayon, paquet de 10, boîte de 100, carton de 1000) ; متقدم : les jetons de rang du manuel
    // (999 + 1 en cascade, 1000 − 1, les dictées 7065 et 4 908 732 par classes). Chaque geste est un essai : MANUEL (§6bis).
    shows: 'كل 10 وحدات من مرتبة تساوي وحدة واحدة من المرتبة التي على يسارها ؛ رقم المرتبة هو ما يبقى فيها بعد التحزيم، وعدد وحداتها يشمل ما في المراتب الأعلى (2017: رقم العشرات 1 وعدد العشرات 201) ؛ والصفر يحفظ مكان مرتبة فارغة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 4 « الكتابات الكسرية » (2026-10-14) — les écritures fractionnaires d'un même nombre et la réduction.
  'fraction-knife': {
    // LE COUTEAU ET LA PART : une part FIXE d'un tout (la part des voisins sur le plateau de قلب اللوز de grand-mère ; le
    // rectangle du نشاط 4) — son bord ne bouge jamais ; la main tient le COUTEAU : d, le nombre de morceaux égaux du tout
    // (rail étiré, plus fin ou plus grossier). La part ne s'écrit a/d que si son bord tombe SUR une coupe : sinon un morceau
    // est à cheval (« 3 قطع وجزء من قطعة ») et aucune écriture n'existe. Les écritures lisibles sont (p×k)/(q×k) ; remonter
    // vers moins de morceaux (27/45 → 9/15 → 3/5) c'est réunir k morceaux en un : diviser les deux termes par k — réduire.
    // مبتدئ : 3/5 de plateau, d de 1 à 20, la proposition d'Amine « 4/6 » (ajouter 1 aux deux termes) jugée par le plateau ;
    // متقدم : les trois rectangles du manuel (3/5, 6/10, 12/20) puis le cadeau du grand-père 27/45 de 3500DA, PRÉDIT (épingles
    // sur le rail) puis réduit. Chaque coupe est un essai jugé : MANUEL (§6bis).
    shows: 'نفس الحصّة لها كتابات كسرية عديدة: ضرب البسط والمقام في نفس العدد غير المعدوم أو قسمتهما على نفس العدد لا يغيّر الكسر ؛ والاختزال هو جمع كل k قطع في قطعة واحدة: قسمة البسط والمقام على قاسم مشترك',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 2 « الكسور والعمليات عليها » (2026-10-14) — la division euclidienne pour tout diviseur et l'encadrement du quotient.
  'egg-trays': {
    // LE TAPIS ET LA RÈGLE DES PLATEAUX : b est DONNÉ (12 œufs par boîte, 30 par plateau) ; la main tient a, le nombre d'œufs
    // posés sur le tapis (1AM tenait q, 4AM tenait b). Le plateau ouvert se FERME tout seul à b œufs : il n'en tient jamais b
    // (r < b est physique), et les plateaux fermés font q. Sous le tapis, la RÈGLE DES PLATEAUX (même ligne, échelle ÷ b) porte
    // le repère « a ÷ b » : son écart à q EST le remplissage r/b du plateau ouvert. Le quotient tombe SUR une graduation si et
    // seulement si r = 0 (b يقسم a) ; sinon il est strictement entre q (plateaux pleins, valeur approchée par défaut) et q + 1
    // (plateaux nécessaires, par excès). L'élève ENCADRE le repère (un cadre d'une unité sur la règle), jugé avec ses propres
    // œufs ; la division du fils du manuel (2145 = 30 × 70 + 45) est réfutée par le plateau qui se ferme à 30.
    shows: 'حاصل القسمة a ÷ b عدد يقع بين عددين طبيعيين متتاليين: q (الصفائح المملوءة، قيمة مقرّبة بالنقصان) و q + 1 (الصفائح اللازمة، بالزيادة) ؛ ويقع على عدد طبيعي بالضبط إذا وفقط إذا كان الباقي معدومًا (b يقسم a) ؛ والباقي أصغر دائمًا من b',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 4 « الكتابات الكسرية » (2026-10-15) — la fraction est le quotient : le nombre qui, multiplié par b, donne a.
  'fair-share': {
    // LE PARTAGE ÉQUITABLE : a pains sont posés sur la table pour b enfants ; la main tient la PART x d'un enfant (un curseur sur
    // une règle) et le labo met b parts bout à bout contre les a pains : b × x < a (il reste du pain), b × x > a (il manque du pain
    // qui n'existe pas), ou b × x = a. La règle décimale (pas d'un dixième, d'un centième, d'un millième) tombe juste pour 3 pains
    // et 4 enfants (0,75) mais JAMAIS pour 2 pains et 3 enfants, 5 et 6, 7 et 3 (il manque toujours un peu) ; la règle des morceaux
    // (chaque pain coupé en b morceaux égaux, x = m morceaux) tombe juste pour tout a et tout b ≠ 0, à m = a. Le nombre qui multiplié
    // par b donne a s'écrit a/b ; il est décimal seulement parfois ; 0,66 n'en est qu'une valeur approchée. مبتدئ : la cantine de
    // l'école (3 ÷ 4 puis 2 ÷ 3) ; متقدم : نشاط 1 du manuel (5 ÷ 6) puis 7 ÷ 3 (la part dépasse un pain). Chaque relâchement est
    // un essai jugé : MANUEL (§6bis).
    shows: 'العدد الذي إذا ضُرب في b أعطى a موجود دائمًا (b ≠ 0) ويُكتب a/b: هو حاصل قسمة a على b ؛ وليس عددًا عشريًا دائمًا: 3 ÷ 4 = 0,75 أمّا 2 ÷ 3 فلا كتابة عشرية مضبوطة له، و 0,66 قيمة مقرّبة فقط ؛ a/b × b = a',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية » (2026-10-15) — le كسر عشري, l'écriture à virgule et × ÷ 10, 100, 1000.
  'decimal-comma': {
    // LA VIRGULE SOUS LA MAIN : les CHIFFRES d'un bon de commande sont fixes ; la main tient la VIRGULE (sa place dans la suite
    // de chiffres, donc le nombre de chiffres après elle). La valeur est N / 10^p : chaque cran vers la droite rend la pièce du
    // dernier chiffre dix fois plus petite. Monde `mosaic` (atelier de zellige) : la valeur se DESSINE en blocs honnêtes — panneau
    // (1), bande (1/10), carreau (1/100), éclat (1/1000) — et se juge contre la table du client (`match`) ou contre un
    // كسر عشري donné (`fraction`) : 235 donne 235, 23,5, 2,35 ou 0,235 selon la virgule, et le nombre de chiffres après la
    // virgule est le nombre de zéros du dénominateur. Monde `machine` : une machine ×10, ×100, ×1000, ÷10, ÷100, ÷1000, ×0,1 …
    // (`shift`) ; la virgule glisse sous les chiffres, le nom de rang de chaque chiffre suit, et la virgule ne passe jamais le
    // bout des chiffres : il faut y poser un zéro. Chaque relâchement de la virgule est un essai jugé : MANUEL (§6bis).
    shows: 'الكسر العشري N/10^k يُكتب بالفاصلة بوضع k رقمًا بعدها ؛ عدد الأرقام بعد الفاصلة هو عدد أصفار المقام ؛ كل رقم يعدّ أجزاءً أصغر بعشر مرّات من الرقم الذي على يساره ؛ وإزاحة الفاصلة مرتبة نحو اليمين تضرب في 10 ونحو اليسار تقسم على 10 مع كتابة الأصفار عند اللزوم',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 1 (2026-10-15) — comparer et ranger des nombres décimaux.
  'ruler-compare': {
    // LA GRADUATION SOUS LA MAIN : deux (ou plusieurs) nombres décimaux sont des longueurs de sauts (en mètres) ; la main tient la
    // GRADUATION de la règle (m, dm, cm, mm). À la graduation g, chaque nombre se LIT comme un nombre ENTIER de graduations
    // (floor(x · 10^g)) plus un reste strictement plus petit qu'une graduation, dessiné hachuré, jamais arrondi. Le jugement
    // « < = > » n'est permis que lorsque la règle SÉPARE les deux nombres (lectures entières différentes) ou les égale sans reste :
    // sinon la règle est trop grossière (4,6 et 4,65 se lisent 46 dm tous deux). Ainsi se découvrent la comparaison rang par rang
    // (le premier rang où les chiffres diffèrent décide) et la comparaison de deux entiers après avoir complété par des zéros
    // (4,6 = 4,60 : 460 cm contre 435 cm). Tâches `compare` (deux nombres) et `order` (ranger une suite).
    shows: 'لمقارنة عددين عشريين نقارن جزأيهما الصحيحين، فإن تساويا قارنّا رقم الأعشار ثم رقم الأجزاء من مائة وهكذا حتى أوّل رتبة يختلف فيها الرقمان ؛ أو نكمل بأصفار غير ضرورية حتى يصير لهما عدد الأرقام نفسه بعد الفاصلة فنقارن عددين طبيعيين ($4{,}6=4{,}60$ أكبر من $4{,}35$) ؛ وبهذا نرتّب سلسلة أعداد عشرية',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 11 (2026-10-15) — surface, périmètre, aire.
  'tile-yard': {
    // LE CARREAU SOUS LA MAIN : la main tient UN CARREAU (une unité d'aire). Monde `yard` : une cour de zellige faite de n carreaux
    // et sa clôture ; on déplace un carreau (jamais de carreau ajouté ni ôté en mode `fence`) : l'AIRE (le nombre de carreaux) ne
    // bouge pas et le PÉRIMÈTRE (le nombre de piquets de clôture, une unité de longueur chacun) change. Mode `rope` : la clôture a une
    // longueur FIXE (un rouleau de 12) et les carreaux sont libres : même périmètre, aires différentes. Monde `floor` : poser des
    // carreaux d'une unité sur un sol (carreaux entiers, demi-carreaux le long d'un bord oblique, puis l'unité double) pour LIRE
    // l'aire ; le nombre dépend de l'unité (21 unités ① = 10,5 unités ②). Chaque geste validé est un essai : MANUEL (§6bis).
    shows: 'المساحة هي عدد وحدات المساحة (البلاطات) التي تغطّي السطح، والمحيط هو طول حدّه (عدد وحدات الطول على السياج): تبديل مواضع البلاطات يُبقي المساحة ويغيّر المحيط، وبحبل بطول ثابت نحصل على مساحات مختلفة ؛ وعدد الوحدات يتغيّر بتغيّر وحدة المساحة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 4 « الحساب الحرفي » (2026-10-20) — simplifier, supprimer les parenthèses.
  'like-terms': {
    // LE TERME SOUS LA MAIN : chaque terme d'une expression est une PIÈCE dessinée à sa forme (x² un carré de côté x, x une
    // réglette de longueur x, 1 un petit carré ; le signe − une pièce « opposée » rouge). Monde `collect` : la main porte chaque
    // pièce dans le plateau de SA forme ; une pièce d'une autre forme est refusée (ses valeurs à x diffèrent) ; une pièce et son
    // opposée s'annulent ; l'expression réduite S'ÉCRIT quand tout est rangé, et sa valeur à x reste celle de l'expression de départ.
    // Monde `brackets` : des caisses « +( … ) » / « −( … ) » ; la main fait sortir chaque pièce « telle quelle » ou « signe changé »
    // et la valeur de l'expression à x (que la main règle aussi) refuse la mauvaise sortie. Chaque geste est une réponse : MANUEL (§6bis).
    shows: 'نجمع الحدود المتشابهة فقط (لها الجزء الحرفي نفسه) فنجمع معاملاتها، ونحذف قوسين مسبوقين بـ $+$ دون تغيير الإشارات وقوسين مسبوقين بـ $-$ بتغيير إشارة كل حدّ بينهما، وقيمة العبارة لا تتغيّر',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 4 « الحساب الحرفي » (2026-10-21) — développer : k(a + b) et (a + b)(c + d).
  'area-split': {
    // LA COUPURE SOUS LA MAIN : un terrain de jardin d'école dont les deux côtés sont les facteurs (k, x + 4, x − 3, 2x + 1…). Monde
    // `plot` : la main FAIT GLISSER la coupure (poignée sur un bord) jusqu'à l'endroit où l'écriture du côté change de terme, puis
    // DÉCIDE le signe de chaque parcelle (une parcelle ôtée — une allée dallée — se soustrait ; la parcelle du COIN, ôtée deux fois,
    // se rend) : le juge est l'aire comptée du terrain, au x que la main règle aussi ; une coupure ailleurs qu'au bord d'un terme et un
    // signe faux sont refusés avec les deux aires. Monde `arrows` : l'expression est écrite, la main TRACE les flèches du facteur vers
    // chaque terme de l'autre parenthèse (les flèches rouges du manuel) ; chaque produit partiel est jugé par sa valeur à x, puis les
    // termes semblables se réunissent. Chaque geste validé est une réponse : MANUEL (§6bis).
    shows: 'مساحة المستطيل تساوي جداء بعديه وتساوي مجموع مساحات أجزائه، فنحصل على النشر: $k(a+b)=ka+kb$ و $(a+b)(c+d)=ac+ad+bc+bd$ ، وكل حدّ في القوس الأول يضرب كل حدّ في القوس الثاني',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 11 « خاصية فيثاغورس، جيب تمام زاوية » (2026-10-20) — la propriété de Pythagore et sa contraposée.
  'pythagoras-tanks': {
    // LES BASSINS CARRÉS SOUS LA MAIN : une machine d'exposition scientifique — trois bassins carrés minces (même épaisseur : l'eau
    // se mesure en AIRE) construits sur les côtés d'un triangle ABC articulé en A. La main tient l'ANGLE en A (mode `angle`) ou la
    // LONGUEUR BC sur un ruban au dixième (mode `length`) ; « اسكب » verse l'eau des deux petits bassins (AB² + AC²) dans le grand
    // (BC²) : plein juste seulement quand l'angle est droit, débordement s'il est aigu, vide s'il est obtus. La touche √ règle le
    // ruban sur la longueur exacte √n. Chaque versement est un essai : MANUEL (§6bis).
    shows: 'في مثلث قائم مربع طول الوتر يساوي مجموع مربعي طولي الضلعين الآخرين، وإذا لم تتحقّق المساواة فالمثلث غير قائم',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 3 « القوى ذات أسس نسبية صحيحة » (2026-10-21) — la puissance d'un nombre relatif.
  'power-train': {
    // L'EXPOSANT SOUS LA MAIN : un train part de la gare en portant 1 ; chaque wagon attelé à droite de la locomotive est
    // « × a », chaque wagon à sa gauche est « ÷ a ». La main tient n, la longueur SIGNÉE du train (poignée de queue sur un rail
    // gradué de −5 à 6, −/+, flèches) : le train porte aⁿ. Base négative : la charge change de signe à chaque wagon ; aucun
    // wagon : 1 ; n wagons « ÷ » : 1/aⁿ. Monde `couple` : deux trains de même base attelés (B retourné pour diviser), les wagons
    // × et ÷ s'annulent par paires : aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ. Chaque exposant lâché est un essai : MANUEL (§6bis).
    shows: 'القوة $a^n$ جداء $n$ عاملًا كلّها تساوي $a$ ، وإشارتها سالبة فقط إذا كان $a$ سالبًا و $n$ فرديًا ؛ $a^0 = 1$ و $a^{-n} = \\frac{1}{a^n}$ ؛ و $a^m \\times a^n = a^{m+n}$ و $\\frac{a^m}{a^n} = a^{m-n}$',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 1 « الأعداد النسبية » (2026-10-26) — le produit de deux nombres relatifs.
  'elevator-reel': {
    // LE TEMPS SIGNÉ SOUS LA MAIN : un ascenseur de charge passe par le rez-de-chaussée à l'instant 0 d'un film de surveillance, à vitesse
    // constante r (étages par minute, SIGNÉE : r < 0 = il descend). À l'instant t (minutes, SIGNÉ : t < 0 = avant son passage) il est à
    // l'étage r × t. La main tient t (curseur sur la ligne du temps, −/+, flèches) et, en متقدم, le sens et la distance de r (levier, −/+).
    // Pour t > 0 la cabine suit la somme répétée ; pour t < 0 le film est REMBOBINÉ et la cabine apparaît de l'autre côté de la rue :
    // (−) × (−) = (+) est un fait du monde. Chaque temps lâché est un essai jugé exactement : MANUEL (§6bis).
    shows: 'جداء عددين نسبيين لهما الإشارة نفسها موجب، ولهما إشارتان مختلفتان سالب، ومسافته إلى الصفر هي جداء المسافتين إلى الصفر ؛ و $a \\times 0 = 0$',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 1 « الأعداد النسبية », module 2 معارف (2026-10-27) — pourquoi le produit de deux négatifs est positif.
  'sign-machine': {
    // LE SECOND FACTEUR SOUS LA MAIN : la machine du نادي الرياضيات porte un premier facteur a ; la main fait descendre b de 4 à −4
    // (curseur sous neuf colonnes, −/+) et chaque b visité ALLUME sa colonne a × b au-dessus ou au-dessous de la ligne 0 — le tableau se
    // construit, l'écart entre deux colonnes voisines reste −a de l'autre côté de 0. Le côté négatif est verrouillé avant la PRÉDICTION ;
    // en متقدم la main retourne aussi le signe de a et le tableau entier se renverse. Chaque b lâché est un essai : MANUEL (§6bis).
    shows: 'كلّما نقص العامل الثاني بـ 1 تغيّر الجداء بالمقدار نفسه، حتى بعد الصفر: لذلك يكون جداء عددين سالبين موجبًا، ويتغيّر إشارة الجداء كلّما تغيّرت إشارة أحد عامليه',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 4 « الحساب الحرفي » (2026-10-26) — calculer la valeur d'une expression, le contre-exemple.
  'marble-run': {
    // LA VALEUR SOUS LA MAIN : le club de sciences a bâti un mur de billes qui CALCULE une expression — ses stations sont les opérations
    // de l'expression (la copieuse du carré, la presse du produit, le basculeur du moins, la jonction du + et du −). La main choisit la
    // VALEUR de la lettre (une bille lâchée dans le réservoir, qui envoie une bille identique à chaque endroit de la lettre), ÉCRIT sous
    // le mur la ligne de la substitution (parenthèses autour d'une case, signe × devant une case) puis lance la glissière : le mur calcule
    // ce que l'expression SIGNIFIE, un lecteur strict ce que la LIGNE dit, et la première station où ils se séparent s'allume. Monde
    // `twins` : deux murs sous UN réservoir, la main compare les paniers et déclare « contre-exemple » ou « égales » (انشر prouve).
    // Chaque course est un essai jugé exactement : MANUEL (§6bis).
    shows: 'نعوّض الحرف بالعدد نفسه في كل مكان منه، ونُظهر علامة الضرب، ونضع العدد السالب بين قوسين، ثم نحسب باحترام أولوية العمليات ؛ وقيمة واحدة تختلف عندها عبارتان تثبت أنهما غير متساويتين، أمّا تساوي القيم فلا يثبت التساوي',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 3 « الأعداد النسبية » (2026-10-21) — comparer et ranger des relatifs.
  'zero-probe': {
    // LA DISTANCE À ZÉRO SOUS LA MAIN : un capteur A est fixé à un nombre relatif (une altitude en mètres) ; un second capteur B
    // pend au bout d'un câble qui part du zéro (la surface de la mer). La main tient la LONGUEUR du câble (nœud glissant sur
    // l'échelle −10 … 10, −/+, flèches), le CÔTÉ (فوق / تحت الصفر) est un interrupteur à part : le nombre relatif de B est une sortie.
    // Il faut rendre B plus bas / plus haut que A, ou entre deux repères ; sous le zéro, plus de câble rend B plus BAS ; un côté peut
    // interdire une tâche (bouton « لا يوجد طول »). Chaque relâchement est un essai jugé exactement : MANUEL (§6bis).
    shows: 'من بين عددين نسبيين سالبين، الأصغر هو الذي له أكبر مسافة إلى الصفر ؛ والعدد السالب أصغر من الصفر ومن كل عدد موجب',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 5 « المساويات – المتباينات – المعادلات » (2026-10-21) — les opérations sur les deux membres d'une égalité.
  'equality-lanes': {
    // LE NOMBRE D'UNE OPÉRATION SOUS LA MAIN : une égalité dont x est un nombre caché ; deux coureurs se tiennent sur un mur gradué,
    // chacun à la valeur de son membre (ils sont sur la même graduation ⇔ l'égalité est vraie). La main règle c (−9 … 9) et l'opération
    // (+, −, ×, ÷), choisit QUI la reçoit (les deux, ou un seul) et appuie sur « نفّذ » : sur les deux membres l'égalité reste vraie,
    // sur un seul elle se casse du poids de c. Diviser par 0 est refusé, multiplier par 0 vide l'égalité (0 = 0). Chaque pression est
    // un essai : MANUEL (§6bis).
    shows: 'لا تتغيّر مساواة عندما نضيف إلى طرفيها (أو نطرح منهما) العدد نفسه، ولا عندما نضرب طرفيها (أو نقسمهما) في العدد نفسه غير المعدوم؛ أمّا إذا مسّت العملية طرفًا واحدًا فتنكسر المساواة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 5, leçon « المتباينات والعمليات » (2026-10-26) — les opérations sur les deux membres d'une inégalité.
  'loom-threads': {
    // LE NŒUD SOUS LA MAIN : deux poutres graduées (haute et basse) reliées par des fils de laine ; chaque nombre x de la poutre haute est relié à son
    // image. Deux fils portent a (rouge) et b (bleu), a < b. La main tient UN nœud de la poutre basse : le PEIGNE (+ c) le pose à l'image du fil de 0,
    // le CLOU (× c, le fil de 0 cloué en 0) à l'image du fil de 1 ; sa position EST c. Les fils rouge et bleu se croisent ⇔ le facteur est strictement
    // négatif ; × 0 écrase tout sur 0. Déposer le nœud est un essai jugé exactement : MANUEL (§6bis). `loom-threads` n'énonce jamais la règle.
    shows: 'إذا كان $a<b$ فإنّ $a+c<b+c$ ؛ وإذا كان $c>0$ فإنّ $ac<bc$ ؛ وإذا كان $c<0$ فإنّ $ac>bc$ : نغيّر اتجاه المتباينة فقط عند الضرب (أو القسمة) في عدد سالب تمامًا',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 5, leçon « حصر عدد عشري موجب » (2026-10-26) — le tadwir et l'intervalle d'une lecture arrondie.
  'scoop-scale': {
    // LA MASSE SOUS LA MAIN : une balance de دكّان العطّار dont l'ÉCRAN arrondit la masse à un rang (le kilo, 0,1 ou 0,01 kg) pendant qu'une bande de
    // précision écrit la masse exacte. La main VERSE (appui long sur la louche), pince (+1) ou reprend (−1) une pincée : la masse EST le nombre tenu. La commande
    // « أقلّ (ou أكبر) كمّية que l'écran lit R » oblige à trouver où l'écran bascule ; « سلّم الكيس » est l'essai, refusé avec le voisin en chiffres de l'élève.
    // Au niveau متقدم un sachet modèle pèse 2/7 kg : une lampe dit plus léger / plus lourd et ne dit jamais « égal ». Chaque dépôt est un essai : MANUEL (§6bis).
    shows: 'المدوَّر r إلى الرتبة $10^{-k}$ يعني أنّ $r-\\frac{1}{2}\\times10^{-k}\\le x<r+\\frac{1}{2}\\times10^{-k}$ ؛ وحاصل قسمة غير عشري لا تبلغه قيمة مقرّبة بل يُحصَر بينها',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 2 « الكسور والعمليات عليها », leçon 6 « الكسر: نسبة وحاصل قسمة وقيم مقرّبة » (2026-10-28) — le quotient candidat et son encadrement à 0,1 / 0,01.
  'mooring-lines': {
    // LE QUOTIENT SOUS LA MAIN : au quai du port, une corde de a mètres posée sur un ruban gradué ; la main glisse un MOUSQUETON (le quotient candidat q, à un rang : 1, 0,1 ou 0,01)
    // et « ضع القطع » pose les morceaux bout à bout : il reste du câble (يكفي), la dernière pièce tombe sur le bout (تماما) ou elle déborde au-dessus de l'eau (لا يكفي). Le cadran n'ouvre le rang
    // suivant qu'une fois l'encadrement du rang courant TROUVÉ (la plus grande valeur qui tient, la plus petite qui déborde) et la règle ZOOME dans ce segment. مبتدئ : couper a m en b cordes
    // égales (q = la longueur d'une corde) ; متقدم : des cordes de b m, b décimal (q = le nombre de cordes), où la main change aussi l'UNITÉ du ruban (m → dm : les deux longueurs ×10). Chaque pose est un essai jugé exactement : MANUEL (§6bis).
    shows: 'حاصل القسمة $\\frac{a}{b}$ عدد واحد (قيمته المضبوطة) ؛ نحصره بين قيمتين مقرّبتين بالنقصان وبالزيادة إلى $0{,}1$ أو $0{,}01$ ، ولا يبلغه عدد عشري إذا لم تنتهِ القسمة ؛ وضرب الحدّين في $10$ أو $100$ لا يغيّر حاصل القسمة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 2 « الكسور والعمليات عليها », leçon 7 « جمع وطرح كسرين » (2026-10-29) — la distance marchée, en poteaux blancs, sur un sentier à deux sortes de poteaux.
  'trail-odometer': {
    // LA DISTANCE SOUS LA MAIN : un sentier de longueur 1 (ou un circuit), des poteaux BLANCS tous les 1/n et, selon la tâche, des poteaux ROUGES tous les k blancs (l'unité grossière 1/m, n = k·m). La main FAIT
    // MARCHER une scoute (glisser, −/+ un blanc, « مرحلة حمراء » −/+ k blancs) ; « وصلنا » juge l'étape : elle doit se tenir EXACTEMENT sur le poteau visé. L'élève ÉCRIT ensuite où est le groupe : toute écriture
    // égale est acceptée, les fausses (a+c)/(b+d), le rouge compté comme un blanc, (n+a)/b sont refusées et un drapeau en pointillé est planté à leur position. مبتدئ : même dénominateur, deux sortes de poteaux,
    // un retour ; متقدم : la fraction d'arrivée et le reste sont ÉCRITS avant de marcher, puis un circuit (1 + 5/6). « جرّب أعدادك » : toujours ouvert, deux fractions dont un dénominateur est multiple de l'autre.
    shows: 'لا نجمع إلا أجزاء من الحجم نفسه: كسران مقام أحدهما مضاعف لمقام الآخر نكتبهما بالمقام نفسه (نضرب حدّي أحدهما في العدد نفسه) ثم نجمع البسطين أو نطرحهما ونحافظ على المقام ؛ والباقي من الكلّ هو الفرق بين $1$ وما مُشي',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 2 « الكسور والعمليات عليها », leçon 9 « مقارنة كسرين » (2026-10-29) — une hauteur lue dans deux graduations.
  'level-laser': {
    // LA HAUTEUR D'UN LASER SOUS LA MAIN : deux (trois) réservoirs identiques portent chacun un tube de verre gradué en SON nombre de crans ; l'huile monte à a/b de réservoir. La main glisse un niveau laser rouge
    // qui traverse tous les tubes et se colle à la UNION des graduations : une même hauteur se LIT dans les deux (3/4 coupe l'autre tube au cran 9 sur 12, ou « entre les crans 4 et 5 »). L'élève dit quel réservoir
    // a le plus d'huile et ÉCRIT le premier niveau dans les crans de l'autre quand un nombre de crans est multiple de l'autre ; les modèles faux (comparer les seuls numérateurs, croire que plus de crans = plus d'huile,
    // réécrire le seul dénominateur, « un cran de moins que le plein, donc égaux ») sont réfutés PAR LE MONDE : le laser saute au niveau revendiqué et l'autre huile est du mauvais côté du trait rouge. مبتدئ :
    // 5/8 | 7/8, 3/4 | 7/12, 3/5 | 3/8, 9/8 | 5/6 (le trait « 1 ») ; متقدم : tubes voilés (on écrit avant de voir), trois réservoirs à ordonner, numérateurs décimaux, deux réservoirs trop pleins. « جرّب أعدادك » : toujours ouvert.
    shows: 'لمقارنة كسرين: إن كان لهما نفس المقام فأكبرهما ما له أكبر بسط، وإن كان لهما نفس البسط فأكبرهما ما له أصغر مقام، وإن كان مقام أحدهما مضاعفًا لمقام الآخر كتبنا الكسرين بنفس المقام ثم قارنّا البسطين، ونقارن كسرًا بالعدد $1$ بمقارنة بسطه بمقامه',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 3 « الأعداد النسبية », leçon 5 « جمع وطرح عددين نسبيين » (2026-10-29) — la charge d'un montgolfière : sommes et différences de deux relatifs.
  'balloon-ballast': {
    // LA CHARGE SOUS LA MAIN : l'altitude d'un montgolfière est (flammes − sacs). La main attache une flamme (+1) ou un sac (−1), jette l'un ou l'autre, et à متقدم attache une paire neutre. Une carte a ± b dit le geste
    // (« + (−4) » attacher 4 sacs ; « − (−3) » jeter 3 sacs) ; le juge compare le JOURNAL des gestes à la carte ET l'altitude écrite à a ± b. Jeter un sac absent est impossible : on attache d'abord des paires neutres.
    // مبتدئ : sommes (même signe, signes différents, opposés) ; متقدم : différences, l'altitude est écrite AVANT d'exécuter. « جرّب أعدادك » : une carte libre, jamais comptée. MANUEL (§6bis).
    shows: 'جمع عددين نسبيين لهما الإشارة نفسها: نجمع مسافتيهما ونحتفظ بالإشارة ؛ ومن إشارتين مختلفتين: نطرح المسافة الصغرى من الكبرى ونأخذ إشارة الأبعد عن الصفر ؛ ومجموع متعاكسين معدوم ؛ وطرح عدد هو جمع معاكسه',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 3 « الأعداد النسبية », leçon 6 « حساب مجموع جبري » (2026-10-29) — l'équipe de chaque terme d'une somme algébrique.
  'tug-rope': {
    // L'ÉQUIPE DE CHAQUE TERME SOUS LA MAIN : une somme algébrique est une file d'enfants à dossards (un nombre relatif chacun). La main RETOURNE l'enfant précédé de « − » (son dossard devient l'opposé) puis
    // l'ENVOIE dans l'équipe de gauche (drapeau « − ») ou de droite (drapeau « + ») d'une corde ; au coup de sifflet le ruban au milieu avance de (force de droite − force de gauche) : la somme est une SORTIE.
    // Le juge compare, enfant par enfant, le retournement et l'équipe à la contribution vraie ; un crochet est un petit équipage réglé d'abord. مبتدئ : trois chaînes d'entiers ; متقدم : la position est écrite
    // AVANT de siffler, des décimaux, un crochet, la forme simplifiée. « جرّب أعدادك » : toujours ouvert. MANUEL (§6bis).
    shows: 'المجموع الجبري سلسلة جمع وطرح: نحوّل كلّ طرح إلى جمع المعاكس، ثم نجمع الحدود الموجبة معًا والحدود السالبة معًا، ونجمع الناتجين ؛ ويمكن تغيير ترتيب الحدود وحذف المتعاكسين، ونحسب ما بين الأقواس أوّلًا ؛ وتُبسَّط الكتابة بحذف إشارة الجمع وأقواس الأعداد',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 3 « الأعداد النسبية », leçon 1 « التعليم على مستقيم مدرّج » (2026-10-29) — l'abscisse dépend de l'origine et de la valeur d'une graduation.
  'corniche-ruler': {
    // L'ORIGINE ET LA GRADUATION SOUS LA MAIN : une planche de 13 graduations est fixée sous les repères du front de mer ; le drapeau « 0 » se plante sous un repère (مبتدئ) et un levier à crans règle la valeur
    // d'une graduation (متقدم). L'abscisse d'un repère est une SORTIE : elle change quand l'origine bouge alors que le repère n'a pas bougé, deux repères à la même distance de part et d'autre sont opposés,
    // et une graduation trop petite jette un point hors de la planche, trop grande le laisse entre deux graduations. Chaque dépôt, lecture et touche est un essai jugé exactement : MANUEL (§6bis).
    shows: 'فاصلة نقطة هي موضعها مرئيًا من المبدأ: نعدّ التدريجات من المبدأ، يمينًا موجبة ويسارًا سالبة، ونضرب عددها في قيمة التدريجة الواحدة ؛ تتغيّر الفاصلة إذا تغيّر المبدأ، والعددان المتعاكسان لهما المسافة نفسها إلى الصفر وإشارتان مختلفتان، ونختار تدريجة تُبقي كل النقاط داخل المستقيم وعلى تدريجات',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 3 « الأعداد النسبية », leçon 4 « تعليم نقطة في المستوي » (2026-10-29) — les coordonnées d'un point dépendent du piquet d'origine et de l'ordre des deux nombres.
  'dig-grid': {
    // LE PIQUET D'ORIGINE SOUS LA MAIN : une fouille quadrillée de ficelles d'un mètre ; le piquet porte deux cordes (l'axe des abscisses, bleu, et l'axe des ordonnées, vert) qui suivent la ficelle. Les coordonnées d'une trouvaille sont une
    // SORTIE : sa position moins celle du piquet, l'abscisse d'abord. مبتدئ : la main tient le PIQUET (un glissement 2D) pour rendre vrais les relevés du carnet — une trouvaille, deux trouvailles à la fois (un seul piquet), puis un carnet impossible
    // (deux nombres échangés) où « لا يوجد موضع » est la bonne réponse. متقدم : le piquet est fixe, étiquettes voilées : l'élève PRÉDIT les coordonnées (une trouvaille sur l'axe vertical), pose une bague à (2,5 ; −1,5) entre deux ficelles, et marque la place
    // miroir d'une pièce par rapport à la corde bleue. Chaque dépôt, relevé et touche est un essai jugé exactement : MANUEL (§6bis).
    shows: 'نحدّد موضع نقطة في المستوي بعددين في معلم متعامد ومتجانس: الفاصلة أولًا على المحور الأفقي ثمّ الترتيب على المحور العمودي، مثل $A(-3\\,;2)$ ؛ تتغيّر الإحداثيات بتغيّر المبدأ، والنقطة على المحورين إحدى إحداثيتيها معدومة، ونظيرة نقطة بالنسبة إلى محور تحتفظ بالإحداثية التي على هذا المحور',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية », leçon 3 « الأعداد العشرية ونصف المستقيم المدرّج » (2026-10-30) — l'unité de longueur étirée, puis le drapeau planté sur le ruban gradué.
  'jump-tape': {
    // L'UNITÉ ET LE DRAPEAU SOUS LA MAIN : un jour de sport, un ruban de mesure part de la planche d'appel (le MÉTRÉ O) et ne montre RIEN d'autre. مبتدئ : la main étire la marque « 1 » (l'unité de longueur) jusqu'à ce que le plus long saut tienne dans la fosse
    // et que les petites graduations restent distinctes — le ruban dessine alors DIX graduations par unité, chacune à 1/10 = 0,1 ; puis la main plante un drapeau par saut (le métré lit la fenêtre à la volée) ; un drapeau mal planté est refusé par le DESSIN
    // (l'empreinte du saut à sa vraie place, un trait pointillé entre les deux). متقدم : les drapeaux sont déjà plantés, la main promène un curseur de lecture : sur une graduation on lit la valeur exacte, entre deux graduations on lit un ENCADREMENT ;
    // ruban sans son origine (fenêtre 9 … 12) et ruban gradué en centièmes. « جرّب أعدادك » : toujours ouvert. MANUEL (§6bis).
    shows: 'لتدريج نصف مستقيم نختار وحدة طول مناسبة وننقلها انطلاقًا من مبدئه $O$ ثمّ نقسّم كلّ وحدة إلى عشرة أجزاء متساوية، فيكون التباعد بين تدريجتين صغيرتين متتاليتين $\\frac{1}{10}=0{,}1$ وحدة ؛ وفاصلة النقطة $A(2{,}4)$ عددٌ يعيّن موضعها: تبعد عن المبدإ بوحدتين وأربع تدريجات صغيرة ؛ وإذا وقعت نقطة بين تدريجتين متتاليتين قرأنا فاصلتها بحصر لها بينهما',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 5 « الأعداد النسبية », leçon 1 « الأعداد النسبية وسياقات استعمالها » (2026-10-30) — le niveau d'une jauge verticale, lu comme un nombre relatif.
  'frost-gauge': {
    // LE NIVEAU SOUS LA MAIN : une semaine de janvier à Djelfa. Chaque matin la main FAIT MONTER ou DESCENDRE le liquide d'un thermomètre jusqu'à la lecture donnée en MOTS (« 3 درجات تحت الصفر ») ; l'échelle ne
    // montre que le zéro, et un signe n'apparaît devant la lecture qu'une fois le liquide passé SOUS le 0. Deux autres décors portent le même geste : une jauge d'altitude (le point le plus bas du pays, au-dessous du niveau de
    // la mer, à côté d'une colline) et les étages d'un immeuble (la cabine d'ascenseur est le niveau). Le niveau est tenu, le NOMBRE RELATIF est sa sortie : le signe (de quel côté du zéro) et la DISTANCE au zéro sont deux
    // lectures différentes du même niveau. Mode « معاكس » : la main tient un niveau et son ombre suit de l'autre côté du zéro à la même distance. متقدم : deux lectures à la même distance du zéro (6 et −6), les étages,
    // puis qui est le plus loin de la mer. « جرّب أعدادك » : toujours ouvert. Chaque lecture enregistrée est un essai jugé exactement par `signedGauge.js` : MANUEL (§6bis).
    shows: 'العدد النسبي موجب أو سالب: السالب مسبوق بإشارة − ويقع تحت الصفر، والموجب فوق الصفر ؛ وللعدد إشارة ومسافة إلى الصفر مختلفتان ؛ والعددان المتعاكسان لهما المسافة نفسها إلى الصفر وإشارتان متعاكستان، مثل $3$ و $-3$ ؛ والصفر معاكس نفسه',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 6 « الحساب الحرفي », leçon 1 « البحث عن أعداد ناقصة » (2026-10-30) — le tapis d'une machine tourné à rebours avec la carte inverse.
  'rewind-belt': {
    // LA CARTE INVERSE SOUS LA MAIN : un atelier de conditionnement. Une machine à carte (« + 9 », « − 14 », « × 6 » ou la carte piège « 80 − ») a reçu un nombre d'objets et a rendu 54. La main choisit dans une rangée la carte qui
    // FAIT TOURNER LE TAPIS À REBOURS, tire la caisse de la sortie à travers la machine jusqu'au bac d'entrée (le nombre manquant □ apparaît), puis la REPOUSSE en avant à travers la machine d'origine : ce qui sort est comparé à 54
    // (la contre-épreuve par substitution). Une mauvaise carte n'est pas corrigée : la contre-épreuve dit ce qui sort (« 72 au lieu de 54 »). La carte piège « a − □ » est son propre inverse (□ = a − b) : on ne prend pas l'inverse du moins.
    // متقدم : décimaux, la carte « a − » avec des décimaux, et une division qui ne s'arrête pas (20 ÷ 7, une fraction) vérifiée exactement. « جرّب أعدادك » : toujours ouvert. Chaque contre-épreuve est jugée exactement par `missingNumber.js` : MANUEL (§6bis).
    shows: 'للبحث عن العدد الناقص □ في مساواة نعيد الآلة إلى الوراء بالعملية العكسية ثمّ نتحقّق بالتعويض: في مجموع □ + a = b نطرح فنجد □ = b − a ؛ في فرق □ − a = b نجمع ؛ وفي a − □ = b نطرح الناتج من a ؛ وفي جداء a × □ = b نقسم فنجد □ = b ÷ a (وقد يكون الناتج كسرًا)',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 6 « الحساب الحرفي », leçon 2 « تطبيق قاعدة حرفية » (2026-10-30) — la valeur d'un cadran qui remplace une lettre dans toutes ses fentes.
  'letter-dial': {
    // LA VALEUR DU CADRAN SOUS LA MAIN : une papeterie-photocopie. La règle du prix « الثمن = 5 × n + 20 » est imprimée avec sa lettre ; la main TOURNE le cadran de n (12 feuilles, puis le client qui a payé 95, puis une règle où n est écrit DEUX fois) :
    // la valeur tombe dans CHAQUE fente de la lettre et la carte calcule (parenthèses, produits, sommes ; 5 × 12 jamais lu 512). متقدم : la règle d'une clôture P = 2 × (a + b) avec DEUX cadrans (15 et 8, puis 8 et 15 : même périmètre), puis
    // une prétendue règle « a + b = a × b » : (2 ; 2) donne 4 = 4 et ne prouve rien, UN contre-exemple (3 ; 4 : 7 ≠ 12) suffit à la réfuter. « جرّب قاعدتك أنت » : toujours ouvert (une règle tapée, 2x lu 2 × x). Calcul exact : `letterRule.js` : MANUEL (§6bis).
    shows: 'لتطبيق قاعدة حرفية نعوّض كلّ حرف بقيمته في كلّ موضع يظهر فيه ثمّ نحسب (الأقواس أوّلًا ثمّ الضرب ثمّ الجمع والطرح): $5\\times 12+20=60+20=80$ ؛ والضرب المخفيّ بين عدد وحرف يبقى ضربًا: $5n$ من أجل $n=12$ تعني $5\\times 12$ لا $512$ ؛ ويكفي مثال مضادّ واحد، مثل $3+4\\neq 3\\times 4$ ، لإسقاط قاعدة تدّعي أنّها صحيحة دائمًا',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 5 « الأعداد النسبية », leçon 2 « التعليم على مستقيم مدرّج » (2026-10-30) — la foulée portée des deux côtés de l'origine, lue comme une abscisse.
  'stride-stamp': {
    // LA FOULÉE PORTÉE DES DEUX CÔTÉS : une route de village, la station de bus est l'origine O (l'école à l'est, la place de la mosquée à l'ouest). La main PORTE un bâton d'une foulée à partir de O vers l'est puis vers l'ouest : les ticks 1, 2, 3 puis
    // −1, −2, −3 n'apparaissent que tamponnés ; la route est finie, une foulée trop longue ne rejoint pas la lecture ; changer de foulée efface les ticks. Puis le jumeau d'un bâtiment de l'autre côté de O (abscisses opposées), puis des bâtiments
    // placés à leur abscisse (A(−3), B(2,7), C(−1,5)) : l'abscisse est la SORTIE de la main, son signe dit la jambe de la route. متقدم : le drapeau de l'origine sur une droite dont seules deux graduations sont écrites, et l'encadrement d'un
    // bâtiment entre deux ticks consécutifs. « جرّب أعدادك » : toujours ouvert. Chaque enregistrement est un essai jugé exactement par `graduatedLine.js` : MANUEL (§6bis).
    shows: 'لتدريج مستقيم نختار مبدأً واتجاهًا ووحدة طول وننقل الوحدة نفسها من جهتي المبدإ: أعداد موجبة في جهة الاتجاه وسالبة في الجهة الأخرى ؛ وفاصلة النقطة $A(-3)$ هي بعدها عن المبدإ مع إشارة جهتها ؛ والنقطتان المتناظرتان بالنسبة إلى المبدإ فاصلتاهما متعاكستان، مثل $3$ و $-3$ ؛ وإذا وقعت نقطة بين علامتين متتاليتين حصرنا فاصلتها بينهما، مثل $-2<-1{,}5<-1$',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 1AM, unité 5 « الأعداد النسبية », leçon 3 « التعليم في المستوي » (2026-10-30) — un drone conduit sur UN axe à la fois, lu comme un couple de coordonnées.
  'courtyard-drone': {
    // LE DRONE SUR UN AXE À LA FOIS : le plan d'une cour d'école vu d'en haut (l'origine est le mât du drapeau, deux lignes peintes sont les axes gradués). La main conduit un drone D'ABORD le long de la ligne horizontale, fixe l'abscisse,
    // puis le long de la verticale (jamais en diagonale : le drone refuse) et prend la photo. Le lieu est dit par ses DEUX nombres (« la fontaine est à (3 ; −2) ») ou dessiné et lu à la volée ; échanger l'ordre des deux nombres mène à un
    // AUTRE lieu (−2 ; 3). Les points des axes (une coordonnée nulle), puis en متقدم les demi-cases et un papier SANS carreaux (le drone projette ses deux parallèles aux axes). Chaque photo est un essai jugé exactement par `planeFrame.js`. « جرّب أعدادك » : toujours ouvert.
    shows: 'المعلم المتعامد للمستوي يتشكّل من مستقيمين مدرّجين متعامدين لهما المبدأ نفسه: المحور الأفقي هو محور الفواصل والمحور الشاقولي هو محور التراتيب ؛ نعلّم كلّ نقطة بعددين هما إحداثياها $M(x\\ ;\\ y)$ ونقرأ الفاصلة أوّلًا ثمّ الترتيب، فالنقطة $(3\\ ;\\ -2)$ غير النقطة $(-2\\ ;\\ 3)$ ؛ ونقطة محور الفواصل ترتيبها معدوم ونقطة محور التراتيب فاصلتها معدومة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 3 « الأعداد النسبية », leçon 5 « المسافة بين نقطتين على مستقيم مدرّج » (2026-10-29) — l'ouverture d'un compas serré sur une lecture.
  'gap-caliper': {
    // L'OUVERTURE D'UN COMPAS SOUS LA MAIN : un compas en laiton est serré sur une graine d'un grand thermomètre ; la main tourne la vis pour OUVRIR le compas jusqu'à ce que l'autre mâchoire touche la seconde graine.
    // L'ouverture (toujours ≥ 0) est la distance ; une ouverture qui traverse le zéro additionne les deux morceaux. Le juge compare l'atterrissage de la mâchoire à la graine visée. مبتدئ : la graine du bas porte le compas,
    // quatre lectures entières puis la règle ; متقدم : l'ouverture est ÉCRITE avant de tourner la vis (décimaux), le compas serré sur la graine du haut, et une ouverture fixe balancée vers le haut ou vers le bas
    // (deux points à la même distance). « جرّب أعدادك » : toujours ouvert. MANUEL (§6bis).
    shows: 'المسافة بين نقطتين على مستقيم مدرّج هي الفاصلة الكبرى ناقص الفاصلة الصغرى، فهي عدد موجب دائمًا و $AB=BA$ ؛ وللنقطتين اللتين تبعدان بمسافة $d$ عن نقطة فاصلتها $a$ الفاصلتان $a-d$ و $a+d$',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 2 « الكسور والعمليات عليها », leçon 8 « جداء كسرين » (2026-10-29) — les deux facteurs d'un produit de fractions, tenus par deux tirages perpendiculaires sur une fenêtre.
  'window-blinds': {
    // LES DEUX FACTEURS SOUS LA MAIN : la main tire DEUX couvertures perpendiculaires sur une fenêtre — le rideau latéral (largeur a/b, il se colle aux crans de son rail) et le store à enrouleur (hauteur c/d,
    // il se colle aux crans de son cordon). Le verre couvert par les DEUX est le coin doublement ombré ; les deux ombres découpent le verre en b × d petits carrés par fenêtre et le coin en compte a × c. L'élève
    // ÉCRIT la fraction de fenêtre doublement ombrée : toute écriture égale est acceptée, les fausses (a/b + c/d, ac/(b+d), ad/(bc), un seul facteur, ac sans dénominateur) sont refusées et un CADRE en pointillé de
    // l'aire écrite est posé à côté du coin sombre réel. مبتدئ : une fenêtre, 2/3 × 3/4, 1/2 × 3/5, 4/5 × 2/3 ; متقدم : un mur de fenêtres (une fenêtre = 1), le produit est ÉCRIT avant de tirer, des facteurs > 1
    // (3/2 × 2/3, 7/4 × 4/3) et un entier (2 × 3/5). « جرّب أعدادك » : toujours ouvert.
    shows: 'جداء كسرين $\\frac{a}{b}\\times\\frac{c}{d}$ هو مساحة مستطيل بُعداه $\\frac{a}{b}$ و $\\frac{c}{d}$ : يقسّم الظلّان الزجاج إلى $b\\times d$ مربّعًا صغيرًا في النافذة الواحدة، والداكن منها $a\\times c$ ؛ فنضرب البسطين معًا والمقامين معًا، ثم نختزل ؛ و «كسر من كسر» جداء',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 5 (2026-10-21) — résoudre ax + b = cx + d en traversant les termes avec leur signe, puis en divisant.
  'term-ferry': {
    // LE SIGNE D'UN TERME SOUS LA MAIN : une équation dont la solution est CACHÉE ; chaque membre est une rive, chaque terme une caisse. La
    // main porte une caisse d'une rive à l'autre et choisit son signe à l'arrivée (« كما هو » ou « بعكس إشارته ») : changer le signe revient à
    // ajouter l'opposé aux deux membres (l'équation garde sa solution), garder le signe la casse — le refus est le calcul des deux membres au x
    // caché. Quand x est seul d'un côté (a·x = n), la main règle le diviseur ; « عوّض » écrit la vérification. Chaque geste est un essai : MANUEL.
    shows: 'نحلّ معادلة من الشكل $ax + b = cx + d$ بإضافة معاكس حدّ إلى الطرفين (فيعبر الحدّ بإشارة معاكسة) ثم بقسمة الطرفين على معامل $x$ ، ونتحقق بالتعويض',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 5 « التناسبية » (2026-10-21) — le quatrième proportionnel.
  'fourth-gauges': {
    // LE NOMBRE QUI MANQUE SOUS LA MAIN : une planche de prix de marchand (tableau 2×2 de cartes) dont UNE case manque ; la main tient ce
    // nombre (poignée sur une règle, −/+, flèches, saisie) et trois balances d'égalité (« في الكيلو » : le prix d'une unité dans chaque
    // colonne ; « بين العمودين » : combien de fois la quantité et le prix ont grandi ; « الجداءان » : les deux produits en croix)
    // s'inclinent sous le doigt — elles ne s'équilibrent ENSEMBLE que pour un seul nombre ; une 4e balance « الفرق » (c − a contre d − b)
    // s'équilibre au MAUVAIS nombre. Niveau متقدم : balances voilées jusqu'au relâchement. Chaque relâchement est un essai : MANUEL (§6bis).
    shows: 'في جدول تناسبية، إذا علمنا ثلاثة أعداد فالعدد الرابع واحد فقط: يحسب بالمرور بالوحدة أو بمعامل التناسبية أو بالخاصية الجمعية أو الضربية أو بمساواة الجداءين المتصالبين $a \\times d = b \\times c$',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 6 « التناسبية » (2026-10-21) — le pourcentage comme situation de proportionnalité.
  'hundred-grid': {
    // LE POURCENTAGE SOUS LA MAIN : un stock de x sacs coupé en 100 paquets égaux (un plateau de 10 × 10 cases, chaque case vaut x/100). La main
    // PEINT t cases ; le panier reçoit t paquets, soit x × t/100 sacs. L'élève écrit sa réponse AVANT l'ouverture du panier (t % de x, le nouveau stock
    // après +t % ou −t %), cherche le nombre de cases qui remplit un panier donné (le taux a/b = t/100), ou le stock entier dont une part est t % ;
    // une augmentation AJOUTE t cases aux 100, une diminution en RETIRE t ; une hausse puis une baisse du même t % ne ramène pas au départ. Chaque
    // « انقل » est un essai jugé exactement : MANUEL (§6bis).
    shows: 'لحساب $t\\%$ من عدد نضرب هذا العدد في $\\frac{t}{100}$ ؛ ونحسب نسبة مئوية من المساواة $\\frac{a}{b}=\\frac{t}{100}$ ؛ والزيادة بـ $t\\%$ هي الضرب في $1+\\frac{t}{100}$ والتخفيض هو الضرب في $1-\\frac{t}{100}$',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 1, 2e leçon (2026-10-26) — le produit de PLUSIEURS nombres relatifs.
  'robot-track': {
    // LES SIGNES ET L'ORDRE SOUS LA MAIN : un robot part de 1 sur un tapis gradué ; chaque carte de son programme multiplie sa position. Une carte
    // positive l'éloigne du poteau 0 du MÊME côté ; une carte négative le fait en plus SAUTER par-dessus le poteau (le symétrique) : × (−1) est le
    // demi-tour. La main tient le SIGNE de chaque carte (le badge) et l'ORDRE / la PRÉSENCE des cartes (porter, échanger). Le côté d'arrivée ne dépend
    // que du NOMBRE de demi-tours, jamais de l'ordre ; une carte posée DEUX FOIS (le monde `square`) fait deux demi-tours identiques ou aucun. Chaque
    // changement du programme est un essai jugé exactement : MANUEL (§6bis).
    shows: 'إشارة جداء عدة أعداد نسبية غير معدومة سالبة إذا كان عدد عوامله السالبة فرديًا وموجبة إذا كان زوجيًا مهما كان ترتيبها، و $(-1) \\times a = -a$ ، ومربع عدد نسبي لا يكون سالبًا',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 1, 3e leçon (2026-10-26) — le quotient de deux nombres relatifs.
  'code-lockers': {
    // LE CODE MANQUANT SOUS LA MAIN : un casier de la bibliothèque municipale s'ouvre avec le code q qui rend vraie la règle écrite sur sa porte, « b × ? = a ». La main ROULE les molettes du
    // code (une molette de SIGNE et des molettes de chiffres, ou — en mode fraction — trois signes et deux nombres) et tire la poignée : chaque tirage est un essai jugé exactement (MANUEL §6bis).
    // L'écran multiplie en direct (b × code) : la définition « a ÷ b est le nombre q tel que b × q = a » EST le mécanisme ; le signe de q se lit sur le refus (même distance, signe faux). Quand
    // aucun code décimal n'existe, trois écritures (−a/b, a/−b, −(a/b)) ouvrent la même porte ; avec b = 0 aucun code n'ouvre (a ≠ 0) ou tous ouvrent (a = 0). `code-lockers` n'énonce jamais la règle.
    shows: 'حاصل قسمة $a$ على $b$ ($b \\neq 0$) هو العدد $q$ الذي يحقّق $b \\times q = a$ ؛ موجب إذا كان للعددين الإشارة نفسها وسالب إذا اختلفت إشارتاهما، ومسافته إلى الصفر هي حاصل قسمة المسافتين ؛ و $\\frac{-a}{b} = \\frac{a}{-b} = -\\frac{a}{b}$',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 2 « العمليات على الكسور والأعداد الناطقة » (2026-10-25) — le مقلوب et la division de deux fractions.
  'gear-crank': {
    // LA DIVISION PAR UN RAPPORT SOUS LA MAIN : une درّاجة dont le plateau (F dents) entraîne un pignon (R dents) par la chaîne. La main TOURNE la manivelle ;
    // la chaîne avance de n dents, la pédale a fait n/F tour, la roue n/R tour. Le drapeau est à des tours de roue donnés (un entier ou une fraction) : combien de
    // tours de pédale ? Un tour de pédale ne fait faire à la roue que F/R tour, donc la roue demande plus (ou moins) de tours de pédale que de tours de roue :
    // diviser par F/R, c'est multiplier par R/F — le mouvement inverse échange le plateau et le pignon. En متقدم la manivelle est bloquée tant que l'élève n'a pas
    // écrit sa prédiction (une fraction), les compteurs sont voilés jusqu'au lâcher et une prédiction fausse est réfutée par la course. Chaque lâcher est un essai
    // jugé exactement : MANUEL (§6bis). « جرّب أعدادك » : toujours ouvert (12 … 52 dents, un drapeau p/q).
    shows: 'قسمة عدد على كسر هي الضرب في مقلوبه: مقلوب $\\frac{a}{b}$ هو $\\frac{b}{a}$ لأنّ جداءهما $1$ ؛ ودورات الدوّاسة اللازمة لعدد من دورات العجلة تساوي هذا العدد مضروبًا في مقلوب $\\frac{F}{R}$ حيث $F$ و$R$ عدد أسنان الصحن والترس',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 2 « العمليات على الكسور والأعداد الناطقة » (2026-10-26) — l'égalité et la comparaison de deux fractions (produits en croix).
  'shade-match': {
    // LE NUMÉRATEUR SOUS LA MAIN : un seau de référence A (a mesures de bleu pour b de blanc) et un seau B qui reçoit d mesures de blanc ; la main VERSE c mesures de
    // bleu avec la manette (appui prolongé = une mesure toutes les 0,45 s, un clic = une mesure, « تصريف » en ôte une). La teinte est calculée de la part de bleu
    // exacte c/(c+d) : à rapports égaux les deux couleurs sont IDENTIQUES ; un mesureur à aiguille penche selon le signe de c × b − a × d (plus clair / plus foncé)
    // et allume « تطابق » à l'égalité. Quand a × d ÷ b n'est pas entier aucun c ne convient : deux voisins restent de part et d'autre du zéro — les produits en croix
    // COMPARENT. En متقدم le mesureur est voilé jusqu'à l'engagement (un c, ou « لا يوجد عدد صحيح » avec les deux voisins écrits). Chaque lâcher est un essai
    // jugé exactement : MANUEL (§6bis). « جرّب أعدادك » : toujours ouvert (a, b, d ∈ 1 … 20).
    shows: 'الكسران $\\frac{a}{b}$ و $\\frac{c}{d}$ متساويان إذا وفقط إذا كان $a \\times d = b \\times c$ ؛ وإذا كان $a \\times d < b \\times c$ فالأوّل أصغر من الثاني ؛ ولمقارنة كسرين نكتبهما بنفس المقام (مضاعف مشترك للمقامين)',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 2 (2026-10-26) — la somme et la différence de deux fractions : le dénominateur commun.
  'seed-rake': {
    // L'ESPACEMENT SOUS LA MAIN : un حوض de 1 m, des zones de cultures peintes l'une après l'autre (1/4 puis 1/6…). La main ÉTIRE un râteau : elle tient l'espacement 1/N m ;
    // « ازرع » plante un plant par case. Un espacement convient ⇔ chaque zone contient un nombre ENTIER de cases (N multiple commun des dénominateurs) ; sinon un plant tombe
    // sur la frontière de deux zones et rien n'est compté. La somme se lit en plants (5 × 1/12 m) et reste la même pour tout espacement qui convient ; le plus large est le
    // plus petit multiple commun. Une zone RÉCOLTÉE se retire (différence). En متقدم le râteau est bloqué : on écrit N et la longueur avant de semer. Chaque semis est un essai jugé exactement : MANUEL (§6bis).
    shows: 'لجمع كسرين أو طرحهما نكتبهما بنفس المقام، وهو مضاعف مشترك للمقامين: $\\frac{1}{4}+\\frac{1}{6}=\\frac{3}{12}+\\frac{2}{12}=\\frac{5}{12}$ ؛ وأصغر مضاعف مشترك يعطي أبسط حساب',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 2, leçon 4 (2026-10-26) — le nombre rationnel : une écriture a/b, une place sur la droite.
  'number-line-pegs': {
    // LA POSITION D'UNE ÉCRITURE SOUS LA MAIN : un حبل tendu dans la cour, gradué aux entiers ; des cartes portent une écriture a/b (a et b relatifs). La main PORTE une carte et l'ACCROCHE où elle croit
    // que le nombre habite ; « تحقّق » laisse le vent la faire glisser jusqu'à son vrai piquet : les écritures du MÊME nombre s'empilent, une carte du mauvais côté du zéro le traverse. En متقدم toutes les
    // cartes sont accrochées sans graduation entre les entiers et UN verdict juge l'ordre. Chaque accrochage et chaque « تحقّق » est un essai jugé exactement : MANUEL §6bis. `number-line-pegs` n'énonce jamais la règle.
    shows: 'العدد الناطق هو حاصل قسمة عدد نسبي على عدد نسبي غير معدوم $\\frac{a}{b}$ ، وله كتابات كثيرة ومكان واحد على المستقيم المدرّج ؛ كتابته المعيارية بمقام موجب ؛ ولمقارنة أعداد ناطقة نكتبها بنفس المقام الموجب ثم نقارنها كأعداد نسبية',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 2, leçon 5 (2026-10-26) — les quatre opérations sur les rationnels : le signe d'abord, puis la fraction.
  'merge-board': {
    // LE SIGNE PRÉDIT, LE DIVISEUR RETOURNÉ, L'ORDRE DES FUSIONS : une chaîne de calcul est une rangée de tuiles (fraction + barre signée) ; deux tuiles voisines se FUSIONNENT. La main prédit le signe
    // du résultat AVANT chaque fusion (une prédiction fausse est refusée, les barres montrent pourquoi), retourne le DIVISEUR d'une division (son signe gardé) et choisit l'ORDRE des fusions : un aimant tient
    // les × ÷ (priorité), une bulle tient ses tuiles (parenthèses), les + − vont de gauche à droite. Chaque fusion et chaque refus est un essai jugé exactement : MANUEL §6bis. `merge-board` n'énonce jamais la règle.
    shows: 'لجمع عددين ناطقين أو طرحهما نحدّد إشارة الناتج ثم نوحّد المقامين؛ وفي الضرب والقسمة تكون الإشارة موجبة إذا تشابهت الإشارتان وسالبة إذا اختلفتا، ونقسم بالضرب في مقلوب القاسم $\\frac{a}{b}\\div\\frac{c}{d}=\\frac{a}{b}\\times\\frac{d}{c}$ ؛ وفي سلسلة حسابات: الأقواس ثم الضرب والقسمة ثم الجمع والطرح',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 4, leçon 4 (2026-10-26) — comparer par l'aiguille d'une différence.
  'difference-meter': {
    // L'AIGUILLE QUI LIT UNE DIFFÉRENCE : sur la rail de verre du labo de physique, deux perles portent les nombres a et b ; un galvanomètre à deux sondes lit « rouge MOINS noir ». La main BRANCHE chaque sonde sur une perle
    // (c'est elle qui décide quel nombre est soustrait), lit UNE aiguille — à droite, à gauche, sur 0 — puis choisit la carte d'ordre ; « بدّل المجسّين » fait traverser l'aiguille, pas l'ordre. Au niveau متقدم un volet couvre
    // l'aiguille tant que la différence n'est pas ÉCRITE, et un rideau cache les perles : seule la différence est donnée. Monde `race` : les perles sont les valeurs de deux expressions, la main tient x, l'aiguille lit A − B et la main
    // remplit une carte d'ordre par région de x. Chaque branchement, lecture, écriture et verdict est un essai jugé exactement : MANUEL §6bis. `difference-meter` n'énonce jamais la règle.
    shows: 'العدد الأكبر هو الذي يكون الفرق $a-b$ معه موجبًا: $a>b$ معناه $a-b>0$ ، و $a<b$ معناه $a-b<0$ ، و $a=b$ معناه $a-b=0$ ؛ فنعرف الترتيب من إشارة الفرق وحدها، وتبديل العددين يبدّل إشارة الفرق لا الترتيب. ولمقارنة عبارتين $A$ و $B$ نبسّط $A-B$ ثم نعيّن إشارته حسب قيم $x$.',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 3, leçon 1 (2026-10-26) — la puissance de 10 comme nombre de crans d'un zoom : l'exposant sous la main.
  'ten-zoom': {
    // LA BAGUE QUI ZOOME PAR DIX : le club de sciences a une lentille de laiton dont la bague crantée multiplie par 10 (cadre plus grand) ou divise par 10 (cadre plus petit) le côté d'un cadre carré,
    // qui part du dessus d'une table (1 m). La main TIENT le nombre de crans n : elle tourne la bague (ou pince, ou molette, ou boutons) jusqu'à ce que le côté du cadre égale la carte (« 1 000 000 م »,
    // « 0,001 م », « مليار متر », « ميكرومتر »), puis « ثبّت الإطار ». La plaque lit le côté en DÉCIMAL (1 000 000 m : le 1 et ses zéros ; 0,001 m : le 1 au rang 3 après la virgule) ; sans cran le cadre est
    // la table (1 m). Monde `prefixes` : la carte est une unité (كيلومتر … نانومتر). Chaque cran, prédiction et verdict est un essai jugé exactement : MANUEL §6bis. `ten-zoom` n'énonce jamais la règle.
    shows: 'نقرأ $10^n$ : 1 متبوع بـ $n$ صفرًا إذا كان $n$ موجبًا، و $10^0 = 1$ ، و $10^{-n} = \\frac{1}{10^n}$ هو العدد الذي رقم 1 فيه في الرتبة $n$ بعد الفاصلة ؛ وكل بادئة (كيلو، ميلي، ميكرو، نانو …) هي قوة للعدد 10',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 3, leçon 2 (2026-10-26) — les trois règles sur les puissances de 10 lues comme des COLONNES entre deux plaques d'unités.
  'unit-ladder': {
    // LA RÈGLE QUI CONVERTIT : au club de technologie, une règle de laiton est gravée de colonnes égales (entre deux colonnes voisines on multiplie par 10) et des plaques d'unités pendent au-dessus (les grandes à gauche).
    // La main TEND un ruban entre deux plaques et lit le nombre de colonnes qu'il traverse : deux rubans enchaînés s'ajoutent, un ruban de part et d'autre du mètre mesure l'ÉCART entre deux rangs, et les tables d'aire et de
    // volume re-pavent la règle (2 ou 3 colonnes par unité) — la main CHOISIT alors le mode. Une extrémité au milieu d'une plaque, ou le mauvais mode, est refusé avec le calcul. Chaque ruban, prédiction et verdict est un
    // essai jugé exactement : MANUEL §6bis. `unit-ladder` n'énonce jamais la règle avant la phase formelle.
    shows: 'نكتب $10^m \\times 10^n = 10^{m+n}$ و $\\frac{10^m}{10^n} = 10^{m-n}$ و $(10^m)^n = 10^{m \\times n}$ ؛ فعدد الأعمدة بين لوحتين هو الأس، وفي جدول المساحة أو الحجم تُضاعف الأعمدة بمرتين أو ثلاث',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 3AM, unité 3, leçon 3 (2026-10-26) — l'écriture scientifique, l'encadrement entre deux puissances de 10 et le rang de grandeur lus comme une POSITION sur un slide de décades.
  'size-ladder': {
    // LE SLIDE DES DÉCADES : dans le couloir de la foire des sciences, un grand mur porte un slide de barreaux de bois ; chaque barreau va d'une puissance de 10 à la suivante et porte neuf cases entre les graduations 1 … 10
    // (placées LOGARITHMIQUEMENT). La main tient la POSITION d'une carte de longueur : d'abord son BARREAU (haut / bas), puis sa CASE (gauche / droite), puis l'AIMANT qui la tire vers la graduation entière la plus proche.
    // Une carte posée sur un mauvais barreau, ou dans une mauvaise case, retombe avec le calcul ; sur son barreau et dans sa case elle s'écrit « a × 10ⁿ ». En متقدم on ÉCRIT a et n avant de suspendre. Chaque dépôt,
    // saisie, aimant et choix est un essai jugé exactement : MANUEL §6bis. `size-ladder` n'énonce jamais la règle avant la phase formelle.
    shows: 'نكتب $A=a\\times10^n$ حيث $1\\le a<10$ ، فيكون $10^n\\le A<10^{n+1}$ ؛ ورتبة قدر $A$ هي $a^{\\prime}\\times10^n$ حيث $a^{\\prime}$ مدوّر $a$ إلى الوحدة ؛ ولمقارنة عددين نقارن أسّيهما ثم العددين $a$',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  'pin-rails': {
    // LA PUNAISE SUR SA RAINURE ET LA RÈGLE SUR DEUX NŒUDS : un tableau de prix devient des points d'un repère — la main GLISSE chaque punaise
    // le long de la rainure de sa colonne jusqu'à son prix (la punaise posée au mauvais prix retombe, le tableau fait foi) puis POSE une règle
    // droite sur deux nœuds au choix (O ou une punaise) : elle touche exactement les nœuds de sa droite. Une boutique est proportionnelle quand
    // une règle touche O et toutes les punaises ; des frais fixes laissent les punaises alignées mais O dehors ; un prix qui change les brise.
    // En متقدم : décider sur des « photos » de points, puis LIRE sur la droite (la punaise glisse sur sa rainure ou le long de sa rangée
    // jusqu'à la droite). Chaque lâcher est un essai jugé exactement : MANUEL (§6bis).
    shows: 'تمثّل وضعية تناسبية بنقط على استقامة واحدة مع مبدأ المعلم ؛ وإذا لم تمرّ المسطرة بالمبدأ أو لم تكن النقط على استقامة فليست الوضعية تناسبية ؛ ويُقرأ معامل التناسبية $a$ من $y = ax$',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية », leçon 1 (2026-10-28) — l'ordre des opérations d'une série sans parenthèses.
  'tram-route': {
    // L'ORDRE DES OPÉRATIONS SOUS LA MAIN : un voyage en tramway (les arrêts arrivent dans l'ordre où la chaîne est écrite) ou un kiosque à tickets. La main POSE des tickets numérotés ① ② ③ sur les
    // opérateurs de la chaîne du voyage : c'est le PLAN de calcul. « انطلق » le rejoue : le plan calcule dans SON ordre, le tram roule dans l'ordre du temps et son compteur est la vérité. Un plan
    // qui donne autre chose est refusé et le monde dessine l'étape qui n'a pas de sens (« نزل 13 ؟ لم ينزل إلا 9 », « 18 فوجًا من 4 ؟ », « 4 تذاكر بـ 6,25 DA ؟ ») ; un plan différent qui donne la même
    // valeur (une chaîne de + seulement) est accepté : « هنا كلّ ترتيب يعطي العدد نفسه ». En متقدم l'élève ÉCRIT d'abord la chaîne de l'histoire (plaques et puces, jugée par sa valeur) puis écrit
    // sa prédiction. Chaque « انطلق » est un essai jugé exactement : MANUEL (§6bis). « جرّب أعدادك » : toujours ouvert (jusqu'à quatre arrêts). `tram-route` n'énonce jamais la règle.
    shows: 'في سلسلة عمليات دون أقواس: نحسب الجمع والطرح فقط (أو الضرب والقسمة فقط) من اليسار نحو اليمين، ونحسب الضرب والقسمة قبل الجمع والطرح؛ وهذا اتّفاق تتبّعه الآلة الحاسبة العلمية أيضًا',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 1, leçon 2 (2026-10-29) — les parenthèses d'une série d'opérations.
  'coop-calculator': {
    // LES PARENTHÈSES SOUS LA MAIN : au comptoir de la coopérative de l'école, la main POSE les parenthèses de la ligne tapée sur une calculatrice scientifique (مبتدئ : toucher un intervalle puis « ( » ou
    // « ) » ; متقدم : taper toute la ligne depuis une histoire ou une barre de fraction). « = » imprime la ligne et la valeur de la machine, qui obéit aux priorités : une valeur que l'histoire refuse est barrée et
    // l'histoire dit pourquoi (« 48,75 DA لكلّ صديق؟ ثمن الكتاب كلّه 60 DA »), une ligne mal équilibrée donne « Syntax ERROR », une paire inutile est acceptée avec une remarque. `coop-calculator` n'énonce jamais la règle.
    shows: 'الأقواس تجعل الآلة (والقارئ) تحسب جزءًا من السلسلة أوّلًا؛ في الأقواس المتداخلة نبدأ بالداخلية ونكتب الخارجية [ ]، وخطّ الكسر يجمع البسط ويجمع المقام فنكتبهما بين قوسين على الآلة، وقوسان لا يغيّران ترتيب الحساب غير ضروريين',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 1, leçon 3 (2026-10-29) — la dernière opération nomme une série d'opérations.
  'chain-cutter': {
    // LA DERNIÈRE OPÉRATION SOUS LES CISEAUX : sur la السبّورة الفلّينية du class, la main choisit OÙ couper en deux un ruban de papier imprimé (« 7 + 4 × 5 ») pour que chaque morceau se calcule seul ; seule la dernière
    // opération recolle sans mordre une agrafe que le calcul a posée, et la valeur recollée ailleurs (55 ≠ 27, ou la même par hasard : l'agrafe refuse quand même) le montre. L'élève colle le NOM sur la coupe, les morceaux tombent
    // dans deux poches qui s'étiquettent d'après l'opération, il recoupe jusqu'aux nombres et la phrase grandit ; en متقدم les agrafes sont cachées jusqu'à la coupe, puis il COLLE des blocs deux à deux avec les agrafes-parenthèses
    // qu'une phrase exige. `chain-cutter` n'énonce jamais la règle.
    shows: 'آخر عملية تُنجز في سلسلة هي التي تسمّيها (مجموع، فرق، جداء، حاصل قسمة)، وبها تنقسم السلسلة إلى حدّين أو عاملين أو مقسوم وقاسم تُحسب كلّ منها وحدها، فنصف السلسلة بجملة ونكتب سلسلة من جملة بالأقواس اللازمة',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 1, leçon 4 (2026-10-29) — la distributivité du produit sur la somme et la différence.
  'kit-packer': {
    // DEUX FAÇONS DE REMPLIR LES MÊMES CARTABLES : dans l'atelier du نادي التضامن, Fatima remplit k cartables identiques cartable par cartable (k × (a + b)) ; la MAIN d'Ali règle ce que chaque distributeur sort (cahiers, stylos) et le
    // tapis distribue UN PAR CARTABLE. Un cartable manquant, trop plein ou inégal se voit ; les deux compteurs ne s'allument ensemble que si tous les cartables sont prêts (n = k × a et m = k × b). Dans une différence une benne reçoit
    // les cahiers abîmés ; lue à l'envers (distributeurs verrouillés), la main règle le nombre de cartables et le facteur commun sort ; en متقدم le total est prédit, 48 s'écrit 50 − 2, les rubans sont en mètres. `kit-packer` n'énonce jamais la règle.
    shows: 'ضرب عدد في مجموع أو فرق هو ضرب هذا العدد في كلّ حدّ ثم الجمع أو الطرح: k × (a + b) = k × a + k × b و k × (a − b) = k × a − k × b، ومنه نحلّل بإخراج العامل المشترك ونحسب ذهنيًا',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 4 « مفهوم معادلة », leçon 1 « إنتاج عبارة حرفية واستعمالها » (2026-10-29) — le nombre de cellules d'un rang, puis la règle écrite avec une lettre.
  'wax-cells': {
    // LE NOMBRE n SOUS LA MAIN : un rang de cellules hexagonales en tiges de cire, deux cellules voisines PARTAGENT une tige. La main glisse des cellules du plateau au bout du rang (elle les reprend aussi), lit le compteur de tiges (le DESSIN,
    // un décompte d'arêtes), remplit un tableau n / tiges, puis ÉCRIT la règle avec la lettre n : elle est jugée sur CHAQUE rang construit ; les modèles faux (6n : tiges partagées comptées deux fois ; 5n : la première oubliée ; 5n + 6) sont refusés et
    // dessinés (tiges qui clignotent, première tige en pointillé). Le cadre ne tient que 8 cellules : la valeur de 40 cellules se CALCULE. مبتدئ : un rang, le compteur visible ; متقدم : le compteur est caché jusqu'à ce que le nombre soit tapé,
    // une bande de deux rangs décalés (8n + 3), deux écritures du même décompte (observation), puis deux lettres (un rang de n cellules et une bande de m colonnes). « جرّب أعدادك » : toujours ouvert.
    shows: 'نكتب عدد الأعواد لصفّ من $n$ خلية بعبارة حرفية: الخلية الأولى تحتاج $6$ أعواد وكلّ خلية بعدها تضيف $5$ لأنّها تشترك في عود مع جارتها، أي $5\\times n+1$ أو $5n+1$ ؛ ثم نعوّض الحرف بقيمة فنجد مثلًا $5\\times 40+1=201$',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 4 « مفهوم معادلة », leçon 2 « حلّ مشكل باستعمال معادلة » (2026-10-29) — l'inconnue d'une équation à une opération, puis à deux opérations.
  'juice-line': {
    // L'INCONNUE SOUS LA MAIN : une coopérative remplit des bouteilles depuis un réservoir. مبتدئ : la main tient la capacité x du moule (0,05 … 2 L) et n'a que DEUX essais ; chaque remplissage dit combien de bouteilles sont pleines, la bouteille
    // partielle (tracée à son niveau) et le jus resté — l'équation lue dans le monde. Elle écrit ensuite l'opération (ou le nombre) qui donne x : les opérations fausses (×, renversée, soustraite, ajoutée) sont refusées et DESSINÉES ; puis elle choisit TOUTES
    // les bonnes équations (deux écritures). متقدم : la main tient le contenu du réservoir (le dividende manquant), l'ardoise s'ouvre d'abord, et la dernière tâche (4 + x) ÷ 0,25 = 40 demande deux étapes (défaire la DERNIÈRE opération d'abord).
    // « جرّب أعدادك » : toujours ouvert. Chaque remplissage, opération et carte est un essai jugé exactement (centilitres entiers) : MANUEL (§6bis).
    shows: 'المعادلة تترجم وضعية، وحلّها هو القيمة التي تجعل المساواة صحيحة: نجد العامل الناقص أو القاسم الناقص بالقسمة، والمقسوم الناقص بالضرب، وفي معادلة من خطوتين نلغي آخر عملية أوّلًا، ثمّ نتحقّق بالتعويض',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
  // 2AM, unité 4 « مفهوم معادلة », leçon 3 « اختبار مساواة أو متباينة » (2026-10-29) — اختبار قيمة في مساواة أو متباينة بالتعويض.
  'bridge-load': {
    // LA CHARGE SOUS LA MAIN : un camion de matériaux de construction doit passer un pont dont la pancarte donne une règle (« أقلّ من 5000 kg », « ≤ 7000 kg »). La main tient des COMPTES de sacs (x de ciment, y de sable), glissés du dépôt
    // vers la benne ; le pèse-camion écrit la substitution (4000 + 50 × 15 = 4750) puis la comparaison (4750 < 5000 ؟) et l'élève doit répondre AVANT que la barrière ne bouge. La charge limite (20 sacs : 5000 pile) sépare « < » de « ≤ » ;
    // deux inconnues (l'ordre des comptes compte) ; deux camions à UNE charge (une égalité vraie pour une seule valeur). متقدم : l'écran est masqué jusqu'à ce que les deux masses soient tapées, et une affirmation « toujours » tombe devant UNE charge.
    // « جرّب أعدادك » : toujours ouvert. Chaque pesée, verdict, carte et contre-exemple est un essai jugé exactement par `equation2.js` E3 : MANUEL (§6bis).
    shows: 'نختبر قيمة في مساواة أو متباينة بأن نعوّضها في كلّ طرف ونحسب الطرفين ثمّ نقارن الناتجين: $4000+50\\times15=4750$ و $4750<5000$ ؛ ولا يكفي أن يكون العدد قريبًا من الحدّ ($5000<5000$ خاطئة بينما $5000\\le5000$ صحيحة) ؛ وقيمة واحدة لا تثبت أنّ عبارتين متساويتان دائمًا، لكن قيمة واحدة كافية لإبطال ذلك',
    controls: { reset: true, nextStep: false, toggleExplanation: true, changeNumbers: false },
  },
});

export const MANIPULATION_TYPE_IDS = Object.freeze(Object.keys(MANIPULATION_TYPES));

export function isManipulationType(type) {
  return Object.prototype.hasOwnProperty.call(MANIPULATION_TYPES, type);
}

/** Les natures de ressource qu'une leçon peut déclarer dans `resources[]`. */
export const RESOURCE_KINDS = Object.freeze(['manipulation', 'method', 'situation', 'example']);

/** Les natures de leçon. `synthesis` = « أدمج تعلّماتي », la synthèse d'unité. */
export const LESSON_KINDS = Object.freeze(['lesson', 'synthesis']);

/**
 * Les étapes exigées selon la nature. Une synthèse n'a ni découverte ni
 * formalisation : elle mobilise ce que les leçons ont enseigné.
 */
export const REQUIRED_STAGES_BY_KIND = Object.freeze({
  lesson: ['trigger', 'discovery', 'formalization', 'practice_lab', 'evaluation'],
  // « أدمج تعلّماتي » de l'unité 1 s'ouvre sur ses entraînements (2026-10-13) : pas de `trigger`.
  synthesis: ['practice_lab', 'evaluation'],
});
