// `with { type: 'json' }` so this module also loads under plain Node (the
// curriculum export script) — Vite/vitest accept the attribute too.
// The programme of each grade is the single source of the catalogue's titles;
// lessons_<g> derives from it, units_<g> groups those lessons.
import programme6e from './fr/programme_6e_2026_2027.json' with { type: 'json' };
import lessons6e from './fr/lessons_6e_2026_2027.json' with { type: 'json' };
import units6e from './fr/units_6e_2026_2027.json' with { type: 'json' };
import programme5e from './fr/programme_5e_2026_2027.json' with { type: 'json' };
import lessons5e from './fr/lessons_5e_2026_2027.json' with { type: 'json' };
import units5e from './fr/units_5e_2026_2027.json' with { type: 'json' };
import programme4e from './fr/programme_4e_2026_2027.json' with { type: 'json' };
import lessons4e from './fr/lessons_4e_2026_2027.json' with { type: 'json' };
import units4e from './fr/units_4e_2026_2027.json' with { type: 'json' };
import programme3e from './fr/programme_3e_2026_2027.json' with { type: 'json' };
import lessons3e from './fr/lessons_3e_2026_2027.json' with { type: 'json' };
import units3e from './fr/units_3e_2026_2027.json' with { type: 'json' };
import { filterActiveCourseLevels } from './activeGrades.js';


// ── LE CATALOGUE ────────────────────────────────────────────────
//
// Construit ENTIÈREMENT depuis fr/programme_<g>_2026_2027.json, jamais
// retapé. C'est l'invariant I1 de la phase 6F : le programme fourni par le
// propriétaire est la seule source des intitulés, et tout ce qui suit
// en dérive —
//
//   programme_<g>_2026_2027.json → buildCourseLevels() → coursesData.js
//     → exportCurriculum.mjs → curriculum-export.json
//     → smarter:import-curriculum → chapters.topics
//
// Si un intitulé apparaît à deux endroits, l'un des deux est un
// défaut. Un test qui a besoin du libellé LIT le JSON, il ne le recopie pas.
//
// Le découpage en leçons vient de fr/lessons_<g>_2026_2027.json et les unités
// de fr/units_<g>_2026_2027.json ; seuls les domaines qui portent au
// moins une leçon sont montrés (voir buildGrade).
/**
 * Une leçon, construite depuis le découpage de lessons_<g>_2026_2027.json.
 *
 * La leçon a pour provenance un SUJET du programme, et la déclare telle quelle.
 */
function buildLesson(lesson, { levelId, gradeId, topicTitle }) {
  const pointPrerequisites = lesson.pointPrerequisites ?? {};
  return {
    id: lesson.code,
    // A lesson's title is always the platform's own (`titleSource: 'editorial'`); what the official text calls the
    // topic it comes from stays beside it, word for word (null for a synthesis, which has no topic).
    title: lesson.title,
    officialTopicTitle: topicTitle ?? null,
    titleSource: lesson.titleSource ?? 'editorial',
    // 'lesson' (un درس) ou 'synthesis' (« أدمج تعلّماتي » : la synthèse
    // d'unité, jamais comptée parmi les leçons de l'unité).
    kind: lesson.kind ?? 'lesson',
    unitId: lesson.unitId ?? null,
    description: lesson.description,
    prerequisites: lesson.prerequisites,
    // Les leçons du catalogue dont celle-ci suppose les acquis — un prérequis
    // PÉDAGOGIQUE (affiché à l'élève avec son état de maîtrise), jamais un
    // verrou d'accès : la progression reste non bloquante (LESSON_CONTRACT).
    prerequisiteLessonCodes: lesson.prerequisiteLessonCodes ?? [],
    pointsToLearn: lesson.pointsToLearn,
    // Même convention d'identifiant que le catalogue français
    // (`<classe>_<leçon>_P<n>`) : c'est elle que lisent l'import, les preuves
    // d'apprentissage et la carte des connaissances. Déterministe et stable
    // tant que l'ordre des points ne bouge pas — un réordonnancement change
    // ce que désigne un identifiant existant, et smarter:validate-curriculum
    // le signale après import.
    learningPoints: lesson.pointsToLearn.map((title, i) => ({
      id: `${gradeId}_${lesson.code}_P${i + 1}`,
      title,
      order: i + 1,
      // Les points (codes complets) que ce point suppose acquis, avec le seuil
      // de maîtrise du modèle serveur (MasteryModel::MASTERED_THRESHOLD).
      prerequisites: (pointPrerequisites[`P${i + 1}`] ?? []).map((id) => ({ id, requiredMastery: 0.7 })),
    })),
    durationMinutes: lesson.durationMinutes,
    duration: lesson.durationMinutes != null ? `${lesson.durationMinutes} min` : '--',
    difficulty: lesson.difficulty,
    // « coming_soon » : la leçon est DÉCIDÉE, pas ÉCRITE. La carte l'affiche
    // sans la rendre cliquable, ce qui est exactement l'état réel après la
    // phase 7 — le contenu est la phase suivante.
    status: lesson.status,
    icon: lesson.icon,
    // La TRAÇABILITÉ, portée par la leçon elle-même plutôt que par un registre
    // parallèle : le sujet officiel dont elle vient, et le fait que le
    // découpage soit une décision de projet et non une prescription du
    // programme.
    sourceTopicId: lesson.sourceTopicId,
    decompositionType: lesson.decompositionType,
    decisionStatus: lesson.decisionStatus,
    path: `/courses/${levelId}/${gradeId}/${lesson.chapterId}/${lesson.code}`,
  };
}

/** Le chemin de la page d'une unité. Le segment `units` est réservé : aucune leçon ne peut porter ce code. */
export const UNIT_PATH_SEGMENT = 'units';
export function buildUnitPath({ levelId, gradeId, chapterId, unitCode }) {
  return `/courses/${levelId}/${gradeId}/${chapterId}/${UNIT_PATH_SEGMENT}/${unitCode}`;
}

/**
 * Une unité (séquence) : le niveau entre le thème et la leçon. Elle porte
 * ses leçons DANS L'ORDRE et, à part, sa synthèse. Les intitulés viennent
 * de fr/units_<g>_2026_2027.json.
 */
function buildUnit(unit, lessonsOfUnit, { levelId, gradeId }) {
  const built = lessonsOfUnit.slice().sort((a, b) => a.order - b.order);
  return {
    id: unit.code,
    number: unit.number,
    title: unit.title,
    icon: unit.icon ?? null,
    subtitle: unit.subtitle ?? null,
    objectives: unit.objectives ?? [],
    sourceTopicIds: unit.sourceTopicIds ?? [],
    challenge: unit.challenge ?? null,
    aside: unit.aside ?? null,
    order: unit.order,
    chapterId: unit.chapterId,
    path: buildUnitPath({ levelId, gradeId, chapterId: unit.chapterId, unitCode: unit.code }),
    lessons: built.filter((l) => l.kind !== 'synthesis'),
    synthesis: built.find((l) => l.kind === 'synthesis') ?? null,
  };
}

/**
 * Les classes du collège, dans l'ordre : chacune construite depuis SON
 * trio programme / leçons / unités. Ajouter une classe = ajouter ici son trio.
 */
const COLLEGE_GRADES = [
  { programme: programme6e, lessons: lessons6e, units: units6e },
  { programme: programme5e, lessons: lessons5e, units: units5e },
  { programme: programme4e, lessons: lessons4e, units: units4e },
  { programme: programme3e, lessons: lessons3e, units: units3e },
];

/** Une classe (ses domaines, leurs leçons et leurs unités). */
function buildGrade({ programme, lessons, units }) {
  const gradeId = programme.grade;
  const levelId = programme.level;
  const lessonsByChapter = new Map();
  for (const lesson of lessons.lessons) {
    if (!lessonsByChapter.has(lesson.chapterId)) lessonsByChapter.set(lesson.chapterId, []);
    lessonsByChapter.get(lesson.chapterId).push(lesson);
  }

  // Le catalogue ne montre QUE les domaines qui portent des leçons. Le
  // PROGRAMME, lui, reste entier dans programme_<g>_2026_2027.json — on ne
  // retranche rien à la source officielle ; on n'affiche pas un domaine vide.
  // Un domaine apparaît de lui-même le jour où une leçon de
  // lessons_<g>_2026_2027.json le nomme.
  // `order` reste la position dans le programme, pas dans cette liste.
  const topicTitleOf = new Map(programme.domains.flatMap((d) => d.topics.map((t) => [t.id, t.title])));
  // Les domaines d'AFFICHAGE décidés par le propriétaire (units_<g> › ownerChapters) :
  // rangés APRÈS les domaines du programme, sans aucun sujet officiel — le programme
  // reste une transcription intouchée, et chaque unité qui s'y range déclare son
  // domaine de programme (`placement`).
  const ownerDomains = (units.ownerChapters ?? []).map((c) => ({
    id: c.id, title: c.title, subtitle: c.subtitle, topics: [],
  }));
  const displayOrder = units.chapterOrder?.order ?? [];
  const displayRank = (id) => (displayOrder.includes(id) ? displayOrder.indexOf(id) : displayOrder.length);
  const chapters = [...programme.domains, ...ownerDomains].map((domain, index) => ({
    id: domain.id,
    title: domain.title,
    subtitle: domain.subtitle ?? null,
    // Icône d'affichage du ميدان (units_<g> › chapterIcons) — jamais dans le programme.
    icon: units.chapterIcons?.[domain.id] ?? null,
    order: index,
    // Les sujets OFFICIELS, au mot près. `namedMethods`/`namedParts` ne
    // sont recopiés QUE là où le programme les porte :
    // fabriquer un tableau vide pour les autres affirmerait que le
    // programme ne nomme rien, ce qu'il ne dit pas — il se tait.
    topics: domain.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      ...(topic.namedMethods ? { namedMethods: topic.namedMethods } : {}),
      ...(topic.namedParts ? { namedParts: topic.namedParts } : {}),
    })),
    // Les leçons du chapitre, À PLAT, dans l'ordre du catalogue (`order`).
    // C'est cette liste que lisent la carte des cours,
    // la progression et l'export ; `units` ci-dessous la regroupe sans la
    // remplacer.
    lessons: (lessonsByChapter.get(domain.id) ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((lesson) => buildLesson(lesson, {
        levelId,
        gradeId,
        // Le sujet est cherché dans TOUT le programme : une unité placée par le
        // propriétaire sous un autre domaine (`placement`) garde son sujet officiel.
        topicTitle: topicTitleOf.get(lesson.sourceTopicId),
      })),
  })).filter((chapter) => chapter.lessons.length > 0)
    // L'ordre d'AFFICHAGE décidé par le propriétaire (units_<g> › chapterOrder,
    // 2026-10-07 : la géométrie en dernier). `order` reste la position dans le
    // programme ; un ميدان non listé garde sa place relative, après les listés.
    .sort((a, b) => displayRank(a.id) - displayRank(b.id));

  // Les UNITÉS, greffées sur leur chapitre. Une unité ne possède
  // pas ses leçons : elle les référence (mêmes objets que `chapter.lessons`).
  for (const chapter of chapters) {
    chapter.units = units.units
      .filter((u) => u.chapterId === chapter.id)
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((u) => buildUnit(u, chapter.lessons.filter((l) => l.unitId === u.code), {
        levelId,
        gradeId,
      }));
  }

  return {
    id: gradeId,
    name: programme.gradeLabel,
    shortName: programme.gradeShortLabel ?? null,
    // Chaque leçon porte son propre `status` : `available` dès que son
    // implémentation existe, `coming_soon` sinon — carte non cliquable. Voir I2.
    curriculumStatus: 'lessons_planned',
    chapters,
  };
}

/**
 * Le catalogue construit depuis une liste de trios programme / leçons / unités, rangés sous le niveau de leur
 * programme. Exporté pour que les tests vérifient les invariants du constructeur sur un petit jeu de données à eux.
 */
export function buildCourseLevels(gradeSources = COLLEGE_GRADES) {
  const levels = new Map();
  for (const source of gradeSources) {
    const { level, levelLabel } = source.programme;
    if (!levels.has(level)) {
      levels.set(level, {
        id: level,
        title: levelLabel,
        icon: '📘',
        color: 'from-emerald-500 to-teal-500',
        lightBg: 'bg-emerald-50/50 border-emerald-200',
        accentColor: 'text-emerald-600',
        badgeBg: 'bg-emerald-100 text-emerald-700',
        grades: [],
      });
    }
    levels.get(level).grades.push(buildGrade(source));
  }
  return [...levels.values()];
}

// Le catalogue complet : toutes les classes du produit, actives ou non. C'est
// lui qu'exporte exportCurriculum.mjs vers la base, et lui que lisent les gardes.
// Annotations « pure » (BUNDLE_BOUNDARIES.md §4 règle 7) : sans elles, un import du baril qui n'utilise AUCUN nom du
// catalogue (ex. `hasRequiredRole`) garderait ces ≈ 95 Ko gzip de JSON dans le lot d'entrée.
export const allCourseLevels = /* @__PURE__ */ buildCourseLevels();

// The catalogue every student-facing consumer must use. Filtered to only
// ACTIVE_GRADE_IDS (packages/core/curriculum/activeGrades.js) so that every
// downstream reader — navigation, course browser, resume/next-lesson logic,
// grade pickers — is starved of anything not explicitly activated, rather
// than each needing its own filter.
export const courseLevels = /* @__PURE__ */ filterActiveCourseLevels(allCourseLevels);

/**
 * Flattens courseLevels into the list of every selectable grade — the single
 * source of truth for "which grades exist," consumed by registration's grade
 * picker and the student grade switcher alike. A grade's `id` here is
 * exactly the value stored as a student's `user.grade`.
 *
 * @returns {Array<{id: string, name: string, levelId: string, levelTitle: string}>}
 */
export function getAllGrades() {
  return courseLevels.flatMap((level) =>
    level.grades.map((grade) => ({
      id: grade.id,
      name: grade.name,
      levelId: level.id,
      levelTitle: level.title,
      // L'écran de choix de classe dit ce qui attend l'élève : le nombre
      // de leçons PUBLIÉES (`available` — une carte « قيد الإعداد » n'en est
      // pas une, 1AM–3AM 2026-10-14), et si le programme n'est pas encore fourni.
      curriculumStatus: grade.curriculumStatus ?? null,
      lessonCount: (grade.chapters || []).reduce((n, c) => n + (c.lessons || []).filter((l) => l.status === 'available').length, 0),
      // Every lesson of the catalogue, published or announced (`coming_soon`): a grade can have 0 published lessons
      // and a whole year announced (3e, 2026-11-22) — which is not the same as having no lesson at all.
      catalogueLessonCount: (grade.chapters || []).reduce((n, c) => n + (c.lessons || []).length, 0),
    }))
  );
}

/**
 * Index des leçons par `id`, construit une seule fois au chargement.
 *
 * Le catalogue est un arbre (niveau → classe → chapitre → leçon) : retrouver
 * une leçon par son code demandait jusqu'ici de le parcourir entièrement à
 * chaque appel. La pratique en a besoin à chaque rendu — elle ne connaît de
 * la leçon que son `lessonCode` (l'API n'en renvoie pas le chemin) et doit
 * pouvoir ramener l'élève à son cours.
 */
const LESSONS_BY_ID = /* @__PURE__ */ (() => {
  const index = new Map();
  for (const level of courseLevels) {
    for (const grade of level.grades) {
      for (const chapter of grade.chapters || []) {
        for (const lesson of chapter.lessons || []) {
          // Le premier gagne : deux leçons ne partagent pas d'`id` (invariant
          // vérifié par coursesData.test.js), la garde est là pour que cette
          // fonction reste totale si l'invariant venait à céder.
          if (!index.has(lesson.id)) {
            index.set(lesson.id, {
              ...lesson,
              gradeId: grade.id,
              gradeName: grade.name,
              levelId: level.id,
              chapterId: chapter.id,
              chapterTitle: chapter.title,
            });
          }
        }
      }
    }
  }
  return index;
})();

/**
 * La leçon portant cet `id`, chapitre et classe compris — ou `null`.
 *
 * @param {string} lessonId L'identifiant de leçon (« fonction-affine-2nde »),
 *   celui-là même que l'API de pratique nomme `lessonCode`.
 */
export function getLessonById(lessonId) {
  if (!lessonId) return null;
  return LESSONS_BY_ID.get(lessonId) || null;
}

/**
 * Le chemin de la page d'accueil d'une leçon PUBLIÉE (`status: 'available'`),
 * ou `null`. Les appelants DOIVENT traiter le `null` : une leçon peut être
 * inconnue du catalogue (active côté pratique avant d'être routée côté
 * cours), ou connue mais pas encore écrite (`coming_soon` : 1AM–3AM depuis le
 * 2026-10-14 — aucune route) ; un lien mort vaut moins que pas de lien du tout.
 * Pour la carte d'une leçon non publiée, lire `getLessonById(id).path`.
 */
export function getLessonPath(lessonId) {
  const lesson = getLessonById(lessonId);
  return lesson?.status === 'available' ? lesson.path : null;
}

/** Index des unités par code — même construction que LESSONS_BY_ID. */
const UNITS_BY_ID = /* @__PURE__ */ (() => {
  const index = new Map();
  for (const level of courseLevels) {
    for (const grade of level.grades) {
      for (const chapter of grade.chapters || []) {
        for (const unit of chapter.units || []) {
          if (!index.has(unit.id)) {
            index.set(unit.id, {
              ...unit,
              gradeId: grade.id,
              gradeName: grade.name,
              levelId: level.id,
              chapterTitle: chapter.title,
            });
          }
        }
      }
    }
  }
  return index;
})();

/** L'unité portant ce code, chapitre et classe compris — ou `null`. */
export function getUnitById(unitId) {
  if (!unitId) return null;
  return UNITS_BY_ID.get(unitId) || null;
}

/** L'unité qui porte une leçon, ou `null` pour une leçon hors unité. */
export function getUnitOfLesson(lessonId) {
  const lesson = getLessonById(lessonId);
  return lesson?.unitId ? getUnitById(lesson.unitId) : null;
}
