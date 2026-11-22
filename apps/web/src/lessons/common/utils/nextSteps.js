/**
 * « ما التالي؟ » — les recommandations du serveur
 * (`GET /students/me/lessons/{code}/recommendations`, Mastery V2 phase 8a)
 * traduites en au plus trois lignes d'action, après le test final.
 *
 * Pur : les chemins sont résolus par l'appelant (`modulePath(number)`,
 * `practicePath`) ; sans chemin, la ligne s'affiche sans lien plutôt que de
 * fabriquer un lien mort. `start` n'a pas de sens après un test : ignoré.
 * Jamais bloquant — ce sont des suggestions.
 *
 * @param {object[]} recommendations  triées par le serveur, la plus urgente d'abord
 * @param {{modulePath?: (number: number) => string|null, lessonPath?: (lessonCode: string) => string|null, practicePath?: string|null, max?: number}} [options]
 * @returns {Array<{key: string, kind: string, labelKey: string, params: object, to: string|null, learningPoint: string}>}
 */
export function buildNextSteps(recommendations, { modulePath = () => null, lessonPath = () => null, practicePath = null, max = 3 } = {}) {
  const out = [];
  const seen = new Set();

  for (const rec of Array.isArray(recommendations) ? recommendations : []) {
    if (out.length >= max) break;
    const lpTitle = rec?.learningPoint?.title ?? rec?.learningPoint?.code ?? '';
    const lpCode = rec?.learningPoint?.code ?? '';
    let step = null;

    // Un prérequis FAIBLE se rattrape dans SA leçon, pas dans un module de
    // celle-ci : le serveur le nomme (`prerequisites[]`, avec `lessonCode`).
    // Auparavant la ligne renvoyait au module qui enseigne le point COURANT,
    // si bien que la remédiation ignorait le prérequis détecté.
    const weakPrerequisite = rec?.kind === 'prerequisite' ? (rec.prerequisites ?? [])[0] : null;

    switch (weakPrerequisite ? 'weak-prerequisite' : rec?.kind) {
      case 'weak-prerequisite': {
        const title = weakPrerequisite.title ?? weakPrerequisite.code ?? lpTitle;
        step = {
          labelKey: 'boss.nextReviewLearningPoint',
          params: { title },
          to: weakPrerequisite.lessonCode ? (lessonPath(weakPrerequisite.lessonCode) ?? null) : null,
          dedupe: `lp:${weakPrerequisite.code ?? title}`,
        };
        break;
      }
      case 'reteach':
      case 'prerequisite': {
        const mod = (rec.modules ?? []).find((m) => Number.isFinite(Number(m?.number)));
        if (mod) {
          step = {
            labelKey: 'boss.nextReviewModule',
            params: { number: String(mod.number).padStart(2, '0'), title: mod.title ?? '' },
            to: modulePath(Number(mod.number)) ?? null,
            dedupe: `module:${mod.number}`,
          };
        } else {
          const title = rec.prerequisites?.[0]?.title ?? lpTitle;
          step = { labelKey: 'boss.nextReviewLearningPoint', params: { title }, to: null, dedupe: `lp:${title}` };
        }
        break;
      }
      case 'practice':
        step = { labelKey: 'boss.nextPractice', params: {}, to: practicePath ?? null, dedupe: `practice:${lpCode}` };
        break;
      case 'assessment':
        step = { labelKey: 'boss.nextAssessment', params: {}, to: null, dedupe: 'assessment' };
        break;
      case 'refresh':
        step = { labelKey: 'boss.nextRefresh', params: {}, to: practicePath ?? null, dedupe: `refresh:${lpCode}` };
        break;
      default:
        step = null; // 'start' et inconnus : rien après un test.
    }

    if (!step || seen.has(step.dedupe)) continue;
    seen.add(step.dedupe);
    const { dedupe, ...rest } = step;
    out.push({ key: `${rec.kind}:${dedupe}`, kind: rec.kind, learningPoint: lpTitle, ...rest });
  }

  return out;
}
