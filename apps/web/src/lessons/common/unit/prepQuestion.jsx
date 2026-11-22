import MathText from '../components/MathText';
import { SourceTag } from '../textbook';

/**
 * « أستعدّ » — une affirmation vrai/faux (« أصحيح أم خاطئ؟ برّر إجابتك »),
 * la forme exacte du manuel p. 7, pour le `questions` de PrerequisiteDiagnostic.
 *
 * Le module 0 de chaque leçon de l'unité l'utilise ainsi :
 *
 *   questions={[
 *     { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['qasim-jidaa'] },
 *   ]}
 *
 * `id` et `requires` restent LITTÉRAUX dans le module : l'audit des
 * dépendances (scripts/audit-knowledge-dependencies.mjs) lit le tableau
 * statiquement, et un `.map()` le rend aveugle — il signalait alors
 * W_PRIOR_NOT_DIAGNOSED même pour une leçon qui diagnostique tout.
 *
 * `item` : { skill, text, answer, why, source } — `source` est `src(...)`
 * pour un item du manuel, `addition(...)` pour un item de la plateforme
 * (affiché « عبارة إضافية من المنصّة » par SourceTag, jamais pris pour le manuel).
 */
const YES_NO = ['صحيح', 'خطأ'];

export function prepQuestion(item, points = 1) {
  return {
    skill: item.skill,
    points,
    prompt: (
      <span className="block space-y-1">
        <MathText>{item.text}</MathText>
        <SourceTag source={item.source} className="ms-2" />
      </span>
    ),
    options: YES_NO,
    correct: item.answer ? 0 : 1,
    cols: 2,
    explain: <MathText>{item.why}</MathText>,
  };
}
