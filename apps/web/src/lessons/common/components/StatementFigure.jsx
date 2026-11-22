import GeoFigure from './GeoFigure';
import SpaceFigure from './SpaceFigure';
import StatChart from './StatChart';
import ArcTape from './ArcTape';

/** Le rendu de la figure d'un énoncé selon `kind` (voir statementFigure.js) : plane, `space`, `chart` ou `tape`. */
export default function StatementFigure(fig) {
  if (fig.kind === 'space') return <SpaceFigure {...fig} />;
  if (fig.kind === 'chart') return <StatChart {...fig} />;
  if (fig.kind === 'tape') return <ArcTape {...fig} />;
  // une figure plane SANS points ne dessine rien : la donnée est une trace de l'extraction (le تمرين 33 de amaliyat-judhur garde
  // { AD: 1, AE: '1/2' }, dessinée à part par GoldenFigure) — sans ce garde, une boîte vide et « viewBox NaN » dans la console (2026-11-10)
  if (!fig.points || !Object.keys(fig.points).length) return null;
  return <GeoFigure {...fig} />;
}
