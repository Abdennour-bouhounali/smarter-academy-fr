import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../common/kit';
import { Feedback } from '../../../../common/components/LessonUI';
import SlopeLab from '../components/SlopeLab';
import PredictionChips from '../components/PredictionChips';
export default function Module01LeLabo() {
  const steps = [
    { num: 1, title: 'Glisse', done: done1, content: (<div><PredictionChips /><SlopeLab />{done1 && <><Feedback tone="ok">Trois mesures, toujours le même rapport.</Feedback><KnowledgeBrick id="pente" variant="new" lead={<>Ce rapport porte un nom.</>} /></>}</div>) },
    { num: 2, title: 'Vérifie', done: q2, content: (<TapQuestion prompt={<span>La pente vaut ?</span>} options={['2', '3']} correct={0} requires={['pente']} solved={q2} onAnswered={() => setQ2(true)} />) },
  ];
  return <ContentModule steps={steps} estimatedTime="8 min" moduleNumber={1} />;
}
