# Arabic & RTL Contract

> **Status (2026-11-22).** Imported unchanged from the Algerian platform. It describes the code AS IT IS until steps
> 1C–1E of `docs/FRANCE_REBUILD_PLAN.md` end (the interface is still Arabic and right to left); it is then deleted.
> The French rules are `FRENCH_LANGUAGE_CONTRACT.md`. `ALGERIA_PLATFORM_MASTER_SPEC.md`, cited below, was deleted on
> 2026-11-22 (`git show 049380e:docs/ALGERIA_PLATFORM_MASTER_SPEC.md`).

> **The student-facing product is Arabic. Everything a student can read is in
> Arabic, except legitimate mathematical notation and the brand name.**
> This document is authoritative on language, direction, typography and
> bidirectional rendering. Product scope and terminology policy live in
> `../ALGERIA_PLATFORM_MASTER_SPEC.md` §14–§16; this document is the
> mechanical contract a developer or agent must satisfy.

Everything below describes code that exists today.

---

## 1. The foundation — three fixed values

`apps/web/src/locale.js` is the single source of truth for locale and
direction. It is not a language switcher; this repository serves one product.

```js
export const LOCALE = 'ar-DZ';
export const DIRECTION = 'rtl';
export const IS_RTL = DIRECTION === 'rtl';
```

`apps/web/index.html` sets `<html lang="ar" dir="rtl">` — the whole document is
RTL, permanently. Anything needing the locale or direction **as data** imports
from `locale.js` rather than writing `'ar'` or `'rtl'` inline.

i18next is initialised in `apps/web/src/i18n/index.js` with a single locale
(`ar-DZ` as both `lng` and `fallbackLng`) and ten namespaces:

| Namespace | Covers |
|---|---|
| `common` | shared chrome: buttons, errors, loading and empty states |
| `nav` | navigation (all three spaces) |
| `auth` | authentication |
| `access` | activation codes and entitlement |
| `lesson` | the **lesson engine chrome** — module navigation, kit question labels, final test, diagnostic, Classroom Mode |
| `student` | the student space |
| `marketing` | visitor pages |
| `mathlab` | the مختبر الرياضيات instruments and their home |
| `teacher` | the teacher space — classes, members, plan |
| `admin` | the admin panel — navigation, page titles, table columns, states, status badges, dialogs |

**Eight namespaces ship with the app; `mathlab` is loaded on demand**
(2026-09-25). `i18n/index.js` registers an inline backend
(`onDemandBackend`, a dynamic `import()` of the JSON) with
`partialBundledLanguages: true`. The first `useTranslation('mathlab')`
suspends until the catalogue arrives — the surrounding `<Suspense>` shows its
fallback, then full Arabic text, never a raw key. Rules: an on-demand
namespace is read only by components that render under a `<Suspense>`
boundary of their own feature, never by a shared component; a string a
lesson page needs lives in `lesson` (e.g. `mathLabEntry.*`). `admin` stays
eager because its UI primitives are shared with the teacher space and
« قسمي ». See [`BUNDLE_BOUNDARIES.md`](./BUNDLE_BOUNDARIES.md) rule 5.

**Every role's space is Arabic, the admin panel included.** There is no
"internal tool gets to stay French" exemption: an administrator is a user of
this product, reading the same language on the same design system. See §9 of
`ADMIN_PANEL_ARCHITECTURE.md` for how the panel satisfies this.

**The `lesson` namespace is chrome, never content.** A lesson's own
pedagogical text is written in Arabic directly in its files
(`lesson.config.js`, `content/textbook.js`, `knowledge.jsx`, its modules),
because the curriculum is authored, not translated.

---

## 2. What must be Arabic

Every student-facing sentence and pedagogical word: titles, descriptions,
briefs, step titles and subtitles, questions, options, **distractors**,
explanations, hints, every feedback string (success, error, retry, empty,
completion), manipulation labels and legends, knowledge-map entries, badges,
and every `aria-label`, `title` and `placeholder` — a screen reader reads
those aloud to the same student.

"Most of the lesson is Arabic" is a failure, not a partial success.

### What must NOT be translated

- **Mathematical notation**: `PGCD`, `PPCM`, variables (`a`, `b`, `x`),
  operators, `√`, equations, numerals, standard abbreviations. The textbook
  itself writes `PGCD` in Latin; so do we.
  Prefer the Arabic wording *with* the notation —
  `القاسم المشترك الأكبر (PGCD)` — and never invent an awkward translation of
  an established symbol. `احسب PGCD(84;36)` is correct.
- **Technical identifiers** never rendered to a student: ids
  (`id: 'qasim-adad-tabii'`), component/function/file names, routes, registry
  keys, CSS classes, database fields.
- **The brand name**: `Smarter Academy` stays Latin, even mid-sentence in
  Arabic copy (`i18n/locales/ar/common.json` → `appName`).
- **Developer-facing strings** never shown to a student (dev warnings, thrown
  `Error` messages), and **code comments**, which this repository writes in
  French and English by convention.

### No French or English defaults

A default prop, fallback string or module-level constant that yields French is
a defect **even when every current caller overrides it** — the next lesson that
forgets the prop ships French silently. Defaults are Arabic or absent.

**Never call `t()` at module scope.** i18next may not be initialised when a
module-level constant is evaluated. Constants hold translation *keys*;
components resolve them at render.

### The API speaks codes, the client speaks Arabic

Laravel responses are **not** a localization surface: its validation messages
are English and its controller strings French, and that layer also serves
machine-to-machine callers. A server `message` is therefore never rendered to a
user — **in any space, the admin panel included**, since the panel became
Arabic (§1). Services resolve Arabic text from the catalogue through
`apps/web/src/services/apiMessage.js`; what crosses the boundary is a
`reason`/`code` or an HTTP status, never a sentence.

**Enum-ish server values follow the same rule, through a catalogue sub-map.**
A module `stage`, an analytics metric key or a status code is a *code*: it is
translated by a nested map plus a small resolver that falls back to the raw key
when the server serves a value the catalogue does not know.

```jsx
// admin.json: { "modules": { "stage": { "discovery": "الاستكشاف", … } } }
const stageLabel = (key) => {
  const label = t(`modules.stage.${key}`);
  return label === `modules.stage.${key}` ? key : label;   // unknown → raw code
};
```

Never keep a per-page label object: two screens rendering the same enum drift
apart the moment one of them is edited. `StatusBadge` applies this rule for
statuses, `admin.modules.stage.*` for pipeline stages and
`admin.analytics.metric.*` for metrics.

Example (2026-09-24): a locked practice level's `reason` was the French
sentence «Termine un exercice du niveau 1 pour ouvrir celui-ci», shown under
every locked level. It is now the code `previous_level_incomplete`
(`LevelPolicy::REASON_PREVIOUS_LEVEL`), and `LevelSelector` writes
`student.practice.levelLockedAfter` with the previous level.

### Data the user reads is Arabic too

Not only the interface: anything **stored** that a student or a teacher will
read is written in Arabic. A plan's `name` and `description` (`plans`) are
rendered as they are in « عرضي » and on the student's plan list, so they are
Arabic in the seeder, in the deployment SQL and in the database — including
archived plans, which stay visible in the admin history. The `slug` stays a
latin identifier (`teacher-seats`), because it is vocabulary for the code,
never text for a reader. Locked by `PlanSeederLanguageTest`. The same rule
covers any future seeded label a learner sees.

Admin-only free-text data (activity-log reasons, batch labels, activation
notes typed by an administrator) is exempt from the seeded-label rule: no
student or teacher ever reads it. The admin panel's own UI is **not** exempt —
it is Arabic (the `admin` i18n namespace, enforced by a contract test; see
« Every role's space is Arabic » above).

### Product facts, not just language

Copy inherited from the French product must not be translated as-is when it is
factually wrong here. The DZ product has no Stripe, no euro pricing and **no
online payment of any kind**: access comes from cash-purchased activation
codes and from plans an administrator activates by hand
(`TEACHER_CLASSROOM_ARCHITECTURE.md` §5). A subscription (الاشتراك) exists as
a fact on the account, but nobody pays for it on the platform, so no copy may
say « ادفع الآن », show a card form or describe a checkout; prices in دج are
information, never a call to pay. The product follows the Algerian
curriculum, not the French `6e…Terminale` ladder. Translating such copy
literally produces fluent Arabic that lies.

---

### Mastery and completion never share words (2026-09-24)

The four Learning Point states have ONE label set, `student:mastery.*`
(`unassessed` لم تُقيَّم بعد · `gap` يحتاج إلى تدعيم · `reinforce` قيد التحسّن ·
`mastered` متحكَّم فيها), read through `MASTERY_STATES` /
`masteryLabels.js`; the former duplicates `progression.chips.*` and
`unit.mastery.*` are gone and a test forbids their return. The teacher space
uses `teacher:students.masteryStatus.*` through `MasteryPill`. Reasons and
freshness have their own keys (`mastery.reason.*`, `mastery.freshness.*`).

The practice player's Learning Point module (2026-09-24) follows the same
split: its star path is the Mastery V2 state with the `mastery.*` label; its
counters say «تمارين أنهيتها» / «أسئلة أجبت عنها» and nothing else.

**Completion never says إتقان or متحكَّم**: a finished path is « أنهيت مسار
الدرس ✓ », the final test's per-skill block is « نتيجة هذا التحدي حسب المهارة »
with neutral ✓ / ~ / ✗ glyphs, and the lesson's final module is titled
« إختبار أولي ». The only mastery words on screen describe a Learning Point
state that came from `student_learning_point_progress`. (Lesson authors'
`completion.masterTitle` strings are content and are not governed here;
`question.difficulty.maitrise` is a difficulty label.) **When it shows:**
since 2026-09-29 `completion.masterTitle` (« أتقنت … ») and the 🏆 appear
**only after a perfect attempt** — every answer right *and* every declared
badge earned (`perfectAttempt` / `masterBadge` in
`apps/web/src/lessons/common/kit/BossFinal.jsx`); any other finished attempt
shows `completion.title` with 🎓.

## 3. Typography — Cairo, global, non-negotiable

Cairo is the platform's single, global, permanent Arabic font. The source of
truth is `apps/web/tailwind.config.js` (`fontFamily`) and
`apps/web/src/index.css`.

**The mechanism:** none of the Latin identity fonts (Inter, Space Grotesk,
JetBrains Mono) contain Arabic glyphs, so Cairo sits *directly behind* each of
them in every stack. The browser then resolves Arabic runs to Cairo per glyph
while Latin runs, digits and code keep the identity font.

```js
'sans':  ['Inter', 'Cairo', 'Tajawal', 'sans-serif', …],
'space': ['"Space Grotesk"', 'Cairo', 'Tajawal', 'sans-serif'],
'mono':  ['JetBrains Mono', 'Cairo', 'Tajawal', 'monospace'],
```

`sans` is redefined **on purpose**: Tailwind's default stack
(`ui-sans-serif`, `system-ui`…) *does* carry Arabic glyphs, so a `font-sans`
element would silently render Arabic in a system font instead of Cairo. `mono`
carries Cairo for the same reason — labels, badges and buttons are styled
`font-mono` all over the platform.

Rules:

- **Never put a system font before Cairo** (`system-ui`, `ui-sans-serif`,
  `Segoe UI`, `Arial`, `Tahoma`…). They have Arabic glyphs and would take over.
- **Never import another Arabic font** at lesson or component level (Tajawal,
  Noto Sans Arabic, Amiri, IBM Plex Arabic…). Tajawal exists *only* as the
  global second fallback covering the moment before the Google Fonts sheet
  loads; it is not a choice a lesson makes.
- **Never define a lesson-specific Arabic font class or inline
  `font-family`.** Rely on inheritance — a lesson gets Cairo automatically.
- **Mathematical rendering keeps its own typography.** KaTeX and MathLive set
  their own fonts on their own elements (`.katex`, `<math-field>`); never force
  Cairo, or anything else, onto them.
- **Code keeps its monospace typography.** Digits and code stay JetBrains Mono
  regardless of the surrounding Arabic.

A lesson generator's job is content and structure, not typography.

### Text scale

`tailwind.config.js` redefines the `fontSize` scale: the body sizes are +25%
(`sm` is 17px, `base` is 20px), damping to neutral from `5xl` upward, with
line-heights raised to match. Roughly 8 300 `text-sm`/`text-xs` call sites
carry the interface, so the scale — not per-page retouching — is what makes
Arabic readable. A `fontSize={13}` inside an `<svg>` is in **viewBox units**,
not CSS pixels: this scale does not reach it, and it must not be "corrected"
by hand.

### No letter-spacing, monospace or uppercase on Arabic (2026-10-07)

The Latin « eyebrow » label — `font-mono-jetbrains … tracking-widest
uppercase` — breaks Arabic: `letter-spacing` pulls the joined letters of a
word apart, so « التعليم المتوسط » reads as scattered glyphs. An Arabic label
uses `font-arabic` with weight and colour for emphasis, never `tracking-*`.
Found on `/espace/bienvenue` (ChooseGrade.jsx), which also wrapped each grade
name over three lines in a 4-column grid: a choice whose label is a full
phrase gets a full-width row with `whitespace-nowrap`, checked at 360 px.

---

## 4. Direction — RTL layout, LTR mathematics

The page is RTL. Mathematics is not.

### Math isolation is automatic through `MathText`

`lessons/common/components/MathText.jsx` is the single chokepoint: it splits a
string on `$…$` and `$$…$$` and wraps every expression in a `dir="ltr"`
container carrying `.sa-math-inline` (a `<span>`) or `.sa-math-block` (a
`<div>` — `BlockMath` renders a div, invalid inside a span). 360+ call sites
inherit the behaviour without individual changes.

The CSS that makes it correct (`index.css`):

```css
.sa-math-inline, .sa-math-block {
  direction: ltr;
  unicode-bidi: isolate;
}
```

`direction: ltr` fixes the expression's own layout; `unicode-bidi: isolate`
keeps it out of the surrounding Arabic bidi run. Both are required — one
without the other still renders wrongly in a mixed sentence.

**A Latin word glued to a formula joins its island (2026-09-29).** The
textbook writes `PGCD$(a ; b)$`, `PGCD $(a ; b)$` and chains like
`PGCD$(a ; b) = $ PGCD$(b ; a - b)$`. With one island per `$…$`, the RTL
paragraph ordered the Latin word and each island right to left: the student
read « (b ; a−b)PGCD(a ; b) = PGCD » (16 strings in five lessons, in modules,
knowledge bodies and the map). `mathSegments` (exported by `MathText.jsx`,
tested in `MathText.test.js`) now builds ONE island from a formula, the Latin
word glued before it (at most one space), and the following formulas while
only spaces or such a word separate them. Arabic text or punctuation between
two formulas (« $a$ و $b$ », « $a$ ، $b$ ») still separates two islands —
nothing changes for them.

### What the STUDENT types: `isolateMath` (2026-10-06)

A calculation typed inside an Arabic sentence (« القسمة: 268 = 54 × 4 + 52 ») is
displayed reversed by bidi; no CSS (`unicode-bidi: plaintext` included) fixes it
mid-sentence — checked in Chromium. Every free-text math input goes through
`lessons/common/components/MathTextArea.jsx`, which wraps each calculation in
LRI…PDI as the student types, cursor preserved (`isolateMath.js`). Never use a raw
`<textarea>` for mathematics.

### Equations inside an i18n string (2026-10-07)

Marketing copy has no `MathText` (no `$…$` rendering): an equation inside an
Arabic sentence of a locale file (« تظهر المساواة 16 = 3 × 5 + 1 ») is wrapped
in LRI…PDI (U+2066 … U+2069) in the JSON itself — first case:
`marketing.json › method.steps.observe/discover.story`. Verify with a range
measurement in the browser (the first number must sit to the LEFT of the last),
not by eye on a screenshot.

### Numeric pairs need the same isolation

In an RTL page, `{score} / {max}` renders reversed: `10/11` reads as
"11 / 10". **Every score, counter and ratio (`N / M`) needs a `dir="ltr"`
wrapper**, exactly as `MathText` does for expressions. This is the single most
common bidi defect in this codebase's history.

A Latin display name ending in a period inside Arabic text (« Amine K. »,
the daily challenge's Top 3) renders as « .Amine K » unless it is isolated:
wrap user-provided names in `<bdi>`.

The same applies to any numeric block inside a manipulation: tiles, bars,
equations, divisions and algorithm chains all declare `dir="ltr"`.

### A unit after a math island, Arabic text inside an SVG (unit 7, 2026-10-02)

- **`$…$ DA` reverses.** An amount whose unit follows the island (« $50 \times 5 + 300 = 550$ DA ») renders
  « DA 550 = … » in RTL: the island and the Latin unit form two runs. Put the unit INSIDE the island —
  `$50 \times 5 + 300 = 550\,\mathrm{DA}$` — and the same for degrees (`$10\,^{\circ}\mathrm{C}$`, « 10°C » reverses).
  A plain « 300 DA » outside any island is isolated by `MathText` / `bidi` and stays correct. Bank generators apply the
  same rule.
- **Arabic text in an inline SVG inherits the page's RTL**: `text-anchor="start"` is then the RIGHT edge, and axis titles
  are clipped at the figure's edge. Write Arabic SVG text with an explicit `direction="rtl"` and choose the anchors for it
  (the x-axis title anchored `start` at the axis end, the y-axis title anchored `end` next to the axis) —
  `dala-taalufiya/wadiya-idmajiya-taalufiya/components/TripFigures.jsx`.
- **Never glue two amounts with « + » in an Arabic sentence** (owner fix, 2026-10-02): « الأجرة 35000DA + 185DA لكل ساعة إضافية »
  is ONE left-to-right run (« + » is neutral between two numbers), so in RTL it flips as a block and « 35000 » lands next
  to « لكل ساعة إضافية » — the opposite meaning. Separate the amounts with Arabic words, as the textbook does:
  « أجرة قاعدية 35000DA يضاف إليها 185DA لكل ساعة إضافية » (« … و 200DA للمقابلة » is safe too), or write the whole
  expression as a math island (`$35000 + 185x$`).
- **A coordinate pair is an island** (`$(0 ; 1)$`): the unit-7 textbook itself printed act-3's « (0 ; 1) » as « (1 ; 0) »,
  a bidi reversal corrected in the lesson.


### Word fractions and calculator keys (unit 10, 2026-10-04)

- **Arabic never goes inside KaTeX.** The textbook defines « جيب زاوية حادة = طول الضلع المقابل / طول الوتر » as a fraction of WORDS;
  `\dfrac{\text{طول …}}{…}` would put Arabic in an LTR KaTeX island (unshaped, unchecked by `check-katex`). Use the shared
  `lessons/common/components/WordFraction.jsx` (`<WordFraction lhs="$\cos\widehat{B}$" num="طول الضلع المجاور" den="طول الوتر" />`):
  two lines of DOM Arabic and a bar, inline, read « … على … » by a screen reader. The extraction marks such fractions `wordFraction: { num, den }`.
- **Angles and functions are islands**: `$\widehat{B}$`, `$25^{\circ}$`, `$\cos\widehat{C}$`, `$\sin^{-1}$` — never a bare « cos » in an Arabic sentence.
- **Calculator keys are LTR code** (ON, 2nd, sin⁻¹, DEG, « ON 2,5 ÷ sin 25 ») like spreadsheet formulas below: `<code dir="ltr">` / `<bdi>`
  in JSX, LRI … PDI inside strings; the key SEQUENCE reads left to right, as the textbook says (« من اليسار إلى اليمين »).

### Vectors, components and letter pairs (units 11–12, 2026-10-04)

- A vector is an island: `$\overrightarrow{AB}$`, `$\vec{u}$`, the zero vector `$\overrightarrow{0}$`, components
  `$\vec{u}\begin{pmatrix} 3 \\ -2 \end{pmatrix}$`; a point with coordinates `$A(-3\,;\,2{,}5)$` — the unit-12 textbook itself printed
  « (2,5 ; -3-) », the RTL reversal of A(−3 ; 2,5).
- **« • » bullets between Latin letter pairs reorder them** (unit 11 act-1: « A إلى G • C إلى A » came out scrambled): separate pairs with
  Arabic words (« ثم بالذي يحوّل ») or write each pair as an island (`$(A\,;\,A')$`).
- **Two islands joined by « = » in an Arabic sentence reverse** (« {{am}} = {{mb}} » printed MB = AM): write the whole equality as ONE island.
- In a drawn figure the vector's name carries a small SVG arrow (GeoFigure `vectors[].label`), never a Unicode combining arrow (u⃗).

### Geometry names: the prime and « // » (unit 9, 2026-10-02)

The prime ′ (U+2032) is a NEUTRAL bidi character: in plain Arabic text « نقطتين B′ من (d) » rendered « 'B », « (B′C′) » came out
reversed, and the textbook's « (MN)//(BC) » at the end of a sentence rendered « (BC)//(MN) ». `utils/bidi.js › isolateMathRuns`
now isolates a Latin letter followed by a prime and the `)//(` pair (asserted in `bidi.test.js`). Rules: a ratio or an equality of
lengths is a `$…$` island (`$\dfrac{AB'}{AB}$`); a point name inside an Arabic sentence may stay plain text (now isolated); a lab
label that is a point name is `<bdi dir="ltr">B′</bdi>`; inside an SVG figure (`GeoFigure`, the labs) point names and lengths carry
`direction: ltr`.

### Spreadsheet formulas are LTR code, never KaTeX (unit 8, 2026-10-02)

A spreadsheet formula (`=MAX(A1:G1)-MIN(A1:G1)`, `A1:G1`, `Histogramme({7,8,9,10},{6,1,4})`, `=ALEA()`) is **Latin LTR code**: never
KaTeX, never bare in an Arabic sentence. In JSX it is rendered in `<code dir="ltr">` (`ihsa/majdulat-ihsaiya/components/Figures.jsx ›
Dustur`, the cells and bar of `sheet-lab`); inside a STRING that goes through `MathText` (statements, options, corrections, bank JSON,
i18n) it is wrapped in the invisible isolates LRI … PDI (U+2066 / U+2069 — `xl()` in that lesson's `content/textbook.js`). A lone
symbol quoted between guillemets is isolated too (`« ⁦=⁩ »`): without it « = » and « : » printed reversed around the quotes. The
sheet itself is laid out LTR (column A on the left, as in the textbook's screenshot); Arabic labels inside its cells keep `dir="rtl"`.
A grid shown in a practice statement or a مسألة is a `table` with `sheet: true` (`ProblemTable`, 2026-10-08): LTR frame, head
`['', 'A', 'B', …]`, first column = row numbers, Arabic cell text isolated with `dir="auto"`; the exercise validator refuses a
grid-shaped table without `sheet` (it would put column A on the right).
In a narrow RTL verdict prefer `\tfrac` to a long inline product: a line break at 320 px displayed « 144 = 360 » for `… × 360 = 144`.
A frequency table inside a final-test prompt is a KaTeX array (`texTable`), never a `<table>` inside the prompt's `<p>`.

### Plain-text equations are isolated too (2026-09-24)

Content written as plain text — exercise titles («معارف — 120 = 6 × 20»,
«28/42») and 212 of the 1 731 practice strings (hints, feedback, choices:
«15 = 3 × 5», «407 − 253 = 154») — rendered **reversed** in RTL
(«20 × 6 = 120»). `apps/web/src/utils/bidi.js` `isolateMathRuns(text)` wraps
every «number operator number …» run in the invisible isolates LRI … PDI
(U+2066 / U+2069): no markup, so it works in DOM text, in the notebook HTML and
in any string. `:`, `—` and `،` are sentence separators and never join two
numbers. **A number followed by a Latin unit or literal factor** («سعة الدنّ
الأول 24 L», «7,5 cm²», «240x») is isolated too (2026-09-24): otherwise the
digits (after Arabic) and the letter form two bidi runs and the sentence reads
«L 24». A letter followed by a number is an operator, not a unit («2 x 3»). Applied in `features/practice/RichText.jsx` (every practice text
outside `$…$`), the practice header title (`PracticeSession.jsx`) and the
notebook title (`noteContent.js`). Any new surface that prints content text
**without** RichText/MathText must pass it through `isolateMathRuns`.

**Algebraic runs, and every lesson surface (2026-09-30).** «√a» in an Arabic
sentence rendered «a√»: the radical is a NEUTRAL character, so between the
Arabic before it and the Latin letter after it, it takes the sentence's RTL
direction and lands to the right of «a» (same for «−√a», «(√a)² = a», «−9»).
`isolateMathRuns` now has a second pass that isolates any run of Latin
mathematical characters (short letters, digits, √, ², ³, parentheses,
operators incl. ≈ and ≠) containing a radical, a power, an operator between
two terms, or a leading minus; a Latin word of four letters or more (PGCD,
GeoGebra) is never taken for a formula. Two helpers wrap it for React:
`isolateOutsideMath(text)` never touches a `$…$` island, and `bidi(value)`
isolates a string and leaves a React node alone. They are applied, once, at
the choke points: `MathText`'s plain segments; the knowledge provider (item
`title`/`summary`, graph node `title`/`subtitle`); `ChoiceGrid` string
options; `StepCard` / `MissionBrief` titles; `ModuleLayout` (module title,
subtitle, breadcrumb, step list); `LessonIndex` (title, description, skills,
module titles and descriptions, learning points, prerequisites, resources);
and the catalogue surfaces (`LessonCard`, `LessonRow` — whose duration « 45 min » is an LTR island, else RTL prints « min 45 » —, `UnitPage`, the home (`CompassHomeSections`), the
progression tree, practice hub/summary, the teacher's lesson memo, learning
points and overview tabs). Lesson data stays clean: no invisible character is
ever written into a lesson or the catalogue.

### Content text outside a module is TYPESET, not only isolated (2026-10-02)

The catalogue's points to learn, descriptions, prerequisites, unit objectives, the unit تحدّ, module titles /
blurbs, step titles, knowledge summaries and lab names are written like lesson content (« معرفة الترميز
$x \longmapsto ax + b$ »). `bidi()` alone isolates them but leaves the island raw: the owner saw the dollars and
the backslashes on the lesson index, the unit page and the catalogue (122 raw formulas across 262 pages, all seven
units). Every such DISPLAY now goes through **`MathLabel`** (`lessons/common/components/MathLabel.jsx`): without a
`$…$` island it renders exactly `bidi(text)`; with one, `MathText` (KaTeX, LTR island) — KaTeX is lazy-loaded only
when a string carries a formula, the fallback meanwhile being `mathToPlain`. Where only a STRING fits (`<option>`,
`title` / `aria-label`, a template literal), use **`mathToPlain(text)`** (`utils/mathPlain.js`, dependency-free):
each island becomes isolated Unicode (« x ⟼ ax + b », « (f(x₁) − f(x₂))/(x₁ − x₂) »). The kit does the same for a
STRING prompt, batch-row label or option (`TapQuestion`, `BatchChoiceQuestion`, `ChoiceGrid`).
Applied in: `LessonIndex`, `ModuleLayout`, `LessonUI`, `KnowledgeBrick`, `KnowledgeSnapshot`, `KnowledgeMap`,
`LinearKnowledgeView`, `UnitPage`, `UnitGroup`, `LessonCard`, `LessonRow`, the home's `CompassHomeSections`, the progression tree, practice
hub / summary, the teacher's memo, lessons, learning-points and overview tabs. **Never print a content string with
`{bidi(x)}` in JSX** — write `<MathLabel>{x}</MathLabel>`. Guard: `apps/web/e2e/lesson-kit/math-raw-scan.mjs`
(every visible text node outside `.katex`, every page of every 4AM lesson: 0 `$…$`, 0 `\command`, 0 `.katex-error`).

### The student's own answer is isolated, not typeset (2026-09-24)

When the practice player shows back what the student typed (question history,
«السؤال السابق», «سياق السؤال»), it renders it in `<bdi dir="ltr">` in the mono
face — never through KaTeX (free input is not LaTeX) and never «corrected».
A chosen QCM option is shown by its content through `RichText`.

### No Latin letters in front of choices (2026-09-24)

A Latin option letter (`A`, `B`…) in front of an Arabic choice whose text
starts with a digit is glued to it by the bidi algorithm: `A` + `6 مضاعف
للعدد 120` rendered as «A6 مضاعف…», and students misread the options. The
practice choices (`features/practice/inputs/ChoiceInput.jsx`) therefore show
**only the choice's content**; `choice.id` stays the internal answer id
(evidence, registry, the admin « interpreted as » field). Locked by
`ChoiceInput.test.jsx`. If a label is ever needed beside Arabic text, it must
be its own flex item with `dir="ltr"` — never an inline span before the text.

### Interval brackets « [ » « ] » are mirrored by bidi (2026-10-01)

The textbook draws inequality solutions with brackets whose ORIENTATION carries the mathematics (turned toward
the red part ⇔ the bound is a solution). A bare `[` or `]` in Arabic text is a mirrored character: the bidi
algorithm draws it the wrong way round — exactly the distinction the lesson teaches. Write a bracket inside a
math island (`$[$`, `$]-5 ; +\infty[$`) or isolate it (`\u2066]\u2069`, as `SolutionRay` does for its glyph), and
draw number lines in SVG (`mutarajiha-ula/components/RayFigure.jsx`, the synthesis' `NumberLine`), never as text.

### A ثنائية (x ; y) reads left to right — and so do grouped thousands (2026-10-01)

A pair is ordered: (2 ; 0) ≠ (0 ; 2). Every pair is a math island (`$(13 ; 19)$`, `pairLatex`) or a `dir="ltr"`
element; a pair INPUT is a `dir="ltr"` row « ( x ; y ) » (`PointInput`, `PairQuestion`) — under a bare RTL flex row
the parentheses and the two fields are mirrored. A system is written `$\begin{cases} … \\ … \end{cases}$`.
**Grouped digits** « 30 300 DA » inside Arabic plain text are split by bidi into « 300 DA 30 »: write the number
ungrouped (« 30300 DA », as the textbook's own table does) or inside a math island; `utils/bidi.js` does not
yet group-protect thousands (open item).

### Directional icons

An icon whose **meaning is a reading direction** — forward, back, the panel on
the start edge — must come from
`apps/web/src/components/common/DirectionalIcons.jsx`, which resolves the
mirror once against `IS_RTL`:

```jsx
import { ArrowForward, ChevronBack } from '…/components/common/DirectionalIcons';
```

Exports: `ArrowForward`/`ArrowBack`, `ChevronForward`/`ChevronBack`,
`ChevronsForward`/`ChevronsBack` (jump, not step), `PanelStartOpen`/
`PanelStartClose`. Call sites express **intent**, never a physical side.

**Icons with a fixed meaning must not go through it**: an Enter key `⏎`, a
play button, a mathematical arrow on an axis. They never mirror.

### Arrow *glyphs* inside Arabic prose

A literal `→` typed into a string is not an icon and does not go through
`DirectionalIcons` — but it still points the wrong way. When an arrow means
"…becomes…" or "…then…" inside an Arabic sentence, it must follow the reading
direction and be written `←`:

```jsx
// The override REPLACES the plan value: the arrow introduces the result,
// so in RTL prose it points leftward, the direction the eye travels.
<b>{label}</b> ← {value}
```

The same applies to a precedence chain written as prose
(`الافتراضي ← الاشتراك ← الاستثناءات`). A `→` inside Arabic text points back at
the term it just left, which reads as the opposite claim.

**Mathematical arrows are exempt** — an implication `⇒`, a function arrow
`f : A → B` or a limit is notation, lives inside `MathText`'s LTR isolation,
and never mirrors.

While in Arabic prose, prefer the Arabic comma `،` to `,` as a list separator.
A list of numbers written « 1 ، 2 ، 3 » puts a NO-BREAK space before each comma (`'\u00a0، '`): a list that
wraps then breaks only after a comma and never starts a line with « ، » (2026-11-19; the rule and where it is applied:
`GAME_WORLD.md` « A list never starts a line with its comma »).

### Charts read left to right

Recharts draws its axes in the **document** direction, so an RTL chart body
puts the earliest date on the right and the curve reads backwards. Wrap the
chart body — and only the body — in `dir="ltr"`:

```jsx
<h3>{t('analytics.seriesRegistrations')}</h3>   {/* Arabic, RTL */}
<div dir="ltr">                                 {/* the plot only */}
  <ResponsiveContainer>…</ResponsiveContainer>
</div>
```

The title, tooltip contents, series names and legend stay Arabic; only the
plotting surface is isolated. This is the charting counterpart of the
`.sa-math-inline` rule: a quantitative axis is notation, not prose.

Number formatting inside a chart (and anywhere else) uses `ar-DZ`, never
`fr-FR`.

### RTL and font selection are separate concerns

Solving one does not solve the other. Verify both independently, then together.

---

### The Knowledge Map (2026-09-29)

Deleted on 2026-11-22 with the old knowledge map (`git show 049380e:docs/architecture/ARABIC_RTL_CONTRACT.md`).

## 5. Arabic plurals

Arabic needs all six forms: `_zero`, `_one`, `_two`, `_few`, `_many`,
`_other`. The count belongs **inside** the key — never concatenate a number
with a translated noun.

i18next picks the category from `Intl.PluralRules('ar-DZ')`. No helper decides
it, and no ported French agreement helper (`agree('passé', n, feminine)`,
`countNoun`) may come back: French declines in two forms, Arabic in six, and a
string built by concatenation is wrong for at least one of them.

### The sentence around the noun agrees too

Pluralising only the noun produces «‌درس واحد انتقلت‌» — a singular noun under a
plural verb. Whatever agrees with the counted noun — the **verb**, the
**adjective**, the **pronoun suffix** — is part of the same sentence and
therefore part of the same six-form key:

```json
"successStatus_one":  "{{counted}} انتقل إلى «{{status}}».",
"successStatus_two":  "{{counted}} انتقلا إلى «{{status}}».",
"successStatus_few":  "{{counted}} انتقلت إلى «{{status}}».",
"successStatus_many": "{{counted}} انتقلت إلى «{{status}}».",
```

So a sentence that embeds a counted noun takes **both** `count` and `counted`:
`t('bulk.successStatus', { count: n, counted, status })`.

### The dual has two cases

«‌درسان‌» is nominative and «‌درسين‌» is oblique. `أرشفة درسان` is wrong —
after a verbal noun the dual must be `أرشفة درسين`. One `{{counted}}` slot
cannot be right in both positions, so a counted noun reused as subject **and**
as object needs two families of keys. The admin panel's pattern, which new
surfaces reuse rather than re-invent:

| Key family | Case | Reads |
|---|---|---|
| `bulk.noun.<type>` | subject | «‌درسان محدَّدان‌» |
| `bulk.nounOf.<type>` | object / oblique | «‌أرشفة درسين‌» |

Only `_two` differs between the two families; the other five categories are
identical. That single difference is what justifies the second family.

The noun's **key** comes from the content type, never from the call site —
`CONTENT_NOUNS` (`apps/web/src/components/admin/contentNouns.js`) maps
`lesson` / `module` / `exercise` to a key and carries nothing else. Copying a
noun string into a page is how a fourth page reintroduces a wrong form.

Reference implementation: `admin.bulk` in
`apps/web/src/i18n/locales/ar/admin.json`, consumed by `BulkActionBar.jsx` and
`bulkContentActions.jsx`. Tested in `apps/web/src/hooks/bulkSelection.test.js`.

### Counting nouns in manipulations (2026-09-30)

A manipulation interpolates numbers the student produces (15 players, 16 shelves, 4 books),
so every counted noun in its strings is a six-form key, with the same two families:

| Family | Case | Example key |
|---|---|---|
| `manipulation.teamBuilder.players` | subject | «‌في كل فريق لاعبان‌» |
| `manipulation.teamBuilder.playersIn` / `teamsIn` | object / oblique | «‌وزّع 15 لاعبًا على فريقَين‌» |
| `manipulation.bookshelf.books` / `shelves` | subject | «‌ينقصه 22 كتابًا‌», «‌رفوف ممتلئة: 16‌» |
| `manipulation.bookshelf.shelvesIn` | object | «‌لترى 28 رفًّا‌» |

The component builds the counted phrase (`t('…players', { count })`) and passes it as a
named slot (`{{players}}`) into the sentence. When a sentence would need several agreeing
counts, **rephrase** it as «‌الوصف: العدد‌» or with bare numbers («‌لو كان عدد اللاعبين 18 أو
15…‌») rather than inventing agreement. `team-builder`, `divisor-explorer-books`, `factor-pairs`, `divisor-properties` («‌لوحتان‌»),
`common-divisors` and `coprime-explorer` (label style «‌في كل باقة — زهرة حمراء: 5‌»),
`fraction-reduction` («‌خطوتان‌») and `euclidean-algorithm` (label style) follow this since
2026-09-30.

**An equation inside an Arabic sentence is a `<bdi dir="ltr">`.** Built from numbers in the
component (`eq(\`${a} = ${n} × ${q}\`)` in `DivisorProperties.jsx`), never interpolated into an
Arabic string with `dir="auto"`: «‌18 = 3 × 6‌» otherwise rendered as «‌6 × 3 = 18‌», and «‌7² ≤ 60‌»
as the false «‌7² ≥ 60‌» (forensic audit, defect m). `manipulations.mjs` measures it: in every
visible `bdi[dir="ltr"]` the first character lies to the left of the last.

### Translating outside a component

`bulkContentActions.jsx` is a factory called from `useMemo`, not a component,
so it has no `useTranslation`. It imports the i18next instance and translates
against it (`i18n.t(key, { ns: 'admin' })`), which keeps the exported factory
signature unchanged for its callers. This is the exception, not the pattern:
inside a component, always use the hook.

---

## 6. Terminology

The Arabic terminology of the official Algerian programme **is** the
interface's terminology. It is never re-translated from French. The register
lived in `ALGERIA_4AM_CURRICULUM.md` §6 (deleted 2026-11-22; `git show 049380e:docs/ALGERIA_4AM_CURRICULUM.md`).

The engine's own vocabulary, settled by the owner:

| Arabic | Means | Never means |
|---|---|---|
| **الوحدة** | a textbook **unit** — a group of lessons | a module |
| **المحور** | a **module** inside a lesson | a unit |
| **الدرس** | a lesson | — |
| **الميدان** | a curriculum domain (chapter) | — |
| **الكفاءة / الكفاءات** | a learning point / learning points (renamed 2026-10-05) | never « نقطة التعلّم / نقاط التعلّم » — retired from the UI |

**Learning points are « كفاءات » in every visible string** (owner decision,
2026-10-05). « نقطة التعلّم / نقاط التعلّم / نقطة تعلّم » must not appear in
the UI, nor the short « هذه النقطة / النقاط » used for a learning point: write
« الكفاءة », « الكفاءات », « كفاءة », « هذه الكفاءة ». A prerequisite learning
point is « كفاءة قبلية ». The noun is feminine, so ordinals stay feminine
(« الكفاءات الثلاث / الأربع / الخمس »). Only the wording changed: code
identifiers (`learningPoint`, `learning_points`, `LearningPointsTab`), i18n
keys, API fields, DB columns and codes (`…_P1`) keep their names. « نقطة » for
a geometric point or for daily-challenge **score** points is unaffected.

The teacher and commercial register, settled by the owner (2026-09-22):

| Arabic | Means | Never means |
|---|---|---|
| **الأستاذ** | a teacher account | an admin |
| **القسم / الأقسام** (« قسمي », « أقسامي ») | a teacher's class — a roster of students | the presentation mode; never الصف, never الفصل |
| **وضع القسم** | Classroom Mode, the projector shell | a class roster |
| **رمز الانضمام** | the join code of a class | an activation code |
| **رابط الانضمام** | the join link of a class (`/rejoindre/classe/…`), the recommended way in; the URL is Latin data, shown `dir="ltr"` in its own read-only field | an activation code; never « دعوة » (the e-mail invitation was removed on 2026-10-01) |
| **العرض / العروض** (« عرضي ») | a plan (offer) | a Classroom Mode « عرض » (presentation) |
| **الاشتراك** | a subscription running on an account | the account status |
| **رمز التفعيل** | an activation code (paid access) | a join code |
| **دج** | the dinar, informational price | an amount to pay online |

Changing any of these silently is forbidden: four navigation surfaces, the
Classroom Mode toolbar, the teacher space and the student's « قسمي » page
render them.

When official terminology is uncertain, mark it
`[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]` rather than inventing one.

---

## 7. Where untranslated text actually hides

A lesson can be flawless in its own files and still show French to a student,
because the chrome comes from shared components.

- **Scan every module, not the first screen** — and every interactive state:
  initial, selected, correct, incorrect, each hint level, validation, error,
  completion, reset, and both navigation directions. Text that appears only
  after an interaction is the most common miss.
- **Follow imports to the real rendered surface**: module → manipulation →
  shared kit → feedback → button. A lesson's own 18 files can pull in 70+.
- **Fix shared chrome at the shared level, through i18n** — never by
  hardcoding Arabic into a component other lessons render. Add the key to
  `i18n/locales/ar/` and call `t()`. Check that the key **resolves**: a missing
  key renders the raw key or a stale default.
- **Finish in the browser.** Some strings appear only dynamically.

Always run a second full scan after generating or editing a lesson, searching
independently for French and English prose, mixed-language sentences,
untranslated buttons/feedback/hints, and accidental developer or placeholder
text. Classify each hit: notation and identifiers stay, prose gets translated.

---

## 8. Checklist

```
[ ] Every student-visible string is Arabic (including aria-label, title, placeholder)
[ ] No French/English default prop or fallback string
[ ] No t() at module scope
[ ] No server `message` rendered to a student
[ ] PGCD and other notation left in Latin, with Arabic wording alongside
[ ] "Smarter Academy" left in Latin
[ ] No lesson-level font import or font-family override
[ ] No system font before Cairo in any stack
[ ] Every expression goes through MathText (or declares dir="ltr" itself)
[ ] Every N / M pair, counter and score is wrapped dir="ltr"
[ ] Every numeric block in a manipulation declares dir="ltr"
[ ] Plain-text content with an equation goes through RichText or isolateMathRuns
[ ] No Latin option letters before Arabic choices; any label beside Arabic text is its own dir="ltr" flex item
[ ] Directional icons come from DirectionalIcons; fixed-meaning icons do not
[ ] Arabic plurals declare all six forms, count inside the key
[ ] The verb/adjective around a counted noun is pluralised too (count AND counted passed)
[ ] A counted noun used as both subject and object has nominative and oblique dual keys
[ ] No French agreement helper (agree / countNoun) survives anywhere
[ ] Terminology matches the register (الوحدة ≠ المحور)
[ ] Verified in the browser at 320 px with no horizontal scroll
```

---

## 9. Related

- `ALGERIA_PLATFORM_MASTER_SPEC.md` §14–§16, `LESSON_DESIGN_PLAYBOOK.md` §13bis/§13ter, `MANIPULATION_CONTRACT.md` §8 —
  deleted on 2026-11-22 (`git show 049380e:docs/<path>`).
- [`CLASSROOM_MODE.md`](./CLASSROOM_MODE.md) §9 — RTL in presentation.

## A counter « x / y » never breaks (owner, 2026-11-09)

A browser breaks a line at a SPACE: « 6 / 10 » written with ordinary spaces showed « 6 / » on one line and « 10 » on the next. Around the « / » of
any counter (score, question number, progress, seats, pages), the spaces are NON-BREAKING (` `): in JSX `{a}{' / '}{b}`, in a
template string `${a} / ${b}`, in a translation `{{a}} / {{b}}`. Enforced over the WHOLE `apps/web/src` by
`lessons/common/unbreakableCounters.test.js` (a template that is not a displayed counter — a CSS ratio, a developer message, a formula, an
ARIA label — is listed there by name). `6/10` without spaces does not break and needs nothing.
