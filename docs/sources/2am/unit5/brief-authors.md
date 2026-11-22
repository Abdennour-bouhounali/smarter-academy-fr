# Brief des auteurs — 2AM, unité 5 « التناسبية » (`tanasubiya-2am`), leçon `rabi-mutanasib`

Écrit le 2026-10-21 par le lead de la leçon (file de génération Phase A, #8). Lisible par le lead, l'auteur du labo et l'auteur de la
banque. Frontières des leçons de l'unité : en-tête de `build-extraction.py` ; extraction : `extraction.json` (80 éléments).

## 1. La leçon

« حساب الرابع المتناسب » — items `2am.m6.r02` (compléter un tableau de proportionnalité : ICI le cas où l'on ne connaît que TROIS nombres) et
`2am.m6.r03` (تعيين الرابع المتناسب). Lien « راجع » du réseau : `1am.m6.r04` (إتمام جدول تناسبية بطرائق مختلفة), leçon 1AM
`itmam-jadwal-tanasubiya` NON publiée, relation `consolidates` : « أستعدّ » la mesure, la leçon ne la RECONSTRUIT pas (elle consolide : les
chemins par le coefficient, l'unité, les propriétés additive et multiplicative sont RAPPELÉS, jamais réenseignés). La leçon sœur
`wadiya-tanasubiya-jadwal` (même unité, items r01 + r02) n'est pas publiée : elle possède « reconnaître un tableau de proportionnalité » ;
« أستعدّ » la mesure aussi. Sert en avant `nisba-miawiya`, `miqyas-kharita` (même unité) et la leçon 4AM `tanasub-muamil` (fonction linéaire).

**الكفاءات finales** (ordre = ids positionnels `2am_rabi-mutanasib_P1…P3`) :
- P1 « حساب الرابع المتناسب بالمرور بالوحدة أو بمعامل التناسبية أو بالخاصية الجمعية أو الضربية » (mots gardés)
- P2 « توظيف مساواة الجداءين المتصالبين $a \times d = b \times c$ لحساب قيمة مجهولة في جدول تناسبية » (gardée)
- P3 « اختيار الطريقة الأنسب لحساب الرابع المتناسب حسب الأعداد المعطاة » (gardée)

**Mots de la plateforme** : « جدول تناسبية », « الرابع المتناسب » (le nombre qui manque quand trois sont connus), « معامل التناسبية »,
« المرور بالوحدة », « الخاصية الجمعية / الضربية », « الجداءان المتصالبان ». Un décimal s'écrit avec la VIRGULE décimale ; jamais de fraction
comme réponse (sauf un résultat non décimal dit « لا يُكتب عشريًا »). Les nombres sont dans des îlots LTR.

**Concepts de la banque** (et de rien d'autre) : le quatrième proportionnel d'un tableau 2×2 dont une case manque (n'importe laquelle des
quatre cases) ; les cinq chemins (coefficient, unité, additive, multiplicative, produits en croix) ; le choix d'un chemin ; la propriété
a × d = b × c et la remarque « dans deux colonnes quelconques d'un tableau de proportionnalité » ; l'erreur « on ajoute la même différence »
(5 → 6 donc 625 → 626) ; un tableau à plusieurs colonnes dont l'une est complète. PAS de pourcentage, PAS d'échelle, PAS de conversion de
longueurs, PAS de graphique, PAS de double proportionnalité (leçons suivantes et synthèse).

## 2. Le labo `fourth-gauges` (« موازين الرابع المتناسب ») — contrat FIXE avec la leçon

Le nom du type est `fourth-gauges` ; le fichier `operations/FourthGauges.jsx` ; la logique `logic/fourthGauges.js` ; l'arithmétique exacte
`packages/core/arithmetic/fourthProportional.js` (importé PAR CHEMIN, jamais dans le barrel du cœur). Il NE DOIT RIEN réhabiller de
`LinearMachine` (la main tient l'entrée x et le cadran a), `OriginLine`, `RatioRide` (la main tient la durée x ; colonnes enregistrées),
`PercentTag`, `solution-ray`, `story-bars` : ici **la main tient le nombre qui MANQUE** dans un tableau dont les trois autres cases sont
imposées, et ce qu'elle « sent » ce sont trois (puis quatre) **balances d'égalité** qui se rééquilibrent sous le doigt.

**Idée (design sheet à écrire dans l'en-tête du composant, MANIPULATION_DNA §7).**
- CONCEPT : un tableau à trois nombres connus n'est proportionnel que pour UN seul quatrième nombre ; les chemins (par l'unité, par le
  coefficient / entre colonnes, par les produits en croix) sont la MÊME égalité vue de trois côtés ; la « différence constante » n'est
  pas un test de proportionnalité.
- OBJET : une planche de prix d'un marchand de fruits et légumes (le souk de la semaine) : un tableau 2×2 de cartes de prix `[[a, c],
  [b, d]]` (ligne 1 : quantité, ligne 2 : prix ou autre grandeur), UNE carte manque (« le trou » : `a`, `b`, `c` ou `d`) et la main la tient.
- VARIABLE : la valeur de la carte manquante `h` (un décimal d'un pas fixé par la tâche : 1, 0,5, 0,1, 10…).
- INVARIANT : les trois autres cartes ; la valeur exacte du quatrième proportionnel ne dépend pas de la balance qu'on regarde.
- TRANSFORMATION : sous le doigt, trois balances s'inclinent (jamais plus d'une inclinaison saturée ; une lampe s'allume quand une balance
  est ÉQUILIBRÉE) : **« في الكيلو »** — le prix d'UNE unité dans la colonne connue `b ÷ a` contre `d ÷ c` (le prix du kilo doit être le même) ;
  **« بين العمودين »** — combien de fois la quantité a grandi `c ÷ a` contre combien de fois le prix a grandi `d ÷ b` ; **« الجداءان »** — le
  produit `a × d` contre `b × c` (deux barres de hauteurs ∝ aux produits ; ou deux rectangles dessinés à l'échelle, de dimensions a × d et
  b × c). Quand le trou est ailleurs en d, les mêmes trois balances s'écrivent par leurs formules générales ci-dessous. Le côté de la
  balance qui porte le trou est TOUJOURS le côté droit ; la balance penche vers le plus grand ; **les trois balances penchent toujours du
  même côté** (c'est la preuve qu'elles sont la même égalité) — la leçon le fait observer.
- CONTRAINTE : le tableau est dressé à l'envers possible (trou en `a`, `b`, `c` ou `d`) ; les nombres sont strictement positifs.
- RÉSISTANCE : (i) au niveau متقدم les balances sont VOILÉES (elles se découvrent seulement après le relâchement) ; (ii) une 4e balance
  « الفرق » (`c − a` contre `d − b`, penche aussi du même côté !) existe dans la tâche 3 de مبتدئ : elle s'équilibre au MAUVAIS nombre
  (404 au lieu de 600) et jamais en même temps que les trois autres ; (iii) en « جرّب أعدادك » si le quatrième proportionnel n'est pas un
  décimal fini (10/3), aucun nombre de la règle ne l'atteint : message « الرابع المتناسب 10/3 لا يُكتب عشريًا » et les balances ne
  s'équilibrent jamais.
- ÉVIDENCE : l'inclinaison, la lampe, les deux nombres exacts sous chaque balance (`625 ÷ 5 = 125` / `700 ÷ 6 = 116,67` — décimales
  tronquées à 2 chiffres, le signe `≈` n'apparaît pas : afficher la fraction `700/6` si le résultat n'est pas décimal fini) ; l'écran ne dit
  JAMAIS la règle à découvrir (« les produits en croix sont égaux »).
- CONTRASTE : au moins un trou en `d`, un trou en `c` (une QUANTITÉ à trouver) ; la balance « الفرق » ; un essai trop haut et un trop bas.
- PRÉDICTION : au niveau متقدم : voilé, le nombre se calcule AVANT (la main le pose, le relâchement dévoile).
- DÉCOUVERTE : « les balances s'équilibrent ensemble et seulement pour un nombre » ; « la balance Différence ment ».
- FORMALISATION : après la dernière tâche, le « دفتر » écrit AVEC LES NOMBRES DE L'ÉLÈVE les cinq chemins vers le même résultat (une
  ligne chacun : par l'unité `625 ÷ 5 = 125 ثم 125 × 6 = 750`, par le coefficient, additive `6 = 5 + 1 ⇒ 625 + 125`, multiplicative
  `6 = 5 × 1,2 ⇒ 625 × 1,2` ; produits en croix `5 × x = 6 × 625 ⇒ x = 3750 ÷ 5`) — une ligne n'est écrite que si ses nombres
  intermédiaires sont des décimaux finis à ≤ 2 chiffres (sinon : « لا يمكن هنا بخطوة واحدة نظيفة » ; la ligne manque) ; le calcul de
  chaque ligne vient de `fourthProportional.js` (jamais retapé).
- TRANSFERT : معارف (le même labo seul, `levels={false}`, ses propres tâches), طريقة, أتمرّن, et `nisba-miawiya` / `miqyas-kharita`.

**Formules exactes** (tableau `[[a, c], [b, d]]`, nombres positifs, un seul trou ; toute l'arithmétique en fractions exactes, comme
`packages/core/arithmetic/linear.js` — `frac`, `mul`, `div`, `cmp` — et `proportional.js › fourthProportional`) :
- trou `d` : `d = b·c / a` ; trou `c` : `c = a·d / b` ; trou `b` : `b = a·d / c` ; trou `a` : `a = b·c / d`.
- balance **unit** (« في الكيلو ») : `b ÷ a` contre `d ÷ c` ; balance **between** (« بين العمودين ») : `c ÷ a` contre `d ÷ b` ; balance **cross**
  (« الجداءان ») : `b × c` contre `a × d` ; balance **diff** (« الفرق », leurre) : `c − a` contre `d − b` (écrite seulement si `c > a` et
  `d > b`, sinon désactivée). La valeur du côté « trou » est toujours à DROITE. `state ∈ { eq, lt, gt }` (côté gauche plus petit / plus
  grand que le droit).

**Tâches** (`tasks`, tableau d'objets ; les valeurs en TEXTE, virgule décimale, signe jamais utile ici) :
```
{ hole: 'a'|'b'|'c'|'d', a, b, c, d,        // le champ du trou est OMIS ; les trois autres sont des chaînes
  rows: ['التفاح (kg)', 'الثمن (DA)'],        // étiquettes de la ligne 1 et de la ligne 2
  step: '1', max: '1500',                     // pas et borne de la règle du trou (min 0)
  covered?: true,                             // balances voilées jusqu'au relâchement
  decoy?: true }                              // la balance « الفرق » est présente et doit être éteinte-puis-allumée (voir ci-dessous)
```
Une tâche est ACCOMPLIE par un relâchement (fin de glissement, clic −/+, flèche, saisie validée par Entrée) sur le quatrième proportionnel
EXACT (comparaison de fractions) ; les balances voilées se dévoilent au relâchement et se revoilent à la tâche suivante. Une tâche
`decoy: true` demande DEUX relâchements : d'abord celui qui allume « الفرق » (`d = b + (c − a)`), puis le vrai ; l'invite le dit en une
phrase (« أضئ ميزان الفرق ثم الموازين الثلاثة. »).

**Presets** (`levels.js`, deux niveaux, MÊME `objective` côté leçon) :
- مبتدئ (balances ouvertes) :
  1. `{ hole: 'd', a: '4', b: '520', c: '6', rows: ['التفاح (kg)', 'الثمن (DA)'], step: '1', max: '1560' }` → 780
  2. `{ hole: 'c', a: '3', b: '840', d: '1400', rows: ['التمر (kg)', 'الثمن (DA)'], step: '1', max: '10' }` → 5 (la QUANTITÉ achetée)
  3. `{ hole: 'd', a: '8', b: '400', c: '12', rows: ['البطاطا (kg)', 'الثمن (DA)'], step: '1', max: '1200', decoy: true }` → 600 ; leurre : 404
- متقدم (balances voilées, `covered: true`) :
  1. `{ hole: 'd', a: '2,5', b: '325', c: '4', rows: ['الجزر (kg)', 'الثمن (DA)'], step: '1', max: '1000' }` → 520
  2. `{ hole: 'b', a: '6', c: '9', d: '2700', rows: ['الكتلة (kg)', 'الثمن (DA)'], step: '10', max: '5400' }` → 1800
  3. `{ hole: 'a', b: '720', c: '7,5', d: '1800', rows: ['الكتلة (kg)', 'الثمن (DA)'], step: '0,1', max: '15' }` → 3
  4. `{ hole: 'd', a: '12', b: '3', c: '18', rows: ['مساحة الجدار (m²)', 'الدهان (L)'], step: '0,1', max: '10' }` → 4,5

**Props** (`<Manipulation type="fourth-gauges" … />`) : `world` (`'market'`), `tasks`, `level`, `levels`, `coach` (défaut true), `title`, `lead`,
`onTrial(event)`, `onFinished({ })`.

**Gestes (trois chemins chacun).** (1) tirer la poignée de la carte manquante le long de la règle (une règle horizontale sous la planche,
graduée sans marquer la réponse ; la valeur se lit sur la carte en grand) ; (2) −/+ (`StepperCard`, pas = `step`) avec saisie directe de la
valeur (champ numérique, Entrée = relâchement) ; (3) clavier sur la poignée (`role="slider"`, flèches, Home/End, PageUp/PageDown = 10 pas).
**Un essai = un relâchement** (fin de glissement, clic −/+, flèche, Entrée) jugé exactement ; le va-et-vient pendant un glissement n'en est
pas un. Les balances (ouvertes) suivent le doigt EN DIRECT pendant le glissement ; au niveau voilé, elles se dévoilent au relâchement.

**« جرّب أعدادك أنت »** toujours ouvert sous le labo (pas de bouton à presser pour l'ouvrir) : trois champs `a`, `b`, `c` (décimaux
positifs ≤ 2 décimales, ≤ 9999, chiffres arabes-indiens acceptés) ; le trou est `d` ; la scène passe à ces nombres et à la même règle
(`max` = 3 × le quatrième proportionnel arrondi, `step` = le plus petit pas décimal qui l'atteint, sinon 0,01) ; les essais libres
(`free: true`) ne comptent jamais pour une tâche ni pour la découverte ; « عُد إلى مهامّك ».

**Découverte** (`ManipulationDiscovery`, aucun texte ne dit la règle avant) : مبتدئ « ماذا تلاحظ على الموازين الثلاثة عند الثمن العادل؟ »
(options : « تتوازن معًا عند ثمن واحد فقط » vraie ; « تتوازن واحدة في كل مرّة » réfutée par SON relâchement ; « ميزان الفرق يتوازن معها
دائمًا » réfutée par SON essai à 404) ; متقدم « لماذا لا يكفي جمع الفرق نفسه؟ ». `discoveryReady` = toutes les tâches faites. Phase
formelle : le دفتر avec SES nombres (cinq chemins), la règle une fois.

**LabCoach** (obligatoire, `coach` true par défaut, MANIPULATION_CONTRACT §8quater) : `coachOf` pure — `grab` (la poignée), `try` (−/+),
`gauge` (ouvrir la balance « الجداءان » quand l'élève ne regarde que celle-là), `decoy` (le leurre), `next`. Testé en SUIVANT le coach jusqu'à
la fin de chaque tâche des deux niveaux ; le bulle ne couvre jamais la zone de travail (planche, règle, balances).

**Événements `onTrial(e)`** (fixes — les modules de la leçon les lisent) :
`{ kind: 'release', task: <index>, hole: 'd', value: '780', ok: true|false, gauges: { unit: 'eq'|'lt'|'gt', between: …, cross: …, diff: …|null },
  decoyHit: false|true, free: false|true, via: 'drag'|'step'|'key'|'type' }` (`decoyHit` : le relâchement a allumé « الفرق » seulement) ;
`{ kind: 'infinite', task, free: true }` (essai libre sans solution décimale). `onFinished({})` à la formalisation.

**DOM** (préfixe `data-fg-…`) : `[data-fourth-gauges][data-world][data-task][data-solved][data-level][data-layout]`, `[data-fg-glance]`,
`[data-fg-stage]`, `[data-fg-svg]`, `[data-fg-cell=a|b|c|d][data-hole][data-value]`, `[data-fg-knob]` (role slider, `aria-valuenow`),
`[data-fg-gauge=unit|between|cross|diff][data-state=eq|lt|gt|covered|off]`, `[data-fg-lamp][data-lit]`, `[data-fg-less]`, `[data-fg-more]`,
`[data-fg-input]`, `[data-fg-readout]`, `[data-fg-verdict=right|wrong|decoy|none|free|'']`, `[data-fg-prompt][data-lit]`, `[data-fg-next]`,
`[data-fg-step=<i>][data-done]`, `[data-fg-free][data-active]`, `[data-fg-free-a]`, `[data-fg-free-b]`, `[data-fg-free-c]`,
`[data-fg-free-back]`, `[data-fg-formal]`, `[data-fg-routes]`, `[data-fg-kid][data-mood]`.

**Monde** `market` (thème `souk`, mots dans `lesson.manipulation.json › fourthGauges.*`, chaînes AUSSI sous `lesson:manipulation.fourthGauges.*`) :
souk de fruits et légumes sous un auvent à rayures, cagettes dessinées (tomates, oranges, pommes de terre, dattes) en perspective, une
planche de prix en bois (les quatre cartes), une balance de marchand de laiton à deux plateaux comme décor, une jeune cliente (`KidFigure`
fille, hijab ; `mood` : `happy` quand le prix est juste, `puzzled` sinon), un panier. Les trois balances d'égalité sont de PETITES balances
de laiton alignées sous la planche (même langage que la balance du marchand), chacune avec une lampe. Rien n'est un titre : contexte en
une ou deux phrases PORTANT TOUS LES NOMBRES (« في سوق الخضر 4 kg من التفاح بـ 520 DA ، ولوحة الأسعار تنتظر ثمن 6 kg. ») puis UNE
question qui nomme le but et l'état final (« اضبط ثمن 6 kg حتى تتوازن الموازين الثلاثة. »). Une phrase par tâche (`prompt` calculé à
partir de la tâche ; pour un trou `c` : « … بكم كيلوغرامًا اشترت وقد دفعت 1400 DA؟ »). « Dire une seule fois » (§17.7).

**Qualité (MANIPULATION_DNA §17)** : monde dessiné riche, kit partagé (`LabKit`, `SvgPill`, `KidFigure` hijab), un seul écran sans défilement à
768×1024, **1024×768 avec le menu latéral OUVERT (colonne de leçon ≈ 414–520 px)**, 1280×800, 1366×768, 1920×1080 (tablettes et portables ;
les téléphones ne sont PAS supportés) ; cibles ≥ 44 px ; mouvement coupé sous `prefers-reduced-motion` ; test géométrique « aucune
étiquette ne se chevauche » ; bidi : chaque nombre dans un îlot LTR ; chiffres occidentaux, virgule décimale ; la bulle du coach ne cache jamais
la planche, la règle ni les balances. Captures Playwright (état initial, mi-activité ouverte ET voilée, refus, leurre, succès, formel, panneau
libre) aux cinq tailles, REGARDÉES et corrigées (voir `apps/web/e2e/lesson-kit/zero-probe-lab.mjs` pour la page de test et la mesure « tient dans
l'écran »). Port de Vite : **5173** (déjà lancé pour toi ; ne le tue pas). Enregistrement : `manipulationTypes.js`, `manipulationLevels.js`, `levels.js`
(+ `levels.test.js` si une branche est ajoutée), `manipulationRegistry.js` — petites éditions ciblées après relecture fraîche (d'autres leads
touchent ces fichiers en même temps : ne jamais réécrire un fichier entier, ne jamais défaire le changement d'un autre).

## 3. La banque `content/practice/2am/rabi-mutanasib/`

5 niveaux × 10 feuilles d'examen (BEM / examen de trimestre) — voir `docs/sources/4am/bem-practice/brief-authors.md` (format) et les banques
modèles `content/practice/2am/muqarana-nisbiya/`, `content/practice/2am/qisma-iqlidiya-hasr/`, `content/practice/3am/quwat-adad-nisbi/`.
Sources : `docs/sources/moyen/exams/exams-index.json` (devoirs et examens de 2AM et leurs `programmeItems`) : cherche les exercices de
2AM (et de 3AM) qui touchent `2am.m6.r02` / `2am.m6.r03` ; ≈ 12–15 feuilles `source.type: "term_exam"` UNIQUEMENT pour des exercices
FIDÈLES du corpus (UN exercice précis du corpus chacune, relu dans le PDF, badge « على منوال اختبار الفصل … » selon l'en-tête du papier ; un
exercice qui n'est qu'inspiré est `term_exam_modelled` ou `adapted`) ; le reste `term_exam_modelled` / `adapted`. Contenu limité aux
concepts du §1 (aucun pourcentage, échelle, conversion, graphique). Chaque feuille est cohérente : les nombres des questions ne changent pas
de contexte au milieu. Misconceptions `MISC-RABI-*` (par ex. « on ajoute la même différence : 625 + 1 », « on multiplie les deux nombres de
la même ligne », « on divise au lieu de multiplier (a ÷ c) », « les produits en croix de la mauvaise diagonale », « le tableau mal aligné :
quantité avec prix »). Un module d'oracle `scripts/practice-oracle/rabi-mutanasib.mjs` recalcule CHAQUE réponse construite en
arithmétique exacte indépendante (fractions BigInt) ; câblage dans `active.json`, `exam-style.json`, `policy.json`,
`misconceptions.json`, `index.generated.json`, `scripts/practice-answer-oracle.test.mjs` exactement comme les banques modèles. Chaque
distracteur est FAUX. La leçon liste les 3 الكفاءات `2am_rabi-mutanasib_P1…P3`.

## 4. Fichiers

Lead : `apps/web/src/lessons/moyen/2am/tanasubiya_duwal/tanasubiya-2am/**`, `docs/sources/2am/unit5/**`, catalogue, docs, e2e de la leçon.
Auteur du labo : `operations/FourthGauges.jsx` (+ `fourthGauges/`), `logic/fourthGauges.js`, `packages/core/arithmetic/fourthProportional.js`, leurs tests,
strings, enregistrements, `apps/web/e2e/lesson-kit/fourth-gauges-lab.mjs`. Auteur de la banque : `content/practice/2am/rabi-mutanasib/**`, l'oracle et son
câblage. Ne pas toucher les dossiers d'autres leads (3AM `musawiyat-amaliyat`, `muadalat-darajat-ula`, `nashr-jabri-3am`). Ne pas committer ni
pousser, ne pas importer en base.
