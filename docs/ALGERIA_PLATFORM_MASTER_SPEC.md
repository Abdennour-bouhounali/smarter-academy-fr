# ALGERIA PLATFORM MASTER SPEC

## 1. Product Strategy

Build a completely independent Algerian mathematics education platform based on the French platform as the initial technical starting point.

The Algerian product must NOT share runtime code, deployment, database, storage, configuration, authentication, payment credentials, analytics, or production infrastructure with the French product.

The French repository is only the source technology to copy from. After copying, the Algerian project becomes an independent product that can evolve freely.

---

## 2. Repository Independence

### Required

- Copy the complete French repository as the starting point.
- Create a NEW independent GitHub repository for Algeria.
- Use a separate server/deployment.
- Use a separate database.
- Use separate storage.
- Use separate environment variables and secrets.
- Use separate authentication credentials.
- Use separate payment credentials/configuration.
- Use separate admin accounts.
- Use separate analytics.
- Use separate backups.

### Forbidden

- Do not build a multi-country architecture.
- Do not introduce a country switch.
- Do not create a shared runtime package between France and Algeria.
- Do not create country providers/adapters merely to share code.
- Do not modify the French production project for Algeria.
- Do not create dependencies that require the French repository to remain available.

Duplicate maintenance/debugging is acceptable because the Algerian project is a separate product and can have different developers.

---

## 3. Initial Algerian Educational Scope

The initial active curriculum contains ONLY:

- 4AM — السنة الرابعة متوسط
- Terminale / السنة الثالثة ثانوي

All other grades and lessons copied from the French repository must remain physically available in the repository but become dormant/disconnected.

They must NOT appear in:

- student navigation
- active curriculum
- lesson discovery
- search
- progression
- recommendations
- active routes
- active admin content
- public SEO pages
- sitemap
- active API exposure

Do NOT delete dormant content unless there is a later explicit decision to remove it.

> **Later explicit decision (2026-09-25, project owner).** The dormant French
> content has been removed: the French lessons (`lessons/college/`,
> `lessons/lycee/`), their practice content, specs, e2e scripts, French-only
> engines and the French reference catalogue. The repository now holds only
> the unit « الأعداد الطبيعيّة والأعداد النّاطقة » of 4AM, and the catalogue
> shows only the ميادين that carry lessons. The requirements below about not
> exposing French content remain true, and `check:dormant-isolation` now also
> fails if a French lesson folder reappears.

The exact dormant content must be determined from the copied repository rather than guessed.

---

## 4. Curriculum Source of Truth

Do NOT infer the Algerian curriculum from the French curriculum.

The official Algerian curriculum and official teaching documents supplied for the project are the source of truth.

Before mass lesson generation:

1. Read and analyze the official Algerian curriculum.
2. Identify:
   - grades
   - courses
   - chapters/themes
   - lessons
   - learning objectives
   - learning points
   - prerequisites
   - terminology
   - required methods
   - expected skills
3. Generate an Algerian curriculum source-of-truth structure such as `courseData.json` or the project's equivalent.
4. Document every important migration decision.

If the official source is unclear, do not invent.

Use:

`[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`

when verification is required.

---

## 5. Learning Point Migration

For each Algerian lesson, compare its learning points against the corresponding French learning points.

Classify every Algerian learning point as:

- EXISTING / MATCHING
- PARTIALLY MATCHING
- MISSING FROM FRENCH
- DIFFERENT / REQUIRES MODIFICATION
- ALGERIAN-SPECIFIC

The comparison must be LP-by-LP.

Do not assume that a French lesson is equivalent simply because the title looks similar.

---

## 6. Integration, Not Literal Translation

For common lessons, do NOT simply translate the French content into Arabic.

Instead:

- preserve useful pedagogical architecture
- adapt explanations to Algerian terminology
- adapt examples to the Algerian curriculum
- adapt notation where required
- adapt exercises to Algerian expectations
- adapt wording to Algerian students
- adapt contexts naturally
- preserve the strongest interactions
- preserve the learning progression where pedagogically valid

The final lesson must feel like an Algerian lesson, not a translated French lesson.

---

## 7. Missing Learning Points

If an Algerian learning point does not exist in the French platform:

DO NOT leave it as a note or TODO.

Implement it fully.

This includes, where applicable:

- explanation/content
- interaction/manipulation
- examples
- guided practice
- exercises
- learning-point evaluation
- progression integration
- mastery integration
- Knowledge Map integration
- dependencies/prerequisites
- BossFinal questions
- final evaluation
- database records
- analytics/progress integration

The result must be a first-class learning point in the platform.

---

## 8. Existing Lesson Engine

Reuse the proven lesson architecture from the copied project where it remains appropriate.

Important systems include:

- ContentModule
- M0 diagnostic
- lesson progression
- mastery
- BossFinal
- learning-point evaluation
- Knowledge Map
- interactive manipulation
- exercise engine
- MathLive
- KaTeX
- SVG / JSXGraph where appropriate
- responsive design system
- admin architecture
- authentication foundations

Do not unnecessarily rewrite stable infrastructure merely because the country changes.

However, because this is an independent repository, architectural changes are allowed whenever they improve the Algerian product.

---

## 9. Pedagogical Principle

The target lesson loop is:

**Concret → Visuel → Numérique → Symbolique → Automatisation**

The lesson should generally move from:

1. real situation
2. why the concept is useful
3. manipulation/touch/interaction
4. visual representation
5. numerical exploration
6. symbolic formulation
7. guided practice
8. exam-style memory/automation

Core principles:

- The student should never wonder what to do.
- Use few variables at once.
- Do not introduce vocabulary before it is needed.
- Do not introduce symbols before the idea is understood.
- Do not present a concept before explaining it.
- Wrong answers should provide useful feedback and should not unnecessarily block progress.
- M0 diagnostic is non-blocking.
- The first module should aim for a strong interactive "wow" moment.
- Visuals must remain readable when numbers/variables change.
- Avoid overlap of numbers, symbols, lines, labels and diagrams.
- Graphs and diagrams should be sufficiently large.
- Use progressive disclosure instead of presenting too much information at once.

---

## 10. Knowledge Map

Maintain the Knowledge Map architecture.

Sections may include:

- CONCEPTS
- RÈGLES
- MÉTHODES
- VOCABULAIRE
- À MÉMORISER
- FORMULES

Knowledge Map items should be connected to the actual lesson content where relevant:

- examples
- graphs
- equations
- manipulations
- methods
- exercises

Do not create decorative knowledge-map entries that are disconnected from learning.

---

## 11. Progression and Mastery

Learning progress must remain coherent with the copied platform architecture.

Learning points must be connected to:

- module completion
- exercise evaluation
- final evaluation
- mastery
- progression
- Knowledge Map
- student history

Do not create a second incompatible progress system.

Where server-side mastery is used, keep it authoritative.

Do not rely on localStorage alone for premium access or authoritative mastery/access decisions.

---

## 12. Exercise Engine

Reuse and adapt the existing exercise architecture.

Exercise requirements:

- school/exam-like UX
- progressive difficulty
- MathLive where appropriate
- answer format should be visible without revealing the answer
- 1–3 progressive hints where appropriate
- useful feedback
- learning-point association
- evaluation written to the same learning-point evaluation system used by practice/final evaluation

Ordinary lesson-module questions should not be confused with the dedicated practice/final evaluation system unless the architecture explicitly requires it.

---

## 13. BossFinal

Each lesson must retain the final evaluation architecture.

BossFinal should:

- evaluate the important learning points
- include appropriate Algerian curriculum expectations
- avoid testing concepts that were not taught
- provide meaningful feedback
- feed the learning-point evaluation/mastery system

If a new Algerian learning point is added, determine whether it must be represented in BossFinal and implement the required evaluation.

---

## 14. Arabic and RTL Foundation

The Algerian platform uses:

- primary language: Arabic
- locale: `ar-DZ`
- normal interface direction: RTL

However, mathematics must remain LTR where appropriate.

Keep mathematical content correctly oriented for:

- equations
- formulas
- fractions
- inequalities
- coordinate axes
- graphs
- number lines
- geometry
- MathLive
- KaTeX
- SVG
- JSXGraph

Do NOT blindly mirror mathematical interfaces.

Mixed Arabic + mathematical notation must render correctly.

### Arabic-First User Interface (binding rule)

**The DZ student-facing and visitor-facing application is Arabic-first. All
user-facing human text must be Arabic unless it is legitimate mathematical
notation, technical content, or another explicitly approved non-Arabic
element.**

This is not a translation pass that was done once; it is a standing
constraint on every future change.

- **Where the text lives.** User-facing strings go in
  `apps/web/src/i18n/locales/ar/*.json`, never hardcoded in JSX. Namespaces:
  `common` (shared chrome), `nav`, `auth`, `access` (activation/entitlement),
  `lesson` (lesson-engine chrome), `student` (student space), `marketing`
  (visitor pages). Adding a language later means adding a bundle, not
  restructuring components.
- **Scope.** Shared components, dynamic states (toasts, `setError`, API error
  mapping, validation messages), empty states, loading states, error states,
  placeholders, document titles/meta, and **accessibility text**
  (`aria-label`, `alt`, screen-reader-only spans) are all in scope. A page
  must still be Arabic *after* an error occurs.
- **No French/English defaults.** A default prop, fallback string or
  module-level constant that yields French is a defect even when every
  current caller overrides it: the next lesson that forgets the prop ships
  French silently. Defaults must be Arabic or absent.
- **Never call `t()` at module scope.** i18next may not be initialized when a
  module-level constant is evaluated. Constants hold translation *keys*;
  components resolve them at render.
- **Future lessons.** New lessons write their pedagogical content in Arabic
  directly and inherit the engine chrome from the `lesson` namespace. They
  must not reintroduce French labels through props.
- **Future AI-generated pages must not introduce French/English UI text.**
  Generating a page from a French-era template is the most likely way this
  rule gets broken.
- **What legitimately stays non-Arabic:** mathematical notation (`PGCD`,
  `PPCM`, `x`, `f(x)`, KaTeX/MathLive content), technical identifiers
  (component/variable/function names, route paths, lesson codes, CSS
  classes, API fields), brand names (Smarter Academy), and developer-facing
  strings never shown to a student (dev-only warnings, thrown `Error`
  messages). French **code comments** remain French — that is this
  repository's authoring convention, not user-facing text.
- **The API speaks codes, the client speaks Arabic.** Laravel's responses
  are NOT a localization surface: its own validation messages are English
  (there is no `apps/api/lang/`), and the strings written in controllers are
  French — that same layer also serves the francophone admin panel and
  machine-to-machine webhooks. A server `message` must therefore never be
  rendered to a student. Services resolve their text from the Arabic
  catalogue through `apps/web/src/services/apiMessage.js`; what crosses the
  boundary is a `reason`/`code` or an HTTP status, never a sentence. The
  activation flow is the reference implementation.

- **Product facts, not just language.** Copy inherited from the French
  product must not be translated as-is when it is factually wrong here: the
  DZ product has no Stripe, no euro pricing and no subscription (access is
  granted by cash-purchased activation codes, §17/§18), and it follows the
  Algerian official curriculum, not the French `Éducation nationale`
  ladder (6e…Terminale). Translating such copy literally produces fluent
  Arabic that lies.

### Arabic Typography Standard

- **Arabic application font: Cairo.** Cairo is the platform's single,
  global, permanent Arabic font — the source of truth is
  `apps/web/tailwind.config.js` (`fontFamily`: `sans`, `space`, `inter`,
  `mono`, `arabic`) and `apps/web/src/index.css` (`html`, `h1`–`h6`,
  `.font-space`, `.font-inter`, `.font-mono-jetbrains`, `.tech-chip`).
  Every stack places Cairo directly behind its Latin identity font, because
  none of the Latin fonts (Inter, Space Grotesk, JetBrains Mono) contain
  Arabic glyphs: Arabic runs resolve to Cairo per glyph, Latin/digits keep
  the identity font. This includes `font-mono`: a label, badge or button
  styled as mono still renders its Arabic in Cairo (only digits and code
  are JetBrains Mono). Never put a system font (`system-ui`,
  `ui-sans-serif`, `Segoe UI`, `Arial`, `Tahoma`…) *before* Cairo in a
  stack — system fonts do have Arabic glyphs and would silently take over.
- All Arabic student-facing content uses Cairo. This includes existing and
  future lessons, modules, manipulations, exercises, Knowledge Map,
  BossFinal, navigation, forms, authentication, admin, and every other
  Arabic surface of the application.
- New lessons and modules **must inherit** the global Arabic typography.
  Do not attach a lesson-specific or module-specific Arabic font class.
  Lesson-specific Arabic fonts are forbidden unless explicitly approved as
  a future global design decision.
- Do not import another Arabic font (Tajawal, Noto Sans Arabic, Amiri, IBM
  Plex Arabic, or any other) anywhere at the lesson or component level.
  Tajawal remains only as the platform's second fallback in the global
  stack (covers the brief window before the Google Fonts sheet finishes
  loading) — it is not to be reintroduced as a primary or standalone
  choice.
- Do not blindly reuse French font choices.
- **Mathematical rendering keeps its own dedicated typography.** KaTeX and
  MathLive set their own fonts directly on their own elements
  (`.katex`, MathLive's `<math-field>`); never force Cairo, or any other
  font, onto math rendering.
- **Code keeps its own monospace typography** (JetBrains Mono /
  `font-mono` / `.font-mono-jetbrains`) — numerals and code stay monospace
  regardless of surrounding Arabic text.
- Mixed Arabic/Latin content must preserve correct bidirectional
  rendering.
- **RTL and font selection are separate concerns.** Solving one does not
  solve the other; both must be verified independently and together.

Test:

- Arabic text
- Arabic + Latin numbers
- Arabic + mathematical expressions
- fractions
- powers
- inequalities
- equations
- graph labels
- interactive diagrams
- mobile layouts

Do not blindly convert all digits without validating the educational and visual result.

---

## 15. Algerian Terminology

Use terminology from official Algerian curriculum/textbooks and teaching materials.

Do not perform literal French-to-Arabic translation when official Algerian terminology differs.

When terminology is uncertain:

`[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`

Do not invent official terminology.

---

## 16. Algerian Context

Use Algerian contexts naturally when they improve comprehension.

Possible contexts include:

- DZD
- school life
- transport
- shopping
- sports
- distances
- water
- electricity
- mobile/internet
- everyday measurements
- Algerian geography

Do not force Algerian references into every exercise.

The mathematics and pedagogy remain the priority.

---

## 17. Access and Business Model

Initial Algeria product:

- Which lessons are free and which are premium is an **administrator
  decision**, stored in `lessons.tier` (the single source of truth) and changed
  from the admin panel. There is no fixed list of free lessons in the code or
  the catalogue. A newly created lesson defaults to **free**; curriculum
  synchronisation and deployment never overwrite an existing tier. (Revised
  2026-09-25 — this line originally read « 3 lessons are free, the rest
  premium », which was then encoded as a hardcoded list and has been removed.
  Contract: `architecture/ADMIN_PANEL_ARCHITECTURE.md` « Le palier du
  contenu ».)
- No online payment UI initially.
- Students pay physically in cash.
- Student receives an activation code.
- Student creates an account/logs in.
- Student enters the activation code.
- Server validates the code.
- Account receives premium access.

Premium access must be server-authoritative.

### Extension (2026-09-22) — teachers, classes and configurable plans

The model above is unchanged for an independent student and is extended, not
replaced. Authoritative contract:
[`architecture/TEACHER_CLASSROOM_ARCHITECTURE.md`](./architecture/TEACHER_CLASSROOM_ARCHITECTURE.md).

- **No online payment for any user** — student, teacher or any future type.
  Money is received outside the platform (cash, transfer, school payment).
- **Free is automatic**: a verified account is on the default plan of its type
  (`plans.is_default`), with no subscription row and no approval.
- **Individual paid access is activated by an administrator**, either directly
  on the account or by sending the user **one unique activation code** bound
  to the plan.
- **Bulk / school / class sales** are activation-code batches bound to a plan
  version: X codes = X activations, one seat each, every code unique.
- **A request for a plan is optional and never activates anything**; it is a
  queue for the administration (`pending → fulfilled | rejected | cancelled`).
- Plans, versions, prices (DZD, informational), entitlements and per-user
  overrides are **database-driven** and changed by the admin without a deploy.
  A plan version used by a subscription is immutable.
- **Teacher plans are seat-based (2026-09-22).** The teacher buys a number of
  student seats; classes are unlimited and never a pricing unit. The free
  teacher plan grants a configurable seat allowance (initially 5). Pricing is
  a database-configurable, versioned grid of tiers (seats range → price per
  student); the server alone calculates `N × price`, and every subscription
  and every activation code keeps the exact seats and price it was granted.
  Unique students are counted (a student in two classes of one teacher — only
  rows from before the one-class-per-student rule of 2026-10-24 — is one seat);
  a student belongs to ONE class at a time and leaves it to join another; neither the join link nor the join code can bypass capacity; a downgrade blocks additions and
  deletes nothing.
- A teacher plan may **cover** the students of the teacher's classes (Model B);
  the student's own code (Model A) still works; institution licences are
  planned (Model C).
- Account status and subscription status are separate; a downgrade never
  deletes data.

### Activation code states

The system should support states such as:

- available
- activated
- expired
- revoked

Useful fields may include:

- code
- status
- created_at
- activated_at
- activated_by
- expiration
- plan/access level
- notes

The system should be:

- secure
- rate-limited
- auditable
- protected against brute force
- server-authoritative

Admin functionality should eventually support:

- generate codes
- view codes
- activate/revoke
- expiration
- export
- activation history
- audit trail

---

## 18. Stripe

Stripe must be removed from the active Algerian product.

Do not display:

- Stripe checkout
- payment buttons
- French payment UI
- fake CIB integration
- fake Edahabia integration

Do not invent an Algerian payment API.

This applies to every account type, teachers included: the teacher plans
(2026-09-22) are activated by hand by an administrator, and their DZD prices
are informational. Future online payment may be implemented later using a
real authorized Algerian payment integration; it would be a new
`acquisition_source` written through the manual activation service, never a
new access path.

---

## 19. Authentication

Authentication infrastructure can be reused from the copied project where appropriate, but it must use completely separate:

- OAuth credentials
- secrets
- callback URLs
- database records
- sessions/tokens
- production configuration

The Algeria authentication system must not depend on the France production system.

---

## 20. Admin

The Algerian admin should eventually provide country-specific management for:

- active lessons
- modules
- exercises
- learning points
- visibility/free/premium status
- activation codes (and batches bound to a plan version)
- students
- teachers and their classes (الأقسام)
- plans, versions, prices (informational), entitlements, per-user overrides
- subscription requests (queue), manual subscriptions (activate / suspend / resume / cancel / extend / change plan)
- access status
- reports
- analytics
- activity logs
- account settings

Do not expose dormant French curriculum content through the Algerian admin.

---

## 21. SEO and Public Surface

Only active Algerian content should be publicly exposed.

Ensure dormant copied French content does not appear in:

- sitemap
- public routes
- SEO metadata
- search
- recommendations
- curriculum pages
- API responses

Arabic SEO should be implemented for active Algerian lessons.

---

## 22. Migration Workflow

### Phase 1 — Clone

1. Copy the complete French repository.
2. Verify the copied project builds.
3. Create the independent Algerian Git repository.
4. Establish independent deployment.
5. Establish independent database/storage/env configuration.

### Phase 2 — Disconnect Dormant Content

1. Identify all copied grades.
2. Keep files physically present.
3. Disconnect everything except:
   - 4AM
   - Terminale
4. Verify dormant content is inaccessible through all active surfaces.

### Phase 3 — Product Foundations

1. Arabic/RTL foundation.
2. Algerian navigation.
3. Independent authentication.
4. Activation-code access.
5. Three-free-lessons rule.
6. Remove Stripe from active product.
7. Independent admin configuration.
8. Independent analytics.

### Phase 4 — Curriculum

Wait for the official Algerian curriculum sources.

Then:

1. Analyze official sources.
2. Build Algerian curriculum source-of-truth.
3. Generate courseData/equivalent.
4. Build lesson inventory.
5. Build LP inventory.
6. Compare Algerian LPs against French LPs.
7. Classify every LP.
8. Integrate common LPs.
9. Implement missing LPs.
10. Remove/disconnect French-only LPs that are not required.

### Phase 5 — Lesson QA

For every active lesson:

- verify prerequisites
- verify sequence
- verify explanations
- verify interactions
- verify Arabic terminology
- verify mathematical rendering
- verify exercises
- verify hints
- verify feedback
- verify learning-point evaluation
- verify Knowledge Map
- verify BossFinal
- verify mastery
- verify progression
- verify mobile layout
- verify RTL/LTR behavior

### Phase 6 — Production QA

Test:

- anonymous user
- free lesson access
- premium locked lesson
- activation code entry
- successful activation
- invalid code
- already-used code
- expired code
- revoked code
- student login
- student progression
- admin access
- dormant-content isolation
- SEO
- sitemap
- API exposure
- mobile
- Arabic typography
- mathematical rendering

---

## 23. Important Engineering Rule

Do not start mass lesson generation before the official Algerian curriculum has been supplied and analyzed.

The curriculum determines:

- lesson inventory
- learning points
- terminology
- dependencies
- progression
- exercise scope
- final evaluation scope

The AI agent must not fill curriculum gaps using assumptions from the French platform.

---

## 24. Definition of Done

The Algerian platform is considered ready for launch when:

### Product
- independent repository
- independent deployment
- independent database
- independent storage
- independent secrets
- independent authentication
- independent admin
- independent analytics

### Curriculum
- only 4AM and Terminale active
- official Algerian curriculum is the source of truth
- every active lesson mapped to curriculum
- every learning point mapped
- missing LPs implemented
- French-only irrelevant LPs disconnected

### Pedagogy
- Concret → Visuel → Numérique → Symbolique → Automatisation
- strong first-module interaction
- clear instructions
- useful feedback
- no premature abstraction
- coherent progression

### Technology
- lesson engine functional
- exercise engine functional
- MathLive/KaTeX functional
- interactive diagrams functional where appropriate
- Knowledge Map functional
- mastery functional
- BossFinal functional
- mobile responsive

### Access
- 3 free lessons
- premium lessons locked
- cash activation-code workflow functional
- server-authoritative premium access
- no active Stripe UI

### Arabic
- complete RTL UI
- correct mathematical LTR rendering
- official Algerian terminology
- mixed Arabic/math rendering validated

### Security
- activation codes protected
- rate limiting
- auditability
- independent production credentials
- no accidental access to France infrastructure

### Public Surface
- dormant French content inaccessible
- correct Arabic SEO
- correct sitemap
- correct active API exposure

---

## 25. Final Principle

Build the Algerian platform as a serious independent product.

Copy the proven technology where useful, but do not copy assumptions about:

- curriculum
- terminology
- pedagogy
- payment
- language
- access model
- public content

The Algerian official curriculum is the authority.

The French project is the technical starting point — not the educational source of truth.
