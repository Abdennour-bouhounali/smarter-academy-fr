import { useState } from 'react';
import { ContentModule, KnowledgeBrick, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks, useStudentPlayer } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 3 — أوظّف تعلّماتي : les exercices de la PLATEFORME (content/exercises.js — ids et LP du manuel gardés). Une étape par exercice ; elle est
 * faite quand chaque partie a reçu une réponse (juste ou fausse). Les ثنائيات demandées se tapent « ( … ; … ) » (PairQuestion, évaluateur `point`).
 * LECTEUR (verdict L1.12, le « saut » vers la مسألة) : une DERNIÈRE étape « من جملة إلى معادلة » — un texte court traduit par UNE équation
 * (une ARRIVÉE, des groupes égaux, ni multiplicateur, ni parenthèse, ni option « du mauvais côté » : la structure et les corrections de la مسألة
 * restent intactes). Le module décide « lecteur ? » lui-même (`useStudentPlayer`, prompt §12.2). LP : P3 (ex. 1, 2, 3‑1, 4), P2 (ex. 3‑2).
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Awazzif() {
  const player = useStudentPlayer();
  const [done, setDone] = useState({});
  const [bridge, setBridge] = useState(false);
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);

  const steps = [
    { num: 1, title: 'ثلاث ثنائيات لمعادلة واحدة', done: all('1'),
      content: (
        <div className="space-y-3">
          <KnowledgeBrick id="ikhtibar-thunaiya" variant="rappel" compact />
          {partsOf('1').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['ikhtibar-thunaiya', 'tartib-thunaiya']} onAnswered={mark(ex.id)} />)}
        </div>
      ) },
    { num: 2, title: 'لكل معادلة حلولها', done: all('2'),
      content: (
        <div className="space-y-3">
          {partsOf('2').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['ikhtibar-thunaiya']} onAnswered={mark(ex.id)} />)}
        </div>
      ) },
    { num: 3, title: 'حلول كثيرة، ثم ثنائية واحدة', done: all('3'),
      content: (
        <div className="space-y-3">
          <KnowledgeBrick id="hall-jumla" variant="rappel" compact />
          {partsOf('3').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['hall-jumla', 'ikhtibar-thunaiya']} onAnswered={mark(ex.id)} />)}
        </div>
      ) },
    { num: 4, title: 'هل الثنائية حلّ للجملة؟', done: all('4'),
      content: (
        <div className="space-y-3">
          {partsOf('4').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['hall-jumla', 'ikhtibar-thunaiya']} onAnswered={mark(ex.id)} />)}
        </div>
      ) },
  ];
  const bridgeStep = {
    num: 5, title: 'من جملة إلى معادلة', subtitle: 'نصّ قصير، معادلة واحدة', done: bridge,
    content: (
      <div className="space-y-3" data-paging-keep data-bridge>
        <TapQuestion
          prompt={<MathText>{'في قسم $x$ ولدًا و $y$ بنتًا. التحق به 5 أولاد، فصار عدد الأولاد يساوي عدد البنات. أيّ معادلة تترجم هذه الجملة؟'}</MathText>}
          options={['$x + 5 = y$', '$x + y = 5$', '$5x = y$'].map(Opt)}
          correct={0}
          cols={3}
          requires={['jumla-tarif']}
          explain={<MathText>{'بعد التحاق 5 أولاد يصير عدد الأولاد $x + 5$ ، وهو يساوي عدد البنات $y$ : $x + 5 = y$ . أمّا $x + y = 5$ فتجعل عدد التلاميذ كلّهم 5، و $5x = y$ تجعل البنات خمسة أضعاف الأولاد.'}</MathText>}
          onAnswered={() => setBridge(true)}
        />
      </div>
    ),
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="أعوّض، وأتحقّق، وأترجم"
      objectives={['كيف أتحقّق من أنّ ثنائية حلّ لمعادلة؟', 'متى تكون ثنائية حلًّا لجملة؟', 'كيف أترجم جملة من نصّ بمعادلة؟']}
      estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'تمارين قصيرة', tone: 'amber',
        body: <p><MathText>{'عوّض في كل معادلة، واكتب الثنائية بين قوسين: العدد الأول قيمة $x$ والثاني قيمة $y$ . الخطأ هنا يُصحَّح ولا يُحتسب.'}</MathText></p> }}
      steps={player ? [...steps, bridgeStep] : steps}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
