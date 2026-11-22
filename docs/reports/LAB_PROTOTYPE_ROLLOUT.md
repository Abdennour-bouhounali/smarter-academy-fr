# Déploiement du prototype de labo — toutes les leçons, tous les niveaux

> **Document de référence (ground truth) du déploiement.** Chaque session le lit EN PREMIER et le met à jour EN DERNIER (§9).
> Prototype validé par le propriétaire le 2026-10-28 sur `maqlub-qismat-kasrayn` (3AM), commit `b480b2b8` sur `dev`.
> Échelle : **112 leçons, 98 labos, 381 cartes de fin de module, 638 connaissances** (à la date du plan ; la vérité courante est
> `node apps/web/scripts/lab-rollout-status.mjs`). **20 leçons par session**, 6 lots (§7).

> **Statut (2026-10-28) : déploiement TERMINÉ — et ce document devient le CONTRAT des nouvelles leçons.** Toute leçon ou tout labo
> généré ensuite (1AM–4AM, nouvelle unité, nouveau type de labo) respecte §2 (L1–L9) et §2bis (C1–C6) dès le premier commit et n'est
> « fait » que lorsque `node apps/web/scripts/lab-rollout-status.mjs --lesson <id>` affiche ✅ (le script compte toute nouvelle leçon).
> Résumé côté génération : `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §6ter. Les lots §7 restent l'historique.

---

## 0. À lire, et seulement ça (économie de jetons)

| Quoi | Où | Pourquoi |
|---|---|---|
| Ce document | ici | le contrat, la procédure, les lots |
| Contrat des questions, étapes, son | `docs/architecture/MANIPULATION_CONTRACT.md` §8quinquies (chercher `### 8quinquies`) | règles détaillées |
| Contrat de la fiche de mémoire | `docs/architecture/KNOWLEDGE_MAP.md` « The memo card » | règles détaillées |
| Le labo de référence | `apps/web/src/lessons/common/manipulations/proportion/GearCrank.jsx` — chercher `useLabCheckpoint`, `CHAINS`, `QUESTIONS`, `LabStepper`, `playSfx` | le patron à copier |
| La leçon de référence | `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/maqlub-qismat-kasrayn/` — `knowledge.jsx` (`memo`), `modules/Module01Nashat.jsx` | le patron des données |

**Ne PAS relire** : CLAUDE.md en entier (déjà chargé), le guide de leçon en entier, les autres contrats. Lire un fichier par plages
(`grep -n`, `sed -n a,bp`), jamais en entier s'il dépasse 300 lignes. Ne jamais relire un fichier qu'on vient d'éditer.

---

## 1. Ce qui est DÉJÀ fait pour tous (rien à refaire, seulement à VÉRIFIER dans le navigateur)

| Élément | Où | État |
|---|---|---|
| « إعادة » lançait une exception dans TOUS les labos (`setHintLevel`) | `useManipulation.js` | corrigé pour tous ; reste à vérifier que CHAQUE labo repart bien (§2 L5) |
| Plein écran « العب بملء الشاشة » / « خروج » | `ManipulationShell` (`immersive` vrai par défaut) | présent dans les 101 labos ; à vérifier : la scène reste utilisable |
| Mode guidé : `ManipulationShell guided` masque « جرّب › اكتشف › صِغ القاعدة » et « تلميح » | `ManipulationShell` (prop `guided`, 2026-10-28) | fait ; chaque labo à questions passe `guided` (§2 L9) |
| Bouton « الصوت » dans chaque labo, préférence unique synchronisée | `ManipulationShell` + `useEffectsPreference` (`sa:effects`) | présent partout |
| API enseignant (couper les questions pour SON compte) | `teacher_lab_settings`, `/teacher/labs/{lessonCode}` | fait ; chaque labo n'a qu'à appeler `useLabCheckpointSettings(type)` |
| Composants partagés | `primitives/LabCheckpoint.jsx`, `labCheckpoint.js`, `labCheckpointSettings.jsx`, `LabSteps.jsx`, `knowledge/MemoCard.jsx`, `MemoQuiz.jsx`, `memoQuiz.js`, `utils/playEffect.js › playSfx` | faits, testés — **ne pas les modifier pendant le déploiement** sauf bogue prouvé (alors : corriger, tester, noter au §10) |
| Validation du contenu `memo` de toutes les leçons | `knowledge/memoContent.test.js` | automatique |
| État du déploiement | `apps/web/scripts/lab-rollout-status.mjs` | automatique |

---

## 2. Définition de « FAIT » — un LABO (une fois par type de labo ; 87 labos ne servent qu'une leçon, 11 en servent 2 ou 3, §8)

- **L1 — Questions pendant le labo** (`useLabCheckpoint`) : après CHAQUE tâche/étape, une suite de 2 à 4 questions sur ce que l'élève
  vient de FAIRE, construites sur les nombres de la tâche (jamais en dur), la dernière suite finit par la RÈGLE (l'ancienne
  `ManipulationDiscovery` passe dans la carte et `onDone` fait `state.discover(); state.formalize()`). Données : `CHAINS` (tâche → ids) +
  `QUESTIONS` (id → constructeur) dans le fichier du labo ; textes dans `lesson.manipulation.json › <labo>.cp.*`. Chaque question : 2
  indices, une seule bonne option (`choice`) ou `expected` (`number`), `explain`. `canNext && !cp.blocking`. `onRetry` remet LA MÊME tâche.
  Un labo SANS tâches successives (une seule scène libre) : une suite unique quand l'objectif est atteint.
- **L2 — Réglage enseignant** : `const s = useLabCheckpointSettings('<type>')` ; `chain` seulement si `s.enabled` ; `headerAction={s.control}` sur le
  `ManipulationShell` — appeler le hook SANS monter `control` ne sert à rien (c'était le cas de dix labos du lot 1 : le script exige maintenant la colonne « switch »).
- **L3 — Étapes lisibles** : `<LabStepper count current done stepAttr="data-<préfixe>-step" />` remplace les pastilles du labo ; une étape
  est FAITE quand l'objectif est atteint ET ses questions répondues.
- **L4 — Fête** : `useStepCelebration()` ; `celebrate({ n, total })` une fois par étape (réarmée après « إعادة ») ; `{party.node}` dans le bloc `relative`.
- **L5 — « إعادة »** : repart de la tâche 1 (état initial, essais effacés, questions réarmées : `resetKey` incrémenté) — VÉRIFIÉ dans le navigateur.
- **L6 — Son** (`playSfx` uniquement) : un son pour le GESTE (`tooth` pour un pas, au plus un toutes les 35 ms ; `pitch` < 1 en arrière),
  `bell` pour une unité complète si le labo en a (un tour, une dizaine, un paquet…), `flag` quand l'objectif est atteint, `over` quand il est
  dépassé / refusé. Muet sans « الصوت ».
- **L7 — Plein écran** : la scène reste lisible et manipulable en plein écran (une capture).
- **L9 — Seulement les étapes** (propriétaire, 2026-10-28) : le labo montre SES étapes 1 2 3 (`LabStepper`) et rien d'autre pour se repérer —
  ni la progression « جرّب › اكتشف › صِغ القاعدة », ni le bouton « تلميح » (les questions guident déjà) : passer `guided` au shell dès que les
  questions sont actives (`<ManipulationShell … guided={!!chain || ruleByCheckpoint}>` dans `GearCrank.jsx`). Questions coupées (enseignant,
  ou monde sans suite) → `guided` faux : la progression et les indices reviennent. Les labos finis AVANT cette règle (début du lot 1)
  la reçoivent à la vérification : le script les remontre ⬜ tant que `guided` manque.
- **L8 — Tests** : le test de rendu du labo vérifie, pour chaque tâche de chaque niveau, que chaque question a un texte, 2 indices, une
  seule bonne réponse, ni clé brute ni `{{` (modèle : `gearCrank.render.test.jsx`, avant-dernier `describe`) ; et que le mode guidé ne
  rend ni `data-manipulation-progress` ni « إظهار التلميح » (modèle : le dernier `describe`).

## 2bis. Définition de « FAIT » — une LEÇON

- **C1** — tous ses labos sont FAITS (L1–L8).
- **C2** — chaque pied de module `<KnowledgeSnapshot moduleNumber={n} />` devient `<KnowledgeSnapshot moduleNumber={n} variant="memo" />`
  (le titre de la carte peut varier d'un module à l'autre ; c'est la carte du pied de module qui compte). `complete` (test final) ne change pas.
- **C3** — chaque connaissance de `knowledge.jsx` porte `memo: { rule, hook, example, trap, exam, chip, quiz }` (§5).
- **C4** — les étapes du module SOUS le labo ne reposent pas les questions désormais posées dans le labo : elles gardent la TRACE
  (`answered(id)` = événement `checkpoint-done`) puis les briques (modèle : `Module01Nashat.jsx`).
- **C5** — `scripts/lab-rollout-status.mjs --lesson <id>` affiche ✅ ; tous les tests de la leçon et de ses labos passent.
- **C6** — vérifiée dans le navigateur à 1366×768 (§6) : une tâche jusqu'à la carte, une mauvaise réponse (indice), la fête, « إعادة »,
  plein écran, son coupé, la carte de fin de module et le défi « اختبر ذاكرتك ».

---

## 3. La procédure, leçon par leçon (dans CET ordre, jusqu'à 100 %)

1. **Audit** (≤ 5 appels) : `node apps/web/scripts/lab-rollout-status.mjs --lesson <id>` ; puis, pour chaque labo ⬜ : `grep -n` dans son
   fichier (`tasks|PRESETS|discover|coachOf|resetCount|restart|data-.*-step|nextTask|canNext|hints=|guided`) et dans `logic/<labo>.js`
   (`export (function|const)`), `grep -n "KnowledgeSnapshot\|Manipulation" modules/*.jsx`, `grep -n "id: '" knowledge.jsx`.
2. **Détecter ce qui existe et MARCHE** : un marqueur ✓ du script ne suffit pas — ouvrir le labo dans le navigateur (§6) et cocher : tâches,
   « إعادة », plein écran, son, découverte. Ce qui marche n'est PAS réécrit. Ce qui marche « parfois » (ex. « إعادة » qui ne repart que la
   tâche courante) est corrigé selon L5.
3. **Mettre à jour** : le labo (L1–L6) si ⬜, puis la leçon (C2–C4). Une connaissance = un `memo` complet d'un coup.
4. **Tester** : `npx vitest run <dossier du labo> <dossier de la leçon> src/lessons/common/knowledge/memoContent.test.js src/lessons/common/i18nHookScope.test.js`.
5. **Vérifier dans le navigateur** (§6) et **corriger** ; recommencer 4–5 jusqu'à 100 %.
6. **Clore** : le script affiche ✅ ; cocher la leçon au §9 ; `git commit` par lot de ~5 leçons (message `feat(labs): rollout lot N — <ids>`).

**Fin de session** : `npx vitest run` complet, `node scripts/check-non-blocking.mjs`, `node scripts/audit-knowledge-dependencies.mjs --gate`,
`npm run check:entry-budget` (≤ 245 Ko), puis `git push origin dev`, puis mettre à jour le §9 (et le prompt de la session suivante).

---

## 4. Règles d'économie de jetons

- Partir du script d'état, jamais d'une exploration libre. Un sous-agent seulement pour un audit de plus de 3 labos à la fois.
- Éditer par scripts Python ciblés (`assert s.count(a) == 1` puis `replace`) pour les modifications répétitives (pieds de module :
  `sed -i -E 's#<KnowledgeSnapshot moduleNumber=\{([0-9]+)\} />#<KnowledgeSnapshot moduleNumber={\1} variant="memo" />#'`).
- Écrire les `memo` d'une leçon en UN appel (un script qui insère après chaque `summary:`/`title:` repéré), jamais item par item.
- Les sondes navigateur : un seul script de session dans le scratchpad, paramétré par l'URL (§6) ; ne lire QUE les captures utiles.
- JSON i18n : `json.load` / `json.dumps(…, ensure_ascii=False, indent=2) + '\n'` (le fichier fait l'aller-retour exact).
- Doubler les antislashs dans les chaînes JS (`'\\frac'`) ; dans un script Python, écrire ces chaînes en `r"""…"""`.
- Ne pas re-tester toute la suite après chaque leçon : le dossier touché (§3.4) suffit ; la suite complète en fin de session.

---

## 5. Qualité du contenu (non négociable)

**Questions du labo** : sur ce que l'élève VIENT de faire, avec SES nombres ; elles mènent pas à pas à l'idée puis à la règle ; jamais la
réponse au 1er essai (indice 1, indice 2, réponse au 3e) ; les mauvaises options portent un `why` qui cite SA tâche ; pas de question
dont la réponse est écrite à l'écran sans lecture (la lire au compteur est permis : c'est observer).

**Fiche `memo`** (par connaissance) :
- `rule` : la règle en SYMBOLES (lettres a, b, c, x…), `\dfrac`, la partie qui CHANGE en `\textcolor{#e11d48}{…}` (helper `R(x)` de la leçon) ;
- `hook` : 2 à 5 mots qu'on se répète ; `example` : une formule avec les nombres de la leçon ; `trap` : l'erreur réelle, nommée ;
  `exam` : ce qu'on écrit sur la copie ; `chip` : une mini-formule (`\tfrac`) ;
- pas de fraction dans une phrase (`hook`, `trap`, `exam` tiennent sur une ligne) ;
- `quiz` : 2 questions × 3 options ; chaque mauvaise option est une ERREUR RÉELLE de la règle (pas un nombre au hasard) ; la bonne
  réponse à n'importe quelle place (le mélange est équilibré à l'exécution) ; vérifier chaque calcul.

**Toujours** : indépendance du livre (rien recopié, aucun renvoi au manuel), respect de l'islam (aucun cochon, alcool, jeu de hasard,
intérêt…), terminologie « الكفاءة », chaînes arabes dans les JSON i18n (jamais en dur dans un labo), un composant qui appelle `t()`
déclare son `useTranslation` (test `i18nHookScope`), tablette et laptop seulement (768 px et plus).

---

## 6. Vérification dans le navigateur (Playwright, sans extension)

Session simulée (comme `apps/web/scripts/capture-methode.mjs`) : `localStorage.token = 'qa-fake-token'` et `fetch('/api/…')` intercepté
(`/auth/me` → l'élève, le reste → `{ success: true, data: [] }`), viewport 1366×768, `page.setDefaultTimeout(8000)`.
Import CommonJS depuis un script hors dépôt : `import pw from '<repo>/node_modules/playwright/index.js'; const { chromium } = pw;`.
Son : `addInitScript` qui met `smarter_effects_enabled = '1'` et enveloppe `AudioContext.createOscillator` pour COMPTER les notes.
Contrôles : tâche résolue (geste clavier sur `[role="slider"]` ou clics), `[data-lab-checkpoint]` (réponse fausse → `data-status="wrong"`),
`[data-lab-celebration]`, `[data-lab-stepper]`, « إعادة » (`getByRole('button', { name: 'إعادة' })` → tâche 1), `[data-manipulation-immersive-enter]`
/ `-exit`, `[data-manipulation-sound] button` (coupé → 0 note), la carte `[data-memo-card]` puis `[data-memo-quiz-open]`.
Pièges : une capture d'élément pendant un défilement peut sortir vide — capturer la page après `scrollIntoViewIfNeeded` + 800 ms ;
l'ordre bidi des nombres se MESURE (`Range.getBoundingClientRect`), il ne se lit pas sur une capture.
Tests PHP (si l'API change) : pas de SQLite local — base MySQL jetable `sa_labtest_tmp` (`DB_CONNECTION=mysql DB_DATABASE=…`), supprimée ensuite.

---

## 7. Les lots (20 leçons par session)

**Ordre (propriétaire, 2026-10-28) :** le **lot 1** est FIGÉ (commencé : 1AM, 2AM et le début de 3AM). Ensuite **4AM d'abord**, puis 3AM
(puis 2AM et 1AM, déjà tous dans le lot 1) : lots 2 à 5 = 4AM (le lot 5 finit par les premières leçons de 3AM), lot 6 = la fin de 3AM.
Dans chaque année, l'ordre est celui des dossiers (= des unités). Le script d'état calcule ces lots (`--batch N`).

Une leçon de synthèse (« وضعية إدماجية ») n'a pas de labo : seulement C2–C3. Le prototype (`maqlub-qismat-kasrayn`, lot 5) est fait, y compris le monde `reverse` et le niveau متقدم de `gear-crank` (lot 5).

### Lot 1 — 20 leçons · 117 connaissances · 81 cartes · 20 labos

| # | Leçon | Année | Labo(s) | Cartes | Connaissances | État |
|---|---|---|---|---|---|---|
| 1 | `kitabat-adad-tabii` | 1am | `rank-exchange` | 5 | 7 | ✅ |
| 2 | `kusur-ashriya-kitaba` | 1am | `decimal-comma` | 5 | 9 | ✅ |
| 3 | `muqaranat-adad-ashriya` | 1am | `ruler-compare` | 4 | 5 | ✅ |
| 4 | `qawaid-qabiliyat-qisma` | 1am | `digit-cards` | 5 | 5 | ✅ |
| 5 | `qisma-iqlidiya-baqi` | 1am | `division-jumps` | 4 | 4 | ✅ |
| 6 | `mana-jam-tarh` | 1am | `story-bars` | 4 | 4 | ✅ |
| 7 | `hasil-qisma-kasr` | 1am | `fair-share` | 4 | 4 | ✅ |
| 8 | `ikhtizal-kitaba-kasriya` | 1am | `fraction-knife` | 5 | 4 | ✅ |
| 9 | `masahat-muhit-sath` | 1am | `tile-yard` | 4 | 7 | ✅ |
| 10 | `muqarana-nisbiya` | 2am | `zero-probe` | 4 | 6 | ✅ |
| 11 | `qisma-iqlidiya-hasr` | 2am | `egg-trays` | 4 | 5 | ✅ |
| 12 | `rabi-mutanasib` | 2am | `fourth-gauges` | 4 | 6 | ✅ |
| 13 | `jidaa-adadayn-nisbiyayn` | 3am | `elevator-reel`, `sign-machine` | 4 | 6 | ✅ |
| 14 | `jidaa-ida-nisbiya` | 3am | `robot-track` | 4 | 6 | ✅ |
| 15 | `qismat-nisbiyayn` | 3am | `code-lockers` | 4 | 7 | ✅ |
| 16 | `wadiya-idmajiya-aadad-nisbiya` | 3am | — (synthèse) | 1 | 3 | ✅ |
| 17 | `muqaranat-natiqayn` | 3am | `difference-meter` | 4 | 6 | ✅ |
| 18 | `nashr-jabri-3am` | 3am | `area-split` | 4 | 8 | ✅ |
| 19 | `qimat-ibara-harfiya` | 3am | `marble-run` | 4 | 7 | ✅ |
| 20 | `tabsit-hadhf-aqwas` | 3am | `like-terms` | 4 | 8 | ✅ |

### Lot 2 — 20 leçons · 79 connaissances · 62 cartes · 15 labos

| # | Leçon | Année | Labo(s) | Cartes | Connaissances | État |
|---|---|---|---|---|---|---|
| 1 | `awwaliyan-fima-baynahuma` | 4am | `coprime-explorer` | 3 | 4 | ✅ |
| 2 | `bahth-pgcd` | 4am | `pgcd-differences`, `euclidean-algorithm` | 4 | 5 | ✅ |
| 3 | `ikhtizal-kasr` | 4am | `fraction-reduction` | 4 | 4 | ✅ |
| 4 | `khawass-qawasim` | 4am | `divisor-properties` | 4 | 5 | ✅ |
| 5 | `qasim-adad-tabii` | 4am | `team-builder`, `divisor-explorer-books` | 3 | 4 | ✅ |
| 6 | `qasim-mushtarak-akbar` | 4am | `common-divisors` | 3 | 4 | ✅ |
| 7 | `qawasim-adad-tabii` | 4am | `factor-pairs` | 3 | 4 | ✅ |
| 8 | `tayin-pgcd` | 4am | `common-divisors` | 3 | 3 | ✅ |
| 9 | `wadiya-idmajiya-aadad` | 4am | — (synthèse) | 1 | 2 | ✅ |
| 10 | `mutatabiqat-shahira` | 4am | `pitch-expansion` | 4 | 6 | ✅ |
| 11 | `nashr-tabsit` | 4am | `pitch-expansion` | 3 | 4 | ✅ |
| 12 | `tahlil-ibara` | 4am | `turf-factoring` | 4 | 5 | ✅ |
| 13 | `wadiya-idmajiya-harfi` | 4am | `pitch-expansion` | 1 | 4 | ✅ |
| 14 | `amaliyat-judhur` | 4am | `square-tiling` | 4 | 4 | ✅ |
| 15 | `jidhr-tarbii` | 4am | `square-root-side` | 3 | 4 | ✅ |
| 16 | `muadalat-x-murabba` | 4am | `square-fold` | 3 | 3 | ✅ |
| 17 | `natiqa-ghayr-natiqa` | 4am | `square-root-side` | 3 | 3 | ✅ |
| 18 | `tawzif-khawass-judhur` | 4am | `square-tiling` | 5 | 3 | ✅ |
| 19 | `wadiya-idmajiya-judhur` | 4am | — (synthèse) | 1 | 3 | ✅ |
| 20 | `hall-jabri` | 4am | `elimination-cards` | 3 | 5 | ✅ |

### Lot 3 — 20 leçons · 110 connaissances · 66 cartes · 18 labos

| # | Leçon | Année | Labo(s) | Cartes | Connaissances | État |
|---|---|---|---|---|---|---|
| 1 | `mafhum-jumla` | 4am | `pair-scoreboard` | 3 | 6 | ✅ |
| 2 | `mushkilat-jumla` | 4am | `story-modeller` | 3 | 3 | ✅ |
| 3 | `wadiya-idmajiya-jumal` | 4am | `story-modeller` | 1 | 5 | ✅ |
| 4 | `jidaa-maadum` | 4am | `vanishing-pitch` | 4 | 4 | ✅ |
| 5 | `muadala-ula` | 4am | `equation-balance` | 4 | 3 | ✅ |
| 6 | `mutarajiha-ula` | 4am | `solution-ray` | 5 | 7 | ✅ |
| 7 | `tarrid-mushkila` | 4am | `growth-race` | 3 | 4 | ✅ |
| 8 | `wadiya-idmajiya-muadalat` | 4am | `growth-race` | 1 | 5 | ✅ |
| 9 | `barahin-ashia` | 4am | `vector-chain` | 4 | 10 | ✅ |
| 10 | `insihab-shuaa` | 4am | `translation-glide` | 4 | 6 | ✅ |
| 11 | `majmu-shuaayn` | 4am | `vector-sum` | 4 | 6 | ✅ |
| 12 | `shuaayn-mutasawiyayn` | 4am | `parallelogram-pin` | 4 | 5 | ✅ |
| 13 | `wadiya-idmajiya-ashia` | 4am | `bridge-path` | 1 | 4 | ✅ |
| 14 | `hisab-murakkibatay` | 4am | `component-calc` | 4 | 5 | ✅ |
| 15 | `ithbat-khawas-maalam` | 4am | `shape-prover` | 4 | 10 | ✅ |
| 16 | `muntasaf-masafa` | 4am | `midpoint-distance` | 4 | 3 | ✅ |
| 17 | `murakkibata-shuaa` | 4am | `component-steps` | 4 | 5 | ✅ |
| 18 | `wadiya-idmajiya-maalam` | 4am | `route-compare` | 1 | 5 | ✅ |
| 19 | `khawas-dawaran` | 4am | `shape-turn` | 4 | 6 | ✅ |
| 20 | `mafhum-dawaran` | 4am | `rotation-dial` | 4 | 8 | ✅ |

### Lot 4 — 20 leçons · 129 connaissances · 64 cartes · 19 labos

| # | Leçon | Année | Labo(s) | Cartes | Connaissances | État |
|---|---|---|---|---|---|---|
| 1 | `mudalaat-muntazama` | 4am | `polygon-forge` | 4 | 9 | ✅ |
| 2 | `wadiya-idmajiya-dawaran` | 4am | `lamp-ring` | 1 | 4 | ✅ |
| 3 | `zawiya-muhitiya` | 4am | `inscribed-angle` | 4 | 7 | ✅ |
| 4 | `kura-julla` | 4am | `sphere-probe` | 4 | 9 | ✅ |
| 5 | `maqati-mustawiya` | 4am | `section-slicer` | 4 | 7 | ✅ |
| 6 | `misaha-hajm-kura` | 4am | `orange-peel` | 4 | 7 | ✅ |
| 7 | `takbir-tasghir` | 4am | `scale-blocks` | 4 | 7 | ✅ |
| 8 | `wadiya-idmajiya-fada` | 4am | `bucket-fill` | 1 | 3 | ✅ |
| 9 | `alaqat-muthallathiya` | 4am | `angle-compass` | 4 | 8 | ✅ |
| 10 | `hasiba-muthallathiya` | 4am | `trig-calculator` | 3 | 4 | ✅ |
| 11 | `nisab-muthallathiya` | 4am | `ramp-ratios` | 4 | 7 | ✅ |
| 12 | `tarrid-muthallathiya` | 4am | `clinometer` | 3 | 9 | ✅ |
| 13 | `wadiya-idmajiya-muthallathat` | 4am | `clinometer` | 1 | 5 | ✅ |
| 14 | `aksiya-talis` | 4am | `parallel-level` | 4 | 6 | ✅ |
| 15 | `inshaat-talis` | 4am | `segment-divider` | 3 | 7 | ✅ |
| 16 | `talis-hisab-atwal` | 4am | `shadow-world` | 4 | 5 | ✅ |
| 17 | `wadiya-idmajiya-talis` | 4am | `shadow-world`, `cone-cylinder` | 1 | 5 | ✅ |
| 18 | `mafhum-taalufiya` | 4am | `affine-meter` | 4 | 7 | ✅ |
| 19 | `tafsir-bayani-jumla` | 4am | `line-crossing` | 3 | 6 | ✅ |
| 20 | `tamthil-bayani-taalufi` | 4am | `affine-line` | 4 | 7 | ✅ |

### Lot 5 — 20 leçons · 118 connaissances · 63 cartes · 15 labos

| # | Leçon | Année | Labo(s) | Cartes | Connaissances | État |
|---|---|---|---|---|---|---|
| 1 | `tanasub-taghayyurat` | 4am | `slope-stairs` | 3 | 5 | ✅ |
| 2 | `tarrid-taalufi` | 4am | `plan-compare` | 4 | 5 | ✅ |
| 3 | `wadiya-idmajiya-taalufiya` | 4am | `plan-compare` | 1 | 7 | ✅ |
| 4 | `mada-wasit-mutawassit` | 4am | `stat-balance` | 4 | 8 | ✅ |
| 5 | `majdulat-ihsaiya` | 4am | `sheet-lab` | 4 | 9 | ✅ |
| 6 | `qiraat-wadiyat-ihsaiya` | 4am | `group-tanks` | 4 | 7 | ✅ |
| 7 | `takrar-mujamma` | 4am | `cumul-gate` | 4 | 6 | ✅ |
| 8 | `wadiya-idmajiya-ihsa` | 4am | `stat-balance` | 1 | 5 | ✅ |
| 9 | `dala-khattiya` | 4am | `linear-machine` | 3 | 5 | ✅ |
| 10 | `tamthil-bayani-khatti` | 4am | `origin-line` | 3 | 5 | ✅ |
| 11 | `tanasub-muamil` | 4am | `ratio-ride` | 3 | 6 | ✅ |
| 12 | `tarrid-khatti` | 4am | `origin-line` | 3 | 5 | ✅ |
| 13 | `tatbiqat-tanasub` | 4am | `percent-tag` | 4 | 9 | ✅ |
| 14 | `wadiya-idmajiya-khattiya` | 4am | `origin-line` | 1 | 5 | ✅ |
| 15 | `wadiya-idmajiya-ibarat-harfiya-3` | 3am | — (synthèse) | 1 | 3 | ✅ |
| 16 | `adad-natiq` | 3am | `number-line-pegs` | 4 | 5 | ✅ |
| 17 | `amaliyat-natiqa` | 3am | `merge-board` | 4 | 6 | ✅ |
| 18 | `jam-tarh-kasrayn` | 3am | `seed-rake` | 4 | 5 | ✅ |
| 19 | `maqlub-qismat-kasrayn` | 3am | `gear-crank` | 4 | 6 | ✅ prototype |
| 20 | `tasawi-muqaranat-kasrayn` | 3am | `shade-match` | 4 | 6 | ✅ |

### Lot 6 — 12 leçons · 85 connaissances · 45 cartes · 11 labos

| # | Leçon | Année | Labo(s) | Cartes | Connaissances | État |
|---|---|---|---|---|---|---|
| 1 | `wadiya-idmajiya-kusur-natiqa` | 3am | — (synthèse) | 1 | 3 | ✅ |
| 2 | `hasr-adad-ushri` | 3am | `scoop-scale` | 4 | 7 | ✅ |
| 3 | `muadalat-darajat-ula` | 3am | `term-ferry` | 4 | 7 | ✅ |
| 4 | `musawiyat-amaliyat` | 3am | `equality-lanes` | 4 | 6 | ✅ |
| 5 | `mutabayinat-amaliyat` | 3am | `loom-threads` | 4 | 8 | ✅ |
| 6 | `kitaba-ilmiya-rutba` | 3am | `size-ladder` | 4 | 7 | ✅ |
| 7 | `qawaid-quwa-ashara` | 3am | `unit-ladder` | 4 | 7 | ✅ |
| 8 | `quwa-adad-ashara` | 3am | `ten-zoom` | 4 | 8 | ✅ |
| 9 | `quwat-adad-nisbi` | 3am | `power-train` | 4 | 10 | ✅ |
| 10 | `khassiyat-fitaghuras` | 3am | `pythagoras-tanks` | 4 | 7 | ✅ |
| 11 | `nisba-miawiya-3am` | 3am | `hundred-grid` | 4 | 7 | ✅ |
| 12 | `tanasub-tamthil-bayani` | 3am | `pin-rails` | 4 | 8 | ✅ |

---

## 8. Les labos partagés (les faire à la PREMIÈRE leçon qui les utilise ; ensuite seulement vérifier)

- `common-divisors` (qasim-mushtarak-akbar, tayin-pgcd)
- `square-root-side` (jidhr-tarbii, natiqa-ghayr-natiqa)
- `square-tiling` (amaliyat-judhur, tawzif-khawass-judhur)
- `pitch-expansion` (mutatabiqat-shahira, nashr-tabsit, wadiya-idmajiya-harfi)
- `growth-race` (tarrid-mushkila, wadiya-idmajiya-muadalat)
- `story-modeller` (mushkilat-jumla, wadiya-idmajiya-jumal)
- `origin-line` (tamthil-bayani-khatti, tarrid-khatti, wadiya-idmajiya-khattiya)
- `plan-compare` (tarrid-taalufi, wadiya-idmajiya-taalufiya)
- `stat-balance` (mada-wasit-mutawassit, wadiya-idmajiya-ihsa)
- `shadow-world` (talis-hisab-atwal, wadiya-idmajiya-talis)
- `clinometer` (tarrid-muthallathiya, wadiya-idmajiya-muthallathat)

Labos enregistrés mais utilisés par aucune leçon : `divisor-explorer`, `thales-beam`, `shadow-stick` — hors périmètre.

---

## 9. Journal de progression (à tenir à jour à la fin de CHAQUE session)

| Session | Date | Lot | Leçons faites | Labos faits | Notes |
|---|---|---|---|---|---|
| 0 | 2026-10-28 | — | 1/112 (prototype) | 1/98 | plan, script d'état, test `memoContent` ; commit `b480b2b8` |
| 1 | 2026-10-28 | 1 | 21/112 (prototype + 20 du lot 1) | 21/98 (les 20 labos du lot 1) | lot 1 fait, 1 session : leçon 1 en direct, leçons 2–20 par 5 sous-agents en parallèle (A 2–5, B 6–9, C 10–12 + 16, D 13–15, E 17–20). L9 `guided` reçu en cours de route et appliqué aux 20. Commits `e9d6bca9` … `1fc0cbb6` + le correctif « switch ». Suite complète 697 fichiers / 13 523 tests ; `check-non-blocking`, audit des dépendances, `check:katex`, `check:entry-budget` 236,6 Ko : verts. Hors périmètre signalé : références au manuel dans les briefs de `ikhtizal-kitaba-kasriya` (Module00/02/03/04/05). |
| 2 | 2026-10-28 | 2 | 41/112 (prototype + lots 1 et 2) | 36/98 (+15 labos du lot 2) | lot 2 fait en 1 session par 4 sous-agents en parallèle (A : awwaliyan, bahth-pgcd, ikhtizal-kasr, khawass-qawasim ; B : qasim-adad-tabii, qasim-mushtarak-akbar, tayin-pgcd, qawasim-adad-tabii, wadiya-idmajiya-aadad ; C : hisab-harfi ×4 + hall-jabri ; D : hisab-judhur ×6), chacun sur un Vite privé (ports 5301–5304) et le JSON i18n fusionné sous `flock` (`merge_i18n.py` : aucun conflit). Suite complète 701 fichiers : 3 échecs de charge (timeouts registry / buildLessonMemo / resumePath, verts isolés) + 1 vrai (`lessonGraphs` qasim-adad-tabii : la citation « التعريف كله في الباقي » avait disparu du module, rétablie). `check-non-blocking`, audit des dépendances, `check:katex`, `check:entry-budget` 236,6 Ko : verts. Non vérifié au navigateur : l'interrupteur enseignant (cliqué nulle part), « أعِد التجربة » de pitch/turf/elimination, plein écran et son de turf-factoring / elimination-cards, variante symétrie de DivisorExplorerBooks, niveau débutant de tayin-pgcd, carte du module 3 de muadalat-x-murabba. |
| 3 | 2026-10-28 | 3 | 61/112 (prototype + lots 1–3) | 54/98 (+18 labos du lot 3 : pair-scoreboard, story-modeller, vanishing-pitch, equation-balance, solution-ray, growth-race, vector-chain, translation-glide, vector-sum, parallelogram-pin, bridge-path, component-calc, shape-prover, midpoint-distance, component-steps, route-compare, shape-turn, rotation-dial) | lot 3 fait en 1 session par 5 sous-agents (A jumal-muadalatayn ×3, B muadalat-mutarajihat ×5, C ashia-insihab ×5, D ashia-maalam ×5, E dawaran ×2), Vite privé 5311–5315, `merge_i18n.py` sous `flock`. Suite complète 701 fichiers / 13 853 tests verts ; `check-non-blocking`, audit des dépendances, `check:entry-budget` 236,6 Ko : verts. Non vérifié au navigateur : interrupteur enseignant « off » (D), cas `negative` de growth-race, niveau avancé de vector-chain, nage de vector-sum/swimmer, pleine largeur des cartes memo hors `maarif`, défi step 5 de pair-scoreboard. Étape C4 (étapes sous le labo réduites à la trace) partielle dans ashia-maalam. |
| 4 | 2026-10-28 | 4 | 81/112 (prototype + lots 1–4) | 73/98 (+19 labos du lot 4 : polygon-forge, lamp-ring, inscribed-angle, sphere-probe, section-slicer, orange-peel, scale-blocks, bucket-fill, angle-compass, trig-calculator, ramp-ratios, clinometer, parallel-level, segment-divider, shadow-world, cone-cylinder, affine-meter, line-crossing, affine-line) | lot 4 fait en 1 session par 5 sous-agents (A dawaran ×3, B handasa-fada ×5, C hisab-muthallathat ×5, D khassiyat-talis ×4, E dala-taalufiya ×3), Vite privé 5321–5325, `merge_i18n.py` sous `flock`. Suite complète 701 fichiers / 14 042 tests verts ; `check-non-blocking`, audit des dépendances, `check:entry-budget` 236,6 Ko : verts. Nouveaux assistants : `geometry/thalesCp.jsx`, `space/spaceCp.js` (`spread` : place la bonne option à une position stable car `LabCheckpoint` ne mélange pas). Nouvelles props de labo `checkpoints` / `onCheckpoint` (affine, rotation). Non vérifié au navigateur : défi « اختبر ذاكرتك » joué jusqu'au bout (tous groupes), « أعِد التجربة » cliqué dans la carte (A, C, B), interrupteur enseignant « off » sur cone-cylinder et sur 4 labos de B, mode segment-divider ratio / parallel-level crossing (logique seulement), affine-line read/identify, orange-peel et bucket-fill avancés, 768 px. Étape C4 partielle partout (étapes sous le labo pas toutes réduites à la trace). Défaut connu : si l'enseignant coupe les questions, les étapes de module devenues « trace seule » (tarrid-muthallathiya 1–3, wadiya-idmajiya-muthallathat 5–6) ne peuvent plus être validées. Défaut existant non corrigé : `AffineMeter`, x conservé entre les étapes image → antécédent. |
| 5 | 2026-10-28 | 5 | 101/112 (prototype + lots 1–5) | 87/98 (+14 labos du lot 5 : slope-stairs, plan-compare, stat-balance, sheet-lab, group-tanks, cumul-gate, linear-machine, origin-line, ratio-ride, percent-tag, number-line-pegs, merge-board, seed-rake, shade-match ; + `reverse` et niveau متقدم de gear-crank) | lot 5 fait en 1 session par 5 sous-agents (A dala-taalufiya ×3, B ihsa ×5, C dala-khattiya ×4, D tanasub-muamil + tatbiqat-tanasub + restes du prototype, E 3AM ×5), Vite privé 5331–5335, `merge_i18n.py` sous `flock`. Suite complète 701 fichiers / 14 193 tests verts ; `check-non-blocking`, audit des dépendances, `check:katex`, `check:entry-budget` 236,6 Ko : verts. Non vérifié au navigateur : interrupteur enseignant « off » (sauf A), son coupé (sauf A, C), défi « اختبر ذاكرتك » joué jusqu'au bout, « أعِد التجربة » dans la carte, 768 px (sauf sheet-lab), niveaux avancés de shade-match, mondes `writings`/`signs`/`fewest`/`equal` (E), mode 3 plans de plan-compare, wadiya-idmajiya-taalufiya débutant. Défauts connus : plein écran de slope-stairs plus haut que 768 px ; sheet-lab à 768 px : 3e option de la carte coupée ; étape C4 partielle (ihsa : étapes de module non réduites à la trace ; tarrid-taalufi M1 étapes 3–4) ; le stepper reste visible quand l'enseignant coupe les questions (slope-stairs) ; synthèse ihsa sans `LabStepper` ; `signs` de merge-board ne cite que le préréglage par défaut ; `at()`/`valueQ`/`spread` copiés localement dans plusieurs labos (à factoriser). `data-sb-stage-tab` supprimé (stat-balance utilise `LabStepper`). |
| 6 | 2026-10-28 | 6 | 112/112 (prototype + lots 1–6) | 98/98 (+11 labos du lot 6 : scoop-scale, term-ferry, equality-lanes, loom-threads, size-ladder, unit-ladder, ten-zoom, power-train, pythagoras-tanks, hundred-grid, pin-rails) | lot 6 fait par 3 sous-agents (A musawiyat-mutabayinat ×4 + synthèse kusur-natiqa, B quwa-nisbiya ×4, C fitaghuras + tanasubiya-sura ×2), Vite privé 5341–5343, interrompus une fois par la limite de session puis repris. Suite complète 701 fichiers / 14 314 tests verts (1 délai de 5 s sous charge sur `teacherContract`, vert isolé) ; `check-non-blocking`, audit des dépendances, `check:katex`, `check:entry-budget` 236,6 Ko : verts. Non vérifié au navigateur : interrupteur enseignant « off » ; son coupé = 0 note (A seulement a vu le son) ; 768 px ; niveaux avancés (scoop-scale, term-ferry, equality-lanes, loom-threads, hundred-grid) ; tâches 2+ de term-ferry/equality-lanes/loom-threads et de size-ladder/unit-ladder/ten-zoom/power-train ; mondes `prefixes` (ten-zoom) et `couple` (power-train) ; mode libre de pin-rails ; défi « اختبر ذاكرتك » joué jusqu'au bout ; rendu des étapes « trace » de module. Défauts connus : étape C4 partielle ; si l'enseignant coupe les questions, les étapes « trace seule » de fitaghuras/nisba-miawiya/tanasub-tamthil-bayani ne peuvent plus être validées (pas de repli) ; term-ferry avancé : la règle de la division tombe à la fin d'une tâche sans division ; loom-threads : `combKeeps`/`rule` supposent un essai avec peigne/clou négatif ; pythagoras-tanks : « أعِد التجربة » du surd remet la touche √ à zéro, `compare` peut être pré-complétée par les versements de `fill` ; ten-zoom `rank`/`zeros` : le distracteur « chiffres » reprend la formule de la découverte. Corrigé en passant : `Ltr` de hundred-grid (« 15,% »). |

### Prompt de la session suivante

Le déploiement des six lots est TERMINÉ (112/112 leçons, 98/98 labos). Reste une session de **vérification navigateur** de tout ce que
les journaux 1 à 6 listent « non vérifié » (interrupteur enseignant, son coupé, 768 px, niveaux avancés, étapes « trace » de module,
défi « اختبر ذاكرتك ») et la dette : factoriser `at()`/`spread`/`valueQ`/`Cq`, repli quand l'enseignant coupe les questions (étapes « trace seule »).

---

## 10. Pièges déjà rencontrés (ne pas les refaire)

- `restart()` appelait un setter supprimé → « إعادة » mort partout. Un labo qui ne réagit pas : console (`pageerror`) d'abord.
- `inset-inline-start` suit la direction de l'élément lui-même : pas de `dir="ltr"` sur un badge positionné en `start-*`.
- Les nombres dans une phrase arabe (« 2 / 5 », « 01 · 02 ») s'isolent (LRI…PDI ou `<bdi dir="ltr">`) — mesurer, pas regarder.
- Une formule dans `trap`/`exam`/`hook` grandit la ligne : la mettre dans `rule`/`example`.
- Les éléments de stockage passent par `utils/storage` (jamais `localStorage` direct).
- Le son est éteint par défaut (règle de la plateforme) ; les questions du labo sont OBLIGATOIRES pour tout élève (seul l'enseignant
  les coupe, pour son compte).
- La place de la bonne réponse du défi est équilibrée par `answerSlots` : ne pas réintroduire un mélange au hasard.
- `GateGuard` (crochet local) demande des « faits » avant la 1re écriture d'un fichier : les donner en une phrase et réessayer.
- **Parallèle (sous-agents)** : le serveur de dev partagé recharge la page à chaque écriture d'un autre agent (JSON i18n, fichiers) → sondes qui
  échouent au hasard (« navigated », « detached », notes négatives). Sonder sur un Vite PRIVÉ sans HMR ni watch (`server: { hmr: false, watch: null }`,
  autre port) ou sur `vite build` + `vite preview` (`NODE_OPTIONS=--max-old-space-size=8192`, ~2 min). Ne jamais déduire un bogue d'une seule sonde ratée.
- **`lesson.manipulation.json`** : une seule écriture à la fois, sous verrou (`flock`) — un script de fusion `<chemin pointé> <fragment.json>` ; jamais un `json.dump`
  global fait par deux agents. Idem pour tout fichier partagé.
- **Le script d'état ne remplace pas la vérification** : il ne voyait pas que dix labos appelaient `useLabCheckpointSettings` sans monter `control`
  (colonne « switch » ajoutée). Quand une exigence n'a pas de colonne, ajouter la colonne AVANT de déclarer ✅.
- **Un élève ne peut pas ouvrir un module verrouillé** (module 4…) en semant le `localStorage` : sonder ces modules en ENSEIGNANT (les questions y restent actives).
- **Deux niveaux montés** (`ManipulationWorkspace`) : la copie masquée est souvent la 1re du DOM → sélecteurs `:visible` et niveau actif.
- **`\\;` dans un script** : arrive en `\;` et s'affiche « ;; » ; utiliser `\\quad` ou `\\,`. Le script d'insertion des `memo` refuse tout antislash simple.
- **Largeur du `rule` d'une fiche** : ≈ 12–14 symboles, sans « … » ; la boîte rétrécit si l'`example` est long. Mesurer le débordement dans le navigateur
  (teacher view, `[data-memo-tile]`), ne pas l'estimer. Une identité longue peut passer sur 3 lignes (`aligned`).
- **Bidi dans `hook`/`trap`/`exam`** : `<`, `>`, « −5 », une lettre latine (« في b ») ou une équation s'y réordonnent → mots seulement ; formules dans `rule`/`example`.
- **`readNumber` refuse les réponses NÉGATIVES** (`labCheckpoint.js`) : toute réponse signée est une question `choice`. (Ouvrir les négatifs = modifier la primitive : décision à part.)
- **`retryTask`** doit effacer le drapeau « fait » de la tâche, sinon la carte se rouvre aussitôt après « أعِد التجربة » ; une tâche dont l'objectif est gardé dans un carnet
  (tile-yard) doit aussi retirer l'entrée gardée, sinon le refaire est refusé comme doublon.
- **« إعادة »** : plusieurs labos (digit-cards, division-jumps, area-split, marble-run, like-terms…) ignoraient `resetCount` dans la clé de scène → rien ne repartait.
- **Questions construites trop tôt** : un constructeur qui lit un résultat pas encore rempli fait planter le premier rendu → ne construire qu'une fois l'étape atteinte.
- **Tests de garde anti-règle** : certains labos interdisent des mots (« الكتاب », « معدوم »…) avant la règle ; les chaînes `cp.*` comptent, et « الكتابة » est attrapé par « الكتاب ».
- **Le sélecteur `data-done`** est aussi posé par `LabStepper` : un test qui compte `data-done` doit le tolérer.
- **Lot 2** : un lab SANS tâches successives (scène libre) prend 2 étapes `LabStepper` (essai puis contraste/règle) ou une chaîne unique à l'objectif atteint. Les labos acceptent maintenant `checkpoints` et un rappel de trace (`onCheckpoint(ev)` pour pitch/turf/elimination, `onTrial` ailleurs) : les événements `checkpoint-done` ne doivent pas polluer les listes d'essais que les leçons construisent.
- **Graphes de connaissances** : un nœud d'aide (`knowledgeGraph.js`) cite des phrases de la leçon (`lessonGraphs.test.js`, « grounds every aid »). Supprimer une question de module qui portait cette citation fait échouer le test : garder la phrase dans le texte de trace.
- **Suite complète sous charge** : `registry`, `buildLessonMemo`, `resumePath` expirent parfois (≈ 190 s de suite) — les relancer isolés avant de conclure.
- Le merge i18n n'ajoute que des clés : les clés orphelines (`euclid.cp.invariant.quotient`, `whyQuotient`) restent à purger.
- **Lot 3** : les événements `checkpoint-done` du labo (`ev.tk`) entrent dans les listes d'essais des modules et plantent `LabEvidence` (`undefined[0]`) → garde `!ev.tk` dans le rappel du module (fait pour hisab-murakkibatay, murakkibata-shuaa, ithbat-khawas-maalam, wadiya-idmajiya-maalam, Metro/TahaddiAnshita).
- **Lot 3** : un `$…$` interpolé ne doit pas être mis dans un gabarit qui l'entoure déjà de `$…$` (affiche des `$` bruts). Un Vite `watch:null` sert des modules périmés après édition : le relancer. Tuer un Vite par le PID de SON port, jamais par `ps | grep vite`. Le scratchpad est partagé : préfixer ses scripts (`gA_…`).
- **Lot 4** : les clés de `lesson.manipulation.json` sont de premier niveau (`angleCompass.cp`), pas sous `manipulation.` : fusionner avec `<labo>.cp`. `LabCheckpoint` ne mélange pas les options : varier la place de la bonne (`spread`). Les étapes de module « trace seule » doivent garder un repli quand l'enseignant coupe les questions. Prop `checkpoints={false}` + `onCheckpoint(ev)` sur les labos ; crochets DOM `data-am-step`, `data-lc-step`, `data-al-lab-step`. Le mock de l'interrupteur enseignant doit renvoyer `checkpointsOff` dans la réponse du PATCH `/teacher/labs/`.
- **Lot 5** : les labos à `stat-balance` n'ont plus d'onglets d'étape (`LabStepper`). Un `memo` de leçon de synthèse ne peut pas contenir de valeurs-solutions (`content.test.js`) : symboles seulement. Pas de « ، » dans un `$…$` (KaTeX, `memoContent`). Vite `watch:null` sert des modules périmés : le relancer entre éditions. Dette : factoriser `at()`/`spread`/`valueQ`/`Cq` en un seul assistant partagé.
- **Lot 6** : `\;` écrit dans un script arrive en `\;` simple antislash et casse le script d'insertion des `memo` → `\,` ou `\quad`. Deux niveaux montés : sélecteurs Playwright `>> visible=true`. Les ids de tâche se répètent d'un niveau à l'autre (power-train `b0…`) : la trace du module doit nommer le niveau (`doneCp('b1','beginner')`). Un `re.sub` sur un bloc déjà patché : ancrer avec `^` et `re.M`, sinon il déborde sur d'autres blocs.
