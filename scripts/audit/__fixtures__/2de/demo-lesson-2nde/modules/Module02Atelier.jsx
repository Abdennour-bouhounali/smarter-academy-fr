import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../common/kit';
const SITUATIONS = [
  { id: 's1', titre: 'Rampe', question: 'Pente ?', reponse: 2 },
  { id: 's2', titre: 'Toit', question: 'Pente ?', reponse: 3 },
];
export default function Module02Atelier() {
  const steps = SITUATIONS.map((s, i) => ({
    num: i + 1, title: s.titre, done: true,
    content: (<NumericQuestion prompt={s.question} answer={s.reponse} requires={['lecture']} />),
  }));
  return <ContentModule steps={steps} estimatedTime="5 min" moduleNumber={2}
    intro={<KnowledgeBrick id="lecture" variant="new" lead={<>Voici la méthode.</>} />} />;
}
