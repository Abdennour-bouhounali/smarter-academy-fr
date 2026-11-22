# Programme 4AM — inventaire de curriculum

**Classe** : السنة الرابعة متوسط (4AM) · **Matière** : الرياضيات · **Année** : 2026/2027 · **Génération** : الجيل الثاني

## 0. Statut et autorité de ce document

Ce document est l'**inventaire de curriculum** du projet pour la 4AM. Il ne
contient aucune leçon : il décrit ce qui doit être construit, dans quel ordre,
et ce qui reste à décider.

| Élément | Statut |
|---|---|
| Programme officiel (4 domaines, ci-dessous) | **FOURNI par le propriétaire du projet** (2026-09-16) |
| Découpage en leçons | **FAIT (phase 7)** — un sujet = une leçon, soit 28 leçons |
| Points d'apprentissage (LP) | **FOURNIS par le propriétaire (phase 7)** — 185, en arabe |
| Contenu des leçons | **EN COURS (phase 8)** — unité 1 du manuel (8 leçons + synthèse) écrite ; voir `ALGERIA_PHASE8_UNIT1_TEXTBOOK_REPORT.md` |
| Catalogue affiché (`coursesData.js`) | **Depuis le 2026-09-25** : seuls les ميادين qui portent des leçons (aujourd'hui ميدان أنساب الأعداد والحساب et l'unité « الأعداد الطبيعيّة والأعداد النّاطقة »). Le programme JSON garde ses 4 domaines et 28 sujets ; un ميدان réapparaît dès qu'une leçon le nomme. Les leçons françaises et leur catalogue ont été supprimés le même jour. |
| Terminologie arabe officielle | PARTIELLE — celle du programme fourni est reprise telle quelle |
| Programme officiel 1AM–4AM et prérequis des années antérieures | **FAIT (2026-10-13)** — le réseau des الكفاءات (`docs/architecture/LEARNING_NET.md`) : 224 موارد des quatre années (منهاج 2016 + المخططات السنوية 2022), liens entre items ; chaque leçon 4AM déclare ses `programmeItems` |

**Note de lecture (phase 7).** Les mentions `À DÉCOMPOSER` et `NOT STARTED`
des tableaux §2 à §5 ci-dessous datent d'avant le découpage. Elles sont
conservées telles quelles comme trace de ce qui était ouvert à ce moment ;
l'état courant est celui de `dz/lessons_4am_2026_2027.json` et du rapport
`ALGERIA_PHASE7_CURRICULUM_DECOMPOSITION_REPORT.md`.

**Source d'autorité.** Le programme des §2 à §5 est celui que le propriétaire
du projet a fourni comme spécification officielle pour l'année 2026/2027. Il
remplace, pour ce projet, toute inférence tirée du curriculum français.

**Ce qui n'est PAS établi.** Le document d'accompagnement officiel, la
répartition horaire, la progression annuelle recommandée et les attendus de fin
de cycle n'ont pas été fournis. Tout ce qui en dépendrait porte le marqueur
`[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`. Les rubriques suivantes en
dépendent et restent donc ouvertes :

- l'ordre d'enseignement des domaines dans l'année ;
- le volume horaire par domaine, donc le nombre de leçons ;
- le niveau d'exigence attendu en fin de 4AM pour chaque notion ;
- les prérequis supposés acquis des années 1AM–3AM — **levé le 2026-10-13** :
  ils sont les liens du réseau des الكفاءات (`LEARNING_NET.md`), lus dans le
  منهاج et les المخططات السنوية fournis dans `docs/Math-Moyenne-programme/`.

**Règle de fabrication.** Aucun sujet n'est ajouté à ce programme, aucun n'en
est retiré. Un sujet du curriculum français qui n'apparaît pas ci-dessous
n'entre pas dans la 4AM, même s'il en est mathématiquement proche.

---

## 1. Les quatre domaines

```
4AM
 ├── ميدان أنساب الأعداد والحساب      (§2)
 ├── ميدان الحساب الحرفي               (§3)
 ├── ميدان الهندسة                     (§4)
 └── ميدان تنظيم المعطيات              (§5)
```

---

## 2. ميدان أنساب الأعداد والحساب — الأعداد الطبيعية، الناطقة والحساب على الجذور

| # | الموضوع (sujet) | Décomposition en LP | Dépendances | Statut |
|---|---|---|---|---|
| 2.1 | قواسم عدد طبيعي والقاسم المشترك الأكبر (PGCD) باستخدام خوارزمية أقليدس أو الفروق المتتالية | **FAIT (phase 8)** — couvert par les leçons 1–6 de l'unité 1 du manuel (`aadad-tabiiya-natiqa`) | aucune intra-programme | DONE |
| 2.2 | الأعداد الأولية وكيفية كتابة كسر غير قابل للاختزال | **PARTIEL (phase 8)** — « كسر غير قابل للاختزال » couvert par les leçons 7–8 de l'unité 1 ; « الأعداد الأولية » attend son unité du manuel (`aadad-awwaliya`, `coming_soon`) | 2.1 (le PGCD sert à réduire) | PARTIAL |
| 2.3 | الحساب على الجذور التربيعية : الجمع · الضرب · القسمة · تبسيط عبارة | **Quatre LP au moins, nommés par le programme lui-même** : الجمع, الضرب, القسمة, تبسيط عبارة. L'introduction de la notion de جذر تربيعي elle-même `À DÉCOMPOSER` | aucune intra-programme | NOT STARTED |
| 2.4 | ناطقة مقام نسبة وجذر تربيعي لعدد موجب | `À DÉCOMPOSER` | 2.3 | NOT STARTED |

---

## 3. ميدان الحساب الحرفي — الجبر

> **Placement (décision du propriétaire, 2026-10-01).** Les sujets 3.1 et 3.2 sont enseignés par l'unité 3
> du manuel « الحساب الحرفي », que le propriétaire a placée sous « ميدان أنساب الأعداد والحساب » (comme
> les unités 1 et 2) ; les sujets 3.3, 3.4 et 3.5 par l'unité 4 « معادلات ومتراجحات من الدرجة الأولى بمجهول
> واحد », placée de même (2026-10-01) ; le sujet 3.6 par l'unité 5 « جمل معادلتين من الدرجة الأولى بمجهولين »,
> placée de même (2026-10-01). Le catalogue garde ces sujets comme source (traçabilité) et l'unité déclare l'écart
> (`units_4am_2026_2027.json › placement`).

| # | الموضوع | Décomposition en LP | Dépendances | Statut |
|---|---|---|---|---|
| 3.1 | النشر والتبسيط | Unité 3 du manuel « الحساب الحرفي » (2026-10-01) : `nashr-tabsit` (4 LP) et `mutatabiqat-shahira` (4 LP), LP fournis par le propriétaire | aucune intra-programme | **BUILT** |
| 3.2 | تحليل عبارة جبرية إلى منتوج عوامل من الدرجة الأولى | Unité 3 : `tahlil-ibara` (3 LP) + la synthèse `wadiya-idmajiya-harfi` (3 LP) | 3.1 | **BUILT** |
| 3.3 | حل معادلات من الدرجة الأولى بمجهول واحد | Unité 4 du manuel (2026-10-01) : `muadala-ula` (2 LP) et `tarrid-mushkila` « ترييض مشكلة » (2 LP), LP fournis par le propriétaire | 3.1 | **BUILT** |
| 3.4 | المعادلات جذاء معدوم | Unité 4 : `jidaa-maadum` (3 LP) | 3.2, 3.3 | **BUILT** |
| 3.5 | حل متراجحات من الدرجة الأولى بمجهول واحد وتمثيلها بيانيا | Unité 4 : `mutarajiha-ula` (3 LP — les deux gestes du sujet : la résolution, P2, et la représentation graphique, P3) + la synthèse `wadiya-idmajiya-muadalat` (2 LP) | 3.3 | **BUILT** |
| 3.6 | جمل معادلتين من الدرجة الأولى بمجهولين : طريقة التعويض · طريقة الجمع | Unité 5 du manuel (2026-10-01) : `mafhum-jumla` (4 LP), `hall-jabri` (3 LP — P1 طريقة التعويض, P2 طريقة الجمع, P3 le choix), `mushkilat-jumla` (2 LP) + la synthèse `wadiya-idmajiya-jumal` (2 LP), LP fournis par le propriétaire | 3.3 | **BUILT** |
| 3.7 | الدوال الخطية | Unité 6 du manuel « الدالة الخطية والتناسبية » (2026-10-02), rangée par le propriétaire sous un ميدان d'AFFICHAGE « ميدان التناسبية والدوال » (`units › ownerChapters` ; `placement.programmeDomainId: hisab_harfi`) : `tanasub-muamil`, `dala-khattiya`, `tamthil-bayani-khatti`, `tatbiqat-tanasub`, `tarrid-khatti` (3 LP chacune) + la synthèse `wadiya-idmajiya-khattiya` (3 LP), LP fournis par le propriétaire. La représentation graphique d'une fonction LINÉAIRE y est enseignée (`tamthil-bayani-khatti`) ; 3.8 et 3.9 restent ouverts | 3.1 | **BUILT** |
| 3.8 | الدوال التآلفية | Unité 7 du manuel « الدالة التآلفية » (2026-10-02, pp. 77–79 fournies), même ميدان d'AFFICHAGE que l'unité 6 (`placement.programmeDomainId: hisab_harfi`) : `mafhum-taalufiya` (4 LP), `tanasub-taghayyurat` (2 LP), `tafsir-bayani-jumla` (3 LP — l'interprétation graphique d'une جملة, lien avec 3.6), `tarrid-taalufi` (2 LP) + la synthèse `wadiya-idmajiya-taalufiya` (2 LP), LP fournis par le propriétaire | 3.7 | **BUILT** |
| 3.9 | التمثيل البياني | Unité 7 : `tamthil-bayani-taalufi` (3 LP, `sourceTopicId: tamthil_bayani`) — la représentation graphique d'une fonction affine et sa lecture ; celle d'une fonction linéaire est en 3.7 (`tamthil-bayani-khatti`), celle des solutions d'une inéquation en 3.5. Le rattachement exact du sujet reste `[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]` | 3.7, 3.8 | **BUILT** (fonctions) |

---

## 4. ميدان الهندسة — المهندس والقياس

| # | الموضوع | Décomposition en LP | Dépendances | Statut |
|---|---|---|---|---|
| 4.1 | خاصية طالس وعكسيتها في المثلث المستوي وحساب الأطوال | Unité 9 du manuel « خاصية طالس » (2026-10-02, pp. 103–113, unité complète), la PREMIÈRE unité rangée sous ce ميدان du programme (`handasa`, sans `placement`) : `talis-hisab-atwal` (3 LP — la propriété et le calcul de longueurs, k), `aksiya-talis` (2 LP — la réciproque et l'ordre des points), `inshaat-talis` (2 LP — partage d'un segment, longueur construite) + la synthèse `wadiya-idmajiya-talis` (3 LP), intitulés, LP et prérequis fournis par le propriétaire ; les trois gestes du sujet sont couverts | aucune intra-programme | **BUILT** |
| 4.2 | النسب المثلثية في مثلث قائم : جيب · جيب تمام · ظل زاوية حادة | Unité 10 du manuel « حساب المثلثات في المثلث القائم » (2026-10-04, pp. 115–125, unité complète), sous `handasa` sans `placement` : `nisab-muthallathiya` (3 LP — cos, sin, tan d'un angle aigu, bornes 0 < sin, cos < 1, longueurs), `hasiba-muthallathiya` (3 LP — touches directes, inverses, arrondis), `tarrid-muthallathiya` (3 LP — modéliser, choisir le rapport, résoudre le triangle rectangle) + la synthèse `wadiya-idmajiya-muthallathat` (3 LP) ; intitulés et LP fournis par le propriétaire (ses « كفاءات الدرس ») | aucune intra-programme | **BUILT** |
| 4.3 | العلاقات بين النسب المثلثية | Unité 10 : `alaqat-muthallathiya` (3 LP — cos² x + sin² x = 1 et tan x = sin x / cos x prouvées par Pythagore, une valeur exacte d'une autre, la construction sans rapporteur d'un angle dont on connaît un rapport) | 4.2 | **BUILT** |
| 4.4 | المعلم في المستوي : إحداثيتا نقطة · إحداثيتا شعاع · المسافة بين نقطتين | **Trois LP au moins, nommés par le programme** | aucune intra-programme | NOT STARTED |
| 4.5 | الانسحاب والشعاع : مركبة شعاع · مجموع شعاعين | **Deux LP au moins, nommés par le programme**, plus la notion d'انسحاب elle-même `À DÉCOMPOSER` | 4.4 | NOT STARTED |
| 4.6 | الدوران والزوايا | `À DÉCOMPOSER` | aucune intra-programme | NOT STARTED |

---

## 5. ميدان تنظيم المعطيات — الإحصاء

Unité 8 du manuel « الإحصاء » (2026-10-02, pp. 91–101 fournies, unité complète), rangée par le propriétaire sous le ميدان
d'AFFICHAGE « ميدان التناسبية والدوال » après l'unité 7 (`units › ownerChapters` ; `placement.programmeDomainId: tanzim_al_muatayat`),
code `ihsa`, cinq leçons dont les intitulés, les LP (les « كفاءات ») et les prérequis sont fournis par le propriétaire :
`takrar-mujamma` (3 LP), `mada-wasit-mutawassit` (3 LP), `majdulat-ihsaiya` « استعمال المجدولات » (3 LP), `qiraat-wadiyat-ihsaiya`
« ترييض وقراءة وضعيات إحصائية » (3 LP) + la synthèse `wadiya-idmajiya-ihsa` (3 LP). Une leçon ne porte qu'UN `sourceTopicId` :
l'unité déclare les quatre sujets portés par ses leçons (5.1, 5.4, 5.6, 5.9) ; les cinq autres sont enseignés DANS ces leçons
(le manuel les traite ensemble) sans en être le sujet de rattachement.

| # | الموضوع | Décomposition en LP | Dépendances | Statut |
|---|---|---|---|---|
| 5.1 | سلسلة إحصائية ذات فئات | Unité 8 : `majdulat-ihsaiya` (`sourceTopicId: silsila_fiat` — saisir, résumer et représenter une série, l'histogramme d'une série en classes) ; les classes sont aussi travaillées dans `takrar-mujamma` (طرائق) et `mada-wasit-mutawassit` (مراكز الفئات, الفئة الوسيطية) | aucune intra-programme | **BUILT** |
| 5.2 | حساب التكرار | enseigné dans `takrar-mujamma` (tableaux d'effectifs, prérequis de l'unité) | 5.1 | **BUILT** (sans leçon propre) |
| 5.3 | التكرار النسبي | enseigné dans `takrar-mujamma` P2 | 5.2 | **BUILT** (sans leçon propre) |
| 5.4 | التكرار المجمع الصاعد | Unité 8 : `takrar-mujamma` (`sourceTopicId: takrar_mujamma_saaid`, P1) | 5.2 | **BUILT** |
| 5.5 | التكرار المجمع النازل | `takrar-mujamma` P1 (le manuel les définit ensemble, p. 94) | 5.2 | **BUILT** (sans leçon propre) |
| 5.6 | الوسط الحسابي / المعدل | Unité 8 : `qiraat-wadiyat-ihsaiya` (`sourceTopicId: wast_hisabi` — interpréter et comparer par les indicateurs, la moyenne de groupes réunis du تحدّ) ; le calcul de la moyenne pondérée est `mada-wasit-mutawassit` P2 | 5.2 | **BUILT** |
| 5.7 | التواتر | `takrar-mujamma` P2 — le manuel tranche : « نسمي أيضا كل تكرار نسبي تواترا » (p. 94), donc التواتر = التكرار النسبي dans le manuel | 5.2 | **BUILT** (sans leçon propre) |
| 5.8 | المدى | `mada-wasit-mutawassit` P1 | 5.1 | **BUILT** (sans leçon propre) |
| 5.9 | الوسيط لسلسلة إحصائية | Unité 8 : `mada-wasit-mutawassit` (`sourceTopicId: wasit`, P3) + la synthèse `wadiya-idmajiya-ihsa` | 5.1 | **BUILT** |

---

## 6. Registre terminologique

La terminologie arabe du programme est **la** terminologie de l'interface
élève. Elle n'est jamais retraduite depuis le français, et le français ne figure
ci-dessous que comme repère pour l'équipe technique.

| Arabe (programme) | Repère technique français |
|---|---|
| ميدان أنساب الأعداد والحساب | domaine « nombres et calcul » |
| ميدان الحساب الحرفي | domaine « calcul littéral » |
| ميدان الهندسة | domaine « géométrie » |
| ميدان تنظيم المعطيات | domaine « organisation de données » |
| القاسم المشترك الأكبر (PGCD) | plus grand commun diviseur |
| خوارزمية أقليدس | algorithme d'Euclide |
| الفروق المتتالية | différences successives |
| الأعداد الأولية | nombres premiers |
| كسر غير قابل للاختزال | fraction irréductible |
| الجذور التربيعية | racines carrées |
| النشر والتبسيط | développement et réduction |
| التحليل | factorisation |
| المعادلات | équations |
| المتراجحات | inéquations |
| جذاء معدوم | produit nul |
| الدوال الخطية | fonctions linéaires |
| الدوال التآلفية | fonctions affines |
| خاصية طالس | théorème de Thalès |
| النسب المثلثية | rapports trigonométriques |
| جيب / جيب تمام / ظل | sinus / cosinus / tangente |
| المعلم | repère |
| الشعاع | vecteur |
| الانسحاب | translation |
| الدوران | rotation |
| التكرار | effectif |
| التكرار النسبي | fréquence |
| التكرار المجمع الصاعد / النازل | effectifs cumulés croissants / décroissants |
| الوسط الحسابي | moyenne arithmétique |
| الوسيط | médiane |
| المدى | étendue |
| التواتر | `[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]` — distinct de التكرار النسبي ? |

---

## 7. Comparaison avec le référentiel technique français

Le dépôt hérite de 133 leçons françaises, **dormantes**. Elles ne sont
**jamais** une source de contenu : le tableau ci-dessous sert uniquement à
estimer l'effort d'ingénierie (un composant interactif existe-t-il déjà ? une
architecture de module est-elle réutilisable ?).

**Une proximité mathématique n'est pas une équivalence pédagogique.** La
classification finale se fait LP par LP, en phase 7, contre le programme
algérien — pas contre le titre d'une leçon française.

| Sujet 4AM | Leçon(s) française(s) la/les plus proche(s) | Classification provisoire | Décision d'ingénierie provisoire |
|---|---|---|---|
| 2.1 PGCD | `multiples-diviseurs` (3e) | PARTIAL — l'algorithme d'Euclide et les différences successives sont nommés par le programme algérien, pas par le français | ADAPTER l'architecture |
| 2.2 Nombres premiers, fraction irréductible | `multiples-diviseurs` (3e), `nombres-rationnels` (3e) | PARTIAL | ADAPTER |
| 2.3 Calcul sur les racines | `racines-carrees-3e` (3e), `racines-carrees-4e` (4e) | PARTIAL — les 4 opérations sont explicitement nommées côté algérien | ADAPTER |
| 2.4 Rationaliser un dénominateur | aucune | MISSING | CONSTRUIRE |
| 3.1 Développement / réduction | `calcul-litteral-algebrique` (3e), `calcul-litteral-4e` (4e) | MATCHING probable | ADAPTER |
| 3.2 Factorisation | `calcul-litteral-algebrique` (3e) | PARTIAL | ADAPTER |
| 3.3 Équations 1er degré | `equations-4e` (4e) | MATCHING probable | ADAPTER |
| 3.4 Équations produit nul | `equations-produit` (3e) | MATCHING probable | ADAPTER |
| 3.5 Inéquations + représentation | aucune au collège ; `equations-et-inequations-2nde` (2nde) | DIFFERENT — le français traite les inéquations au lycée | CONSTRUIRE |
| 3.6 Systèmes de deux équations | aucune | MISSING — absent du collège français | CONSTRUIRE |
| 3.7 Fonctions linéaires | `fonctions-lineaires-3e` (3e) | MATCHING probable | ADAPTER |
| 3.8 Fonctions affines | `fonctions-affines-3e` (3e) | MATCHING probable | ADAPTER |
| 3.9 Représentation graphique | `representation-graphique-3e`, `lecture-graphique-3e` (3e) | PARTIAL | ADAPTER |
| 4.1 Thalès et réciproque | `thales-3e` (3e) | MATCHING probable | ADAPTER |
| 4.2 Rapports trigonométriques | `trigonometrie-triangle-rectangle-3e` (3e) | MATCHING probable | ADAPTER |
| 4.3 Relations entre rapports | `trigonometrie-triangle-rectangle-3e` (3e) | PARTIAL | ADAPTER |
| 4.4 Repère, coordonnées, distance | `reperage-droite-plan-3e` (3e), `vecteurs-2nde` (2nde) | PARTIAL — la distance entre deux points est au lycée côté français | ADAPTER + CONSTRUIRE |
| 4.5 Translation et vecteur | `translations-vecteurs-3e` (3e) | MATCHING probable | ADAPTER |
| 4.6 Rotation et angles | `transformations-4e` (4e) | PARTIAL | ADAPTER |
| 5.1 Série à classes | `series-regroupees-classes-2nde` (2nde) | DIFFERENT — au lycée côté français | ADAPTER depuis le lycée |
| 5.2–5.3 Effectifs, fréquences | `statistiques-3e` (3e) | MATCHING probable | ADAPTER |
| 5.4–5.5 Effectifs cumulés | `statistiques-une-variable-2nde` (2nde) | PARTIAL | ADAPTER |
| 5.6 Moyenne | `statistiques-3e` (3e) | MATCHING probable | ADAPTER |
| 5.7 التواتر | `[À VÉRIFIER]` | UNKNOWN | à trancher en phase 7 |
| 5.8 Étendue | `statistiques-3e` (3e) | MATCHING probable | ADAPTER |
| 5.9 Médiane | `statistiques-une-variable-2nde` (2nde) | PARTIAL | ADAPTER |

**Lecture de ce tableau.** « MATCHING probable » veut dire que l'architecture
de module française est vraisemblablement réutilisable, pas que la leçon peut
être traduite. Quatre sujets (2.4, 3.5, 3.6, et partiellement 4.4) n'ont
aucun équivalent au collège français et seront construits de zéro.

---

## 8. Architecture de contenu retenue

```
apps/web/src/lessons/moyen/4am/<domaine>/<unite>/<lecon>/      ← phase 8 : l'UNITÉ du manuel entre le domaine et la leçon
    lesson.config.js        ← id, kind (lesson|synthesis), unit, modules, stages, LP enseignés, resources[]
    content/textbook.js     ← le MANUEL au mot près, chaque bloc avec sa `source` (docs/sources/<classe>/<unité>/extraction.json)
    content/exercises.js    ← les exercices du manuel rattachés à la leçon
    index.jsx               ← LessonIndex
    routes.jsx              ← montage + fournisseur de carte
    moduleContext.js
    knowledge.jsx           ← source unique des connaissances
    modules/Module<NN><Descripteur>.jsx
```

| Décision | Valeur | Raison |
|---|---|---|
| Identifiant de niveau | `moyen` | Le collège algérien est « المتوسط », pas « collège » ; réutiliser `college` mélangerait les deux catalogues |
| Identifiant de classe | `4am` | Celui qui entrera dans `ACTIVE_GRADE_IDS` |
| Identifiants de chapitre | un par domaine (§1) | Le programme est structuré en ميادين ; les chapitres doivent en être le reflet |
| Frontières de leçon | `À DÉCOMPOSER` | Elles doivent suivre la cohérence pédagogique, jamais la commodité d'implémentation |

**Point technique à traiter en phase 7.** `scripts/check-routes.mjs` déduit la
classe d'un chemin par l'expression `lessons/(?:college|lycee)/([^/]+)/`. Un
niveau `moyen` n'y répond pas : la leçon serait vue comme sans classe, et le
contrôle de montage échouerait. L'expression doit accueillir `moyen` **avant**
que la première leçon 4AM soit montée.

---

## 9. Standard pédagogique

Toute leçon 4AM suit la boucle de la plateforme :

```
Concret → Visuel → Numérique → Symbolique → Automatisation
```

et la progression :

```
situation réelle → pourquoi → manipulation → observation →
découverte de la règle → pratique guidée → pratique autonome → mémoire d'examen
```

Interdits, repris de `ALGERIA_PLATFORM_MASTER_SPEC.md` §9 :

- terminologie prématurée ; symbole avant l'idée ; formule non expliquée ;
- trop de variables à la fois ; abstraction avant l'intuition ;
- blocage sur une réponse fausse ; diagnostic qui empêche d'avancer.

L'élève ne doit jamais se demander quoi faire.

---

## 10. Ce qu'il reste à faire

**Fait en phase 8 (2026-09-18)** : l'unité 1 du manuel (8 leçons + synthèse), le système de manipulation réutilisable, la hiérarchie الوحدة en catalogue/base/API, la traçabilité manuel → plateforme. **Ouvert** : fournir les unités suivantes du manuel ; arbitrer le recouvrement `aadad-awwaliya` ↔ leçons 7–8 ; choisir la surface enseignant qui activera le mode classe des manipulations.

**Fait en phase 6F** (voir `ALGERIA_PHASE6F_DATA_SCOPE_IMPLEMENTATION_REPORT.md`) :

- ~~Produire le fichier source du catalogue 4AM et l'intégrer à `coursesData.js`~~
  — fait, via `buildDzCourseLevels()`, sous forme de chapitres portant les 28
  sujets (`chapters.topics`), sans leçon.
- ~~Étendre `check-routes.mjs` au niveau `moyen`~~ — fait (§8).
- ~~Ajouter `4am` à `ACTIVE_GRADE_IDS`, relancer l'export et l'import, vérifier
  l'absence de dérive~~ — fait ; `4am` et `terminale_dz` sont actifs, la base
  ne contient plus que ces deux classes.

**Fait en phase 7** (voir `ALGERIA_PHASE7_CURRICULUM_DECOMPOSITION_REPORT.md`) :

- ~~Trancher les frontières de leçons~~ — fait : **un sujet = une leçon**,
  règle arrêtée par le propriétaire. 28 sujets → 28 leçons.
- ~~Décomposer chaque sujet en LP~~ — fait : **185 points d'apprentissage**,
  intitulés arabes fournis par le propriétaire. Les `À DÉCOMPOSER` des §2 à §5
  ci-dessus sont donc résolus, sauf mention contraire.

**Reste à faire** :

1. Classer chaque LP algérien contre le français, LP par LP (phase 8).
2. ~~Choisir les trois leçons gratuites dans `freeLessons.js`~~ — **caduc
   (2026-09-25)** : le palier est une décision d'administration
   (`lessons.tier`, modifié dans le panneau), il n'existe plus de liste
   figée. Voir `architecture/ADMIN_PANEL_ARCHITECTURE.md` « Le palier du
   contenu ».
3. Faire relire le découpage par une autorité curriculaire externe.
