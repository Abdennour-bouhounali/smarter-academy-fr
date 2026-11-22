# Phase 7 — Rapport d'implémentation : découpage du curriculum 4AM

**Exécuté** : 2026-09-16. Suite directe de
`ALGERIA_PHASE6F_DATA_SCOPE_IMPLEMENTATION_REPORT.md`, dont le périmètre à
deux classes est le point de départ.

---

## 1. Objectif

Transformer le programme officiel de 4AM, qui s'arrête au niveau du SUJET, en
une architecture de LEÇONS exploitable par les phases suivantes :

```
4AM → ميدان (chapitre) → موضوع (sujet officiel) → leçon → points d'apprentissage
```

sans écrire le contenu des leçons, qui relève des phases ultérieures.

## 2. Autorité des sources

| Ce qui est décidé | Par qui | Où |
|---|---|---|
| Ce qui doit être enseigné (4 domaines, 28 sujets) | Programme officiel, fourni par le propriétaire le 2026-09-16 | `dz/programme_4am_2026_2027.json` |
| Le découpage en leçons (1 sujet = 1 leçon) | **Décision du propriétaire du projet**, 2026-09-16 | `dz/lessons_4am_2026_2027.json` |
| Les descriptions, prérequis, points d'apprentissage, durées et difficultés, **en arabe** | **Fournis par le propriétaire du projet**, 2026-09-16 | idem |

**Rien n'a été traduit, reformulé, inféré ni complété par l'outil.** Le
propriétaire a d'abord fourni une version française des points
d'apprentissage, puis la version arabe complète ; c'est cette dernière qui est
en base et à l'écran, la terminologie scolaire arabe n'étant pas inventable
(master spec §15 : « Do not invent official terminology »).

Le curriculum français n'a servi à rien dans cette phase : ni comme source de
contenu, ni comme modèle de découpage. `referenceCourseLevels` n'est lu par
aucune surface produit, ce que la garde `check-dormant-isolation.mjs` vérifie
à chaque construction.

## 3. Inventaire des chapitres 4AM

| # | Chapitre (ميدان) | Sous-titre |
|---|---|---|
| 1 | ميدان أنساب الأعداد والحساب | الأعداد الطبيعية، الناطقة والحساب على الجذور |
| 2 | ميدان الحساب الحرفي | الجبر |
| 3 | ميدان الهندسة | المهندس والقياس |
| 4 | ميدان تنظيم المعطيات | الإحصاء |

## 4. Inventaire des sujets officiels

28 sujets, inchangés depuis la phase 6F, répartis 4 / 9 / 6 / 9. Leur libellé
arabe n'a été modifié nulle part : il sert désormais de **titre de leçon**,
puisqu'une leçon correspond exactement à un sujet.

## 5. Table de découpage

**Règle appliquée : un sujet officiel = une leçon.** Aucun sujet n'a été
fusionné, aucun n'a été scindé.

| Chapitre | Sujets officiels | Leçons | LP |
|---|---:|---:|---:|
| ميدان أنساب الأعداد والحساب | 4 | 4 | 26 |
| ميدان الحساب الحرفي | 9 | 9 | 63 |
| ميدان الهندسة | 6 | 6 | 43 |
| ميدان تنظيم المعطيات | 9 | 9 | 53 |
| **Total** | **28** | **28** | **185** |

Volume horaire déclaré : 2295 minutes au total (18 leçons à 90 min, 5 à 75 min,
5 à 60 min). Difficulté : 15 متوسط, 11 صعب, 2 سهل.

## 6. Nombre de leçons par sujet

Exactement une, pour les 28 sujets. Vérifié par test
(`dz/decomposition.test.js`), dans les deux sens.

## 7. Justification du découpage

**Aucun sujet n'a été scindé, et c'est la décision principale de cette phase.**

Le propriétaire du projet a arrêté la règle « un sujet = une leçon » plutôt
que de laisser l'outil proposer des frontières. La raison est documentée et
tient à ce que le programme ne dit pas : il ne fournit ni répartition horaire,
ni progression annuelle recommandée, ni attendus de fin de cycle
(`ALGERIA_4AM_CURRICULUM.md` §0). Scinder un sujet aurait donc voulu dire
inventer une frontière pédagogique que rien dans la source ne fixe, et la
présenter ensuite à l'élève comme si le programme l'avait prescrite.

Les six sujets qui nomment eux-mêmes leurs méthodes ou leurs parties
(خوارزمية أقليدس / الفروق المتتالية ; الجمع، الضرب، القسمة، تبسيط عبارة ;
طريقة التعويض / طريقة الجمع ; جيب، جيب تمام، ظل ; إحداثيتا نقطة، إحداثيتا شعاع،
المسافة بين نقطتين ; مركبة شعاع، مجموع شعاعين) étaient les candidats naturels à
une scission. Ils ne l'ont pas été : leurs composantes nommées apparaissent
comme **points d'apprentissage** à l'intérieur de la leçon, ce qui les rend
enseignables et évaluables séparément sans fragmenter le sujet officiel.

## 8. Points d'apprentissage

185 au total, entre 5 et 9 par leçon, tous en arabe et tous fournis par le
propriétaire. Identifiants déterministes selon la convention déjà en place
dans la plateforme : `4am_<code-leçon>_P<n>` (par exemple `4am_pgcd_P1`).

Cette convention est déjà celle des preuves d'apprentissage et de la carte des
connaissances, ce qui évite un second système d'identifiants. Elle est
stable tant que l'ordre des points ne change pas — un réordonnancement
modifierait ce que désigne un identifiant existant, et
`smarter:validate-curriculum` le signale après import.

Chaque leçon a au moins un point : une leçon sans point ne serait rattachable
ni à la progression, ni à la carte des connaissances, ni à une évaluation.

## 9. Graphe de dépendances

Les prérequis sont déclarés **en texte**, tels que fournis (par exemple
`الأعداد الطبيعية`, `القسمة الإقليدية`, `قواسم عدد طبيعي` pour la leçon du PGCD),
et non comme des références à d'autres leçons.

C'est délibéré et c'est une limite assumée : une partie des prérequis cités
relève des années antérieures (1AM–3AM), dont le programme n'a pas été fourni,
et les transformer en arêtes d'un graphe inter-leçons exigerait de décider
lesquels pointent vers une leçon de 4AM et lesquels sortent du périmètre. Cette
décision n'a pas été prise ici ; aucune dépendance circulaire ne peut donc
exister, puisque aucune arête inter-leçons n'a été créée.

**`À VÉRIFIER DANS LE PROGRAMME OFFICIEL`** — l'ordre d'enseignement dans
l'année. L'ordre retenu dans le catalogue est celui du programme lui-même
(ordre des domaines, puis des sujets). Rien n'indique qu'il s'agisse de l'ordre
d'enseignement recommandé.

## 10. Décisions marquées `DECISION_PÉDAGOGIQUE`

Aucune. La seule décision de découpage — « un sujet = une leçon » — a été prise
par le propriétaire du projet et non par l'outil ; elle est enregistrée dans le
fichier source sous `decompositionRule: 'one_lesson_per_official_topic'`, et
chaque leçon porte `decisionStatus: 'owner_supplied'`.

## 11. Points `À VÉRIFIER DANS LE PROGRAMME OFFICIEL`

1. **L'ordre d'enseignement dans l'année** (voir §9).
2. **La répartition horaire réelle.** Les durées (60/75/90 min) sont des
   estimations fournies par le propriétaire, non une prescription officielle.
3. **La distinction التواتر / التكرار النسبي**, héritée de la phase 6F et
   toujours ouverte : les deux notions ont chacune leur sujet officiel et donc
   leur leçon, mais leur articulation exacte n'est pas établie par le
   programme.
4. **Les prérequis des années antérieures** (1AM–3AM), dont le programme n'a
   pas été fourni.

## 12. Ce qui reste pour la phase suivante

- Le CONTENU des 28 leçons : modules, prose, figures, interactions.
- Les exercices, les banques de questions, les évaluations finales.
- Les dossiers de leçons sur disque (`apps/web/src/lessons/moyen/4am/...`) et
  leur montage dans `App.jsx` — aucune route 4AM n'est montée aujourd'hui.
- Le choix des **trois leçons gratuites** (`freeLessons.js` reste vide) : il
  est désormais possible, puisque les leçons existent, mais il n'a pas été
  tranché ici.
- La transformation éventuelle des prérequis textuels en graphe inter-leçons.

## 13. Tests et validation

**Nouveau : `packages/core/curriculum/dz/decomposition.test.js`** — 18 tests
couvrant la traçabilité (tout sujet a une leçon, toute leçon a un sujet, le
chapitre concorde, le titre est celui du sujet au mot près, la règle « un
sujet = une leçon » est respectée), l'intégrité des leçons (codes uniques,
champs requis non nuls, chemins, statut `coming_soon`), les points
d'apprentissage (identifiants stables et uniques, au moins un par leçon,
intitulés non réécrits, pas de doublon interne) et le périmètre (aucune leçon
française, terminale sans contenu inventé). Les intitulés arabes ne sont jamais
recopiés dans les tests : ils sont lus depuis le JSON et comparés.

**Mis à jour** : deux assertions de la phase 6F qui encodaient l'état « zéro
leçon » (`coursesData.test.js`) — mises à jour vers l'architecture voulue, non
affaiblies.

**Réactivés** : les deux tests de dérive de palier par leçon de
`check-activation-drift.test.mjs`, que la phase 6F avait dû mettre en
`it.skip` faute de leçon à muter. La suite `scripts` ne comporte plus aucun
test ignoré.

Résultats :

| Suite | Résultat |
|---|---|
| `packages/core` | 233 / 233 |
| `apps/web` | 4934 passés, 4 ignorés (pré-existants) |
| `scripts` | 47 / 47, aucun ignoré |
| `php artisan test` | 708 / 708, 2636 assertions |
| `npm run check:lessons` | toutes les gardes au vert |
| `npm run build` | réussi |
| `smarter:registry-health --gate` | ✅ 28 leçons vérifiées |

## 14. État de la base

```
Grades:       2
Chapters:     4
Lessons:      28
Learning pts: 185
```

| classe | chapitres | leçons | LP |
|---|---:|---:|---:|
| 4am | 4 | 28 | 185 |
| terminale_dz | 0 | 0 | 0 |

Les 185 intitulés arabes en base ont été comparés un à un au fichier source :
aucun manquant, aucun ajouté, aucun modifié. Comptes, droits et codes
d'activation inchangés.

## 15. QA navigateur

Vérifié sous RTL, sans erreur console :

- `/courses` résout vers `moyen` → السنة الرابعة متوسط → 4 chapitres → 28
  cartes de leçons portant l'intitulé officiel arabe et la description fournie ;
- chaque carte est en état « قريبًا / قيد الإعداد », non cliquable — la leçon est
  décidée, pas écrite ;
- السنة الثالثة ثانوي affiche toujours son message explicite
  « البرنامج غير متوفّر بعد », sans grille vide trompeuse.

**Défauts trouvés et corrigés pendant cette QA** : l'affichage des leçons
faisait réapparaître du français sur un écran arabe — le compteur des
chapitres (« 4 leçons ») et les deux libellés de la carte « à venir »
(« Bientôt », « En préparation »). Traduits, avec les six formes plurielles que
l'arabe distingue réellement. Ces chemins n'étaient jamais rendus avant cette
phase, puisqu'aucune leçon n'existait.

## 16. Limites connues

- Les prérequis restent textuels (§9).
- L'habillage marketing de la page reste en français pour un visiteur non
  connecté (« Programme complet — 6e à Terminale », « 2 leçons complètes
  offertes par niveau ») : limite déjà enregistrée en phase 6F, hors périmètre
  ici, et à traiter avec la phase SEO / surface publique.
- Le découpage n'a **pas** été relu par une autorité curriculaire externe. La
  roadmap (phase 7, « Validation steps ») demande une relecture par quelqu'un
  ayant autorité sur le curriculum ; elle reste à faire.

## 17. Confirmation

Aucun contenu de leçon n'a été écrit : ni module, ni exercice, ni évaluation,
ni figure. Aucun sujet officiel n'a été ajouté, retiré ni reformulé. Aucune
terminologie arabe n'a été inventée par l'outil. Le dépôt
`smarter-academy-fr` n'a pas été modifié. Aucune base de production n'a été
touchée.
