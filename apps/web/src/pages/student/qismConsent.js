/**
 * « قسمي » — la logique pure du consentement et des suggestions.
 *
 * Rejoindre un قسم, c'est accepter que l'enseignant voie, pour les leçons
 * de ce قسم : la progression, la maîtrise par point d'apprentissage, les
 * réponses aux exercices et aux tests finaux, et les notes du كرّاسي (pas
 * les notes archivées). Jamais l'adresse électronique. Le serveur l'exige
 * (`consent: true`, sinon 422 `consent_required`) ; ce module garantit
 * que le client ne l'envoie qu'après un geste explicite.
 */

/** Ce que l'enseignant voit — l'ordre du texte affiché à l'élève. */
export const SHARED_ITEMS = ['progress', 'mastery', 'answers', 'notebook'];

/**
 * Le corps d'une demande d'adhésion, ou `null` tant que l'élève n'a pas
 * consenti : pas de consentement, pas de requête.
 *
 * @param {{code?: string, link?: string}} by
 * @param {boolean} consented  vrai seulement après « أوافق وأنضمّ »
 */
export function joinRequest(by, consented) {
  if (consented !== true) return null;
  if (by?.link) return { link: by.link, consent: true };
  if (by?.code) return { code: by.code, consent: true };
  return null;
}

/** Les adhésions actives dont le texte de partage reste à confirmer. */
export function classroomsAwaitingConsent(studyContext) {
  return (studyContext?.classrooms ?? []).filter((c) => c?.consentRequired === true);
}

/** Les trois suggestions qu'un enseignant peut ouvrir. */
export const RECOMMENDATION_KINDS = ['review_prerequisite', 'recommend_lesson', 'recommend_practice'];

/**
 * Les suggestions affichables : un `kind` inconnu (serveur plus récent que
 * le client) est écarté plutôt que rendu sans phrase. Le lien de leçon
 * n'existe que si le catalogue connaît la leçon — un lien mort vaut moins
 * que pas de lien.
 *
 * @param {Array} recommendations
 * @param {(code: string) => string|null} resolveLessonPath
 */
export function visibleRecommendations(recommendations, resolveLessonPath) {
  return (Array.isArray(recommendations) ? recommendations : [])
    .filter((r) => r && RECOMMENDATION_KINDS.includes(r.kind))
    .map((r) => ({
      ...r,
      lessonPath: r.lesson?.code ? (resolveLessonPath(r.lesson.code) ?? null) : null,
    }));
}
