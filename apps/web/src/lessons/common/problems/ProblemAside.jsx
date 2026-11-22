import { useTranslation } from 'react-i18next';
import MathText from '../components/MathText';
import StatementFigure from '../components/StatementFigure';
import ProblemTable from './ProblemTable';

/**
 * « المعطيات » — la colonne posée À CÔTÉ de chaque sous-étape d'une مسألة, dans le lecteur de mission seulement
 * (règle « pas d'aller-retour », propriétaire, 2026-11-11). L'énoncé n'est que sur le premier écran ; sans elle, « احسب AM × AC »
 * ou « طول ظلّ النخلة SH » se lisaient sur un écran sans figure ni nombre, et l'élève revenait en arrière pour les lire.
 * Contenu : `asideOf(problem, step)` (guidedProblem.js) — la figure (réduite), le tableau, les données utiles ou, sans liste de
 * données, l'énoncé en petit ; puis « النتائج السابقة » (`foundOf`) : les résultats des sous-étapes déjà répondues. La page, l'enseignant et le mode classe ne la voient jamais.
 */
/** Deux colonnes dans la colonne (données | résultats) quand elle porterait la figure, les données ET ≥ 2 résultats : empilés, ils
 * faisaient réduire tout l'écran (la rédaction de « سارية العلم », 2026-11-11). GuidedProblem élargit alors la colonne (`asideIsWide`). */
export const asideIsWide = (aside, found = []) => Boolean(aside && (aside.figure || aside.table || aside.data?.length) && found.length >= 2);

export default function ProblemAside({ aside, found = [] }) {
  const { t } = useTranslation('lesson');
  if (!aside && !found.length) return null;
  const { figure, table, data = [], statement } = aside ?? {};
  const wide = asideIsWide(aside, found);
  const given = aside && (
    <div className="space-y-2">
      <p className="text-xs font-black text-amber-900">{t('problem.asideTitle')}</p>
      {/* une figure haute (l'ombre d'un palmier) ne doit pas forcer la réduction de tout l'écran : hauteur plafonnée */}
      {figure && <div className="mx-auto max-w-[240px] [&_svg]:max-h-[190px]"><StatementFigure {...figure} maxWidth={240} /></div>}
      {table && <ProblemTable {...table} />}
      {data.length > 0 && (
        <ul className="space-y-1 text-sm font-semibold text-slate-800" data-problem-aside-data>
          {data.map((d) => <li key={d} className="rounded-lg bg-white px-2 py-1 ring-1 ring-amber-100"><MathText>{d}</MathText></li>)}
        </ul>
      )}
      {statement && <p className="text-xs leading-relaxed text-slate-700" data-problem-aside-statement><MathText>{statement}</MathText></p>}
    </div>
  );
  // les résultats des sous-étapes déjà répondues (foundOf) : la ligne suivante d'un calcul se fait sans revenir à l'écran précédent
  const results = found.length > 0 && (
    <div className="space-y-1" data-problem-aside-found>
      <p className="text-xs font-black text-emerald-900">{t('problem.asideFound')}</p>
      <ul className="space-y-1 text-xs text-slate-700">
        {found.map((f, k) => (
          <li key={k} className="rounded-lg bg-white px-2 py-1 ring-1 ring-emerald-100">
            <MathText>{f.label}</MathText> <b className="text-emerald-800"><MathText>{f.value}</MathText></b>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <aside className={`rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-3 ${wide ? 'grid grid-cols-2 items-start gap-3' : 'space-y-2'}`} data-problem-aside>
      {given}
      {results}
    </aside>
  );
}
