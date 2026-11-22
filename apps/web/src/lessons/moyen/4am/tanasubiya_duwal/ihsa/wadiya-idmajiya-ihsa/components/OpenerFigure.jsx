import StatTable from './StatTable';
import { SITUATION } from '../content/textbook';

/**
 * Le tableau de la وضعية finale (p. 100) rendu seul, pour le « تحدّ » de la page d'unité :
 * les deux valeurs cachées restent des hexagones, rien n'est révélé.
 */
export default function OpenerFigure() {
  const { values, counts } = SITUATION.numbers;
  return <StatTable id="opener" valueLabel={SITUATION.valueLabel} countLabel={SITUATION.countLabel} values={values} counts={counts} />;
}
