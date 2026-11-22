import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';
import { FIG_EX1, FIG_EX2, FIG_EX4, FIG_EX5, FIG_EX5_SOL } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (p. 146, « إحداثيتا نقطة - مركبتا شعاع »).
 * AUTOMATIZE : ex-1 (placer quatre points, puis lire AB et DC sur le quadrilatère), ex-2 (six points lus sur la figure
 * redessinée — D au-delà de la dernière graduation du scan —, puis OA, OD, OF). TRANSFER : ex-3 (symétriques, puis F
 * tel que FB(1 ; 0) : la flèche finit en B), ex-4 (quels couples représentent u(−2 ; 3) ; la figure après la réponse),
 * ex-5 (AB lu, I tel que AI = BC, la nature de AICB ; la figure complétée après la réponse). Une étape par exercice,
 * faite quand chaque partie a reçu une réponse.
 */
const FIGURES = { ex1: FIG_EX1, ex2: FIG_EX2, ex5: FIG_EX5 };

function Exercise({ ex, requires, onDone, showFigure }) {
  return (
    <div className="space-y-2">
      {showFigure && FIGURES[ex.figure] && <GeoFigure {...FIGURES[ex.figure]} />}
      <TextbookExercise exercise={ex} requires={requires} onAnswered={onDone} />
    </div>
  );
}

export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);
  const block = (n, requires) => partsOf(n).map((ex, i) => <Exercise key={ex.id} ex={ex} requires={requires} onDone={mark(ex.id)} showFigure={i === 0} />);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 1 و 2 و 3 و 4 و 5"
      objectives={['أقرأ مركبتي شعاع على شبكة', 'أمثّل شعاعًا علمت مركباته انطلاقًا من نقطة', 'أوظّف القراءة البيانية في رباعي']} estimatedTime="8 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 146', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>اقرأ كل رحلة كما في تطبيق التوصيل: أفقيا ثم عموديا، بالإشارة، وانتبه إلى نقطة الانطلاق. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 1 — الرباعي ABCD', done: all('1'),
          content: <div className="space-y-3">{block('1', ['murakkibata-om', 'qiraa-bayaniya'])}</div> },
        { num: 2, title: 'تمرين 2 — بقراءة بيانية', done: all('2'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="murakkibata-om" variant="rappel" compact />
              {block('2', ['murakkibata-om'])}
            </div>
          ) },
        { num: 3, title: 'تمرين 3 — نظائر ونقطة F', done: all('3'),
          content: <div className="space-y-3">{block('3', ['murakkibata-om', 'tamthil-shuaa'])}</div> },
        { num: 4, title: 'تمرين 4 — ممثّلان للشعاع u', done: all('4'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tamthil-shuaa" variant="rappel" compact />
              {block('4', ['tamthil-shuaa'])}
              {all('4') && <GeoFigure {...FIG_EX4} />}
            </div>
          ) },
        { num: 5, title: 'تمرين 5 — الرباعي AICB', done: all('5'),
          content: (
            <div className="space-y-3">
              {block('5', ['qiraa-bayaniya', 'tamthil-shuaa']).slice(0, 2)}
              {done['ex-5-b'] && <GeoFigure {...FIG_EX5_SOL} />}
              {block('5', ['qiraa-bayaniya', 'tamthil-shuaa']).slice(2)}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
