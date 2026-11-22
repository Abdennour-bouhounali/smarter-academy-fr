import { TapQuestion } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import RayFigure from './RayFigure';
import { useInMissionPlayer } from '../../../../../../common/mission/missionPlayerContext';

/**
 * Une question « مثّل بيانيا » : les options sont des droites graduées DESSINÉES selon la
 * convention du manuel (RayFigure), pas des phrases. Chaque dessin porte sa lecture en
 * arabe (`aria-label`) pour un lecteur d'écran. Non bloquante, comme toute question du kit.
 *
 * @param graph  { prompt, options: [{ from, to, at, side, closed, boundTex }], correct, explain }
 */
const boundWord = (o) => (o.boundTex ? 'الحدّ' : String(o.at).replace('-', '−'));
export const describe = (o) => `الجزء الملوّن بالأحمر على ${o.side === 'left' ? 'يسار' : 'يمين'} ${boundWord(o)}، والرمز ${o.closed ? 'موجّه نحوه' : 'غير موجّه نحوه'}`;

export default function GraphChoice({ graph, prompt, requires, onAnswered }) {
  // lecteur de mission : les trois droites côte à côte — empilées, la question et l'exercice qui la porte ne tenaient pas en un écran
  const player = useInMissionPlayer();
  return (
    <TapQuestion
      prompt={prompt ?? <MathText>{graph.prompt}</MathText>}
      options={graph.options.map((o, i) => <RayFigure key={i} {...o} label={describe(o)} />)}
      correct={graph.correct}
      cols={player ? 3 : 1}
      requires={requires}
      explain={<MathText>{graph.explain}</MathText>}
      onAnswered={onAnswered}
    />
  );
}
