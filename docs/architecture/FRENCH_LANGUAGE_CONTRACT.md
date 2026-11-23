# French language contract

**Status: written 2026-11-22 before the translation (plan `docs/FRANCE_REBUILD_PLAN.md` §4quater), applied the same
day: the web interface IS French and left to right; `apps/web/src/test/noArabic.test.js` refuses any Arabic character
in the web, with one exemption — the books store (off) and its five admin labels `nav.books*`. The Arabic contract that
came before it is deleted. Lines marked ❓ are the main session's choice and wait for the owner.**

This product has ONE language and ONE direction: French (`fr-FR`), left to right. There is no language switch and no
second locale. The strings live in `apps/web/src/i18n/locales/fr/`, one JSON per namespace (the namespace names —
`idara`, `madar`, … — are code identifiers and kept their names).

## 1. This is not a translation of the Arabic

The Algerian interface was written for Algerian students, in the words of the Algerian programme. The French one is
written for French students, **in the words of the French official texts** (`docs/curriculum/officiel/`). So:

- a string is REWRITTEN from what it must do on its screen, with the Arabic as the description of that job — never
  rendered word for word;
- a mathematical term is the one of the French programme (« diviseur », « fraction irréductible », « racine carrée »,
  « antécédent »), never a calque;
- a context that is Algerian (a price in dinars, a wilaya, a date box, the BEM) is replaced by its French counterpart
  or removed — it is never translated.

## 2. Who is spoken to

| Reader | Register | Example |
|---|---|---|
| The student (11–15) | « tu », short sentences, the imperative, no exclamation marks in a row, never childish, never sarcastic | « Reprends ta leçon. » « Ta règle tient pour 12, pas pour 15 : regarde. » |
| The teacher, the parent, the school, the admin | « vous », plain and precise, no marketing | « Vos classes » « Votre élève a terminé 3 leçons cette semaine. » |
| The visitor (public pages) | « vous » for the parent's pages, « tu » where the page speaks to the student — one voice per page | |

- No « écriture inclusive » with the point médian; prefer a neutral wording (« les élèves », « ton professeur »).
- A verdict on an answer is never « Faux ». The world shows what happens; the sentence says what was observed
  (the rule of the engine: `GAME_WORLD.md`).
- No emoji carries a meaning a word should carry.

## 3. The vocabulary of the engine

One word per thing; changing one silently is forbidden — the menus, the teacher's pages, the reports and the lessons
all render them. Code identifiers, i18n keys, API fields and database columns keep their English names.

| In the code | Arabic was | French | Never |
|---|---|---|---|
| grade | السنة | **niveau** (« niveau 3e », « ton niveau ») | « classe » for a grade |
| a teacher's class | القسم | **classe** (« ma classe », « mes classes ») | « groupe », « niveau » |
| chapter / domain | الميدان | **thème** (the 2020 programme's word; the 2026 programme says « domaine » — one word in the interface: thème) | « chapitre » |
| unit | الوحدة | **chapitre** ❓ (what a student and a teacher call a group of lessons on one notion) | « séquence », « unité », « thème » |
| lesson | الدرس | **leçon** | « cours » (a « cours » is the whole year's teaching) |
| module (a stage inside a lesson) | المحور | **étape** | « module », « chapitre » |
| learning point | الكفاءة | **savoir-faire** ❓ (invariable: « des savoir-faire ») — the attendus de fin d'année are written as « ce que sait faire l'élève » | « compétence » (the official texts keep that word for the six « compétences travaillées » : chercher, modéliser, représenter, raisonner, calculer, communiquer), « point d'apprentissage », « objectif » |
| prerequisite learning point | كفاءة قبلية | **prérequis** | |
| mastery | الإتقان | **maîtrise** (« savoir-faire maîtrisé ») | |
| teacher | الأستاذ | **professeur** (« ton professeur ») | « enseignant » in the student's space, « prof » |
| class join code / link | رمز / رابط الانضمام | **code de la classe** / **lien de la classe** | « code d'activation » |
| classroom mode, class session | وضع القسم، حصّة القسم | **mode classe**, **séance en classe** | |
| the lesson on the board, the memo | الدرس على السبّورة، المذكّرة | **la leçon au tableau**, **la fiche du professeur** | |
| plan / subscription / activation code | العرض، الاشتراك، رمز التفعيل | **formule** / **abonnement** / **code d'activation** | « offre », « plan » |
| parent, parent link | الوليّ، رابط الوليّ | **parent**, **lien parent** | « tuteur » alone |
| school, school space | المؤسسة، فضاء الإدارة | **établissement**, **espace établissement** | « école » (a collège is not an « école ») |
| exam of the last year | BEM | **brevet** (« le brevet », « DNB » only in a source line) | |
| mock exam sitting | الامتحان الأبيض | **brevet blanc** | |
| exam sheet | ورقة الامتحان | **sujet** (the paper), **copie** (what the student hands in) | |
| a difficulty step of the practice space, the exam ladder, a game | المستوى | **palier** (« Palier 1 · Je reprends les bases ») — the five step names stay: « Je reprends les bases », « J’applique », « Je m’exerce », « J’approfondis », « Défi » | « niveau » (a « niveau » is a grade) |
| the four mastery states (`gap`, `reinforce`, `mastered`, `unassessed`) | — | **En difficulté**, **À consolider**, **Maîtrisé**, **Non évalué** — the same four words wherever a student, a teacher, a school or a parent reads them | « lacune », « À retravailler », « En progrès », « Pas encore évalué » |

The student's doors: **Aujourd'hui · Mes leçons · Je m'entraîne · Moi**. The teacher's: **Aujourd'hui · Mes classes ·
Mes outils · Mon compte**.

The spaces and tools:

| In the code | Arabic was | French |
|---|---|---|
| notebook | كرّاسي | **Mon cahier** |
| progression | التقدّم | **Ma progression** |
| year compass | بوصلتي | **Ma boussole** |
| daily challenge | التحدّي اليومي | **Défi du jour** |
| games space (madar) | فضاء الألعاب | **Espace jeux** |
| thinking lab | مختبر التفكير | **Le labo des énigmes** ❓ |
| math lab (`/espace/atelier`) | المختبر | **L'atelier** |
| lesson lab | مختبري | **Mon labo** |
| launch kit | عُدّة الانطلاق | **L'échauffement** ❓ (the warm-up before a lesson: the tools the lesson needs) |
| knowledge page / card / map | بطاقة / خريطة المعارف | **fiche de connaissances**, **carte des connaissances** |
| exam coach | مدرّب الامتحان | **le coach du brevet** |

The game world (step 1C fixes these with the worlds' own sentences):

| In the code | Arabic was | French |
|---|---|---|
| key | مفتاح | **clé** |
| forge (the student writes his rule) | — | **la forge** — « Forge ta règle » |
| inquiry | استكشف | **Explore** |
| trainer | تدرّب | **Entraîne-toi** |
| the robot | زيرو | **Zéro** |
| world `divisor-isles` | أرخبيل القواسم | **L'archipel des diviseurs** |
| world `mission-isle` | جزيرة المهمّات | **L'île des missions** |
| world `root-courts` | قصر الساحات | **Le palais des dalles** (NOT « le palais des cours » — « cours » reads as lessons): its rooms are « salles », its measuring rod the « toise » |
| synthesis lesson | أدمج تعلّماتي | **Vers le brevet** |

Games glossary: **an in-game level is a « palier »** (« Palier 12 », « Carte des paliers ») — the same word as a step of
the practice space.

## 4. Typography

French typography is part of correctness — a teacher sees its absence at once.

- Quotation marks « … » with a no-break space inside (U+00A0). English quotes only inside code.
- A narrow no-break space (U+202F) before `;` `!` `?`, a no-break space (U+00A0) before `:`. In JSON they are written
  as the characters themselves, never as HTML entities.
- The typographic apostrophe « ’ » in every visible string (« l’élève », « aujourd’hui »).
- Capitals carry their accents (« À », « É », « Étape »). A title takes ONE capital, on its first word.
- Ordinals: « 1er », « 1re », « 2e », « 3e » — never « 3ème ». Grades: « 6e », « 5e », « 4e », « 3e ».
- No sentence in capitals; no letter-spacing tricks; no double punctuation.
- A count and its noun never split across two lines: no-break space between them (« 3 leçons »). The rule
  « counters use the no-break space » of the engine stays.

## 5. Numbers, money, dates

- Decimal comma; thousands separated by a narrow no-break space; Western digits: `packages/core/numberFormat.js`
  already does it (it was written for France). In LaTeX the comma is `{,}`.
- Money: « 35 € », the sign AFTER the number with a no-break space; « 9,90 € »; never « EUR », never « €35 ».
- A percentage: « 20 % » with a no-break space.
- Dates: « 22 novembre 2026 », « lundi 28 juin 2027 »; the month in lower case. Times: « 14 h 30 ».
- `Intl` calls take `LOCALE` (`fr-FR`) from `apps/web/src/locale.js`, never a literal. Time zone `Europe/Paris`.
- The school week is Monday to Friday; Wednesday afternoon, Saturday and Sunday carry no class.

## 6. Plural forms

i18next reads French as `_one` (0 and 1: « 0 leçon », « 1 leçon ») and `_other` (« 2 leçons »). The six Arabic forms
(`_zero`, `_one`, `_two`, `_few`, `_many`, `_other`) and the dual key families collapse to these two. A sentence whose
zero case reads badly (« 0 notification ») gets its own key for the empty state (« Aucune notification ») — it is a
different sentence, not a plural form.

Agreement inside a sentence built from parts (the forge's tiles, a counted noun): the helper of the engine becomes
French (`counted(n, ['dalle', 'dalles'])`), and a tile is worded so that it needs no agreement with another tile
(« est un nombre pair », not « pair / paire »).

## 7. Mathematical writing

The notation of the French school, as the official texts and the brevet's papers write it:

- `×` for a product, never `·` or `*`; a division as a fraction bar or `÷`.
- Coordinates and pairs with a semicolon: « (2 ; −3) », « PGCD(12 ; 18) ».
- « ⩽ » and « ⩾ » (the slanted forms: `\leqslant`, `\geqslant`).
- A function: « f : x ↦ 2x + 3 », « l'image de 4 par f », « un antécédent de 7 ».
- An angle: `\widehat{ABC}`; a length « AB = 5 cm » (no-break space before the unit); a segment `[AB]`, a line `(AB)`.
- Units in upright type after a no-break space; « cm² », « m³ », « km/h ».
- Variables are Latin letters in italics; a result is announced in a sentence (« Donc x = 4. »).
- A formula is never broken across two lines, and a typed answer is entered in its own shape (the engine's rules).

## 8. Direction

Left to right everywhere: `index.html` (`lang="fr"`, no `dir`), the web manifest; `locale.js` exports no direction (there
is only one, the document's default). Icons whose meaning is a reading direction go through
`components/common/DirectionalIcons.jsx` (forward points right).
What the Arabic product needed and this one does not: `dir="rtl"` on any element, `direction: rtl` in CSS, a mirrored
icon, a layout placed « from the right », the Arabic font stacks (Cairo, Tajawal, Amiri). The `dir="ltr"` islands
around a formula are harmless and may leave with the file they are in. The invisible isolates (U+2066–U+2069) the Arabic product put
around an equality in plain text (`utils/bidi.js`) are GONE (2026-11-23): a sentence is written as it reads. Logical CSS properties (`margin-inline-start`,
Tailwind `ms-` / `me-` / `start-` / `end-`) stay: they are correct in both directions.

## 9. Content rules for France ❓ (plan §7, decision 7 — the owner confirms)

- Everyday French contexts that exclude nobody: school, sport, music, cooking, transport, nature, building, a local
  shop. No brand, no religion, no politics, no national symbol used as decoration.
- First names of the France of today, mixed, boys and girls in equal number and in equal roles.
- Never alcohol, tobacco, betting or a casino, even as a context. A probability experiment (a die, a coin, an urn, a
  spinner) is the brevet's own material and is used as an EXPERIMENT, never as a game for money.
- No reference to a textbook, a publisher or a page: the platform is independent from every book.
- Money in euros, distances in kilometres, real orders of magnitude (a price, a speed, a population are plausible).

## 10. How it is checked

- `apps/web/src/test/noArabic.test.js` — no Arabic character in any text file of `apps/web/src`, `public`, `e2e`,
  `scripts` and `index.html`, comments and tests included. ONE exemption, listed in the test with its reason: the
  books store (`features/books/**`, `pages/admin/books/**` and the five `admin.json` keys `nav.books*`) — off until the
  French books exist.
- `apps/web/src/i18n/plurals.test.js` — the i18next language is `fr` (0 and 1 read the singular) and no Arabic plural
  form (`_zero`, `_two`, `_few`, `_many`) is left in the bundled namespaces.
- The engine's `typographyErrors` (`lessons/common/gameworld/kit/authoring/test/suites.js`) — a lesson's sentences: the
  straight apostrophe, the missing no-break space before `:` `;` `!` `?`, « 3ème », English quotes; since 2026-11-23 also
  a number of four digits or more not grouped (« 1400 », or « 1 400 » with a plain space: kind `milliers`,
  `thousandsErrors` — a year after its word and a machine's text in `\texttt{…}` excepted) and a variable written two
  ways in one sentence (« si d divise $N$ »: kind `variable`, `variableErrors`). The suites' `said` reads both on every
  sentence of a forge, a trainer, a story.
- The walks (`apps/web/e2e/lib/walk.mjs › shot`, every screenshot of every lesson): no visible number of four digits
  or more without its thousands grouped (`code`, `pre`, `\texttt`, `[data-machine-text]` excepted), no bidi control.
- `apps/web/src/test/narrowSpace.test.js` — the narrow no-break space is SEEN: Inter and Space Grotesk draw U+202F
  0.14 em (« 1 400 » read « 1400 » after a « 1 »); `scripts/brand/build-narrow-space.py` writes into `index.html` one
  @font-face per family and weight that draws it 0.22 em.
- `lessons/common/unbreakableCounters.test.js` — a « n / m » counter never breaks (no-break spaces around the slash).
- The contract tests of the admin and teacher pages (`pages/adminContract.test.js`, `pages/teacherContract.test.js`)
  assert French and refuse Arabic.
- Not checked automatically: the count-and-noun no-break space everywhere (« 3 leçons »; the catalogue's
  `{{count}} <noun>` strings were fixed on 2026-11-22), the register, the vocabulary table above.
