# Brief des auteurs — 2AM, unité 3 « الأعداد النسبية » (`adad-nisbiya-2`), leçon `muqarana-nisbiya`

Écrit le 2026-10-21 par le lead de la leçon (file de génération Phase A, #7). Lisible par le lead, l'auteur du labo et l'auteur de la
banque. Frontières des leçons de l'unité : en-tête de `build-extraction.py` ; extraction : `extraction.json` (98 éléments).

## 1. La leçon

« مقارنة وترتيب أعداد نسبية » — items `2am.m4.r02` (comparer deux relatifs) et `2am.m4.r03` (ranger). Lien « راجع » du réseau :
`2am.m4.r01` (lire / placer une abscisse), leçon `talim-mustaqim-mudarraj-2` (publiée le 2026-10-29, après cette leçon : arête P1 ← `2am_talim-mustaqim-mudarraj-2_P1`) : « أستعدّ » la mesure, la leçon ne la
reconstruit pas. Sert en avant la leçon 4AM `mutarajiha-ula` (inéquations).

**الكفاءات finales** (ordre = ids positionnels `2am_muqarana-nisbiya_P1…P3`) :
- P1 « مقارنة عددين نسبيين سالبين (مثل $-1{,}9$ و $-1{,}91$): الأصغر هو الذي له أكبر مسافة إلى الصفر »
- P2 « مقارنة عددين نسبيين موجبين أو من إشارتين مختلفتين: السالب أصغر من الموجب ومن الصفر، والصفر أصغر من كل عدد موجب »
- P3 « ترتيب أعداد نسبية تصاعديا أو تنازليا باستعمال الرمزين $<$ و $>$ ، وإيجاد عدد محصور بين عددين معلومين »

**Mots de la plateforme** : « عدد نسبي » (écriture décimale seulement, jamais de fraction), « المسافة إلى الصفر », « الأصغر / الأكبر »,
« تصاعديا / تنازليا », les symboles `<` `>`. Un relatif négatif s'écrit toujours avec le signe moins ASCII dans les données et
`−` (U+2212) à l'écran, dans un îlot LTR.

## 2. Le labo `zero-probe` (« المسبار ») — contrat FIXE avec la leçon

**Idée.** La main tient la **distance à zéro** `d` (≥ 0) d'un second capteur B, la longueur d'un câble qui descend (ou monte) du zéro ;
le côté (« فوق / تحت الصفر ») est un autre geste. Le nombre relatif est une SORTIE (côté + longueur). Un autre capteur A est fixé à un
nombre donné. La question : trouver la longueur de câble pour que B soit plus bas / plus haut que A, ou entre deux repères. Résistance :
quand B est sous le zéro, plus de câble le RENDLE plus bas (le nombre devient plus petit) — l'inverse de l'intuition du naturel ; un côté
interdit à une tâche (A au-dessus du zéro et B sous le zéro : aucune longueur ne rend B plus haut) ; une zone « entre » étroite qu'une
seule dizième atteint. Ce n'est PAS `ruler-compare` (1AM : la main tient la graduation d'une règle de décimaux positifs) ni `solution-ray`
(4AM : la main tient x sur un rayon) : ici la main tient une DISTANCE et un signe est sa conséquence.

**Monde** `sea` (thème `researchBoat`, mots dans `lesson.manipulation.json › zeroProbe.*`) : le ciel au-dessus, la mer sous la ligne du zéro
(la surface), un bateau de recherche au centre sur la ligne, une jeune chercheuse (`KidFigure`, hijab, `mood` selon le verdict) sur le pont,
un mât et un drone au-dessus du zéro, un robot plongeur sous. Altitudes en mètres, échelle verticale graduée à droite de −10 à 10 (zéro
marqué). A = capteur fixe (fanion rouge, valeur écrite), B = capteur mobile au bout du câble (la **longueur du câble = la distance** est
dessinée comme un câble depuis la ligne du zéro, avec sa pastille `d = …`). Des guides pointillés horizontaux de A et de B vers
l'échelle montrent lequel est le plus bas. Les nombres relatifs sont toujours dans un îlot LTR (`⁦…⁩`), le signe moins `−`.

**Props** (`<Manipulation type="zero-probe" … />`, tous les callbacks par `state.report`) :
`world` (`'sea'`), `tasks`, `level`, `levels`, `coach` (défaut true), `title`, `lead`, `onTrial(event)`, `onFinished({ })`.
`tasks` = liste d'objets :
- `{ kind: 'beat', a: '-3', side: 'below'|'above'|null, want: 'lower'|'higher', both?: true }` — rendre B plus bas (`B < A`) ou plus haut
  (`B > A`) que A. `side` = côté imposé à B (`null` : l'élève choisit). `both: true` : il faut réussir une fois de chaque côté.
  Si aucune longueur ne convient (côté imposé sous le zéro, A ≥ 0, `want: 'higher'`… et, de façon générale, quand `solutions` est vide), la
  tâche s'accomplit par le bouton **« لا يوجد طول يحقّق ذلك »** (jugé exactement) ; ce bouton est visible dans TOUTES les tâches (il ne
  donne jamais la réponse) et, pressé quand une longueur convient, il est refusé en montrant UNE longueur qui convient.
- `{ kind: 'between', lo: '-4,5', hi: '-4,3', side: null }` — rendre `lo < B < hi` (strict).
Textes de nombres : virgule décimale, signe `-` ASCII ; 0 à 2 décimales. `d` : de 0 à 10, pas 1 au niveau مبتدئ, pas 0,1 au niveau متقدم.

**Presets** (`levels.js`, deux niveaux, même `objective` côté leçon) :
- مبتدئ : `[ beat A=-3 below lower ; beat A=-3 below higher ; beat A=4 above lower ; beat A=2 below higher (impossible) ]`
- متقدم : `[ between lo=-4,5 hi=-4,3 side null ; beat A=1,2 side null lower both:true ; between lo=-0,4 hi=-0,2 side null ]`

**Gestes (trois chemins chacun).** (1) tirer le nœud du câble le long de l'échelle (le câble se déroule du zéro ; il ne traverse JAMAIS le
zéro : arrêté à 0) ; (2) −/+ (`StepperCard`, « المسافة إلى الصفر ») ; (3) clavier sur le nœud (`role="slider"`, flèches, Home/End). Le côté :
deux gros boutons à bascule « فوق الصفر » / « تحت الصفر » (≥ 44 px) ; la longueur reste quand on change de côté. **Un essai = un
relâchement** (fin de glissement, clic −/+, flèche, changement de côté), jugé exactement ; l'aller-retour pendant le glissement n'en est pas
un. L'écran dit, après un essai, les DEUX nombres écrits et le verdict en mots (« B عند −5 وA عند −3: B أخفض من A »), jamais la règle.

**« جرّب أعدادك أنت »** toujours ouvert sous le labo : champ pour A (relatif décimal, |A| ≤ 9,9, un signe moins accepté `-` ou `−`, chiffres
arabes-indiens acceptés) ; la scène passe à A et le même câble ; l'essai affiche la comparaison B ? A après relâchement ; les essais
libres (`free: true`) ne comptent jamais pour une tâche ni pour la découverte ; « عُد إلى مهامّك ».

**Découverte** (`ManipulationDiscovery`, aucun texte ne dit la règle avant) : مبتدئ « متى يكون المسبار الأبعد عن الصفر هو الأخفض؟ » (options :
« دائمًا » réfutée par SON essai au-dessus du zéro, « إذا كان تحت الصفر » vraie, « إذا كان فوق الصفر » réfutée par son essai sous le zéro) ;
متقدم « أيّ العددين أخفض إذا كان أحدهما تحت الصفر والآخر فوقه؟ ». `discoveryReady` = toutes les tâches faites. Phase formelle : ce que
l'élève a trouvé écrit avec SES nombres (`−5 < −3`, `|−5| = 5 > 3 = |−3|`), la règle une fois.

**LabCoach** (obligatoire, `coach` true par défaut, MANIPULATION_CONTRACT §8quater) : `coachOf` pure — `grab` (le nœud), `try` (−/+),
`side` (une tâche à côté libre : les boutons du côté, jamais lequel), `decide` (après ≥ 3 longueurs essayées sans réussite : le bouton
« لا يوجد طول »), `next`. Testé en SUIVANT le coach jusqu'à la fin de chaque tâche des deux niveaux.

**Événements `onTrial(e)`** (fixes — les modules de la leçon les lisent) :
`{ kind: 'release', task: <index>, tk: 'beat'|'between', a: '-3'|null, side: 'below'|'above', d: '5', value: '-5', ok: true|false, free: false|true }`
(`value` = le nombre relatif de B écrit, virgule, signe `-`) ; `{ kind: 'none', task, ok, free: false }` ; `{ kind: 'side', task, side }`.
`onFinished({})` à la formalisation.

**DOM** (préfixe `data-zp-…`) : `[data-zero-probe][data-world][data-task][data-solved][data-layout]`, `[data-zp-glance]`, `[data-zp-stage]`,
`[data-zp-svg]`, `[data-zp-a]`, `[data-zp-b][data-value]`, `[data-zp-cable][data-d]`, `[data-zp-knob]` (role slider, `aria-valuenow` = d),
`[data-zp-side=above|below][aria-pressed]`, `[data-zp-less]`, `[data-zp-more]`, `[data-zp-d]`, `[data-zp-readout]`, `[data-zp-none]`,
`[data-zp-verdict=right|wrong|none|free|'']`, `[data-zp-prompt][data-lit]`, `[data-zp-next]`, `[data-zp-step=<i>][data-done]`,
`[data-zp-free][data-active]`, `[data-zp-free-a]`, `[data-zp-free-back]`, `[data-zp-formal]`, `[data-zp-kid][data-mood]`.

**Maths exacte.** `packages/core/arithmetic/relative.js` (importé PAR CHEMIN, jamais dans le barrel du cœur) : nombres relatifs décimaux en
BigInt (centièmes) — `parse`, `fromSideDistance(side, d)`, `cmp`, `distance`, `text` (virgule), `tex`, `solutionsBeat(task)`,
`solutionsBetween(task)`, `judge(task, side, d)`. Testé dont un balayage exhaustif (tous les d de 0 à 10 par 0,1 des deux côtés).
Logique pure : `logic/zeroProbe.js` (+ test), composant `operations/ZeroProbe.jsx`, strings `lesson.manipulation.json › zeroProbe`.
Enregistrement : `manipulationTypes.js`, `manipulationLevels.js`, `levels.js` (+ `levels.test.js` si une branche est ajoutée),
`manipulationRegistry.js` — petites éditions ciblées après relecture fraîche (d'autres leads touchent ces fichiers en même temps).

**Qualité (MANIPULATION_DNA §17)** : monde dessiné riche, kit partagé (`LabKit`, `SvgPill`, `KidFigure` hijab), pas de titre : contexte en une
ou deux phrases avec tous les nombres puis UNE question qui nomme le but et l'état final ; « dire une seule fois » ; un seul écran sans
défilement à 768×1024, 1024×768 (colonne de leçon ≈ 414 px), 1280×800, 1366×768, 1920×1080 ; cibles ≥ 44 px ; mouvement coupé sous
`prefers-reduced-motion` ; test géométrique « aucune étiquette ne se chevauche » ; bidi : chaque nombre relatif dans un îlot LTR.
Captures Playwright (état initial et mi-activité, deux niveaux) aux cinq tailles, REGARDÉES et corrigées.

## 3. La banque `content/practice/2am/muqarana-nisbiya/`

5 niveaux × 10 feuilles d'examen (BEM / examen de trimestre) — voir `docs/sources/4am/bem-practice/brief-authors.md` (format) et les
banques modèles `content/practice/3am/quwat-adad-nisbi/` et `content/practice/2am/qisma-iqlidiya-hasr/`. Sources : `docs/sources/moyen/exams/
exams-index.json` (devoirs et examens de 2AM) : ≈ 15 feuilles `source.type: "term_exam"` (UN exercice précis du corpus chacune, `1 2am-s…`
badge « على منوال اختبار الفصل … » selon l'en-tête du papier), le reste `term_exam_modelled` / `adapted`. Le corpus n'a presque aucun exercice
étiqueté `2am.m4.r02` : on modèle les exercices de comparaison / rangement de nombres relatifs (en-tête de série d'exercice « الأعداد
النسبية ») et les exercices de température / altitude. Contenu limité aux concepts de CETTE leçon (comparer, ranger, `<` `>`, lecture
d'une abscisse déjà vue en « أستعدّ ») : pas de somme, pas de différence, pas de plan, pas de distance entre deux points.
Misconceptions `MISC-MUQARANA-NISBIYA-*` (par ex. « −5 > −3 car 5 > 3 », « 0,5 plus grand que 0,25… »). Un module d'oracle
`scripts/practice-oracle/muqarana-nisbiya.mjs` recalcule CHAQUE réponse construite en arithmétique indépendante (BigInt) ; câblage dans
`active.json`, `exam-style.json`, `policy.json`, `misconceptions.json`, `index.generated.json`, `scripts/practice-answer-oracle.test.mjs`
exactement comme les banques modèles. Chaque distracteur est FAUX.

## 4. Fichiers

Lead : `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/adad-nisbiya-2/**`, `docs/sources/2am/unit3/**`, catalogue, docs, e2e de la leçon.
Auteur du labo : `operations/ZeroProbe.jsx` (+ `zeroProbe/`), `logic/zeroProbe.js`, `packages/core/arithmetic/relative.js`, leurs tests, strings,
enregistrements. Auteur de la banque : `content/practice/2am/muqarana-nisbiya/**`, l'oracle et son câblage. Ne pas toucher les dossiers d'autres leads
(3AM `tabsit-hadhf-aqwas`, `musawiyat-amaliyat`, `muadalat-darajat-ula`, `khassiyat-fitaghuras`). Ne pas committer ni pousser, ne pas importer en base.
