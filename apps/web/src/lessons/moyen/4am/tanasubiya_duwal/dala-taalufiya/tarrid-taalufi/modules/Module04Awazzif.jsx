import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي (TRANSFER). Le manuel n'a pas d'exercice pour ce sujet : cinq exercices de
 * la PLATEFORME (content/exercises.js), dans des contextes neufs — forfait Internet (P1), salle de sport,
 * location de vélo à la plage, cybercafé (P2). Chaque étape est faite quand chaque exercice a reçu une
 * réponse (juste ou fausse). LP : P1, P2.
 */
export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ids) => ids.every((id) => done[id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="باقة، قاعة رياضة، درّاجة على الشاطئ، مقهى أنترنت"
      estimatedTime="8 دقائق"
      objectives={[
        'أنمذج تكلفة باقة وأحسب عددًا صورته معلومة',
        'أقارن صيغتين بمعادلة أو متراجحة',
        'أجيب بجملة في سياق الوضعية',
      ]}
      brief={{ tag: 'تمارين من المنصّة', title: 'نمذج كل صيغة، ثم اختر الأفضل', tone: 'amber',
        body: <p>في كل تمرين: ما الذي يُدفع مرّة واحدة، وما الذي يُدفع عن كل وحدة؟ ثم قارن بمعادلة أو متراجحة، وأجب بجملة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'باقة الأنترنت', subtitle: 'عدد صورته معلومة', done: all('data'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="sura-fi-wadiya" variant="rappel" compact />
              <TextbookExercise exercise={EX.data} requires={['namdhaja-taalufiya', 'sura-fi-wadiya']} onAnswered={mark('data')} />
            </div>
          ) },
        { num: 2, title: 'قاعة الرياضة', done: all('gym'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="namdhaja-taalufiya" variant="rappel" compact />
              <TextbookExercise exercise={EX.gym} requires={['namdhaja-taalufiya', 'tasawi-taqatu', 'sigha-afdal']} onAnswered={mark('gym')} />
            </div>
          ) },
        { num: 3, title: 'درّاجة على الشاطئ', done: all('bike', 'bike-2'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tasawi-taqatu" variant="rappel" compact />
              <TextbookExercise exercise={EX.bike} requires={['tasawi-taqatu']} onAnswered={mark('bike')} />
              <TextbookExercise exercise={EX['bike-2']} requires={['sigha-afdal']} onAnswered={mark('bike-2')} />
            </div>
          ) },
        { num: 4, title: 'مقهى الأنترنت', subtitle: 'متراجحة', done: all('cyber'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="sigha-afdal" variant="rappel" compact />
              <TextbookExercise exercise={EX.cyber} requires={['sigha-afdal', 'khutuwat-mufadala']} onAnswered={mark('cyber')} />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
