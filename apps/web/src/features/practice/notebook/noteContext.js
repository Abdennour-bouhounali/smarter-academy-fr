/**
 * Le CONTEXTE d'une note : où l'élève était quand il l'a écrite.
 *
 * Un seul objet, normalisé, pour toutes les portes d'entrée du carnet :
 *
 *   {
 *     lessonCode, lessonTitle,
 *     moduleNumber, moduleTitle, moduleSlug,
 *     learningPointCode, learningPointTitle,
 *     exerciseId, questionId,
 *     sourceType, sourceId,
 *   }
 *
 * Les CODES sont la donnée (ils partent au serveur, qui les vérifie) ; les
 * titres et chemins sont des commodités d'affichage résolues ici. Rien n'est
 * inventé : un module qui enseigne trois points n'en désigne aucun, une page
 * d'accueil de leçon n'a pas de module.
 *
 * Priorité, du plus précis au plus large : question → exercice → point →
 * module → leçon. Le plus précis n'efface JAMAIS le plus large : une note de
 * question garde sa leçon, son point et son exercice.
 *
 * Fonctions pures, testables en Node.
 */

/** Le type de source d'une note, DÉDUIT de son contexte — pas stocké. */
export function sourceTypeOf(ctx) {
  if (!ctx) return 'lesson';
  if (ctx.sourceType === 'knowledge_item') return 'knowledge_item';
  if (ctx.questionId) return 'exercise_question';
  if (ctx.exerciseId) return 'exercise';
  if (ctx.learningPointCode) return 'learning_point';
  if (ctx.moduleNumber != null) return 'lesson_module';
  return 'lesson';
}

/**
 * Le contexte d'une PAGE de leçon (accueil ou module), construit depuis son
 * LESSON_CONFIG. C'est ce que la coquille publie comme « position courante ».
 *
 * @param {object} config   LESSON_CONFIG (id, title, modules[])
 * @param {object} [module] l'entrée du module courant dans config.modules, ou null pour l'accueil
 * @param {object} [catalogueLesson] getLessonById(config.id) — pour les titres des points
 */
export function buildLessonLocation(config, module = null, catalogueLesson = null) {
  if (!config?.id) return null;
  const ctx = {
    lessonCode: config.id,
    lessonTitle: config.title ?? catalogueLesson?.title ?? config.id,
    lessonPath: catalogueLesson?.path ?? null,
    moduleNumber: null,
    moduleTitle: null,
    moduleSlug: null,
    modulePath: null,
    learningPointCode: null,
    learningPointTitle: null,
    exerciseId: null,
    questionId: null,
  };
  if (module) {
    ctx.moduleNumber = Number(module.number);
    ctx.moduleTitle = module.title ?? null;
    ctx.moduleSlug = module.slug ?? null;
    ctx.modulePath = module.path ?? null;
    // Un seul point enseigné → il est le contexte. Plusieurs → aucun n'est
    // choisi à la place de l'élève.
    const lps = Array.isArray(module.teachesLearningPointIds) ? module.teachesLearningPointIds : [];
    if (lps.length === 1) {
      ctx.learningPointCode = lps[0];
      ctx.learningPointTitle = catalogueLesson?.learningPoints?.find((lp) => lp.id === lps[0])?.title ?? null;
    }
  }

  return ctx;
}

/**
 * Le contexte tel qu'il part au serveur : les codes, et rien d'autre. Les
 * titres, chemins et `sourceType` restent côté client.
 */
export function contextPayload(ctx) {
  if (!ctx) return {};
  const out = {};
  if (ctx.lessonCode) out.lessonCode = ctx.lessonCode;
  if (ctx.learningPointCode) out.learningPointCode = ctx.learningPointCode;
  if (ctx.moduleNumber != null) out.moduleNumber = Number(ctx.moduleNumber);
  if (ctx.exerciseId) out.exerciseId = ctx.exerciseId;
  if (ctx.questionId) out.questionId = ctx.questionId;

  return out;
}

/**
 * Le contexte d'une note ENREGISTRÉE, lu depuis sa sérialisation API. C'est
 * le contexte d'origine — celui de la création — jamais la position courante.
 *
 * @param {object} note  la note telle que sérialisée par PracticeNotebookController
 * @param {object} [catalogueLesson] getLessonById(note.lessonCode), pour le chemin
 */
export function contextOfNote(note, catalogueLesson = null) {
  if (!note) return null;
  const lessonPath = catalogueLesson?.path ?? null;
  const modulePath = lessonPath && note.moduleSlug ? `${lessonPath}/${note.moduleSlug}` : null;

  return {
    lessonCode: note.lessonCode ?? null,
    lessonTitle: note.lessonTitle ?? catalogueLesson?.title ?? note.lessonCode ?? null,
    lessonPath,
    moduleNumber: note.moduleNumber ?? null,
    moduleTitle: note.moduleTitle ?? null,
    moduleSlug: note.moduleSlug ?? null,
    modulePath,
    learningPointCode: note.learningPointCode ?? null,
    learningPointTitle: note.learningPointTitle
      ?? catalogueLesson?.learningPoints?.find((lp) => lp.id === note.learningPointCode)?.title
      ?? null,
    exerciseId: note.exerciseId ?? null,
    questionId: note.questionId ?? null,
  };
}

/**
 * Où renvoyer l'élève depuis une note : le module exact si on le connaît, la
 * leçon sinon, rien si la leçon n'est pas routée. Jamais une destination
 * inventée.
 */
export function lessonLocationPath(ctx) {
  if (!ctx) return null;
  if (ctx.modulePath) return ctx.modulePath;
  if (ctx.lessonPath && ctx.moduleSlug) return `${ctx.lessonPath}/${ctx.moduleSlug}`;

  return ctx.lessonPath ?? null;
}

/**
 * Les deux lignes du repère de contexte : la leçon, puis l'endroit le plus
 * précis dont on ait un TITRE. `null` quand il n'y a rien à dire.
 *
 * @returns {{ lesson: string|null, place: string|null }}
 */
export function contextLabels(ctx) {
  if (!ctx) return { lesson: null, place: null };
  const place = ctx.learningPointTitle
    ?? ctx.moduleTitle
    ?? null;

  return { lesson: ctx.lessonTitle ?? null, place };
}
