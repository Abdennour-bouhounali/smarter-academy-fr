import CoordPlane from '../../lessons/common/components/CoordPlane';
import StatementFigure from '../../lessons/common/components/StatementFigure';
import RichText from './RichText';
import ProblemTable from '../../lessons/common/problems/ProblemTable';
import PracticeLab from './PracticeLab';

/**
 * L'énoncé : du texte, éventuellement une figure, éventuellement un labo.
 *
 * `visual` est un sac de props DÉCLARATIF passé tel quel à CoordPlane — le
 * composant partagé par 132 fichiers de leçon, avec ses graduations à la
 * virgule française, son moins typographique et ses marges calculées sur la
 * largeur réelle des étiquettes. Le validateur vérifie chaque clé contre les
 * vraies props, pour qu'une faute de frappe échoue en CI plutôt que de rendre
 * un plan vide en silence.
 *
 * `figure` (unité 9, 2026-10-02) est une figure de géométrie DÉCLARATIVE dessinée par GeoFigure —
 * points nommés, segments, droites, angles — pour qu'un énoncé « في الشكل المقابل » montre le shape ;
 * le validateur la vérifie avec `validateGeoFigure`. Une figure de l'ESPACE (unité 14, 2026-10-05) porte `kind: 'space'` et
 * est dessinée par SpaceFigure (pointillés pour les parties cachées) ; le validateur la vérifie avec `validateSpaceFigure`.
 * Un DIAGRAMME statistique (unité 8, 2026-10-08) porte `kind: 'chart'` et est dessiné par StatChart ; un seul aiguillage,
 * StatementFigure (rendu) / `validateStatementFigure` (validation).
 */
export default function ExerciseStatement({ content, formulas, table, visual, figure, support }) {
  return (
    <div className="space-y-4">
      {content && (
        <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed">
          {content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-[15px] sm:text-base">
              <RichText>{paragraph}</RichText>
            </p>
          ))}
        </div>
      )}

      {/* Les DONNÉES de l'énoncé (« A = … », un tableau) : sans elles, « إليك العدد A حيث: » restait
          seul et la question était insoluble (811 énoncés à formules, 361 à tableau — corrigé le 2026-11-09).
          Même rendu que la feuille d'examen (ExamSheet). */}
      {formulas?.length > 0 && (
        <p className="flex flex-wrap items-baseline justify-center gap-x-10 gap-y-2 py-1 text-lg" data-statement-formulas>
          {formulas.map((f, i) => <span key={i} className="max-w-full overflow-x-auto"><RichText>{`$${f}$`}</RichText></span>)}
        </p>
      )}
      {table && <ProblemTable {...table} />}

      {figure && <StatementFigure {...figure} />}

      {visual && (
        <div className="overflow-x-auto">
          <CoordPlane {...visual} />
        </div>
      )}

      {support && <PracticeLab support={support} />}
    </div>
  );
}
