// `with { type: 'json' }` so this module also loads under plain Node (the
// curriculum export script) — Vite/vitest accept the attribute too.
// Le programme algérien officiel — la source unique des intitulés arabes.
import programme4am from './dz/programme_4am_2026_2027.json' with { type: 'json' };
// Le découpage en leçons de ce programme (phase 7) — dérivé du précédent,
// jamais concurrent : chaque leçon y déclare le sujet officiel dont elle vient.
import lessons4am from './dz/lessons_4am_2026_2027.json' with { type: 'json' };
import units4am from './dz/units_4am_2026_2027.json' with { type: 'json' };
// 1AM–3AM (2026-10-14, phase 2 du déploiement du cycle moyen) : même trio, leçons
// `coming_soon` tant qu'elles ne sont pas générées (docs/architecture/LEARNING_NET.md).
import programme1am from './dz/programme_1am_2026_2027.json' with { type: 'json' };
import lessons1am from './dz/lessons_1am_2026_2027.json' with { type: 'json' };
import units1am from './dz/units_1am_2026_2027.json' with { type: 'json' };
import programme2am from './dz/programme_2am_2026_2027.json' with { type: 'json' };
import lessons2am from './dz/lessons_2am_2026_2027.json' with { type: 'json' };
import units2am from './dz/units_2am_2026_2027.json' with { type: 'json' };
import programme3am from './dz/programme_3am_2026_2027.json' with { type: 'json' };
import lessons3am from './dz/lessons_3am_2026_2027.json' with { type: 'json' };
import units3am from './dz/units_3am_2026_2027.json' with { type: 'json' };
import { filterActiveCourseLevels } from './activeGrades.js';


// ── LE CATALOGUE ALGÉRIEN ────────────────────────────────────────────────
//
// Construit ENTIÈREMENT depuis dz/programme_4am_2026_2027.json, jamais
// retapé. C'est l'invariant I1 de la phase 6F : le programme fourni par le
// propriétaire est la seule source des intitulés arabes, et tout ce qui suit
// en dérive —
//
//   programme_4am_2026_2027.json → buildDzCourseLevels() → coursesData.js
//     → exportCurriculum.mjs → curriculum-export.json
//     → smarter:import-curriculum → chapters.topics
//
// Si un intitulé arabe apparaît à deux endroits, l'un des deux est un
// défaut. Un test qui a besoin du libellé LIT le JSON, il ne le recopie pas.
//
// Le découpage en leçons vient de dz/lessons_4am_2026_2027.json et les unités
// du manuel de dz/units_4am_2026_2027.json ; seuls les ميادين qui portent au
// moins une leçon sont montrés (voir buildDzCourseLevels).
/**
 * Une leçon 4AM, construite depuis le découpage fourni par le propriétaire.
 *
 * La leçon algérienne a pour provenance un SUJET du programme, et la
 * déclare telle quelle. (Le catalogue français hérité et son constructeur
 * ont été retirés le 2026-09-25 avec les leçons françaises : ce fichier ne
 * porte plus que le catalogue algérien.)
 */
function buildDzLesson(lesson, { levelId, gradeId, topicTitle }) {
  const pointPrerequisites = lesson.pointPrerequisites ?? {};
  return {
    id: lesson.code,
    // Le TITRE de la leçon : l'intitulé du sujet officiel, au mot près, quand
    // la leçon EST un sujet (règle phase 7) ; la rubrique du MANUEL, au mot
    // près, quand la leçon vient d'une unité du manuel (titleSource
    // 'textbook'). Dans les deux cas rien n'est réécrit par le projet.
    title: lesson.titleSource === 'textbook' ? lesson.title : topicTitle,
    officialTopicTitle: topicTitle,
    titleSource: lesson.titleSource ?? 'official_topic',
    // 'lesson' (un درس) ou 'synthesis' (« أدمج تعلّماتي » : la synthèse
    // d'unité, jamais comptée parmi les leçons de l'unité).
    kind: lesson.kind ?? 'lesson',
    unitId: lesson.unitId ?? null,
    textbookRef: lesson.textbookRef ?? null,
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

/** Le chemin de la page d'une unité du manuel. Le segment `units` est réservé : aucune leçon ne peut porter ce code. */
export const DZ_UNIT_PATH_SEGMENT = 'units';
export function buildDzUnitPath({ levelId, gradeId, chapterId, unitCode }) {
  return `/courses/${levelId}/${gradeId}/${chapterId}/${DZ_UNIT_PATH_SEGMENT}/${unitCode}`;
}

/**
 * Une unité (وحدة) du manuel : le niveau entre le ميدان et le درس. Elle porte
 * ses leçons DANS L'ORDRE DU MANUEL et, à part, sa synthèse (« أدمج
 * تعلّماتي »). Les intitulés viennent de dz/units_4am_2026_2027.json, qui
 * cite lui-même l'extraction du manuel.
 */
function buildDzUnit(unit, lessonsOfUnit, { levelId, gradeId }) {
  const built = lessonsOfUnit.slice().sort((a, b) => a.order - b.order);
  return {
    id: unit.code,
    number: unit.number,
    title: unit.titleAr,
    icon: unit.icon ?? null,
    subtitle: unit.subtitleAr ?? null,
    objectives: unit.objectivesAr ?? [],
    sourceTopicIds: unit.sourceTopicIds ?? [],
    textbook: unit.textbook ?? null,
    challenge: unit.challenge ?? null,
    aside: unit.aside ?? null,
    order: unit.order,
    chapterId: unit.chapterId,
    path: buildDzUnitPath({ levelId, gradeId, chapterId: unit.chapterId, unitCode: unit.code }),
    lessons: built.filter((l) => l.kind !== 'synthesis'),
    synthesis: built.find((l) => l.kind === 'synthesis') ?? null,
  };
}

/**
 * Les classes du cycle moyen, dans l'ordre : chacune construite depuis SON
 * trio programme / leçons / unités. Ajouter une classe = ajouter ici son trio.
 */
const DZ_MOYEN_GRADES = [
  { programme: programme1am, lessons: lessons1am, units: units1am },
  { programme: programme2am, lessons: lessons2am, units: units2am },
  { programme: programme3am, lessons: lessons3am, units: units3am },
  { programme: programme4am, lessons: lessons4am, units: units4am },
];

/** Une classe du cycle moyen (ses ميادين, leurs leçons et leurs unités). */
function buildDzMoyenGrade({ programme, lessons, units }) {
  const gradeId = programme.grade;
  const lessonsByChapter = new Map();
  for (const lesson of lessons.lessons) {
    if (!lessonsByChapter.has(lesson.chapterId)) lessonsByChapter.set(lesson.chapterId, []);
    lessonsByChapter.get(lesson.chapterId).push(lesson);
  }

  // Le catalogue ne montre QUE les ميادين qui portent des leçons (décision
  // du propriétaire, 2026-09-25 : l'unité « الأعداد الطبيعيّة والأعداد
  // النّاطقة » seule). Le PROGRAMME, lui, reste entier et vérifié dans
  // programme_<g>_2026_2027.json — on ne retranche rien à la source
  // officielle ; on n'affiche pas un ميدان vide. Un ميدان réapparaît de
  // lui-même le jour où une leçon de lessons_<g>_2026_2027.json le nomme.
  // `order` reste la position dans le programme, pas dans cette liste.
  const topicTitleOf = new Map(programme.domains.flatMap((d) => d.topics.map((t) => [t.id, t.titleAr])));
  // Les ميادين d'AFFICHAGE décidés par le propriétaire (units_4am › ownerChapters,
  // unité 6 « الدالة الخطية والتناسبية » sous « ميدان التناسبية والدوال », 2026-10-02) :
  // rangés APRÈS les domaines du programme, sans aucun sujet officiel — le programme
  // reste une transcription intouchée, et chaque unité qui s'y range déclare son
  // domaine de programme (`placement`).
  const ownerDomains = (units.ownerChapters ?? []).map((c) => ({
    id: c.id, titleAr: c.titleAr, subtitleAr: c.subtitleAr, topics: [],
  }));
  const displayOrder = units.chapterOrder?.order ?? [];
  const displayRank = (id) => (displayOrder.includes(id) ? displayOrder.indexOf(id) : displayOrder.length);
  const chapters = [...programme.domains, ...ownerDomains].map((domain, index) => ({
    id: domain.id,
    title: domain.titleAr,
    subtitle: domain.subtitleAr ?? null,
    // Icône d'affichage du ميدان (units_<g> › chapterIcons) — jamais dans le programme.
    icon: units.chapterIcons?.[domain.id] ?? null,
    order: index,
    // Les sujets OFFICIELS, au mot près. `namedMethodsAr`/`namedPartsAr` ne
    // sont recopiés QUE là où le programme les porte (6 sujets sur 28) :
    // fabriquer un tableau vide pour les 22 autres affirmerait que le
    // programme ne nomme rien, ce qu'il ne dit pas — il se tait.
    topics: domain.topics.map((topic) => ({
      id: topic.id,
      title: topic.titleAr,
      ...(topic.namedMethodsAr ? { namedMethods: topic.namedMethodsAr } : {}),
      ...(topic.namedPartsAr ? { namedParts: topic.namedPartsAr } : {}),
    })),
    // Les leçons du chapitre, À PLAT, dans l'ordre du catalogue : celles des
    // unités du manuel d'abord (phase 8), puis celles restées « un sujet =
    // une leçon » (phase 7). C'est cette liste que lisent la carte des cours,
    // la progression et l'export ; `units` ci-dessous la regroupe sans la
    // remplacer.
    lessons: (lessonsByChapter.get(domain.id) ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((lesson) => buildDzLesson(lesson, {
        levelId: 'moyen',
        gradeId,
        // Le sujet est cherché dans TOUT le programme : une unité placée par le
        // propriétaire sous un autre ميدان (`placement`, unité 3) garde son sujet officiel.
        topicTitle: topicTitleOf.get(lesson.sourceTopicId),
      })),
  })).filter((chapter) => chapter.lessons.length > 0)
    // L'ordre d'AFFICHAGE décidé par le propriétaire (units_<g> › chapterOrder,
    // 2026-10-07 : la géométrie en dernier). `order` reste la position dans le
    // programme ; un ميدان non listé garde sa place relative, après les listés.
    .sort((a, b) => displayRank(a.id) - displayRank(b.id));

  // Les UNITÉS du manuel, greffées sur leur chapitre. Une unité ne possède
  // pas ses leçons : elle les référence (mêmes objets que `chapter.lessons`).
  for (const chapter of chapters) {
    chapter.units = units.units
      .filter((u) => u.chapterId === chapter.id)
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((u) => buildDzUnit(u, chapter.lessons.filter((l) => l.unitId === u.code), {
        levelId: 'moyen',
        gradeId,
      }));
  }

  return {
    id: gradeId,
    name: programme.gradeLabelAr,
    // Le programme ET son découpage en leçons sont arrêtés. Chaque leçon porte
    // son propre `status` : `available` dès que son lesson.config.js existe
    // (les 74 leçons 4AM), `coming_soon` sinon — carte non cliquable
    // « قيد الإعداد » (1AM–3AM, 2026-10-14). Voir I2.
    curriculumStatus: 'lessons_planned',
    chapters,
  };
}

function buildDzCourseLevels() {
  return [
    {
      id: 'moyen',
      title: programme4am.levelLabelAr,
      icon: '📘',
      color: 'from-emerald-500 to-teal-500',
      lightBg: 'bg-emerald-50/50 border-emerald-200',
      accentColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-700',
      grades: DZ_MOYEN_GRADES.map(buildDzMoyenGrade),
    },
    {
      id: 'thanawi',
      title: 'التعليم الثانوي',
      icon: '📗',
      color: 'from-blue-500 to-cyan-500',
      lightBg: 'bg-blue-50/50 border-blue-200',
      accentColor: 'text-blue-600',
      badgeBg: 'bg-blue-100 text-blue-700',
      grades: [
        {
          // La SECONDE classe algérienne (master spec §3). Son identité
          // existe — un élève peut s'y inscrire — mais aucun programme n'a
          // été fourni pour elle (rapport de reprise §19, B1). Le marqueur
          // ci-dessous est ce qui permet à l'interface de le DIRE, au lieu
          // de servir un catalogue vide qui passerait pour une panne.
          id: 'terminale_dz',
          name: 'السنة الثالثة ثانوي',
          curriculumStatus: 'not_supplied',
          chapters: [],
        },
      ],
    },
  ];
}

// Le catalogue ALGÉRIEN complet : les deux classes du produit, actives ou
// non. C'est lui qu'exporte exportCurriculum.mjs vers la base, et lui que
// lisent les gardes. Il ne contient AUCUNE classe française (phase 6F ; le
// catalogue français hérité a été supprimé le 2026-09-25).
// Annotations « pure » (BUNDLE_BOUNDARIES.md §4 règle 7) : sans elles, un import du baril qui n'utilise AUCUN nom du
// catalogue (ex. `hasRequiredRole`) garderait ces ≈ 95 Ko gzip de JSON dans le lot d'entrée.
export const dzCourseLevels = /* @__PURE__ */ buildDzCourseLevels();

// The catalogue every student-facing consumer must use. Filtered to only
// ACTIVE_GRADE_IDS (packages/core/curriculum/activeGrades.js) so that every
// downstream reader — navigation, course browser, resume/next-lesson logic,
// grade pickers — is starved of anything not explicitly activated, rather
// than each needing its own filter.
export const courseLevels = /* @__PURE__ */ filterActiveCourseLevels(dzCourseLevels);

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

/** L'unité du manuel portant ce code, chapitre et classe compris — ou `null`. */
export function getUnitById(unitId) {
  if (!unitId) return null;
  return UNITS_BY_ID.get(unitId) || null;
}

/** L'unité qui porte une leçon, ou `null` pour une leçon hors unité. */
export function getUnitOfLesson(lessonId) {
  const lesson = getLessonById(lessonId);
  return lesson?.unitId ? getUnitById(lesson.unitId) : null;
}
