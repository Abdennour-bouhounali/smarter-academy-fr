import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';
import { FIG_EX7, FIG_EX9, FIG_EX12 } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (pp. 134–137). AUTOMATIZE : ex-6 (deux images par translation, la nature de BMNA), ex-7
 * (construire C et E, comparer AB / DE et EA / DB), ex-9 (la preuve ABFE en trois lignes). TRANSFER : ex-12 (deux cercles
 * tangents : un متوازي أضلاع caché, B milieu de [MN] ; la question 3 — une SOMME — préparée et renvoyée au درس suivant),
 * ex-25 (أتعمّق : symétrique, image, milieu, nature). Une étape par exercice, faite quand chaque partie a reçu une réponse.
 */
const FIGURES = {
  ex7: <GeoFigure {...FIG_EX7} />,
  ex9: <GeoFigure {...FIG_EX9} />,
  ex12: <GeoFigure {...FIG_EX12} />,
};

function Exercise({ ex, requires, onDone }) {
  return (
    <div className="space-y-2">
      {ex.figure && FIGURES[ex.figure]}
      <TextbookExercise exercise={ex} requires={requires} onAnswered={onDone} />
    </div>
  );
}

export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);
  const block = (n, requires) => partsOf(n).map((ex) => <Exercise key={ex.id} ex={ex} requires={requires} onDone={mark(ex.id)} />);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4} objectives={['كيف أبرّر إنشائي بالأشعة؟', 'متى أستعمل متوازي الأضلاع ومتى أستعمل الانسحاب؟', 'ماذا أستنتج من تساوي شعاعين في كل تمرين؟']}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 6 و 7 و 9 و 12 و 25"
      estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 134 و 135 و 137', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>تمارين الإنشاء: ارسم الشكل على ورقتك، ثم اختر الجواب الذي يبرّر إنشاءك. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 6 — صورتان بانسحابين', done: all('6'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="surat-nuqta" variant="rappel" compact />
              {block('6', ['muntasaf-shuaa', 'surat-nuqta', 'mutawazi-shuaa'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 7 — متوازيا أضلاع على مثلث', done: all('7'),
          content: <div className="space-y-3">{block('7', ['surat-nuqta', 'mutawazi-shuaa'])}</div> },
        { num: 3, title: 'تمرين 9 — مستطيل ومتوازي أضلاع', done: all('9'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="mutawazi-shuaa" variant="rappel" compact />
              {block('9', ['mutawazi-shuaa'])}
            </div>
          ) },
        { num: 4, title: 'تمرين 12 — دائرتان متماستان', done: all('12'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="muntasaf-shuaa" variant="rappel" compact />
              {block('12', ['mutawazi-shuaa', 'muntasaf-shuaa'])}
            </div>
          ) },
        { num: 5, title: 'تمرين 25 — أتعمّق', done: all('25'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="ithbat-tasawi" variant="rappel" compact />
              {block('25', ['mutawazi-shuaa', 'muntasaf-shuaa', 'surat-nuqta', 'ithbat-tasawi'])}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
